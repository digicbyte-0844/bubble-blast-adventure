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
import { cloneGrid, isGridEmpty, checkDangerBreach, getRemainingBoardColors, countBoardBubbles, insertNewTopRow } from '../game/hexGrid.js';
import { calculateTrajectory } from '../game/collision.js';
import { findConnectedMatch } from '../game/matchDetector.js';
import { calculateTurnScore, calculateEndLevelBonus, calculateStars, calculateDynamicStarThresholds } from '../game/scoreManager.js';
import { soundEngine } from '../game/soundEngine.js';
import ApiService from '../services/api.js';
import { useUserStore } from './useUserStore';

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
  board: [], // Direct alias for gridMatrix
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
  isSubmittingCompletion: false,

  // Undo Functionality (Snapshots stack)
  undoStack: [],

  // Booster Inventory & Active States
  boosters: getPersistedBoosters(),
  boosterInventory: getPersistedBoosters(),
  activeBooster: null,
  superAimActive: false,
  previousBubble: null,
  bannerNotice: null,

  // Danger Line & Board Geometry Tracking
  failureReason: null,
  dangerLineY: null,
  bubbleRadius: PHYSICS.DEFAULT_BUBBLE_RADIUS,
  xOffset: 0,
  yOffset: 0,

  // Dynamic Upper-Section Wave / Ceiling Feed System
  reserveCeilingQueue: [],
  totalReserveWaves: 0,
  missedShotsCounter: 0,
  missThresholdForCeilingDrop: 5,

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

    // Calibrate fair dynamic 3-star thresholds for GameHUD and victory screens
    const boardBubbleCount = countBoardBubbles(level.matrix) + (level.waveRows ? level.waveRows.reduce((acc, row) => acc + (row.filter(Boolean).length), 0) : 0);
    const dynamicThresholds = calculateDynamicStarThresholds(boardBubbleCount, level.maxShots);
    const patchedLevel = {
      ...level,
      starScoreThresholds: {
        oneStar: Math.min(level.starScoreThresholds?.oneStar || 9999, dynamicThresholds.oneStar),
        twoStar: Math.min(level.starScoreThresholds?.twoStar || 9999, dynamicThresholds.twoStar),
        threeStar: Math.min(level.starScoreThresholds?.threeStar || 9999, dynamicThresholds.threeStar)
      }
    };

    const waveQueue = level.waveRows ? [...level.waveRows] : [];
    const missThreshold = numericId <= 5 ? 5 : numericId <= 15 ? 4 : 3;

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

    // Ensure player always has a generous tactical stock of at least 5 of each booster
    const currentBoosters = getPersistedBoosters();
    const ensuredBoosters = {
      superAim: Math.max(5, currentBoosters.superAim || 0),
      aimGuide: Math.max(5, currentBoosters.aimGuide || 0),
      bomb: Math.max(5, currentBoosters.bomb || 0),
      rainbow: Math.max(5, currentBoosters.rainbow || 0),
      extraShots: Math.max(5, currentBoosters.extraShots || 0),
      shuffle: Math.max(5, currentBoosters.shuffle || 0)
    };
    savePersistedBoosters(ensuredBoosters);

    // SET FSM STATE TO READY IMMEDIATELY - Zero render lag, zero network blocking
    set({
      levelId: numericId,
      levelData: patchedLevel,
      gridMatrix: matrix,
      board: matrix,
      reserveCeilingQueue: waveQueue,
      totalReserveWaves: waveQueue.length,
      missedShotsCounter: 0,
      missThresholdForCeilingDrop: missThreshold,
      boosters: ensuredBoosters,
      boosterInventory: ensuredBoosters,
      failureReason: null,
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
      isSubmittingCompletion: false,
      mascotEmotion: 'idle'
    });

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
   * Allowed ONLY when gameStatus === 'READY' || gameStatus === 'AIMING'
   * NEVER fires or releases a shot
   * If a booster (like Bomb) is active, cancels booster smoothly, refunds stock, and restores standard ammo
   */
  swapBubbles: () => {
    const { gameStatus, currentBubble, nextBubble, activeBooster, previousBubble, boosters } = get();
    // Cannot swap while shot is in motion or resolving
    if (gameStatus !== GAME_STATES.READY && gameStatus !== GAME_STATES.AIMING) return;

    soundEngine.play('click');

    // If a booster (e.g. Bomb or Rainbow) is loaded, cancel the booster, restore previous ammo, and swap
    if (activeBooster === 'bomb' || activeBooster === 'rainbow') {
      const restored = previousBubble || 'cyan';
      const updated = { ...boosters };
      if (activeBooster === 'bomb') updated.bomb = (updated.bomb || 0) + 1;
      if (activeBooster === 'rainbow') updated.rainbow = (updated.rainbow || 0) + 1;
      savePersistedBoosters(updated);

      const nextB = (nextBubble === 'bomb' || nextBubble === 'rainbow') ? 'yellow' : nextBubble;
      set({
        activeBooster: null,
        previousBubble: null,
        boosters: updated,
        boosterInventory: updated,
        currentBubble: nextB,
        nextBubble: restored,
        bannerNotice: { text: 'BOOSTER CANCELLED', color: '#94A3B8', id: Date.now() }
      });
      return;
    }

    // Standard swap: instantaneous swap without firing
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
      isBooster: activeBooster,
      isBomb: activeBooster === 'bomb' || currentBubble === 'bomb',
      isRainbow: activeBooster === 'rainbow' || currentBubble === 'rainbow'
    };
  },

  /**
   * Rewards +1 Bomb on successful match-3+ pop
   */
  rewardBombOnSuccess: () => {
    const { boosters } = get();
    const updated = {
      ...boosters,
      bomb: (boosters.bomb || 0) + 1
    };
    set({
      boosters: updated,
      boosterInventory: updated,
      recentBombReward: Date.now(),
      bannerNotice: { text: '+1 BOMB EARNED!', color: '#F97316', id: Date.now() }
    });
    savePersistedBoosters(updated);
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
   * Replenishes Current and Next bubbles from the controlled queue.
   * CRITICAL: Samples ONLY from colors still present on the board (endgame color-lock fix).
   * If currentBubble or nextBubble holds a dead color (not on board), it is immediately
   * morphed to a valid board color so the player is never stuck with unmatchable ammo.
   */
  replenishBubbles: () => {
    const { nextBubble, bubbleQueue, gridMatrix, levelData } = get();
    const fallbackPalette = levelData?.palette || PRIMARY_COLOR_IDS;

    // === ENDGAME COLOR LOCK FIX: Only sample from colors present on board ===
    const activeColors = getRemainingBoardColors(gridMatrix);
    const validPalette = activeColors.length > 0 ? activeColors : fallbackPalette;

    let newQueue = [...bubbleQueue];
    if (newQueue.length < 2) {
      newQueue.push(getBalancedAmmoColor(gridMatrix, validPalette));
      newQueue.push(getBalancedAmmoColor(gridMatrix, validPalette));
    }

    // Advance: next → current, queue → next
    let nextCurrent = nextBubble;
    // Auto-morph if nextBubble is a dead color (not on board) and not a special bubble
    if (!nextCurrent || nextCurrent === 'bomb' || nextCurrent === 'rainbow') {
      nextCurrent = newQueue.shift() || getBalancedAmmoColor(gridMatrix, validPalette);
    } else if (activeColors.length > 0 && !activeColors.includes(nextCurrent)) {
      // Dead color — morph to a valid board color
      nextCurrent = getBalancedAmmoColor(gridMatrix, validPalette);
      newQueue.shift(); // consume one from queue
    }

    let nextNext = newQueue.shift();
    if (!nextNext || nextNext === 'bomb' || nextNext === 'rainbow') {
      nextNext = getBalancedAmmoColor(gridMatrix, validPalette);
    } else if (activeColors.length > 0 && !activeColors.includes(nextNext)) {
      // Dead color in queue — morph it
      nextNext = getBalancedAmmoColor(gridMatrix, validPalette);
    }

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
    set({ gridMatrix: matrix, board: matrix });
  },

  /**
   * Generates a balanced next bubble color from ACTIVE board colors only.
   * Prevents dead-color ammo when only 1 color remains on the board.
   */
  generateNextBubble: () => {
    const { bubbleQueue, gridMatrix, levelData } = get();
    const fallbackPalette = levelData?.palette || PRIMARY_COLOR_IDS;
    const activeColors = getRemainingBoardColors(gridMatrix);
    const validPalette = activeColors.length > 0 ? activeColors : fallbackPalette;

    if (bubbleQueue && bubbleQueue.length > 0) {
      const next = bubbleQueue[0];
      if (next && next !== 'bomb' && next !== 'rainbow') {
        // Morph if dead color
        if (activeColors.length > 0 && !activeColors.includes(next)) {
          return getBalancedAmmoColor(gridMatrix, validPalette);
        }
        return next;
      }
    }
    return getBalancedAmmoColor(gridMatrix, validPalette);
  },

  /**
   * Records match resolution and increments score.
   * After every board mutation, auto-morphs dead-color ammo to valid board colors.
   */
  recordTurnResolution: (poppedCount, droppedCount, freedJellies = 0) => {
    const { score, combo, bestCombo, bubblesPopped, rescuedCount, gridMatrix, levelData, currentBubble, nextBubble } = get();

    if (poppedCount > 0) {
      const newCombo = combo + 1;
      const turnScore = calculateTurnScore(poppedCount, droppedCount, freedJellies, newCombo);
      const newScore = score + turnScore.totalTurnScore;
      const newPopped = bubblesPopped + poppedCount + droppedCount;
      const newRescued = rescuedCount + freedJellies;

      // === ACTIVE COLOR MORPH: After every pop, check if launcher holds dead colors ===
      const fallbackPalette = levelData?.palette || PRIMARY_COLOR_IDS;
      const activeColors = getRemainingBoardColors(gridMatrix);
      let morphedCurrent = currentBubble;
      let morphedNext = nextBubble;
      if (activeColors.length > 0) {
        if (morphedCurrent && morphedCurrent !== 'bomb' && morphedCurrent !== 'rainbow' && !activeColors.includes(morphedCurrent)) {
          morphedCurrent = getBalancedAmmoColor(gridMatrix, activeColors);
        }
        if (morphedNext && morphedNext !== 'bomb' && morphedNext !== 'rainbow' && !activeColors.includes(morphedNext)) {
          morphedNext = getBalancedAmmoColor(gridMatrix, activeColors);
        }
      }

      set({
        score: newScore,
        combo: newCombo,
        comboCount: newCombo,
        bestCombo: Math.max(bestCombo, newCombo),
        bubblesPopped: newPopped,
        rescuedCount: newRescued,
        rescuedJellies: newRescued,
        currentBubble: morphedCurrent,
        nextBubble: morphedNext,
        mascotEmotion: newCombo >= 2 || freedJellies > 0 ? 'cheering' : 'idle'
      });

      if (freedJellies > 0) {
        soundEngine.play('rescue');
      } else if (newCombo > 1) {
        soundEngine.play('combo', newCombo);
      } else {
        soundEngine.play('pop', 0);
      }

      // === DYNAMIC WAVE CEILING FEED CHECK ===
      // Check if board bubbles have diminished to fewer than 3 occupied rows
      let occupiedRows = 0;
      for (const r of gridMatrix) {
        if (r && r.some(c => c && (c.color || c.type) && c.type !== 'rock')) occupiedRows++;
      }
      const { reserveCeilingQueue } = get();
      if (occupiedRows < 3 && reserveCeilingQueue && reserveCeilingQueue.length > 0) {
        get().insertCeilingWave();
      }
    } else {
      // Missed shot breaks combo streak and ticks ceiling drop counter
      const newMissed = (get().missedShotsCounter || 0) + 1;
      const { reserveCeilingQueue, missThresholdForCeilingDrop } = get();
      if (newMissed >= (missThresholdForCeilingDrop || 5) && reserveCeilingQueue && reserveCeilingQueue.length > 0) {
        get().insertCeilingWave();
        set({
          combo: 0,
          comboCount: 0,
          missedShotsCounter: 0,
          mascotEmotion: get().shotsRemaining <= 5 ? 'worried' : 'idle'
        });
      } else {
        set({
          combo: 0,
          comboCount: 0,
          missedShotsCounter: newMissed,
          mascotEmotion: get().shotsRemaining <= 5 ? 'worried' : 'idle'
        });
      }
    }
  },

  /**
   * Inserts the next reserve wave from the ceiling queue at row 0,
   * shifting existing rows downward and checking for danger line breach.
   */
  insertCeilingWave: () => {
    const { reserveCeilingQueue, gridMatrix, dangerLineY, bubbleRadius } = get();
    if (!reserveCeilingQueue || reserveCeilingQueue.length === 0) return false;

    const nextQueue = [...reserveCeilingQueue];
    const nextRow = nextQueue.shift();
    const newGrid = insertNewTopRow(gridMatrix, nextRow);

    set({
      reserveCeilingQueue: nextQueue,
      gridMatrix: newGrid,
      board: newGrid
    });

    // Morph ammo if colors on board changed
    get().replenishBubbles();

    // Check danger breach immediately
    get().evaluateLevelEnd(newGrid, dangerLineY, bubbleRadius);
    return true;
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
  evaluateLevelEnd: async (overrideGrid = null, customDangerY = null, customRadius = null) => {
    const {
      gameStatus,
      isSubmittingCompletion,
      gridMatrix: storeGrid,
      levelData,
      rescuedCount,
      targetJellies,
      score,
      shotsRemaining,
      levelId,
      sessionToken,
      bubblesPopped,
      bestCombo,
      sessionStartTime,
      dangerLineY: storeDangerY,
      bubbleRadius: storeRadius,
      xOffset,
      yOffset
    } = get();

    if (!levelData) return;
    if (gameStatus === GAME_STATES.LEVEL_COMPLETE || gameStatus === GAME_STATES.LEVEL_FAILED) return;
    if (isSubmittingCompletion) return;

    const gridMatrix = overrideGrid || storeGrid;

    // 1. DANGER LINE LOSS CONDITION (MANDATORY GAME MECHANIC):
    // If any active bubble on the board has its bottom edge (y + radius) >= dangerLineY:
    // Immediately transition game status to LEVEL_FAILED with failureReason: "Breached the Danger Line!"
    const effectiveDangerY = customDangerY ?? storeDangerY;
    const effectiveRadius = customRadius ?? storeRadius ?? PHYSICS.DEFAULT_BUBBLE_RADIUS;

    if (effectiveDangerY !== null && effectiveDangerY !== undefined) {
      const isBreached = checkDangerBreach(gridMatrix, effectiveDangerY, effectiveRadius, xOffset || 0, yOffset || 0);
      if (isBreached) {
        set({
          gameStatus: GAME_STATES.LEVEL_FAILED,
          gameState: 'GAME_OVER',
          failureReason: 'Breached the Danger Line!',
          mascotEmotion: 'sad'
        });
        soundEngine.play('levelFail');
        return;
      }
    }

    const emptyGrid = isGridEmpty(gridMatrix);
    const { reserveCeilingQueue } = get();

    // Dynamic wave progression: if visible board cleared but reserve ceiling rows remain, feed next wave!
    if (emptyGrid && reserveCeilingQueue && reserveCeilingQueue.length > 0) {
      get().insertCeilingWave();
      return;
    }

    let isVictory = false;

    // MANDATORY BUBBLE SHOOTER MECHANIC:
    // The level is completed ONLY when ALL bubbles on the board are blasted AND all reserve waves cleared!
    if (emptyGrid && (!reserveCeilingQueue || reserveCeilingQueue.length === 0)) {
      isVictory = true;
    }

    if (isVictory) {
      set({
        isSubmittingCompletion: true,
        gameStatus: GAME_STATES.LEVEL_COMPLETE,
        gameState: 'VICTORY',
        mascotEmotion: 'cheering'
      });

      const bonus = calculateEndLevelBonus(shotsRemaining);
      const finalScore = score + bonus;

      // === DYNAMIC STAR THRESHOLD FIX ===
      // Use per-level calibrated thresholds. If the level has hardcoded thresholds,
      // also compute dynamic ones and use whichever gives a fairer result.
      const bubbleCount = countBoardBubbles(levelData?.matrix || gridMatrix) || 30;
      const dynamicThresholds = calculateDynamicStarThresholds(bubbleCount, levelData?.maxShots || 30);

      // If hardcoded thresholds exist, use the lower (more lenient) of the two for 3-stars
      const hardThresholds = levelData?.starScoreThresholds;
      const thresholds = hardThresholds
        ? {
            oneStar: Math.min(hardThresholds.oneStar || 9999, dynamicThresholds.oneStar),
            twoStar: Math.min(hardThresholds.twoStar || 9999, dynamicThresholds.twoStar),
            threeStar: Math.min(hardThresholds.threeStar || 9999, dynamicThresholds.threeStar)
          }
        : dynamicThresholds;

      const rawStars = calculateStars(finalScore, [
        thresholds.oneStar,
        thresholds.twoStar,
        thresholds.threeStar
      ]);
      const stars = Math.max(1, rawStars); // Clearing all bubbles guarantees at least 1 star!

      set({ score: finalScore });
      soundEngine.play('levelWin');

      // CRITICAL PROGRESSION SYNC: Unlocks next level in User Store & localStorage
      try {
        useUserStore.getState().updateLevelSuccess(levelId, finalScore, stars);
      } catch (err) {
        console.error('Error syncing level completion progress:', err);
      }

      // Sync submission with anti-cheat API or queue locally
      const shotsFired = Math.max(1, levelData.maxShots - shotsRemaining);
      const remaining = Math.max(0, shotsRemaining);
      const elapsed = Math.max(3500, Date.now() - (sessionStartTime || Date.now()));

      const payload = {
        sessionId: sessionToken,
        sessionToken,
        levelId,
        shotsUsed: shotsFired,
        shotsFired: shotsFired,
        remainingShots: remaining,
        bubblesPopped,
        bestCombo,
        rescuedCount,
        score: finalScore,
        starsAwarded: stars,
        starsEarned: stars,
        stars,
        completed: true,
        durationSeconds: elapsed / 1000,
        elapsedDurationMs: elapsed
      };

      try {
        await ApiService.completeGameSession(payload);
      } catch (err) {
        queueOfflineProgress(payload);
      } finally {
        set({ isSubmittingCompletion: false });
      }
    } else if (shotsRemaining <= 0) {
      set({
        gameStatus: GAME_STATES.LEVEL_FAILED,
        gameState: 'GAME_OVER',
        failureReason: 'Out of Shots!',
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
        boosterInventory: updated,
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
        boosterInventory: updated,
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
        boosterInventory: updated,
        bannerNotice: { text: 'RAINBOW CANCELLED', color: '#94A3B8', id: Date.now() }
      });
      savePersistedBoosters(updated);
      soundEngine.play('click');
      return true;
    }

    // Verify inventory availability (guarantee stock of at least 5 for fluid gameplay)
    let available = key === 'superAim'
      ? (boosters.superAim ?? boosters.aimGuide ?? 5)
      : (boosters[key] ?? 5);
    if (available <= 0) {
      available = 5;
    }

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
        boosterInventory: updated,
        bannerNotice: { text: 'SUPER AIM ACTIVE!', color: '#00F0FF', id: Date.now() }
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
        boosterInventory: updated,
        bannerNotice: { text: 'BOMB LOADED!', color: '#F97316', id: Date.now() }
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
        boosterInventory: updated,
        bannerNotice: { text: 'RAINBOW LOADED!', color: '#EC4899', id: Date.now() }
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
        boosterInventory: updated,
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
        boosterInventory: updated,
        bannerNotice: { text: 'BOARD SHUFFLED!', color: '#38BDF8', id: Date.now() }
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
