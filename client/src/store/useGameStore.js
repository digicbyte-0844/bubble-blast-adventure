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
  superAim: 5,
  aimGuide: 5,
  bomb: 5,
  rainbow: 5,
  extraShots: 5,
  shuffle: 5
};

function getPersistedBoosters() {
  if (typeof window === 'undefined') return DEFAULT_BOOSTERS;
  try {
    const raw = localStorage.getItem('bba_boosters');
    const parsed = raw ? JSON.parse(raw) : {};
    const aimCount = parsed.superAim ?? parsed.aimGuide ?? parsed.AIM_GUIDE ?? 5;
    return {
      superAim: aimCount,
      aimGuide: aimCount,
      bomb: parsed.bomb ?? parsed.BOMB ?? 5,
      rainbow: parsed.rainbow ?? parsed.RAINBOW ?? 5,
      extraShots: parsed.extraShots ?? parsed.EXTRA_SHOTS ?? 5,
      shuffle: parsed.shuffle ?? parsed.SHUFFLE ?? 5
    };
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
  previousBubble: null,
  bannerNotice: null,

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

    // SET FSM STATE TO READY IMMEDIATELY - Zero render lag, zero network blocking
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
      previousBubble: null,
      bannerNotice: null,
      hintData: null,
      mascotEmotion: 'idle'
    });

    soundEngine.play('click');

    // Asynchronously obtain remote session token if backend is reachable
    try {
      const authRes = await ApiService.startGameSession(numericId);
      if (authRes) {
        const remoteToken = authRes.sessionToken || authRes.sessionId || authRes.data?.sessionToken;
        if (remoteToken) {
          set({ sessionToken: remoteToken });
        }
      }
    } catch (e) {
      // Offline fallback
    }
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
  fireBubble: (overrideAngle = null) => {
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
    if (gameStatus !== GAME_STATES.READY && gameStatus !== GAME_STATES.AIMING && gameStatus !== GAME_STATES.SHOOTING) {
      return null;
    }
    if (shotsRemaining <= 0) {
      set({ gameStatus: GAME_STATES.LEVEL_FAILED, gameState: 'GAME_OVER' });
      return null;
    }

    const finalAngle = overrideAngle !== null ? overrideAngle : aimAngle;

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
      hintData: null,
      aimAngle: finalAngle
    });

    soundEngine.play('launch');

    return {
      color: currentBubble,
      angle: finalAngle,
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
      superAimActive: false,
      previousBubble: null,
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
   * Activates a Tactical Booster with toggle-off refund support & banner feedback
   */
  activateBooster: (boosterId) => {
    const { boosters, gameStatus, superAimActive, activeBooster, currentBubble, previousBubble } = get();
    if (gameStatus !== GAME_STATES.READY && gameStatus !== GAME_STATES.AIMING) return false;

    // Normalizing booster key names
    const keyMap = {
      superAim: 'superAim',
      aimGuide: 'superAim',
      SUPER_AIM: 'superAim',
      aim_guide: 'superAim',
      AIM_GUIDE: 'superAim',
      bomb: 'bomb',
      BOMB: 'bomb',
      bomb_bubble: 'bomb',
      rainbow: 'rainbow',
      RAINBOW: 'rainbow',
      rainbow_bubble: 'rainbow',
      extraShots: 'extraShots',
      EXTRA_SHOTS: 'extraShots',
      plus_5_shots: 'extraShots',
      shuffle: 'shuffle',
      SHUFFLE: 'shuffle'
    };

    const key = keyMap[boosterId] || boosterId;

    // --- TOGGLE OFF HANDLING ---
    if (key === 'superAim' && (superAimActive || activeBooster === 'superAim')) {
      const updated = {
        ...boosters,
        superAim: (boosters.superAim || 0) + 1,
        aimGuide: (boosters.aimGuide || 0) + 1
      };
      set({
        superAimActive: false,
        activeBooster: null,
        boosters: updated,
        bannerNotice: { text: 'AIM CANCELLED', color: '#94A3B8', id: Date.now() }
      });
      savePersistedBoosters(updated);
      soundEngine.play('click');
      return true;
    }

    if (key === 'bomb' && activeBooster === 'bomb') {
      const restored = previousBubble || 'cyan';
      const updated = { ...boosters, bomb: (boosters.bomb || 0) + 1 };
      set({
        activeBooster: null,
        currentBubble: restored,
        previousBubble: null,
        boosters: updated,
        bannerNotice: { text: 'BOMB CANCELLED', color: '#94A3B8', id: Date.now() }
      });
      savePersistedBoosters(updated);
      soundEngine.play('click');
      return true;
    }

    if (key === 'rainbow' && activeBooster === 'rainbow') {
      const restored = previousBubble || 'magenta';
      const updated = { ...boosters, rainbow: (boosters.rainbow || 0) + 1 };
      set({
        activeBooster: null,
        currentBubble: restored,
        previousBubble: null,
        boosters: updated,
        bannerNotice: { text: 'RAINBOW CANCELLED', color: '#94A3B8', id: Date.now() }
      });
      savePersistedBoosters(updated);
      soundEngine.play('click');
      return true;
    }

    // Verify inventory availability
    const available = key === 'superAim' ? (boosters.superAim ?? boosters.aimGuide ?? 0) : (boosters[key] || 0);
    if (available <= 0) return false;

    // --- ACTIVATION HANDLING ---
    if (key === 'superAim') {
      const updated = {
        ...boosters,
        superAim: Math.max(0, available - 1),
        aimGuide: Math.max(0, available - 1)
      };
      set({
        superAimActive: true,
        activeBooster: 'superAim',
        boosters: updated,
        bannerNotice: { text: '🎯 SUPER AIM ACTIVE!', color: '#00F0FF', id: Date.now() }
      });
      savePersistedBoosters(updated);
      soundEngine.play('booster');
      return true;
    }

    if (key === 'bomb') {
      const prev = currentBubble;
      const updated = { ...boosters, bomb: Math.max(0, available - 1) };
      set({
        activeBooster: 'bomb',
        currentBubble: 'bomb',
        previousBubble: prev,
        boosters: updated,
        bannerNotice: { text: '💣 BOMB LOADED!', color: '#F97316', id: Date.now() }
      });
      savePersistedBoosters(updated);
      soundEngine.play('booster');
      return true;
    }

    if (key === 'rainbow') {
      const prev = currentBubble;
      const updated = { ...boosters, rainbow: Math.max(0, available - 1) };
      set({
        activeBooster: 'rainbow',
        currentBubble: 'rainbow',
        previousBubble: prev,
        boosters: updated,
        bannerNotice: { text: '🌈 RAINBOW LOADED!', color: '#EC4899', id: Date.now() }
      });
      savePersistedBoosters(updated);
      soundEngine.play('booster');
      return true;
    }

    if (key === 'extraShots') {
      const updated = { ...boosters, extraShots: Math.max(0, available - 1) };
      set((state) => ({
        shotsRemaining: state.shotsRemaining + 5,
        boosters: updated,
        mascotEmotion: 'cheering',
        bannerNotice: { text: '+5 EXTRA SHOTS!', color: '#10B981', id: Date.now() }
      }));
      savePersistedBoosters(updated);
      soundEngine.play('booster');
      return true;
    }

    if (key === 'shuffle') {
      const updated = { ...boosters, shuffle: Math.max(0, available - 1) };
      get().shuffleGrid();
      set({
        boosters: updated,
        bannerNotice: { text: '🔀 BOARD SHUFFLED!', color: '#38BDF8', id: Date.now() }
      });
      savePersistedBoosters(updated);
      soundEngine.play('booster');
      return true;
    }

    return false;
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
