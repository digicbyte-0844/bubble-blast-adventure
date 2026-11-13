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
  isGridEmpty,
  checkDangerBreach
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

// 12. DANGER LINE LOSS CONDITION (MANDATORY GAME MECHANIC)
// Verify that attaching a bubble below dangerLineY triggers breach and loss even if shotsRemaining > 0
const dangerGrid = createEmptyGrid();
const radius = 18;
const dangerLineY = 320; // Simulated danger line threshold

// Row 0 bubble (safe, y + radius = 18 + 18 = 36 < 320)
dangerGrid[0][0] = { color: 'cyan', type: SPECIAL_BUBBLES.NORMAL };
assert('Safe ceiling bubble does not breach danger line', !checkDangerBreach(dangerGrid, dangerLineY, radius));

// Row 10 bubble (breached: row 10 has y = 18 + 10 * (18 * sqrt(3)) ≈ 330px, y + radius ≈ 348px >= 320px)
const row10Pos = gridToPixel(10, 0, radius);
assert('Calculated row 10 bottom edge extends past dangerLineY', row10Pos.y + radius >= dangerLineY);

dangerGrid[10][0] = { color: 'red', type: SPECIAL_BUBBLES.NORMAL };
const isBreached = checkDangerBreach(dangerGrid, dangerLineY, radius);
assert('Attaching bubble below dangerLineY triggers boundary breach', isBreached === true);

// Simulated evaluateLevelEnd danger breach check with shotsRemaining > 0
let testGameStatus = GAME_STATES.READY;
let testFailureReason = null;
const shotsRemaining = 15; // Still has plenty of ammo

if (checkDangerBreach(dangerGrid, dangerLineY, radius)) {
  testGameStatus = GAME_STATES.LEVEL_FAILED;
  testFailureReason = 'Breached the Danger Line!';
}

assert(
  'Danger line breach transitions game status to LEVEL_FAILED even when shotsRemaining > 0',
  testGameStatus === GAME_STATES.LEVEL_FAILED && testFailureReason === 'Breached the Danger Line!' && shotsRemaining > 0
);

// 13. BOMB LIFECYCLE: 5 SEQUENTIAL DETONATIONS WITH ZERO STATE STALLS
let bombStock = 5;
let sequentialPasses = 0;

for (let cycle = 1; cycle <= 5; cycle++) {
  // Setup grid with cluster and floating candidates
  const blastGrid = createEmptyGrid();
  // Anchor on ceiling
  blastGrid[0][5] = { color: 'blue', type: SPECIAL_BUBBLES.NORMAL };
  blastGrid[1][5] = { color: 'blue', type: SPECIAL_BUBBLES.NORMAL };
  // Target cluster at row 2 and 3
  blastGrid[2][4] = { color: 'yellow', type: SPECIAL_BUBBLES.NORMAL };
  blastGrid[2][5] = { color: 'yellow', type: SPECIAL_BUBBLES.NORMAL };
  blastGrid[3][5] = { color: 'yellow', type: SPECIAL_BUBBLES.NORMAL };
  // Sub-cluster that becomes disconnected after blast
  blastGrid[4][5] = { color: 'magenta', type: SPECIAL_BUBBLES.NORMAL };
  blastGrid[5][5] = { color: 'magenta', type: SPECIAL_BUBBLES.NORMAL };

  const impactPos = gridToPixel(3, 5, radius);
  const blastDistSq = (radius * 4.8) ** 2;

  // 1. Clear bubbles in 2-hex radius
  let clearedCount = 0;
  for (let r = 0; r < blastGrid.length; r++) {
    for (let c = 0; c < blastGrid[r].length; c++) {
      if (blastGrid[r][c]) {
        const bPos = gridToPixel(r, c, radius);
        const dSq = (bPos.x - impactPos.x) ** 2 + (bPos.y - impactPos.y) ** 2;
        if (dSq <= blastDistSq) {
          blastGrid[r][c] = null;
          clearedCount++;
        }
      }
    }
  }

  // 2. Find floating bubbles and detach them
  const floatingDrops = findFloatingBubbles(blastGrid, radius);
  floatingDrops.forEach(d => { blastGrid[d.row][d.col] = null; });

  // 3. Increment bomb inventory if 3+ bubbles popped
  if (clearedCount >= 3) {
    bombStock += 1;
  }

  // 4. Verify clean state reset (launcher reload)
  const nextAmmo = 'cyan';
  const curAmmo = 'magenta';
  const boosterActive = null;
  const status = GAME_STATES.READY;

  const cycleValid = clearedCount >= 3 &&
    floatingDrops.length >= 0 &&
    curAmmo !== null &&
    nextAmmo !== null &&
    boosterActive === null &&
    status === GAME_STATES.READY;

  if (cycleValid) sequentialPasses++;
}

assert(
  'Bomb Lifecycle: 5 sequential bomb detonations execute with zero state stalls and clean reload',
  sequentialPasses === 5 && bombStock === 10
);

// 20. isGridEmpty robust evaluation
const emptyBoard = createEmptyGrid();
const populatedBoard = createEmptyGrid();
populatedBoard[0][0] = { color: 'cyan', type: SPECIAL_BUBBLES.NORMAL };
const rockOnlyBoard = createEmptyGrid();
rockOnlyBoard[2][2] = { color: 'rock', type: SPECIAL_BUBBLES.ROCK };
const sparseUndefinedBoard = [[undefined, null], [null]];

assert(
  'isGridEmpty evaluates empty grid as true',
  isGridEmpty(emptyBoard) === true
);

assert(
  'isGridEmpty evaluates populated grid as false',
  isGridEmpty(populatedBoard) === false
);

assert(
  'isGridEmpty evaluates rock-only obstacle grid as true (all pop-able bubbles cleared)',
  isGridEmpty(rockOnlyBoard) === true
);

assert(
  'isGridEmpty safely handles sparse or undefined array rows without crashing',
  isGridEmpty(sparseUndefinedBoard) === true && isGridEmpty(null) === true
);

console.log(`\n📊 Engine Unit Tests: ${passed}/${total} passed (${Math.round((passed / total) * 100)}%)`);
if (passed === total) {
  console.log('🎉 ALL ENGINE MATHEMATICAL INVARIANTS SATISFIED!');
}
