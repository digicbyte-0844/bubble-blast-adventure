/**
 * Zustand Game State Store & Finite State Machine (FSM)
 * Full offline support, Undo stack, and strict shot serialization
 * Bubble Puzzle Engine Engine
 */

import { create } from 'zustand';
import {
  GAME_STATES,
  PRIMARY_COLOR_IDS,
  SPECIAL_BUBBLES,
  PHYSICS
} from '../game/constants.js';
import {
  getLevel,
  getBalancedAmmoColor,
  generateBubbleQueue
} from '../game/levelGenerator.js';
import { cloneGrid, isGridEmpty } from '../game/hexGrid.js';
import { calculateTrajectory } from '../game/collision.js';
import { findConnectedMatch } from '../game/matchDetector.js';
import { calculateTurnScore, calculateEndLevelBonus, calculateStars } from '../game/scoreManager.js';
import { soundEngine } from '../game/soundEngine.js';
import ApiService from '../services/api.js';

// Booster inventory defaults persisted to localStorage
const DEFAULT_BOOSTERS = {
  aimGuide: 3,
  bomb: 2,
  rainbow: 2,
  extraShots: 3,
  shuffle: 2
};

function getPersistedBoosters() {
  if (typeof window === 'undefined') return DEFAULT_BOOSTERS;
  try {
    const raw = localStorage.getItem('bba_boosters');
    return raw ? { ...DEFAULT_BOOSTERS, ...JSON.parse(raw) } : DEFAULT_BOOSTERS;
  } catch (e) {
    return DEFAULT_BOOSTERS;
  }
}

function savePersistedBoosters(boosters) {
  if (typeof window !== 'undefined') {
    try {
      localStorage.setItem('bba_boosters', JSON.stringify(boosters));
    } catch (e) {}
  }
}

// Offline progress queue
function queueOfflineProgress(result) {
  if (typeof window === 'undefined') return;
  try {
    const raw = localStorage.getItem('bba_offline_progress_queue') || '[]';
    const queue = JSON.parse(raw);
    queue.push({ ...result, queuedAt: Date.now() });
    localStorage.setItem('bba_offline_progress_queue', JSON.stringify(queue));
  } catch (e) {}
}

export const useGameStore = create((set, get) => ({
  // Level & World State
  levelId: 1,
  levelData: null,
  gridMatrix: [],
  gameStatus: GAME_STATES.LOADING,
  gameState: GAME_STATES.LOADING, // Backward-compat alias

  // Launcher & Ammo State
  currentBubble: 'cyan',
  nextBubble: 'magenta',
  bubbleQueue: [],
  aimAngle: -Math.PI / 2, // -90 degrees (Straight up)

  // Gameplay Scoring & Metrics
  shotsRemaining: 30,
  score: 0,
  combo: 0,
  comboCount: 0, // Backward-compat alias
  bestCombo: 0,
  bubblesPopped: 0,
  rescuedCount: 0,
  rescuedJellies: 0, // Backward-compat alias
  targetJellies: 0,
  objectiveProgress: 0,

  // Session & Anti-Cheat
  sessionToken: null,
  sessionStartTime: null,

  // Undo Functionality (Snapshots stack)
  undoStack: [],

  // Booster Inventory & Active States
  boosters: getPersistedBoosters(),
  activeBooster: null,
  superAimActive: false,

  // Hint angle & target coordinates
  hintData: null,

  // Bloopi Mascot Emotion
  mascotEmotion: 'idle', // 'idle' | 'aiming' | 'cheering' | 'worried' | 'hint'

  // --- ACTIONS ---

  /**
   * Initializes a level from the data catalog or procedural generator
   */
  initLevel: async (id = 1) => {
    const numericId = parseInt(id, 10) || 1;
    const level = getLevel(numericId);

    // Deep clone the matrix
    const matrix = cloneGrid(level.matrix);

    // Count trapped jellies if rescue objective
    let jellyCount = 0;
    for (const row of matrix) {
      for (const cell of row) {
        if (cell && cell.type === SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE) {
          jellyCount++;
        }
      }
    }

    const queue = generateBubbleQueue(level, 4);
    const initialCurrent = queue[0] || level.palette[0] || 'cyan';
    const initialNext = queue[1] || level.palette[1] || 'magenta';

    // Anti-cheat session token
    let token = `local_session_${Date.now()}`;
    try {
      const authRes = await ApiService.startGameSession(numericId);
      if (authRes) {
        token = authRes.sessionToken || authRes.sessionId || authRes.data?.sessionToken || token;
      }
    } catch (e) {
      // Offline fallback
    }

    set({
      levelId: numericId,
      levelData: level,
      gridMatrix: matrix,
      gameStatus: GAME_STATES.READY,
      gameState: GAME_STATES.READY,
      aimAngle: -Math.PI / 2,
      currentBubble: initialCurrent,
      nextBubble: initialNext,
      bubbleQueue: queue.slice(2),
      shotsRemaining: level.maxShots,
      score: 0,
      combo: 0,
      comboCount: 0,
      bestCombo: 0,
      bubblesPopped: 0,
      rescuedCount: 0,
      rescuedJellies: 0,
      targetJellies: jellyCount,
      objectiveProgress: 0,
      sessionToken: token,
      sessionStartTime: Date.now(),
      undoStack: [],
      activeBooster: null,
      superAimActive: false,
      hintData: null,
      mascotEmotion: 'idle'
    });

    soundEngine.play('click');
  },

  /**
   * Updates FSM Game State with strict transition guards
   */
  setGameStatus: (newStatus) => {
    set({ gameStatus: newStatus, gameState: newStatus });
  },

  setGameState: (newStatus) => {
    set({ gameStatus: newStatus, gameState: newStatus });
  },

  setAimAngle: (angle) => {
    set({ aimAngle: angle });
  },

  setMascotEmotion: (emotion) => {
    set({ mascotEmotion: emotion });
  },

  /**
   * Swaps Current Bubble with Next Bubble
   */
  swapBubbles: () => {
    const { gameStatus, currentBubble, nextBubble, activeBooster } = get();
    // Cannot swap while shot is in motion
    if (gameStatus !== GAME_STATES.READY && gameStatus !== GAME_STATES.AIMING) return;
    if (activeBooster === 'bomb' || activeBooster === 'rainbow') return;

    soundEngine.play('click');
    set({
      currentBubble: nextBubble,
      nextBubble: currentBubble
    });
  },

  /**
   * Fires a projectile with strict serialization guard (prevents double-shooting)
   * Captures an Undo snapshot before advancing state.
   */
  fireBubble: () => {
    const {
      gameStatus,
      shotsRemaining,
      currentBubble,
      aimAngle,
      activeBooster,
      gridMatrix,
      score,
      combo,
      bubblesPopped,
      rescuedCount,
      undoStack
    } = get();

    // STRICT FSM GUARD: Double shooting is impossible during flight or resolution
    if (gameStatus !== GAME_STATES.READY && gameStatus !== GAME_STATES.AIMING) {
      return null;
    }
    if (shotsRemaining <= 0) {
      set({ gameStatus: GAME_STATES.LEVEL_FAILED, gameState: 'GAME_OVER' });
      return null;
    }

    // 1. Capture Undo Snapshot
    const snapshot = {
      gridMatrix: cloneGrid(gridMatrix),
      score,
      shotsRemaining,
      combo,
      currentBubble,
      nextBubble: get().nextBubble,
      bubblesPopped,
      rescuedCount
    };
    const newUndoStack = [...undoStack.slice(-9), snapshot]; // Store up to 10 snapshots

    // 2. Consume Shot Ammo
    const remaining = shotsRemaining - 1;

    // 3. Transition FSM to SHOOTING
    set({
      gameStatus: GAME_STATES.SHOOTING,
      gameState: 'SHOOTING',
      shotsRemaining: remaining,
      undoStack: newUndoStack,
      mascotEmotion: 'aiming',
      hintData: null
    });

    soundEngine.play('launch');

    return {
      color: currentBubble,
      angle: aimAngle,
      isBooster: activeBooster
    };
  },

  /**
   * Undo the last shot action using saved snapshots
   */
  undoShot: () => {
    const { gameStatus, undoStack } = get();
    if (gameStatus === GAME_STATES.PAUSED || gameStatus === GAME_STATES.LEVEL_COMPLETE || gameStatus === GAME_STATES.LEVEL_FAILED) return false;
    if (!undoStack || undoStack.length === 0) return false;

    const snapshot = undoStack[undoStack.length - 1];
    const newStack = undoStack.slice(0, -1);

    set({
      gridMatrix: snapshot.gridMatrix,
      score: snapshot.score,
      shotsRemaining: snapshot.shotsRemaining,
      combo: snapshot.combo,
      comboCount: snapshot.combo,
      currentBubble: snapshot.currentBubble,
      nextBubble: snapshot.nextBubble,
      bubblesPopped: snapshot.bubblesPopped,
      rescuedCount: snapshot.rescuedCount,
      rescuedJellies: snapshot.rescuedCount,
      undoStack: newStack,
      gameStatus: GAME_STATES.READY,
      gameState: GAME_STATES.READY,
      mascotEmotion: 'idle'
    });

    soundEngine.play('bounce');
    return true;
  },

  /**
   * Replenishes Current and Next bubbles from the controlled queue
   */
  replenishBubbles: () => {
    const { nextBubble, bubbleQueue, gridMatrix, levelData } = get();
    const fallbackPalette = levelData?.palette || PRIMARY_COLOR_IDS;

    let newQueue = [...bubbleQueue];
    if (newQueue.length < 2) {
      newQueue.push(getBalancedAmmoColor(gridMatrix, fallbackPalette));
      newQueue.push(getBalancedAmmoColor(gridMatrix, fallbackPalette));
    }

    const nextCurrent = nextBubble;
    const nextNext = newQueue.shift();

    set({
      currentBubble: nextCurrent,
      nextBubble: nextNext,
      bubbleQueue: newQueue,
      activeBooster: null,
      gameStatus: GAME_STATES.READY,
      gameState: GAME_STATES.READY,
      mascotEmotion: 'idle'
    });
  },

  /**
   * Updates a single grid cell
   */
  updateGridCell: (row, col, bubble) => {
    const { gridMatrix } = get();
    const newGrid = cloneGrid(gridMatrix);
    if (newGrid[row]) {
      newGrid[row][col] = bubble;
      set({ gridMatrix: newGrid });
    }
  },

  setGridMatrix: (matrix) => {
    set({ gridMatrix: matrix });
  },

  /**
   * Records match resolution and increments score
   */
  recordTurnResolution: (poppedCount, droppedCount, freedJellies = 0) => {
    const { score, combo, bestCombo, bubblesPopped, rescuedCount } = get();

    if (poppedCount > 0) {
      const newCombo = combo + 1;
      const turnScore = calculateTurnScore(poppedCount, droppedCount, freedJellies, newCombo);
      const newScore = score + turnScore.totalTurnScore;
      const newPopped = bubblesPopped + poppedCount + droppedCount;
      const newRescued = rescuedCount + freedJellies;

      set({
        score: newScore,
        combo: newCombo,
        comboCount: newCombo,
        bestCombo: Math.max(bestCombo, newCombo),
        bubblesPopped: newPopped,
        rescuedCount: newRescued,
        rescuedJellies: newRescued,
        mascotEmotion: newCombo >= 2 || freedJellies > 0 ? 'cheering' : 'idle'
      });

      if (freedJellies > 0) {
        soundEngine.play('rescue');
      } else if (newCombo > 1) {
        soundEngine.play('combo', newCombo);
      } else {
        soundEngine.play('pop', 0);
      }
    } else {
      // Missed shot breaks combo streak
      set({
        combo: 0,
        comboCount: 0,
        mascotEmotion: get().shotsRemaining <= 5 ? 'worried' : 'idle'
      });
    }
  },

  addScore: (points, comboStreak = 0) => {
    set((state) => ({
      score: state.score + points,
      combo: comboStreak || state.combo,
      comboCount: comboStreak || state.combo
    }));
  },

  incrementRescuedJellies: (count = 1) => {
    set((state) => ({
      rescuedCount: state.rescuedCount + count,
      rescuedJellies: state.rescuedJellies + count
    }));
  },

  /**
   * Evaluates level victory or failure against objective criteria
   */
  evaluateLevelEnd: async () => {
    const {
      gridMatrix,
      levelData,
      rescuedCount,
      targetJellies,
      score,
      shotsRemaining,
      levelId,
      sessionToken,
      bubblesPopped,
      bestCombo,
      sessionStartTime
    } = get();

    if (!levelData) return;

    const objType = levelData.objective.type;
    let isVictory = false;

    if (objType === 'clear_all' || objType === 'CLEAR_ALL' || objType === 'limited_shots' || objType === 'LIMITED_SHOT') {
      isVictory = isGridEmpty(gridMatrix);
    } else if (objType === 'rescue' || objType === 'RESCUE_JELLIES') {
      isVictory = rescuedCount >= (targetJellies || levelData.objective.target || 1);
    } else if (objType === 'target_score' || objType === 'TARGET_SCORE') {
      isVictory = score >= (levelData.objective.target || 10000);
    } else {
      isVictory = isGridEmpty(gridMatrix) || (shotsRemaining > 0 && score >= (levelData.starScoreThresholds?.oneStar || 2000));
    }

    if (isVictory) {
      const bonus = calculateEndLevelBonus(shotsRemaining);
      const finalScore = score + bonus;
      const stars = calculateStars(finalScore, [
        levelData.starScoreThresholds?.oneStar || 2000,
        levelData.starScoreThresholds?.twoStar || 4000,
        levelData.starScoreThresholds?.threeStar || 7000
      ]);

      set({
        score: finalScore,
        gameStatus: GAME_STATES.LEVEL_COMPLETE,
        gameState: 'VICTORY',
        mascotEmotion: 'cheering'
      });

      soundEngine.play('levelWin');

      // Sync submission with anti-cheat API or queue locally
      const payload = {
        sessionId: sessionToken,
        sessionToken,
        levelId,
        shotsUsed: levelData.maxShots - shotsRemaining,
        bubblesPopped,
        bestCombo,
        rescuedCount,
        score: finalScore,
        completed: true,
        durationSeconds: (Date.now() - (sessionStartTime || Date.now())) / 1000,
        elapsedDurationMs: Date.now() - (sessionStartTime || Date.now())
      };

      try {
        await ApiService.completeGameSession(payload);
      } catch (err) {
        queueOfflineProgress(payload);
      }
    } else if (shotsRemaining <= 0) {
      set({
        gameStatus: GAME_STATES.LEVEL_FAILED,
        gameState: 'GAME_OVER',
        mascotEmotion: 'sad'
      });
      soundEngine.play('levelFail');
    }
  },

  /**
   * Activates a Tactical Booster
   */
  activateBooster: (boosterId) => {
    const { boosters, gameStatus, shotsRemaining } = get();
    if (gameStatus !== GAME_STATES.READY && gameStatus !== GAME_STATES.AIMING) return false;

    // Normalizing booster key names
    const keyMap = {
      SUPER_AIM: 'aimGuide',
      aim_guide: 'aimGuide',
      aimGuide: 'aimGuide',
      BOMB: 'bomb',
      bomb_bubble: 'bomb',
      bomb: 'bomb',
      RAINBOW: 'rainbow',
      rainbow_bubble: 'rainbow',
      rainbow: 'rainbow',
      EXTRA_SHOTS: 'extraShots',
      plus_5_shots: 'extraShots',
      extraShots: 'extraShots',
      SHUFFLE: 'shuffle',
      shuffle: 'shuffle'
    };

    const key = keyMap[boosterId] || boosterId;
    if (!boosters[key] || boosters[key] <= 0) return false;

    // Execute booster effect
    if (key === 'aimGuide') {
      const newActive = !get().superAimActive;
      set({ superAimActive: newActive, activeBooster: newActive ? 'aimGuide' : null });
    } else if (key === 'bomb') {
      set({ currentBubble: 'bomb', activeBooster: 'bomb' });
    } else if (key === 'rainbow') {
      set({ currentBubble: 'rainbow', activeBooster: 'rainbow' });
    } else if (key === 'extraShots') {
      set((state) => ({ shotsRemaining: state.shotsRemaining + 5 }));
    } else if (key === 'shuffle') {
      get().shuffleGrid();
    }

    // Deduct inventory
    const updated = { ...boosters, [key]: boosters[key] - 1 };
    set({ boosters: updated });
    savePersistedBoosters(updated);

    soundEngine.play('booster');
    return true;
  },

  /**
   * Permutes existing bubble colors across the grid to break deadlocks
   */
  shuffleGrid: () => {
    const { gridMatrix, levelData } = get();
    const palette = levelData?.palette || PRIMARY_COLOR_IDS;
    const newGrid = cloneGrid(gridMatrix);

    for (let r = 0; r < newGrid.length; r++) {
      for (let c = 0; c < newGrid[r].length; c++) {
        if (newGrid[r][c] && newGrid[r][c].type === SPECIAL_BUBBLES.NORMAL) {
          newGrid[r][c].color = palette[Math.floor(Math.random() * palette.length)];
        }
      }
    }

    set({ gridMatrix: newGrid });
    soundEngine.play('bounce');
  },

  /**
   * Hint Engine: Computes the optimal aim angle and target cluster for the current bubble
   */
  calculateHint: () => {
    const { gridMatrix, currentBubble, levelData } = get();
    if (!gridMatrix || gridMatrix.length === 0) return null;

    let bestAngle = -Math.PI / 2;
    let maxClusterSize = 0;
    let targetPos = null;

    // Scan angles across [-160 deg to -20 deg]
    for (let deg = -160; deg <= -20; deg += 4) {
      const rad = deg * (Math.PI / 180);
      const traj = calculateTrajectory(190, 520, rad, gridMatrix, 380, true);

      if (traj.landingTarget) {
        const { row, col } = traj.landingTarget;
        // Temporarily place bubble to test match
        const tempGrid = cloneGrid(gridMatrix);
        tempGrid[row][col] = { color: currentBubble, type: SPECIAL_BUBBLES.NORMAL };

        const matches = findConnectedMatch(tempGrid, row, col);
        if (matches.length > maxClusterSize) {
          maxClusterSize = matches.length;
          bestAngle = rad;
          targetPos = traj.landingTarget;
        }
      }
    }

    const hint = {
      angle: bestAngle,
      target: targetPos,
      matches: maxClusterSize
    };

    set({ hintData: hint, mascotEmotion: 'hint' });
    soundEngine.play('star');
    return hint;
  }
}));

export default useGameStore;
