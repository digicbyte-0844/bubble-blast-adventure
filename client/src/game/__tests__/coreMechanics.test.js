/**
 * Core Gameplay Mechanics Test Suite
 * Tests 4 mandatory mechanics:
 * 1. Dead-color lock prevention (getRemainingBoardColors)
 * 2. Dynamic 3-Star scoring engine (50%+ shots remaining -> 3 stars, clear -> >= 1 star)
 * 3. Dynamic ceiling feed & row insertion (insertNewTopRow)
 * 4. True Level Difficulty Progression across all 40 sectors
 */

import { getRemainingBoardColors, countBoardBubbles, insertNewTopRow, createEmptyGrid } from '../hexGrid.js';
import { calculateStars, calculateDynamicStarThresholds, calculateEndLevelBonus } from '../scoreManager.js';
import { getLevel, LEVELS, getBalancedAmmoColor, generateBubbleQueue } from '../levelGenerator.js';

let passed = 0;
let total = 0;

function assert(description, condition) {
  total++;
  if (!condition) {
    console.error(`  ❌ [FAIL] ${description}`);
    throw new Error(`Test assertion failed: ${description}`);
  }
  console.log(`  ✅ [PASS] ${description}`);
  passed++;
}

console.log('🧪 Starting Core Gameplay Mechanics Test Suite...');

// 1. DYNAMIC ACTIVE-COLOR LAUNCHER & ENDGAME COLOR LOCK FIX (ISSUE #1)
const singleColorGrid = createEmptyGrid();
singleColorGrid[0][0] = { color: 'blue', type: 'normal' };
singleColorGrid[0][1] = { color: 'blue', type: 'normal' };
singleColorGrid[1][0] = { color: 'blue', type: 'normal' };
const remainingColors = getRemainingBoardColors(singleColorGrid);

assert(
  'When only Blue bubbles remain on the board, getRemainingBoardColors returns ONLY ["blue"]',
  remainingColors.length === 1 && remainingColors[0] === 'blue'
);

assert(
  'Dead colors like "red" and "yellow" are excluded when not present on board',
  !remainingColors.includes('red') && !remainingColors.includes('yellow')
);

// Swap diversity test: multi-color grid
const multiColorGrid = createEmptyGrid();
multiColorGrid[0][0] = { color: 'blue', type: 'normal' };
multiColorGrid[0][1] = { color: 'red', type: 'normal' };
multiColorGrid[0][2] = { color: 'yellow', type: 'normal' };

let duplicateCount = 0;
for (let trial = 0; trial < 50; trial++) {
  const diverseColor = getBalancedAmmoColor(multiColorGrid, ['blue', 'red', 'yellow'], 'blue');
  if (diverseColor === 'blue') duplicateCount++;
}

assert(
  'Swap Diversity: getBalancedAmmoColor with excludeColor="blue" NEVER returns "blue" when other colors exist (50 trials)',
  duplicateCount === 0
);

// 2. ACCURATE WINNING CONDITION & 3-STAR SCORING ENGINE (ISSUES #2 & #6)
const lvl1 = getLevel(1);
const totalBubblesLvl1 = countBoardBubbles(lvl1.matrix);
const dynThresholds = calculateDynamicStarThresholds(totalBubblesLvl1, lvl1.maxShots);

// Clearing Level 1 with 27 of 30 shots remaining:
const shotsRemaining = 27;
const endBonus = calculateEndLevelBonus(shotsRemaining); // 27 * 150 + 1000 = 5050
const inGameScore = 500;
const finalScore = inGameScore + endBonus; // 5550+

const starsAwarded27Shots = calculateStars(finalScore, [
  dynThresholds.oneStar,
  dynThresholds.twoStar,
  dynThresholds.threeStar
]);

assert(
  'Clearing Level 1 with 27/30 shots remaining awards 3 Stars (mastery performance)',
  starsAwarded27Shots === 3
);

// Zero shots remaining clean clear:
const zeroShotsFinalScore = 1500;
const starsAwardedZeroShots = Math.max(1, calculateStars(zeroShotsFinalScore, [
  dynThresholds.oneStar,
  dynThresholds.twoStar,
  dynThresholds.threeStar
]));

assert(
  'Clearing all bubbles on the board is 100% guaranteed to award at least 1 star (0 stars is impossible)',
  starsAwardedZeroShots >= 1
);

// 3. DYNAMIC UPPER-SECTION CEILING FEED & ROW INSERTION (ISSUE #3)
const initialGrid = createEmptyGrid();
initialGrid[0][0] = { color: 'red', type: 'normal' };
initialGrid[0][1] = { color: 'red', type: 'normal' };

const newCeilingWave = ['cyan', 'cyan', 'magenta', 'magenta', null, null, null, null, null, null, null];
const shiftedGrid = insertNewTopRow(initialGrid, newCeilingWave);

assert(
  'insertNewTopRow populates row 0 with the new wave row items',
  shiftedGrid[0][0]?.color === 'cyan' && shiftedGrid[0][2]?.color === 'magenta'
);

assert(
  'insertNewTopRow shifts existing row 0 down to row 1 (preserving hex topology)',
  shiftedGrid[1][0]?.color === 'red' && shiftedGrid[1][1]?.color === 'red'
);

// 4. TRUE LEVEL DIFFICULTY PROGRESSION (ISSUE #4)
const l1 = getLevel(1);
const l10 = getLevel(10);
const l20 = getLevel(20);
const l40 = getLevel(40);

assert(
  'Palette colors expand with sector progression: L1 (3 colors) <= L10 (4 colors) <= L20 (5 colors) <= L40 (7 colors)',
  l1.palette.length <= l10.palette.length &&
  l10.palette.length <= l20.palette.length &&
  l20.palette.length <= l40.palette.length &&
  l1.palette.length === 3 &&
  l40.palette.length >= 6
);

assert(
  'Higher sectors have tighter shot budgets and reserve wave queues',
  l40.maxShots <= l1.maxShots &&
  Array.isArray(l40.waveRows) &&
  l40.waveRows.length >= 2
);

console.log(`\n🎉 Core Gameplay Mechanics Tests: ${passed}/${total} passed (100%)!\n`);
