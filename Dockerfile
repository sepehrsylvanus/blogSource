# syntax=docker/dockerfile:1

###############################################################################
# Stage 1 — install dependencies (cached while package-lock.json is unchanged)
###############################################################################
FROM node:22-bookworm-slim AS deps
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY package.json package-lock.json ./
RUN npm ci --no-audit --no-fund

###############################################################################
# Stage 2 — build the app (`npm run build` = prisma generate && next build)
###############################################################################
FROM node:22-bookworm-slim AS build
WORKDIR /app
ENV NEXT_TELEMETRY_DISABLED=1
COPY --from=deps /app/node_modules ./node_modules
# .env is part of the build context on purpose: it is baked into the image so
# that `docker run -p 3000:3000` needs no environment flags at all.
COPY . .
RUN npm run build

###############################################################################
# Stage 3 — production image: Next.js (standalone) + PostgreSQL in one box
###############################################################################
FROM node:22-bookworm-slim AS runtime

# PostgreSQL is only ever reachable on 127.0.0.1 inside the container;
# no database port is published to the host.
RUN apt-get update \
  && apt-get install -y --no-install-recommends postgresql \
  && rm -rf /var/lib/apt/lists/* \
  # drop the cluster Debian auto-creates; our entrypoint initializes PGDATA
  && rm -rf /var/lib/postgresql/* /etc/postgresql/*

ENV NODE_ENV=production \
    NEXT_TELEMETRY_DISABLED=1 \
    PORT=3000 \
    HOSTNAME=0.0.0.0 \
    PGDATA=/var/lib/postgresql/data \
    # overrides the dev URL from .env: in-container Postgres, see docker/entrypoint.sh
    DATABASE_URL=postgresql://postgres@127.0.0.1:5432/blog

WORKDIR /app

COPY --from=build /app/.next/standalone ./
COPY --from=build /app/.next/static ./.next/static
COPY --from=build /app/public ./public
COPY --from=build /app/.env ./.env
COPY --from=build /app/prisma/migrations ./prisma/migrations
COPY docker/db-init.mjs ./db-init.mjs
COPY docker/entrypoint.sh /usr/local/bin/entrypoint.sh

RUN chmod +x /usr/local/bin/entrypoint.sh \
  && mkdir -p /app/.uploads /var/lib/postgresql/data \
  && chown -R postgres:postgres /var/lib/postgresql

EXPOSE 3000

HEALTHCHECK --interval=30s --timeout=5s --start-period=30s --retries=5 \
  CMD ["node", "-e", "fetch('http://127.0.0.1:3000/api/health').then((r)=>process.exit(r.ok?0:1)).catch(()=>process.exit(1))"]

ENTRYPOINT ["/usr/local/bin/entrypoint.sh"]
