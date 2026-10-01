import type { PrismaClient } from "@/generated/prisma/client";
import { hashPassword } from "@/lib/passwords";
import { seedAccounts } from "./accounts";
import { seedPosts } from "./posts";
import { seedProjects, seedTechs } from "./projects";

export type SeedSummary = {
  users: number;
  posts: number;
  projects: number;
  techs: number;
};

/**
 * Idempotent seed — safe to run as often as you like.
 *
 * Accounts are *upserted*, so a re-seed always restores the documented test
 * logins (password included). Content is *insert-only* (`skipDuplicates`), so
 * re-seeding never overwrites a post you edited in the studio.
 */
export async function seedDatabase(db: PrismaClient): Promise<SeedSummary> {
  let users = 0;
  for (const account of seedAccounts) {
    const passwordHash = hashPassword(account.password);
    await db.user.upsert({
      where: { id: account.id },
      update: {
        name: account.name,
        username: account.username,
        email: account.email,
        passwordHash,
        role: account.role,
        bio: account.bio,
      },
      create: {
        id: account.id,
        name: account.name,
        username: account.username,
        email: account.email,
        passwordHash,
        role: account.role,
        bio: account.bio,
      },
    });
    users += 1;
  }

  const posts = await db.post.createMany({ data: seedPosts, skipDuplicates: true });
  const projects = await db.project.createMany({ data: seedProjects, skipDuplicates: true });
  const techs = await db.tech.createMany({ data: seedTechs, skipDuplicates: true });

  return { users, posts: posts.count, projects: projects.count, techs: techs.count };
}

/** Dev convenience: fill an empty database so `npm run dev` is never blank. */
export async function ensureSeed(db: PrismaClient): Promise<SeedSummary | null> {
  const [userCount, postCount] = await Promise.all([db.user.count(), db.post.count()]);
  if (userCount > 0 && postCount > 0) return null;
  return seedDatabase(db);
}
