/**
 * Match Detection & Special Ability Resolution (BFS Algorithms)
 * Bubble Puzzle Engine Engine
 */

import { SPECIAL_BUBBLES } from './constants.js';
import { getHexNeighbors, isValidCell } from './hexGrid.js';

/**
 * Standard Breadth-First Search (BFS) cluster search for matching colors and wildcards
 *
 * @param {Array<Array>} grid - 14-row Odd-R bubble grid
 * @param {number} startRow - Snapped bubble row
 * @param {number} startCol - Snapped bubble col
 * @returns {Array<{ row: number, col: number, bubble: object }>} Matching cluster
 */
export function findConnectedMatch(grid, startRow, startCol) {
  if (!isValidCell(startRow, startCol)) return [];
  const startBubble = grid[startRow]?.[startCol];
  if (!startBubble) return [];

  // 1. Handle Bomb Bubble Detonation (2-hex topological radius)
  if (startBubble.type === SPECIAL_BUBBLES.BOMB) {
    return resolveBombExplosion(grid, startRow, startCol);
  }

  // 2. Handle Lightning Bubble Clear (Full Row Destruction)
  if (startBubble.type === SPECIAL_BUBBLES.LIGHTNING) {
    return resolveLightningClear(grid, startRow, startCol);
  }

  // 3. Handle Rainbow Bubble Wildcard Matching
  if (startBubble.type === SPECIAL_BUBBLES.RAINBOW) {
    return resolveRainbowMatch(grid, startRow, startCol);
  }

  // 4. Standard Color BFS Match-3
  const targetColor = startBubble.color;
  const visited = new Set();
  const cluster = [];
  const queue = [{ row: startRow, col: startCol }];

  visited.add(`${startRow},${startCol}`);

  while (queue.length > 0) {
    const current = queue.shift();
    const currBubble = grid[current.row][current.col];
    cluster.push({ row: current.row, col: current.col, bubble: currBubble });

    const neighbors = getHexNeighbors(current.row, current.col);
    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (!visited.has(key)) {
        const neighborBubble = grid[n.row]?.[n.col];
        if (neighborBubble) {
          // Color matches target color OR is a wildcard Rainbow bubble
          const isColorMatch = neighborBubble.color === targetColor;
          const isRainbow = neighborBubble.type === SPECIAL_BUBBLES.RAINBOW;

          if (isColorMatch || isRainbow) {
            visited.add(key);
            queue.push(n);
          }
        }
      }
    }
  }

  // Popping requires 3 or more bubbles of matching color
  return cluster.length >= 3 ? cluster : [];
}

/**
 * Resolves Rainbow Wildcard Bubble matching against adjacent neighboring colors
 */
export function resolveRainbowMatch(grid, startRow, startCol) {
  const neighbors = getHexNeighbors(startRow, startCol);
  const candidateColors = new Set();

  for (const n of neighbors) {
    const b = grid[n.row]?.[n.col];
    if (b && b.color && b.type !== SPECIAL_BUBBLES.ROCK) {
      candidateColors.add(b.color);
    }
  }

  let largestCluster = [];

  for (const color of candidateColors) {
    const visited = new Set();
    const cluster = [{ row: startRow, col: startCol, bubble: grid[startRow][startCol] }];
    const queue = [{ row: startRow, col: startCol }];
    visited.add(`${startRow},${startCol}`);

    while (queue.length > 0) {
      const current = queue.shift();
      const currentNeighbors = getHexNeighbors(current.row, current.col);

      for (const n of currentNeighbors) {
        const key = `${n.row},${n.col}`;
        if (!visited.has(key)) {
          const nb = grid[n.row]?.[n.col];
          if (nb && (nb.color === color || nb.type === SPECIAL_BUBBLES.RAINBOW)) {
            visited.add(key);
            cluster.push({ row: n.row, col: n.col, bubble: nb });
            queue.push(n);
          }
        }
      }
    }

    if (cluster.length > largestCluster.length) {
      largestCluster = cluster;
    }
  }

  // Rainbow bubble pops all connected bubbles of the touched color (at least 1 adjacent bubble, i.e. cluster >= 2)
  if (largestCluster.length >= 2) {
    return largestCluster;
  }

  // If touching any color bubble, pop that cluster
  if (largestCluster.length > 0) {
    return largestCluster;
  }

  // Fallback: Rainbow bubble always clears itself even if touching no colored bubbles
  return [{ row: startRow, col: startCol, bubble: grid[startRow][startCol] }];
}

/**
 * Resolves Bomb 2-hex radius explosion (topological distance <= 2)
 */
export function resolveBombExplosion(grid, centerRow, centerCol) {
  const visited = new Set();
  const queue = [{ row: centerRow, col: centerCol, depth: 0 }];
  const blastCluster = [];

  visited.add(`${centerRow},${centerCol}`);

  while (queue.length > 0) {
    const curr = queue.shift();
    const bubble = grid[curr.row]?.[curr.col];

    if (bubble) {
      blastCluster.push({ row: curr.row, col: curr.col, bubble });
    }

    if (curr.depth < 2) {
      const neighbors = getHexNeighbors(curr.row, curr.col);
      for (const n of neighbors) {
        const key = `${n.row},${n.col}`;
        if (!visited.has(key)) {
          visited.add(key);
          queue.push({ row: n.row, col: n.col, depth: curr.depth + 1 });
        }
      }
    }
  }

  return blastCluster;
}

/**
 * Resolves Lightning Bubble row clear (destroys entire row and adjacent cells)
 */
export function resolveLightningClear(grid, row, col) {
  const clearCluster = [];
  const cols = grid[row]?.length || 0;

  for (let c = 0; c < cols; c++) {
    const bubble = grid[row]?.[c];
    if (bubble) {
      clearCluster.push({ row, col: c, bubble });
    }
  }

  return clearCluster;
}

/**
 * Scans adjacent cells around a popped cluster for trapped Starlight Jellies to rescue
 */
export function checkRescuedJellies(grid, poppedCells = []) {
  if (!grid || !Array.isArray(poppedCells)) return [];
  const rescued = [];
  const checkedKeys = new Set();

  for (const cell of poppedCells) {
    if (!cell || typeof cell.row !== 'number' || typeof cell.col !== 'number') continue;
    const neighbors = getHexNeighbors(cell.row, cell.col);
    for (const n of neighbors) {
      const key = `${n.row},${n.col}`;
      if (!checkedKeys.has(key)) {
        checkedKeys.add(key);
        const b = grid[n.row]?.[n.col];
        if (b && b.type === SPECIAL_BUBBLES.STARLIGHT_JELLY_RESCUE) {
          rescued.push({ row: n.row, col: n.col, bubble: b });
        }
      }
    }
  }

  return rescued;
}

export default {
  findConnectedMatch,
  resolveRainbowMatch,
  resolveBombExplosion,
  resolveLightningClear,
  checkRescuedJellies
};
