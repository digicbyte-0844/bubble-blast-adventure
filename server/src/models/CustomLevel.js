import mongoose from 'mongoose';

const customLevelSchema = new mongoose.Schema({
  customId: { type: String, required: true, unique: true },
  name: { type: String, required: true },
  creatorUsername: { type: String, default: 'Anonymous' },
  objective: {
    type: { type: String, default: 'CLEAR_ALL' },
    target: { type: Number, default: 0 }
  },
  maxShots: { type: Number, default: 25 },
  palette: [{ type: String }],
  matrix: { type: Array, required: true },
  createdAt: { type: Date, default: Date.now }
});

export const CustomLevel = mongoose.model('CustomLevel', customLevelSchema);
export default CustomLevel;
