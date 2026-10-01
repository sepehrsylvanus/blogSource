import { ObjectId } from "mongodb";
import { randomBytes } from "node:crypto";
import { getDb } from "./mongodb";
import { escapeRegExp, extractHeadings, readingTimeFa, slugifyHeading } from "./markdown";
import type {
  GraphEdge,
  GraphNode,
  Heading,
  Post,
  PostDoc,
  PostInput,
  Project,
  ProjectDoc,
  PublicUser,
  SearchResult,
  TechDoc,
  TechUsage,
  UserDoc,
} from "./types";

type DocWithId<T> = T & { _id: { toString(): string } };

function toPost(doc: DocWithId<PostDoc>): Post {
  return {
    ...doc,
    _id: doc._id.toString(),
    authorId: doc.authorId ? doc.authorId.toString() : null,
    publishedAt: doc.publishedAt.toISOString(),
  };
}

/* ---------------------------------- posts --------------------------------- */

export type PostSort = "new" | "views" | "claps";

export async function getPosts(opts?: {
  tag?: string;
  q?: string;
  sort?: PostSort;
  limit?: number;
}): Promise<Post[]> {
  const db = await getDb();
  const filter: Record<string, unknown> = { status: "published" };
  if (opts?.tag) filter.tags = opts.tag;
  if (opts?.q) {
    const rx = new RegExp(escapeRegExp(opts.q), "i");
    filter.$or = [{ title: rx }, { excerpt: rx }, { content: rx }, { tags: rx }];
  }
  const sort: Record<string, 1 | -1> =
    opts?.sort === "views"
      ? { views: -1 }
      : opts?.sort === "claps"
        ? { claps: -1 }
        : { publishedAt: -1 };

  const docs = (await db
    .collection<PostDoc>("posts")
    .find(filter)
    .sort(sort)
    .limit(opts?.limit ?? 50)
    .toArray()) as DocWithId<PostDoc>[];
  return docs.map(toPost);
}

export async function getPost(slug: string): Promise<Post | null> {
  const db = await getDb();
  const doc = (await db
    .collection<PostDoc>("posts")
    .findOne({ slug, status: "published" })) as DocWithId<PostDoc> | null;
  return doc ? toPost(doc) : null;
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
  const rows = await db
    .collection("posts")
    .aggregate<{ _id: string; count: number }>([
      { $match: { status: "published" } },
      { $unwind: "$tags" },
      { $group: { _id: "$tags", count: { $sum: 1 } } },
      { $sort: { count: -1 } },
    ])
    .toArray();
  return rows.map((r) => ({ name: r._id, count: r.count }));
}

export async function getStats(): Promise<{
  posts: number;
  views: number;
  claps: number;
  tags: number;
  projects: number;
}> {
  const db = await getDb();
  const [agg] = await db
    .collection("posts")
    .aggregate<{ posts: number; views: number; claps: number }>([
      { $match: { status: "published" } },
      { $group: { _id: null, posts: { $sum: 1 }, views: { $sum: "$views" }, claps: { $sum: "$claps" } } },
    ])
    .toArray();
  const [tags, projects] = await Promise.all([
    getTags(),
    db.collection("projects").estimatedDocumentCount(),
  ]);
  return {
    posts: agg?.posts ?? 0,
    views: agg?.views ?? 0,
    claps: agg?.claps ?? 0,
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
  const rows = await db
    .collection("posts")
    .aggregate<{ _id: string; count: number }>([
      { $match: { status: "published", publishedAt: { $gte: since } } },
      {
        $group: {
          _id: { $dateToString: { format: "%Y-%m-%d", date: "$publishedAt" } },
          count: { $sum: 1 },
        },
      },
    ])
    .toArray();
  return rows.map((r) => ({ date: r._id, count: r.count }));
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
  const docs = (await db
    .collection<ProjectDoc>("projects")
    .find({})
    .sort({ year: -1 })
    .toArray()) as DocWithId<ProjectDoc>[];
  return docs.map((d) => ({ ...d, _id: d._id.toString() }));
}

/**
 * Tech radar: joins the curated tech registry with real usage data —
 * how many projects used each technology, in which years, and how many
 * posts mention it. This is the "what stack did I use across everything" view.
 */
export async function getTechUsage(): Promise<TechUsage[]> {
  const db = await getDb();
  const techs = (await db.collection<TechDoc>("techs").find({}).toArray()) as DocWithId<TechDoc>[];

  const projectUsage = await db
    .collection<ProjectDoc>("projects")
    .aggregate<{ tech: string; count: number; years: number[] }>([
      { $unwind: "$tech" },
      { $group: { _id: "$tech", count: { $sum: 1 }, years: { $addToSet: "$year" } } },
      { $project: { _id: 0, tech: "$_id", count: 1, years: 1 } },
    ])
    .toArray();
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
      years: (usage?.years ?? []).sort((a, b) => b - a),
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
      years: usage.years.sort((a, b) => b - a),
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

  const db = await getDb();
  const docs = (await db
    .collection<PostDoc>("posts")
    .find({ status: "published", $or: [{ title: rx }, { excerpt: rx }, { content: rx }, { tags: rx }] })
    .sort({ publishedAt: -1 })
    .limit(6)
    .project({ title: 1, slug: 1, tags: 1, excerpt: 1 })
    .toArray()) as unknown as (Pick<PostDoc, "title" | "slug" | "tags" | "excerpt"> & {
    _id: unknown;
  })[];

  const results: SearchResult[] = docs.map((p) => ({
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
  const res = await db
    .collection<PostDoc>("posts")
    .findOneAndUpdate({ slug }, { $inc: { views: 1 } }, { returnDocument: "after" });
  return res?.views ?? 0;
}

export async function addClap(slug: string, amount = 1): Promise<number> {
  const db = await getDb();
  const res = await db
    .collection<PostDoc>("posts")
    .findOneAndUpdate({ slug }, { $inc: { claps: amount } }, { returnDocument: "after" });
  return res?.claps ?? 0;
}

export async function addSubscriber(email: string): Promise<"ok" | "duplicate"> {
  const db = await getDb();
  try {
    await db.collection("subscribers").insertOne({ email, createdAt: new Date() });
    return "ok";
  } catch (err) {
    if ((err as { code?: number }).code === 11000) return "duplicate";
    throw err;
  }
}

/* ------------------------------ users & auth ------------------------------- */

export async function getUserByEmail(email: string) {
  const db = await getDb();
  return db.collection<UserDoc>("users").findOne({ email: email.toLowerCase().trim() });
}

export async function getUserByUsername(username: string) {
  const db = await getDb();
  return db.collection<UserDoc>("users").findOne({ username: username.toLowerCase().trim() });
}

export async function createUser(input: {
  name: string;
  username: string;
  email: string;
  passwordHash: string;
}): Promise<DocWithId<UserDoc>> {
  const db = await getDb();
  const doc: Omit<UserDoc, "_id"> = {
    name: input.name,
    username: input.username.toLowerCase().trim(),
    email: input.email.toLowerCase().trim(),
    passwordHash: input.passwordHash,
    role: "writer",
    bio: "",
    createdAt: new Date(),
  };
  const res = await db.collection<UserDoc>("users").insertOne(doc);
  return { ...doc, _id: res.insertedId };
}

export async function getAuthorPublic(username: string): Promise<{
  user: PublicUser;
  stats: { posts: number; views: number; claps: number };
} | null> {
  const user = await getUserByUsername(username);
  if (!user) return null;
  const db = await getDb();
  const [agg] = await db
    .collection("posts")
    .aggregate<{ posts: number; views: number; claps: number }>([
      { $match: { authorId: user._id, status: "published" } },
      { $group: { _id: null, posts: { $sum: 1 }, views: { $sum: "$views" }, claps: { $sum: "$claps" } } },
    ])
    .toArray();
  return {
    user: {
      id: user._id!.toString(),
      name: user.name,
      username: user.username,
      role: user.role,
      bio: user.bio,
      createdAt: user.createdAt.toISOString(),
    },
    stats: { posts: agg?.posts ?? 0, views: agg?.views ?? 0, claps: agg?.claps ?? 0 },
  };
}

export async function getPostsByAuthor(authorId: string, includeDrafts = false): Promise<Post[]> {
  const db = await getDb();
  const filter: Record<string, unknown> = { authorId: new ObjectId(authorId) };
  if (!includeDrafts) filter.status = "published";
  const docs = (await db
    .collection<PostDoc>("posts")
    .find(filter)
    .sort({ publishedAt: -1 })
    .toArray()) as DocWithId<PostDoc>[];
  return docs.map(toPost);
}

/* ------------------------------ post editing ------------------------------- */

export async function getPostForEdit(slug: string): Promise<Post | null> {
  const db = await getDb();
  const doc = (await db
    .collection<PostDoc>("posts")
    .findOne({ slug })) as DocWithId<PostDoc> | null;
  return doc ? toPost(doc) : null;
}

export async function slugExists(slug: string): Promise<boolean> {
  const db = await getDb();
  const count = await db.collection("posts").countDocuments({ slug });
  return count > 0;
}

export async function createPostForUser(user: PublicUser, input: PostInput): Promise<string> {
  const db = await getDb();
  let slug = input.slug && /^[a-z0-9-]+$/.test(input.slug) ? input.slug : "";
  if (!slug) slug = `p-${randomBytes(3).toString("hex")}`;
  let candidate = slug;
  let i = 2;
  while (await slugExists(candidate)) candidate = `${slug}-${i++}`;

  await db.collection<PostDoc>("posts").insertOne({
    slug: candidate,
    title: input.title,
    excerpt: input.excerpt,
    content: input.content,
    tags: input.tags,
    series: null,
    status: input.status,
    featured: false,
    publishedAt: new Date(),
    readingTime: readingTimeFa(input.content),
    views: 0,
    claps: 0,
    authorId: new ObjectId(user.id),
    author: { name: user.name, username: user.username },
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

  await db.collection<PostDoc>("posts").updateOne(
    { slug },
    {
      $set: {
        title: input.title,
        excerpt: input.excerpt,
        content: input.content,
        tags: input.tags,
        status: input.status,
        readingTime: readingTimeFa(input.content),
      },
    },
  );
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
  await db.collection("posts").deleteOne({ slug });
  return "ok";
}

export async function getAuthorStats(authorId: string): Promise<{
  posts: number;
  drafts: number;
  views: number;
  claps: number;
}> {
  const db = await getDb();
  const [agg] = await db
    .collection("posts")
    .aggregate<{
      posts: number;
      drafts: number;
      views: number;
      claps: number;
    }>([
      { $match: { authorId: new ObjectId(authorId) } },
      {
        $group: {
          _id: null,
          posts: { $sum: { $cond: [{ $eq: ["$status", "published"] }, 1, 0] } },
          drafts: { $sum: { $cond: [{ $eq: ["$status", "draft"] }, 1, 0] } },
          views: { $sum: "$views" },
          claps: { $sum: "$claps" },
        },
      },
    ])
    .toArray();
  return {
    posts: agg?.posts ?? 0,
    drafts: agg?.drafts ?? 0,
    views: agg?.views ?? 0,
    claps: agg?.claps ?? 0,
  };
}

export { slugifyHeading };
