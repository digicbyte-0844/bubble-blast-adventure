import mongoose from 'mongoose';

// Level Schema
// Data-driven layout matrix, shot budget, star thresholds, objective enum, color spectrum
const levelSchema = new mongoose.Schema({
  levelNumber: { type: Number, index: true },
  levelId: { type: Number, index: true },
  name: { type: String, required: true },
  world: { type: String, default: 'Celestial Reef' },
  difficulty: { type: String, default: 'Medium' },

  // Objective configuration
  objective: {
    type: { type: String, required: true },
    target: { type: Number, default: 0 },
    targetColor: { type: String, default: null }
  },

  // Shots / Ammo budget
  shots: { type: Number },
  shotBudget: { type: Number },
  maxShots: { type: Number },

  // Colors & Palette
  colors: [{ type: String }],
  colorSpectrum: [{ type: String }],
  palette: [{ type: String }],

  // Layout & Ammo Queue
  boardLayout: { type: Array },
  matrix: { type: Array, required: true },
  bubbleQueue: [{ type: String }],

  // Scoring & Stars
  targetScore: { type: Number, default: 5000 },
  starThresholds: {
    oneStar: { type: Number, default: 2000 },
    twoStar: { type: Number, default: 4000 },
    threeStar: { type: Number, default: 7000 }
  },
  starScoreThresholds: {
    oneStar: { type: Number },
    twoStar: { type: Number },
    threeStar: { type: Number }
  },

  // Boosters & Publishing
  availableBoosters: [{ type: String }],
  bonusBoosterFlags: [{ type: String }],
  isPublished: { type: Boolean, default: true },

  createdAt: { type: Date, default: Date.now }
});

export const Level = mongoose.model('Level', levelSchema);
export default Level;
