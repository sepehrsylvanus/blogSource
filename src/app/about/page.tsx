import Link from "next/link";
import type { Metadata } from "next";
import { ArrowLeft, BellRing, Code2, Compass } from "lucide-react";
import { Reveal } from "@/components/Reveal";
import { YoutubeIcon } from "@/components/icons";
import { getStats } from "@/lib/data";
import { num } from "@/lib/markdown";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "درباره",
  description: "سانی کیست؟ سازنده‌ی کانال یوتیوب sanidev-web و این وبلاگ.",
};

export default async function AboutPage() {
  const stats = await getStats();

  return (
    <div className="mx-auto max-w-3xl px-5 py-16">
      <Reveal>
        <p className="font-mono text-xs tracking-[0.25em] text-faint" dir="ltr">/about — WHOAMI</p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">سلام؛ سانی‌ام.</h1>
      </Reveal>

      <Reveal delay={0.1}>
        <div className="article mt-10">
          <p>
            چند سالی است که وب را هم برای خودم می‌سازم و هم برای دوربین. کانال یوتیوب
            <span className="font-mono text-ember-2" dir="ltr"> @sanidev-web </span>
            جایی است که هر هفته با هم چیزی می‌سازیم — از صفر تا دیپلوی.
          </p>
          <p>
            این وبلاگ را ساختم چون بعضی مفاهیم در قالب ویدیو جا نمی‌شوند؛ متن مکث دارد،
            لینک دارد و مثل کد، قابل مرور است. قانون این‌جا ساده است:
            <b> هیچ آموزش CRUD کلیشه‌ای‌ای منتشر نمی‌شود.</b>
          </p>

          <h2>این سایت خودش یک نمونه‌کار است</h2>
          <p>
            همین صفحه‌ای که می‌خوانی یک اپلیکیشن Next.js 16 است که با MongoDB کار می‌کند — نه PostgreSQL،
            نه فایل استاتیک. چیزهایی که زیر کاپوت آن می‌بینی:
          </p>
          <ul>
            <li><b>گراف دانش</b> با فیزیک فورس‌سیمولیشن دست‌نویس روی Canvas</li>
            <li><b>رادار تکنولوژی</b> با aggregation زنده از کالکشن پروژه‌ها</li>
            <li>جستجوی <b dir="ltr">⌘K</b> با regex ایندکس‌دار MongoDB</li>
            <li>رندر مارک‌داون سمت سرور با هایلایت سینتکس — بدون یک بایت JS به کلاینت</li>
            <li>شمارنده‌ی بازدید ثرمی و دکمه‌ی تشویق با Server Actions</li>
            <li>فید RSS و سایت‌مپ خودکار</li>
          </ul>

          <h2>فلسفه‌ی محتوا</h2>
          <blockquote>
            پروژه‌ی تمرینی بساز که خودت دوست داشته باشی استفاده‌اش کنی؛
            بقیه — رزومه، بازار کار، همه‌چیز — خودشان می‌آیند.
          </blockquote>
          <p>
            اگر تازه وارد دنیای وب شده‌ای، از
            <Link href="/posts/beyond-crud"> چرا CRUD کافی نیست </Link>
            شروع کن و بعد سراغ
            <Link href="/graph"> گراف دانش </Link>
            برو تا مسیرت را خودت انتخاب کنی.
          </p>
        </div>
      </Reveal>

      <Reveal delay={0.15}>
        <dl className="mt-14 grid grid-cols-3 gap-px overflow-hidden rounded-2xl border border-line bg-line-soft">
          {[
            { label: "نوشته", value: stats.posts, icon: Code2 },
            { label: "بازدید", value: stats.views, icon: Compass },
            { label: "تشویق", value: stats.claps, icon: BellRing },
          ].map((s) => (
            <div key={s.label} className="bg-ink-2 p-5 text-center">
              <s.icon className="mx-auto size-4 text-ember" />
              <dd className="mt-2 font-mono text-2xl font-bold text-paper" dir="ltr">{num(s.value)}+</dd>
              <dt className="mt-1 text-xs text-faint">{s.label}</dt>
            </div>
          ))}
        </dl>
      </Reveal>

      <Reveal delay={0.2}>
        <div className="mt-10 flex flex-wrap gap-3">
          <a
            href="https://youtube.com/@sanidev-web"
            target="_blank"
            rel="noopener noreferrer"
            className="group flex items-center gap-2.5 rounded-2xl bg-ember px-6 py-3.5 font-bold text-ink transition-all hover:bg-ember-2"
          >
            <YoutubeIcon className="size-5" />
            سابسکرایب در یوتیوب
          </a>
          <Link
            href="/posts"
            className="flex items-center gap-2 rounded-2xl border border-line bg-ink-3 px-6 py-3.5 font-bold text-paper transition-colors hover:border-ember/50 hover:text-ember"
          >
            برو سراغ نوشته‌ها
            <ArrowLeft className="size-4" />
          </Link>
        </div>
      </Reveal>
    </div>
  );
}
