"use client";

import Link from "next/link";
import { usePathname } from "next/navigation";
import { FolderKanban, LayoutDashboard, PenLine, Tags } from "lucide-react";

const links = [
  { href: "/admin", label: "نمای کلی", icon: LayoutDashboard, exact: true },
  { href: "/admin/posts", label: "نوشته‌ها", icon: FolderKanban, exact: false },
  { href: "/admin/posts/new", label: "مطلب تازه", icon: PenLine, exact: true },
  { href: "/admin/taxonomy", label: "دسته و برچسب", icon: Tags, exact: true },
];

export function AdminNavigation({ mobile = false }: { mobile?: boolean }) {
  const pathname = usePathname();
  return (
    <nav
      aria-label="مسیرهای میز نویسنده"
      className={
        mobile
          ? "grid grid-cols-4 gap-1 border-t border-line/70 px-2 py-2 sm:px-6 lg:hidden"
          : "hidden flex-col gap-2 lg:flex"
      }
    >
      {links.map(({ href, label, icon: Icon, exact }) => {
        const active = exact
          ? pathname === href
          : pathname === href ||
            (pathname.startsWith(href + "/") &&
              pathname !== "/admin/posts/new");
        return (
          <Link
            key={href}
            href={href}
            aria-current={active ? "page" : undefined}
            className={
              mobile
                ? `flex min-w-0 flex-col items-center justify-center gap-1.5 rounded-xl px-1 py-2.5 text-center text-[10px] font-bold ${active ? "border border-forest/35 bg-forest/12 text-forest" : "text-muted hover:text-ink"}`
                : `flex items-center gap-3 rounded-xl border px-4 py-3.5 text-[13px] font-semibold transition ${active ? "border-forest/40 bg-gradient-to-l from-forest/16 to-[#6551bc]/12 text-forest shadow-[inset_0_0_22px_#68eadd12]" : "border-transparent text-muted hover:border-line hover:bg-white/5 hover:text-ink"}`
            }
          >
            <Icon size={mobile ? 16 : 18} strokeWidth={1.8} />
            {label}
          </Link>
        );
      })}
    </nav>
  );
}
