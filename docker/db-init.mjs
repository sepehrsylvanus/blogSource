/**
 * Container bootstrap — runs on every container start and is idempotent:
 *   1. creates the database when missing
 *   2. applies pending Prisma migrations (tracked in `_prisma_migrations`,
 *      so `prisma migrate deploy` stays compatible)
 *   3. seeds categories/tags  -- KEEP IN SYNC WITH prisma/seed.ts
 *   4. creates the first admin when ADMIN_EMAIL + ADMIN_PASSWORD are set
 *
 * Runs from /app with the standalone bundle's node_modules next to it, which
 * is why `pg` resolves here without a full dependency tree.
 */
import crypto from "node:crypto";
import fs from "node:fs";
import path from "node:path";
import pg from "pg";

const log = (message) => console.log(`[db-init] ${message}`);
const warn = (message) => console.warn(`[db-init] ${message}`);

/** Merge .env into process.env without overriding real environment variables. */
function loadDotEnv(file) {
  if (!fs.existsSync(file)) return;
  for (const line of fs.readFileSync(file, "utf8").split(/\r?\n/)) {
    const match = /^\s*([A-Za-z_][A-Za-z0-9_]*)\s*=(.*)$/.exec(line);
    if (!match) continue;
    const [, key, rawValue] = match;
    if (key in process.env) continue;
    let value = rawValue.trim();
    if (
      (value.startsWith('"') && value.endsWith('"')) ||
      (value.startsWith("'") && value.endsWith("'"))
    ) {
      value = value.slice(1, -1);
    }
    process.env[key] = value;
  }
}

/**
 * Exact replica of better-auth's password hashing (`@better-auth/utils/password`
 * node build): `${salt}:${scryptHex}` with N=16384, r=16, p=1, dkLen=64 — so a
 * user inserted here can sign in through better-auth unchanged.
 */
function hashPassword(password) {
  const salt = crypto.randomBytes(16).toString("hex");
  return new Promise((resolve, reject) => {
    crypto.scrypt(
      password.normalize("NFKC"),
      salt,
      64,
      { N: 16384, r: 16, p: 1, maxmem: 128 * 16384 * 16 * 2 },
      (error, key) =>
        error ? reject(error) : resolve(`${salt}:${key.toString("hex")}`),
    );
  });
}

// Same data as prisma/seed.ts — keep both in sync.
const CATEGORIES = [
  { name: "عمومی", slug: "general" },
  { name: "توسعهٔ وب", slug: "web-development" },
  { name: "طراحی", slug: "design" },
  { name: "محصول", slug: "product" },
];
const TAGS = [
  { name: "Next.js", slug: "nextjs" },
  { name: "آموزش", slug: "tutorial" },
  { name: "Prisma", slug: "prisma" },
  { name: "رابط کاربری", slug: "ui" },
  { name: "نوشتن", slug: "writing" },
];


async function main() {
  loadDotEnv(path.join(process.cwd(), ".env"));

  const databaseUrl = process.env.DATABASE_URL;
  if (!databaseUrl) throw new Error("DATABASE_URL is not set");

  const url = new URL(databaseUrl);
  const dbName = decodeURIComponent(url.pathname.replace(/^\//, "")) || "blog";
  url.pathname = "/postgres";

  // 1) create the database on first boot
  const admin = new pg.Client({ connectionString: url.toString() });
  await admin.connect();
  try {
    const { rows } = await admin.query(
      "SELECT 1 FROM pg_database WHERE datname = $1",
      [dbName],
    );
    if (rows.length === 0) {
      await admin.query(`CREATE DATABASE "${dbName.replace(/"/g, '""')}"`);
      log(`created database "${dbName}"`);
    } else {
      log(`database "${dbName}" already exists`);
    }
  } finally {
    await admin.end();
  }

  const client = new pg.Client({ connectionString: databaseUrl });
  await client.connect();
  try {
    // 2) pending migrations
    await client.query(`CREATE TABLE IF NOT EXISTS _prisma_migrations (
      id VARCHAR(36) NOT NULL PRIMARY KEY,
      checksum VARCHAR(64) NOT NULL,
      finished_at TIMESTAMPTZ,
      migration_name VARCHAR(255) NOT NULL,
      logs TEXT,
      rolled_back_at TIMESTAMPTZ,
      started_at TIMESTAMPTZ NOT NULL DEFAULT now(),
      applied_steps_count INTEGER NOT NULL DEFAULT 0
    )`);

    const migrationsDir = path.join(process.cwd(), "prisma", "migrations");
    const names = fs
      .readdirSync(migrationsDir, { withFileTypes: true })
      .filter((entry) => entry.isDirectory())
      .map((entry) => entry.name)
      .sort();

    for (const name of names) {
      const file = path.join(migrationsDir, name, "migration.sql");
      if (!fs.existsSync(file)) continue;
      const sql = fs.readFileSync(file, "utf8");
      const checksum = crypto.createHash("sha256").update(sql).digest("hex");
      const { rows } = await client.query(
        "SELECT checksum FROM _prisma_migrations WHERE migration_name = $1",
        [name],
      );
      if (rows.length > 0) {
        if (rows[0].checksum !== checksum) {
          warn(`checksum drift for "${name}" (file changed after it was applied)`);
        }
        continue;
      }
      log(`applying migration "${name}"`);
      await client.query("BEGIN");
      try {
        await client.query(sql);
        await client.query(
          `INSERT INTO _prisma_migrations
             (id, checksum, finished_at, migration_name, started_at, applied_steps_count)
           VALUES ($1, $2, now(), $3, now(), 1)`,
          [crypto.randomUUID(), checksum, name],
        );
        await client.query("COMMIT");
      } catch (error) {
        await client.query("ROLLBACK");
        throw error;
      }
    }

    // 3) seed
    for (const { name, slug } of CATEGORIES) {
      await client.query(
        `INSERT INTO categories (id, name, slug)
         VALUES (gen_random_uuid(), $1, $2)
         ON CONFLICT (slug) DO NOTHING`,
        [name, slug],
      );
    }
    for (const { name, slug } of TAGS) {
      await client.query(
        `INSERT INTO tags (id, name, slug)
         VALUES (gen_random_uuid(), $1, $2)
         ON CONFLICT (slug) DO NOTHING`,
        [name, slug],
      );
    }
    log("categories/tags seeded");

    // 4) optional first admin
    const adminEmail = (process.env.ADMIN_EMAIL || "").trim();
    const adminPassword = process.env.ADMIN_PASSWORD || "";
    if (!adminEmail || !adminPassword) {
      log("ADMIN_EMAIL/ADMIN_PASSWORD not set — skipping admin bootstrap");
    } else {
      const email = adminEmail.toLowerCase();
      const { rows } = await client.query(
        `SELECT id FROM "user" WHERE email = $1`,
        [email],
      );
      if (rows.length > 0) {
        log(`admin "${email}" already exists`);
      } else {
        const passwordHash = await hashPassword(adminPassword);
        const userId = crypto.randomUUID();
        const name = (process.env.ADMIN_NAME || "").trim() || "Admin";
        await client.query(
          `INSERT INTO "user" (id, name, email, "emailVerified", role, "updatedAt")
           VALUES ($1, $2, $3, true, 'admin', now())`,
          [userId, name, email],
        );
        // better-auth looks the credential account up with
        // `accountId === user.id` (see its sign-in route), so accountId must
        // repeat the user id while `id` stays the account's own primary key.
        await client.query(
          `INSERT INTO account (id, "accountId", "providerId", "userId", password, "updatedAt")
           VALUES ($1, $2, 'credential', $2, $3, now())`,
          [crypto.randomUUID(), userId, passwordHash],
        );
        log(`created admin "${email}" with role "admin"`);
      }
    }
  } finally {
    await client.end();
  }
}

main()
  .then(() => log("database ready"))
  .catch((error) => {
    console.error("[db-init] FAILED:", error);
    process.exit(1);
  });
