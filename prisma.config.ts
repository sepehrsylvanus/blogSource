import { config } from "dotenv";
import { defineConfig } from "prisma/config";

// During development Prisma CLI runs in VS Code's Git Bash on Windows.
// During deployment DATABASE_URL is supplied to the one-off container by Compose.
config({ path: ".env", quiet: true });

export default defineConfig({
  schema: "prisma/schema.prisma",
  migrations: { path: "prisma/migrations", seed: "tsx prisma/seed.ts" },
  datasource: { url: process.env.DATABASE_URL ?? "" },
});
