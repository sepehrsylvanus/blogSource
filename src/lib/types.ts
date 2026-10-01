export type Series = { title: string; order: number };

export type AuthorSnapshot = { name: string; username: string };

/** Shape the UI works with — the Prisma row flattened for the client. */
export type Post = {
  id: string;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  series: Series | null;
  status: "published" | "draft";
  featured: boolean;
  publishedAt: string;
  readingTime: number;
  views: number;
  claps: number;
  authorId: string | null;
  author: AuthorSnapshot | null;
};

export type PublicUser = {
  id: string;
  name: string;
  username: string;
  role: "admin" | "writer";
  bio: string;
  createdAt: string;
};

export type PostInput = {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: "draft" | "published";
  slug?: string;
};

export type Project = {
  id: string;
  name: string;
  tagline: string;
  year: number;
  tech: string[];
  url: string | null;
  highlight: string;
};

export type TechRing = "adopt" | "trial" | "assess" | "hold";
export type TechCategory = "framework" | "data" | "style" | "tool";

export type TechUsage = {
  name: string;
  category: TechCategory;
  ring: TechRing;
  note: string;
  projectCount: number;
  years: number[];
  postCount: number;
};

export type Heading = { depth: number; text: string; id: string };

export type GraphNode = {
  id: string;
  label: string;
  kind: "post" | "tag";
  href?: string;
  weight: number;
};

export type GraphEdge = { source: string; target: string };

export type SearchResult = {
  type: "post" | "tag" | "project";
  title: string;
  subtitle: string;
  href: string;
};

export type Subscriber = { id: string; email: string; createdAt: string };
