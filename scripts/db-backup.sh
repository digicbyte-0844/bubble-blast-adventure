#!/bin/bash
# ==============================================================================
# Bubble Blast Adventure - Automated Database Backup & 14-Day Rotation Script
# Supports: MongoDB Atlas / Local MongoDB mongodump with gzip compression
# Cron Schedule: 0 2 * * * (Daily at 2:00 AM UTC)
# Restore Command: mongorestore --gzip --archive=backups/bba_backup_YYYYMMDD_HHMMSS.gz
# ==============================================================================

set -euo pipefail

BACKUP_DIR="${BACKUP_DIR:-./backups}"
TIMESTAMP=$(date +"%Y%m%d_%H%M%S")
BACKUP_FILE="${BACKUP_DIR}/bba_backup_${TIMESTAMP}.gz"
RETENTION_DAYS=14

mkdir -p "${BACKUP_DIR}"

echo "📦 [$(date)] Starting Bubble Blast Adventure database backup..."

if [ -n "${MONGODB_URI:-}" ]; then
  mongodump --uri="${MONGODB_URI}" --archive="${BACKUP_FILE}" --gzip
  echo "✅ Backup successfully archived to ${BACKUP_FILE}"
else
  echo "⚠️ MONGODB_URI not defined in environment. Fallback to local MongoDB..."
  mongodump --db=bubble_blast_adventure --archive="${BACKUP_FILE}" --gzip
  echo "✅ Local backup successfully archived to ${BACKUP_FILE}"
fi

# Rotate backups older than 14 days
echo "🧹 Pruning backups older than ${RETENTION_DAYS} days..."
find "${BACKUP_DIR}" -type f -name "bba_backup_*.gz" -mtime +${RETENTION_DAYS} -delete

echo "🎉 Database backup process finished successfully."
