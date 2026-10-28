/**
 * Hexagonal Grid Coordinate Mathematics & Traversal (Odd-R Offset Topology)
 * 11 columns on even rows, 10 columns on odd rows, 14 total rows.
 */

import { PHYSICS } from './constants.js';

export const TOTAL_ROWS = PHYSICS.GRID_ROWS; // 14
export const COLS_EVEN = PHYSICS.GRID_COLS_EVEN; // 11
export const COLS_ODD = PHYSICS.GRID_COLS_ODD; // 10
export const HEX_HEIGHT_RATIO = PHYSICS.HEX_HEIGHT_RATIO; // Math.sqrt(3)

/**
 * Returns the maximum column count for a given row index in Odd-R layout
 */
export function getColsInRow(row) {
  return row % 2 === 0 ? COLS_EVEN : COLS_ODD;
}

/**
 * Validates if the (row, col) coordinates exist within the Odd-R grid boundaries
 */
export function isValidCell(row, col) {
  if (row < 0 || row >= TOTAL_ROWS) return false;
  const maxCols = getColsInRow(row);
  return col >= 0 && col < maxCols;
}

/**
 * Convert discrete Odd-R grid coordinates (row, col) to continuous screen pixel coordinates (x, y)
 *
 * @param {number} row - Grid row (0 to 13)
 * @param {number} col - Grid column (0 to 10 on even rows, 0 to 9 on odd rows)
 * @param {number} radius - Bubble radius in pixels (default 18)
 * @param {number} xOffset - Canvas left padding (default 0)
 * @param {number} yOffset - Canvas top padding (default 0)
 * @returns {{ x: number, y: number }} Center coordinates in pixels
 */
export function gridToPixel(row, col, radius = PHYSICS.DEFAULT_BUBBLE_RADIUS, xOffset = 0, yOffset = 0) {
  const isOddRow = Math.abs(row % 2) === 1;
  const horizontalSpacing = radius * 2;
  const verticalSpacing = radius * HEX_HEIGHT_RATIO;

  // Odd rows are shifted right by one bubble radius
  const x = xOffset + radius + col * horizontalSpacing + (isOddRow ? radius : 0);
  const y = yOffset + radius + row * verticalSpacing;

  return { x, y };
}

/**
 * Convert continuous screen pixel coordinates (x, y) to the nearest discrete Odd-R grid cell
 *
 * @param {number} x - Pixel X
 * @param {number} y - Pixel Y
 * @param {number} radius - Bubble radius in pixels
 * @param {number} xOffset - Canvas left padding
 * @param {number} yOffset - Canvas top padding
 * @returns {{ row: number, col: number }} Nearest valid grid cell
 */
export function pixelToGrid(x, y, radius = PHYSICS.DEFAULT_BUBBLE_RADIUS, xOffset = 0, yOffset = 0) {
  const verticalSpacing = radius * HEX_HEIGHT_RATIO;
  const approxRow = Math.round((y - yOffset - radius) / verticalSpacing);
  const clampedRow = Math.max(0, Math.min(TOTAL_ROWS - 1, approxRow));

  // Check candidate row and adjacent rows for closest Euclidean distance
  const candidateRows = [
    clampedRow,
    Math.max(0, clampedRow - 1),
    Math.min(TOTAL_ROWS - 1, clampedRow + 1)
  ];

  let bestCell = { row: clampedRow, col: 0 };
  let minDistanceSq = Infinity;

  for (const r of candidateRows) {
    const maxCols = getColsInRow(r);
    for (let c = 0; c < maxCols; c++) {
      const p = gridToPixel(r, c, radius, xOffset, yOffset);
      const dSq = (x - p.x) ** 2 + (y - p.y) ** 2;
      if (dSq < minDistanceSq) {
        minDistanceSq = dSq;
        bestCell = { row: r, col: c };
      }
    }
  }

  return bestCell;
}

/**
 * Returns all 6 hexagonal neighbor coordinates for an Odd-R grid cell
 *
 * Even Row (row % 2 === 0):
 *  - Up-Left:    [row - 1, col - 1]
 *  - Up-Right:   [row - 1, col]
 *  - Left:       [row,     col - 1]
 *  - Right:      [row,     col + 1]
 *  - Down-Left:  [row + 1, col - 1]
 *  - Down-Right: [row + 1, col]
 *
 * Odd Row (row % 2 === 1):
 *  - Up-Left:    [row - 1, col]
 *  - Up-Right:   [row - 1, col + 1]
 *  - Left:       [row,     col - 1]
 *  - Right:      [row,     col + 1]
 *  - Down-Left:  [row + 1, col]
 *  - Down-Right: [row + 1, col + 1]
 *
 * @param {number} row - Center row
 * @param {number} col - Center column
 * @returns {Array<{ row: number, col: number }>} Valid adjacent in-bound cells
 */
export function getHexNeighbors(row, col) {
  const isOdd = Math.abs(row % 2) === 1;

  const offsets = isOdd
    ? [
        { r: -1, c: 0 },  // Up-Left
        { r: -1, c: 1 },  // Up-Right
        { r: 0,  c: -1 }, // Left
        { r: 0,  c: 1 },  // Right
        { r: 1,  c: 0 },  // Down-Left
        { r: 1,  c: 1 }   // Down-Right
      ]
    : [
        { r: -1, c: -1 }, // Up-Left
        { r: -1, c: 0 },  // Up-Right
        { r: 0,  c: -1 }, // Left
        { r: 0,  c: 1 },  // Right
        { r: 1,  c: -1 }, // Down-Left
        { r: 1,  c: 0 }   // Down-Right
      ];

  const neighbors = [];
  for (const off of offsets) {
    const nr = row + off.r;
    const nc = col + off.c;
    if (isValidCell(nr, nc)) {
      neighbors.push({ row: nr, col: nc });
    }
  }

  return neighbors;
}

/**
 * Creates an empty 14-row Odd-R grid matrix filled with null
 */
export function createEmptyGrid() {
  const grid = [];
  for (let r = 0; r < TOTAL_ROWS; r++) {
    const cols = getColsInRow(r);
    grid.push(new Array(cols).fill(null));
  }
  return grid;
}

/**
 * Deep clones an Odd-R grid matrix
 */
export function cloneGrid(grid) {
  return grid.map(row => row.map(cell => (cell ? { ...cell } : null)));
}

/**
 * Checks if the entire grid has zero active bubbles
 */
export function isGridEmpty(grid) {
  for (let r = 0; r < grid.length; r++) {
    for (let c = 0; c < grid[r].length; c++) {
      if (grid[r][c] !== null) return false;
    }
  }
  return true;
}

/**
 * Object-oriented wrapper class for backward compatibility and modular usage
 */
export class HexGrid {
  constructor(radius = PHYSICS.DEFAULT_BUBBLE_RADIUS, xOffset = 0, yOffset = 0) {
    this.radius = radius;
    this.xOffset = xOffset;
    this.yOffset = yOffset;
    this.rows = TOTAL_ROWS;
    this.colsEven = COLS_EVEN;
    this.colsOdd = COLS_ODD;
  }

  getColsInRow(row) {
    return getColsInRow(row);
  }

  isValidCell(row, col) {
    return isValidCell(row, col);
  }

  gridToPixel(row, col) {
    return gridToPixel(row, col, this.radius, this.xOffset, this.yOffset);
  }

  pixelToGrid(x, y) {
    return pixelToGrid(x, y, this.radius, this.xOffset, this.yOffset);
  }

  getNeighbors(row, col) {
    return getHexNeighbors(row, col);
  }

  createEmptyGrid() {
    return createEmptyGrid();
  }

  cloneGrid(grid) {
    return cloneGrid(grid);
  }
}

export default HexGrid;
