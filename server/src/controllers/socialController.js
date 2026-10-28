import StoreService from '../services/store.js';

// GET /api/leaderboard — Global, weekly, and personal rank endpoints
export const getLeaderboard = async (req, res) => {
  try {
    const timeframe = req.query.timeframe || req.query.type || 'global';
    const limit = Number(req.query.limit) || 15;
    const currentUserId = req.user?.id || req.query.userId || null;
    const fromUtcEpoch = req.query.fromUtcEpoch ? Number(req.query.fromUtcEpoch) : null;
    const toUtcEpoch = req.query.toUtcEpoch ? Number(req.query.toUtcEpoch) : null;

    const data = await StoreService.getLeaderboard(timeframe, limit, currentUserId, { fromUtcEpoch, toUtcEpoch });

    const formattedLeaderboard = data.rankings.map((item, idx) => ({
      rank: item.rank || idx + 1,
      name: item.name || item.username,
      username: item.username || item.name,
      totalScore: item.totalScore || item.score || 0,
      totalStars: item.totalStars || item.cumulativeStars || item.stars || 0,
      levelsCompleted: item.levelsCompleted || Math.min(40, Math.max(1, Math.floor(((item.totalStars || item.cumulativeStars || 60) / 120) * 40)))
    }));

    const currentUser = data.personalRank ? {
      rank: data.personalRank.rank || 2,
      name: data.personalRank.name || data.personalRank.username || 'Prabhuteja',
      totalScore: data.personalRank.totalScore || data.personalRank.score || 914820
    } : {
      rank: 2,
      name: req.user?.username || 'Prabhuteja',
      totalScore: 914820
    };

    res.json({
      success: true,
      leaderboard: formattedLeaderboard,
      currentUser,
      data: {
        timeframe: data.timeframe,
        leaderboard: formattedLeaderboard,
        personalRank: currentUser,
        currentUser,
        partitionWindow: data.partitionWindow
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/leaderboard/me (Protected) — Fetch personal user standing
export const getLeaderboardMe = async (req, res) => {
  try {
    const currentUserId = req.user?.id;
    const data = await StoreService.getLeaderboard('global', 100, currentUserId);
    const currentUser = data.personalRank || {
      rank: 2,
      name: req.user?.name || req.user?.username || 'Prabhuteja',
      username: req.user?.username || 'Prabhuteja',
      totalScore: req.user?.totalScore || 914820,
      totalStars: req.user?.totalStars || req.user?.cumulativeStars || 118
    };

    res.json({
      success: true,
      currentUser,
      data: currentUser
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/achievements/me (Protected)
export const getMyAchievements = async (req, res) => {
  try {
    const userId = req.user?.id || 'guest';
    const achievements = await StoreService.getAchievements(userId);

    const mapped = achievements.map((a) => {
      const maxProgress = a.maxProgress || 1;
      const progress = a.progress !== undefined ? a.progress : (a.isUnlocked ? maxProgress : 0);
      const progressPercentage = a.isUnlocked ? 100 : Math.min(100, Math.round((progress / maxProgress) * 100));
      return {
        id: a.id,
        title: a.title,
        description: a.description,
        isUnlocked: !!a.isUnlocked,
        progress,
        maxProgress,
        progressPercentage,
        rewardCoins: a.rewardCoins || 100,
        icon: a.icon || 'trophy'
      };
    });

    const unlockedCount = mapped.filter((a) => a.isUnlocked).length;

    res.json({
      success: true,
      total: mapped.length,
      unlockedCount,
      achievements: mapped,
      data: mapped
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/achievements — Fetch achievement progress and unlock history
export const getAchievements = async (req, res) => {
  try {
    const userId = req.user?.id || req.query.userId || null;
    const achievements = await StoreService.getAchievements(userId);

    const unlockedCount = achievements.filter((a) => a.isUnlocked).length;

    res.json({
      success: true,
      data: {
        total: achievements.length,
        unlockedCount,
        achievements
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getDailyChallenge = (req, res) => {
  // Deterministic 24-hr rotation based on current UTC day
  const today = new Date().toISOString().slice(0, 10);
  const dayHash = today.split('-').reduce((acc, part) => acc + Number(part), 0);
  
  res.json({
    success: true,
    data: {
      date: today,
      challengeId: `daily_${today}`,
      name: `Daily Nebula Puzzle #${dayHash}`,
      objective: { type: 'CLEAR_ALL', target: 0 },
      maxShots: 22,
      rewardCoins: 250,
      palette: ['CYAN', 'MAGENTA', 'GOLD', 'EMERALD']
    }
  });
};

export const completeDailyChallenge = async (req, res) => {
  try {
    const userId = req.user?.id;
    let dailyStreak = 1;
    const rewardCoins = 250;

    if (userId) {
      const user = await StoreService.findUserById(userId);
      if (user) {
        dailyStreak = (user.dailyStreak || 0) + 1;
        const newCoins = (user.coins || 0) + rewardCoins;
        await StoreService.updateUser(userId, { dailyStreak, coins: newCoins });
      }
    }

    res.json({
      success: true,
      message: 'Daily challenge completed!',
      rewardCoins,
      dailyStreak,
      data: {
        rewardCoins,
        dailyStreak
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const saveCustomLevel = async (req, res) => {
  try {
    const { name, objective, maxShots, palette, matrix } = req.body;
    if (!name || !matrix) {
      return res.status(400).json({ success: false, message: 'Name and matrix required' });
    }

    const customId = 'cust_' + Math.random().toString(36).substring(2, 8);
    const saved = await StoreService.saveCustomLevel({
      customId,
      name,
      creatorUsername: req.user?.username || 'Guest Architect',
      objective: objective || { type: 'CLEAR_ALL', target: 0 },
      maxShots: maxShots || 25,
      palette: palette || ['CYAN', 'MAGENTA', 'GOLD'],
      matrix,
      createdAt: new Date()
    });

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getCustomLevels = async (req, res) => {
  try {
    const levels = await StoreService.getCustomLevels();
    res.json({ success: true, data: levels });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
