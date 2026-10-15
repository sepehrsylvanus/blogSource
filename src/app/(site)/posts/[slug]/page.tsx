import type { Metadata } from "next";
import Image from "next/image";
import Link from "next/link";
import { notFound } from "next/navigation";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowRight,
  BookOpenText,
  CalendarDays,
  Clock3,
  Sparkles,
} from "lucide-react";
import { CoverArt } from "@/components/cover-art";
import { Markdown } from "@/components/markdown";
import { PostCard } from "@/components/post-card";
import { CopyLinkButton, ReadingProgress } from "@/components/reading-tools";
import { getPublishedPost, listPublished } from "@/lib/queries";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  await connection();
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) return { title: "مطلب پیدا نشد", robots: { index: false } };
  return {
    title: post.seoTitle || post.title,
    description: post.seoDescription || post.excerpt,
    alternates: { canonical: `/posts/${post.slug}` },
    openGraph: {
      type: "article",
      title: post.title,
      description: post.excerpt,
      publishedTime: post.publishedAt?.toISOString(),
      images: post.coverPath ? [{ url: post.coverPath }] : [],
    },
  };
}

export default async function PostPage({
  params,
}: {
  params: Promise<{ slug: string }>;
}) {
  await connection();
  const { slug } = await params;
  const post = await getPublishedPost(slug);
  if (!post) notFound(); // Never expose a draft through the public URL.
  const minutes = Math.max(
    1,
    Math.ceil(post.body.trim().split(/\s+/).length / 180),
  );
  const { items: suggestions } = await listPublished({
    categorySlug: post.categorySlug || undefined,
  });
  const related = suggestions.filter((item) => item.slug !== slug).slice(0, 3);

  return (
    <main>
      <ReadingProgress />
      <article className="mx-auto max-w-7xl px-5 pt-9 sm:px-8 lg:px-10">
        <nav
          aria-label="مسیر صفحه"
          className="flex flex-wrap items-center gap-2 text-xs font-semibold text-muted"
        >
          <Link href="/" className="hover:text-forest">
            خانه
          </Link>
          <span>/</span>
          {post.categorySlug && (
            <>
              <Link
                href={`/categories/${post.categorySlug}`}
                className="hover:text-forest"
              >
                {post.categoryName}
              </Link>
              <span>/</span>
            </>
          )}
          <span className="max-w-[250px] truncate text-forest">
            {post.title}
          </span>
        </nav>
        <header className="relative mx-auto max-w-[980px] pb-11 pt-13 sm:pt-18">
          <div
            aria-hidden
            className="absolute -right-28 top-5 -z-10 h-80 w-80 rounded-full bg-[#754ec4]/16 blur-[85px]"
          />
          <span className="eyebrow">
            {post.categoryName ?? "یادداشت / حاشیه"}
          </span>
          <h1 className="mt-7 text-[clamp(2.65rem,5vw,5.15rem)] font-black leading-[1.52] tracking-[-.05em] text-ink">
            {post.title}
          </h1>
          <p className="mt-7 max-w-3xl text-[clamp(1rem,1.7vw,1.25rem)] leading-[2.05] text-muted">
            {post.excerpt}
          </p>
          <div className="mt-10 flex flex-wrap items-center justify-between gap-5 border-y border-line py-5">
            <div className="flex items-center gap-3">
              <span className="grid h-12 w-12 place-items-center rounded-[1rem] border border-forest/45 bg-forest/10 text-xl font-black text-forest">
                {post.authorName.charAt(0)}
              </span>
              <div>
                <p className="text-sm font-extrabold text-ink">
                  {post.authorName}
                </p>
                <p className="mt-1 text-[11px] text-muted">نویسندهٔ حاشیه</p>
              </div>
            </div>
            <div className="flex flex-wrap items-center gap-3 text-xs text-muted">
              <time
                dateTime={post.publishedAt?.toISOString()}
                className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2"
              >
                <CalendarDays size={14} className="text-forest" />
                {post.publishedAt?.toLocaleDateString("fa-IR")}
              </time>
              <span className="inline-flex items-center gap-1.5 rounded-full border border-line px-3 py-2">
                <Clock3 size={14} className="text-rust" />
                {minutes.toLocaleString("fa-IR")} دقیقه مطالعه
              </span>
            </div>
          </div>
        </header>
        <div className="relative h-64 overflow-hidden rounded-[1.8rem] border border-[#435779] bg-sage shadow-[0_25px_75px_-45px_#4868c9b9] sm:aspect-[2.05] sm:h-auto">
          {post.coverPath ? (
            <Image
              src={post.coverPath}
              alt={post.title}
              fill
              priority
              sizes="(max-width: 1200px) 100vw, 1200px"
              className="object-cover"
            />
          ) : (
            <CoverArt slug={post.slug} className="h-full w-full" />
          )}
        </div>
        <div className="mx-auto grid max-w-[1080px] gap-12 pb-16 pt-14 lg:grid-cols-[195px_minmax(0,1fr)] lg:gap-16 lg:pt-20">
          <aside className="hidden lg:block">
            <div className="panel sticky top-32 p-5">
              <span className="inline-flex items-center gap-2 text-xs font-black text-forest">
                <BookOpenText size={17} /> این یادداشت
              </span>
              <div className="glow-line my-5" />
              <p className="text-xs leading-7 text-muted">
                {minutes.toLocaleString("fa-IR")} دقیقه مطالعه
                <br />
                از مجموعهٔ حاشیه
              </p>
              <div className="mt-6">
                <CopyLinkButton />
              </div>
              <Link
                href="/"
                className="mt-7 inline-flex items-center gap-2 text-xs font-bold text-forest hover:text-white"
              >
                <ArrowRight size={14} /> همهٔ یادداشت‌ها
              </Link>
            </div>
          </aside>
          <div className="min-w-0">
            <Markdown text={post.body} />
            <div className="mt-16 flex flex-wrap items-center gap-3 border-t border-line pt-7">
              <span className="ml-2 text-xs font-bold text-muted">
                برچسب‌ها
              </span>
              {post.tags.map((tag) => (
                <Link
                  key={tag.slug}
                  href={`/tags/${tag.slug}`}
                  className="rounded-full border border-line bg-surface px-4 py-2 text-xs font-bold text-forest transition hover:border-forest hover:bg-sage"
                >
                  #{tag.name}
                </Link>
              ))}
              {!post.tags.length && (
                <span className="text-xs text-muted">بدون برچسب</span>
              )}
            </div>
            <div className="mt-8 flex items-center justify-between gap-4">
              <Link
                href="/"
                className="inline-flex items-center gap-2 text-sm font-bold text-forest hover:text-white"
              >
                <ArrowRight size={17} /> بازگشت به یادداشت‌ها
              </Link>
              <div className="lg:hidden">
                <CopyLinkButton />
              </div>
            </div>
          </div>
        </div>
      </article>
      {!!related.length && (
        <section className="border-t border-line bg-[#101827] py-18">
          <div className="mx-auto max-w-7xl px-5 sm:px-8 lg:px-10">
            <div className="mb-9 flex flex-wrap items-end justify-between gap-4">
              <div>
                <span className="eyebrow">
                  <Sparkles size={15} /> یک صفحهٔ دیگر
                </span>
                <h2 className="mt-3 text-2xl font-black text-ink sm:text-3xl">
                  شاید این‌ها را هم دوست داشته باشی
                </h2>
              </div>
              <Link
                href="/"
                className="inline-flex items-center gap-1 text-sm font-bold text-forest hover:text-white"
              >
                همهٔ یادداشت‌ها <ArrowLeft size={16} />
              </Link>
            </div>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {related.map((item, index) => (
                <PostCard key={item.slug} post={item} index={index} />
              ))}
            </div>
          </div>
        </section>
      )}
    </main>
  );
}
