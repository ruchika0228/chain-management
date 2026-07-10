#!/bin/bash

# IT Change Request Management System - Backup Script
# This script creates backups of the database and application data

# Configuration
BACKUP_DIR="/home/soc/it_crms_backups"
PROJECT_DIR="/home/soc/Change management/copy_form"
DATE=$(date +%Y%m%d_%H%M%S)
RETENTION_DAYS=30

# Database credentials
DB_HOST="localhost"
DB_PORT="3306"
DB_NAME="it_crms"
DB_USER="root"
DB_PASSWORD="root1234"

# Colors for output
RED='\033[0;31m'
GREEN='\033[0;32m'
YELLOW='\033[1;33m'
BLUE='\033[0;34m'
NC='\033[0m' # No Color

# Logging function
log() {
    echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"
}

error() {
    echo -e "${RED}[ERROR]${NC} $1"
}

warning() {
    echo -e "${YELLOW}[WARNING]${NC} $1"
}

info() {
    echo -e "${BLUE}[INFO]${NC} $1"
}

# Create backup directory if it doesn't exist
mkdir -p "$BACKUP_DIR"

log "Starting IT CRMS backup process..."

# 1. Database Backup
log "Creating database backup..."
DB_BACKUP_FILE="$BACKUP_DIR/it_crms_db_backup_$DATE.sql"

if mysqldump -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME > "$DB_BACKUP_FILE" 2>/dev/null; then
    log "Database backup completed: $DB_BACKUP_FILE"
    
    # Compress the backup
    gzip "$DB_BACKUP_FILE"
    log "Database backup compressed: ${DB_BACKUP_FILE}.gz"
else
    error "Database backup failed!"
    exit 1
fi

# 2. Docker Volume Backup (MySQL data directory)
log "Creating Docker volume backup..."
VOLUME_BACKUP_FILE="$BACKUP_DIR/mysql_data_backup_$DATE.tar.gz"

if docker run --rm \
    -v copy_form_mysql_data:/data \
    -v "$BACKUP_DIR":/backup \
    ubuntu:20.04 \
    tar -czf "/backup/mysql_data_backup_$DATE.tar.gz" -C /data . 2>/dev/null; then
    log "Docker volume backup completed: $VOLUME_BACKUP_FILE"
else
    warning "Docker volume backup failed (containers might be running)"
fi

# 3. Application Files Backup
log "Creating application files backup..."
APP_BACKUP_FILE="$BACKUP_DIR/it_crms_app_backup_$DATE.tar.gz"

cd "$(dirname "$PROJECT_DIR")"
if tar -czf "$APP_BACKUP_FILE" \
    --exclude="node_modules" \
    --exclude="dist" \
    --exclude=".git" \
    --exclude="*.log" \
    "$(basename "$PROJECT_DIR")" 2>/dev/null; then
    log "Application backup completed: $APP_BACKUP_FILE"
else
    error "Application backup failed!"
    exit 1
fi

# 4. Create backup manifest
MANIFEST_FILE="$BACKUP_DIR/backup_manifest_$DATE.txt"
cat > "$MANIFEST_FILE" << EOF
IT Change Request Management System - Backup Manifest
Generated: $(date)
Server: $(hostname)
Backup Location: $BACKUP_DIR

Files in this backup:
- Database dump: it_crms_db_backup_${DATE}.sql.gz
- MySQL data volume: mysql_data_backup_${DATE}.tar.gz (if successful)
- Application files: it_crms_app_backup_${DATE}.tar.gz

Database Info:
- Database: $DB_NAME
- Host: $DB_HOST
- Port: $DB_PORT

Restore Instructions:
1. Database: gunzip it_crms_db_backup_${DATE}.sql.gz && mysql -u root -p it_crms < it_crms_db_backup_${DATE}.sql
2. Volume: docker volume create mysql_data && docker run --rm -v mysql_data:/data -v \$(pwd):/backup ubuntu tar -xzf /backup/mysql_data_backup_${DATE}.tar.gz -C /data
3. Application: tar -xzf it_crms_app_backup_${DATE}.tar.gz

EOF

log "Backup manifest created: $MANIFEST_FILE"

# 5. Cleanup old backups
log "Cleaning up backups older than $RETENTION_DAYS days..."
find "$BACKUP_DIR" -name "it_crms_*" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null
find "$BACKUP_DIR" -name "backup_manifest_*" -type f -mtime +$RETENTION_DAYS -delete 2>/dev/null

# 6. Show backup summary
log "Backup process completed successfully!"
info "Backup files created in: $BACKUP_DIR"
info "Total backup size: $(du -sh "$BACKUP_DIR" | cut -f1)"

echo
echo "=== BACKUP SUMMARY ==="
ls -lh "$BACKUP_DIR"/*_${DATE}*
echo "======================="