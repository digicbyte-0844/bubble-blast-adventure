import StoreService from '../services/store.js';

/**
 * GET /api/admin/stats
 * Overview metrics of users, gameplay sessions, and database collections
 * Supported in dual-persistence mode: Cloud MongoDB Atlas with In-Memory fallback
 */
export const getAdminStats = async (req, res) => {
  try {
    const stats = await StoreService.getAdminStats();
    res.json({
      success: true,
      data: stats
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
    const result = await StoreService.getAllUsers({ search, filter, page: Number(page), limit: Number(limit) });
    res.json({
      success: true,
      total: result.total,
      page: result.page,
      limit: result.limit,
      users: result.users
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
    const result = await StoreService.getUserDetailsForAdmin(id);

    if (!result || !result.user) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      user: result.user,
      recentSessions: result.recentSessions || []
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
    const deleted = await StoreService.deleteUser(id);

    if (!deleted) {
      return res.status(404).json({ success: false, message: 'User not found' });
    }

    res.json({
      success: true,
      message: `User '${deleted.username || id}' deleted successfully`
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
    const deletedCount = await StoreService.cleanupTestUsers();
    res.json({
      success: true,
      message: `Cleaned up ${deletedCount} test accounts successfully`,
      deletedCount
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
