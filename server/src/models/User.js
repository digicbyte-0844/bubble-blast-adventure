import mongoose from 'mongoose';

// User Collection Schema
// Supports both primary and aliased field names for robust frontend/API parity
const userSchema = new mongoose.Schema({
  // Identity & Credentials
  name: { type: String, sparse: true },
  username: { type: String, required: true, unique: true, index: true },
  email: { type: String, sparse: true, unique: true },
  password: { type: String, required: true }, // bcrypt hash
  passwordHash: { type: String },
  isGuest: { type: Boolean, default: false },
  role: { type: String, enum: ['user', 'admin'], default: 'user', index: true },

  // Progression Metrics
  currentLevel: { type: Number, default: 1, index: true },
  levelIndex: { type: Number, default: 1 },
  totalScore: { type: Number, default: 0, index: true },
  totalStars: { type: Number, default: 0 },
  cumulativeStars: { type: Number, default: 0 },
  bubblesPopped: { type: Number, default: 0 },
  bestCombo: { type: Number, default: 0 },
  comboRecord: { type: Number, default: 0 },
  rescuedObjects: { type: Number, default: 0 },
  dailyStreak: { type: Number, default: 1 },

  // Completed levels array
  completedLevels: [
    {
      levelId: { type: Number, required: true },
      stars: { type: Number, default: 0, min: 0, max: 3 },
      bestScore: { type: Number, default: 0 },
      completedAt: { type: Date, default: Date.now }
    }
  ],
  progress: [
    {
      levelId: { type: Number, required: true },
      stars: { type: Number, default: 0, min: 0, max: 3 },
      highScore: { type: Number, default: 0 },
      isUnlocked: { type: Boolean, default: false },
      completedAt: { type: Date }
    }
  ],

  // Inventory & Boosters
  boosterInventory: {
    aimGuide: { type: Number, default: 3 },
    bomb: { type: Number, default: 3 },
    rainbow: { type: Number, default: 2 },
    extraShots: { type: Number, default: 4 },
    shuffle: { type: Number, default: 3 }
  },
  inventory: {
    SUPER_AIM: { type: Number, default: 3 },
    BOMB: { type: Number, default: 3 },
    RAINBOW: { type: Number, default: 2 },
    EXTRA_SHOTS: { type: Number, default: 4 },
    SHUFFLE: { type: Number, default: 3 }
  },

  // Achievements
  achievements: [{ type: String }],

  // Currencies & Energy
  coins: { type: Number, default: 500 },
  energy: { type: Number, default: 5, max: 5 },
  lastEnergyRefill: { type: Date, default: Date.now },

  createdAt: { type: Date, default: Date.now }
});

// Compound indexes for leaderboard rankings
userSchema.index({ totalScore: -1, totalStars: -1 });
userSchema.index({ totalScore: -1, cumulativeStars: -1 });

export const User = mongoose.model('User', userSchema);
export default User;
