import type { ObjectId } from "mongodb";

export type Series = { title: string; order: number };

export type AuthorSnapshot = { name: string; username: string };

export type PostDoc = {
  _id?: ObjectId;
  slug: string;
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  series: Series | null;
  status: "published" | "draft";
  featured: boolean;
  publishedAt: Date;
  readingTime: number;
  views: number;
  claps: number;
  authorId: ObjectId | null;
  author: AuthorSnapshot | null;
};

export type Post = Omit<PostDoc, "_id" | "publishedAt" | "authorId"> & {
  _id: string;
  publishedAt: string;
  authorId: string | null;
};

export type UserDoc = {
  _id?: ObjectId;
  name: string;
  username: string;
  email: string;
  passwordHash: string;
  role: "admin" | "writer";
  bio: string;
  createdAt: Date;
};

export type PublicUser = {
  id: string;
  name: string;
  username: string;
  role: "admin" | "writer";
  bio: string;
  createdAt: string;
};

export type SessionDoc = {
  _id?: ObjectId;
  tokenHash: string;
  userId: ObjectId;
  createdAt: Date;
  expiresAt: Date;
};

export type PostInput = {
  title: string;
  excerpt: string;
  content: string;
  tags: string[];
  status: "draft" | "published";
  slug?: string;
};

export type ProjectDoc = {
  _id?: ObjectId;
  name: string;
  tagline: string;
  year: number;
  tech: string[];
  url: string | null;
  highlight: string;
};

export type Project = Omit<ProjectDoc, "_id"> & { _id: string };

export type TechRing = "adopt" | "trial" | "assess" | "hold";
export type TechCategory = "framework" | "data" | "style" | "tool";

export type TechDoc = {
  _id?: ObjectId;
  name: string;
  category: TechCategory;
  ring: TechRing;
  note: string;
};

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

export type Subscriber = { _id?: ObjectId; email: string; createdAt: Date };
