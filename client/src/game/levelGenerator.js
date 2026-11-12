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

// 4 Themed Biomes
export const WORLDS = [
  'Emerald Lagoon',
  'Crystal Caverns',
  'Magma Peaks',
  'Starlight Nebula'
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

const PALETTE_SETS = {
  3: ['red', 'blue', 'yellow'],
  4: ['red', 'blue', 'green', 'yellow'],
  5: ['red', 'blue', 'green', 'yellow', 'purple'],
  6: ['red', 'blue', 'green', 'yellow', 'purple', 'orange'],
  7: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'],
  8: ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink', 'cyan']
};

// Shorthand helpers for level layout definitions
const N = SPECIAL_BUBBLES.NORMAL;
const J = SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE;
const B = SPECIAL_BUBBLES.BOMB;
const R = SPECIAL_BUBBLES.RAINBOW;
const L = SPECIAL_BUBBLES.LIGHTNING;
const K = SPECIAL_BUBBLES.ROCK;

const jelly = () => ({ color: 'cyan', type: J });
const bomb = (color = 'orange') => ({ color, type: B });
const rainbow = (color = 'pink') => ({ color, type: R });
const lightning = (color = 'yellow') => ({ color, type: L });
const rock = () => ({ color: 'rock', type: K });
const norm = (color) => ({ color, type: N });

function buildRow(rowIdx, items) {
  const maxCols = getColsInRow(rowIdx);
  const row = [];
  for (let c = 0; c < maxCols; c++) {
    const item = items[c];
    if (!item) {
      row.push(null);
    } else if (typeof item === 'string') {
      row.push({ color: item, type: N });
    } else {
      row.push({ color: item.color || 'cyan', type: item.type || N });
    }
  }
  return row;
}

function buildGrid(rowDefs) {
  const grid = createEmptyGrid();
  for (let r = 0; r < rowDefs.length; r++) {
    if (r < grid.length && rowDefs[r]) {
      grid[r] = buildRow(r, rowDefs[r]);
    }
  }
  return grid;
}

function countJellies(grid) {
  let count = 0;
  for (const row of grid) {
    if (!row) continue;
    for (const cell of row) {
      if (cell && cell.type === SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE) {
        count++;
      }
    }
  }
  return count;
}

function countTotalBubbles(grid) {
  let count = 0;
  for (const row of grid) {
    if (!row) continue;
    for (const cell of row) {
      if (cell) count++;
    }
  }
  return count;
}

/**
 * Handcrafted Level Catalog (Levels 1 to 40)
 */
function createHandcraftedLevels() {
  const catalog = [];

  // =========================================================================
  // BIOME 1: EMERALD LAGOON (Levels 1 to 10)
  // =========================================================================

  // Level 1: Tutorial — Clear All (3 colors: red, blue, yellow, 30 shots)
  // Large 3-4 bubble clusters in 4 gentle rows
  catalog.push({
    id: 1,
    name: 'Sector 1: Celestial Reef (First Steps)',
    world: 'Celestial Reef',
    tier: 'Tutorial',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 30,
    palette: ['red', 'blue', 'yellow'],
    matrix: buildGrid([
      ['red', 'red', 'red', 'blue', 'blue', 'blue', 'yellow', 'yellow', 'yellow', 'red', 'red'],
      ['red', 'red', 'red', 'blue', 'blue', 'blue', 'yellow', 'yellow', 'yellow', 'red'],
      ['yellow', 'yellow', 'yellow', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'yellow', 'yellow'],
      ['yellow', 'yellow', 'red', 'red', 'red', 'blue', 'blue', 'blue', 'yellow', 'yellow']
    ]),
    starScoreThresholds: { oneStar: 2000, twoStar: 4000, threeStar: 7000 }
  });

  // Level 2: Pattern Recognition — Clear All (3 colors: red, blue, green, 24 shots)
  // "Striped Honeycomb" (alternating columns of Blue and Green with Red anchor caps)
  catalog.push({
    id: 2,
    name: 'Sector 2: Honeycomb Lattice (Bank Shot)',
    world: 'Emerald Lagoon',
    tier: 'Tutorial',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 24,
    palette: ['red', 'blue', 'green'],
    matrix: buildGrid([
      ['red', 'red', 'blue', 'blue', 'green', 'green', 'blue', 'blue', 'green', 'red', 'red'],
      ['blue', 'blue', 'green', 'green', 'blue', 'blue', 'green', 'green', 'blue', 'blue'],
      ['blue', 'blue', 'green', 'green', 'blue', 'blue', 'green', 'green', 'blue', 'green', 'green'],
      ['green', 'green', 'blue', 'blue', 'green', 'green', 'blue', 'blue', 'green', 'green']
    ]),
    starScoreThresholds: { oneStar: 2500, twoStar: 4500, threeStar: 7500 }
  });

  // Level 3: First Rescue — Free the Jelly (3 colors: yellow, purple, blue, 22 shots)
  // Rescue 1 Starlight Jelly in row 3 surrounded by amber/purple ring
  catalog.push({
    id: 3,
    name: 'Sector 3: Starlight Sanctuary (Free Bloopi)',
    world: 'Emerald Lagoon',
    tier: 'Tutorial',
    objective: { type: OBJECTIVES.RESCUE, target: 1 },
    maxShots: 22,
    palette: ['yellow', 'purple', 'blue'],
    matrix: buildGrid([
      ['blue', 'blue', 'purple', 'purple', 'yellow', 'yellow', 'yellow', 'purple', 'purple', 'blue', 'blue'],
      ['blue', 'purple', 'purple', 'yellow', 'yellow', 'yellow', 'yellow', 'purple', 'purple', 'blue'],
      ['purple', 'yellow', 'yellow', 'purple', 'purple', 'purple', 'purple', 'yellow', 'yellow', 'purple', 'purple'],
      ['yellow', 'purple', 'yellow', 'purple', jelly(), 'purple', 'yellow', 'purple', 'yellow', 'yellow'],
      [null, null, 'purple', 'yellow', 'purple', 'purple', 'yellow', 'purple', null, null, null]
    ]),
    starScoreThresholds: { oneStar: 3000, twoStar: 5500, threeStar: 8500 }
  });

  // Level 4: The Diamond Vault — Clear All (4 colors, 22 shots)
  // Hollow diamond shape with floating cluster in center
  catalog.push({
    id: 4,
    name: 'Sector 4: Diamond Vault',
    world: 'Emerald Lagoon',
    tier: 'Tutorial',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 22,
    palette: ['red', 'blue', 'green', 'yellow'],
    matrix: buildGrid([
      ['red', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'green', 'green', 'green', 'green'],
      ['red', 'red', null, null, 'yellow', 'yellow', null, null, 'green', 'green'],
      ['red', null, null, 'yellow', 'yellow', 'yellow', 'yellow', null, null, 'green', null],
      [null, 'blue', null, null, 'yellow', 'yellow', null, null, 'blue', null],
      [null, null, 'blue', 'blue', null, null, 'blue', 'blue', null, null, null]
    ]),
    starScoreThresholds: { oneStar: 3200, twoStar: 6000, threeStar: 9000 }
  });

  // Level 5: Twin Pods Rescue (4 colors, 24 shots, 2 Jellies)
  catalog.push({
    id: 5,
    name: 'Sector 5: Twin Lagoons',
    world: 'Emerald Lagoon',
    tier: 'Tutorial',
    objective: { type: OBJECTIVES.RESCUE, target: 2 },
    maxShots: 24,
    palette: ['red', 'blue', 'green', 'yellow'],
    matrix: buildGrid([
      ['red', 'red', 'blue', 'blue', 'green', 'green', 'green', 'blue', 'blue', 'red', 'red'],
      ['red', 'blue', 'blue', 'green', null, null, 'green', 'blue', 'blue', 'red'],
      ['blue', 'green', jelly(), 'green', null, null, null, 'green', jelly(), 'green', 'blue'],
      ['blue', 'green', 'yellow', 'green', null, null, 'green', 'yellow', 'green', 'blue'],
      [null, 'yellow', 'yellow', null, null, null, null, null, 'yellow', 'yellow', null]
    ]),
    starScoreThresholds: { oneStar: 3500, twoStar: 6500, threeStar: 9500 }
  });

  // Level 6: Twin Peaks — Clear All (4 colors, 22 shots)
  catalog.push({
    id: 6,
    name: 'Sector 6: Twin Peaks',
    world: 'Emerald Lagoon',
    tier: 'Beginner',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 22,
    palette: ['red', 'blue', 'green', 'yellow'],
    matrix: buildGrid([
      ['green', 'green', 'green', 'blue', 'blue', 'yellow', 'blue', 'blue', 'green', 'green', 'green'],
      ['green', 'green', 'blue', 'blue', 'yellow', 'yellow', 'blue', 'blue', 'green', 'green'],
      ['yellow', 'yellow', 'red', 'red', null, null, null, 'red', 'red', 'yellow', 'yellow'],
      ['yellow', 'red', 'red', null, null, null, null, null, 'red', 'red'],
      ['red', 'red', null, null, null, null, null, null, null, 'red', 'red']
    ]),
    starScoreThresholds: { oneStar: 3800, twoStar: 6800, threeStar: 10000 }
  });

  // Level 7: Hanging Vines Rescue (4 colors, 22 shots, 2 Jellies)
  catalog.push({
    id: 7,
    name: 'Sector 7: Hanging Vines',
    world: 'Emerald Lagoon',
    tier: 'Beginner',
    objective: { type: OBJECTIVES.RESCUE, target: 2 },
    maxShots: 22,
    palette: ['red', 'blue', 'green', 'yellow'],
    matrix: buildGrid([
      ['blue', 'blue', 'green', 'green', 'red', 'red', 'red', 'green', 'green', 'blue', 'blue'],
      ['blue', 'green', 'green', 'red', 'yellow', 'yellow', 'red', 'green', 'green', 'blue'],
      ['green', 'red', jelly(), 'yellow', 'yellow', 'yellow', 'yellow', jelly(), 'red', 'green', 'green'],
      ['green', 'red', 'yellow', 'yellow', null, null, 'yellow', 'yellow', 'red', 'green'],
      [null, 'red', 'red', null, null, null, null, null, 'red', 'red', null]
    ]),
    starScoreThresholds: { oneStar: 4000, twoStar: 7200, threeStar: 10500 }
  });

  // Level 8: Prism Chamber — Target Score 6,500 (with 1 Rainbow bubble, 20 shots)
  catalog.push({
    id: 8,
    name: 'Sector 8: Prism Chamber',
    world: 'Emerald Lagoon',
    tier: 'Beginner',
    objective: { type: OBJECTIVES.TARGET_SCORE, target: 6500 },
    maxShots: 20,
    palette: ['red', 'blue', 'green', 'yellow'],
    matrix: buildGrid([
      ['yellow', 'yellow', 'red', 'red', 'blue', 'blue', 'blue', 'red', 'red', 'yellow', 'yellow'],
      ['yellow', 'red', 'red', 'blue', rainbow(), rainbow(), 'blue', 'red', 'red', 'yellow'],
      ['red', 'blue', 'blue', 'green', 'green', 'green', 'green', 'blue', 'blue', 'red', 'red'],
      ['blue', 'green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'green', 'green', 'blue']
    ]),
    starScoreThresholds: { oneStar: 4500, twoStar: 7500, threeStar: 11000 }
  });

  // Level 9: Triple Lagoon Rescue (4 colors, 22 shots, 3 Jellies)
  catalog.push({
    id: 9,
    name: 'Sector 9: Starlight Cove',
    world: 'Emerald Lagoon',
    tier: 'Beginner',
    objective: { type: OBJECTIVES.RESCUE, target: 3 },
    maxShots: 22,
    palette: ['red', 'blue', 'green', 'yellow'],
    matrix: buildGrid([
      ['green', 'green', 'yellow', 'yellow', 'blue', 'blue', 'blue', 'yellow', 'yellow', 'green', 'green'],
      ['green', 'yellow', 'yellow', 'blue', 'red', 'red', 'blue', 'yellow', 'yellow', 'green'],
      ['yellow', jelly(), 'red', 'red', jelly(), 'red', 'red', jelly(), 'yellow', 'green', 'green'],
      ['yellow', 'red', 'red', 'blue', 'blue', 'blue', 'blue', 'red', 'red', 'yellow'],
      [null, 'blue', 'blue', null, null, null, null, null, 'blue', 'blue', null]
    ]),
    starScoreThresholds: { oneStar: 4800, twoStar: 8000, threeStar: 11500 }
  });

  // Level 10: Lagoon Grand Chandelier (Biome 1 Finale — Clear All, 24 shots)
  catalog.push({
    id: 10,
    name: 'Sector 10: Grand Chandelier',
    world: 'Emerald Lagoon',
    tier: 'Beginner',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 24,
    palette: ['red', 'blue', 'green', 'yellow'],
    matrix: buildGrid([
      ['red', 'red', 'blue', 'blue', 'green', 'green', 'green', 'blue', 'blue', 'red', 'red'],
      ['red', 'blue', 'blue', 'green', 'yellow', 'yellow', 'green', 'blue', 'blue', 'red'],
      ['blue', 'green', 'yellow', 'yellow', bomb(), bomb(), 'yellow', 'yellow', 'green', 'blue', 'blue'],
      ['blue', 'green', 'yellow', 'red', 'red', 'red', 'red', 'yellow', 'green', 'blue'],
      [null, 'yellow', 'red', 'red', 'blue', 'blue', 'red', 'red', 'yellow', null, null],
      [null, null, 'red', 'blue', 'blue', 'blue', 'blue', 'red', null, null]
    ]),
    starScoreThresholds: { oneStar: 5200, twoStar: 8500, threeStar: 12500 }
  });

  // =========================================================================
  // BIOME 2: CRYSTAL CAVERNS (Levels 11 to 20)
  // Palette: 5 colors (red, blue, green, yellow, purple)
  // Introducing Stone/Rock bubbles and tactical Bomb bubble breakthroughs
  // =========================================================================

  const PAL_5 = ['red', 'blue', 'green', 'yellow', 'purple'];

  // Level 11: Stone Gate — Clear All (5 colors, 20 shots)
  catalog.push({
    id: 11,
    name: 'Sector 11: Stone Gate',
    world: 'Crystal Caverns',
    tier: 'Easy',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_5,
    matrix: buildGrid([
      ['purple', 'purple', 'blue', 'blue', 'green', 'green', 'green', 'blue', 'blue', 'purple', 'purple'],
      ['purple', 'blue', 'blue', 'green', rock(), rock(), 'green', 'blue', 'blue', 'purple'],
      ['blue', 'green', 'yellow', bomb(), 'yellow', 'yellow', bomb(), 'yellow', 'green', 'blue', 'blue'],
      ['green', 'yellow', 'yellow', 'red', 'red', 'red', 'red', 'yellow', 'yellow', 'green'],
      [null, 'red', 'red', 'purple', 'purple', 'purple', 'purple', 'red', 'red', null, null]
    ]),
    starScoreThresholds: { oneStar: 5500, twoStar: 9000, threeStar: 13000 }
  });

  // Level 12: Geode Grotto Rescue (5 colors, 22 shots, 2 Jellies behind stone shield)
  catalog.push({
    id: 12,
    name: 'Sector 12: Geode Grotto',
    world: 'Crystal Caverns',
    tier: 'Easy',
    objective: { type: OBJECTIVES.RESCUE, target: 2 },
    maxShots: 22,
    palette: PAL_5,
    matrix: buildGrid([
      ['yellow', 'yellow', 'purple', 'purple', 'blue', 'blue', 'blue', 'purple', 'purple', 'yellow', 'yellow'],
      ['yellow', 'purple', 'purple', rock(), 'green', 'green', rock(), 'purple', 'purple', 'yellow'],
      ['purple', 'blue', jelly(), 'green', 'green', 'green', 'green', jelly(), 'blue', 'purple', 'purple'],
      ['purple', 'blue', 'green', bomb(), 'yellow', 'yellow', bomb(), 'green', 'blue', 'purple'],
      [null, 'green', 'yellow', 'yellow', 'red', 'red', 'yellow', 'yellow', 'green', null, null]
    ]),
    starScoreThresholds: { oneStar: 5800, twoStar: 9500, threeStar: 13500 }
  });

  // Level 13: Amethyst Matrix — Target Score 8,500 (20 shots)
  catalog.push({
    id: 13,
    name: 'Sector 13: Amethyst Matrix',
    world: 'Crystal Caverns',
    tier: 'Easy',
    objective: { type: OBJECTIVES.TARGET_SCORE, target: 8500 },
    maxShots: 20,
    palette: PAL_5,
    matrix: buildGrid([
      ['purple', 'purple', 'purple', 'blue', 'blue', 'yellow', 'blue', 'blue', 'purple', 'purple', 'purple'],
      ['purple', 'purple', 'blue', 'yellow', rainbow(), rainbow(), 'yellow', 'blue', 'purple', 'purple'],
      ['blue', 'yellow', 'green', 'green', 'red', 'red', 'green', 'green', 'yellow', 'blue', 'blue'],
      ['yellow', 'green', 'green', 'red', 'red', 'red', 'red', 'green', 'green', 'yellow']
    ]),
    starScoreThresholds: { oneStar: 6000, twoStar: 9800, threeStar: 14000 }
  });

  // Level 14: Zig-Zag Canyon — Clear All (20 shots)
  catalog.push({
    id: 14,
    name: 'Sector 14: Zig-Zag Canyon',
    world: 'Crystal Caverns',
    tier: 'Easy',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_5,
    matrix: buildGrid([
      ['blue', 'blue', 'green', 'green', 'yellow', 'yellow', 'yellow', 'green', 'green', 'blue', 'blue'],
      ['purple', 'purple', 'blue', 'blue', 'green', 'green', 'blue', 'blue', 'purple', 'purple'],
      ['red', 'red', 'purple', 'purple', 'blue', 'blue', 'purple', 'purple', 'red', 'red', 'red'],
      ['yellow', 'yellow', 'red', 'red', bomb(), bomb(), 'red', 'red', 'yellow', 'yellow'],
      [null, 'green', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'green', 'green', null, null]
    ]),
    starScoreThresholds: { oneStar: 6200, twoStar: 10200, threeStar: 14500 }
  });

  // Level 15: Color Hunt Emeralds (Green, target: 14, 22 shots)
  catalog.push({
    id: 15,
    name: 'Sector 15: Emerald Seam',
    world: 'Crystal Caverns',
    tier: 'Easy',
    objective: { type: OBJECTIVES.COLOR_HUNT, target: 14, targetColor: 'green' },
    maxShots: 22,
    palette: PAL_5,
    matrix: buildGrid([
      ['green', 'green', 'blue', 'blue', 'green', 'green', 'green', 'blue', 'blue', 'green', 'green'],
      ['green', 'blue', 'yellow', 'green', 'green', 'green', 'green', 'yellow', 'blue', 'green'],
      ['blue', 'yellow', 'purple', 'purple', 'green', 'green', 'purple', 'purple', 'yellow', 'blue', 'blue'],
      ['yellow', 'purple', 'red', 'red', 'yellow', 'yellow', 'red', 'red', 'purple', 'yellow']
    ]),
    starScoreThresholds: { oneStar: 6500, twoStar: 10500, threeStar: 15000 }
  });

  // Level 16: Deep Grotto Rescue (5 colors, 22 shots, 3 Jellies)
  catalog.push({
    id: 16,
    name: 'Sector 16: Deep Grotto',
    world: 'Crystal Caverns',
    tier: 'Easy',
    objective: { type: OBJECTIVES.RESCUE, target: 3 },
    maxShots: 22,
    palette: PAL_5,
    matrix: buildGrid([
      ['purple', 'purple', 'yellow', 'yellow', 'blue', 'blue', 'blue', 'yellow', 'yellow', 'purple', 'purple'],
      ['purple', 'yellow', jelly(), 'blue', rock(), rock(), 'blue', jelly(), 'yellow', 'purple'],
      ['yellow', 'blue', 'green', 'green', jelly(), 'green', 'green', 'blue', 'yellow', 'purple', 'purple'],
      ['yellow', 'green', 'green', bomb(), 'red', 'red', bomb(), 'green', 'green', 'yellow'],
      [null, 'red', 'red', 'red', 'purple', 'purple', 'red', 'red', 'red', null, null]
    ]),
    starScoreThresholds: { oneStar: 6800, twoStar: 11000, threeStar: 15500 }
  });

  // Level 17: Deep Sapphire Vault — Target Score 10,000 (20 shots)
  catalog.push({
    id: 17,
    name: 'Sector 17: Sapphire Vault',
    world: 'Crystal Caverns',
    tier: 'Easy',
    objective: { type: OBJECTIVES.TARGET_SCORE, target: 10000 },
    maxShots: 20,
    palette: PAL_5,
    matrix: buildGrid([
      ['blue', 'blue', 'blue', 'purple', 'purple', 'green', 'purple', 'purple', 'blue', 'blue', 'blue'],
      ['blue', 'blue', 'purple', 'green', rainbow(), rainbow(), 'green', 'purple', 'blue', 'blue'],
      ['purple', 'green', 'yellow', 'yellow', bomb(), bomb(), 'yellow', 'yellow', 'green', 'purple', 'purple'],
      ['green', 'yellow', 'red', 'red', 'purple', 'purple', 'red', 'red', 'yellow', 'green']
    ]),
    starScoreThresholds: { oneStar: 7200, twoStar: 11500, threeStar: 16000 }
  });

  // Level 18: Crossfire Hex — Clear All (20 shots)
  catalog.push({
    id: 18,
    name: 'Sector 18: Crossfire Hex',
    world: 'Crystal Caverns',
    tier: 'Easy',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_5,
    matrix: buildGrid([
      ['red', 'red', 'yellow', 'yellow', 'purple', 'purple', 'purple', 'yellow', 'yellow', 'red', 'red'],
      ['red', 'yellow', rock(), 'purple', 'blue', 'blue', 'purple', rock(), 'yellow', 'red'],
      ['yellow', 'purple', 'blue', bomb(), 'green', 'green', bomb(), 'blue', 'purple', 'yellow', 'yellow'],
      ['purple', 'blue', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'green', 'blue', 'purple'],
      [null, 'green', 'yellow', 'red', 'red', 'red', 'red', 'yellow', 'green', null, null]
    ]),
    starScoreThresholds: { oneStar: 7500, twoStar: 12000, threeStar: 16500 }
  });

  // Level 19: Falling Stalactites — Drop Bubbles (target: 10, 22 shots)
  catalog.push({
    id: 19,
    name: 'Sector 19: Stalactite Falls',
    world: 'Crystal Caverns',
    tier: 'Easy',
    objective: { type: OBJECTIVES.DROP_BUBBLES, target: 10 },
    maxShots: 22,
    palette: PAL_5,
    matrix: buildGrid([
      ['purple', 'purple', 'green', 'green', 'yellow', 'yellow', 'yellow', 'green', 'green', 'purple', 'purple'],
      ['purple', 'green', null, null, 'yellow', 'yellow', null, null, 'green', 'purple'],
      ['green', null, null, 'blue', 'blue', 'blue', 'blue', null, null, 'green', null],
      [null, null, 'blue', 'red', 'red', 'red', 'red', 'blue', null, null],
      [null, null, null, 'red', rock(), rock(), 'red', null, null, null, null]
    ]),
    starScoreThresholds: { oneStar: 7800, twoStar: 12500, threeStar: 17000 }
  });

  // Level 20: Crystal Cavern Core (Biome 2 Finale — Rescue 3 Jellies, 22 shots)
  catalog.push({
    id: 20,
    name: 'Sector 20: Crystal Cavern Core',
    world: 'Crystal Caverns',
    tier: 'Easy',
    objective: { type: OBJECTIVES.RESCUE, target: 3 },
    maxShots: 22,
    palette: PAL_5,
    matrix: buildGrid([
      ['blue', 'blue', 'purple', 'purple', 'yellow', 'yellow', 'yellow', 'purple', 'purple', 'blue', 'blue'],
      ['blue', 'purple', jelly(), 'yellow', rock(), rock(), 'yellow', jelly(), 'purple', 'blue'],
      ['purple', 'yellow', 'green', 'green', jelly(), 'green', 'green', 'yellow', 'purple', 'blue', 'blue'],
      ['yellow', 'green', 'red', bomb(), 'blue', 'blue', bomb(), 'red', 'green', 'yellow'],
      [null, 'red', 'blue', 'purple', 'purple', 'purple', 'purple', 'blue', 'red', null, null],
      [null, null, 'purple', 'yellow', 'yellow', 'yellow', 'yellow', 'purple', null, null]
    ]),
    starScoreThresholds: { oneStar: 8200, twoStar: 13000, threeStar: 18000 }
  });

  // =========================================================================
  // BIOME 3: MAGMA PEAKS (Levels 21 to 30)
  // Palette: 6 colors (red, blue, green, yellow, purple, orange)
  // Intricate artistic formations (Spiral, Heart, Star, Butterfly)
  // =========================================================================

  const PAL_6 = ['red', 'blue', 'green', 'yellow', 'purple', 'orange'];

  // Level 21: Magma Spiral — Clear All (6 colors, 20 shots)
  catalog.push({
    id: 21,
    name: 'Sector 21: Magma Spiral',
    world: 'Magma Peaks',
    tier: 'Medium',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_6,
    matrix: buildGrid([
      ['orange', 'orange', 'red', 'red', 'yellow', 'yellow', 'yellow', 'red', 'red', 'orange', 'orange'],
      ['orange', 'red', 'yellow', 'purple', 'purple', 'purple', 'purple', 'yellow', 'red', 'orange'],
      ['red', 'yellow', 'purple', 'blue', 'blue', 'blue', 'blue', 'purple', 'yellow', 'red', 'red'],
      ['yellow', 'purple', 'blue', 'green', bomb(), bomb(), 'green', 'blue', 'purple', 'yellow'],
      [null, 'blue', 'green', 'orange', 'orange', 'orange', 'orange', 'green', 'blue', null, null]
    ]),
    starScoreThresholds: { oneStar: 8500, twoStar: 13500, threeStar: 18500 }
  });

  // Level 22: Burning Heart — Clear All (Heart formation, 20 shots)
  catalog.push({
    id: 22,
    name: 'Sector 22: Burning Heart',
    world: 'Magma Peaks',
    tier: 'Medium',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_6,
    matrix: buildGrid([
      ['orange', 'orange', 'red', 'red', null, 'yellow', null, 'red', 'red', 'orange', 'orange'],
      ['orange', 'red', 'red', 'red', 'yellow', 'yellow', 'red', 'red', 'red', 'orange'],
      ['red', 'red', 'purple', 'purple', 'purple', 'purple', 'purple', 'purple', 'red', 'red', 'red'],
      [null, 'purple', 'purple', bomb(), 'blue', 'blue', bomb(), 'purple', 'purple', null],
      [null, null, 'blue', 'blue', 'orange', 'orange', 'blue', 'blue', null, null, null],
      [null, null, null, 'orange', 'red', 'red', 'orange', null, null, null]
    ]),
    starScoreThresholds: { oneStar: 9000, twoStar: 14000, threeStar: 19000 }
  });

  // Level 23: Fire Wall — Target Score 12,000 (20 shots)
  catalog.push({
    id: 23,
    name: 'Sector 23: Fire Wall',
    world: 'Magma Peaks',
    tier: 'Medium',
    objective: { type: OBJECTIVES.TARGET_SCORE, target: 12000 },
    maxShots: 20,
    palette: PAL_6,
    matrix: buildGrid([
      ['orange', 'orange', 'orange', 'red', 'red', 'yellow', 'red', 'red', 'orange', 'orange', 'orange'],
      ['orange', 'red', 'red', 'yellow', rainbow(), rainbow(), 'yellow', 'red', 'red', 'orange'],
      ['red', 'yellow', 'purple', 'purple', bomb(), bomb(), 'purple', 'purple', 'yellow', 'red', 'red'],
      ['yellow', 'purple', 'blue', 'blue', 'green', 'green', 'blue', 'blue', 'purple', 'yellow']
    ]),
    starScoreThresholds: { oneStar: 9500, twoStar: 14500, threeStar: 19500 }
  });

  // Level 24: Solar Star Rescue (2 Jellies inside Star formation, 22 shots)
  catalog.push({
    id: 24,
    name: 'Sector 24: Solar Star',
    world: 'Magma Peaks',
    tier: 'Medium',
    objective: { type: OBJECTIVES.RESCUE, target: 2 },
    maxShots: 22,
    palette: PAL_6,
    matrix: buildGrid([
      ['yellow', 'yellow', 'orange', 'orange', 'red', 'red', 'red', 'orange', 'orange', 'yellow', 'yellow'],
      ['yellow', 'orange', 'red', jelly(), 'purple', 'purple', jelly(), 'red', 'orange', 'yellow'],
      ['orange', 'red', 'purple', 'blue', bomb(), bomb(), 'blue', 'purple', 'red', 'orange', 'orange'],
      ['red', 'purple', 'blue', 'green', 'yellow', 'yellow', 'green', 'blue', 'purple', 'red'],
      [null, 'blue', 'green', 'orange', 'orange', 'orange', 'orange', 'green', 'blue', null, null]
    ]),
    starScoreThresholds: { oneStar: 10000, twoStar: 15000, threeStar: 20000 }
  });

  // Level 25: Lava River — Clear All (20 shots)
  catalog.push({
    id: 25,
    name: 'Sector 25: Lava River',
    world: 'Magma Peaks',
    tier: 'Medium',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_6,
    matrix: buildGrid([
      ['red', 'red', 'orange', 'orange', 'yellow', 'yellow', 'yellow', 'orange', 'orange', 'red', 'red'],
      ['orange', 'orange', 'yellow', 'yellow', 'red', 'red', 'yellow', 'yellow', 'orange', 'orange'],
      ['yellow', 'yellow', 'red', 'red', bomb(), bomb(), 'red', 'red', 'yellow', 'yellow', 'yellow'],
      ['purple', 'purple', 'blue', 'blue', 'green', 'green', 'blue', 'blue', 'purple', 'purple'],
      [null, 'blue', 'green', 'orange', 'orange', 'orange', 'orange', 'green', 'blue', null, null]
    ]),
    starScoreThresholds: { oneStar: 10500, twoStar: 15500, threeStar: 21000 }
  });

  // Level 26: Fire Butterfly — Clear All (Butterfly formation, 20 shots)
  catalog.push({
    id: 26,
    name: 'Sector 26: Fire Butterfly',
    world: 'Magma Peaks',
    tier: 'Medium',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_6,
    matrix: buildGrid([
      ['purple', 'purple', null, 'orange', 'orange', 'red', 'orange', 'orange', null, 'purple', 'purple'],
      ['purple', 'blue', 'blue', 'orange', 'yellow', 'yellow', 'orange', 'blue', 'blue', 'purple'],
      ['blue', 'green', 'green', bomb(), 'yellow', 'yellow', bomb(), 'green', 'green', 'blue', 'blue'],
      ['blue', 'green', null, null, 'purple', 'purple', null, null, 'green', 'blue'],
      [null, 'yellow', 'yellow', null, 'orange', 'orange', null, 'yellow', 'yellow', null, null]
    ]),
    starScoreThresholds: { oneStar: 11000, twoStar: 16000, threeStar: 21500 }
  });

  // Level 27: Volcanic Crater — Target Score 14,000 (20 shots)
  catalog.push({
    id: 27,
    name: 'Sector 27: Volcanic Crater',
    world: 'Magma Peaks',
    tier: 'Medium',
    objective: { type: OBJECTIVES.TARGET_SCORE, target: 14000 },
    maxShots: 20,
    palette: PAL_6,
    matrix: buildGrid([
      ['orange', 'orange', 'red', 'red', 'yellow', 'yellow', 'yellow', 'red', 'red', 'orange', 'orange'],
      ['orange', 'red', rock(), 'yellow', rainbow(), rainbow(), 'yellow', rock(), 'red', 'orange'],
      ['red', 'yellow', 'purple', bomb(), 'blue', 'blue', bomb(), 'purple', 'yellow', 'red', 'red'],
      ['yellow', 'purple', 'blue', 'green', 'green', 'green', 'green', 'blue', 'purple', 'yellow']
    ]),
    starScoreThresholds: { oneStar: 11500, twoStar: 16500, threeStar: 22000 }
  });

  // Level 28: Inferno Chamber Rescue (3 Jellies, 22 shots)
  catalog.push({
    id: 28,
    name: 'Sector 28: Inferno Chamber',
    world: 'Magma Peaks',
    tier: 'Medium',
    objective: { type: OBJECTIVES.RESCUE, target: 3 },
    maxShots: 22,
    palette: PAL_6,
    matrix: buildGrid([
      ['red', 'red', 'orange', 'orange', 'yellow', 'yellow', 'yellow', 'orange', 'orange', 'red', 'red'],
      ['red', 'orange', jelly(), 'yellow', rock(), rock(), 'yellow', jelly(), 'orange', 'red'],
      ['orange', 'yellow', 'purple', 'purple', jelly(), 'purple', 'purple', 'yellow', 'orange', 'red', 'red'],
      ['yellow', 'purple', 'blue', bomb(), 'green', 'green', bomb(), 'blue', 'purple', 'yellow'],
      [null, 'blue', 'green', 'orange', 'orange', 'orange', 'orange', 'green', 'blue', null, null]
    ]),
    starScoreThresholds: { oneStar: 12000, twoStar: 17000, threeStar: 22500 }
  });

  // Level 29: Obsidian Fortress — Clear All (20 shots)
  catalog.push({
    id: 29,
    name: 'Sector 29: Obsidian Fortress',
    world: 'Magma Peaks',
    tier: 'Medium',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_6,
    matrix: buildGrid([
      ['purple', 'purple', 'red', 'red', 'orange', 'orange', 'orange', 'red', 'red', 'purple', 'purple'],
      ['purple', 'red', rock(), 'orange', lightning(), lightning(), 'orange', rock(), 'red', 'purple'],
      ['red', 'orange', 'yellow', bomb(), 'blue', 'blue', bomb(), 'yellow', 'orange', 'red', 'red'],
      ['orange', 'yellow', 'blue', 'green', 'green', 'green', 'green', 'blue', 'yellow', 'orange'],
      [null, 'blue', 'green', 'yellow', 'yellow', 'yellow', 'yellow', 'green', 'blue', null, null]
    ]),
    starScoreThresholds: { oneStar: 12500, twoStar: 17500, threeStar: 23000 }
  });

  // Level 30: Caldera Titan (Biome 3 Finale — Clear All, 22 shots)
  catalog.push({
    id: 30,
    name: 'Sector 30: Caldera Titan',
    world: 'Magma Peaks',
    tier: 'Medium',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 22,
    palette: PAL_6,
    matrix: buildGrid([
      ['orange', 'orange', 'red', 'red', 'yellow', 'yellow', 'yellow', 'red', 'red', 'orange', 'orange'],
      ['orange', 'red', 'yellow', 'purple', rock(), rock(), 'purple', 'yellow', 'red', 'orange'],
      ['red', 'yellow', 'purple', bomb(), 'blue', 'blue', bomb(), 'purple', 'yellow', 'red', 'red'],
      ['yellow', 'purple', 'blue', 'green', rainbow(), rainbow(), 'green', 'blue', 'purple', 'yellow'],
      [null, 'blue', 'green', 'orange', 'red', 'red', 'orange', 'green', 'blue', null, null],
      [null, null, 'orange', 'red', 'yellow', 'yellow', 'red', 'orange', null, null]
    ]),
    starScoreThresholds: { oneStar: 13000, twoStar: 18000, threeStar: 24000 }
  });

  // =========================================================================
  // BIOME 4: STARLIGHT NEBULA (Levels 31 to 40)
  // Palette: 7 colors (red, blue, green, yellow, purple, orange, pink)
  // Master Level Formations (Vortex, Double Helix, Galaxy, Starlight Infinity)
  // =========================================================================

  const PAL_7 = ['red', 'blue', 'green', 'yellow', 'purple', 'orange', 'pink'];

  // Level 31: Astral Gateway — Clear All (20 shots)
  catalog.push({
    id: 31,
    name: 'Sector 31: Astral Gateway',
    world: 'Starlight Nebula',
    tier: 'Hard',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_7,
    matrix: buildGrid([
      ['pink', 'pink', 'purple', 'purple', 'blue', 'blue', 'blue', 'purple', 'purple', 'pink', 'pink'],
      ['pink', 'purple', 'blue', 'green', 'yellow', 'yellow', 'green', 'blue', 'purple', 'pink'],
      ['purple', 'blue', 'green', bomb(), 'orange', 'orange', bomb(), 'green', 'blue', 'purple', 'purple'],
      ['blue', 'green', 'orange', 'red', 'red', 'red', 'red', 'orange', 'green', 'blue'],
      [null, 'orange', 'red', 'pink', 'pink', 'pink', 'pink', 'red', 'orange', null, null]
    ]),
    starScoreThresholds: { oneStar: 13500, twoStar: 18500, threeStar: 25000 }
  });

  // Level 32: Galaxy Vortex Rescue (3 Jellies, 22 shots)
  catalog.push({
    id: 32,
    name: 'Sector 32: Galaxy Vortex',
    world: 'Starlight Nebula',
    tier: 'Hard',
    objective: { type: OBJECTIVES.RESCUE, target: 3 },
    maxShots: 22,
    palette: PAL_7,
    matrix: buildGrid([
      ['pink', 'pink', 'purple', 'purple', 'blue', 'blue', 'blue', 'purple', 'purple', 'pink', 'pink'],
      ['pink', 'purple', jelly(), 'blue', rock(), rock(), 'blue', jelly(), 'purple', 'pink'],
      ['purple', 'blue', 'green', 'green', jelly(), 'green', 'green', 'blue', 'purple', 'pink', 'pink'],
      ['blue', 'green', 'yellow', bomb(), 'orange', 'orange', bomb(), 'yellow', 'green', 'blue'],
      [null, 'yellow', 'orange', 'red', 'red', 'red', 'red', 'orange', 'yellow', null, null]
    ]),
    starScoreThresholds: { oneStar: 14000, twoStar: 19000, threeStar: 26000 }
  });

  // Level 33: Pulsar Array — Target Score 16,000 (20 shots)
  catalog.push({
    id: 33,
    name: 'Sector 33: Pulsar Array',
    world: 'Starlight Nebula',
    tier: 'Hard',
    objective: { type: OBJECTIVES.TARGET_SCORE, target: 16000 },
    maxShots: 20,
    palette: PAL_7,
    matrix: buildGrid([
      ['pink', 'pink', 'purple', 'purple', 'yellow', 'yellow', 'yellow', 'purple', 'purple', 'pink', 'pink'],
      ['pink', 'purple', 'yellow', rainbow(), 'blue', 'blue', rainbow(), 'yellow', 'purple', 'pink'],
      ['purple', 'yellow', 'blue', bomb(), 'green', 'green', bomb(), 'blue', 'yellow', 'purple', 'purple'],
      ['yellow', 'blue', 'green', 'orange', 'orange', 'orange', 'orange', 'green', 'blue', 'yellow']
    ]),
    starScoreThresholds: { oneStar: 14500, twoStar: 19500, threeStar: 27000 }
  });

  // Level 34: Stellar Constellation — Clear All (20 shots)
  catalog.push({
    id: 34,
    name: 'Sector 34: Stellar Constellation',
    world: 'Starlight Nebula',
    tier: 'Hard',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_7,
    matrix: buildGrid([
      ['blue', 'blue', 'pink', 'pink', 'purple', 'purple', 'purple', 'pink', 'pink', 'blue', 'blue'],
      ['blue', 'pink', 'purple', rock(), 'yellow', 'yellow', rock(), 'purple', 'pink', 'blue'],
      ['pink', 'purple', 'yellow', bomb(), 'green', 'green', bomb(), 'yellow', 'purple', 'pink', 'pink'],
      ['purple', 'yellow', 'green', 'orange', 'red', 'red', 'orange', 'green', 'yellow', 'purple'],
      [null, 'green', 'orange', 'red', 'pink', 'pink', 'red', 'orange', 'green', null, null]
    ]),
    starScoreThresholds: { oneStar: 15000, twoStar: 20000, threeStar: 28000 }
  });

  // Level 35: Supernova Core — Drop Bubbles (target: 12, 20 shots)
  catalog.push({
    id: 35,
    name: 'Sector 35: Supernova Core',
    world: 'Starlight Nebula',
    tier: 'Hard',
    objective: { type: OBJECTIVES.DROP_BUBBLES, target: 12 },
    maxShots: 20,
    palette: PAL_7,
    matrix: buildGrid([
      ['pink', 'pink', 'purple', 'purple', 'yellow', 'yellow', 'yellow', 'purple', 'purple', 'pink', 'pink'],
      ['pink', 'purple', null, null, 'yellow', 'yellow', null, null, 'purple', 'pink'],
      ['purple', null, null, 'blue', 'blue', 'blue', 'blue', null, null, 'purple', null],
      [null, null, 'blue', 'green', rock(), rock(), 'green', 'blue', null, null],
      [null, null, null, 'green', 'orange', 'orange', 'green', null, null, null, null]
    ]),
    starScoreThresholds: { oneStar: 15500, twoStar: 20500, threeStar: 29000 }
  });

  // Level 36: Double Helix Rescue (3 Jellies, 22 shots)
  catalog.push({
    id: 36,
    name: 'Sector 36: Double Helix',
    world: 'Starlight Nebula',
    tier: 'Expert',
    objective: { type: OBJECTIVES.RESCUE, target: 3 },
    maxShots: 22,
    palette: PAL_7,
    matrix: buildGrid([
      ['pink', 'pink', 'blue', 'blue', 'purple', 'purple', 'purple', 'blue', 'blue', 'pink', 'pink'],
      ['pink', 'blue', jelly(), 'purple', rock(), rock(), 'purple', jelly(), 'blue', 'pink'],
      ['blue', 'purple', 'green', 'green', jelly(), 'green', 'green', 'purple', 'blue', 'pink', 'pink'],
      ['blue', 'green', 'yellow', bomb(), 'orange', 'orange', bomb(), 'yellow', 'green', 'blue'],
      [null, 'yellow', 'orange', 'red', 'red', 'red', 'red', 'orange', 'yellow', null, null]
    ]),
    starScoreThresholds: { oneStar: 16000, twoStar: 21000, threeStar: 30000 }
  });

  // Level 37: Cosmic Prism — Target Score 18,000 (20 shots)
  catalog.push({
    id: 37,
    name: 'Sector 37: Cosmic Prism',
    world: 'Starlight Nebula',
    tier: 'Expert',
    objective: { type: OBJECTIVES.TARGET_SCORE, target: 18000 },
    maxShots: 20,
    palette: PAL_7,
    matrix: buildGrid([
      ['pink', 'pink', 'purple', 'purple', 'yellow', 'yellow', 'yellow', 'purple', 'purple', 'pink', 'pink'],
      ['pink', 'purple', rainbow(), 'yellow', rock(), rock(), 'yellow', rainbow(), 'purple', 'pink'],
      ['purple', 'yellow', 'blue', bomb(), 'green', 'green', bomb(), 'blue', 'yellow', 'purple', 'purple'],
      ['yellow', 'blue', 'green', 'orange', 'red', 'red', 'orange', 'green', 'blue', 'yellow']
    ]),
    starScoreThresholds: { oneStar: 16500, twoStar: 21500, threeStar: 31000 }
  });

  // Level 38: Quantum Vault — Clear All (20 shots)
  catalog.push({
    id: 38,
    name: 'Sector 38: Quantum Vault',
    world: 'Starlight Nebula',
    tier: 'Expert',
    objective: { type: OBJECTIVES.CLEAR_ALL, target: 0 },
    maxShots: 20,
    palette: PAL_7,
    matrix: buildGrid([
      ['purple', 'purple', 'pink', 'pink', 'blue', 'blue', 'blue', 'pink', 'pink', 'purple', 'purple'],
      ['purple', 'pink', 'blue', rock(), 'green', 'green', rock(), 'blue', 'pink', 'purple'],
      ['pink', 'blue', 'green', bomb(), 'yellow', 'yellow', bomb(), 'green', 'blue', 'pink', 'pink'],
      ['blue', 'green', 'yellow', 'orange', lightning(), lightning(), 'orange', 'yellow', 'green', 'blue'],
      [null, 'yellow', 'orange', 'red', 'pink', 'pink', 'red', 'orange', 'yellow', null, null]
    ]),
    starScoreThresholds: { oneStar: 17000, twoStar: 22000, threeStar: 32000 }
  });

  // Level 39: Singularity Chaser — Limited Shots (18 shots, Clear All)
  catalog.push({
    id: 39,
    name: 'Sector 39: Singularity Chaser',
    world: 'Starlight Nebula',
    tier: 'Expert',
    objective: { type: OBJECTIVES.LIMITED_SHOTS, target: 0 },
    maxShots: 18,
    palette: PAL_7,
    matrix: buildGrid([
      ['pink', 'pink', 'purple', 'purple', 'yellow', 'yellow', 'yellow', 'purple', 'purple', 'pink', 'pink'],
      ['pink', 'purple', 'yellow', bomb(), 'blue', 'blue', bomb(), 'yellow', 'purple', 'pink'],
      ['purple', 'yellow', 'blue', 'green', rainbow(), rainbow(), 'green', 'blue', 'yellow', 'purple', 'purple'],
      ['yellow', 'blue', 'green', 'orange', 'red', 'red', 'orange', 'green', 'blue', 'yellow'],
      [null, 'green', 'orange', 'red', 'pink', 'pink', 'red', 'orange', 'green', null, null]
    ]),
    starScoreThresholds: { oneStar: 17500, twoStar: 22500, threeStar: 33000 }
  });

  // Level 40: Starlight Infinity — Final Master Boss Sector (4 Jellies, 24 shots)
  // Grand Infinity Symbol Formation across 6 rows
  catalog.push({
    id: 40,
    name: 'Sector 40: Starlight Infinity',
    world: 'Starlight Nebula',
    tier: 'Expert',
    objective: { type: OBJECTIVES.RESCUE, target: 4 },
    maxShots: 24,
    palette: PAL_7,
    matrix: buildGrid([
      ['pink', 'pink', 'purple', 'purple', 'yellow', 'yellow', 'yellow', 'purple', 'purple', 'pink', 'pink'],
      ['pink', 'purple', jelly(), 'blue', rock(), rock(), 'blue', jelly(), 'purple', 'pink'],
      ['purple', 'blue', 'green', 'green', rainbow(), rainbow(), 'green', 'green', 'blue', 'purple', 'purple'],
      ['blue', 'green', jelly(), bomb(), 'orange', 'orange', bomb(), jelly(), 'green', 'blue'],
      [null, 'green', 'orange', 'red', 'pink', 'pink', 'red', 'orange', 'green', null, null],
      [null, null, 'orange', 'red', 'yellow', 'yellow', 'red', 'orange', null, null]
    ]),
    starScoreThresholds: { oneStar: 18000, twoStar: 23500, threeStar: 35000 }
  });

  return catalog;
}

export const LEVELS = createHandcraftedLevels();

/**
 * Deterministic Seeded Procedural Level Generator (Levels 41 to 100+)
 */
export function generateProceduralLevel(levelId, seed = null) {
  const prngSeed = seed !== null ? seed : levelId * 7919 + 104729;
  const prng = new SeededPRNG(prngSeed);

  const worldIndex = (Math.floor(levelId / 10)) % WORLDS.length;
  const world = WORLDS[worldIndex];
  const objCycle = [
    OBJECTIVES.CLEAR_ALL,
    OBJECTIVES.RESCUE,
    OBJECTIVES.TARGET_SCORE,
    OBJECTIVES.COLOR_HUNT,
    OBJECTIVES.DROP_BUBBLES
  ];
  const objType = objCycle[(levelId + prng.nextInt(0, 3)) % objCycle.length];

  const paletteSize = Math.min(8, 5 + Math.floor((levelId - 40) / 15));
  const palette = PALETTE_SETS[paletteSize] || PALETTE_SETS[6];
  const occupiedRows = Math.min(8, 5 + Math.floor((levelId - 40) / 20));
  const maxShots = Math.max(14, 26 - Math.floor((levelId - 40) / 12));

  const grid = createEmptyGrid();
  let jellyCount = 0;

  for (let r = 0; r < occupiedRows; r++) {
    const cols = getColsInRow(r);
    for (let c = 0; c < cols; c++) {
      const roll = prng.next();

      if (objType === OBJECTIVES.RESCUE && roll < 0.08 && jellyCount < 4) {
        grid[r][c] = { color: 'cyan', type: SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE };
        jellyCount++;
      } else if (roll < 0.06) {
        grid[r][c] = { color: 'orange', type: SPECIAL_BUBBLES.BOMB };
      } else if (roll < 0.10) {
        grid[r][c] = { color: 'pink', type: SPECIAL_BUBBLES.RAINBOW };
      } else if (roll < 0.13) {
        grid[r][c] = { color: 'yellow', type: SPECIAL_BUBBLES.LIGHTNING };
      } else {
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

  // Guarantee at least 2 jellies on procedural rescue levels
  if (objType === OBJECTIVES.RESCUE && jellyCount === 0) {
    grid[2][3] = { color: 'cyan', type: SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE };
    grid[2][7] = { color: 'cyan', type: SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE };
    jellyCount = 2;
  }

  const baseScore = 15000 + (levelId - 40) * 1200;

  return {
    id: levelId,
    name: `Procedural Sector ${levelId}: ${world}`,
    world,
    tier: 'Master Procedural',
    objective: {
      type: objType,
      target: objType === OBJECTIVES.RESCUE ? jellyCount : (objType === OBJECTIVES.TARGET_SCORE ? 12000 : 0),
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
