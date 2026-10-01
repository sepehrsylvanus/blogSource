import Link from "next/link";
import { ArrowLeft, Eye, Heart, Layers, Network, Radar, Sparkles, FileText } from "lucide-react";
import { getActivity, getPosts, getSeries, getStats, getTags, getTechUsage } from "@/lib/data";
import { formatDateFa, num } from "@/lib/markdown";
import { PostCard } from "@/components/PostCard";
import { Marquee } from "@/components/Marquee";
import { Reveal } from "@/components/Reveal";
import { Heatmap } from "@/components/Heatmap";
import { GenerativeCover } from "@/components/GenerativeCover";

export const dynamic = "force-dynamic";

export default async function HomePage() {
  const [posts, stats, tags, activity, series, techs] = await Promise.all([
    getPosts({ limit: 9 }),
    getStats(),
    getTags(),
    getActivity(),
    getSeries(),
    getTechUsage(),
  ]);

  const featured = posts.filter((p) => p.featured);
  const latest = posts.slice(0, 5);
  const marqueeItems = [
    ...techs.filter((t) => t.ring !== "hold").map((t) => t.name),
    ...tags.map((t) => `#${t.name}`),
  ];

  return (
    <div>
      {/* ------------------------------- hero ------------------------------- */}
      <section className="mx-auto max-w-6xl px-5 pb-16 pt-16 sm:pt-24">
        <Reveal>
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-faint" dir="ltr">
            <span className="relative flex size-2">
              <span className="absolute inline-flex size-full animate-pulse-dot rounded-full bg-ember" />
              <span className="relative inline-flex size-2 rounded-full bg-ember" />
            </span>
            SANIDEV ~ /weblog · FAR FROM CRUD
          </p>
        </Reveal>
        <Reveal delay={0.08}>
          <h1 className="mt-6 max-w-4xl text-5xl font-black leading-[1.15] tracking-tight sm:text-7xl sm:leading-[1.1]">
            وبلاگی که
            <span className="relative mx-3 inline-block text-ember">
              فقط CRUD
              <svg className="absolute -bottom-2 end-0 w-full" viewBox="0 0 120 8" aria-hidden>
                <path d="M2 6 Q60 -4 118 5" fill="none" stroke="var(--color-ember-2)" strokeWidth="3" strokeLinecap="round" />
              </svg>
            </span>
            نیست.
          </h1>
        </Reveal>
        <Reveal delay={0.16}>
          <p className="mt-8 max-w-2xl text-lg leading-9 text-mute">
            سانی‌ام؛ سازنده‌ی کانال یوتیوب
            <span className="font-mono text-ember-2" dir="ltr"> @sanidev-web</span>.
            این‌جا نسخه‌ی عمیق‌تر ویدیوهاست: با <b className="text-paper">گراف دانش</b>،
            <b className="text-paper"> رادار تکنولوژی</b> و جستجوی زنده — همه با Next.js 16 و PostgreSQL.
          </p>
        </Reveal>
        <Reveal delay={0.24}>
          <div className="mt-10 flex flex-wrap items-center gap-3">
            <Link
              href="/posts"
              className="group flex items-center gap-2 rounded-2xl bg-ember px-6 py-3.5 font-bold text-ink transition-all hover:bg-ember-2 hover:shadow-[0_16px_50px_-12px_rgba(255,90,54,0.5)]"
            >
              شروع خواندن
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </Link>
            <Link
              href="/graph"
              className="flex items-center gap-2 rounded-2xl border border-line bg-ink-3 px-6 py-3.5 font-bold text-paper transition-colors hover:border-ember/50 hover:text-ember"
            >
              <Network className="size-4" />
              گراف دانش
            </Link>
          </div>
        </Reveal>

        <Reveal delay={0.32}>
          <dl className="mt-14 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line-soft sm:grid-cols-4">
            {[
              { label: "نوشته", value: stats.posts, icon: FileText },
              { label: "بازدید", value: stats.views, icon: Eye },
              { label: "تشویق", value: stats.claps, icon: Heart },
              { label: "تکنولوژی رادار", value: techs.length, icon: Layers },
            ].map((s) => (
              <div key={s.label} className="group bg-ink-2 p-5 transition-colors hover:bg-ink-3">
                <dt className="flex items-center gap-1.5 text-xs text-faint">
                  <s.icon className="size-3.5" />
                  {s.label}
                </dt>
                <dd className="mt-2 font-mono text-3xl font-bold text-paper" dir="ltr">
                  {num(s.value)}
                  <span className="text-ember">+</span>
                </dd>
              </div>
            ))}
          </dl>
        </Reveal>
      </section>

      <Marquee items={marqueeItems} />

      {/* ----------------------------- featured ----------------------------- */}
      <section className="mx-auto max-w-6xl px-5 py-20">
        <Reveal>
          <div className="mb-10 flex items-end justify-between">
            <div>
              <p className="flex items-center gap-2 font-mono text-xs tracking-widest text-ember" dir="ltr">
                <Sparkles className="size-3.5" />
                FEATURED
              </p>
              <h2 className="mt-3 text-3xl font-black sm:text-4xl">نوشته‌های ویژه</h2>
            </div>
            <Link href="/posts" className="group hidden items-center gap-1.5 text-sm text-mute transition-colors hover:text-ember sm:flex">
              همه‌ی نوشته‌ها
              <ArrowLeft className="size-4 transition-transform group-hover:-translate-x-1" />
            </Link>
          </div>
        </Reveal>

        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal className="lg:row-span-2">
            {featured[0] && (
              <Link
                href={`/posts/${featured[0].slug}`}
                className="group relative flex h-full min-h-[420px] flex-col justify-end overflow-hidden rounded-3xl border border-line"
              >
                <GenerativeCover
                  seed={featured[0].slug}
                  glyph="16"
                  className="absolute inset-0 h-full w-full transition-transform duration-700 group-hover:scale-[1.04]"
                />
                <div className="absolute inset-0 bg-gradient-to-t from-ink via-ink/40 to-transparent" />
                <div className="relative p-7">
                  <div className="flex flex-wrap gap-1.5">
                    {featured[0].tags.map((t) => (
                      <span key={t} className="rounded-md bg-ink/70 px-2 py-1 font-mono text-[10px] text-ember-2 backdrop-blur" dir="ltr">
                        #{t}
                      </span>
                    ))}
                  </div>
                  <h3 className="mt-4 text-2xl font-black leading-10 sm:text-3xl">{featured[0].title}</h3>
                  <p className="mt-3 line-clamp-2 text-sm leading-7 text-mute">{featured[0].excerpt}</p>
                </div>
              </Link>
            )}
          </Reveal>
          {featured.slice(1).map((post, i) => (
            <Reveal key={post.slug} delay={0.1 * (i + 1)}>
              <PostCard post={post} />
            </Reveal>
          ))}
        </div>
      </section>

      {/* ------------------------------ latest ------------------------------ */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <Reveal>
          <h2 className="mb-10 text-3xl font-black sm:text-4xl">تازه‌ترین‌ها</h2>
        </Reveal>
        <div className="divide-y divide-line-soft border-y border-line-soft">
          {latest.map((post, i) => (
            <Reveal key={post.slug} delay={i * 0.06}>
              <Link
                href={`/posts/${post.slug}`}
                className="group grid gap-3 py-6 transition-colors sm:grid-cols-[64px_1fr_auto] sm:items-center sm:gap-6"
              >
                <span className="font-mono text-4xl font-black text-line transition-colors group-hover:text-ember" dir="ltr">
                  {String(i + 1).padStart(2, "0")}
                </span>
                <span>
                  <span className="text-lg font-bold leading-8 text-paper transition-colors group-hover:text-ember-2">
                    {post.title}
                  </span>
                  <span className="mt-1 flex flex-wrap items-center gap-3 text-xs text-faint">
                    <span>{formatDateFa(post.publishedAt)}</span>
                    {post.tags.map((t) => (
                      <span key={t} className="font-mono text-[10px]" dir="ltr">#{t}</span>
                    ))}
                  </span>
                </span>
                <span className="flex items-center gap-4 font-mono text-[11px] text-faint">
                  <span className="flex items-center gap-1"><Eye className="size-3" />{num(post.views)}</span>
                  <span className="flex items-center gap-1"><Heart className="size-3" />{num(post.claps)}</span>
                  <ArrowLeft className="size-4 opacity-0 transition-all group-hover:-translate-x-1 group-hover:text-ember group-hover:opacity-100" />
                </span>
              </Link>
            </Reveal>
          ))}
        </div>
      </section>

      {/* ---------------------------- graph teaser ----------------------------- */}
      <section className="mx-auto max-w-6xl px-5 pb-20">
        <div className="grid gap-5 lg:grid-cols-2">
          <Reveal>
            <Link href="/graph" className="group relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-line bg-ink-2 p-7 transition-colors hover:border-ember/40">
              <div className="absolute -end-16 -top-16 size-64 rounded-full bg-ember/10 blur-3xl transition-all group-hover:bg-ember/20" aria-hidden />
              <Network className="size-9 text-ember" />
              <div>
                <h3 className="text-2xl font-black">گراف دانش</h3>
                <p className="mt-2 max-w-sm text-sm leading-7 text-mute">
                  نوشته‌ها و تگ‌ها به‌صورت یک گراف زنده به هم وصل‌اند؛ بکش، بچرخان و دنبال پیوندها بگرد.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-ember" dir="ltr">
                  force-directed canvas
                  <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1 rtl:-scale-x-100" />
                </span>
              </div>
            </Link>
          </Reveal>
          <Reveal delay={0.1}>
            <Link href="/stack" className="group relative flex h-full min-h-[260px] flex-col justify-between overflow-hidden rounded-3xl border border-line bg-ink-2 p-7 transition-colors hover:border-ember-2/50">
              <div className="absolute -bottom-16 -start-16 size-64 rounded-full bg-ember-2/10 blur-3xl transition-all group-hover:bg-ember-2/20" aria-hidden />
              <Radar className="size-9 text-ember-2" />
              <div>
                <h3 className="text-2xl font-black">رادار تکنولوژی</h3>
                <p className="mt-2 max-w-sm text-sm leading-7 text-mute">
                  هر تکنولوژی که در همه‌ی پروژه‌هایم استفاده کرده‌ام — با وضعیتش: adopt، trial، assess یا hold.
                </p>
                <span className="mt-4 inline-flex items-center gap-1.5 font-mono text-xs text-ember-2" dir="ltr">
                  aggregated from {stats.projects} projects
                  <ArrowLeft className="size-3.5 transition-transform group-hover:-translate-x-1 rtl:-scale-x-100" />
                </span>
              </div>
            </Link>
          </Reveal>
        </div>
      </section>

      {/* ------------------------------ series ------------------------------- */}
      {series.length > 0 && (
        <section className="mx-auto max-w-6xl px-5 pb-20">
          <Reveal>
            <h2 className="mb-10 text-3xl font-black sm:text-4xl">مجموعه‌ها</h2>
          </Reveal>
          <div className="grid gap-5 md:grid-cols-2">
            {series.map((s) => (
              <Reveal key={s.title}>
                <div className="rounded-3xl border border-line bg-ink-2 p-6">
                  <p className="font-mono text-[11px] tracking-widest text-faint" dir="ltr">SERIES</p>
                  <h3 className="mt-2 text-xl font-black">{s.title}</h3>
                  <ol className="mt-4 space-y-2.5">
                    {s.posts.map((p) => (
                      <li key={p.slug}>
                        <Link href={`/posts/${p.slug}`} className="group flex items-baseline gap-3 text-sm">
                          <span className="font-mono text-xs text-ember" dir="ltr">{String(p.series!.order).padStart(2, "0")}</span>
                          <span className="text-mute transition-colors group-hover:text-paper">{p.title}</span>
                        </Link>
                      </li>
                    ))}
                  </ol>
                </div>
              </Reveal>
            ))}
          </div>
        </section>
      )}

      {/* ------------------------------ heatmap ------------------------------ */}
      <section className="mx-auto max-w-6xl px-5 pb-24">
        <Reveal>
          <Heatmap activity={activity} />
        </Reveal>
      </section>
    </div>
  );
}
