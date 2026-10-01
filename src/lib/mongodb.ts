import { MongoClient, type Db } from "mongodb";
import { ensureSeed } from "@/lib/seed";

declare global {
  // eslint-disable-next-line no-var
  var __sanidevDb: Promise<Db> | undefined;
}

let mode: "memory" | "external" = "memory";

export function dbMode(): "memory" | "external" {
  return mode;
}

async function ensureIndexes(db: Db): Promise<void> {
  try {
    await Promise.all([
      db.collection("posts").createIndex({ slug: 1 }, { unique: true }),
      db.collection("posts").createIndex({ status: 1, publishedAt: -1 }),
      db.collection("posts").createIndex({ tags: 1 }),
      db.collection("projects").createIndex({ year: -1 }),
      db.collection("techs").createIndex({ name: 1 }, { unique: true }),
      db.collection("subscribers").createIndex({ email: 1 }, { unique: true }),
      db.collection("posts").createIndex({ authorId: 1, status: 1, publishedAt: -1 }),
      db.collection("users").createIndex({ email: 1 }, { unique: true }),
      db.collection("users").createIndex({ username: 1 }, { unique: true }),
      db.collection("sessions").createIndex({ tokenHash: 1 }, { unique: true }),
      // TTL index — MongoDB reels in expired sessions automatically.
      db.collection("sessions").createIndex({ expiresAt: 1 }, { expireAfterSeconds: 0 }),
    ]);
  } catch {
    // Indexes already exist — memory mode re-creates them on each boot anyway.
  }
}

async function connect(): Promise<Db> {
  let uri = process.env.MONGODB_URI;
  if (uri && uri.trim().length > 0) {
    mode = "external";
  } else {
    // Dev/preview convenience: boot a real MongoDB in-process so the app
    // works with zero external services. Set MONGODB_URI for persistence.
    const { MongoMemoryServer } = await import("mongodb-memory-server");
    const server = await MongoMemoryServer.create({
      instance: {
        args: ["--setParameter", "diagnosticDataCollectionEnabled=false", "--quiet"],
      },
    });
    uri = server.getUri("sanidev");
    mode = "memory";
  }

  const client = new MongoClient(uri, { maxPoolSize: 8 });
  await client.connect();
  const db = client.db(process.env.MONGODB_DB ?? "sanidev");
  await ensureIndexes(db);
  await ensureSeed(db);
  return db;
}

export function getDb(): Promise<Db> {
  globalThis.__sanidevDb ??= connect();
  return globalThis.__sanidevDb;
}
