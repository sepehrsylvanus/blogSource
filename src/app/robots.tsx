import type { MetadataRoute } from "next";
import { connection } from "next/server";

export default async function robots(): Promise<MetadataRoute.Robots> {
  await connection(); // SITE_URL is a runtime value, not the dummy Docker build value.
  const site = process.env.SITE_URL || "http://localhost:3000";
  return {
    rules: {
      userAgent: "*",
      allow: "/",
      disallow: ["/admin/", "/login", "/api/auth/", "/api/media/upload"],
    },
    sitemap: new URL("/sitemap.xml", site).toString(),
  };
}
