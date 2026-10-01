import { cache } from "react";
import { cookies } from "next/headers";
import { redirect } from "next/navigation";
import { createHash, randomBytes } from "node:crypto";
import type { User as UserRow } from "@/generated/prisma/client";
import { getDb } from "./db";
import type { PublicUser } from "./types";

export const SESSION_COOKIE = "sd_session";
const SESSION_DAYS = 30;

function sha256(input: string): string {
  return createHash("sha256").update(input).digest("hex");
}

function toPublicUser(user: UserRow): PublicUser {
  return {
    id: user.id,
    name: user.name,
    username: user.username,
    role: user.role,
    bio: user.bio,
    createdAt: user.createdAt.toISOString(),
  };
}

/**
 * Sessions are opaque 256-bit tokens. Only the SHA-256 hash is persisted, so a
 * database dump does not leak live sessions. PostgreSQL has no TTL index like
 * MongoDB, so expired rows are reaped opportunistically on every new login.
 */
export async function createSession(userId: string): Promise<void> {
  const db = await getDb();
  const token = randomBytes(32).toString("base64url");
  const expiresAt = new Date(Date.now() + SESSION_DAYS * 86_400_000);

  await db.session.deleteMany({ where: { expiresAt: { lt: new Date() } } });
  await db.session.create({ data: { tokenHash: sha256(token), userId, expiresAt } });

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
  const session = await db.session.findUnique({
    where: { tokenHash: sha256(token) },
    include: { user: true },
  });
  if (!session || session.expiresAt.getTime() <= Date.now()) return null;

  return toPublicUser(session.user);
});

export async function destroySession(): Promise<void> {
  const jar = await cookies();
  const token = jar.get(SESSION_COOKIE)?.value;
  if (token) {
    const db = await getDb();
    await db.session.deleteMany({ where: { tokenHash: sha256(token) } });
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
