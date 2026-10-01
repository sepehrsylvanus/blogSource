import "dotenv/config";
import { PrismaPg } from "@prisma/adapter-pg";
import { PrismaClient } from "../src/generated/prisma/client";
import { seedDatabase } from "../src/lib/seed";
import { seedAccounts } from "../src/lib/seed/accounts";

const connectionString = process.env.DATABASE_URL;
if (!connectionString) {
  console.error("DATABASE_URL is not set — copy .env.example to .env first.");
  process.exit(1);
}

// Own client: the CLI does not inject DATABASE_URL, hence the dotenv import above.
const prisma = new PrismaClient({
  adapter: new PrismaPg({ connectionString, connectionTimeoutMillis: 5_000 }),
});

async function main(): Promise<void> {
  const summary = await seedDatabase(prisma);

  console.log(
    `Seeded ${summary.posts} posts, ${summary.projects} projects, ` +
      `${summary.techs} techs, ${summary.users} users.`,
  );
  console.log("\nTest accounts:");
  for (const account of seedAccounts) {
    console.log(`  ${account.role.padEnd(6)} ${account.email}  /  ${account.password}`);
  }
  console.log("\nAlready-seeded rows are skipped; passwords are always refreshed.");
}

main()
  .then(() => prisma.$disconnect())
  .catch(async (error) => {
    console.error(error);
    await prisma.$disconnect();
    process.exit(1);
  });
