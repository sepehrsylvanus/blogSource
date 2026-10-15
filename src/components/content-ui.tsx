import Link from "next/link";
import { ArrowLeft, ArrowRight, Orbit, Sparkles } from "lucide-react";

export function EmptyState({
  title,
  description,
  actionHref,
  actionLabel,
  compact = false,
}: {
  title: string;
  description: string;
  actionHref: string;
  actionLabel: string;
  compact?: boolean;
}) {
  return (
    <div
      className={`aurora grid-field relative overflow-hidden rounded-[1.75rem] border border-dashed border-[#658da2]/65 text-center ${compact ? "p-9" : "px-6 py-16 sm:py-20"}`}
    >
      <span
        aria-hidden="true"
        className="relative mx-auto grid h-16 w-16 place-items-center rounded-[1.2rem] border border-forest/40 bg-forest/10 text-forest shadow-[0_0_40px_#6ae9dc34]"
      >
        <Orbit size={29} strokeWidth={1.5} />
      </span>
      <p
        className="relative mt-6 text-[10px] font-bold tracking-[.2em] text-rust"
        dir="ltr"
      >
        A NEW SPACE TO BEGIN
      </p>
      <h3 className="relative mt-3 text-[clamp(1.3rem,3vw,1.8rem)] font-black text-ink">
        {title}
      </h3>
      <p className="relative mx-auto mt-3 max-w-md text-sm leading-8 text-muted">
        {description}
      </p>
      <Link href={actionHref} className="button-dark relative mt-7">
        {actionLabel} <ArrowLeft size={16} />
      </Link>
      <Sparkles
        aria-hidden="true"
        size={18}
        className="absolute bottom-9 left-10 text-rust/55"
      />
    </div>
  );
}

export function Pagination({
  page,
  pages,
  href,
}: {
  page: number;
  pages: number;
  href: (page: number) => string;
}) {
  if (pages <= 1) return null;
  return (
    <nav
      aria-label="صفحه‌بندی مطالب"
      className="mt-12 flex items-center justify-between gap-4 border-t border-line pt-7 text-sm"
    >
      {page > 1 ? (
        <Link className="button-outline" href={href(page - 1)}>
          <ArrowRight size={16} /> صفحهٔ قبل
        </Link>
      ) : (
        <span />
      )}
      <span className="rounded-full border border-line bg-surface px-3 py-2 text-xs font-bold text-muted">
        {page.toLocaleString("fa-IR")} / {pages.toLocaleString("fa-IR")}
      </span>
      {page < pages ? (
        <Link className="button-outline" href={href(page + 1)}>
          صفحهٔ بعد <ArrowLeft size={16} />
        </Link>
      ) : (
        <span />
      )}
    </nav>
  );
}
