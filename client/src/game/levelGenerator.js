/**
 * Data-Driven Level Generator (40 Handcrafted Levels + Procedural Generator 41+)
 * Bubble Puzzle Engine Engine
 */

import { BUBBLE_COLORS, SPECIAL_BUBBLES, OBJECTIVES, PHYSICS } from './constants.js';
import { getColsInRow, createEmptyGrid } from './hexGrid.js';

// Deterministic PRNG (Mulberry32 algorithm)
export class SeededPRNG {
  constructor(seed = 12345) {
    this.state = seed >>> 0;
  }

  next() {
    this.state |= 0;
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  nextInt(min, max) {
    return Math.floor(this.next() * (max - min + 1)) + min;
  }

  pick(array) {
    return array[this.nextInt(0, array.length - 1)];
  }
}

// 6 Cosmic Worlds
export const WORLDS = [
  'Celestial Reef',
  'Starlight Nebula',
  'Crystal Abyss',
  'Supernova Core',
  'Quantum Nexus',
  'Eternal Void'
];

// Difficulty Tiers
export const DIFFICULTY_TIERS = {
  TUTORIAL: { name: 'Tutorial', range: [1, 5] },
  BEGINNER: { name: 'Beginner', range: [6, 10] },
  EASY: { name: 'Easy', range: [11, 20] },
  MEDIUM: { name: 'Medium', range: [21, 30] },
  HARD: { name: 'Hard', range: [31, 35] },
  EXPERT: { name: 'Expert', range: [36, 40] }
};

/**
 * Returns difficulty tier name for a level index
 */
export function getDifficultyTier(levelId) {
  if (levelId <= 5) return 'Tutorial';
  if (levelId <= 10) return 'Beginner';
  if (levelId <= 20) return 'Easy';
  if (levelId <= 30) return 'Medium';
  if (levelId <= 35) return 'Hard';
  if (levelId <= 40) return 'Expert';
  return 'Master Procedural';
}

/**
 * Helper to build an Odd-R grid matrix with patterned clusters and special bubbles
 */
function createMatrix(occupiedRows, palette, specialRule = null) {
  const grid = createEmptyGrid();
  for (let r = 0; r < occupiedRows; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      let special = specialRule ? specialRule(r, c) : null;
      if (special) {
        grid[r][c] = {
          color: special.color || palette[0],
          type: special.type || SPECIAL_BUBBLES.NORMAL
        };
      } else {
        // Aesthetic clustered wave pattern
        const colorIndex = (c + Math.floor(r / 2)) % palette.length;
        grid[r][c] = {
          color: palette[colorIndex],
          type: SPECIAL_BUBBLES.NORMAL
        };
      }
    }
  }
  return grid;
}

/**
 * 40 Distinct Handcrafted Levels
 */
export const LEVELS = [];

const OBJECTIVE_CYCLE = [
  OBJECTIVES.CLEAR_ALL,
  OBJECTIVES.RESCUE,
  OBJECTIVES.TARGET_SCORE,
  OBJECTIVES.COLOR_HUNT,
  OBJECTIVES.DROP_BUBBLES,
  OBJECTIVES.COMBO_CHALLENGE,
  OBJECTIVES.LIMITED_SHOTS
];

const PALETTE_SETS = {
  3: ['red', 'blue', 'yellow'],
  4: ['red', 'blue', 'green', 'yellow'],
  5: ['red', 'blue', 'green', 'yellow', 'purple'],
  6: ['red', 'blue', 'green', 'yellow', 'purple', 'cyan'],
  7: ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'pink'],
  8: ['red', 'blue', 'green', 'yellow', 'purple', 'cyan', 'pink', 'orange']
};

for (let id = 1; id <= 40; id++) {
  const worldIndex = Math.min(WORLDS.length - 1, Math.floor((id - 1) / 7));
  const world = WORLDS[worldIndex];
  const objType = OBJECTIVE_CYCLE[(id - 1) % OBJECTIVE_CYCLE.length];
  const tier = getDifficultyTier(id);

  // Difficulty scaling parameters
  const paletteSize = id <= 5 ? 3 : id <= 15 ? 4 : id <= 28 ? 5 : id <= 35 ? 6 : 7;
  const palette = PALETTE_SETS[paletteSize] || PALETTE_SETS[4];
  const occupiedRows = Math.min(9, 4 + Math.floor(id / 7));
  const maxShots = Math.max(14, 34 - Math.floor(id / 3));

  let specialRule = null;
  let target = 0;
  let targetColor = null;

  switch (objType) {
    case OBJECTIVES.CLEAR_ALL:
      target = 0;
      specialRule = (r, c) => {
        if (id > 15 && (r * 4 + c) % 11 === 0) return { type: SPECIAL_BUBBLES.BOMB, color: 'orange' };
        return null;
      };
      break;

    case OBJECTIVES.RESCUE:
      target = 2 + Math.floor(id / 9);
      specialRule = (r, c) => {
        if (r > 1 && (r + c * 2) % 6 === 0) {
          return { type: SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE, color: 'cyan' };
        }
        if (id > 12 && (r * 2 + c) % 7 === 0) {
          return { type: SPECIAL_BUBBLES.BOMB, color: 'orange' };
        }
        return null;
      };
      break;

    case OBJECTIVES.TARGET_SCORE:
      target = 3500 + id * 450;
      specialRule = (r, c) => {
        if (id > 8 && r === 2 && c % 4 === 0) return { type: SPECIAL_BUBBLES.RAINBOW, color: 'pink' };
        return null;
      };
      break;

    case OBJECTIVES.COLOR_HUNT:
      target = 12 + Math.floor(id / 3);
      targetColor = palette[(id * 2) % palette.length];
      break;

    case OBJECTIVES.DROP_BUBBLES:
      target = 8 + Math.floor(id / 4);
      specialRule = (r, c) => {
        if (r === 2 && c % 3 === 0) return { type: SPECIAL_BUBBLES.ROCK, color: 'rock' };
        return null;
      };
      break;

    case OBJECTIVES.COMBO_CHALLENGE:
      target = Math.min(7, 3 + Math.floor(id / 10));
      break;

    case OBJECTIVES.LIMITED_SHOTS:
      target = 0; // Clear all with strict shots
      specialRule = (r, c) => {
        if (r === 1 && c % 5 === 0) return { type: SPECIAL_BUBBLES.LIGHTNING, color: 'yellow' };
        if (r === 3 && c % 4 === 0) return { type: SPECIAL_BUBBLES.BOMB, color: 'orange' };
        return null;
      };
      break;
  }

  const baseScore = 2000 + id * 300;
  LEVELS.push({
    id,
    name: `Sector ${id}: ${world}`,
    world,
    tier,
    objective: {
      type: objType,
      target,
      targetColor
    },
    maxShots: objType === OBJECTIVES.LIMITED_SHOTS ? Math.max(10, maxShots - 6) : maxShots,
    palette,
    matrix: createMatrix(occupiedRows, palette, specialRule),
    starScoreThresholds: {
      oneStar: baseScore,
      twoStar: Math.round(baseScore * 1.8),
      threeStar: Math.round(baseScore * 2.8)
    }
  });
}

/**
 * Deterministic Seeded Procedural Level Generator (Levels 41 to 100+)
 *
 * @param {number} levelId - Level number >= 41
 * @param {number} seed - Optional custom seed
 * @returns {object} Fully constructed level configuration
 */
export function generateProceduralLevel(levelId, seed = null) {
  const prngSeed = seed !== null ? seed : levelId * 7919 + 104729;
  const prng = new SeededPRNG(prngSeed);

  const worldIndex = (Math.floor(levelId / 5)) % WORLDS.length;
  const world = WORLDS[worldIndex];
  const objType = OBJECTIVE_CYCLE[(levelId + prng.nextInt(0, 3)) % OBJECTIVE_CYCLE.length];

  const paletteSize = Math.min(8, 4 + Math.floor((levelId - 40) / 15));
  const palette = PALETTE_SETS[paletteSize] || PALETTE_SETS[6];
  const occupiedRows = Math.min(10, 6 + Math.floor((levelId - 40) / 20));
  const maxShots = Math.max(12, 28 - Math.floor((levelId - 40) / 10));

  const grid = createEmptyGrid();

  for (let r = 0; r < occupiedRows; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      const roll = prng.next();

      if (roll < 0.05) {
        grid[r][c] = { color: 'cyan', type: SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE };
      } else if (roll < 0.10) {
        grid[r][c] = { color: 'orange', type: SPECIAL_BUBBLES.BOMB };
      } else if (roll < 0.14) {
        grid[r][c] = { color: 'pink', type: SPECIAL_BUBBLES.RAINBOW };
      } else if (roll < 0.17) {
        grid[r][c] = { color: 'yellow', type: SPECIAL_BUBBLES.LIGHTNING };
      } else {
        // Cluster coherence: inherit neighboring color 60% of the time
        let chosenColor = prng.pick(palette);
        if (c > 0 && grid[r][c - 1] && prng.next() < 0.5) {
          chosenColor = grid[r][c - 1].color;
        } else if (r > 0 && grid[r - 1][c] && prng.next() < 0.4) {
          chosenColor = grid[r - 1][c].color;
        }
        grid[r][c] = { color: chosenColor, type: SPECIAL_BUBBLES.NORMAL };
      }
    }
  }

  const baseScore = 15000 + (levelId - 40) * 1200;

  return {
    id: levelId,
    name: `Procedural Sector ${levelId}: ${world}`,
    world,
    tier: 'Master Procedural',
    objective: {
      type: objType,
      target: objType === OBJECTIVES.RESCUE ? 4 + Math.floor(levelId / 20) : 0,
      targetColor: objType === OBJECTIVES.COLOR_HUNT ? prng.pick(palette) : null
    },
    maxShots,
    palette,
    matrix: grid,
    starScoreThresholds: {
      oneStar: baseScore,
      twoStar: Math.round(baseScore * 1.7),
      threeStar: Math.round(baseScore * 2.6)
    }
  };
}

/**
 * Universal level accessor returning handcrafted (1-40) or procedural (41+)
 */
export function getLevel(levelId) {
  const numericId = parseInt(levelId, 10) || 1;
  if (numericId >= 1 && numericId <= 40) {
    return LEVELS[numericId - 1];
  }
  return generateProceduralLevel(numericId);
}

/**
 * Scans active grid bubbles and generates controlled ammo
 * Guarantees ammo colors match bubbles remaining on the grid to prevent unwinnable deadlocks.
 *
 * @param {Array<Array>} grid - Active Odd-R bubble grid
 * @param {Array<string>} fallbackPalette - Palette if grid is empty
 * @returns {string} Controlled bubble color
 */
export function getBalancedAmmoColor(grid, fallbackPalette = ['red', 'blue', 'green', 'yellow']) {
  const remainingColors = new Set();

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      const b = grid[r][c];
      if (b && b.color && b.type === SPECIAL_BUBBLES.NORMAL) {
        remainingColors.add(b.color);
      }
    }
  }

  const colorArray = Array.from(remainingColors);
  if (colorArray.length > 0) {
    return colorArray[Math.floor(Math.random() * colorArray.length)];
  }

  return fallbackPalette[Math.floor(Math.random() * fallbackPalette.length)];
}

/**
 * Generates an initial controlled bubble queue for launcher
 */
export function generateBubbleQueue(level, count = 2) {
  const queue = [];
  for (let i = 0; i < count; i++) {
    queue.push(getBalancedAmmoColor(level.matrix, level.palette));
  }
  return queue;
}

export default {
  LEVELS,
  WORLDS,
  DIFFICULTY_TIERS,
  getDifficultyTier,
  getLevel,
  generateProceduralLevel,
  getBalancedAmmoColor,
  generateBubbleQueue,
  SeededPRNG
};
