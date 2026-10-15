#!/usr/bin/env bash
set -Eeuo pipefail
umask 077

# Only deployment manifests live in Ubuntu WSL; app and migrator images come from public GHCR.
TARGET="${1:-}"
EXPECTED_IMAGE="${2:-}"
[[ "$TARGET" =~ ^[0-9a-f]{40}$ ]] || { echo "Expected a 40-character commit SHA" >&2; exit 2; }
[[ "$EXPECTED_IMAGE" =~ ^ghcr\.io/[a-z0-9][a-z0-9._-]*/[a-z0-9][a-z0-9._-]*$ ]] || {
  echo "Expected a lowercase ghcr.io/owner/repo image name" >&2; exit 2;
}
ROOT=/srv/blog
ENV_FILE="$ROOT/secrets/prod.env"
RELEASE_DIR="$ROOT/releases/$TARGET"
COMPOSE_FILE="$RELEASE_DIR/compose.prod.yml"
BACKUP_DIR="$ROOT/backups"
CURRENT_FILE="$ROOT/current.sha"
[[ -s "$ENV_FILE" && -s "$COMPOSE_FILE" ]] || {
  echo "Missing prod.env or release Compose file under $RELEASE_DIR" >&2; exit 2;
}
# Do not execute the env file as shell: it contains credentials for Compose only.
SAVED_IMAGE="$(sed -n 's/^GHCR_IMAGE=//p' "$ENV_FILE")"
[[ "$SAVED_IMAGE" == "$EXPECTED_IMAGE" ]] || {
  echo "GHCR_IMAGE in prod.env must match the image published by this repository" >&2; exit 2;
}
# Never deploy to the Windows Docker Desktop daemon accidentally.
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

# Compose interpolates the public GHCR package from prod.env and this commit SHA.
export DEPLOY_SHA="$TARGET"
export GHCR_IMAGE="$EXPECTED_IMAGE"
compose() { docker compose --env-file "$ENV_FILE" -f "$COMPOSE_FILE" "$@"; }

docker pull "${EXPECTED_IMAGE}:app-${TARGET}"
docker pull "${EXPECTED_IMAGE}:migrator-${TARGET}"
compose pull db
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

# The migrator runs once; it never builds, generates new migrations, or stays running.
compose run --rm migrate
compose up -d --no-build --wait app
compose exec -T app node -e "require('http').get('http://127.0.0.1:3000/api/health',r=>process.exit(r.statusCode===200?0:1)).on('error',()=>process.exit(1))"
curl -fsS --max-time 10 http://127.0.0.1:3100/api/health >/dev/null

# Only record a release AFTER migrations, app startup and both health checks succeed.
if [[ -s "$CURRENT_FILE" ]]; then
  OLD="$(cat "$CURRENT_FILE")"
  if [[ "$OLD" =~ ^[0-9a-f]{40}$ && "$OLD" != "$TARGET" ]]; then
    printf '%s\n' "$OLD" > "$ROOT/previous.sha.tmp"
    mv -f "$ROOT/previous.sha.tmp" "$ROOT/previous.sha"
  fi
fi
printf '%s\n' "$TARGET" > "$ROOT/current.sha.tmp"
mv -f "$ROOT/current.sha.tmp" "$CURRENT_FILE"
echo "Deployed GHCR images for $TARGET on Ubuntu WSL's native Docker Engine"