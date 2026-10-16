#!/usr/bin/env bash
# Container entrypoint: PostgreSQL + migrations/seed/admin + Next.js, in this order.
set -euo pipefail

: "${PGDATA:=/var/lib/postgresql/data}"
export PGDATA

log() { echo "[entrypoint] $*"; }

PGBIN="$(ls -d /usr/lib/postgresql/*/bin 2>/dev/null | head -n 1 || true)"
if [ -z "${PGBIN}" ] || [ ! -x "${PGBIN}/postgres" ]; then
  log "FATAL: PostgreSQL binaries not found"
  exit 1
fi

cd /app
mkdir -p /app/.uploads

# --- first boot: initialize the cluster (loopback only) ---------------------
if [ ! -s "${PGDATA}/PG_VERSION" ]; then
  log "Initializing PostgreSQL cluster in ${PGDATA}"
  mkdir -p "${PGDATA}"
  chown -R postgres:postgres "${PGDATA}"
  su -s /bin/bash postgres -c "'${PGBIN}/initdb' -D '${PGDATA}' -U postgres -A trust --encoding=UTF8 --locale=C"
  {
    echo "listen_addresses = 'localhost'"
    echo "unix_socket_directories = '/tmp'"
  } >> "${PGDATA}/postgresql.conf"
fi

log "Starting PostgreSQL"
su -s /bin/bash postgres -c "'${PGBIN}/pg_ctl' -D '${PGDATA}' -w -t 60 -l /tmp/postgresql.log start"

# --- schema: pending migrations, seed data, optional first admin ------------
log "Applying migrations / seed / admin bootstrap"
node /app/db-init.mjs

# --- start the app (graceful shutdown on docker stop) -----------------------
log "Starting Next.js on http://0.0.0.0:${PORT:-3000}"
node /app/server.js &
APP_PID=$!

shutdown() {
  log "Stopping Next.js"
  kill -TERM "${APP_PID}" 2>/dev/null || true
}
trap shutdown TERM INT

set +e
wait "${APP_PID}"
APP_STATUS=$?
set -e

log "Next.js stopped (status ${APP_STATUS}); stopping PostgreSQL"
su -s /bin/bash postgres -c "'${PGBIN}/pg_ctl' -D '${PGDATA}' -m fast -w -t 30 stop" >/dev/null 2>&1 || true
exit "${APP_STATUS}"
