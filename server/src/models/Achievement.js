import mongoose from 'mongoose';

// Section 10: Primary Collection - achievements
// Static definition list & user unlock progression map

// 1. Static Definition Catalog
export const STATIC_ACHIEVEMENTS = [
  { id: 'FIRST_POP', title: 'First Pop', description: 'Pop your first 3-bubble cluster', category: 'BEGINNER', rewardCoins: 50, icon: '🫧' },
  { id: 'JELLY_SAVIOR', title: 'Starlight Savior', description: 'Rescue 20 trapped Mini-Jellies', category: 'OBJECTIVE', rewardCoins: 150, icon: '🌟' },
  { id: 'BANK_SHOT_MASTER', title: 'Bank Shot Master', description: 'Execute 15 wall-bounce ricochet pops', category: 'SKILL', rewardCoins: 100, icon: '🎯' },
  { id: 'COMBO_KING', title: 'Combo King', description: 'Reach a 6x combo streak', category: 'MASTERY', rewardCoins: 200, icon: '⚡' },
  { id: 'BOMB_EXPERT', title: 'Cosmic Demolition', description: 'Detonate 10 Bomb Boosters', category: 'BOOSTER', rewardCoins: 100, icon: '💣' },
  { id: 'RAINBOW_MAGIC', title: 'Prismatic Wizard', description: 'Clear 15 clusters with Rainbow Wildcards', category: 'BOOSTER', rewardCoins: 120, icon: '🌈' },
  { id: 'PERFECT_STAR', title: 'Constellation Perfection', description: 'Earn 3 stars on 10 different levels', category: 'MASTERY', rewardCoins: 300, icon: '⭐' },
  { id: 'SHARPSHOOTER', title: 'Galactic Sniper', description: 'Complete a level with over 10 shots remaining', category: 'SKILL', rewardCoins: 150, icon: '🏹' },
  { id: 'DAILY_DEVOTEE', title: 'Daily Devotee', description: 'Complete 3 daily challenge puzzles', category: 'ENGAGEMENT', rewardCoins: 250, icon: '📅' },
  { id: 'ISLAND_DROPER', title: 'Gravity Master', description: 'Drop 25 hanging bubbles in a single match', category: 'PHYSICS', rewardCoins: 200, icon: '🌌' },
  { id: 'SECTOR_1_CLEAR', title: 'Celestial Reef Cleared', description: 'Complete all levels in World 1', category: 'CAMPAIGN', rewardCoins: 500, icon: '🪐' },
  { id: 'MASTER_CHALLENGER', title: 'Starlight Legend', description: 'Reach Level 40 and unlock procedural mode', category: 'CAMPAIGN', rewardCoins: 1000, icon: '👑' }
];

// 2. User Unlock Progression Map Schema
const userAchievementSchema = new mongoose.Schema({
  userId: { type: String, required: true, index: true },
  achievementId: { type: String, required: true, index: true },
  currentProgress: { type: Number, default: 0 },
  targetGoal: { type: Number, default: 1 },
  isUnlocked: { type: Boolean, default: false, index: true },
  unlockedAt: { type: Date }
});

userAchievementSchema.index({ userId: 1, achievementId: 1 }, { unique: true });

export const UserAchievement = mongoose.model('UserAchievement', userAchievementSchema);
export default UserAchievement;
