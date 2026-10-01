import type { MetadataRoute } from "next";
import { getPosts } from "@/lib/data";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

export const dynamic = "force-dynamic";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  const posts = await getPosts({ limit: 50 });
  return [
    { url: siteUrl, changeFrequency: "weekly", priority: 1 },
    { url: `${siteUrl}/posts`, changeFrequency: "weekly", priority: 0.8 },
    { url: `${siteUrl}/graph`, changeFrequency: "weekly", priority: 0.6 },
    { url: `${siteUrl}/stack`, changeFrequency: "monthly", priority: 0.6 },
    { url: `${siteUrl}/about`, changeFrequency: "monthly", priority: 0.5 },
    ...posts.map((p) => ({
      url: `${siteUrl}/posts/${p.slug}`,
      lastModified: new Date(p.publishedAt),
      changeFrequency: "monthly" as const,
      priority: 0.7,
    })),
  ];
}
