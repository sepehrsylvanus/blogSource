import { z } from "zod";

export const slugSchema = z
  .string()
  .min(2)
  .max(80)
  .regex(
    /^[a-z0-9]+(?:-[a-z0-9]+)*$/,
    "از حروف انگلیسی کوچک، رقم و خط تیره استفاده کن.",
  );

export const taxonomySchema = z.object({
  name: z.string().trim().min(2).max(100),
  slug: slugSchema,
});

export const postSchema = z.object({
  id: z.union([z.uuid(), z.literal("")]),
  title: z.string().trim().min(3).max(180),
  slug: z
    .string()
    .trim()
    .min(2)
    .max(180)
    .regex(/^[a-z0-9]+(?:-[a-z0-9]+)*$/),
  excerpt: z.string().trim().min(20).max(320),
  body: z.string().trim().min(30).max(100_000),
  status: z.enum(["draft", "published", "archived"]),
  categoryId: z.union([z.uuid(), z.literal("")]),
  tagIds: z.array(z.uuid()).max(12),
  coverPath: z.union([
    z.literal(""),
    z.string().regex(/^\/api\/media\/[0-9a-f-]{36}\.webp$/),
  ]),
  seoTitle: z.string().trim().max(70),
  seoDescription: z.string().trim().max(160),
});

export function safePage(value: unknown) {
  const n = Number(value);
  return Number.isSafeInteger(n) && n > 0 ? Math.min(n, 1000) : 1;
}

export function escapeXml(value: string) {
  return value.replace(
    /[&<>"']/g,
    (ch) =>
      ({
        "&": "&amp;",
        "<": "&lt;",
        ">": "&gt;",
        '"': "&quot;",
        "'": "&apos;",
      })[ch]!,
  );
}
