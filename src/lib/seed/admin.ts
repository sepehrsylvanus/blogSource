import { ObjectId } from "mongodb";
import type { UserDoc } from "@/lib/types";

/** Stable id so seed posts can reference the owner account. */
export const ADMIN_ID = new ObjectId("660000000000000000000001");
export const ADMIN_AUTHOR = { name: "سانی", username: "sani" } as const;
export const DYNAMIC_ADMIN_EMAIL = "sani@sanidev.blog";
export const DYNAMIC_ADMIN_PASSWORD = "sani1234";

export function makeAdminUser(passwordHash: string): Omit<UserDoc, "_id"> & { _id: ObjectId } {
  return {
    _id: ADMIN_ID,
    name: ADMIN_AUTHOR.name,
    username: ADMIN_AUTHOR.username,
    email: DYNAMIC_ADMIN_EMAIL,
    passwordHash,
    role: "admin",
    bio: "سازنده‌ی کانال یوتیوب sanidev-web — این‌جا عمیق‌تر از ویدیوها می‌نویسم.",
    createdAt: new Date(),
  };
}
