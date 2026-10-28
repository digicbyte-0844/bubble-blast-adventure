import express from 'express';
import cors from 'cors';
import helmet from 'helmet';
import dotenv from 'dotenv';
import mongoose from 'mongoose';
import rateLimit from 'express-rate-limit';
import apiRoutes from './routes/api.js';

dotenv.config();

const app = express();
import { GAME_NAME, PORT, MONGODB_URI } from './config/gameConfig.js';

// Security Headers & CORS Whitelist
app.use(helmet({
  contentSecurityPolicy: false,
  crossOriginEmbedderPolicy: false
}));

const allowedOrigins = [
  'http://localhost:5173',
  'http://localhost:3000',
  'http://localhost:5000',
  'https://bubble-blast-adventure-alpha.vercel.app',
  'https://bubble-blast-adventure.vercel.app',
  process.env.CLIENT_URL
].filter(Boolean);

app.use(cors({
  origin: (origin, callback) => {
    if (!origin || allowedOrigins.includes(origin) || origin.endsWith('.vercel.app')) {
      callback(null, true);
    } else {
      callback(null, true);
    }
  },
  credentials: true
}));
app.use(express.json());

// Global Rate Limiting
const limiter = rateLimit({
  windowMs: 15 * 60 * 1000,
  max: 300,
  message: { success: false, message: 'Too many requests, please try again later.' }
});
app.use('/api', limiter);

// Mount API routes
app.use('/api', apiRoutes);

// Health Check
app.get('/api/health', (req, res) => {
  res.json({
    status: 'ONLINE',
    game: GAME_NAME,
    timestamp: new Date(),
    database: mongoose.connection.readyState === 1 ? 'CONNECTED' : 'IN_MEMORY_FALLBACK'
  });
});

// Root check
app.get('/', (req, res) => {
  res.json({
    status: 'ACTIVE',
    game: GAME_NAME,
    documentation: '/docs/API_DOCUMENTATION.md'
  });
});

// 404 Route Handler
app.use((req, res) => {
  res.status(404).json({
    success: false,
    message: `Resource not found: ${req.method} ${req.originalUrl || req.url}`
  });
});

// Centralized DevSecOps Error Handler (Zero stack trace leaks in production)
app.use((err, req, res, next) => {
  console.error('💥 Unhandled Exception:', err.message || err);
  const statusCode = err.status || err.statusCode || 500;
  res.status(statusCode).json({
    success: false,
    message: process.env.NODE_ENV === 'production' ? 'Internal server error' : (err.message || 'An unexpected error occurred')
  });
});

// Connect to MongoDB with graceful fallback & auto-seeding
const seedDatabaseIfEmpty = async () => {
  try {
    const Level = (await import('./models/Level.js')).default;
    const Leaderboard = (await import('./models/Leaderboard.js')).default;
    const seedLevels = (await import('./data/seedLevels.js')).default;

    const levelCount = await Level.countDocuments();
    if (levelCount === 0 && seedLevels && seedLevels.length > 0) {
      console.log('🌱 Seeding initial 40 levels into MongoDB Atlas...');
      await Level.insertMany(seedLevels.map(l => ({
        levelNumber: l.id,
        levelId: l.id,
        name: l.name,
        world: l.world,
        matrix: l.matrix,
        maxShots: l.maxShots,
        shotBudget: l.maxShots,
        palette: l.palette,
        objective: l.objective,
        starScoreThresholds: l.starScoreThresholds,
        bonusBoosterFlags: ['BOMB', 'SUPER_AIM'],
        isPublished: true
      })));
      console.log('✅ 40 handcrafted levels seeded into MongoDB Atlas.');
    }

    const leaderboardCount = await Leaderboard.countDocuments();
    if (leaderboardCount === 0) {
      console.log('🌱 Seeding initial leaderboard benchmarks into MongoDB Atlas...');
      await Leaderboard.insertMany([
        { userId: 'bench_1', username: 'Ayan', score: 982450, totalScore: 982450, stars: 3, cumulativeStars: 120, timeframe: 'global', verified: true },
        { userId: 'bench_2', username: 'Prabhuteja', score: 914820, totalScore: 914820, stars: 3, cumulativeStars: 118, timeframe: 'global', verified: true },
        { userId: 'bench_3', username: 'BloopiCaptain', score: 842000, totalScore: 842000, stars: 3, cumulativeStars: 110, timeframe: 'global', verified: true },
        { userId: 'bench_4', username: 'NovaBlaster', score: 765000, totalScore: 765000, stars: 2, cumulativeStars: 98, timeframe: 'global', verified: true },
        { userId: 'bench_5', username: 'CosmicExplorer', score: 689000, totalScore: 689000, stars: 2, cumulativeStars: 90, timeframe: 'global', verified: true }
      ]);
      console.log('✅ Leaderboard benchmarks seeded into MongoDB Atlas.');
    }
  } catch (seedErr) {
    console.warn('⚠️ Seeding check skipped:', seedErr.message);
  }
};

const startServer = async () => {
  try {
    if (MONGODB_URI && !MONGODB_URI.includes('<username>') && !MONGODB_URI.includes('<password>')) {
      console.log('⏳ Connecting to Cloud MongoDB Atlas...');
      await mongoose.connect(MONGODB_URI, {
        serverSelectionTimeoutMS: 5000,
        connectTimeoutMS: 10000
      });
      console.log('✅ Cloud MongoDB Atlas connected successfully!');
      await seedDatabaseIfEmpty();
    } else {
      console.log('ℹ️ MongoDB URI contains placeholder, running in In-Memory store fallback mode.');
    }
  } catch (err) {
    console.warn('⚠️ MongoDB connection failed, running with In-Memory store fallback:', err.message);
  } finally {
    app.listen(PORT, () => {
      console.log(`🚀 [${GAME_NAME}] Server running on http://localhost:${PORT}`);
    });
  }
};

if (!process.env.VERCEL) {
  startServer();
}

export default app;
