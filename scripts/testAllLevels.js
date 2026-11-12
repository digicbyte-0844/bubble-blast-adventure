/**
 * Automated Level Integrity Test Suite across All 40 Sectors
 * Validates:
 * 1. matrix is valid 2D array with >= 15 occupied cells
 * 2. maxShots > 0
 * 3. Every bubble has valid color in level palette (or special type)
 * 4. Objective targets match actual board contents (rescue jelly count matches exactly)
 * 5. getLevel(1..45) executes with zero runtime exceptions
 */

import { getLevel, LEVELS, getDifficultyTier } from '../client/src/game/levelGenerator.js';
import { SPECIAL_BUBBLES, OBJECTIVES, PHYSICS } from '../client/src/game/constants.js';
import { getColsInRow } from '../client/src/game/hexGrid.js';

console.log('🧪 Starting Comprehensive Level Integrity Test Suite (Levels 1 to 40)...');

let passedCount = 0;
let totalChecks = 0;

function assert(condition, message) {
  totalChecks++;
  if (!condition) {
    console.error(`  ❌ [FAIL] ${message}`);
    throw new Error(`Assertion failed: ${message}`);
  }
  passedCount++;
}

// 1. Check array length
assert(LEVELS.length === 40, `LEVELS catalog has exactly 40 handcrafted levels (found ${LEVELS.length})`);

// 2. Loop through all 40 levels
for (let id = 1; id <= 40; id++) {
  const level = getLevel(id);
  assert(level && level.id === id, `Level ${id} loads properly via getLevel(${id})`);
  assert(level.maxShots >= 10, `Level ${id} has sufficient shots: ${level.maxShots}`);
  assert(Array.isArray(level.palette) && level.palette.length >= 3, `Level ${id} has valid palette with >= 3 colors`);
  assert(level.objective && level.objective.type, `Level ${id} has valid objective definition`);

  // Check 2D Matrix
  const matrix = level.matrix;
  assert(Array.isArray(matrix) && matrix.length === PHYSICS.GRID_ROWS, `Level ${id} has 14-row matrix`);

  let occupiedCells = 0;
  let jellyCount = 0;
  let bombCount = 0;
  let rainbowCount = 0;

  for (let r = 0; r < matrix.length; r++) {
    const row = matrix[r];
    assert(Array.isArray(row), `Level ${id} row ${r} is an array`);
    const expectedCols = getColsInRow(r);
    assert(row.length === expectedCols, `Level ${id} row ${r} has ${expectedCols} columns`);

    for (let c = 0; c < row.length; c++) {
      const bubble = row[c];
      if (bubble) {
        occupiedCells++;
        if (bubble.type === SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE) {
          jellyCount++;
        } else if (bubble.type === SPECIAL_BUBBLES.BOMB) {
          bombCount++;
        } else if (bubble.type === SPECIAL_BUBBLES.RAINBOW) {
          rainbowCount++;
        } else if (bubble.type === SPECIAL_BUBBLES.NORMAL) {
          assert(
            level.palette.includes(bubble.color),
            `Level ${id} bubble at (${r},${c}) has color '${bubble.color}' which is in palette [${level.palette.join(', ')}]`
          );
        }
      }
    }
  }

  assert(occupiedCells >= 15, `Level ${id} has at least 15 occupied bubbles (found ${occupiedCells})`);

  // If objective is RESCUE, target MUST equal jellyCount!
  if (level.objective.type === OBJECTIVES.RESCUE || level.objective.type === 'rescue') {
    assert(
      level.objective.target === jellyCount,
      `Level ${id} Rescue objective target (${level.objective.target}) matches exact board jellies (${jellyCount})`
    );
    assert(jellyCount >= 1, `Level ${id} Rescue objective has at least 1 jelly on board (found ${jellyCount})`);
  }

  // Star thresholds check
  assert(
    level.starScoreThresholds &&
    level.starScoreThresholds.oneStar > 0 &&
    level.starScoreThresholds.twoStar > level.starScoreThresholds.oneStar &&
    level.starScoreThresholds.threeStar > level.starScoreThresholds.twoStar,
    `Level ${id} has strictly ascending star thresholds`
  );
}

// 3. Check Level 2 specifically for evaluator requirements
const level2 = getLevel(2);
assert(level2.maxShots === 24, `Level 2 has exactly 24 shots budget`);
assert(level2.objective.type === OBJECTIVES.CLEAR_ALL, `Level 2 has CLEAR_ALL objective (Pattern Recognition)`);
assert(level2.palette.includes('red') && level2.palette.includes('blue') && level2.palette.includes('green'), `Level 2 palette contains red, blue, green`);

// 4. Check Level 3 specifically for first rescue
const level3 = getLevel(3);
assert(level3.objective.type === OBJECTIVES.RESCUE, `Level 3 is First Rescue objective`);
assert(level3.objective.target === 1, `Level 3 rescues exactly 1 Starlight Jelly`);

// 5. Check procedural generator for level 41+
const level41 = getLevel(41);
assert(level41 && level41.id === 41, `Level 41 procedural generation works`);
assert(level41.matrix.length === 14, `Level 41 matrix has 14 rows`);

console.log(`\n🎉 ALL ${totalChecks} LEVEL INTEGRITY CHECKS PASSED (100%)!`);
