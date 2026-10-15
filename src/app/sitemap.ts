import type { MetadataRoute } from "next";
import { connection } from "next/server";
import { prisma } from "@/lib/prisma";
import { visiblePost } from "@/lib/queries";

export default async function sitemap(): Promise<MetadataRoute.Sitemap> {
  await connection();
  const site = process.env.SITE_URL || "http://localhost:3000";
  const published = await prisma.post.findMany({
    where: visiblePost(),
    select: { slug: true, updatedAt: true },
  });
  return [
    { url: site, lastModified: new Date() },
    ...published.map((p) => ({
      url: new URL(`/posts/${p.slug}`, site).toString(),
      lastModified: p.updatedAt,
    })),
  ];
}
