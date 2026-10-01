import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import type { ObjectId } from "mongodb";
import { getDb } from "./mongodb";
import type { PublicUser, SessionDoc, UserDoc } from "./types";

export const SESSION_COOKIE = "sd_session";
const SESSION_DAYS = 30;

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

/**
 * Sessions are opaque 256-bit tokens. Only the SHA-256 hash is persisted,
 * so a database dump does not leak live sessions. A TTL index on
 * `expiresAt` lets MongoDB reap expired sessions by itself.
 */
export async function createSession(userId: ObjectId): Promise<void> {
  const db = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await db.collection<SessionDoc>("sessions").insertOne({
    tokenHash: sha256(token),
    userId,
    createdAt: new Date(),
    expiresAt,
  });

  const jar = await cookies();
  jar.set(SESSION_COOKIE, token, {
    httpOnly: true,
    sameSite: "lax",
    secure: process.env.NODE_ENV === "production",
    path: "/",
    expires: expiresAt,
  });
}

export const getCurrentUser = cache(async (): Promise<PublicUser | null> => {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (!token) return null;

  const db = await getDb();
  const session = await db.collection<SessionDoc>("sessions").findOne({
    tokenHash: sha256(token),
    expiresAt: { $gt: new Date() },
  });
  if (!session) return null;

  const user = await db.collection<UserDoc>("users").findOne({ _id: session.userId });
  if (!user) return null;

  return {
    id: user._id!.toString(),
    name: user.name,
    username: user.username,
    role: user.role,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
  };
});

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.collection<SessionDoc>("sessions").deleteOne({ tokenHash: sha256(token) });
  }
  jar.delete(SESSION_COOKIE);
}

/** Page/action guard — bounces anonymous visitors to /login. */
export async function requireUser(next?: string): Promise<PublicUser> {
  const user = await getCurrentUser();
  if (!user) {
    redirect(next ? `/login?next=${encodeURIComponent(next)}` : "/login");
  }
  return user;
}
