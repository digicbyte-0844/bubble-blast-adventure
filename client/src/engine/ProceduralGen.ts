// Seeded PRNG & Infinite Procedural Level Generator (Level 41+)
// Section 85 & Section 15 Specification

export class SeededPRNG {
  private state: number;

  constructor(seed: number) {
    this.state = seed >>> 0;
  }

  public nextFloat(): number {
    this.state = (this.state + 0x6D2B79F5) | 0;
    let t = Math.imul(this.state ^ (this.state >>> 15), 1 | this.state);
    t = (t + Math.imul(t ^ (t >>> 7), 61 | t)) ^ t;
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  }

  public nextInt(min: number, max: number): number {
    return Math.floor(this.nextFloat() * (max - min + 1)) + min;
  }

  public pickColor(palette: string[]): string {
    return palette[this.nextInt(0, palette.length - 1)];
  }
}

export function generateProceduralLevel(levelId: number, seed?: number) {
  const prng = new SeededPRNG(seed || levelId * 8921 + 41);
  const rows = 14;
  const cols = 11;
  const occupiedRows = Math.min(6 + Math.floor(levelId / 12), 10);

  const fullPalette = ['CYAN', 'MAGENTA', 'GOLD', 'EMERALD', 'CRIMSON', 'VIOLET'];
  const paletteCount = levelId > 65 ? 6 : levelId > 50 ? 5 : 4;
  const palette = fullPalette.slice(0, paletteCount);

  const matrix: (string | null)[][] = [];
  for (let r = 0; r < rows; r++) {
    matrix[r] = [];
    const rowCols = (r % 2 === 0) ? cols : cols - 1;
    for (let c = 0; c < rowCols; c++) {
      if (r < occupiedRows) {
        // Chance for special bubbles
        const roll = prng.nextFloat();
        if (roll < 0.04) {
          matrix[r][c] = 'JELLY';
        } else if (roll < 0.08) {
          matrix[r][c] = 'BOMB';
        } else if (roll < 0.11) {
          matrix[r][c] = 'RAINBOW';
        } else {
          // Cluster coherence: 60% chance to inherit left or top color
          if (c > 0 && matrix[r][c - 1] && prng.nextFloat() < 0.5) {
            matrix[r][c] = matrix[r][c - 1];
          } else if (r > 0 && matrix[r - 1][c] && prng.nextFloat() < 0.4) {
            matrix[r][c] = matrix[r - 1][c];
          } else {
            matrix[r][c] = prng.pickColor(palette);
          }
        }
      } else {
        matrix[r][c] = null;
      }
    }
  }

  return {
    id: levelId,
    name: `Cosmic Infinite Sector ${levelId}`,
    world: 'Supernova Void',
    objective: {
      type: levelId % 2 === 0 ? 'RESCUE_JELLIES' : 'CLEAR_ALL',
      target: levelId % 2 === 0 ? 5 : 0
    },
    maxShots: Math.max(16, 28 - Math.floor(levelId / 8)),
    palette,
    matrix,
    starScoreThresholds: {
      oneStar: 15000 + levelId * 500,
      twoStar: 25000 + levelId * 800,
      threeStar: 35000 + levelId * 1200
    }
  };
}

export default generateProceduralLevel;
