import dotenv from 'dotenv';
import mongoose from 'mongoose';
import bcrypt from 'bcryptjs';

dotenv.config();

const run = async () => {
  try {
    await mongoose.connect(process.env.MONGODB_URI);
    const db = mongoose.connection.db;
    const usersColl = db.collection('users');

    // 1. Update Always_Prabhu to role: admin
    const prabhuResult = await usersColl.updateOne(
      { username: 'Always_Prabhu' },
      { $set: { role: 'admin' } }
    );
    console.log('Updated Always_Prabhu role to admin:', prabhuResult.modifiedCount);

    // 2. Check or create dedicated admin account
    const existingAdmin = await usersColl.findOne({ username: 'admin' });
    if (!existingAdmin) {
      const hashedPassword = await bcrypt.hash('Admin@Bubble2026!', 12);
      const adminDoc = {
        name: 'Game Master Admin',
        username: 'admin',
        email: 'admin@bubbleblast.com',
        password: hashedPassword,
        role: 'admin',
        isGuest: false,
        currentLevel: 40,
        levelIndex: 40,
        totalScore: 999999,
        totalStars: 120,
        cumulativeStars: 120,
        bubblesPopped: 5000,
        bestCombo: 25,
        comboRecord: 25,
        rescuedObjects: 100,
        dailyStreak: 30,
        boosterInventory: {
          aimGuide: 99,
          bomb: 99,
          rainbow: 99,
          extraShots: 99,
          shuffle: 99
        },
        inventory: {
          SUPER_AIM: 99,
          BOMB: 99,
          RAINBOW: 99,
          EXTRA_SHOTS: 99,
          SHUFFLE: 99
        },
        coins: 99999,
        energy: 5,
        createdAt: new Date()
      };
      await usersColl.insertOne(adminDoc);
      console.log('Created dedicated admin account: admin / Admin@Bubble2026!');
    } else {
      await usersColl.updateOne(
        { username: 'admin' },
        { $set: { role: 'admin' } }
      );
      console.log('Ensured admin account has role: admin');
    }

    const admins = await usersColl.find({ role: 'admin' }, { projection: { password: 0 } }).toArray();
    console.log('Current Admin Accounts in DB:');
    admins.forEach(a => console.log(`  - Username: ${a.username} | Email: ${a.email} | Role: ${a.role}`));

    await mongoose.disconnect();
    process.exit(0);
  } catch (err) {
    console.error('Error seeding admin:', err);
    process.exit(1);
  }
};

run();
