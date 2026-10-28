/**
 * Floating Island Detection & Gravity Drop Physics (Ceiling-Anchored BFS)
 * Bubble Puzzle Engine Engine
 */

import { PHYSICS } from './constants.js';
import { getHexNeighbors, gridToPixel } from './hexGrid.js';

/**
 * Executes a ceiling-anchored BFS starting exclusively from Row 0 (ceiling)
 * Identifies all unsupported disconnected bubble clusters.
 *
 * @param {Array<Array>} grid - 14-row Odd-R bubble grid
 * @param {number} radius - Bubble radius
 * @param {number} xOffset - Left padding
 * @param {number} yOffset - Top padding
 * @returns {Array<{ row: number, col: number, bubble: object, x: number, y: number }>}
 */
export function findFloatingBubbles(
  grid,
  radius = PHYSICS.DEFAULT_BUBBLE_RADIUS,
  xOffset = 0,
  yOffset = 0
) {
  const anchored = new Set();
  const queue = [];

  // 1. Seed queue with all occupied bubbles in Row 0 (the ceiling anchor)
  const row0Cols = grid[0]?.length || 0;
  for (let c = 0; c < row0Cols; c++) {
    if (grid[0][c]) {
      const key = `0,${c}`;
      anchored.add(key);
      queue.push({ row: 0, col: c });
    }
  }

  // 2. Multi-source BFS outward from ceiling
  while (queue.length > 0) {
    const current = queue.shift();
    const neighbors = getHexNeighbors(current.row, current.col);

    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (!anchored.has(key) && grid[n.row]?.[n.col]) {
        anchored.add(key);
        queue.push(n);
      }
    }
  }

  // 3. Sweep all occupied grid cells; any non-anchored bubble is a floating drop
  const floatingBubbles = [];

  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] && !anchored.has(`${r},${c}`)) {
        const pos = gridToPixel(r, c, radius, xOffset, yOffset);
        floatingBubbles.push({
          row: r,
          col: c,
          bubble: grid[r][c],
          x: pos.x,
          y: pos.y
        });
      }
    }
  }

  return floatingBubbles;
}

/**
 * Factory creating dynamic physics entities for dropped bubbles with mass, rotation, and drift
 * Robust overload handling: (bubble, x, y, radius) or (row, col, x, y, bubble)
 */
export function createDroppingBubble(arg1, arg2, arg3, arg4, arg5) {
  let bubble, x, y, radius;

  if (typeof arg1 === 'object' && arg1 !== null) {
    bubble = arg1;
    x = typeof arg2 === 'number' ? arg2 : 0;
    y = typeof arg3 === 'number' ? arg3 : 0;
    radius = typeof arg4 === 'number' ? arg4 : PHYSICS.DEFAULT_BUBBLE_RADIUS;
  } else {
    // If called with (row, col, x, y, bubble)
    bubble = (typeof arg5 === 'object' && arg5 !== null) ? arg5 : { color: 'cyan', type: 'normal' };
    x = typeof arg3 === 'number' ? arg3 : 0;
    y = typeof arg4 === 'number' ? arg4 : 0;
    radius = PHYSICS.DEFAULT_BUBBLE_RADIUS;
  }

  return {
    ...bubble,
    bubble: bubble, // Guarantee both fb.color and fb.bubble.color work
    color: bubble.color || 'cyan',
    type: bubble.type || 'normal',
    x,
    y,
    radius,
    vx: (Math.random() - 0.5) * 4, // Slight horizontal drift
    vy: -(Math.random() * 2 + 1),  // Initial subtle hop upward
    gravity: PHYSICS.GRAVITY,     // g = 0.45 px/frame^2
    rotation: 0,
    rotSpeed: (Math.random() - 0.5) * 0.15, // Angular velocity (rad/frame)
    alpha: 1.0,
    scale: 1.0,
    isDead: false
  };
}

/**
 * Updates an array of dropping physics bubbles for 1 frame
 *
 * @param {Array<object>} droppingBubbles - Array of active falling bubbles
 * @param {number} arenaHeight - Bottom boundary cutoff
 * @returns {Array<object>} Filtered surviving bubbles
 */
export function updateDroppingBubbles(droppingBubbles, arenaHeight) {
  return droppingBubbles.filter(b => {
    b.x += b.vx;
    b.y += b.vy;
    b.vy += b.gravity;
    b.rotation += b.rotSpeed;

    // Fade out as it nears or crosses the bottom floor
    if (b.y > arenaHeight - 60) {
      b.alpha -= 0.05;
      b.scale -= 0.02;
    }

    return b.y < arenaHeight + 50 && b.alpha > 0.05;
  });
}

export default {
  findFloatingBubbles,
  createDroppingBubble,
  updateDroppingBubbles
};
