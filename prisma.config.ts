import "dotenv/config";
import { defineConfig } from "prisma/config";

/**
 * Prisma 7 CLI configuration.
 *
 * The CLI no longer loads `.env` by itself and no longer reads `url` from the
 * schema, so both live here. `datasource.url` is only attached when
 * DATABASE_URL exists — `prisma generate` must keep working without a database.
 */
export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: {
    path: "prisma/migrations",
    seed: "tsx prisma/seed.ts",
  },
  ...(process.env.DATABASE_URL ? { datasource: { url: process.env.DATABASE_URL } } : {}),
});
