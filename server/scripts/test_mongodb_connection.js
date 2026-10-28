/**
 * Standalone MongoDB Atlas Diagnostic Script
 * Tests DNS SRV lookup, TLS/SSL connection, authentication, and collection access.
 */

import mongoose from 'mongoose';
import dotenv from 'dotenv';
import path from 'path';

// Load .env
dotenv.config();
if (!process.env.MONGODB_URI) {
  dotenv.config({ path: path.resolve('server/.env') });
}

const uri = process.env.MONGODB_URI;

console.log('🔍 Testing Cloud MongoDB Atlas Connection...');
console.log('----------------------------------------------------');

if (!uri) {
  console.error('❌ Error: MONGODB_URI is not defined in server/.env');
  process.exit(1);
}

if (uri.includes('<username>') || uri.includes('<password>')) {
  console.log('⚠️ Notice: MONGODB_URI contains placeholder credentials:');
  console.log(`   ${uri}`);
  console.log('\n👉 Replace <username> and <password> in server/.env with your actual MongoDB Atlas database user credentials.');
  process.exit(0);
}

// Mask password for display
const maskedUri = uri.replace(/:([^@]+)@/, ':****@');
console.log(`📡 Connecting to: ${maskedUri}`);

try {
  const startTime = Date.now();
  await mongoose.connect(uri, {
    serverSelectionTimeoutMS: 5000,
    connectTimeoutMS: 10000
  });

  const duration = Date.now() - startTime;
  console.log(`✅ SUCCESS: Connected to MongoDB Atlas in ${duration}ms!`);

  const adminDb = mongoose.connection.db.admin();
  const pingResult = await adminDb.ping();
  console.log('✅ Server ping response:', pingResult);

  const collections = await mongoose.connection.db.listCollections().toArray();
  console.log(`📊 Found ${collections.length} collections:`, collections.map(c => c.name).join(', ') || '(Empty database - ready for auto-seeding)');

  await mongoose.disconnect();
  console.log('\n🎉 Your Cloud MongoDB Atlas database is 100% configured and verified!');
} catch (err) {
  console.error('\n❌ MongoDB Atlas Connection Failed:');
  console.error(`   ${err.message}`);
  console.log('\n💡 Common Troubleshooting Tips:');
  console.log('   1. IP Whitelist: In MongoDB Atlas -> Network Access, ensure 0.0.0.0/0 (allow from anywhere) is active.');
  console.log('   2. Database User: Ensure the user exists in Database Access and the password matches.');
  console.log('   3. URL Encoding: If your password contains special characters (like @, :, #, ?), URL-encode them.');
  process.exit(1);
}
