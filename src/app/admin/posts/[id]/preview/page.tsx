import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import { ArrowRight, Eye, PenLine, ShieldCheck } from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { Markdown } from "@/components/markdown";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";

export const metadata: Metadata = {
  title: "پیش‌نمایش خصوصی",
  robots: { index: false, follow: false },
};
export default async function PrivatePreview({
  params,
}: {
  params: Promise<{ id: string }>;
}) {
  await connection();
  const { id } = await params;
  if (!/^[0-9a-f-]{36}$/.test(id)) notFound();
  const post = await prisma.post.findUnique({
    where: { id },
    include: {
      category: { select: { name: true } },
      postTags: { include: { tag: { select: { name: true } } } },
    },
  });
  if (!post) notFound();
  return (
    <div>
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-forest"
      >
        <ArrowRight size={16} /> همهٔ نوشته‌ها
      </Link>
      <div className="mb-7 mt-6 flex flex-wrap items-end justify-between gap-4">
        <div>
          <span className="eyebrow">PRIVATE PREVIEW / فقط برای مدیر</span>
          <h1 className="mt-3 text-[clamp(1.9rem,3.4vw,3rem)] font-black text-ink">
            پیش‌نمایش <span className="gradient-type">خصوصی.</span>
          </h1>
        </div>
        <Link href={`/admin/posts/${post.id}/edit`} className="button-dark">
          <PenLine size={16} /> بازگشت به ویرایش
        </Link>
      </div>
      <p
        role="status"
        className="mb-7 flex flex-wrap items-center gap-2 rounded-2xl border border-[#697593] bg-[#232640] px-5 py-4 text-xs font-bold leading-7 text-[#e9dbff]"
      >
        <ShieldCheck size={18} /> این پیش‌نمایش خصوصی است؛ تا وقتی مطلب را منتشر
        نکنی در وب‌سایت عمومی نمایش داده نمی‌شود.{" "}
        <StatusBadge status={post.status} />
      </p>
      <article className="panel overflow-hidden">
        <header className="mx-auto max-w-[860px] px-6 pb-9 pt-12 sm:px-10 sm:pt-16">
          <span className="eyebrow">
            <Eye size={15} /> {post.category?.name || "یادداشت / بدون دسته"}
          </span>
          <h2 className="mt-5 text-[clamp(2rem,4vw,3.7rem)] font-black leading-[1.55] text-forest">
            {post.title}
          </h2>
          <p className="mt-5 text-lg leading-[2.05] text-muted">
            {post.excerpt}
          </p>
          <p className="mt-6 border-t border-line pt-5 text-xs text-muted">
            پیش‌نمایش محتوای ذخیره‌شده ·{" "}
            {post.updatedAt.toLocaleDateString("fa-IR")}
          </p>
        </header>
        <div className="relative mx-5 aspect-[2/1] min-h-52 overflow-hidden rounded-2xl border border-line bg-sage sm:mx-10">
          {post.coverPath ? (
            <Image
              src={post.coverPath}
              alt={post.title}
              fill
              sizes="(max-width: 1000px) 100vw, 950px"
              className="object-cover"
            />
          ) : (
            <CoverArt slug={post.slug} className="h-full w-full" />
          )}
        </div>
        <div className="mx-auto max-w-[780px] px-6 py-12 sm:px-10 sm:py-16">
          <Markdown text={post.body} />
          {!!post.postTags.length && (
            <div className="mt-12 flex flex-wrap gap-2 border-t border-line pt-6">
              {post.postTags.map(({ tag }) => (
                <span
                  key={tag.name}
                  className="rounded-full bg-sage px-3 py-1.5 text-xs font-bold text-forest"
                >
                  #{tag.name}
                </span>
              ))}
            </div>
          )}
        </div>
      </article>
    </div>
  );
}
