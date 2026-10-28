import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';
import StoreService from '../services/store.js';

const generateToken = (user) => {
  const isAdmin =
    user.role === 'admin' ||
    user.username === 'admin' ||
    user.username === 'Always_Prabhu' ||
    user.email === 'prabhudemo@gmail.com' ||
    user.username === 'prabhudemo';

  return jwt.sign(
    {
      id: user._id || user.id,
      username: user.username,
      isGuest: user.isGuest,
      role: isAdmin ? 'admin' : (user.role || 'user')
    },
    process.env.JWT_SECRET || 'super_secure_jwt_secret_key_minimum_64_characters_long',
    { expiresIn: process.env.JWT_EXPIRES_IN || '7d' }
  );
};

export const register = async (req, res) => {
  try {
    const name = req.body.name || req.body.username;
    const username = (req.body.username || name || '').trim();
    const email = (req.body.email || `${(username || 'player').toLowerCase().replace(/\s+/g, '_')}@starfleet.space`).trim();
    const password = req.body.password;

    if (!username || !password) {
      return res.status(400).json({ success: false, message: 'Username and password are required' });
    }

    if (username.length < 3 || username.length > 30) {
      return res.status(400).json({ success: false, message: 'Username must be between 3 and 30 characters' });
    }

    if (!/^[a-zA-Z0-9_]+$/.test(username)) {
      return res.status(400).json({ success: false, message: 'Username may only contain letters, numbers, and underscores' });
    }

    if (password.length < 6) {
      return res.status(400).json({ success: false, message: 'Password must be at least 6 characters long' });
    }

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!emailRegex.test(email)) {
      return res.status(400).json({ success: false, message: 'A valid email address is required' });
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

    if ((!username && !email) || !password) {
      return res.status(400).json({ success: false, message: 'Username/email and password are required' });
    }

    const cleanIdentifier = ((email || username) || '').trim().toLowerCase();
    const isAdminAccount =
      cleanIdentifier === 'prabhudemo@gmail.com' ||
      cleanIdentifier === 'prabhudemo' ||
      cleanIdentifier === 'admin' ||
      cleanIdentifier === 'always_prabhu';

    let user = null;
    if (email) {
      user = await StoreService.findUserByEmail(email);
    }
    if (!user && (username || email)) {
      user = await StoreService.findUserByUsername(username || email);
    }

    // Special Auto-Provisioning & Verification for Admin Pilot (Prabhuteja Koda)
    if (isAdminAccount) {
      const validAdminPasses = ['Always_Prabhu', 'Admin@123', 'Admin@Bubble2026!', 'prabhu123'];
      let isMatch = validAdminPasses.includes(password);

      if (!user) {
        user = await StoreService.createUser({
          name: 'Prabhuteja Koda',
          username: 'Always_Prabhu',
          email: 'prabhudemo@gmail.com',
          password: await bcrypt.hash(password || 'Admin@Bubble2026!', 10),
          role: 'admin',
          coins: 5000,
          energy: 10,
          levelIndex: 40,
          totalScore: 914820,
          cumulativeStars: 118,
          isGuest: false
        });
      } else if (!isMatch && user.password) {
        isMatch = await bcrypt.compare(password, user.password).catch(() => false);
      }

      if (!isMatch) {
        return res.status(401).json({ success: false, message: 'Invalid admin credentials' });
      }

      user.role = 'admin';
      const token = generateToken(user);
      const userPayload = {
        id: user._id || user.id,
        name: user.name || 'Prabhuteja Koda',
        username: user.username || 'Always_Prabhu',
        email: user.email || 'prabhudemo@gmail.com',
        role: 'admin',
        isGuest: false,
        currentLevel: 40,
        totalScore: 914820,
        totalStars: 118,
        boosters: { bomb: 10, rainbow: 10, aim: 10, extraShots: 10 },
        coins: 5000,
        energy: 10
      };

      return res.json({
        success: true,
        token,
        user: userPayload,
        data: {
          token,
          user: userPayload
        }
      });
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
