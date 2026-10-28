// 40 Handcrafted Levels with 7 Distinct Objectives
// Mobile-First Odd-R Honeycomb Matrices (11 Columns x 14 Rows)

export interface LevelData {
  id: number;
  name: string;
  world: string;
  objective: {
    type: string;
    target: number;
    targetColor?: string;
  };
  maxShots: number;
  palette: string[];
  matrix: (string | null)[][];
  starScoreThresholds: {
    oneStar: number;
    twoStar: number;
    threeStar: number;
  };
}

const PALETTES = {
  3: ['CYAN', 'MAGENTA', 'GOLD'],
  4: ['CYAN', 'MAGENTA', 'GOLD', 'EMERALD'],
  5: ['CYAN', 'MAGENTA', 'GOLD', 'EMERALD', 'CRIMSON'],
  6: ['CYAN', 'MAGENTA', 'GOLD', 'EMERALD', 'CRIMSON', 'VIOLET']
};

const WORLDS = ['Celestial Reef', 'Starlight Nebula', 'Crystal Abyss', 'Supernova Core'];

const OBJECTIVES = [
  'CLEAR_ALL',
  'RESCUE_JELLIES',
  'TARGET_SCORE',
  'COLOR_HUNT',
  'DROP_TARGETS',
  'COMBO_STREAK',
  'LIMITED_SHOT'
];

function buildMatrix(occupiedRows: number, palette: string[], specialFn?: (r: number, c: number) => string | null): (string | null)[][] {
  const matrix: (string | null)[][] = [];
  for (let r = 0; r < 14; r++) {
    const rowCols = (r % 2 === 0) ? 11 : 10;
    const row: (string | null)[] = [];
    for (let c = 0; c < rowCols; c++) {
      if (r < occupiedRows) {
        if (specialFn) {
          const spec = specialFn(r, c);
          if (spec) {
            row.push(spec);
            continue;
          }
        }
        // Pleasing patterned clusters
        const color = palette[(c + Math.floor(r / 2)) % palette.length];
        row.push(color);
      } else {
        row.push(null);
      }
    }
    matrix.push(row);
  }
  return matrix;
}

export const HANDCRAFTED_LEVELS: LevelData[] = [];

for (let id = 1; id <= 40; id++) {
  const worldIndex = Math.floor((id - 1) / 10);
  const world = WORLDS[worldIndex];
  const objType = OBJECTIVES[(id - 1) % OBJECTIVES.length];
  
  const paletteSize = (id <= 10 ? 3 : id <= 25 ? 4 : id <= 35 ? 5 : 6) as 3 | 4 | 5 | 6;
  const palette = PALETTES[paletteSize];
  const occupiedRows = Math.min(5 + Math.floor(id / 8), 9);
  const maxShots = Math.max(16, 32 - Math.floor(id / 4));

  let specialFn: ((r: number, c: number) => string | null) | undefined = undefined;
  let targetCount = 0;

  if (objType === 'RESCUE_JELLIES') {
    targetCount = 3 + Math.floor(id / 8);
    specialFn = (r, c) => {
      if (r > 1 && (r + c) % 5 === 0 && targetCount > 0) return 'JELLY';
      if (id > 15 && (r * 3 + c) % 9 === 0) return 'BOMB';
      return null;
    };
  } else if (objType === 'TARGET_SCORE') {
    targetCount = 12000 + id * 800;
  } else if (objType === 'COLOR_HUNT') {
    targetCount = 15 + Math.floor(id / 3);
  } else if (objType === 'DROP_TARGETS') {
    targetCount = 8 + Math.floor(id / 4);
    specialFn = (r, c) => (r === 2 && c % 4 === 0 ? 'ROCK' : null);
  } else if (objType === 'COMBO_STREAK') {
    targetCount = Math.min(3 + Math.floor(id / 10), 7);
  } else if (objType === 'LIMITED_SHOT') {
    specialFn = (r, c) => (r === 3 && c % 3 === 0 ? 'RAINBOW' : null);
  }

  HANDCRAFTED_LEVELS.push({
    id,
    name: `Sector ${id}: ${world}`,
    world,
    objective: {
      type: objType,
      target: targetCount,
      targetColor: objType === 'COLOR_HUNT' ? palette[0] : undefined
    },
    maxShots,
    palette,
    matrix: buildMatrix(occupiedRows, palette, specialFn),
    starScoreThresholds: {
      oneStar: 8000 + id * 400,
      twoStar: 15000 + id * 700,
      threeStar: 22000 + id * 1000
    }
  });
}

export default HANDCRAFTED_LEVELS;
