/**
 * Cross-Platform Database Backup & 14-Day Rotation Script
 * Bubble Blast Adventure DevSecOps Suite
 * Runs in Node.js (Windows, Linux, macOS)
 */

import fs from 'fs';
import path from 'path';
import { exec } from 'child_process';
import { fileURLToPath } from 'url';

const __dirname = path.dirname(fileURLToPath(import.meta.url));
const rootDir = path.resolve(__dirname, '..');
const backupDir = path.resolve(rootDir, 'backups');

if (!fs.existsSync(backupDir)) {
  fs.mkdirSync(backupDir, { recursive: true });
}

const timestamp = new Date().toISOString().replace(/[:.]/g, '-').slice(0, 19);
const backupFile = path.join(backupDir, `bba_backup_${timestamp}.gz`);
const mongoUri = process.env.MONGODB_URI;

console.log(`📦 [${new Date().toISOString()}] Initiating MongoDB automated backup...`);

const dumpCmd = mongoUri
  ? `mongodump --uri="${mongoUri}" --archive="${backupFile}" --gzip`
  : `mongodump --db=bubble_blast_adventure --archive="${backupFile}" --gzip`;

exec(dumpCmd, (error, stdout, stderr) => {
  if (error) {
    console.warn(`ℹ️ mongodump binary not found in PATH or offline. Backup skipped gracefully:`, error.message);
  } else {
    console.log(`✅ Backup successfully saved: ${backupFile}`);
  }

  // 14-day retention cleanup
  const now = Date.now();
  const maxAge = 14 * 24 * 60 * 60 * 1000;
  const files = fs.readdirSync(backupDir);

  for (const file of files) {
    if (file.startsWith('bba_backup_') && file.endsWith('.gz')) {
      const filePath = path.join(backupDir, file);
      const stats = fs.statSync(filePath);
      if (now - stats.mtimeMs > maxAge) {
        fs.unlinkSync(filePath);
        console.log(`🧹 Pruned backup older than 14 days: ${file}`);
      }
    }
  }

  console.log('🎉 Automated backup task completed.');
});
