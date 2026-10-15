import "server-only";
import type { Prisma } from "@/generated/prisma/client";
import { prisma } from "@/lib/prisma";

// Reuse this predicate everywhere public content is returned: draft/archived/future are private.
export const visiblePost = (): Prisma.PostWhereInput => ({
  status: "published",
  publishedAt: { lte: new Date() },
});

export async function listPublished({
  page = 1,
  query = "",
  categorySlug,
  tagSlug,
}: {
  page?: number;
  query?: string;
  categorySlug?: string;
  tagSlug?: string;
} = {}) {
  const limit = 9;
  // Escape LIKE wildcards; Prisma's `contains` compiles to ILIKE on PostgreSQL.
  const keyword = query
    .trim()
    .slice(0, 80)
    .replace(/[\\%_]/g, "\\$&");
  const where: Prisma.PostWhereInput = {
    ...visiblePost(),
    ...(categorySlug ? { category: { slug: categorySlug } } : {}),
    ...(tagSlug ? { postTags: { some: { tag: { slug: tagSlug } } } } : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { excerpt: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [records, total] = await Promise.all([
    prisma.post.findMany({
      where,
      select: {
        id: true,
        slug: true,
        title: true,
        excerpt: true,
        coverPath: true,
        publishedAt: true,
        category: { select: { name: true, slug: true } },
      },
      orderBy: [{ publishedAt: "desc" }, { id: "desc" }],
      take: limit,
      skip: (page - 1) * limit,
    }),
    prisma.post.count({ where }),
  ]);
  const items = records.map(({ category, ...post }) => ({
    ...post,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
  }));
  return { items, total, pages: Math.max(1, Math.ceil(total / limit)) };
}

export async function getPublishedPost(slug: string) {
  const result = await prisma.post.findFirst({
    where: { ...visiblePost(), slug },
    select: {
      id: true,
      slug: true,
      title: true,
      excerpt: true,
      body: true,
      coverPath: true,
      publishedAt: true,
      seoTitle: true,
      seoDescription: true,
      category: { select: { name: true, slug: true } },
      author: { select: { name: true } },
      postTags: { select: { tag: { select: { name: true, slug: true } } } },
    },
  });
  if (!result) return null;
  const { category, author, postTags, ...post } = result;
  return {
    ...post,
    categoryName: category?.name ?? null,
    categorySlug: category?.slug ?? null,
    authorName: author.name,
    tags: postTags.map(({ tag }) => tag),
  };
}

export async function getCategories() {
  return prisma.category.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}

export async function getTags() {
  return prisma.tag.findMany({
    select: { id: true, name: true, slug: true },
    orderBy: { name: "asc" },
  });
}
