import type { Db } from "mongodb";
import { seedPosts } from "./posts";
import { seedProjects, seedTechs } from "./projects";
import { makeAdminUser, DYNAMIC_ADMIN_PASSWORD } from "./admin";
import { hashPassword } from "@/lib/passwords";

/**
 * Idempotent seed: only runs when the database is empty.
 * In memory-mode this runs on every boot so the preview is always populated.
 */
export async function ensureSeed(db: Db): Promise<void> {
  const usersCount = await db.collection("users").estimatedDocumentCount();
  if (usersCount === 0) {
    await db.collection("users").insertOne(makeAdminUser(hashPassword(DYNAMIC_ADMIN_PASSWORD)));
  }

  const postsCount = await db.collection("posts").estimatedDocumentCount();
  if (postsCount > 0) return;

  await db.collection("posts").insertMany(seedPosts);
  await db.collection("projects").insertMany(seedProjects);
  await db.collection("techs").insertMany(seedTechs);
}
