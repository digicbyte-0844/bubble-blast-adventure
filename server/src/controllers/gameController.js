import crypto from 'crypto';
import StoreService from '../services/store.js';
import AntiCheatService from '../services/antiCheat.js';
import { validateGameScore } from '../utils/scoreValidator.js';
import levels from '../data/seedLevels.js';

// POST /api/games/start — Initialize anti-cheat game session token
export const startSession = async (req, res) => {
  try {
    const { levelId, boostersEquipped } = req.body;
    const level = levels.find((l) => l.id === Number(levelId)) || levels[0];

    const sessionId = 'bba_sess_' + crypto.randomBytes(8).toString('hex');
    const sessionToken = 'tok_sec_' + crypto.randomBytes(16).toString('hex');
    const seed = Math.floor(Math.random() * 10000000);

    const sessionData = {
      sessionId,
      sessionToken,
      cryptographicSessionToken: sessionToken,
      userId: req.user?.id || 'guest',
      levelId: level.id,
      allowedShots: level.maxShots || 30,
      seed,
      startedAt: new Date(),
      startTime: new Date(),
      status: 'ACTIVE',
      clientStatistics: {
        shotsFired: 0,
        remainingShots: level.maxShots || 30,
        elapsedDurationMs: 0,
        bubblesPopped: 0,
        maxCombo: 0,
        dropsAchieved: 0
      },
      boostersEquipped: boostersEquipped || []
    };

    await StoreService.createSession(sessionData);

    res.status(200).json({
      success: true,
      sessionId,
      sessionToken,
      levelId: level.id,
      serverTimestamp: Date.now(),
      data: {
        sessionId,
        sessionToken,
        levelId: level.id,
        allowedShots: level.maxShots || 30,
        seed,
        status: 'ACTIVE',
        serverTimestamp: Date.now()
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/games/complete — Submit game score with anti-cheat verification
export const completeSession = async (req, res) => {
  try {
    const sessionToken = req.headers['x-session-token'] || req.body.sessionToken || req.body.sessionId;
    if (!sessionToken) {
      return res.status(400).json({ success: false, message: 'Missing anti-cheat session token' });
    }

    const session = await StoreService.findSession(sessionToken);
    if (!session) {
      return res.status(404).json({ success: false, message: 'Game session not found or expired' });
    }

    if (session.status !== 'ACTIVE') {
      return res.status(400).json({
        success: false,
        message: `Session is already finalized with status: ${session.status}`
      });
    }

    const shotsFired = Number(req.body.shotsUsed ?? req.body.shotsFired ?? 1);
    const remainingShots = Number(req.body.remainingShots ?? (session.allowedShots ? Math.max(0, session.allowedShots - shotsFired) : 0));
    const elapsedDurationMs = Number(req.body.elapsedDurationMs ?? Math.max(3600, Date.now() - new Date(session.startedAt || session.startTime || Date.now()).getTime()));
    const claimedScore = Number(req.body.score ?? req.body.claimedScore ?? 0);
    const bubblesPopped = Number(req.body.bubblesPopped ?? 0);
    const comboRecord = Number(req.body.bestCombo ?? req.body.comboRecord ?? 1);
    const rescuedJellies = Number(req.body.rescuedCount ?? req.body.rescuedJellies ?? 0);

    const claim = {
      claimedScore,
      shotsFired,
      remainingShots,
      elapsedDurationMs,
      starsEarned: req.body.starsEarned || 1,
      bubblesPopped,
      comboRecord,
      rescuedJellies,
      objectiveCompleted: req.body.completed ?? req.body.objectiveCompleted !== false
    };

    const clientStatistics = {
      shotsFired,
      remainingShots,
      elapsedDurationMs,
      bubblesPopped,
      maxCombo: comboRecord,
      dropsAchieved: req.body.dropsAchieved || 0
    };

    // Run Anti-Cheat Engine Validation
    const level = levels.find((l) => l.id === Number(session.levelId)) || levels[0];
    const audit = AntiCheatService.verifySession(session, claim, level);

    if (!audit.isValid) {
      await StoreService.updateSessionStatus(session.sessionToken, 'REJECTED', clientStatistics);

      return res.status(400).json({
        success: false,
        status: 'REJECTED',
        error: 'ANTI_CHEAT_VIOLATION',
        details: audit.reasons[0]?.message || `Submitted score (${claimedScore}) exceeds theoretical upper limit.`,
        message: audit.reasons[0]?.message || 'Mathematical simulation rejected submitted gameplay score.',
        reasons: audit.reasons,
        theoreticalMaxScore: audit.theoreticalMaxScore
      });
    }

    // Mark session as VERIFIED
    await StoreService.updateSessionStatus(session.sessionToken, 'VERIFIED', clientStatistics);

    const username = req.user?.username || 'CosmicHero';
    const userId = req.user?.id || 'guest';

    // Record verified score in Leaderboard projections
    await StoreService.recordScore({
      userId,
      username,
      levelId: session.levelId,
      score: audit.verifiedScore,
      stars: audit.stars,
      cumulativeStars: audit.stars,
      timeframe: 'global',
      verified: true
    });

    // Update player's aggregate progression in users collection
    if (req.user?.id) {
      const user = await StoreService.findUserById(req.user.id);
      if (user) {
        const progress = user.progress || [];
        const existingIdx = progress.findIndex((p) => p.levelId === session.levelId);
        if (existingIdx >= 0) {
          if (audit.verifiedScore > progress[existingIdx].highScore) {
            progress[existingIdx].highScore = audit.verifiedScore;
          }
          if (audit.stars > progress[existingIdx].stars) {
            progress[existingIdx].stars = audit.stars;
          }
        } else {
          progress.push({
            levelId: session.levelId,
            stars: audit.stars,
            highScore: audit.verifiedScore,
            isUnlocked: true,
            completedAt: new Date()
          });
        }

        // Unlock next level
        const nextLevelId = session.levelId + 1;
        if (!progress.some((p) => p.levelId === nextLevelId) && nextLevelId <= 40) {
          progress.push({ levelId: nextLevelId, stars: 0, highScore: 0, isUnlocked: true });
        }

        const cumulativeStars = progress.reduce((acc, p) => acc + (p.stars || 0), 0);
        const totalScore = progress.reduce((acc, p) => acc + (p.highScore || 0), 0);
        const userPops = (user.bubblesPopped || 0) + (bubblesPopped || 0);
        const userCombo = Math.max(user.comboRecord || 0, comboRecord || 0);

        await StoreService.updateUser(req.user.id, {
          levelIndex: Math.max(user.levelIndex || 1, nextLevelId),
          currentLevel: Math.max(user.currentLevel || 1, nextLevelId),
          totalScore,
          totalStars: cumulativeStars,
          cumulativeStars,
          bubblesPopped: userPops,
          comboRecord: userCombo,
          bestCombo: userCombo,
          progress,
          coins: (user.coins || 0) + 100
        });
      }
    }

    res.json({
      success: true,
      verified: true,
      verifiedScore: audit.verifiedScore,
      verifiedStars: audit.stars,
      unlockedLevel: session.levelId + 1,
      newAchievements: audit.stars === 3 ? ['COMBO_MASTER'] : [],
      data: {
        sessionId: session.sessionId,
        levelId: session.levelId,
        score: audit.verifiedScore,
        stars: audit.stars,
        coinsEarned: 100,
        unlockedNextLevel: session.levelId + 1
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/games/history
export const getGameHistory = async (req, res) => {
  try {
    const history = await StoreService.getUserSessions(req.user?.id);
    res.json({ success: true, history: history || [] });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// GET /api/games/:id
export const getGameById = async (req, res) => {
  try {
    const session = await StoreService.findSession(req.params.id);
    if (!session) return res.status(404).json({ success: false, message: 'Game session not found' });
    res.json({ success: true, session });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export default {
  startSession,
  completeSession,
  getGameHistory,
  getGameById
};
