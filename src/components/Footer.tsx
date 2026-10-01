import Link from "next/link";
import { Rss, Keyboard } from "lucide-react";
import { NewsletterForm } from "@/components/NewsletterForm";
import { YoutubeIcon } from "@/components/icons";

export function Footer() {
  return (
    <footer className="relative z-10 border-t border-line/70 bg-ink-2/60">
      <div className="mx-auto grid max-w-6xl gap-10 px-5 py-14 md:grid-cols-[1.4fr_1fr_1.2fr]">
        <div>
          <div className="flex items-center gap-2.5">
            <span className="grid size-9 place-items-center rounded-xl bg-gradient-to-br from-ember to-ember-2 text-lg font-black text-ink">
              س
            </span>
            <span className="font-mono text-sm font-bold text-paper">
              sani<span className="text-ember">.</span>dev
            </span>
          </div>
          <p className="mt-4 max-w-sm text-sm leading-7 text-mute">
            وبلاگ شخصی سانی — سازنده‌ی کانال یوتیوب
            <span className="font-mono text-ember-2" dir="ltr"> @sanidev-web</span>.
            این‌جا عمیق‌تر از ویدیوها درباره‌ی وب صحبت می‌کنم؛ دور از کلیشه‌ی CRUD.
          </p>
          <div className="mt-5 flex items-center gap-2">
            <a
              href="https://youtube.com/@sanidev-web"
              target="_blank"
              rel="noopener noreferrer"
              className="flex items-center gap-2 rounded-xl border border-line bg-ink-3 px-3.5 py-2 text-xs font-semibold text-mute transition-colors hover:border-ember/50 hover:text-ember"
            >
              <YoutubeIcon className="size-4" />
              کانال یوتیوب
            </a>
            <a
              href="/feed.xml"
              className="flex items-center gap-2 rounded-xl border border-line bg-ink-3 px-3.5 py-2 text-xs font-semibold text-mute transition-colors hover:border-ember/50 hover:text-ember"
            >
              <Rss className="size-4" />
              فید RSS
            </a>
          </div>
        </div>

        <div>
          <h3 className="font-mono text-xs font-bold tracking-widest text-faint">دسترسی سریع</h3>
          <ul className="mt-4 space-y-2.5 text-sm">
            {[
              { href: "/posts", label: "همه‌ی نوشته‌ها" },
              { href: "/graph", label: "گراف دانش" },
              { href: "/stack", label: "رادار تکنولوژی" },
              { href: "/about", label: "درباره‌ی من" },
            ].map((l) => (
              <li key={l.href}>
                <Link href={l.href} className="text-mute transition-colors hover:text-paper">
                  {l.label}
                </Link>
              </li>
            ))}
            <li className="flex items-center gap-1.5 pt-1 text-xs text-faint">
              <Keyboard className="size-3.5" />
              جستجو با
              <kbd className="rounded-md border border-line bg-ink px-1.5 py-0.5 font-mono text-[10px]">Ctrl</kbd>
              <kbd className="rounded-md border border-line bg-ink px-1.5 py-0.5 font-mono text-[10px]">K</kbd>
            </li>
          </ul>
        </div>

        <div>
          <h3 className="font-mono text-xs font-bold tracking-widest text-faint">خبرنامه‌ی دوهفته‌ی‌یک‌بار</h3>
          <p className="mt-4 text-sm leading-7 text-mute">
            خلاصه‌ی چیزهایی که ساختم و یاد گرفتم. بدون اسپم، با لینک‌خوانی خوب.
          </p>
          <div className="mt-4">
            <NewsletterForm />
          </div>
        </div>
      </div>
      <div className="border-t border-line-soft">
        <div className="mx-auto flex max-w-6xl flex-wrap items-center justify-between gap-3 px-5 py-5 font-mono text-[11px] text-faint">
          <span dir="ltr">Next.js 16 · MongoDB · Tailwind 4 · Motion</span>
          <span>ساخته شده با کنجکاوی — ۱۴۰۴</span>
        </div>
      </div>
    </footer>
  );
}
