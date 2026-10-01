import Link from "next/link";
import { LogIn, LogOut, PenLine } from "lucide-react";
import { getPosts } from "@/lib/data";
import { getCurrentUser } from "@/lib/auth";
import { logoutAction } from "@/app/actions";
import { CommandPalette } from "@/components/CommandPalette";
import { YoutubeIcon } from "@/components/icons";

const navItems = [
  { href: "/", label: "خانه" },
  { href: "/posts", label: "نوشته‌ها" },
  { href: "/graph", label: "گراف دانش" },
  { href: "/stack", label: "رادار تکنولوژی" },
  { href: "/about", label: "درباره" },
];

export async function Header() {
  const [latest, user] = await Promise.all([getPosts({ limit: 5 }), getCurrentUser()]);
  const palettePosts = latest.map((p) => ({ slug: p.slug, title: p.title, tags: p.tags }));

  return (
    <header className="sticky top-0 z-40 border-b border-line/70 bg-ink/75 backdrop-blur-xl">
      <div className="mx-auto flex h-16 max-w-6xl items-center justify-between gap-4 px-5">
        <Link href="/" className="group flex items-center gap-2.5" aria-label="خانه">
          <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-ember to-ember-2 text-lg font-black text-ink transition-transform duration-300 group-hover:rotate-[-8deg]">
            س
          </span>
          <span className="font-mono text-sm font-bold tracking-tight text-paper">
            sani<span className="text-ember">.</span>dev
          </span>
        </Link>

        <nav className="hidden items-center gap-1 md:flex" aria-label="ناوبری اصلی">
          {navItems.map((item) => (
            <Link
              key={item.href}
              href={item.href}
              className="rounded-lg px-3 py-2 text-sm text-mute transition-colors duration-200 hover:bg-ink-3 hover:text-paper"
            >
              {item.label}
            </Link>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <CommandPalette posts={palettePosts} />

          {user ? (
            <>
              <Link
                href="/write"
                className="flex items-center gap-2 rounded-xl bg-ember px-3.5 py-2 text-sm font-bold text-ink transition-colors hover:bg-ember-2"
              >
                <PenLine className="size-4" />
                <span className="hidden sm:inline">نوشتن</span>
              </Link>
              <Link
                href="/studio"
                className="flex items-center gap-2 rounded-xl border border-line bg-ink-3 py-1.5 pe-3 ps-1.5 transition-colors hover:border-ember/50"
                title={`آتلیه‌ی ${user.name}`}
              >
                <span className="grid size-7 place-items-center rounded-lg bg-gradient-to-br from-ember/80 to-ember-2/80 text-xs font-black text-ink">
                  {user.name.trim().charAt(0)}
                </span>
                <span className="hidden max-w-20 truncate text-xs font-semibold text-paper sm:inline">
                  {user.name}
                </span>
              </Link>
              <form action={logoutAction}>
                <button
                  type="submit"
                  className="grid size-9 place-items-center rounded-xl border border-line text-faint transition-colors hover:border-ember/50 hover:text-ember"
                  title="خروج"
                  aria-label="خروج از حساب"
                >
                  <LogOut className="size-4" />
                </button>
              </form>
            </>
          ) : (
            <Link
              href="/login"
              className="flex items-center gap-2 rounded-xl border border-line bg-ink-3 px-3.5 py-2 text-sm font-semibold text-paper transition-colors hover:border-ember/50 hover:text-ember"
            >
              <LogIn className="size-4" />
              <span className="hidden sm:inline">ورود / عضویت</span>
            </Link>
          )}

          <a
            href="https://youtube.com/@sanidev-web"
            target="_blank"
            rel="noopener noreferrer"
            className="hidden items-center gap-2 rounded-xl border border-ember/30 bg-ember/10 px-3 py-2 text-sm font-semibold text-ember transition-all duration-200 hover:border-ember hover:bg-ember hover:text-ink lg:flex"
            aria-label="کانال یوتیوب سانی"
          >
            <YoutubeIcon className="size-4" />
          </a>
        </div>
      </div>
    </header>
  );
}
