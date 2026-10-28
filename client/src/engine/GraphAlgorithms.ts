// Graph Algorithms: BFS Match-3 Clustering & Ceiling Reachability Drops
// Section 4 & Gameplay Analysis Specification
import HexGridEngine from './HexGrid';

export interface DroppingBubble {
  col: number;
  row: number;
  color: string;
  x: number;
  y: number;
  vx: number;
  vy: number;
  rotation: number;
  torque: number;
}

export class GraphEngine {
  /**
   * Explores contiguous matching color clusters using BFS
   */
  public static findMatchCluster(
    startCol: number,
    startRow: number,
    gridMatrix: (string | null)[][],
    hexEngine: HexGridEngine
  ): { col: number; row: number }[] {
    const targetColor = gridMatrix[startRow]?.[startCol];
    if (!targetColor) return [];

    // Rainbow wildcard matches any neighbor
    const isRainbow = targetColor === 'RAINBOW';

    const visited = new Set<string>();
    const cluster: { col: number; row: number }[] = [];
    const queue: { col: number; row: number }[] = [{ col: startCol, row: startRow }];
    visited.add(`${startCol},${startRow}`);

    let effectiveColor = targetColor;

    while (queue.length > 0) {
      const current = queue.shift()!;
      cluster.push(current);

      const neighbors = hexEngine.getNeighbors(current.col, current.row);
      for (const n of neighbors) {
        const key = `${n.col},${n.row}`;
        if (!visited.has(key)) {
          const neighborColor = gridMatrix[n.row]?.[n.col];
          if (neighborColor) {
            // Determine effective match color if rainbow
            if (isRainbow && effectiveColor === 'RAINBOW' && neighborColor !== 'RAINBOW') {
              effectiveColor = neighborColor;
            }

            if (
              neighborColor === effectiveColor ||
              neighborColor === 'RAINBOW' ||
              (isRainbow && neighborColor === targetColor)
            ) {
              visited.add(key);
              queue.push(n);
            }
          }
        }
      }
    }

    return cluster.length >= 3 ? cluster : [];
  }

  /**
   * Detects bubbles disconnected from ceiling via multi-source BFS starting from Row 0
   */
  public static findFloatingOrphans(
    gridMatrix: (string | null)[][],
    hexEngine: HexGridEngine
  ): { col: number; row: number }[] {
    const anchored = new Set<string>();
    const queue: { col: number; row: number }[] = [];

    // Seed BFS from all occupied cells in Row 0 (Ceiling)
    for (let c = 0; c < hexEngine.cols; c++) {
      if (gridMatrix[0] && gridMatrix[0][c] !== null) {
        anchored.add(`${c},0`);
        queue.push({ col: c, row: 0 });
      }
    }

    // Traverse ceiling-connected component
    while (queue.length > 0) {
      const current = queue.shift()!;
      const neighbors = hexEngine.getNeighbors(current.col, current.row);
      for (const n of neighbors) {
        const key = `${n.col},${n.row}`;
        if (!anchored.has(key) && gridMatrix[n.row]?.[n.col] !== null) {
          anchored.add(key);
          queue.push(n);
        }
      }
    }

    // Any occupied bubble not in anchored set is an orphan
    const orphans: { col: number; row: number }[] = [];
    for (let r = 0; r < hexEngine.rows; r++) {
      const rowCols = (r % 2 === 0) ? hexEngine.cols : hexEngine.cols - 1;
      for (let c = 0; c < rowCols; c++) {
        if (gridMatrix[r] && gridMatrix[r][c] !== null && !anchored.has(`${c},${r}`)) {
          orphans.push({ col: c, row: r });
        }
      }
    }

    return orphans;
  }
}

export default GraphEngine;
