import Link from "next/link";
import { ArrowLeft, Hash, Layers3, MoveUpLeft } from "lucide-react";
import { EmptyState, Pagination } from "@/components/content-ui";
import { CoverArt } from "@/components/cover-art";
import { PostCard, type PublicPostCard } from "@/components/post-card";

export function ArchiveView({
  kind,
  name,
  slug,
  items,
  total,
  page,
  pages,
  siblings,
}: {
  kind: "category" | "tag";
  name: string;
  slug: string;
  items: PublicPostCard[];
  total: number;
  page: number;
  pages: number;
  siblings: { id: string; name: string; slug: string }[];
}) {
  const isTag = kind === "tag";
  const base = isTag ? "/tags" : "/categories";
  return (
    <main className="mx-auto max-w-7xl px-5 pb-12 pt-9 sm:px-8 lg:px-10">
      <nav
        aria-label="مسیر صفحه"
        className="mb-7 flex items-center gap-2 text-xs font-semibold text-muted"
      >
        <Link className="hover:text-forest" href="/">
          خانه
        </Link>
        <span>/</span>
        <span>{isTag ? "برچسب‌ها" : "دسته‌بندی‌ها"}</span>
        <span>/</span>
        <span className="text-forest">{name}</span>
      </nav>
      <header
        className={`grid-field relative grid overflow-hidden rounded-[2rem] border border-[#415773] md:grid-cols-[1fr_.8fr] ${isTag ? "bg-[#19172d]" : "bg-[#101f31]"}`}
      >
        <div
          aria-hidden
          className={`absolute right-[-8%] top-[-55%] h-[480px] w-[480px] rounded-full blur-[100px] ${isTag ? "bg-[#7548c9]/28" : "bg-[#27d6d0]/18"}`}
        />
        <div className="relative z-10 flex flex-col justify-center px-8 py-14 sm:px-12 md:py-16 lg:px-16">
          <span className="eyebrow">
            {isTag ? "یک رشته از ایده‌ها" : "یک جهان برای کشف کردن"}
          </span>
          <div className="mt-8 flex items-center gap-3">
            <span className="grid h-11 w-11 place-items-center rounded-xl border border-forest/40 bg-forest/10 text-forest">
              {isTag ? <Hash size={21} /> : <Layers3 size={21} />}
            </span>
            <span className="text-xs font-bold text-muted">
              {isTag ? "برچسب" : "دسته‌بندی"}{" "}
              <span className="text-forest">/</span>{" "}
              {total.toLocaleString("fa-IR")} یادداشت
            </span>
          </div>
          <h1 className="mt-5 max-w-3xl text-[clamp(3.6rem,7vw,7rem)] font-black leading-[1.28] tracking-[-.06em] text-ink">
            {name}
            <span className="text-forest">.</span>
          </h1>
          <p className="mt-5 max-w-xl text-sm leading-8 text-muted">
            مجموعه‌ای از یادداشت‌ها و تجربه‌ها دربارهٔ {name}؛ از یک زاویهٔ تازه
            به موضوع نگاه کن.
          </p>
          <div
            className="mt-9 inline-flex items-center gap-2 text-[10px] font-bold tracking-[.17em] text-rust"
            dir="ltr"
          >
            EXPLORE THE COLLECTION <MoveUpLeft size={14} />
          </div>
        </div>
        <div className="relative p-5 pt-0 sm:p-8 md:p-8 md:pr-0">
          <CoverArt
            slug={slug}
            className="h-52 w-full rounded-[1.35rem] border border-white/10 md:h-full md:min-h-[340px] md:rounded-l-none md:rounded-r-[1.35rem] [&_.cover-art__mark]:text-5xl"
          />
        </div>
      </header>
      <section className="mt-16" aria-label="مطالب این آرشیو">
        <div className="mb-8 flex flex-wrap items-end justify-between gap-3 border-b border-line pb-6">
          <div>
            <span className="eyebrow">READ THE SIGNAL / بخوانیم</span>
            <h2 className="mt-3 text-[clamp(1.7rem,3vw,2.4rem)] font-black text-ink">
              یادداشت‌های این {isTag ? "برچسب" : "دسته"}
            </h2>
          </div>
          <span className="rounded-full border border-line px-4 py-2 text-xs font-bold text-muted">
            {total.toLocaleString("fa-IR")} مطلب منتشرشده
          </span>
        </div>
        {items.length ? (
          <>
            <div className="grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
              {items.map((post, index) => (
                <PostCard
                  key={post.slug}
                  post={post}
                  index={index + (page - 1) * 9}
                />
              ))}
            </div>
            <Pagination
              page={page}
              pages={pages}
              href={(next) => `${base}/${slug}?page=${next}`}
            />
          </>
        ) : (
          <EmptyState
            title="اینجا هنوز ساکت است"
            description="فعلاً مطلب منتشرشده‌ای برای این موضوع نداریم. شاید جای دیگری از مجله چیزی برای تو باشد."
            actionHref="/"
            actionLabel="بازگشت به یادداشت‌ها"
          />
        )}
      </section>
      {siblings.length > 1 && (
        <aside className="mt-20 border-t border-line pt-9">
          <div className="mb-6 flex items-center justify-between gap-3">
            <h2 className="text-lg font-black text-ink">
              مسیرهای دیگر برای خواندن
            </h2>
            <Link
              href="/#explore"
              className="inline-flex items-center gap-1 text-xs font-bold text-forest"
            >
              همهٔ موضوع‌ها <ArrowLeft size={14} />
            </Link>
          </div>
          <div className="flex flex-wrap gap-2.5">
            {siblings
              .filter((item) => item.slug !== slug)
              .slice(0, 8)
              .map((item) => (
                <Link
                  key={item.id}
                  href={`${base}/${item.slug}`}
                  className="rounded-full border border-line bg-surface px-4 py-2.5 text-xs font-semibold text-ink hover:border-forest hover:text-forest"
                >
                  {item.name}
                </Link>
              ))}
          </div>
        </aside>
      )}
    </main>
  );
}
