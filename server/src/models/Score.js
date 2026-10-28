import mongoose from 'mongoose';

const scoreSchema = new mongoose.Schema({
  userId: { type: String, required: true },
  username: { type: String, required: true },
  levelId: { type: Number, required: true },
  score: { type: Number, required: true },
  stars: { type: Number, default: 0 },
  shotsRemaining: { type: Number, default: 0 },
  verifiedClean: { type: Boolean, default: true },
  completedAt: { type: Date, default: Date.now }
});

scoreSchema.index({ levelId: 1, score: -1 });
scoreSchema.index({ score: -1 });

export const Score = mongoose.model('Score', scoreSchema);
export default Score;
