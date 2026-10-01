import Link from "next/link";
import type { Metadata } from "next";
import { ArrowDownWideNarrow, Eye, Flame, Clock3, SearchX } from "lucide-react";
import { getPosts, getTags, type PostSort } from "@/lib/data";
import { PostCard } from "@/components/PostCard";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "نوشته‌ها",
  description: "همه‌ی نوشته‌های وبلاگ سانی‌.دِو — Next.js، PostgreSQL، ری‌اکت و طراحی وب.",
};

const sortOptions: { key: PostSort; label: string; icon: typeof Clock3 }[] = [
  { key: "new", label: "جدیدترین", icon: Clock3 },
  { key: "views", label: "پربازدیدترین", icon: Eye },
  { key: "claps", label: "محبوب‌ترین", icon: Flame },
];

export default async function PostsPage({
  searchParams,
}: {
  searchParams: Promise<{ tag?: string; q?: string; sort?: string }>;
}) {
  const params = await searchParams;
  const sort: PostSort = params.sort === "views" || params.sort === "claps" ? params.sort : "new";
  const [posts, tags] = await Promise.all([
    getPosts({ tag: params.tag, q: params.q, sort }),
    getTags(),
  ]);

  const buildHref = (over: { tag?: string | null; sort?: PostSort; q?: string | null }) => {
    const next = new URLSearchParams();
    const tag = over.tag === undefined ? params.tag : over.tag;
    const s = over.sort ?? sort;
    const q = over.q === undefined ? params.q : over.q;
    if (tag) next.set("tag", tag);
    if (q) next.set("q", q);
    if (s !== "new") next.set("sort", s);
    const str = next.toString();
    return str ? `/posts?${str}` : "/posts";
  };

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.25em] text-faint" dir="ltr">
          /posts — {posts.length} RESULTS
        </p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">
          {params.tag ? (
            <>
              نوشته‌های <span className="font-mono text-ember" dir="ltr">#{params.tag}</span>
            </>
          ) : params.q ? (
            <>
              نتایج برای <span className="text-ember-2">«{params.q}»</span>
            </>
          ) : (
            "همه‌ی نوشته‌ها"
          )}
        </h1>
      </Reveal>

      <Reveal delay={0.08}>
        <div className="mt-10 flex flex-wrap items-center gap-2 border-y border-line-soft py-4">
          <Link
            href={buildHref({ tag: null })}
            className={`rounded-full px-3.5 py-1.5 text-xs font-semibold transition-colors ${
              !params.tag ? "bg-ember text-ink" : "bg-ink-3 text-mute hover:text-paper"
            }`}
          >
            همه
          </Link>
          {tags.map((tag) => (
            <Link
              key={tag.name}
              href={buildHref({ tag: tag.name })}
              className={`flex items-center gap-1.5 rounded-full px-3.5 py-1.5 font-mono text-xs transition-colors ${
                params.tag === tag.name ? "bg-ember text-ink" : "bg-ink-3 text-mute hover:text-paper"
              }`}
              dir="ltr"
            >
              #{tag.name}
              <span className="opacity-60">{tag.count}</span>
            </Link>
          ))}
        </div>
      </Reveal>

      <Reveal delay={0.14}>
        <div className="mt-6 flex items-center gap-2">
          <ArrowDownWideNarrow className="size-4 text-faint" />
          {sortOptions.map((opt) => (
            <Link
              key={opt.key}
              href={buildHref({ sort: opt.key })}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs transition-colors ${
                sort === opt.key ? "bg-ink-3 font-bold text-ember" : "text-faint hover:text-mute"
              }`}
            >
              <opt.icon className="size-3.5" />
              {opt.label}
            </Link>
          ))}
        </div>
      </Reveal>

      {posts.length === 0 ? (
        <div className="mt-20 flex flex-col items-center gap-4 text-center">
          <SearchX className="size-12 text-faint" />
          <p className="text-mute">چیزی این‌جا نیست. شاید فیلتر دیگری امتحان کنی؟</p>
          <Link href="/posts" className="rounded-xl bg-ink-3 px-5 py-2.5 text-sm text-paper hover:text-ember">
            پاک کردن فیلترها
          </Link>
        </div>
      ) : (
        <div className="mt-10 grid gap-5 sm:grid-cols-2 lg:grid-cols-3">
          {posts.map((post, i) => (
            <Reveal key={post.slug} delay={(i % 3) * 0.08}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      )}
    </div>
  );
}
