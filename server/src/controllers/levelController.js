import StoreService from '../services/store.js';

// GET /api/levels — Fetch unlocked levels & star ratings
export const getAllLevels = async (req, res) => {
  try {
    let userProgress = [];
    if (req.user?.id) {
      const user = await StoreService.findUserById(req.user.id);
      if (user && user.progress) {
        userProgress = user.progress;
      }
    }

    const levels = await StoreService.getLevels(userProgress);

    res.json({
      success: true,
      data: {
        total: levels.length,
        levels
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getLevelById = async (req, res) => {
  try {
    const id = Number(req.params.id);
    let userProgress = [];
    if (req.user?.id) {
      const user = await StoreService.findUserById(req.user.id);
      if (user && user.progress) userProgress = user.progress;
    }

    const levels = await StoreService.getLevels(userProgress);
    const level = levels.find((l) => l.id === id);
    if (!level) {
      return res.status(404).json({ success: false, message: 'Level not found' });
    }
    res.json({ success: true, data: level });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

// POST /api/levels — Create custom level configuration
export const createLevel = async (req, res) => {
  try {
    const { name, objective, maxShots, shotBudget, palette, matrix, world, starScoreThresholds } = req.body;
    if (!name || !matrix) {
      return res.status(400).json({ success: false, message: 'Name and matrix required' });
    }

    const customId = 'lvl_' + Math.random().toString(36).substring(2, 8);
    const saved = await StoreService.saveCustomLevel({
      customId,
      name,
      world: world || 'Custom Community Sector',
      creatorUsername: req.user?.username || 'Architect',
      objective: objective || { type: 'CLEAR_ALL', target: 0 },
      maxShots: maxShots || shotBudget || 25,
      shotBudget: maxShots || shotBudget || 25,
      palette: palette || ['CYAN', 'MAGENTA', 'GOLD'],
      starScoreThresholds: starScoreThresholds || { oneStar: 2000, twoStar: 4000, threeStar: 7000 },
      matrix,
      createdAt: new Date()
    });

    res.status(201).json({ success: true, data: saved });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
