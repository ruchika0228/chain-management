#!/bin/bash

# IT Change Request Management System - Restore Script
# This script restores backups of the database and application data

# Configuration
BACKUP_DIR="/home/soc/it_crms_backups"
PROJECT_DIR="/home/soc/Change management/copy_form"

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

# Logging functions
log() { echo -e "${GREEN}[$(date '+%Y-%m-%d %H:%M:%S')]${NC} $1"; }
error() { echo -e "${RED}[ERROR]${NC} $1"; }
warning() { echo -e "${YELLOW}[WARNING]${NC} $1"; }
info() { echo -e "${BLUE}[INFO]${NC} $1"; }

# Function to show available backups
show_backups() {
    echo "Available backups:"
    ls -la "$BACKUP_DIR" | grep "backup_manifest" | while read -r line; do
        file=$(echo "$line" | awk '{print $9}')
        date=$(echo "$file" | sed 's/backup_manifest_\(.*\)\.txt/\1/')
        readable_date=$(echo "$date" | sed 's/\(.*\)_\(.*\)/\1 \2/' | sed 's/_/-/g' | sed 's/\(.*\) \(..\)\(..\)\(..\)/\1 \2:\3:\4/')
        echo "  $readable_date - $file"
    done
}

# Function to restore database
restore_database() {
    local backup_date="$1"
    local db_file="$BACKUP_DIR/it_crms_db_backup_${backup_date}.sql.gz"
    
    if [[ ! -f "$db_file" ]]; then
        error "Database backup file not found: $db_file"
        return 1
    fi
    
    warning "This will REPLACE all current data in the database!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        info "Database restore cancelled."
        return 1
    fi
    
    log "Restoring database from $db_file..."
    
    # Extract and restore
    gunzip -c "$db_file" | mysql -h $DB_HOST -P $DB_PORT -u $DB_USER -p$DB_PASSWORD $DB_NAME
    
    if [[ $? -eq 0 ]]; then
        log "Database restore completed successfully!"
    else
        error "Database restore failed!"
        return 1
    fi
}

# Function to restore Docker volume
restore_volume() {
    local backup_date="$1"
    local volume_file="$BACKUP_DIR/mysql_data_backup_${backup_date}.tar.gz"
    
    if [[ ! -f "$volume_file" ]]; then
        warning "Volume backup file not found: $volume_file"
        return 1
    fi
    
    warning "This will stop MySQL container and replace all data!"
    read -p "Are you sure you want to continue? (yes/no): " confirm
    
    if [[ "$confirm" != "yes" ]]; then
        info "Volume restore cancelled."
        return 1
    fi
    
    log "Stopping MySQL container..."
    cd "$PROJECT_DIR"
    docker-compose stop mysql
    
    log "Restoring MySQL data volume..."
    docker run --rm \
        -v copy_form_mysql_data:/data \
        -v "$BACKUP_DIR":/backup \
        ubuntu:20.04 \
        sh -c "rm -rf /data/* && tar -xzf /backup/mysql_data_backup_${backup_date}.tar.gz -C /data"
    
    if [[ $? -eq 0 ]]; then
        log "Volume restore completed successfully!"
        log "Starting MySQL container..."
        docker-compose up -d mysql
    else
        error "Volume restore failed!"
        return 1
    fi
}

# Main menu
if [[ ! -d "$BACKUP_DIR" ]] || [[ -z "$(ls -A "$BACKUP_DIR" 2>/dev/null)" ]]; then
    error "No backups found in $BACKUP_DIR"
    exit 1
fi

echo "=== IT CRMS RESTORE UTILITY ==="
echo
show_backups
echo

read -p "Enter backup date (YYYYMMDD_HHMMSS): " backup_date

if [[ ! -f "$BACKUP_DIR/backup_manifest_${backup_date}.txt" ]]; then
    error "Backup not found for date: $backup_date"
    exit 1
fi

echo
info "Backup manifest for $backup_date:"
cat "$BACKUP_DIR/backup_manifest_${backup_date}.txt"
echo

echo "Restore options:"
echo "1. Database only"
echo "2. Docker volume only"
echo "3. Both database and volume"
echo "4. Show manifest only"
read -p "Choose an option (1-4): " choice

case $choice in
    1)
        restore_database "$backup_date"
        ;;
    2)
        restore_volume "$backup_date"
        ;;
    3)
        restore_database "$backup_date" && restore_volume "$backup_date"
        ;;
    4)
        info "Manifest displayed above."
        ;;
    *)
        error "Invalid option selected."
        exit 1
        ;;
esac

log "Restore operation completed."