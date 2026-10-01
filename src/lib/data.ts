import { randomBytes } from "node:crypto";
import { Prisma } from "@/generated/prisma/client";
import type { Post as PostRow } from "@/generated/prisma/client";
import { getDb } from "./db";
import { escapeRegExp, extractHeadings, readingTimeFa, slugifyHeading } from "./markdown";
import type {
  GraphEdge,
  GraphNode,
  Heading,
  Post,
  PostInput,
  Project,
  PublicUser,
  SearchResult,
  TechUsage,
} from "./types";

/** Flatten a Prisma row into the shape the UI consumes. */
function toPost(row: PostRow): Post {
  return {
    id: row.id,
    slug: row.slug,
    title: row.title,
    excerpt: row.excerpt,
    content: row.content,
    tags: row.tags,
    series: row.seriesTitle ? { title: row.seriesTitle, order: row.seriesOrder ?? 0 } : null,
    status: row.status,
    featured: row.featured,
    publishedAt: row.publishedAt.toISOString(),
    readingTime: row.readingTime,
    views: row.views,
    claps: row.claps,
    authorId: row.authorId,
    author:
      row.authorName && row.authorUsername
        ? { name: row.authorName, username: row.authorUsername }
        : null,
  };
}

function isNotFound(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2025";
}

function isUniqueViolation(err: unknown): boolean {
  return err instanceof Prisma.PrismaClientKnownRequestError && err.code === "P2002";
}

/** Escape LIKE wildcards so a user query is matched literally. */
function likePattern(query: string): string {
  return `%${query.replace(/[\\%_]/g, (ch) => `\\${ch}`)}%`;
}

/* ---------------------------------- posts --------------------------------- */

export type PostSort = "new" | "views" | "claps";

/**
 * Search across the four text fields.
 *
 * Kept in SQL for two reasons: Prisma's `contains` does not escape LIKE
 * wildcards (`%`, `_`), and there is no substring filter for `String[]`.
 * Both are handled here with an escaped pattern.
 */
async function slugsMatchingQuery(query: string): Promise<string[]> {
  const db = await getDb();
  const like = likePattern(query);
  const rows = await db.$queryRaw<{ slug: string }[]>(Prisma.sql`
    SELECT slug FROM "Post"
    WHERE title ILIKE ${like}
       OR excerpt ILIKE ${like}
       OR content ILIKE ${like}
       OR array_to_string(tags, ' ') ILIKE ${like}
  `);
  return rows.map((row) => row.slug);
}

export async function getPosts(opts?: {
  tag?: string;
  q?: string;
  sort?: PostSort;
  limit?: number;
}): Promise<Post[]> {
  const db = await getDb();
  const where: Prisma.PostWhereInput = { status: "published" };

  if (opts?.tag) where.tags = { has: opts.tag };
  if (opts?.q) {
    where.slug = { in: await slugsMatchingQuery(opts.q.trim()) };
  }

  const orderBy: Prisma.PostOrderByWithRelationInput =
    opts?.sort === "views"
      ? { views: "desc" }
      : opts?.sort === "claps"
        ? { claps: "desc" }
        : { publishedAt: "desc" };

  const rows = await db.post.findMany({ where, orderBy, take: opts?.limit ?? 50 });
  return rows.map(toPost);
}

export async function getPost(slug: string): Promise<Post | null> {
  const db = await getDb();
  const row = await db.post.findFirst({ where: { slug, status: "published" } });
  return row ? toPost(row) : null;
}

export async function getPostHeadings(slug: string): Promise<Heading[]> {
  const post = await getPost(slug);
  return post ? extractHeadings(post.content) : [];
}

/** Outgoing internal links of a post, found by scanning its markdown. */
function linkedSlugsOf(post: Post): string[] {
  const matches = post.content.matchAll(/\/posts\/([a-z0-9-]+)/g);
  return [...new Set([...matches].map((m) => m[1]).filter((s) => s !== post.slug))];
}

/** Posts that link TO this slug + posts sharing tags, scored. */
export async function getRelatedPosts(post: Post, limit = 4): Promise<Post[]> {
  const all = await getPosts({ limit: 50 });
  const others = all.filter((p) => p.slug !== post.slug);
  const out = linkedSlugsOf(post);

  const scored = others.map((p) => {
    const sharedTags = p.tags.filter((t) => post.tags.includes(t)).length;
    const linksIn = linkedSlugsOf(p).includes(post.slug);
    const linksOut = out.includes(p.slug);
    const sameSeries = post.series && p.series && p.series.title === post.series.title;
    return {
      post: p,
      score: sharedTags * 2 + (linksIn ? 4 : 0) + (linksOut ? 3 : 0) + (sameSeries ? 3 : 0),
    };
  });

  return scored
    .filter((s) => s.score > 0)
    .sort((a, b) => b.score - a.score)
    .slice(0, limit)
    .map((s) => s.post);
}

export async function getSeriesSiblings(post: Post): Promise<Post[]> {
  if (!post.series) return [];
  const all = await getPosts({ limit: 50 });
  return all
    .filter((p) => p.series && p.series.title === post.series!.title)
    .sort((a, b) => a.series!.order - b.series!.order);
}

export async function getAdjacentPosts(post: Post): Promise<{ prev: Post | null; next: Post | null }> {
  const all = await getPosts({ limit: 50 });
  const idx = all.findIndex((p) => p.slug === post.slug);
  return {
    prev: idx > 0 ? all[idx - 1] : null,
    next: idx >= 0 && idx < all.length - 1 ? all[idx + 1] : null,
  };
}

/* ------------------------------- aggregates ------------------------------- */

export async function getTags(): Promise<{ name: string; count: number }[]> {
  const db = await getDb();
  return db.$queryRaw<{ name: string; count: number }[]>(Prisma.sql`
    SELECT tag AS name, COUNT(*)::int AS count
    FROM "Post" p, unnest(p.tags) AS tag
    WHERE p.status = 'published'
    GROUP BY tag
    ORDER BY count DESC, name ASC
  `);
}

export async function getStats(): Promise<{
  posts: number;
  views: number;
  claps: number;
  tags: number;
  projects: number;
}> {
  const db = await getDb();
  const [agg, tags, projects] = await Promise.all([
    db.post.aggregate({
      where: { status: "published" },
      _count: { _all: true },
      _sum: { views: true, claps: true },
    }),
    getTags(),
    db.project.count(),
  ]);

  return {
    posts: agg._count._all ?? 0,
    views: agg._sum.views ?? 0,
    claps: agg._sum.claps ?? 0,
    tags: tags.length,
    projects,
  };
}

export async function getSeries(): Promise<{ title: string; posts: Post[] }[]> {
  const all = await getPosts({ limit: 50 });
  const map = new Map<string, Post[]>();
  for (const p of all) {
    if (!p.series) continue;
    const arr = map.get(p.series.title) ?? [];
    arr.push(p);
    map.set(p.series.title, arr);
  }
  return [...map.entries()].map(([title, posts]) => ({
    title,
    posts: posts.sort((a, b) => a.series!.order - b.series!.order),
  }));
}

/** Publishing rhythm of the last 26 weeks — feeds the heatmap. */
export async function getActivity(): Promise<{ date: string; count: number }[]> {
  const db = await getDb();
  const since = new Date(Date.now() - 26 * 7 * 86_400_000);
  return db.$queryRaw<{ date: string; count: number }[]>(Prisma.sql`
    SELECT to_char("publishedAt" AT TIME ZONE 'UTC', 'YYYY-MM-DD') AS date, COUNT(*)::int AS count
    FROM "Post"
    WHERE status = 'published' AND "publishedAt" >= ${since}
    GROUP BY 1
    ORDER BY 1 ASC
  `);
}

/* ---------------------------------- graph --------------------------------- */

export async function getGraph(): Promise<{ nodes: GraphNode[]; edges: GraphEdge[] }> {
  const [posts, tags] = await Promise.all([getPosts({ limit: 50 }), getTags()]);
  const nodes: GraphNode[] = [];
  const edges: GraphEdge[] = [];

  for (const post of posts) {
    nodes.push({
      id: `post:${post.slug}`,
      label: post.title,
      kind: "post",
      href: `/posts/${post.slug}`,
      weight: Math.max(1, Math.round((post.views + post.claps) / 800)),
    });
    for (const tag of post.tags) {
      edges.push({ source: `post:${post.slug}`, target: `tag:${tag}` });
    }
    for (const linked of linkedSlugsOf(post)) {
      edges.push({ source: `post:${post.slug}`, target: `post:${linked}` });
    }
  }
  for (const tag of tags) {
    nodes.push({ id: `tag:${tag.name}`, label: tag.name, kind: "tag", weight: tag.count });
  }
  // Deduplicate post->post edges (undirected)
  const seen = new Set<string>();
  const deduped = edges.filter((e) => {
    if (!e.source.startsWith("post:") || !e.target.startsWith("post:")) return true;
    const key = [e.source, e.target].sort().join("|");
    if (seen.has(key)) return false;
    seen.add(key);
    return true;
  });
  return { nodes, edges: deduped };
}

/* --------------------------------- projects -------------------------------- */

export async function getProjects(): Promise<Project[]> {
  const db = await getDb();
  return db.project.findMany({ orderBy: { year: "desc" } });
}

/**
 * Tech radar: joins the curated tech registry with real usage data —
 * how many projects used each technology, in which years, and how many
 * posts mention it. This is the "what stack did I use across everything" view.
 */
export async function getTechUsage(): Promise<TechUsage[]> {
  const db = await getDb();
  const [techs, projectUsage] = await Promise.all([
    db.tech.findMany(),
    db.$queryRaw<{ tech: string; count: number; years: number[] }[]>(Prisma.sql`
      SELECT t AS tech, COUNT(*)::int AS count, (array_agg(DISTINCT p.year))::int[] AS years
      FROM "Project" p, unnest(p.tech) AS t
      GROUP BY t
    `),
  ]);
  const usageMap = new Map(projectUsage.map((u) => [u.tech, u]));

  const posts = await getPosts({ limit: 50 });
  const countMentions = (name: string) =>
    posts.filter((p) =>
      `${p.title} ${p.excerpt} ${p.content}`.toLowerCase().includes(name.toLowerCase()),
    ).length;

  const rows: TechUsage[] = [];
  const seen = new Set<string>();

  for (const tech of techs) {
    seen.add(tech.name);
    const usage = usageMap.get(tech.name);
    rows.push({
      name: tech.name,
      category: tech.category,
      ring: tech.ring,
      note: tech.note,
      projectCount: usage?.count ?? 0,
      years: [...(usage?.years ?? [])].sort((a, b) => b - a),
      postCount: countMentions(tech.name),
    });
  }
  // Technologies used in projects but not curated in the registry.
  for (const [name, usage] of usageMap) {
    if (seen.has(name)) continue;
    rows.push({
      name,
      category: "tool",
      ring: "trial",
      note: "",
      projectCount: usage.count,
      years: [...usage.years].sort((a, b) => b - a),
      postCount: countMentions(name),
    });
  }

  return rows.sort((a, b) => b.projectCount - a.projectCount || b.postCount - a.postCount);
}

/* ---------------------------------- search --------------------------------- */

export async function searchAll(q: string): Promise<SearchResult[]> {
  const query = q.trim();
  if (query.length < 2) return [];
  const rx = new RegExp(escapeRegExp(query), "i");

  const posts = await getPosts({ q: query, limit: 6 });

  const results: SearchResult[] = posts.map((p) => ({
    type: "post",
    title: p.title,
    subtitle: p.tags.join(" · "),
    href: `/posts/${p.slug}`,
  }));

  const tags = await getTags();
  for (const t of tags) {
    if (rx.test(t.name) || rx.test(t.name.replace(/-/g, " "))) {
      results.push({
        type: "tag",
        title: `#${t.name}`,
        subtitle: `${t.count} نوشته`,
        href: `/posts?tag=${t.name}`,
      });
    }
  }

  const projects = await getProjects();
  for (const pr of projects) {
    if (rx.test(pr.name) || rx.test(pr.tagline) || pr.tech.some((t) => rx.test(t))) {
      results.push({ type: "project", title: pr.name, subtitle: pr.tagline, href: "/stack" });
    }
  }

  return results.slice(0, 10);
}

/* -------------------------------- mutations -------------------------------- */

export async function incrementView(slug: string): Promise<number> {
  const db = await getDb();
  try {
    const post = await db.post.update({
      where: { slug },
      data: { views: { increment: 1 } },
      select: { views: true },
    });
    return post.views;
  } catch (err) {
    if (isNotFound(err)) return 0;
    throw err;
  }
}

export async function addClap(slug: string, amount = 1): Promise<number> {
  const db = await getDb();
  try {
    const post = await db.post.update({
      where: { slug },
      data: { claps: { increment: amount } },
      select: { claps: true },
    });
    return post.claps;
  } catch (err) {
    if (isNotFound(err)) return 0;
    throw err;
  }
}

export async function addSubscriber(email: string): Promise<"ok" | "duplicate"> {
  const db = await getDb();
  try {
    await db.subscriber.create({ data: { email } });
    return "ok";
  } catch (err) {
    if (isUniqueViolation(err)) return "duplicate";
    throw err;
  }
}

/* ------------------------------ users & auth ------------------------------- */

export async function getUserByEmail(email: string) {
  const db = await getDb();
  return db.user.findUnique({ where: { email: email.toLowerCase().trim() } });
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  return db.user.findUnique({ where: { username: username.toLowerCase().trim() } });
}

export async function createUser(input: {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
}) {
  const db = await getDb();
  return db.user.create({
    data: {
      name: input.name,
      username: input.username.toLowerCase().trim(),
      email: input.email.toLowerCase().trim(),
      passwordHash: input.passwordHash,
      role: "writer",
      bio: "",
    },
  });
}

export async function getAuthorPublic(username: string): Promise<{
  user: PublicUser;
  stats: { posts: number; views: number; claps: number };
} | null> {
  const user = await getUserByUsername(username);
  if (!user) return null;

  const db = await getDb();
  const agg = await db.post.aggregate({
    where: { authorId: user.id, status: "published" },
    _count: { _all: true },
    _sum: { views: true, claps: true },
  });

  return {
    user: {
      id: user.id,
      name: user.name,
      username: user.username,
      role: user.role,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
    },
    stats: {
      posts: agg._count._all ?? 0,
      views: agg._sum.views ?? 0,
      claps: agg._sum.claps ?? 0,
    },
  };
}

export async function getPostsByAuthor(authorId: string, includeDrafts = false): Promise<Post[]> {
  const db = await getDb();
  const where: Prisma.PostWhereInput = { authorId };
  if (!includeDrafts) where.status = "published";
  const rows = await db.post.findMany({ where, orderBy: { publishedAt: "desc" } });
  return rows.map(toPost);
}

/* ------------------------------ post editing ------------------------------- */

export async function getPostForEdit(slug: string): Promise<Post | null> {
  const db = await getDb();
  const row = await db.post.findUnique({ where: { slug } });
  return row ? toPost(row) : null;
}

export async function slugExists(slug: string): Promise<boolean> {
  const db = await getDb();
  const count = await db.post.count({ where: { slug } });
  return count > 0;
}

export async function createPostForUser(user: PublicUser, input: PostInput): Promise<string> {
  const db = await getDb();
  let slug = input.slug && /^[a-z0-9-]+$/.test(input.slug) ? input.slug : "";
  if (!slug) slug = `p-${randomBytes(3).toString("hex")}`;
  let candidate = slug;
  let i = 2;
  while (await slugExists(candidate)) candidate = `${slug}-${i++}`;

  await db.post.create({
    data: {
      slug: candidate,
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      tags: input.tags,
      status: input.status,
      featured: false,
      publishedAt: new Date(),
      readingTime: readingTimeFa(input.content),
      authorId: user.id,
      authorName: user.name,
      authorUsername: user.username,
    },
  });
  return candidate;
}

export async function updatePostForUser(
  slug: string,
  user: PublicUser,
  input: PostInput,
): Promise<"ok" | "forbidden" | "missing"> {
  const db = await getDb();
  const post = await getPostForEdit(slug);
  if (!post) return "missing";
  if (user.role !== "admin" && post.authorId !== user.id) return "forbidden";

  await db.post.update({
    where: { slug },
    data: {
      title: input.title,
      excerpt: input.excerpt,
      content: input.content,
      tags: input.tags,
      status: input.status,
      readingTime: readingTimeFa(input.content),
    },
  });
  return "ok";
}

export async function deletePostForUser(
  slug: string,
  user: PublicUser,
): Promise<"ok" | "forbidden" | "missing"> {
  const db = await getDb();
  const post = await getPostForEdit(slug);
  if (!post) return "missing";
  if (user.role !== "admin" && post.authorId !== user.id) return "forbidden";
  await db.post.delete({ where: { slug } });
  return "ok";
}

export async function getAuthorStats(authorId: string): Promise<{
  posts: number;
  drafts: number;
  views: number;
  claps: number;
}> {
  const db = await getDb();
  const [agg, posts, drafts] = await Promise.all([
    db.post.aggregate({ where: { authorId }, _sum: { views: true, claps: true } }),
    db.post.count({ where: { authorId, status: "published" } }),
    db.post.count({ where: { authorId, status: "draft" } }),
  ]);

  return {
    posts,
    drafts,
    views: agg._sum.views ?? 0,
    claps: agg._sum.claps ?? 0,
  };
}

export { slugifyHeading };
