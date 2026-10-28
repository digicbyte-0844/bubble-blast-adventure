// Odd-R Horizontal Hexagonal Grid Topology (11 Columns x 14 Rows)
// Sections 83-88 & Gameplay Analysis Specification

export interface HexCell {
  col: number;
  row: number;
  color: string | null;
  isSpecial?: string | null; // 'BOMB', 'RAINBOW', 'JELLY', 'ROCK', 'ICE'
}

export class HexGridEngine {
  public readonly cols: number = 11;
  public readonly rows: number = 14;
  public bubbleRadius: number = 20;

  constructor(radius: number = 20) {
    this.bubbleRadius = radius;
  }

  public get inRadius(): number {
    return this.bubbleRadius * (Math.sqrt(3) / 2);
  }

  public get horizontalPitch(): number {
    return this.inRadius * 2;
  }

  public get verticalPitch(): number {
    return this.bubbleRadius * 1.5;
  }

  /**
   * Converts (col, row) to continuous canvas pixel coordinates (X, Y)
   */
  public hexToPixel(col: number, row: number, arenaWidth: number): { x: number; y: number } {
    const rowOffset = (row % 2 === 1) ? this.inRadius : 0;
    const marginX = (arenaWidth - (this.cols * this.horizontalPitch)) / 2;
    const x = marginX + this.inRadius + (col * this.horizontalPitch) + rowOffset;
    const y = this.bubbleRadius + (row * this.verticalPitch) + 10;
    return { x, y };
  }

  /**
   * Returns valid 6-directional hexagonal neighbors for Odd-R staggered grid
   */
  public getNeighbors(col: number, row: number): { col: number; row: number }[] {
    const isOdd = row % 2 === 1;
    const offsets = isOdd
      ? [
          { c: -1, r: 0 },
          { c: 1, r: 0 },
          { c: 0, r: -1 },
          { c: 1, r: -1 },
          { c: 0, r: 1 },
          { c: 1, r: 1 }
        ]
      : [
          { c: -1, r: 0 },
          { c: 1, r: 0 },
          { c: -1, r: -1 },
          { c: 0, r: -1 },
          { c: -1, r: 1 },
          { c: 0, r: 1 }
        ];

    const neighbors: { col: number; row: number }[] = [];
    for (const off of offsets) {
      const nc = col + off.c;
      const nr = row + off.r;
      const maxColInRow = (nr % 2 === 0) ? this.cols : this.cols - 1;
      if (nr >= 0 && nr < this.rows && nc >= 0 && nc < maxColInRow) {
        neighbors.push({ col: nc, row: nr });
      }
    }
    return neighbors;
  }

  /**
   * Finds the closest empty hex cell around an impacted position or bubble
   */
  public findOptimalSnapCell(
    impactX: number,
    impactY: number,
    gridMatrix: (string | null)[][],
    arenaWidth: number
  ): { col: number; row: number } | null {
    let bestCell: { col: number; row: number } | null = null;
    let minDistance = Infinity;

    for (let r = 0; r < this.rows; r++) {
      const rowCols = (r % 2 === 0) ? this.cols : this.cols - 1;
      for (let c = 0; c < rowCols; c++) {
        if (!gridMatrix[r] || gridMatrix[r][c] === null) {
          const pos = this.hexToPixel(c, r, arenaWidth);
          const distSq = (pos.x - impactX) ** 2 + (pos.y - impactY) ** 2;
          if (distSq < minDistance) {
            minDistance = distSq;
            bestCell = { col: c, row: r };
          }
        }
      }
    }

    return bestCell;
  }
}

export default HexGridEngine;
