#!/usr/bin/env bash
# Emergency, read-mostly backup for the AppSolute backend VPS.
# Run as root. Creates files only under /root/appsolute-emergency-backups/.
set -Eeuo pipefail
umask 077

STAMP="$(date -u +%Y%m%dT%H%M%SZ)"
BASE="/root/appsolute-emergency-backups/$STAMP"
STAGE="$BASE/stage"
LOG="$BASE/backup.log"
mkdir -p "$STAGE" "$STAGE/inventory" "$STAGE/config" "$STAGE/apps" "$STAGE/database"
exec > >(tee -a "$LOG") 2>&1

echo "[$(date -u +%FT%TZ)] Starting emergency backup"
[[ "$(id -u)" -eq 0 ]] || { echo "Run as root." >&2; exit 1; }
for cmd in tar openssl sha256sum find python3; do command -v "$cmd" >/dev/null || { echo "Missing required command: $cmd" >&2; exit 1; }; done

{
  echo "timestamp_utc=$STAMP"
  echo "hostname=$(hostname -f 2>/dev/null || hostname)"
  echo "kernel=$(uname -srmo)"
  echo "os_release:"; cat /etc/os-release 2>/dev/null || true
  echo; echo "disk_usage:"; df -hT
  echo; echo "memory:"; free -h 2>/dev/null || true
  echo; echo "listening_ports:"; ss -lntup 2>/dev/null || true
  echo; echo "enabled_services:"; systemctl list-unit-files --state=enabled --no-pager 2>/dev/null || true
  echo; echo "running_services:"; systemctl list-units --type=service --state=running --no-pager 2>/dev/null || true
  echo; echo "pm2_processes:"; pm2 ls --no-color 2>/dev/null || true
  echo; echo "docker_containers:"; docker ps --no-trunc 2>/dev/null || true
  echo; echo "docker_compose_projects:"; docker compose ls 2>/dev/null || true
  echo; echo "postgres_version:"; pg_dump --version 2>/dev/null || true
  echo; echo "redis_version:"; redis-server --version 2>/dev/null || true
  echo; echo "nginx_version:"; nginx -v 2>&1 || true
} > "$STAGE/inventory/host.txt"

copy_path() {
  local src="$1" dst="$2"
  [[ -e "$src" ]] || return 0
  mkdir -p "$(dirname "$STAGE/config/$dst")"
  cp -a "$src" "$STAGE/config/$dst"
}
copy_path /etc/nginx etc/nginx
copy_path /etc/systemd/system etc/systemd/system
copy_path /etc/redis etc/redis
copy_path /etc/letsencrypt etc/letsencrypt
copy_path /etc/cron.d etc/cron.d
copy_path /var/spool/cron var/spool/cron
copy_path /root/.pm2/dump.pm2 root/.pm2/dump.pm2

CANDIDATES="$BASE/app-paths.txt"
: > "$CANDIDATES"
for root in /var/www /opt /srv /home /root; do
  [[ -d "$root" ]] || continue
  find "$root" -xdev -maxdepth 5 -type f \( -name package.json -o -name ecosystem.config.js -o -name ecosystem.config.cjs -o -name docker-compose.yml -o -name compose.yml \) -printf '%h\n' 2>/dev/null || true
done | sort -u > "$CANDIDATES"

APP_COUNT=0
while IFS= read -r dir; do
  [[ -d "$dir" ]] || continue
  APP_COUNT=$((APP_COUNT + 1))
  safe_name="$(printf '%s' "$dir" | sed 's#^/##; s#[^A-Za-z0-9._-]#_#g')"
  echo "Archiving application root: $dir"
  tar --one-file-system --ignore-failed-read \
    --exclude='./node_modules' --exclude='./.git' --exclude='./logs' --exclude='./tmp' --exclude='./.cache' \
    -C "$dir" -czf "$STAGE/apps/${safe_name}.tar.gz" .
done < "$CANDIDATES"
echo "application_archives=$APP_COUNT" >> "$STAGE/inventory/host.txt"
cp "$CANDIDATES" "$STAGE/inventory/discovered-app-paths.txt"

ENV_LIST="$BASE/env-paths.txt"
: > "$ENV_LIST"
while IFS= read -r dir; do
  [[ -d "$dir" ]] || continue
  find "$dir" -maxdepth 3 -type f -name '.env*' -print 2>/dev/null || true
done < "$CANDIDATES" | sort -u > "$ENV_LIST"
while IFS= read -r envfile; do
  [[ -f "$envfile" ]] || continue
  safe_name="$(printf '%s' "$envfile" | sed 's#^/##; s#[^A-Za-z0-9._-]#_#g')"
  cp -a "$envfile" "$STAGE/config/$safe_name"
done < "$ENV_LIST"

DB_URL=""
DB_SOURCE=""
while IFS= read -r envfile; do
  [[ -f "$envfile" ]] || continue
  candidate="$(python3 - "$envfile" <<'PY'
import sys
p=sys.argv[1]
for raw in open(p, encoding='utf-8', errors='ignore'):
    line=raw.strip()
    if not line or line.startswith('#') or '=' not in line:
        continue
    k,v=line.split('=',1)
    if k.strip() in ('DATABASE_URL','POSTGRES_URL'):
        v=v.strip()
        if len(v)>=2 and v[0]==v[-1] and v[0] in "\"'": v=v[1:-1]
        print(v)
        break
PY
)"
  if [[ -n "$candidate" ]]; then DB_URL="$candidate"; DB_SOURCE="$envfile"; break; fi
done < "$ENV_LIST"

if [[ "$DB_URL" == postgres://* || "$DB_URL" == postgresql://* ]]; then
  command -v pg_dump >/dev/null || { echo "PostgreSQL URL found but pg_dump is unavailable." >&2; exit 1; }
  echo "Creating PostgreSQL custom-format dump from credentials in $DB_SOURCE"
  pg_dump --format=custom --file="$STAGE/database/postgresql.dump" "$DB_URL"
  pg_restore --list "$STAGE/database/postgresql.dump" > "$STAGE/database/postgresql.contents.txt"
  test -s "$STAGE/database/postgresql.dump"
elif [[ "$DB_URL" == mongodb://* || "$DB_URL" == mongodb+srv://* ]]; then
  command -v mongodump >/dev/null || { echo "MongoDB URL found but mongodump is unavailable." >&2; exit 1; }
  echo "Creating MongoDB archive from credentials in $DB_SOURCE"
  mongodump --uri="$DB_URL" --archive="$STAGE/database/mongodb.archive" --gzip
  test -s "$STAGE/database/mongodb.archive"
else
  echo "WARNING: No supported DATABASE_URL was found; database dump was not created."
  echo "database_dump=missing" >> "$STAGE/inventory/host.txt"
fi
unset DB_URL

(
  cd "$STAGE"
  find . -type f -print0 | sort -z | xargs -0 sha256sum > SHA256SUMS
)

PLAIN="$BASE/appsolute-backup-$STAMP.tar.gz"
ENC="$PLAIN.enc"
KEY="$BASE/appsolute-backup-$STAMP.recovery-key.txt"
tar -C "$STAGE" -czf "$PLAIN" .
if [[ -n "${BACKUP_PASSPHRASE:-}" ]]; then
  PASS_SOURCE="env:BACKUP_PASSPHRASE"
  KEY_STATUS="supplied externally; not stored on the VPS"
else
  openssl rand -hex 32 > "$KEY"
  PASS_SOURCE="file:$KEY"
  KEY_STATUS="$KEY"
fi
openssl enc -aes-256-cbc -salt -pbkdf2 -iter 600000 -md sha256 \
  -in "$PLAIN" -out "$ENC" -pass "$PASS_SOURCE"
(
  cd "$BASE"
  sha256sum "$(basename "$ENC")" > "$(basename "$ENC").sha256"
)
openssl enc -d -aes-256-cbc -pbkdf2 -iter 600000 -md sha256 \
  -in "$ENC" -pass "$PASS_SOURCE" | tar -tzf - >/dev/null
unset BACKUP_PASSPHRASE PASS_SOURCE
command -v shred >/dev/null && shred -u "$PLAIN" || rm -f "$PLAIN"
rm -rf "$STAGE"
rm -f "$CANDIDATES" "$ENV_LIST"
ln -sfn "$BASE" /root/appsolute-emergency-backups/latest

cat <<EOF
[$(date -u +%FT%TZ)] Backup created and cryptographically verified.
Encrypted archive: $ENC
Checksum:          $ENC.sha256
Recovery key:      $KEY_STATUS
Log:               $LOG

Copy the encrypted archive and checksum off the VPS first.
Keep the recovery passphrase in a separate owner-controlled location.
Do not post any backup material or secrets in group chat.
EOF
