import { getPosts } from "@/lib/data";
import { stripMarkdown } from "@/lib/markdown";

export const dynamic = "force-dynamic";

const siteUrl = process.env.SITE_URL ?? "http://localhost:3000";

function escape(s: string): string {
  return s
    .replace(/&/g, "&amp;")
    .replace(/</g, "&lt;")
    .replace(/>/g, "&gt;")
    .replace(/"/g, "&quot;")
    .replace(/'/g, "&apos;");
}

export async function GET() {
  const posts = await getPosts({ limit: 30 });
  const items = posts
    .map(
      (p) => `
    <item>
      <title>${escape(p.title)}</title>
      <link>${siteUrl}/posts/${p.slug}</link>
      <guid isPermaLink="true">${siteUrl}/posts/${p.slug}</guid>
      <pubDate>${new Date(p.publishedAt).toUTCString()}</pubDate>
      <description>${escape(p.excerpt)}</description>
      <content:encoded><![CDATA[${stripMarkdown(p.content.slice(0, 1200))}]]></content:encoded>
      ${p.tags.map((t) => `<category>${t}</category>`).join("\n      ")}
    </item>`,
    )
    .join("");

  const xml = `<?xml version="1.0" encoding="UTF-8"?>
<rss version="2.0" xmlns:content="http://purl.org/rss/1.0/modules/content/">
  <channel>
    <title>سانی‌.دِو — وبلاگ</title>
    <link>${siteUrl}</link>
    <description>وبلاگ فارسی توسعه‌ی وب؛ دور از کلیشه‌ی CRUD</description>
    <language>fa-IR</language>
    <lastBuildDate>${new Date().toUTCString()}</lastBuildDate>
${items}
  </channel>
</rss>`;

  return new Response(xml, {
    headers: {
      "Content-Type": "application/rss+xml; charset=utf-8",
      "Cache-Control": "public, max-age=3600",
    },
  });
}
