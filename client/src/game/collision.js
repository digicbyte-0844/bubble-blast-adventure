/**
 * Ballistics, Collision Detection & Trajectory Raycasting
 * Bubble Puzzle Engine Engine
 */

import { PHYSICS } from './constants.js';
import {
  gridToPixel,
  pixelToGrid,
  getHexNeighbors,
  isValidCell,
  getColsInRow
} from './hexGrid.js';

/**
 * Circle-to-circle collision test between two circular bodies
 */
export function checkCircleCollision(x1, y1, r1, x2, y2, r2) {
  const dx = x1 - x2;
  const dy = y1 - y2;
  const distSq = dx * dx + dy * dy;
  const radSum = r1 + r2;
  return distSq <= radSum * radSum;
}

/**
 * Clamps launcher aim angle strictly between [-168°, -12°] to prevent downward shots
 */
export function clampAimAngle(angle) {
  let a = angle;
  // Normalize angle to [-PI, PI]
  while (a <= -Math.PI) a += 2 * Math.PI;
  while (a > Math.PI) a -= 2 * Math.PI;

  return Math.max(PHYSICS.MIN_AIM_ANGLE, Math.min(PHYSICS.MAX_AIM_ANGLE, a));
}

/**
 * Finds the optimal empty hex cell to snap the colliding projectile into
 *
 * @param {number} impactX - Projectile impact X
 * @param {number} impactY - Projectile impact Y
 * @param {number|null} hitRow - Row of the bubble impacted, or null if hit ceiling
 * @param {number|null} hitCol - Col of the bubble impacted, or null if hit ceiling
 * @param {Array<Array>} grid - 14-row Odd-R grid matrix
 * @param {number} radius - Bubble radius
 * @param {number} xOffset - Arena left offset
 * @param {number} yOffset - Arena top offset
 * @returns {{ row: number, col: number, x: number, y: number }|null} Target snap slot
 */
export function findSnapCell(
  impactX,
  impactY,
  hitRow,
  hitCol,
  grid,
  radius = PHYSICS.DEFAULT_BUBBLE_RADIUS,
  xOffset = 0,
  yOffset = 0
) {
  // If projectile hit the top ceiling without hitting another bubble first
  if (hitRow === null || hitCol === null) {
    const colsInRow0 = getColsInRow(0);
    let bestCol = 0;
    let minDistance = Infinity;

    for (let c = 0; c < colsInRow0; c++) {
      if (!grid[0][c]) {
        const p = gridToPixel(0, c, radius, xOffset, yOffset);
        const dist = Math.abs(impactX - p.x);
        if (dist < minDistance) {
          minDistance = dist;
          bestCol = c;
        }
      }
    }

    const snapPixel = gridToPixel(0, bestCol, radius, xOffset, yOffset);
    return { row: 0, col: bestCol, x: snapPixel.x, y: snapPixel.y };
  }

  // Hit an existing bubble: examine all 6 hex neighbors for the closest unoccupied slot
  const candidateNeighbors = getHexNeighbors(hitRow, hitCol);
  let bestSlot = null;
  let minDistanceSq = Infinity;

  for (const n of candidateNeighbors) {
    if (!grid[n.row][n.col]) {
      const p = gridToPixel(n.row, n.col, radius, xOffset, yOffset);
      const dSq = (impactX - p.x) ** 2 + (impactY - p.y) ** 2;
      if (dSq < minDistanceSq) {
        minDistanceSq = dSq;
        bestSlot = { row: n.row, col: n.col, x: p.x, y: p.y };
      }
    }
  }

  // Fallback: If all adjacent slots around the hit bubble are occupied, check global nearest empty cell
  if (!bestSlot) {
    const fallback = pixelToGrid(impactX, impactY, radius, xOffset, yOffset);
    if (!grid[fallback.row][fallback.col]) {
      const p = gridToPixel(fallback.row, fallback.col, radius, xOffset, yOffset);
      return { row: fallback.row, col: fallback.col, x: p.x, y: p.y };
    }
  }

  return bestSlot;
}

/**
 * Calculates parametric predictive trajectory raycast with wall reflections
 *
 * @param {number} startX - Launcher center X
 * @param {number} startY - Launcher center Y
 * @param {number} angleRad - Aim angle in radians
 * @param {Array<Array>} grid - Active Odd-R bubble grid
 * @param {number} arenaWidth - Total width of playable canvas
 * @param {boolean} isSuperAim - If true, permits 2 bounces and calculates landing target circle
 * @param {number} radius - Bubble radius
 * @param {number} xOffset - Canvas left padding
 * @param {number} yOffset - Canvas top padding
 * @returns {{
 *   points: Array<{ x: number, y: number }>,
 *   collision: { x: number, y: number, hitRow: number|null, hitCol: number|null }|null,
 *   landingTarget: { row: number, col: number, x: number, y: number }|null,
 *   bounces: number
 * }}
 */
export function calculateTrajectory(
  startX,
  startY,
  angleRad,
  grid,
  arenaWidth,
  isSuperAim = false,
  radius = PHYSICS.DEFAULT_BUBBLE_RADIUS,
  xOffset = 0,
  yOffset = 0
) {
  const clampedAngle = clampAimAngle(angleRad);
  const maxBounces = isSuperAim ? PHYSICS.SUPER_AIM_BOUNCES : PHYSICS.NORMAL_MAX_BOUNCES;

  const leftWall = xOffset + radius;
  const rightWall = arenaWidth - xOffset - radius;
  const ceilingY = yOffset + radius;

  let currentX = startX;
  let currentY = startY;
  let dirX = Math.cos(clampedAngle);
  let dirY = Math.sin(clampedAngle);

  const points = [{ x: currentX, y: currentY }];
  let bounceCount = 0;
  let collisionEvent = null;
  let landingTarget = null;

  const stepDistance = 4; // Sub-pixel precision raymarch step
  const maxRaySteps = 600; // Hard cutoff to prevent runaway loops

  // Pre-filter active bubbles to optimize collision lookups
  const activeBubbles = [];
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c]) {
        const pos = gridToPixel(r, c, radius, xOffset, yOffset);
        activeBubbles.push({ row: r, col: c, x: pos.x, y: pos.y });
      }
    }
  }

  const collisionDistSq = (2 * radius * PHYSICS.COLLISION_TOLERANCE) ** 2;

  for (let step = 0; step < maxRaySteps; step++) {
    currentX += dirX * stepDistance;
    currentY += dirY * stepDistance;

    // 1. Wall Reflection Check (Left Wall)
    if (currentX <= leftWall && dirX < 0) {
      currentX = leftWall;
      dirX = -dirX;
      bounceCount++;
      points.push({ x: currentX, y: currentY });
      if (bounceCount > maxBounces) break;
    }

    // 2. Wall Reflection Check (Right Wall)
    if (currentX >= rightWall && dirX > 0) {
      currentX = rightWall;
      dirX = -dirX;
      bounceCount++;
      points.push({ x: currentX, y: currentY });
      if (bounceCount > maxBounces) break;
    }

    // 3. Bubble Collision Check
    let hitBubble = null;
    for (let i = 0; i < activeBubbles.length; i++) {
      const b = activeBubbles[i];
      const dSq = (currentX - b.x) ** 2 + (currentY - b.y) ** 2;
      if (dSq <= collisionDistSq) {
        hitBubble = b;
        break;
      }
    }

    if (hitBubble) {
      collisionEvent = {
        x: currentX,
        y: currentY,
        hitRow: hitBubble.row,
        hitCol: hitBubble.col
      };
      points.push({ x: currentX, y: currentY });
      break;
    }

    // 4. Ceiling Collision Check
    if (currentY <= ceilingY) {
      collisionEvent = {
        x: currentX,
        y: ceilingY,
        hitRow: null,
        hitCol: null
      };
      points.push({ x: currentX, y: ceilingY });
      break;
    }
  }

  // Calculate target snap slot for landing preview
  if (collisionEvent) {
    landingTarget = findSnapCell(
      collisionEvent.x,
      collisionEvent.y,
      collisionEvent.hitRow,
      collisionEvent.hitCol,
      grid,
      radius,
      xOffset,
      yOffset
    );
  }

  return {
    points,
    collision: collisionEvent,
    landingTarget,
    bounces: bounceCount
  };
}

/**
 * Updates a moving projectile's continuous physics step
 *
 * @param {{ x: number, y: number, vx: number, vy: number, radius: number }} projectile
 * @param {Array<Array>} grid - 14-row Odd-R grid
 * @param {number} arenaWidth - Total width
 * @param {number} xOffset - Left padding
 * @param {number} yOffset - Top padding
 * @returns {{
 *   hasCollided: boolean,
 *   collision: { x: number, y: number, hitRow: number|null, hitCol: number|null }|null,
 *   snapCell: { row: number, col: number, x: number, y: number }|null
 * }}
 */
export function stepProjectile(
  projectile,
  grid,
  arenaWidth,
  xOffset = 0,
  yOffset = 0
) {
  const radius = projectile.radius || PHYSICS.DEFAULT_BUBBLE_RADIUS;
  const leftWall = xOffset + radius;
  const rightWall = arenaWidth - xOffset - radius;
  const ceilingY = yOffset + radius;

  // Sub-step movement in increments of at most 6px to prevent tunneling at high velocities
  const totalSpeed = Math.hypot(projectile.vx, projectile.vy);
  const maxStepDist = Math.min(6, radius * 0.35);
  const numSteps = Math.max(1, Math.ceil(totalSpeed / maxStepDist));
  let stepVx = projectile.vx / numSteps;
  const stepVy = projectile.vy / numSteps;

  const collisionDistSq = (2 * radius * PHYSICS.COLLISION_TOLERANCE) ** 2;

  for (let s = 0; s < numSteps; s++) {
    projectile.x += stepVx;
    projectile.y += stepVy;

    // 1. Left wall bounce
    if (projectile.x <= leftWall) {
      projectile.x = leftWall;
      projectile.vx = Math.abs(projectile.vx);
      stepVx = Math.abs(stepVx);
    }

    // 2. Right wall bounce
    if (projectile.x >= rightWall) {
      projectile.x = rightWall;
      projectile.vx = -Math.abs(projectile.vx);
      stepVx = -Math.abs(stepVx);
    }

    // 3. Ceiling collision
    if (projectile.y <= ceilingY) {
      projectile.y = ceilingY;
      const snapCell = findSnapCell(projectile.x, projectile.y, null, null, grid, radius, xOffset, yOffset);
      return {
        hasCollided: true,
        collision: { x: projectile.x, y: ceilingY, hitRow: null, hitCol: null },
        snapCell
      };
    }

    // 4. Bubble-to-bubble collision
    for (let r = 0; r < grid.length; r++) {
      for (let c = 0; c < grid[r].length; c++) {
        if (grid[r][c]) {
          const pos = gridToPixel(r, c, radius, xOffset, yOffset);
          const dSq = (projectile.x - pos.x) ** 2 + (projectile.y - pos.y) ** 2;
          if (dSq <= collisionDistSq) {
            const snapCell = findSnapCell(projectile.x, projectile.y, r, c, grid, radius, xOffset, yOffset);
            return {
              hasCollided: true,
              collision: { x: projectile.x, y: projectile.y, hitRow: r, hitCol: c },
              snapCell
            };
          }
        }
      }
    }
  }

  return {
    hasCollided: false,
    collision: null,
    snapCell: null
  };
}

export default {
  checkCircleCollision,
  clampAimAngle,
  findSnapCell,
  calculateTrajectory,
  stepProjectile
};
