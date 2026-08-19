#!/usr/bin/env bash

set -Eeuo pipefail
umask 077

APP_DIR="${CARC_APP_DIR:-/home/ubuntu/NextJS-26/frontend}"
DB_FILE="${CARC_DB_FILE:-${APP_DIR}/data/carc.db}"
BACKUP_DIR="${CARC_BACKUP_DIR:-${APP_DIR}/backups/hourly}"
RETENTION_MINUTES="${CARC_RETENTION_MINUTES:-2880}"

if [[ ! -f "$DB_FILE" ]]; then
    echo "ERROR: SQLite database not found: $DB_FILE" >&2
    exit 1
fi

if [[ -z "$BACKUP_DIR" || "$BACKUP_DIR" == "/" ]]; then
    echo "ERROR: Invalid backup directory" >&2
    exit 1
fi

mkdir -p "$BACKUP_DIR"

timestamp="$(date -u +%Y-%m-%dT%H%M%SZ)"
backup_file="${BACKUP_DIR}/carc-hourly-${timestamp}.db"
temporary_file="${backup_file}.tmp"

cleanup() {
    rm -f "$temporary_file"
}

trap cleanup EXIT

echo "$(date -u +%FT%TZ) Starting backup of $DB_FILE"

sqlite3 "$DB_FILE" ".backup '$temporary_file'"

integrity_result="$(sqlite3 "$temporary_file" "PRAGMA integrity_check;")"

if [[ "$integrity_result" != "ok" ]]; then
    echo "ERROR: Backup integrity check returned: $integrity_result" >&2
    exit 1
fi

mv "$temporary_file" "$backup_file"
sha256sum "$backup_file" > "${backup_file}.sha256"

find "$BACKUP_DIR" -maxdepth 1 -type f \
    \( -name 'carc-hourly-*.db' -o -name 'carc-hourly-*.db.sha256' \) \
    -mmin "+${RETENTION_MINUTES}" -delete

echo "$(date -u +%FT%TZ) Backup completed: $backup_file"