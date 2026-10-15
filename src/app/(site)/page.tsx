import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowUpLeft,
  Asterisk,
  BookOpenText,
  MoveUpLeft,
  Search,
  Sparkles,
  Zap,
} from "lucide-react";
import { EmptyState, Pagination } from "@/components/content-ui";
import { LeadStory, PostCard } from "@/components/post-card";
import { getCategories, listPublished } from "@/lib/queries";
import { safePage } from "@/lib/validation";

export default async function Home({
  searchParams,
}: {
  searchParams: Promise<{ q?: string; page?: string }>;
}) {
  await connection(); // DB is consulted at request time, never at Docker/CI build time.
  const params = await searchParams;
  const q = String(params.q || "")
    .trim()
    .slice(0, 80);
  const page = safePage(params.page);
  const [{ items, total, pages }, categories] = await Promise.all([
    listPublished({ page, query: q }),
    getCategories(),
  ]);
  const pageHref = (next: number) =>
    `/?${new URLSearchParams({ ...(q ? { q } : {}), page: String(next) })}#latest`;
  const lead = !q && page === 1 ? items[0] : undefined;
  const gridItems = lead ? items.slice(1) : items;

  return (
    <main>
      <section
        className="mx-auto max-w-[1350px] px-4 pt-7 sm:px-6 sm:pt-9 lg:px-8"
        aria-labelledby="hero-title"
      >
        <div className="grid-field relative grid overflow-hidden rounded-[2.3rem] border border-[#425371] bg-[#111b2c] shadow-[0_34px_100px_-60px_#3568bd90] lg:min-h-[625px] lg:grid-cols-[1fr_1.02fr]">
          <div
            aria-hidden
            className="pointer-events-none absolute -right-28 -top-40 h-[500px] w-[500px] rounded-full bg-[#604fbe]/25 blur-[105px]"
          />
          <div className="relative z-10 flex flex-col justify-center px-8 pb-12 pt-14 sm:px-12 lg:px-16 lg:py-16">
            <span className="eyebrow reveal">ISSUE 001 / حاشیهٔ ایده‌ها</span>
            <h1
              id="hero-title"
              className="reveal reveal-delayed mt-7 max-w-[680px] text-[clamp(3.05rem,5.2vw,5.9rem)] font-black leading-[1.34] tracking-[-.065em] text-ink"
            >
              ایده‌ها <span className="gradient-type">آینده</span> را می‌سازند
              <span className="text-forest">.</span>
            </h1>
            <p className="mt-7 max-w-lg text-[15px] leading-[2.1] text-muted">
              اینجا جایی‌ست برای فکرهایی که در سکوت شکل می‌گیرند و با نوشتن جان
              می‌گیرند. دربارهٔ طراحی، فناوری و ساختنِ فردایی متفاوت.
            </p>
            <div className="mt-9 flex flex-wrap items-center gap-3">
              <Link href="#latest" className="button-dark">
                کشف یادداشت‌ها <ArrowLeft size={17} />
              </Link>
              <Link href="/about" className="button-outline">
                قصهٔ ما <MoveUpLeft size={17} />
              </Link>
            </div>
            <div className="mt-12 flex flex-wrap items-center gap-4 border-t border-white/15 pt-6 text-[11px] font-semibold text-muted">
              <div className="flex items-center gap-2">
                <span className="grid h-8 w-8 place-items-center rounded-full border border-forest/50 bg-forest/10 text-forest">
                  <Asterisk size={15} />
                </span>
                <span>
                  {total.toLocaleString("fa-IR")} یادداشت برای کشف‌کردن
                </span>
              </div>
              <span className="hidden h-1 w-1 rounded-full bg-rust sm:block" />
              <span className="text-rust" dir="ltr">
                IDEAS IN MOTION · VOL. 01
              </span>
            </div>
          </div>
          <div className="relative min-h-[350px] overflow-hidden lg:min-h-full">
            <Image
              src="/neon-hero.jpg"
              alt="مجسمهٔ حلقه‌ای شیشه‌ای با درخشش آبی در فضایی تاریک"
              fill
              priority
              sizes="(max-width: 1024px) 100vw, 50vw"
              className="object-cover object-[50%_54%]"
            />
            <div
              aria-hidden
              className="absolute inset-0 bg-gradient-to-l from-[#111b2c]/55 via-transparent to-transparent lg:from-[#111b2c]/35"
            />
            <div className="glass-panel float-orbit absolute bottom-8 right-6 inline-flex items-center gap-3 rounded-[1rem] px-4 py-3 text-xs font-bold text-ink sm:right-9">
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-forest/15 text-forest">
                <Zap size={19} />
              </span>
              <span>
                سیگنال تازه
                <br />
                <small
                  className="text-[10px] font-semibold text-muted"
                  dir="ltr"
                >
                  STAY CURIOUS
                </small>
              </span>
            </div>
            <div
              className="absolute left-8 top-8 hidden rounded-full border border-white/25 bg-[#0a1322]/50 px-4 py-2 text-[10px] font-bold tracking-[.14em] text-white backdrop-blur-lg sm:block"
              dir="ltr"
            >
              THE FUTURE IS A DRAFT
            </div>
          </div>
        </div>
        <div className="grid gap-3 pt-4 sm:grid-cols-3">
          <div className="panel flex items-center gap-4 !rounded-[1.1rem] p-4">
            <span className="text-[11px] font-bold text-forest" dir="ltr">
              01 /
            </span>
            <p className="text-xs font-semibold text-muted">
              برای فکر کردن، آرام‌تر بخوان.
            </p>
          </div>
          <div className="panel flex items-center gap-4 !rounded-[1.1rem] p-4">
            <span className="text-[11px] font-bold text-rust" dir="ltr">
              02 /
            </span>
            <p className="text-xs font-semibold text-muted">
              از سؤال‌های تازه شروع کن.
            </p>
          </div>
          <div className="panel flex items-center gap-4 !rounded-[1.1rem] p-4">
            <span className="text-[11px] font-bold text-forest" dir="ltr">
              03 /
            </span>
            <p className="text-xs font-semibold text-muted">
              چیزهایی را بساز که می‌مانند.
            </p>
          </div>
        </div>
      </section>

      <section
        id="explore"
        className="mx-auto max-w-7xl scroll-mt-32 px-5 pt-20 sm:px-8 lg:px-10"
      >
        <div className="aurora grid-field grid gap-7 overflow-hidden rounded-[1.85rem] border border-line p-7 sm:p-10 md:grid-cols-[.8fr_1.2fr] md:items-center">
          <div>
            <span className="eyebrow">FIND YOUR SIGNAL</span>
            <h2 className="mt-4 text-[clamp(1.8rem,3vw,2.5rem)] font-black tracking-tight text-ink">
              دنبال چه ایده‌ای هستی؟
            </h2>
            <p className="mt-2 text-sm leading-7 text-muted">
              از یک واژه شروع کن. شاید به چیزی برسی که انتظارش را نداشتی.
            </p>
          </div>
          <form
            role="search"
            action="/"
            className="flex flex-col gap-3 sm:flex-row sm:items-center"
          >
            <label htmlFor="q" className="sr-only">
              جست‌وجو در یادداشت‌ها
            </label>
            <div className="relative flex-1">
              <Search
                size={19}
                className="pointer-events-none absolute right-4 top-1/2 -translate-y-1/2 text-forest"
              />
              <input
                id="q"
                name="q"
                defaultValue={q}
                maxLength={80}
                placeholder="دربارهٔ چه چیزی می‌خوانی؟"
                className="field w-full !border-[#5b7289] !bg-[#091422]/90 pr-12"
              />
            </div>
            <button className="button-dark min-h-[52px]">
              جست‌وجو <ArrowLeft size={16} />
            </button>
          </form>
        </div>
        {!!categories.length && (
          <div className="flex flex-wrap items-center gap-2.5 py-7 text-xs">
            <span className="ml-3 inline-flex items-center gap-1.5 font-bold text-muted">
              <Sparkles size={15} className="text-rust" /> موضوع‌ها
            </span>
            {categories.map((category) => (
              <Link
                key={category.id}
                href={`/categories/${category.slug}`}
                className="rounded-full border border-line bg-surface px-4 py-2.5 font-semibold text-ink transition hover:border-forest hover:bg-sage hover:text-forest"
              >
                {category.name}{" "}
                <span aria-hidden className="mr-1 text-forest">
                  ↗
                </span>
              </Link>
            ))}
          </div>
        )}
      </section>

      <section
        id="latest"
        className="mx-auto max-w-7xl scroll-mt-32 px-5 pb-8 pt-16 sm:px-8 lg:px-10"
        aria-labelledby="latest-title"
      >
        <div className="mb-9 flex flex-wrap items-end justify-between gap-4 border-b border-line pb-7">
          <div>
            <span className="eyebrow">THE JOURNAL / تازه‌ها</span>
            <h2
              id="latest-title"
              className="mt-4 text-[clamp(2.3rem,4.4vw,4.2rem)] font-black leading-[1.4] tracking-[-.05em] text-ink"
            >
              {q ? (
                `نتیجه برای «${q}»`
              ) : (
                <>
                  سیگنال‌های <span className="gradient-type">تازه.</span>
                </>
              )}
            </h2>
            <p className="mt-2 text-sm text-muted">
              {q
                ? `${total.toLocaleString("fa-IR")} نتیجه پیدا شد`
                : "ایده‌هایی از همین حوالی که نگاهت را کمی جابه‌جا می‌کنند."}
            </p>
          </div>
          {q ? (
            <Link href="/#latest" className="button-outline">
              پاک‌کردن جست‌وجو
            </Link>
          ) : (
            <span
              className="hidden rounded-full border border-line px-4 py-2 text-[10px] font-bold tracking-[.14em] text-muted sm:inline-flex"
              dir="ltr"
            >
              SELECTED STORIES{" "}
              <ArrowUpLeft size={15} className="ml-2 text-forest" />
            </span>
          )}
        </div>
        {!items.length ? (
          <EmptyState
            title={
              q ? "این بار چیزی پیدا نشد" : "هنوز اولین یادداشت نوشته نشده"
            }
            description={
              q
                ? "با واژه‌های دیگری جست‌وجو کن یا همهٔ یادداشت‌ها را ببین."
                : "میز نویسنده منتظر اولین داستان است؛ تا آن زمان، از موضوع‌های این مجله دیدن کن."
            }
            actionHref={q ? "/#latest" : "/about"}
            actionLabel={q ? "همهٔ یادداشت‌ها" : "دربارهٔ این مجله"}
          />
        ) : (
          <>
            {lead && (
              <div className="mb-7">
                <LeadStory post={lead} />
              </div>
            )}
            {!!gridItems.length && (
              <div className="grid gap-6 sm:grid-cols-2 xl:grid-cols-3">
                {gridItems.map((post, index) => (
                  <PostCard
                    key={post.slug}
                    post={post}
                    index={index + (lead ? 1 : 0)}
                  />
                ))}
              </div>
            )}
            <Pagination page={page} pages={pages} href={pageHref} />
          </>
        )}
      </section>

      <section className="mx-auto max-w-7xl px-5 pt-20 sm:px-8 lg:px-10">
        <div className="aurora grid-field relative overflow-hidden rounded-[2rem] border border-[#526385]/70 px-8 py-14 sm:px-12 lg:flex lg:items-center lg:justify-between lg:gap-12 lg:px-16">
          <div
            aria-hidden
            className="absolute -left-14 -top-20 h-72 w-72 rounded-full border-[38px] border-white/5"
          />
          <div className="relative">
            <span className="eyebrow">
              <BookOpenText size={15} /> دربارهٔ اینجا
            </span>
            <h2 className="mt-5 max-w-2xl text-[clamp(1.8rem,3vw,2.9rem)] font-black leading-[1.6] text-ink">
              بعضی ایده‌ها قرار نیست{" "}
              <span className="gradient-type">در حاشیه بمانند.</span>
            </h2>
            <p className="mt-3 max-w-lg text-sm leading-8 text-muted">
              ما برای فکرهایی می‌نویسیم که آینده را کمی متفاوت می‌بینند.
            </p>
          </div>
          <Link
            href="/about"
            className="button-dark relative mt-8 shrink-0 lg:mt-0"
          >
            داستان حاشیه <ArrowUpLeft size={17} />
          </Link>
        </div>
      </section>
    </main>
  );
}
