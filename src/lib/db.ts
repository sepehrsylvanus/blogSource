import { PrismaPg } from "@prisma/adapter-pg";
import { Prisma, PrismaClient } from "@/generated/prisma/client";
import { ensureSeed } from "./seed";

type PrismaCache = {
  client?: PrismaClient;
  seeded?: Promise<unknown>;
};

const cache = globalThis as unknown as PrismaCache;

function databaseUrl(): string {
  const url = process.env.DATABASE_URL;
  if (!url) {
    throw new Error(
      "DATABASE_URL is not set — copy .env.example to .env and point it at your local PostgreSQL.",
    );
  }
  return url;
}

/**
 * Prisma 7 ships no query engine: the pg driver adapter owns the connection
 * pool, so its limits are set here instead of in the connection string.
 */
function createClient(): PrismaClient {
  const adapter = new PrismaPg({
    connectionString: databaseUrl(),
    max: 10,
    connectionTimeoutMillis: 5_000,
    idleTimeoutMillis: 300_000,
  });

  return new PrismaClient({
    adapter,
    log: process.env.NODE_ENV === "development" ? ["warn", "error"] : ["error"],
  });
}

/** One client per process — Next.js re-evaluates modules on every hot reload. */
export const prisma: PrismaClient = cache.client ?? createClient();

if (process.env.NODE_ENV !== "production") cache.client = prisma;

function isMissingSchema(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2021";
}

/**
 * Every query goes through here. In development it also seeds an empty
 * database once per process, so `npm run dev` is never a blank site.
 * Set AUTO_SEED=0 to turn that off.
 */
export async function getDb(): Promise<PrismaClient> {
  if (process.env.NODE_ENV !== "production" && process.env.AUTO_SEED !== "0") {
    cache.seeded ??= (async () => {
      try {
        const summary = await ensureSeed(prisma);
        if (summary) {
          console.log(
            `[seed] auto-seeded ${summary.posts} posts, ${summary.projects} projects, ` +
              `${summary.techs} techs, ${summary.users} users`,
          );
        }
        return summary;
      } catch (err) {
        cache.seeded = undefined; // next request may retry
        if (isMissingSchema(err)) {
          throw new Error(
            "Database schema is missing — run `npm run db:setup` (prisma migrate dev + db seed).",
          );
        }
        throw err;
      }
    })();

    await cache.seeded;
  }

  return prisma;
}
