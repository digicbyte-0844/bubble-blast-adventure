import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import StoreService from '../services/store.js';

const generateToken = (user) => {
  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.username,
      isGuest: user.isGuest,
      role: user.role || (user.username === 'admin' || user.username === 'Always_Prabhu' ? 'admin' : 'user')
    },
    process.env.JWT_SECRET || 'super_secure_jwt_secret_key_minimum_64_characters_long',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const name = req.body.name || req.body.username;
    const username = req.body.username || name;
    const email = req.body.email || `${(username || 'player').toLowerCase().replace(/\s+/g, '_')}@example.com`;
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Name/username and password required' });
    }

    const existing = (await StoreService.findUserByUsername(username)) || (await StoreService.findUserByEmail(email));
    if (existing) {
      return res.status(409).json({ success: false, message: 'Username or email already in use' });
    }

    const hashedPassword = await bcrypt.hash(password, 12);
    const user = await StoreService.createUser({
      name: name || username,
      username,
      email,
      password: hashedPassword,
      isGuest: false
    });

    const token = generateToken(user);
    const userPayload = {
      id: user._id || user.id,
      name: user.name || user.username,
      username: user.username,
      email: user.email,
      role: user.role || (user.username === 'admin' || user.username === 'Always_Prabhu' ? 'admin' : 'user'),
      isGuest: Boolean(user.isGuest),
      currentLevel: user.levelIndex || 1,
      totalScore: user.totalScore || 0,
      totalStars: user.cumulativeStars || 0,
      boosters: {
        bomb: user.inventory?.BOMB ?? 2,
        rainbow: user.inventory?.RAINBOW ?? 2,
        aim: user.inventory?.SUPER_AIM ?? 3,
        extraShots: user.inventory?.EXTRA_SHOTS ?? 2
      },
      coins: user.coins || 500,
      energy: user.energy || 5
    };

    res.status(201).json({
      success: true,
      token,
      user: userPayload,
      data: {
        token,
        user: userPayload
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const login = async (req, res) => {
  try {
    const { username, email, password } = req.body;
    let user = null;
    if (email) {
      user = await StoreService.findUserByEmail(email);
    }
    if (!user && (username || email)) {
      user = await StoreService.findUserByUsername(username || email);
    }

    if (!user) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const isMatch = await bcrypt.compare(password, user.password);
    if (!isMatch) {
      return res.status(401).json({ success: false, message: 'Invalid credentials' });
    }

    const token = generateToken(user);
    const userPayload = {
      id: user._id || user.id,
      name: user.name || user.username,
      username: user.username,
      email: user.email,
      role: user.role || (user.username === 'admin' || user.username === 'Always_Prabhu' ? 'admin' : 'user'),
      isGuest: Boolean(user.isGuest),
      currentLevel: user.levelIndex || 1,
      totalScore: user.totalScore || 0,
      totalStars: user.cumulativeStars || 0,
      boosters: {
        bomb: user.inventory?.BOMB ?? 2,
        rainbow: user.inventory?.RAINBOW ?? 2,
        aim: user.inventory?.SUPER_AIM ?? 3,
        extraShots: user.inventory?.EXTRA_SHOTS ?? 2
      },
      coins: user.coins || 500,
      energy: user.energy || 5
    };

    res.json({
      success: true,
      token,
      user: userPayload,
      data: {
        token,
        user: userPayload
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const guest = async (req, res) => {
  try {
    const randomSuffix = Math.floor(1000 + Math.random() * 9000);
    const username = `StarlightJelly#${randomSuffix}`;
    const user = await StoreService.createUser({
      username,
      isGuest: true,
      coins: 300,
      energy: 5
    });

    const token = generateToken(user);
    res.status(201).json({
      success: true,
      data: {
        token,
        user: { id: user._id || user.id, username: user.username, role: 'user', coins: user.coins, energy: user.energy, isGuest: true }
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getMe = async (req, res) => {
  return getProfile(req, res);
};

export const logout = async (req, res) => {
  res.json({ success: true, message: 'Logged out successfully' });
};

export const getProfile = async (req, res) => {
  try {
    const user = await StoreService.findUserById(req.user.id);
    if (!user) return res.status(404).json({ success: false, message: 'User not found' });
    res.json({ success: true, data: user });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};

export const getProgress = async (req, res) => {
  try {
    if (!req.user?.id) {
      return res.json({
        success: true,
        data: {
          progress: [{ levelId: 1, isUnlocked: true, stars: 0, highScore: 0 }],
          coins: 500,
          energy: 5,
          boosters: {}
        }
      });
    }
    const user = await StoreService.findUserById(req.user.id);
    res.json({
      success: true,
      data: {
        progress: user?.progress || [{ levelId: 1, isUnlocked: true, stars: 0, highScore: 0 }],
        coins: user?.coins || 500,
        energy: user?.energy || 5,
        boosters: user?.boosters || {}
      }
    });
  } catch (err) {
    res.status(500).json({ success: false, message: err.message });
  }
};
