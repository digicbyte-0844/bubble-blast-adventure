// Dual Persistence Service: MongoDB with seamless In-Memory Fallback
// Section 10: Primary Collections (users, levels, gameSessions, leaderboards, achievements)
import mongoose from 'mongoose';
import User from '../models/User.js';
import Level from '../models/Level.js';
import GameSession from '../models/GameSession.js';
import Leaderboard from '../models/Leaderboard.js';
import Score from '../models/Score.js';
import CustomLevel from '../models/CustomLevel.js';
import { STATIC_ACHIEVEMENTS } from '../models/Achievement.js';
import seedLevels from '../data/seedLevels.js';

// In-memory collections
const memUsers = new Map();
const memSessions = new Map();
const memLeaderboards = [];
const memCustomLevels = [];

// Initial in-memory seed records for resilient offline/dev mode
const seedMemUsers = () => {
  if (memUsers.size === 0) {
    const adminUser = {
      _id: 'usr_admin_prabhu',
      id: 'usr_admin_prabhu',
      name: 'Prabhuteja Koda',
      username: 'Always_Prabhu',
      email: 'prabhudemo@gmail.com',
      role: 'admin',
      isGuest: false,
      levelIndex: 40,
      currentLevel: 40,
      totalScore: 914820,
      cumulativeStars: 118,
      totalStars: 118,
      bubblesPopped: 3480,
      comboRecord: 12,
      inventory: { SUPER_AIM: 10, BOMB: 10, RAINBOW: 10, EXTRA_SHOTS: 10, SHUFFLE: 10 },
      boosters: { bomb: 10, rainbow: 10, aim: 10, extraShots: 10 },
      coins: 5000,
      energy: 10,
      progress: Array.from({ length: 40 }, (_, i) => ({ levelId: i + 1, isUnlocked: true, stars: 3, highScore: 25000 })),
      createdAt: new Date('2026-01-01T00:00:00Z'),
      updatedAt: new Date()
    };
    memUsers.set(adminUser.id, adminUser);
    memUsers.set('Always_Prabhu', adminUser);

    const player2 = {
      _id: 'usr_player_ayan',
      id: 'usr_player_ayan',
      name: 'Ayan',
      username: 'Ayan',
      email: 'ayan@starfleet.space',
      role: 'user',
      isGuest: false,
      levelIndex: 40,
      currentLevel: 40,
      totalScore: 982450,
      cumulativeStars: 120,
      totalStars: 120,
      bubblesPopped: 4120,
      comboRecord: 15,
      inventory: { SUPER_AIM: 5, BOMB: 5, RAINBOW: 5, EXTRA_SHOTS: 5, SHUFFLE: 5 },
      boosters: { bomb: 5, rainbow: 5, aim: 5, extraShots: 5 },
      coins: 2400,
      energy: 8,
      progress: Array.from({ length: 40 }, (_, i) => ({ levelId: i + 1, isUnlocked: true, stars: 3, highScore: 26000 })),
      createdAt: new Date('2026-01-05T00:00:00Z'),
      updatedAt: new Date()
    };
    memUsers.set(player2.id, player2);

    const player3 = {
      _id: 'usr_player_bloopi',
      id: 'usr_player_bloopi',
      name: 'Bloopi Captain',
      username: 'BloopiCaptain',
      email: 'bloopi@bubbleblast.game',
      role: 'user',
      isGuest: false,
      levelIndex: 38,
      currentLevel: 38,
      totalScore: 842000,
      cumulativeStars: 110,
      totalStars: 110,
      bubblesPopped: 3250,
      comboRecord: 10,
      inventory: { SUPER_AIM: 3, BOMB: 3, RAINBOW: 3, EXTRA_SHOTS: 3, SHUFFLE: 3 },
      boosters: { bomb: 3, rainbow: 3, aim: 3, extraShots: 3 },
      coins: 1800,
      energy: 5,
      progress: Array.from({ length: 38 }, (_, i) => ({ levelId: i + 1, isUnlocked: true, stars: 3, highScore: 22000 })),
      createdAt: new Date('2026-01-10T00:00:00Z'),
      updatedAt: new Date()
    };
    memUsers.set(player3.id, player3);

    // Initial demo game sessions for admin metrics
    memSessions.set('sess_demo_1', {
      sessionId: 'sess_demo_1',
      sessionToken: 'sess_demo_1',
      userId: adminUser.id,
      username: adminUser.username,
      levelId: 40,
      score: 32000,
      bubblesPopped: 120,
      durationSeconds: 65,
      status: 'COMPLETED',
      timestamps: { startTime: new Date(Date.now() - 3600000), completedAt: new Date() }
    });
    memSessions.set('sess_demo_2', {
      sessionId: 'sess_demo_2',
      sessionToken: 'sess_demo_2',
      userId: player2.id,
      username: player2.username,
      levelId: 40,
      score: 34500,
      bubblesPopped: 135,
      durationSeconds: 58,
      status: 'COMPLETED',
      timestamps: { startTime: new Date(Date.now() - 7200000), completedAt: new Date() }
    });
  }
};
seedMemUsers();

export const isDbConnected = () => mongoose.connection.readyState === 1;

export const StoreService = {
  // --- 1. USERS COLLECTION ---
  async findUserById(id) {
    if (isDbConnected()) {
      try { return await User.findById(id); } catch (e) {}
    }
    return memUsers.get(id) || null;
  },

  async findUserByUsername(username) {
    if (isDbConnected()) {
      try { return await User.findOne({ username }); } catch (e) {}
    }
    for (const u of memUsers.values()) {
      if (u.username.toLowerCase() === username.toLowerCase()) return u;
    }
    return null;
  },

  async findUserByEmail(email) {
    if (isDbConnected()) {
      try { return await User.findOne({ email }); } catch (e) {}
    }
    for (const u of memUsers.values()) {
      if (u.email && u.email.toLowerCase() === email.toLowerCase()) return u;
    }
    return null;
  },

  async createUser(userData) {
    if (isDbConnected()) {
      try {
        const doc = new User(userData);
        return await doc.save();
      } catch (e) {}
    }
    const id = 'usr_' + Date.now() + '_' + Math.random().toString(36).substring(2, 7);
    const user = {
      _id: id,
      id,
      ...userData,
      levelIndex: userData.levelIndex || 1,
      totalScore: userData.totalScore || 0,
      cumulativeStars: userData.cumulativeStars || 0,
      bubblesPopped: userData.bubblesPopped || 0,
      comboRecord: userData.comboRecord || 0,
      inventory: userData.inventory || { SUPER_AIM: 3, BOMB: 3, RAINBOW: 2, EXTRA_SHOTS: 4, SHUFFLE: 3 },
      boosters: userData.boosters || { SUPER_AIM: 3, BOMB: 3, RAINBOW: 2, EXTRA_SHOTS: 4, SHUFFLE: 3 },
      progress: userData.progress || [{ levelId: 1, isUnlocked: true, stars: 0, highScore: 0 }],
      coins: userData.coins || 500,
      energy: 5,
      achievements: []
    };
    memUsers.set(id, user);
    return user;
  },

  async updateUser(id, updates) {
    if (isDbConnected()) {
      try {
        return await User.findByIdAndUpdate(id, updates, { new: true });
      } catch (e) {}
    }
    const existing = memUsers.get(id);
    if (existing) {
      Object.assign(existing, updates);
      memUsers.set(id, existing);
      return existing;
    }
    return null;
  },

  // --- 2. LEVELS COLLECTION ---
  async getLevels(userProgress = []) {
    const progressMap = new Map();
    userProgress.forEach((p) => progressMap.set(p.levelId, p));

    return seedLevels.map((l) => {
      const p = progressMap.get(l.id);
      return {
        id: l.id,
        levelId: l.id,
        name: l.name,
        world: l.world,
        matrix: l.matrix,
        shotBudget: l.maxShots,
        maxShots: l.maxShots,
        starThresholds: l.starScoreThresholds,
        starScoreThresholds: l.starScoreThresholds,
        objective: l.objective,
        colorSpectrum: l.palette,
        palette: l.palette,
        bonusBoosterFlags: ['BOMB', 'SUPER_AIM'],
        // Dynamic player progression fields
        isUnlocked: p ? p.isUnlocked : l.id === 1,
        stars: p ? p.stars : 0,
        highScore: p ? p.highScore : 0
      };
    });
  },

  // --- 3. GAMESESSIONS COLLECTION ---
  async createSession(sessionData) {
    if (isDbConnected()) {
      try {
        const doc = new GameSession(sessionData);
        return await doc.save();
      } catch (e) {}
    }
    memSessions.set(sessionData.sessionToken, sessionData);
    return sessionData;
  },

  async findSession(sessionToken) {
    if (isDbConnected()) {
      try {
        return await GameSession.findOne({
          $or: [{ sessionToken }, { sessionId: sessionToken }, { cryptographicSessionToken: sessionToken }]
        });
      } catch (e) {}
    }
    return memSessions.get(sessionToken) || Array.from(memSessions.values()).find((s) => s.sessionId === sessionToken || s.sessionToken === sessionToken) || null;
  },

  async updateSessionStatus(sessionToken, status, stats = {}) {
    if (isDbConnected()) {
      try {
        return await GameSession.findOneAndUpdate(
          { sessionToken },
          { status, clientStatistics: stats, 'timestamps.completedAt': new Date() },
          { new: true }
        );
      } catch (e) {}
    }
    const sess = memSessions.get(sessionToken);
    if (sess) {
      sess.status = status;
      sess.clientStatistics = stats;
      sess.timestamps = { ...sess.timestamps, completedAt: new Date() };
      memSessions.set(sessionToken, sess);
      return sess;
    }
    return null;
  },

  async getUserSessions(userId) {
    if (isDbConnected()) {
      try {
        return await GameSession.find({ userId }).sort({ 'timestamps.startTime': -1 }).limit(20);
      } catch (e) {}
    }
    const all = Array.from(memSessions.values());
    if (!userId) return all.slice(0, 20);
    return all.filter((s) => s.userId === userId).slice(0, 20);
  },

  // --- 4. LEADERBOARDS COLLECTION ---
  async recordScore(entry) {
    const record = {
      ...entry,
      timeframe: entry.timeframe || 'global',
      verified: true,
      recordedAt: new Date()
    };

    if (isDbConnected()) {
      try {
        const doc = new Leaderboard(record);
        await doc.save();
      } catch (e) {}
    }

    memLeaderboards.push(record);
    return record;
  },

  // Section 15: Leaderboard Engine with Atomic Rank calculations, Single-Pass $facet, and Time-Windowed Partitioning
  async getLeaderboard(timeframe = 'global', limit = 15, currentUserId = null, options = {}) {
    const nowEpoch = Date.now();
    let fromUtcEpoch = options.fromUtcEpoch;
    let toUtcEpoch = options.toUtcEpoch || nowEpoch;

    // Time-windowed partitioning via UTC epoch
    if (!fromUtcEpoch) {
      if (timeframe === 'weekly') {
        fromUtcEpoch = nowEpoch - 7 * 24 * 60 * 60 * 1000; // 7-day UTC epoch window
      } else if (timeframe === 'monthly') {
        fromUtcEpoch = nowEpoch - 30 * 24 * 60 * 60 * 1000; // 30-day UTC epoch window
      } else {
        fromUtcEpoch = 0; // Global epoch
      }
    }

    const partitionWindow = {
      fromUtcEpoch,
      toUtcEpoch,
      fromIso: new Date(fromUtcEpoch).toISOString(),
      toIso: new Date(toUtcEpoch).toISOString()
    };

    let list = [];
    let personalRank = null;

    if (isDbConnected()) {
      try {
        const matchStage = {
          verified: true,
          recordedAt: { $gte: new Date(fromUtcEpoch), $lte: new Date(toUtcEpoch) }
        };
        if (timeframe !== 'global') {
          matchStage.timeframe = timeframe;
        }

        // Single-pass $facet aggregation to display top players alongside user relative ranking
        const facetResults = await Leaderboard.aggregate([
          { $match: matchStage },
          { $sort: { score: -1, cumulativeStars: -1, totalStars: -1 } },
          {
            $facet: {
              topTier: [
                { $limit: limit },
                {
                  $project: {
                    _id: 0,
                    userId: 1,
                    username: 1,
                    avatarUrl: 1,
                    score: 1,
                    stars: 1,
                    cumulativeStars: 1,
                    timeframe: 1,
                    recordedAt: 1
                  }
                }
              ],
              userRanking: [
                {
                  $group: {
                    _id: null,
                    allRecords: { $push: "$$ROOT" }
                  }
                },
                { $unwind: { path: "$allRecords", includeArrayIndex: "rankIndex" } },
                { $match: { "allRecords.userId": currentUserId } },
                {
                  $project: {
                    _id: 0,
                    rank: { $add: ["$rankIndex", 1] },
                    userId: "$allRecords.userId",
                    username: "$allRecords.username",
                    score: "$allRecords.score",
                    cumulativeStars: "$allRecords.cumulativeStars"
                  }
                }
              ]
            }
          }
        ]);

        if (facetResults && facetResults.length > 0) {
          const res = facetResults[0];
          list = (res.topTier || []).map((item, idx) => ({ rank: idx + 1, ...item }));
          personalRank = res.userRanking?.[0] || null;
        }
      } catch (e) {}
    }

    // In-memory fallback with single-pass facet parity
    if (list.length === 0) {
      if (memLeaderboards.length === 0) {
        list = [
          { rank: 1, userId: 'u1', username: 'Ayan', name: 'Ayan', score: 982450, totalScore: 982450, stars: 3, cumulativeStars: 120, totalStars: 120, levelsCompleted: 40 },
          { rank: 2, userId: 'u2', username: 'Prabhuteja', name: 'Prabhuteja', score: 914820, totalScore: 914820, stars: 3, cumulativeStars: 118, totalStars: 118, levelsCompleted: 40 },
          { rank: 3, userId: 'u3', username: 'BloopiCaptain', name: 'BloopiCaptain', score: 842000, totalScore: 842000, stars: 3, cumulativeStars: 110, totalStars: 110, levelsCompleted: 38 },
          { rank: 4, userId: 'u4', username: 'NovaBlaster', name: 'NovaBlaster', score: 765000, totalScore: 765000, stars: 2, cumulativeStars: 98, totalStars: 98, levelsCompleted: 35 },
          { rank: 5, userId: 'u5', username: 'CosmicExplorer', name: 'CosmicExplorer', score: 689000, totalScore: 689000, stars: 2, cumulativeStars: 90, totalStars: 90, levelsCompleted: 32 }
        ];
      } else {
        const filtered = memLeaderboards.filter((item) => {
          const recTime = new Date(item.recordedAt || nowEpoch).getTime();
          const inWindow = recTime >= fromUtcEpoch && recTime <= toUtcEpoch;
          const matchTf = !timeframe || timeframe === 'global' || item.timeframe === timeframe;
          return inWindow && matchTf;
        });

        // Atomic sort on { totalScore: -1, totalStars: -1 }
        filtered.sort((a, b) => {
          const diffScore = (b.score || b.totalScore || 0) - (a.score || a.totalScore || 0);
          if (diffScore !== 0) return diffScore;
          return (b.cumulativeStars || b.totalStars || 0) - (a.cumulativeStars || a.totalStars || 0);
        });

        list = filtered.slice(0, limit).map((s, idx) => ({ rank: idx + 1, ...s }));

        if (currentUserId) {
          const userIdx = filtered.findIndex((x) => x.userId === currentUserId);
          if (userIdx >= 0) {
            personalRank = { rank: userIdx + 1, ...filtered[userIdx] };
          }
        }
      }
    }

    if (!personalRank && currentUserId) {
      const foundInList = list.find((x) => x.userId === currentUserId);
      if (foundInList) personalRank = foundInList;
    }

    return {
      timeframe,
      partitionWindow,
      rankings: list,
      personalRank
    };
  },

  // --- 5. ACHIEVEMENTS COLLECTION ---
  async getAchievements(userId = null) {
    let unlockedSet = new Set();
    if (userId) {
      const user = await this.findUserById(userId);
      if (user && user.achievements) {
        user.achievements.forEach((a) => unlockedSet.add(a.id));
      }
    }

    return STATIC_ACHIEVEMENTS.map((ach) => ({
      ...ach,
      isUnlocked: unlockedSet.has(ach.id),
      unlockedAt: unlockedSet.has(ach.id) ? new Date() : null
    }));
  },

  // Custom Levels
  async saveCustomLevel(levelData) {
    if (isDbConnected()) {
      try {
        const doc = new CustomLevel(levelData);
        return await doc.save();
      } catch (e) {}
    }
    memCustomLevels.push(levelData);
    return levelData;
  },

  async getCustomLevels() {
    if (isDbConnected()) {
      try {
        const list = await CustomLevel.find().sort({ createdAt: -1 });
        if (list.length > 0) return list;
      } catch (e) {}
    }
    return memCustomLevels;
  },

  // --- 6. ADMIN PORTAL METRICS & MANAGEMENT ---
  async getAdminStats() {
    if (isDbConnected()) {
      try {
        const totalUsers = await User.countDocuments().maxTimeMS(3000);
        const testUsers = await User.countDocuments({ username: /^AstralTester_/ }).maxTimeMS(3000);
        const realUsers = Math.max(0, totalUsers - testUsers);
        const totalSessions = await GameSession.countDocuments().maxTimeMS(3000);
        const totalLevels = await Level.countDocuments().maxTimeMS(3000);
        const totalCustomLevels = await CustomLevel.countDocuments().maxTimeMS(3000);
        const totalLeaderboards = await Leaderboard.countDocuments().maxTimeMS(3000);

        const statsAgg = await GameSession.aggregate([
          {
            $group: {
              _id: null,
              totalScoreAccumulated: { $sum: '$score' },
              totalBubblesPopped: { $sum: '$bubblesPopped' },
              avgDurationSeconds: { $avg: '$durationSeconds' }
            }
          }
        ]).option({ maxTimeMS: 3000 });

        const aggregateMetrics = statsAgg[0] || {
          totalScoreAccumulated: 0,
          totalBubblesPopped: 0,
          avgDurationSeconds: 0
        };

        return {
          users: {
            total: totalUsers,
            real: realUsers,
            testAccounts: testUsers
          },
          gameplay: {
            totalSessions,
            totalScoreAccumulated: aggregateMetrics.totalScoreAccumulated,
            totalBubblesPopped: aggregateMetrics.totalBubblesPopped,
            avgDurationSeconds: Math.round(aggregateMetrics.avgDurationSeconds || 0)
          },
          content: {
            officialLevels: totalLevels || seedLevels.length,
            communityCustomLevels: totalCustomLevels,
            leaderboardEntries: totalLeaderboards
          },
          database: {
            connected: true,
            cluster: 'MongoDB Atlas (bubbleshooter.ms5kfjo.mongodb.net)',
            dbName: 'bubble_blast'
          }
        };
      } catch (e) {
        console.warn('MongoDB stats query timed out, returning in-memory stats:', e.message);
      }
    }

    // In-memory fallback
    const allUsers = Array.from(new Set(memUsers.values()));
    const testAccounts = allUsers.filter(u => u.username && u.username.startsWith('AstralTester_')).length;
    const realUsers = allUsers.length - testAccounts;
    const allSessions = Array.from(memSessions.values());
    const totalScoreAccumulated = allSessions.reduce((acc, s) => acc + (s.score || 0), 0);
    const totalBubblesPopped = allSessions.reduce((acc, s) => acc + (s.bubblesPopped || 0), 0);
    const avgDurationSeconds = allSessions.length > 0
      ? Math.round(allSessions.reduce((acc, s) => acc + (s.durationSeconds || 60), 0) / allSessions.length)
      : 0;

    return {
      users: {
        total: allUsers.length,
        real: realUsers,
        testAccounts
      },
      gameplay: {
        totalSessions: allSessions.length,
        totalScoreAccumulated,
        totalBubblesPopped,
        avgDurationSeconds
      },
      content: {
        officialLevels: seedLevels.length,
        communityCustomLevels: memCustomLevels.length,
        leaderboardEntries: memLeaderboards.length || 5
      },
      database: {
        connected: false,
        cluster: 'In-Memory Store (Active Fallback)',
        dbName: 'bubble_blast (in-memory)'
      }
    };
  },

  async getAllUsers({ search, filter = 'all', page = 1, limit = 50 }) {
    const skip = (Number(page) - 1) * Number(limit);

    if (isDbConnected()) {
      try {
        const query = {};
        if (filter === 'real') {
          query.username = { $not: /^AstralTester_/ };
        } else if (filter === 'test') {
          query.username = /^AstralTester_/;
        }

        if (search && search.trim()) {
          const term = search.trim();
          query.$or = [
            { username: { $regex: term, $options: 'i' } },
            { name: { $regex: term, $options: 'i' } },
            { email: { $regex: term, $options: 'i' } }
          ];
        }

        const totalMatching = await User.countDocuments(query).maxTimeMS(3000);
        const users = await User.find(query, { password: 0, passwordHash: 0 })
          .sort({ createdAt: -1 })
          .skip(skip)
          .limit(Number(limit))
          .lean()
          .maxTimeMS(3000);

        return {
          total: totalMatching,
          page: Number(page),
          limit: Number(limit),
          users
        };
      } catch (e) {
        console.warn('MongoDB getAllUsers query timed out, falling back to in-memory store:', e.message);
      }
    }

    // In-memory fallback
    let all = Array.from(new Set(memUsers.values()));

    if (filter === 'real') {
      all = all.filter(u => !u.username || !u.username.startsWith('AstralTester_'));
    } else if (filter === 'test') {
      all = all.filter(u => u.username && u.username.startsWith('AstralTester_'));
    }

    if (search && search.trim()) {
      const term = search.trim().toLowerCase();
      all = all.filter(u =>
        (u.username && u.username.toLowerCase().includes(term)) ||
        (u.name && u.name.toLowerCase().includes(term)) ||
        (u.email && u.email.toLowerCase().includes(term))
      );
    }

    all.sort((a, b) => new Date(b.createdAt || 0) - new Date(a.createdAt || 0));

    const total = all.length;
    const paginated = all.slice(skip, skip + Number(limit));
    const safeUsers = paginated.map(u => {
      const { password, passwordHash, ...safe } = u;
      return safe;
    });

    return {
      total,
      page: Number(page),
      limit: Number(limit),
      users: safeUsers
    };
  },

  async getUserDetailsForAdmin(id) {
    if (isDbConnected()) {
      try {
        const user = await User.findById(id, { password: 0, passwordHash: 0 }).lean().maxTimeMS(3000);
        if (user) {
          const recentSessions = await GameSession.find({
            $or: [{ userId: id }, { username: user.username }]
          })
            .sort({ createdAt: -1 })
            .limit(10)
            .lean()
            .maxTimeMS(3000);
          return { user, recentSessions };
        }
      } catch (e) {}
    }

    const user = memUsers.get(id) || Array.from(memUsers.values()).find(u => u.id === id || u._id === id || u.username === id);
    if (!user) return null;

    const { password, passwordHash, ...safeUser } = user;
    const recentSessions = Array.from(memSessions.values())
      .filter(s => s.userId === id || s.username === user.username)
      .slice(0, 10);

    return { user: safeUser, recentSessions };
  },

  async deleteUser(id) {
    let deletedUser = null;
    if (isDbConnected()) {
      try {
        deletedUser = await User.findByIdAndDelete(id).maxTimeMS(3000);
      } catch (e) {}
    }

    const mem = memUsers.get(id) || Array.from(memUsers.values()).find(u => u.id === id || u._id === id);
    if (mem) {
      memUsers.delete(mem.id || mem._id);
      memUsers.delete(id);
      if (mem.username) memUsers.delete(mem.username);
      if (!deletedUser) deletedUser = mem;
    }

    return deletedUser;
  },

  async cleanupTestUsers() {
    let deletedCount = 0;
    if (isDbConnected()) {
      try {
        const res = await User.deleteMany({ username: /^AstralTester_/ }).maxTimeMS(3000);
        deletedCount = res.deletedCount || 0;
      } catch (e) {}
    }

    for (const [key, user] of memUsers.entries()) {
      if (user.username && user.username.startsWith('AstralTester_')) {
        memUsers.delete(key);
        deletedCount++;
      }
    }

    return deletedCount;
  }
};

export default StoreService;
