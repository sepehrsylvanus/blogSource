"use server";

import { revalidatePath } from "next/cache";
import { redirect } from "next/navigation";
import { prisma } from "@/lib/prisma";
import { requireAdmin } from "@/lib/security";
import { postSchema, taxonomySchema } from "@/lib/validation";

export type FormState = { error: string };

export async function savePost(
  _previous: FormState,
  form: FormData,
): Promise<FormState> {
  const session = await requireAdmin(); // Protect the mutation, not just the layout.
  const parsed = postSchema.safeParse({
    id: String(form.get("id") ?? ""),
    title: String(form.get("title") ?? ""),
    slug: String(form.get("slug") ?? ""),
    excerpt: String(form.get("excerpt") ?? ""),
    body: String(form.get("body") ?? ""),
    status: String(form.get("status") ?? "draft"),
    categoryId: String(form.get("categoryId") ?? ""),
    tagIds: form.getAll("tagIds").map(String),
    coverPath: String(form.get("coverPath") ?? ""),
    seoTitle: String(form.get("seoTitle") ?? ""),
    seoDescription: String(form.get("seoDescription") ?? ""),
  });
  if (!parsed.success)
    return { error: parsed.error.issues[0]?.message ?? "داده نامعتبر است." };
  const data = parsed.data;
  let originalSlug: string | undefined;
  try {
    await prisma.$transaction(async (tx) => {
      const common = {
        title: data.title,
        slug: data.slug,
        excerpt: data.excerpt,
        body: data.body,
        status: data.status,
        categoryId: data.categoryId || null,
        coverPath: data.coverPath || null,
        seoTitle: data.seoTitle || null,
        seoDescription: data.seoDescription || null,
      };
      const uniqueTags = [...new Set(data.tagIds)];
      const tagLinks = uniqueTags.map((id) => ({ tag: { connect: { id } } }));
      if (data.id) {
        const old = await tx.post.findUnique({
          where: { id: data.id },
          select: { slug: true, publishedAt: true },
        });
        if (!old) throw new Error("POST_NOT_FOUND");
        originalSlug = old.slug;
        await tx.post.update({
          where: { id: data.id },
          data: {
            ...common,
            publishedAt:
              data.status === "published"
                ? (old.publishedAt ?? new Date())
                : null,
            postTags: { deleteMany: {}, create: tagLinks },
          },
        });
      } else {
        await tx.post.create({
          data: {
            ...common,
            authorId: session.user.id,
            publishedAt: data.status === "published" ? new Date() : null,
            postTags: { create: tagLinks },
          },
        });
      }
    });
  } catch (error: unknown) {
    if (
      typeof error === "object" &&
      error !== null &&
      "code" in error &&
      error.code === "P2002"
    ) {
      return { error: "این اسلاگ قبلاً ثبت شده است." };
    }
    if (error instanceof Error && error.message === "POST_NOT_FOUND") {
      return { error: "مطلب موردنظر پیدا نشد." };
    }
    console.error("savePost failed", error);
    return { error: "ذخیره ناموفق بود. لاگ سرور را بررسی کن." };
  }
  revalidatePath("/");
  revalidatePath(`/posts/${data.slug}`);
  if (originalSlug && originalSlug !== data.slug)
    revalidatePath(`/posts/${originalSlug}`);
  redirect("/admin/posts?status=saved");
}

export async function archivePost(form: FormData) {
  await requireAdmin();
  const id = String(form.get("id") ?? "");
  if (!/^[0-9a-f-]{36}$/.test(id)) throw new Error("شناسه نامعتبر است");
  const previous = await prisma.post.findUnique({
    where: { id },
    select: { slug: true },
  });
  if (!previous) throw new Error("مطلب موردنظر پیدا نشد");
  await prisma.post.update({
    where: { id },
    data: { status: "archived", publishedAt: null },
  });
  revalidatePath("/");
  revalidatePath(`/posts/${previous.slug}`);
  redirect("/admin/posts");
}

export async function createTaxonomy(form: FormData) {
  await requireAdmin();
  const parsed = taxonomySchema.safeParse({
    name: String(form.get("name") ?? ""),
    slug: String(form.get("slug") ?? ""),
  });
  const kind = String(form.get("kind") ?? "");
  if (!parsed.success || !["category", "tag"].includes(kind))
    throw new Error("داده نامعتبر است");
  if (kind === "category")
    await prisma.category.upsert({
      where: { slug: parsed.data.slug },
      create: parsed.data,
      update: {},
    });
  else
    await prisma.tag.upsert({
      where: { slug: parsed.data.slug },
      create: parsed.data,
      update: {},
    });
  revalidatePath("/admin/taxonomy");
}
