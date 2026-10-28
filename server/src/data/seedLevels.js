// 40 Handcrafted Levels spanning 7 Objective Types
// Odd-R 11x14 Honeycomb Matrices
// Colors: CYAN, MAGENTA, GOLD, EMERALD, CRIMSON, VIOLET
// Special Bubbles: BOMB, RAINBOW, JELLY, ICE, ROCK

const PALETTES = {
  3: ['CYAN', 'MAGENTA', 'GOLD'],
  4: ['CYAN', 'MAGENTA', 'GOLD', 'EMERALD'],
  5: ['CYAN', 'MAGENTA', 'GOLD', 'EMERALD', 'CRIMSON'],
  6: ['CYAN', 'MAGENTA', 'GOLD', 'EMERALD', 'CRIMSON', 'VIOLET']
};

const WORLDS = [
  'Celestial Reef',
  'Starlight Nebula',
  'Crystal Abyss',
  'Supernova Core'
];

function generateMatrix(rows, cols, occupiedRows, palette, specialRule = null) {
  const matrix = [];
  for (let r = 0; r < rows; r++) {
    const rowLength = (r % 2 === 0) ? cols : cols - 1;
    const row = [];
    for (let c = 0; c < rowLength; c++) {
      if (r < occupiedRows) {
        if (specialRule && specialRule(r, c)) {
          row.push(specialRule(r, c));
        } else {
          // Cluster-friendly deterministic placement
          const clusterIndex = Math.floor((c + Math.floor(r / 2)) % palette.length);
          row.push(palette[clusterIndex]);
        }
      } else {
        row.push(null);
      }
    }
    matrix.push(row);
  }
  return matrix;
}

const OBJECTIVES = [
  'CLEAR_ALL',
  'RESCUE_JELLIES',
  'TARGET_SCORE',
  'COLOR_HUNT',
  'DROP_TARGETS',
  'COMBO_STREAK',
  'LIMITED_SHOT'
];

export const levels = [];

for (let id = 1; id <= 40; id++) {
  const worldIndex = Math.floor((id - 1) / 10);
  const world = WORLDS[worldIndex];
  const objType = OBJECTIVES[(id - 1) % OBJECTIVES.length];
  
  const paletteSize = id <= 10 ? 3 : id <= 25 ? 4 : id <= 35 ? 5 : 6;
  const palette = PALETTES[paletteSize];
  const occupiedRows = Math.min(5 + Math.floor(id / 8), 9);
  const maxShots = Math.max(16, 32 - Math.floor(id / 4));

  let specialRule = null;
  let targetCount = 0;

  if (objType === 'RESCUE_JELLIES') {
    targetCount = 3 + Math.floor(id / 8);
    specialRule = (r, c) => {
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
    specialRule = (r, c) => (r === 2 && c % 4 === 0 ? 'ROCK' : null);
  } else if (objType === 'COMBO_STREAK') {
    targetCount = Math.min(3 + Math.floor(id / 10), 7);
  } else if (objType === 'LIMITED_SHOT') {
    specialRule = (r, c) => (r === 3 && c % 3 === 0 ? 'RAINBOW' : null);
  }

  const matrix = generateMatrix(14, 11, occupiedRows, palette, specialRule);

  levels.push({
    id,
    name: `Sector ${id}: ${world}`,
    world,
    objective: {
      type: objType,
      target: targetCount,
      targetColor: objType === 'COLOR_HUNT' ? palette[0] : null
    },
    maxShots,
    palette,
    matrix,
    starScoreThresholds: {
      oneStar: 8000 + id * 400,
      twoStar: 15000 + id * 700,
      threeStar: 22000 + id * 1000
    }
  });
}

export default levels;
