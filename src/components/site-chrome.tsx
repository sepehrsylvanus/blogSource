import Link from "next/link";
import {
  ArrowLeft,
  ArrowUpLeft,
  ArrowUpRight,
  BookOpenText,
  Orbit,
  Rss,
  Search,
  Sparkles,
} from "lucide-react";

function Wordmark() {
  return (
    <Link
      href="/"
      className="inline-flex shrink-0 items-center gap-3"
      aria-label="حاشیه، صفحهٔ اصلی"
    >
      <span className="relative grid h-11 w-11 place-items-center overflow-hidden rounded-[15px] border border-[#a0fff2]/60 bg-gradient-to-br from-[#78eeda] via-[#7ddaf5] to-[#a58cff] text-[25px] font-black text-[#081324] shadow-[0_0_28px_#72eadb52]">
        ح
        <span
          aria-hidden="true"
          className="absolute -bottom-2 -left-2 h-5 w-5 rounded-full bg-white/50 blur-md"
        />
      </span>
      <span className="flex flex-col leading-none">
        <span className="text-xl font-black tracking-tight text-ink">
          حاشیه<span className="text-forest">.</span>
        </span>
        <span
          className="mt-1.5 text-[9px] font-bold tracking-[.19em] text-muted"
          dir="ltr"
        >
          THE NEXT IDEAS JOURNAL
        </span>
      </span>
    </Link>
  );
}

export function SiteHeader() {
  return (
    <>
      <a
        href="#content"
        className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[100] focus:rounded-xl focus:bg-surface focus:p-3"
      >
        پرش به محتوای اصلی
      </a>
      <header className="sticky top-0 z-40 px-3 pt-3 backdrop-blur-sm sm:px-5">
        <div className="mx-auto max-w-[1350px] overflow-hidden rounded-[1.35rem] border border-[#40536c]/75 bg-[#0c1423]/90 shadow-[0_20px_60px_#020611a8] backdrop-blur-2xl">
          <div className="flex h-[70px] items-center justify-between gap-5 px-4 sm:px-7 lg:px-8">
            <Wordmark />
            <nav
              aria-label="مسیرهای اصلی"
              className="hidden items-center gap-8 text-[13px] font-semibold text-muted md:flex"
            >
              <Link href="/" className="transition hover:text-forest">
                خانه
              </Link>
              <Link href="/#latest" className="transition hover:text-forest">
                یادداشت‌ها
              </Link>
              <Link href="/about" className="transition hover:text-forest">
                داستان ما
              </Link>
            </nav>
            <div className="flex items-center gap-2 sm:gap-3">
              <span
                className="hidden items-center gap-2 text-[10px] font-bold tracking-widest text-muted xl:inline-flex"
                dir="ltr"
              >
                <span className="h-1.5 w-1.5 rounded-full bg-forest shadow-[0_0_12px_#83f4df]" />{" "}
                IDEAS IN MOTION
              </span>
              <Link
                href="/#explore"
                className="grid h-10 w-10 place-items-center rounded-full border border-line bg-white/5 text-ink transition hover:border-forest hover:text-forest"
                aria-label="جست‌وجو در مطالب"
              >
                <Search size={18} strokeWidth={1.8} />
              </Link>
              <Link
                href="/login"
                className="button-dark hidden !px-4 !py-2.5 !text-xs sm:inline-flex"
              >
                میز نویسنده <ArrowUpLeft size={16} />
              </Link>
            </div>
          </div>
          <nav
            aria-label="ناوبری تلفن همراه"
            className="flex items-center justify-between gap-4 overflow-x-auto border-t border-line/70 px-5 py-2.5 text-xs font-bold text-muted md:hidden"
          >
            <Link href="/" className="shrink-0 hover:text-forest">
              خانه
            </Link>
            <Link href="/#latest" className="shrink-0 hover:text-forest">
              یادداشت‌ها
            </Link>
            <Link href="/about" className="shrink-0 hover:text-forest">
              درباره
            </Link>
            <Link href="/login" className="shrink-0 text-forest sm:hidden">
              میز نویسنده
            </Link>
          </nav>
        </div>
      </header>
    </>
  );
}

export function SiteFooter() {
  return (
    <footer className="relative mt-24 overflow-hidden border-t border-line bg-[#0b1220]">
      <div
        aria-hidden
        className="absolute -left-24 top-12 h-96 w-96 rounded-full bg-[#4b4fb2]/20 blur-[90px]"
      />
      <div className="relative mx-auto max-w-7xl px-5 pb-9 pt-20 sm:px-8 lg:px-10">
        <div className="grid gap-12 border-b border-line pb-16 md:grid-cols-[1.6fr_.7fr_.7fr]">
          <div>
            <Wordmark />
            <h2 className="mt-8 max-w-xl text-[clamp(2rem,3.3vw,3.3rem)] font-black leading-[1.5] text-ink">
              ایده‌های فردا، <span className="gradient-type">از همین‌جا</span>{" "}
              شروع می‌شوند.
            </h2>
            <p className="mt-5 max-w-md text-sm leading-8 text-muted">
              یک مجله برای کسانی که فقط تماشا نمی‌کنند؛ می‌پرسند، می‌سازند و
              مسیر تازه‌ای باز می‌کنند.
            </p>
            <Link
              href="/#latest"
              className="mt-6 inline-flex items-center gap-2 text-sm font-bold text-forest hover:text-white"
            >
              برو سراغ یادداشت‌ها <ArrowLeft size={16} />
            </Link>
          </div>
          <div>
            <p className="mb-6 flex items-center gap-2 text-xs font-black tracking-widest text-forest">
              <Orbit size={16} /> مسیرها
            </p>
            <ul className="space-y-4 text-sm text-muted">
              <li>
                <Link className="hover:text-forest" href="/">
                  صفحهٔ اصلی
                </Link>
              </li>
              <li>
                <Link className="hover:text-forest" href="/about">
                  دربارهٔ حاشیه
                </Link>
              </li>
              <li>
                <Link className="hover:text-forest" href="/login">
                  میز نویسنده
                </Link>
              </li>
            </ul>
          </div>
          <div>
            <p className="mb-6 flex items-center gap-2 text-xs font-black tracking-widest text-rust">
              <Sparkles size={16} /> بیشتر بخوان
            </p>
            <ul className="space-y-4 text-sm text-muted">
              <li>
                <Link
                  className="inline-flex items-center gap-2 hover:text-forest"
                  href="/rss.xml"
                >
                  <Rss size={16} /> خوراک RSS
                </Link>
              </li>
              <li>
                <Link
                  className="inline-flex items-center gap-2 hover:text-forest"
                  href="/#explore"
                >
                  <BookOpenText size={16} /> موضوع‌ها
                </Link>
              </li>
            </ul>
          </div>
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 pt-7 text-[11px] text-muted">
          <p>
            © {new Date().getFullYear()} حاشیه. ساخته‌شده برای آینده‌های
            روشن‌تر.
          </p>
          <p className="inline-flex items-center gap-2" dir="ltr">
            THINK / MAKE / WRITE{" "}
            <ArrowUpRight size={13} className="text-forest" />
          </p>
        </div>
      </div>
    </footer>
  );
}
