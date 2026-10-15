import Link from "next/link";
import { ArrowUpLeft, BookOpen, Sparkles } from "lucide-react";
import { AdminNavigation } from "@/components/admin-navigation";
import { LogoutButton } from "@/components/logout-button";
import { requireAdmin } from "@/lib/security";

export default async function AdminLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  const session = await requireAdmin();
  return (
    <div className="grid-field min-h-screen bg-paper lg:grid lg:grid-cols-[270px_minmax(0,1fr)]">
      <aside className="sticky top-0 hidden h-screen flex-col overflow-hidden border-l border-line bg-[#0d1625] px-4 py-7 lg:flex">
        <Link
          href="/admin"
          className="mx-3 flex items-center gap-3"
          aria-label="میز نویسندهٔ حاشیه"
        >
          <span className="grid h-11 w-11 place-items-center rounded-[14px] bg-gradient-to-br from-[#86f4de] to-[#b4a0ff] text-2xl font-black text-[#081422] shadow-[0_0_22px_#72ecdf45]">
            ح
          </span>
          <div>
            <span className="block text-lg font-black text-ink">
              حاشیه<span className="text-forest">.</span>
            </span>
            <span
              className="text-[10px] font-semibold tracking-[.18em] text-muted"
              dir="ltr"
            >
              WRITER STUDIO
            </span>
          </div>
        </Link>
        <div className="mx-4 mt-13 mb-4 flex items-center gap-2 text-[10px] font-bold tracking-[.17em] text-rust">
          <span className="h-px w-5 bg-rust" /> محیط کار / STUDIO
        </div>
        <AdminNavigation />
        <div className="mt-auto px-3">
          <div className="aurora relative overflow-hidden rounded-2xl border border-line p-5">
            <Sparkles size={20} className="relative text-rust" />
            <p className="relative mt-4 text-sm font-extrabold leading-7 text-ink">
              یک ایدهٔ خوب داری؟
            </p>
            <p className="relative mt-2 text-xs leading-6 text-muted">
              همین حالا آن را به یادداشت بعدی تبدیل کن.
            </p>
            <Link
              href="/admin/posts/new"
              className="relative mt-4 inline-flex items-center gap-1.5 text-xs font-bold text-forest hover:text-white"
            >
              شروع نوشتن <ArrowUpLeft size={15} />
            </Link>
          </div>
          <Link
            href="/"
            target="_blank"
            rel="noopener noreferrer"
            className="mt-6 flex items-center gap-2 px-2 text-xs font-semibold text-muted hover:text-forest"
          >
            <BookOpen size={16} /> دیدن وب‌سایت <ArrowUpLeft size={14} />
          </Link>
        </div>
      </aside>
      <div className="min-w-0">
        <a
          href="#studio-content"
          className="sr-only focus:not-sr-only focus:fixed focus:top-2 focus:right-2 focus:z-[100] focus:rounded-xl focus:bg-surface focus:p-3"
        >
          پرش به محتوای پنل
        </a>
        <header className="border-b border-line bg-[#0d1726]/93 backdrop-blur-xl">
          <div className="mx-auto flex h-[82px] max-w-[1320px] items-center justify-between gap-4 px-5 sm:px-8 lg:px-10">
            <Link
              href="/admin"
              className="flex items-center gap-2 font-black text-ink lg:hidden"
            >
              <span className="grid h-9 w-9 place-items-center rounded-xl bg-gradient-to-br from-forest to-rust text-lg text-[#081422]">
                ح
              </span>{" "}
              میز نویسنده
            </Link>
            <div className="hidden lg:block">
              <p
                className="text-[11px] font-bold tracking-[.12em] text-forest"
                dir="ltr"
              >
                EDITORIAL DESK / 2026
              </p>
              <p className="mt-1 text-sm font-bold text-ink">
                ایدهٔ بعدی همین‌جا شروع می‌شود.
              </p>
            </div>
            <div className="flex items-center gap-3">
              <span className="hidden text-left sm:block">
                <strong className="block text-xs text-ink">
                  {session.user.name}
                </strong>
                <small className="text-[10px] text-muted">مدیر محتوا</small>
              </span>
              <span
                className="grid h-9 w-9 place-items-center rounded-xl border border-forest/40 bg-forest/10 text-sm font-extrabold text-forest"
                aria-hidden
              >
                {session.user.name.charAt(0)}
              </span>
              <LogoutButton compact />
            </div>
          </div>
          <AdminNavigation mobile />
        </header>
        <main
          id="studio-content"
          className="mx-auto min-h-[calc(100vh-82px)] max-w-[1320px] px-5 py-9 sm:px-8 sm:py-10 lg:px-10 lg:py-12"
        >
          {children}
        </main>
      </div>
    </div>
  );
}
