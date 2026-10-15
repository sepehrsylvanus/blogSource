#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

TARGET="${1:-}"
[[ "$TARGET" =~ ^[0-9a-f]{40}$ ]] || { echo "Expected a 40-character commit SHA" >&2; exit 2; }
ENV_FILE=/srv/blog/secrets/prod.env
BACKUP_DIR=/srv/blog/backups
APP_DIR=/srv/blog/app
[[ -f "$ENV_FILE" ]] || { echo "Missing $ENV_FILE" >&2; exit 2; }
# Never deploy into the Windows Docker Desktop daemon by accident. This script
# requires the local systemd-managed Engine and socket inside Ubuntu WSL.
[[ -z "${DOCKER_HOST:-}" && -z "${DOCKER_CONTEXT:-}" ]] || {
  echo "Unset DOCKER_HOST/DOCKER_CONTEXT; use Ubuntu's local Docker Engine" >&2; exit 2;
}
[[ "$(docker context show 2>/dev/null)" == "default" ]] || {
  echo "Run docker context use default inside Ubuntu WSL" >&2; exit 2;
}
if ! systemctl is-active --quiet docker || [[ ! -S /var/run/docker.sock ]] ||
   [[ "$(readlink -f /var/run/docker.sock)" != /run/docker.sock ]]; then
  echo "Native Docker Engine/socket is not active in Ubuntu WSL (chapter 27)" >&2; exit 2;
fi
docker info --format '{{.ServerVersion}}' >/dev/null
cd "$APP_DIR"

compose() { docker compose --env-file "$ENV_FILE" -f compose.prod.yml "$@"; }

git fetch --prune origin main
LATEST="$(git rev-parse refs/remotes/origin/main)"
if [[ "$TARGET" != "$LATEST" ]]; then
  echo "Skipping superseded push $TARGET; main is now $LATEST"
  exit 0
fi
# Secrets and uploaded media live outside the Git working tree.
git checkout --force "$TARGET"

# Preserve the previous application image for a manual rollback.
if docker image inspect editorial-blog:current >/dev/null 2>&1; then
  docker image tag editorial-blog:current editorial-blog:rollback
fi
compose build app migrate
compose up -d --wait db

# Before any schema migration, make a permission-restricted database backup.
mkdir -p "$BACKUP_DIR"
BACKUP="$BACKUP_DIR/before-$(date -u +%Y%m%dT%H%M%SZ)-${TARGET:0:8}.dump"
if ! compose exec -T db pg_dump -U blog -d blog -Fc > "$BACKUP.tmp"; then
  rm -f "$BACKUP.tmp"
  echo "Backup failed; refusing to deploy" >&2
  exit 1
fi
mv "$BACKUP.tmp" "$BACKUP"
echo "Saved backup to $BACKUP"

compose run --rm migrate
compose up -d --no-build --wait app
# Check both the app container and the published loopback port on Ubuntu WSL.
# The Windows-side localhost forwarding is checked separately in chapter 29.
compose exec -T app node -e "require('http').get('http://127.0.0.1:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
curl -fsS --max-time 10 http://127.0.0.1:3100/api/health >/dev/null
echo "Deployed $TARGET successfully on Ubuntu WSL's native Docker Engine"