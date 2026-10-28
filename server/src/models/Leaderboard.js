import mongoose from 'mongoose';

// Section 10: Primary Collection - leaderboards
// Indexed projections for high-speed rank queries (global, weekly, monthly)
const leaderboardSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  username: { type: String, required: true },
  avatarUrl: { type: String, default: 'https://cdn.bubbleblastadventure.io/avatars/jelly.png' },
  
  levelId: { type: Number, index: true }, // Optional: per-level or global
  score: { type: Number, required: true },
  stars: { type: Number, default: 0 },
  cumulativeStars: { type: Number, default: 0 },

  // Projection Scope: global, weekly, monthly
  timeframe: {
    type: String,
    enum: ['global', 'weekly', 'monthly'],
    default: 'global',
    index: true
  },

  verified: { type: Boolean, default: true, index: true },
  recordedAt: { type: Date, default: Date.now, index: true }
});

// High-speed compound rank indexes (Section 15)
leaderboardSchema.index({ totalScore: -1, totalStars: -1 });
leaderboardSchema.index({ score: -1, cumulativeStars: -1 });
leaderboardSchema.index({ timeframe: 1, score: -1 });
leaderboardSchema.index({ levelId: 1, score: -1 });
leaderboardSchema.index({ userId: 1, timeframe: 1 });
leaderboardSchema.index({ recordedAt: -1 });

export const Leaderboard = mongoose.model('Leaderboard', leaderboardSchema);
export default Leaderboard;
