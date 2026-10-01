import type { UserRole } from "@/generated/prisma/client";

/**
 * Seed accounts.
 *
 * Passwords come from the environment so a real deployment never ships the
 * documented defaults; the fallbacks exist so `npm run db:seed` works out of
 * the box on a local machine.
 */
export const ADMIN_ID = "660000000000000000000001";
export const WRITER_ID = "660000000000000000000002";

export const ADMIN_AUTHOR = { name: "سانی", username: "sani" } as const;
export const WRITER_AUTHOR = { name: "نویسنده‌ی مهمان", username: "writer" } as const;

export const ADMIN_EMAIL = process.env.SEED_ADMIN_EMAIL ?? "sani@sanidev.blog";
export const ADMIN_PASSWORD = process.env.SEED_ADMIN_PASSWORD ?? "sani1234";
export const WRITER_EMAIL = process.env.SEED_WRITER_EMAIL ?? "writer@sanidev.blog";
export const WRITER_PASSWORD = process.env.SEED_WRITER_PASSWORD ?? "writer1234";

export type SeedAccount = {
  id: string;
  name: string;
  username: string;
  email: string;
  password: string;
  role: UserRole;
  bio: string;
};

export const seedAccounts: SeedAccount[] = [
  {
    id: ADMIN_ID,
    name: ADMIN_AUTHOR.name,
    username: ADMIN_AUTHOR.username,
    email: ADMIN_EMAIL,
    password: ADMIN_PASSWORD,
    role: "admin",
    bio: "سازنده‌ی کانال یوتیوب sanidev-web — این‌جا عمیق‌تر از ویدیوها می‌نویسم.",
  },
  {
    id: WRITER_ID,
    name: WRITER_AUTHOR.name,
    username: WRITER_AUTHOR.username,
    email: WRITER_EMAIL,
    password: WRITER_PASSWORD,
    role: "writer",
    bio: "اکانت تست برای نقش نویسنده — فقط نوشته‌های خودش را ویرایش می‌کند.",
  },
];
