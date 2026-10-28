import express from 'express';
import { protectRoute, optionalAuth, requireAdmin } from '../middleware/auth.js';
import * as authCtrl from '../controllers/authController.js';
import * as gameCtrl from '../controllers/gameController.js';
import * as levelCtrl from '../controllers/levelController.js';
import * as socialCtrl from '../controllers/socialController.js';
import * as adminCtrl from '../controllers/adminController.js';

const router = express.Router();

// Auth Routes
// POST /api/auth/register — Create player account
router.post('/auth/register', authCtrl.register);
// POST /api/auth/login — Authenticate and receive Bearer JWT
router.post('/auth/login', authCtrl.login);
router.get('/auth/me', protectRoute, authCtrl.getMe);
router.post('/auth/logout', authCtrl.logout);
router.post('/auth/guest', authCtrl.guest);
router.get('/user/profile', protectRoute, authCtrl.getProfile);
router.get('/user/progress', optionalAuth, authCtrl.getProgress);
router.get('/player/progress', optionalAuth, authCtrl.getProgress);

// Level Catalog Routes
// GET /api/levels — Fetch unlocked levels & star ratings
router.get('/levels', optionalAuth, levelCtrl.getAllLevels);
router.get('/levels/:id', optionalAuth, levelCtrl.getLevelById);
router.post('/levels', protectRoute, levelCtrl.createLevel);

// Game Session & Anti-Cheat Routes (State-Modifying Endpoints protected by protectRoute)
// POST /api/games/start — Initialize anti-cheat game session token
router.post('/games/start', protectRoute, gameCtrl.startSession);
// POST /api/games/complete — Submit game score with anti-cheat verification
router.post('/games/complete', protectRoute, gameCtrl.completeSession);
router.get('/games/history', protectRoute, gameCtrl.getGameHistory);
router.get('/games/:id', protectRoute, gameCtrl.getGameById);

// Social, Leaderboard & Achievements
// GET /api/leaderboard — Global, weekly, and personal rank endpoints
router.get('/leaderboard', optionalAuth, socialCtrl.getLeaderboard);
router.get('/leaderboard/me', protectRoute, socialCtrl.getLeaderboardMe);
// GET /api/achievements/me — Fetch personal achievement status with progress percentages (Protected)
router.get('/achievements/me', protectRoute, socialCtrl.getMyAchievements);
// GET /api/achievements — Fetch achievement progress and unlock history
router.get('/achievements', optionalAuth, socialCtrl.getAchievements);
router.get('/daily-challenge', socialCtrl.getDailyChallenge);
router.post('/daily-challenge/complete', protectRoute, socialCtrl.completeDailyChallenge);

// Visual Level Editor (State-Modifying Endpoint protected by protectRoute)
router.post('/editor/save', protectRoute, socialCtrl.saveCustomLevel);
router.get('/editor/levels', socialCtrl.getCustomLevels);

// Admin Portal Endpoints (Protected by requireAdmin)
router.get('/admin/stats', requireAdmin, adminCtrl.getAdminStats);
router.get('/admin/users', requireAdmin, adminCtrl.getAllUsers);
router.get('/admin/users/:id', requireAdmin, adminCtrl.getUserById);
router.delete('/admin/users/:id', requireAdmin, adminCtrl.deleteUser);
router.post('/admin/cleanup-test-users', requireAdmin, adminCtrl.cleanupTestUsers);

export default router;
