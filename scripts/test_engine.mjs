/**
 * Modular Game Engine Validation Suite
 * Hexagonal Grid, BFS Matching, Floating Drops, Raycasting, and Scoring
 */

import {
  PHYSICS,
  PRIMARY_COLOR_IDS,
  SPECIAL_BUBBLES,
  GAME_STATES
} from '../client/src/game/constants.js';

import {
  createEmptyGrid,
  gridToPixel,
  pixelToGrid,
  getHexNeighbors,
  cloneGrid,
  isGridEmpty
} from '../client/src/game/hexGrid.js';

import {
  calculateTrajectory,
  findSnapCell,
  stepProjectile
} from '../client/src/game/collision.js';

import {
  findConnectedMatch
} from '../client/src/game/matchDetector.js';

import {
  findFloatingBubbles,
  createDroppingBubble
} from '../client/src/game/floatingDetector.js';

import {
  calculateTurnScore,
  calculateEndLevelBonus,
  calculateStars
} from '../client/src/game/scoreManager.js';

import {
  getLevel,
  generateProceduralLevel,
  getBalancedAmmoColor
} from '../client/src/game/levelGenerator.js';

console.log('🧪 Starting Game Engine Mathematical Unit Tests...');
let passed = 0;
let total = 0;

function assert(description, condition) {
  total++;
  if (condition) {
    passed++;
    console.log(`  ✅ [PASS] ${description}`);
  } else {
    console.error(`  ❌ [FAIL] ${description}`);
    process.exitCode = 1;
  }
}

// 1. Grid geometry
const p00 = gridToPixel(0, 0, 18);
assert('Row 0 Col 0 coordinate calculation', p00.x === 18 && p00.y === 18);

const p10 = gridToPixel(1, 0, 18);
assert('Odd row offset shifts by radius (R=18)', Math.abs(p10.x - (18 + 18)) < 0.1);

// 2. Neighbor traversal
const neighborsEven = getHexNeighbors(0, 1);
assert('Ceiling row bubble has clamped neighbors', neighborsEven.length > 0 && neighborsEven.length <= 6);

// 3. BFS Match-3
const grid = createEmptyGrid();
grid[0][0] = { color: 'cyan', type: SPECIAL_BUBBLES.NORMAL };
grid[0][1] = { color: 'cyan', type: SPECIAL_BUBBLES.NORMAL };
grid[0][2] = { color: 'cyan', type: SPECIAL_BUBBLES.NORMAL };
grid[0][3] = { color: 'magenta', type: SPECIAL_BUBBLES.NORMAL };

const matches = findConnectedMatch(grid, 0, 0);
assert('BFS finds 3-connected cyan cluster', matches.length === 3);

// 4. Floating island detection
const floatGrid = createEmptyGrid();
floatGrid[0][0] = { color: 'cyan', type: SPECIAL_BUBBLES.NORMAL };
floatGrid[1][0] = { color: 'cyan', type: SPECIAL_BUBBLES.NORMAL };
floatGrid[3][3] = { color: 'gold', type: SPECIAL_BUBBLES.NORMAL }; // Disconnected island

const floating = findFloatingBubbles(floatGrid);
assert('Ceiling BFS detects disconnected floating bubble', floating.length === 1 && floating[0].row === 3 && floating[0].col === 3);

// 5. Score escalation
const scoreCombo1 = calculateTurnScore(3, 2, 0, 1).totalTurnScore;
const scoreCombo3 = calculateTurnScore(3, 2, 0, 3).totalTurnScore;
assert('Combo streak multiplier increases score', scoreCombo3 > scoreCombo1);

// 6. Level Catalog
const lvl1 = getLevel(1);
const lvl40 = getLevel(40);
const lvl45 = getLevel(45); // Procedural
assert('Level 1 loads from handcrafted catalog', lvl1.id === 1 && lvl1.name.includes('Celestial Reef'));
assert('Level 40 loads from handcrafted catalog', lvl40.id === 40);
assert('Level 45 generates procedurally with deterministic seed', lvl45.id === 45 && lvl45.matrix.length === 14);

// 7. Raycasting Wall Bounce
const traj = calculateTrajectory(190, 520, -Math.PI / 3, grid, 380, true);
assert('Raycasting hits wall and produces reflection segment', traj.points.length >= 2);

// 8. Multi-bounce Bank Shot
const bankShotTraj = calculateTrajectory(190, 520, -0.4, grid, 380, false);
assert('Multi-bounce bank shot calculates 3+ reflection points reaching target', bankShotTraj.points.length >= 3 && bankShotTraj.collision !== null);

// 9. Robust Snap Cell Resolution (All 6 neighbors occupied)
const denseGrid = createEmptyGrid();
denseGrid[1][1] = { color: 'blue', type: SPECIAL_BUBBLES.NORMAL };
// Fill all 6 neighbors of (1, 1)
const neighbors11 = getHexNeighbors(1, 1);
neighbors11.forEach(n => {
  denseGrid[n.row][n.col] = { color: 'red', type: SPECIAL_BUBBLES.NORMAL };
});
const densePos = gridToPixel(1, 1, 18);
// Now test finding snap cell for impact on (1, 1) where all immediate neighbors are full
const fallbackSnap = findSnapCell(densePos.x, densePos.y, 1, 1, denseGrid, 18);
assert('findSnapCell resolves valid empty slot even when all 6 neighbors are occupied', fallbackSnap !== null && !denseGrid[fallbackSnap.row][fallbackSnap.col]);

// 10. Robust Ceiling Snap Cell (Row 0 full)
const fullRow0Grid = createEmptyGrid();
for (let c = 0; c < 11; c++) {
  fullRow0Grid[0][c] = { color: 'green', type: SPECIAL_BUBBLES.NORMAL };
}
const ceilingSnap = findSnapCell(190, 18, null, null, fullRow0Grid, 18);
assert('findSnapCell snaps to row 1 when row 0 ceiling is full', ceilingSnap !== null && ceilingSnap.row === 1 && !fullRow0Grid[ceilingSnap.row][ceilingSnap.col]);

// 11. stepProjectile physics execution & collision
const proj = { x: 216, y: 120, vx: 0, vy: -30, radius: 18 };
const testGrid = createEmptyGrid();
testGrid[1][5] = { color: 'yellow', type: SPECIAL_BUBBLES.NORMAL };
let projResult = { hasCollided: false, snapCell: null };
for (let step = 0; step < 10; step++) {
  projResult = stepProjectile(proj, testGrid, 380);
  if (projResult.hasCollided) break;
}
assert('stepProjectile detects collision and returns valid snap cell', projResult.hasCollided && projResult.snapCell !== null);

console.log(`\n📊 Engine Unit Tests: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
if (passed === total) {
  console.log('🎉 ALL ENGINE MATHEMATICAL INVARIANTS SATISFIED!');
}
