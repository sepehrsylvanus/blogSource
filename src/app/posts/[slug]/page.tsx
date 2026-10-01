import Link from "next/link";
import type { Metadata } from "next";
import { notFound } from "next/navigation";
import { ArrowLeft, ArrowRight, Clock3, Eye, Layers, Link2 } from "lucide-react";
import {
  getAdjacentPosts,
  getPost,
  getPostHeadings,
  getPosts,
  getRelatedPosts,
  getSeriesSiblings,
} from "@/lib/data";
import { formatDateFa, num } from "@/lib/markdown";
import { Markdown } from "@/components/Markdown";
import { TOC } from "@/components/TOC";
import { ProgressBar } from "@/components/ProgressBar";
import { ClapButton } from "@/components/ClapButton";
import { ViewBeacon } from "@/components/ViewBeacon";
import { GenerativeCover } from "@/components/GenerativeCover";
import { PostCard } from "@/components/PostCard";

export const dynamic = "force-dynamic";

export async function generateMetadata({
  params,
}: {
  params: Promise<{ slug: string }>;
}): Promise<Metadata> {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) return { title: "نوشته یافت نشد" };
  return {
    title: post.title,
    description: post.excerpt,
    openGraph: { type: "article", publishedTime: post.publishedAt, tags: post.tags },
  };
}

export default async function PostPage({ params }: { params: Promise<{ slug: string }> }) {
  const { slug } = await params;
  const post = await getPost(slug);
  if (!post) notFound();

  const [headings, related, siblings, adjacent, allPosts] = await Promise.all([
    getPostHeadings(slug),
    getRelatedPosts(post),
    getSeriesSiblings(post),
    getAdjacentPosts(post),
    getPosts({ limit: 50 }),
  ]);

  const backlinks = allPosts.filter((p) => p.slug !== slug && p.content.includes(`/posts/${slug}`));

  return (
    <article className="relative">
      <ProgressBar />
      <ViewBeacon slug={slug} />

      <script
        type="application/ld+json"
        dangerouslySetInnerHTML={{
          __html: JSON.stringify({
            "@context": "https://schema.org",
            "@type": "BlogPosting",
            headline: post.title,
            description: post.excerpt,
            datePublished: post.publishedAt,
            keywords: post.tags.join(","),
            inLanguage: "fa-IR",
          }),
        }}
      />

      {/* header */}
      <header className="mx-auto max-w-6xl px-5 pt-12">
        <nav className="flex items-center gap-2 text-xs text-faint" aria-label="مسیر">
          <Link href="/" className="transition-colors hover:text-paper">خانه</Link>
          <span>/</span>
          <Link href="/posts" className="transition-colors hover:text-paper">نوشته‌ها</Link>
          <span>/</span>
          <span className="truncate text-mute">{post.title}</span>
        </nav>

        <h1 className="mt-8 max-w-3xl text-4xl font-black leading-[1.35] sm:text-5xl sm:leading-[1.3]">
          {post.title}
        </h1>
        <p className="mt-6 max-w-2xl text-lg leading-9 text-mute">{post.excerpt}</p>

        <div className="mt-8 flex flex-wrap items-center gap-x-6 gap-y-3 border-y border-line-soft py-4 text-sm text-faint">
          {post.author && (
            <Link
              href={`/authors/${post.author.username}`}
              className="flex items-center gap-2 text-mute transition-colors hover:text-ember-2"
            >
              <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-ember/80 to-ember-2/80 text-xs font-black text-ink">
                {post.author.name.trim().charAt(0)}
              </span>
              <span className="font-semibold">{post.author.name}</span>
            </Link>
          )}
          <span>{formatDateFa(post.publishedAt)}</span>
          <span className="flex items-center gap-1.5">
            <Clock3 className="size-4" />
            {new Intl.NumberFormat("fa-IR").format(post.readingTime)} دقیقه مطالعه
          </span>
          <span className="flex items-center gap-1.5">
            <Eye className="size-4" />
            <span dir="ltr">{num(post.views)}</span> بازدید
          </span>
          {post.series && (
            <span className="flex items-center gap-1.5 text-ember-2">
              <Layers className="size-4" />
              مجموعه‌ی «{post.series.title}» — قسمت {new Intl.NumberFormat("fa-IR").format(post.series.order)}
            </span>
          )}
          <div className="ms-auto flex gap-1.5">
            {post.tags.map((tag) => (
              <Link
                key={tag}
                href={`/posts?tag=${tag}`}
                className="rounded-lg bg-ink-3 px-2.5 py-1 font-mono text-[11px] text-mute transition-colors hover:text-ember"
                dir="ltr"
              >
                #{tag}
              </Link>
            ))}
          </div>
        </div>
      </header>

      {/* cover */}
      <div className="mx-auto mt-10 max-w-6xl px-5">
        <div className="overflow-hidden rounded-3xl border border-line">
          <GenerativeCover
            seed={post.slug}
            glyph={post.tags[0]?.slice(0, 2).toUpperCase() ?? "SD"}
            className="aspect-[2.4/1] w-full sm:aspect-[2.8/1]"
          />
        </div>
      </div>

      {/* body */}
      <div className="mx-auto grid max-w-6xl gap-12 px-5 py-14 lg:grid-cols-[220px_minmax(0,1fr)]">
        <aside className="hidden lg:block">
          <div className="sticky top-24">
            <TOC headings={headings} />
          </div>
        </aside>

        <div className="min-w-0 max-w-[46rem]">
          <Markdown content={post.content} />

          {/* series */}
          {siblings.length > 1 && (
            <section className="mt-16 rounded-2xl border border-line bg-ink-2 p-6">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-faint">
                <Layers className="size-3.5 text-ember" />
                مجموعه‌ی «{post.series!.title}»
              </p>
              <ol className="mt-4 space-y-2.5">
                {siblings.map((s) => (
                  <li key={s.slug} className="flex items-baseline gap-3">
                    <span className="font-mono text-xs text-faint" dir="ltr">
                      {String(s.series!.order).padStart(2, "0")}
                    </span>
                    {s.slug === slug ? (
                      <span className="text-sm font-bold text-ember">{s.title} — همین‌جایی</span>
                    ) : (
                      <Link href={`/posts/${s.slug}`} className="text-sm text-mute transition-colors hover:text-paper">
                        {s.title}
                      </Link>
                    )}
                  </li>
                ))}
              </ol>
            </section>
          )}

          {/* backlinks */}
          {backlinks.length > 0 && (
            <section className="mt-8 rounded-2xl border border-dashed border-line p-6">
              <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-faint">
                <Link2 className="size-3.5 text-mint" />
                نوشته‌هایی که به این‌جا ارجاع داده‌اند
              </p>
              <ul className="mt-3 space-y-2">
                {backlinks.map((b) => (
                  <li key={b.slug}>
                    <Link href={`/posts/${b.slug}`} className="text-sm text-mute transition-colors hover:text-ember-2">
                      ← {b.title}
                    </Link>
                  </li>
                ))}
              </ul>
            </section>
          )}

          {/* clap */}
          <div className="mt-14 flex flex-col items-center gap-3 rounded-3xl border border-line bg-ink-2 py-10">
            <p className="text-sm text-mute">اگر این نوشته حلت کرد، تشویقش کن — محدودیتی نیست:</p>
            <ClapButton slug={slug} initial={post.claps} />
          </div>

          {/* prev / next */}
          <nav className="mt-14 grid gap-4 sm:grid-cols-2" aria-label="نوشته‌های قبل و بعد">
            {adjacent.prev ? (
              <Link href={`/posts/${adjacent.prev.slug}`} className="group rounded-2xl border border-line p-5 transition-colors hover:border-ember/40">
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-faint">
                  <ArrowRight className="size-3" /> قبلی
                </span>
                <span className="mt-2 block text-sm font-bold leading-7 text-mute transition-colors group-hover:text-paper">
                  {adjacent.prev.title}
                </span>
              </Link>
            ) : <span />}
            {adjacent.next ? (
              <Link href={`/posts/${adjacent.next.slug}`} className="group rounded-2xl border border-line p-5 text-left transition-colors hover:border-ember/40">
                <span className="flex items-center gap-1.5 font-mono text-[10px] text-faint">
                  بعدی <ArrowLeft className="size-3" />
                </span>
                <span className="mt-2 block text-sm font-bold leading-7 text-mute transition-colors group-hover:text-paper">
                  {adjacent.next.title}
                </span>
              </Link>
            ) : <span />}
          </nav>
        </div>
      </div>

      {/* related */}
      {related.length > 0 && (
        <section className="border-t border-line-soft bg-ink-2/40">
          <div className="mx-auto max-w-6xl px-5 py-16">
            <h2 className="mb-8 flex items-center gap-2 text-2xl font-black">
              <Link2 className="size-5 text-ember" />
              پیوندهای این نوشته
            </h2>
            <div className="grid gap-5 sm:grid-cols-2 lg:grid-cols-4">
              {related.map((p) => (
                <PostCard key={p.slug} post={p} />
              ))}
            </div>
          </div>
        </section>
      )}
    </article>
  );
}
