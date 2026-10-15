import { connection } from "next/server";
import { listPublished } from "@/lib/queries";
import { escapeXml } from "@/lib/validation";

export async function GET() {
  await connection();
  const site = process.env.SITE_URL || "http://localhost:3000";
  const { items } = await listPublished();
  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0"><channel><title>حاشیه</title><link>${escapeXml(site)}</link>
<description>یادداشت‌های فنی و تجربه‌های واقعی</description><language>fa</language>
${items.map((item) => `<item><title>${escapeXml(item.title)}</title><link>${escapeXml(new URL(`/posts/${item.slug}`, site).toString())}</link><guid>${escapeXml(item.id)}</guid><description>${escapeXml(item.excerpt)}</description><pubDate>${item.publishedAt?.toUTCString() || ""}</pubDate></item>`).join("\n")}
</channel></rss>`;
  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "no-store",
    },
  });
}
