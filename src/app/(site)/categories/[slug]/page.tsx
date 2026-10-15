import type { Metadata } from "next";
import { connection } from "next/server";
import { notFound } from "next/navigation";
import { ArchiveView } from "@/components/archive-view";
import { prisma } from "@/lib/prisma";
import { getCategories, listPublished } from "@/lib/queries";
import { safePage } from "@/lib/validation";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const category = await prisma.category.findUnique({
    where: { slug },
    select: { name: true },
  });
  return category
    ? {
        title: `دستهٔ ${category.name}`,
        description: `همهٔ یادداشت‌های دستهٔ ${category.name} در حاشیه`,
      }
    : { title: "دسته پیدا نشد", robots: { index: false } };
}

export default async function CategoryPage({
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
  const category = await prisma.category.findUnique({ where: { slug } });
  if (!category) notFound();
  const [{ items, total, pages }, siblings] = await Promise.all([
    listPublished({ categorySlug: slug, page }),
    getCategories(),
  ]);
  return (
    <ArchiveView
      kind="category"
      name={category.name}
      slug={slug}
      items={items}
      total={total}
      pages={pages}
      page={page}
      siblings={siblings}
    />
  );
}
