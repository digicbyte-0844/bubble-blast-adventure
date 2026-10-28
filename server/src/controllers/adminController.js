import User from '../models/User.js';
import GameSession from '../models/GameSession.js';
import Level from '../models/Level.js';
import CustomLevel from '../models/CustomLevel.js';
import Leaderboard from '../models/Leaderboard.js';

/**
 * GET /api/admin/stats
 * Overview metrics of users, gameplay sessions, and database collections
 */
export const getAdminStats = async (req, res) => {
  try {
    const totalUsers = await User.countDocuments();
    const testUsers = await User.countDocuments({ username: /^AstralTester_/ });
    const realUsers = totalUsers - testUsers;
    const totalSessions = await GameSession.countDocuments();
    const totalLevels = await Level.countDocuments();
    const totalCustomLevels = await CustomLevel.countDocuments();
    const totalLeaderboards = await Leaderboard.countDocuments();

    // Aggregated gameplay metrics
    const statsAgg = await GameSession.aggregate([
      {
        $group: {
          _id: null,
          totalScoreAccumulated: { $sum: '$score' },
          totalBubblesPopped: { $sum: '$bubblesPopped' },
          avgDurationSeconds: { $avg: '$durationSeconds' }
        }
      }
    ]);

    const aggregateMetrics = statsAgg[0] || {
      totalScoreAccumulated: 0,
      totalBubblesPopped: 0,
      avgDurationSeconds: 0
    };

    res.json({
      success: true,
      data: {
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
          officialLevels: totalLevels,
          communityCustomLevels: totalCustomLevels,
          leaderboardEntries: totalLeaderboards
        },
        database: {
          connected: true,
          cluster: 'MongoDB Atlas (bubbleshooter.ms5kfjo.mongodb.net)',
          dbName: 'bubble_blast'
        }
      }
    });
  } catch (error) {
    console.error('Error fetching admin stats:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch admin stats', error: error.message });
  }
};

/**
 * GET /api/admin/users
 * Returns list of registered users with filters, search, and pagination
 */
export const getAllUsers = async (req, res) => {
  try {
    const { search, filter = 'all', page = 1, limit = 50 } = req.query;

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

    const skip = (Number(page) - 1) * Number(limit);
    const totalMatching = await User.countDocuments(query);
    const users = await User.find(query, { password: 0, passwordHash: 0 })
      .sort({ createdAt: -1 })
      .skip(skip)
      .limit(Number(limit))
      .lean();

    res.json({
      success: true,
      total: totalMatching,
      page: Number(page),
      limit: Number(limit),
      users
    });
  } catch (error) {
    console.error('Error fetching users for admin:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch registered users', error: error.message });
  }
};

/**
 * GET /api/admin/users/:id
 * Fetches full details and recent game sessions for a specific user
 */
export const getUserById = async (req, res) => {
  try {
    const { id } = req.params;
    const user = await User.findById(id, { password: 0, passwordHash: 0 }).lean();

    if (!user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    const recentSessions = await GameSession.find({
      $or: [{ userId: id }, { username: user.username }]
    })
      .sort({ createdAt: -1 })
      .limit(10)
      .lean();

    res.json({
      success: true,
      user,
      recentSessions
    });
  } catch (error) {
    console.error('Error fetching user details:', error);
    res.status(500).json({ success: false, message: 'Failed to fetch user details', error: error.message });
  }
};

/**
 * DELETE /api/admin/users/:id
 * Deletes a user account by ID
 */
export const deleteUser = async (req, res) => {
  try {
    const { id } = req.params;
    const deleted = await User.findByIdAndDelete(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User '${deleted.username}' deleted successfully`
    });
  } catch (error) {
    console.error('Error deleting user:', error);
    res.status(500).json({ success: false, message: 'Failed to delete user', error: error.message });
  }
};

/**
 * POST /api/admin/cleanup-test-users
 * Deletes all automated test runner users (AstralTester_*)
 */
export const cleanupTestUsers = async (req, res) => {
  try {
    const result = await User.deleteMany({ username: /^AstralTester_/ });
    res.json({
      success: true,
      message: `Cleaned up ${result.deletedCount} test accounts successfully`,
      deletedCount: result.deletedCount
    });
  } catch (error) {
    console.error('Error cleaning up test users:', error);
    res.status(500).json({ success: false, message: 'Failed to cleanup test accounts', error: error.message });
  }
};

export default {
  getAdminStats,
  getAllUsers,
  getUserById,
  deleteUser,
  cleanupTestUsers
};
