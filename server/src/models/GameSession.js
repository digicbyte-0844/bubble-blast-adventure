import mongoose from 'mongoose';

// GameSession Schema
// Cryptographic session tokens, timestamps, anti-cheat status
const gameSessionSchema = new mongoose.Schema({
  sessionToken: { type: String, required: true, unique: true, index: true },
  sessionId: { type: String, index: true },
  userId: { type: String, required: true, index: true },
  levelId: { type: Number, required: true, index: true },

  // Timestamps
  startedAt: { type: Date, default: Date.now },
  completedAt: { type: Date },
  startTime: { type: Date, default: Date.now },

  // Gameplay Metrics
  shotsUsed: { type: Number, default: 0 },
  shotsFired: { type: Number, default: 0 },
  allowedShots: { type: Number, default: 30 },
  bubblesPopped: { type: Number, default: 0 },
  score: { type: Number, default: 0 },
  claimedScore: { type: Number, default: 0 },
  verifiedScore: { type: Number, default: 0 },
  stars: { type: Number, default: 0 },
  starsEarned: { type: Number, default: 0 },
  bestCombo: { type: Number, default: 0 },
  boostersUsed: { type: Number, default: 0 },
  completed: { type: Boolean, default: false },

  // Status (ACTIVE, COMPLETED, FLAGGED, VERIFIED, REJECTED)
  status: {
    type: String,
    enum: ['ACTIVE', 'COMPLETED', 'FLAGGED', 'VERIFIED', 'REJECTED'],
    default: 'ACTIVE',
    index: true
  },

  auditLog: { type: Object }
});

export const GameSession = mongoose.model('GameSession', gameSessionSchema);
export default GameSession;
