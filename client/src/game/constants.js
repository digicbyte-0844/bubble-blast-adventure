/**
 * Central Game Constants & Physics Specifications
 * Bubble Puzzle Engine Engine
 */

// 8 Bubble Colors with vibrant cosmic palettes
export const BUBBLE_COLORS = {
  RED: {
    id: 'red',
    name: 'Supernova Crimson',
    fill: '#FF3344',
    secondary: '#FF6677',
    glow: 'rgba(255, 51, 68, 0.5)',
    border: '#CC1122'
  },
  BLUE: {
    id: 'blue',
    name: 'Cosmic Cobalt',
    fill: '#2563EB',
    secondary: '#60A5FA',
    glow: 'rgba(37, 99, 235, 0.5)',
    border: '#1D4ED8'
  },
  GREEN: {
    id: 'green',
    name: 'Nebula Emerald',
    fill: '#10B981',
    secondary: '#34D399',
    glow: 'rgba(16, 185, 129, 0.5)',
    border: '#059669'
  },
  YELLOW: {
    id: 'yellow',
    name: 'Solar Flare',
    fill: '#FACC15',
    secondary: '#FDE047',
    glow: 'rgba(250, 204, 21, 0.5)',
    border: '#EAB308'
  },
  PURPLE: {
    id: 'purple',
    name: 'Pulsar Violet',
    fill: '#9333EA',
    secondary: '#C084FC',
    glow: 'rgba(147, 51, 234, 0.5)',
    border: '#7E22CE'
  },
  ORANGE: {
    id: 'orange',
    name: 'Nova Gold',
    fill: '#F97316',
    secondary: '#FB923C',
    glow: 'rgba(249, 115, 22, 0.5)',
    border: '#EA580C'
  },
  PINK: {
    id: 'pink',
    name: 'Cosmic Magenta',
    fill: '#EC4899',
    secondary: '#F472B6',
    glow: 'rgba(236, 72, 153, 0.5)',
    border: '#DB2777'
  },
  CYAN: {
    id: 'cyan',
    name: 'Starlight Cyan',
    fill: '#06B6D4',
    secondary: '#22D3EE',
    glow: 'rgba(6, 182, 212, 0.5)',
    border: '#0891B2'
  }
};

// Array of 8 primary color IDs for quick random selection
export const PRIMARY_COLOR_IDS = Object.values(BUBBLE_COLORS).map(c => c.id);

// Special Bubble Types
export const SPECIAL_BUBBLES = {
  NORMAL: 'normal',
  BOMB: 'bomb',
  RAINBOW: 'rainbow',
  LIGHTNING: 'lightning',
  STARLIGHT_JELLY_RESCUE: 'starlight_jelly_rescue',
  ROCK: 'rock' // Indestructible obstacle
};

// Finite State Machine (FSM) States
export const GAME_STATES = {
  LOADING: 'LOADING',
  READY: 'READY',
  AIMING: 'AIMING',
  SHOOTING: 'SHOOTING',
  RESOLVING: 'RESOLVING',
  COLLISION: 'COLLISION',
  MATCH_CHECK: 'MATCH_CHECK',
  POPPING: 'POPPING',
  FLOATING_CHECK: 'FLOATING_CHECK',
  EVALUATE: 'EVALUATE',
  LEVEL_COMPLETE: 'LEVEL_COMPLETE',
  LEVEL_FAILED: 'LEVEL_FAILED',
  PAUSED: 'PAUSED'
};

// Physics & Geometry Specifications
export const PHYSICS = {
  GRID_COLS_EVEN: 11, // 11 bubbles on even rows (0, 2, 4...)
  GRID_COLS_ODD: 10,  // 10 bubbles on odd rows (1, 3, 5...)
  GRID_ROWS: 14,      // 14 total rows
  DEFAULT_BUBBLE_RADIUS: 18, // Screen pixel radius
  HEX_HEIGHT_RATIO: Math.sqrt(3), // ~1.73205
  LAUNCH_SPEED: 24,   // Pixels per frame
  GRAVITY: 0.45,      // Falling bubble acceleration (px/frame^2)
  MIN_AIM_ANGLE: -168 * (Math.PI / 180), // -2.93215 rad (clamped to prevent horizontal shots)
  MAX_AIM_ANGLE: -12 * (Math.PI / 180),  // -0.20944 rad
  COLLISION_TOLERANCE: 0.93, // Multiplier on (2 * radius) for snappy circle collision
  NORMAL_MAX_BOUNCES: 1, // Standard aim trajectory reflection limit
  SUPER_AIM_BOUNCES: 2   // Super Aim booster reflection limit
};

// Scoring & Multiplier Weights
export const SCORING = {
  BASE_POP: 10,            // Points per popped bubble
  CLUSTER_BONUS: 15,       // Extra points per bubble above 3 in a cluster
  FLOATING_DROP: 20,       // Points per disconnected floating bubble drop
  RESCUE_BONUS: 100,       // Points per rescued Starlight Mini-Jelly
  REMAINING_SHOT_BONUS: 150, // Points per remaining unused shot at victory
  LEVEL_COMPLETE_BONUS: 1000, // Completion flat bonus
  COMBO_MAX_MULTIPLIER: 10 // Maximum combo multiplier cap
};

// Objective Types
export const OBJECTIVES = {
  CLEAR_ALL: 'clear_all',
  RESCUE: 'rescue',
  TARGET_SCORE: 'target_score',
  COLOR_HUNT: 'color_hunt',
  DROP_BUBBLES: 'drop_bubbles',
  COMBO_CHALLENGE: 'combo_challenge',
  LIMITED_SHOTS: 'limited_shots'
};

// Booster Definitions
export const BOOSTERS = {
  AIM_GUIDE: {
    id: 'aim_guide',
    name: 'Super Aim Guide',
    description: 'Extends trajectory to 2 wall bounces and reveals landing target circle',
    cost: 50
  },
  BOMB_BUBBLE: {
    id: 'bomb_bubble',
    name: 'Cosmic Bomb',
    description: 'Explodes all bubbles within a 2-hex radius regardless of color',
    cost: 75
  },
  RAINBOW_BUBBLE: {
    id: 'rainbow_bubble',
    name: 'Prism Rainbow',
    description: 'Wildcard bubble matching any color cluster on impact',
    cost: 75
  },
  PLUS_5_SHOTS: {
    id: 'plus_5_shots',
    name: '+5 Extra Shots',
    description: 'Adds 5 emergency shots to your current ammo budget',
    cost: 60
  },
  SHUFFLE: {
    id: 'shuffle',
    name: 'Grid Re-Aligner',
    description: 'Permutes remaining bubble colors to break impossible deadlocks',
    cost: 40
  }
};

// Backward-compatible alias for existing imports
export const PALETTE = {
  CYAN: { name: 'Starlight Cyan', fill: BUBBLE_COLORS.CYAN.fill, glow: BUBBLE_COLORS.CYAN.glow },
  MAGENTA: { name: 'Cosmic Magenta', fill: BUBBLE_COLORS.PINK.fill, glow: BUBBLE_COLORS.PINK.glow },
  GOLD: { name: 'Nova Gold', fill: BUBBLE_COLORS.ORANGE.fill, glow: BUBBLE_COLORS.ORANGE.glow },
  EMERALD: { name: 'Nebula Emerald', fill: BUBBLE_COLORS.GREEN.fill, glow: BUBBLE_COLORS.GREEN.glow },
  CRIMSON: { name: 'Supernova Crimson', fill: BUBBLE_COLORS.RED.fill, glow: BUBBLE_COLORS.RED.glow },
  VIOLET: { name: 'Pulsar Violet', fill: BUBBLE_COLORS.PURPLE.fill, glow: BUBBLE_COLORS.PURPLE.glow },
  BOMB: { name: 'Matter Bomb', fill: '#FF4400', glow: 'rgba(255, 68, 0, 0.6)' },
  RAINBOW: { name: 'Prism Rainbow', fill: '#FFFFFF', glow: 'rgba(255, 255, 255, 0.8)' },
  JELLY: { name: 'Mini-Jelly Capsule', fill: '#38BDF8', glow: 'rgba(56, 189, 248, 0.7)' },
  ROCK: { name: 'Meteorite Obstacle', fill: '#6B7280', glow: 'rgba(107, 114, 128, 0.4)' }
};

export default {
  BUBBLE_COLORS,
  PRIMARY_COLOR_IDS,
  SPECIAL_BUBBLES,
  GAME_STATES,
  PHYSICS,
  SCORING,
  OBJECTIVES,
  BOOSTERS,
  PALETTE
};
