import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArchiveView } from "@/components/archive-view";
import { prisma } from "@/lib/prisma";
import { getTags, listPublished } from "@/lib/queries";
import { safePage } from "@/lib/validation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const tag = await prisma.tag.findUnique({
    where: { slug },
    select: { name: true },
  });
  return tag
    ? {
        title: `برچسب ${tag.name}`,
        description: `یادداشت‌های برچسب ${tag.name} در حاشیه`,
      }
    : { title: "برچسب پیدا نشد", robots: { index: false } };
}

export default async function TagPage({
  params,
  searchParams,
}: {
  params: Promise<{ slug: string }>;
  searchParams: Promise<{ page?: string }>;
}) {
  await connection();
  const { slug } = await params;
  const { page: rawPage } = await searchParams;
  const page = safePage(rawPage);
  const tag = await prisma.tag.findUnique({ where: { slug } });
  if (!tag) notFound();
  const [{ items, total, pages }, siblings] = await Promise.all([
    listPublished({ tagSlug: slug, page }),
    getTags(),
  ]);
  return (
    <ArchiveView
      kind="tag"
      name={tag.name}
      slug={slug}
      items={items}
      total={total}
      pages={pages}
      page={page}
      siblings={siblings}
    />
  );
}
