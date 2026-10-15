import Link from "next/link";
import { connection } from "next/server";
import {
  ArrowLeft,
  ArrowUpLeft,
  BookOpenText,
  FilePenLine,
  Files,
  PenLine,
  Plus,
  Sparkles,
  TrendingUp,
} from "lucide-react";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";

export default async function AdminHome() {
  await connection();
  const [all, published, drafts, latest] = await Promise.all([
    prisma.post.count(),
    prisma.post.count({ where: { status: "published" } }),
    prisma.post.count({ where: { status: "draft" } }),
    prisma.post.findMany({
      orderBy: { updatedAt: "desc" },
      take: 5,
      select: { id: true, title: true, status: true, updatedAt: true },
    }),
  ]);
  const stats = [
    {
      label: "کل یادداشت‌ها",
      count: all,
      icon: Files,
      tint: "#83f4df",
      bar: "w-[78%]",
    },
    {
      label: "منتشرشده",
      count: published,
      icon: BookOpenText,
      tint: "#9eb3ff",
      bar: "w-[52%]",
    },
    {
      label: "پیش‌نویس",
      count: drafts,
      icon: FilePenLine,
      tint: "#d0abff",
      bar: "w-[34%]",
    },
  ];
  return (
    <div className="space-y-8">
      <div className="aurora grid-field relative overflow-hidden rounded-[1.9rem] border border-[#53698c] px-8 py-10 sm:px-11 sm:py-12">
        <div
          aria-hidden
          className="absolute -left-8 -top-24 h-64 w-64 rounded-full border-[30px] border-white/5"
        />
        <div className="relative flex flex-col gap-7 sm:flex-row sm:items-center sm:justify-between">
          <div>
            <p className="eyebrow">
              <Sparkles size={15} /> TODAY / روزی برای شروع
            </p>
            <h1 className="mt-5 text-[clamp(2rem,3.5vw,3.2rem)] font-black leading-[1.5] text-ink">
              به <span className="gradient-type">میز ایده‌ها</span> خوش آمدی.
            </h1>
            <p className="mt-3 max-w-lg text-sm leading-8 text-muted">
              نوشته‌ها، داستان‌ها و ایده‌های بعدیِ تو همه از همین‌جا جان
              می‌گیرند.
            </p>
          </div>
          <Link
            href="/admin/posts/new"
            className="button-dark relative shrink-0"
          >
            <Plus size={18} /> نوشتن مطلب تازه
          </Link>
        </div>
      </div>
      <div className="grid gap-4 sm:grid-cols-3">
        {stats.map(({ label, count, icon: Icon, tint, bar }) => (
          <section
            key={label}
            className="panel card-lift relative overflow-hidden p-6 sm:p-7"
          >
            <div
              aria-hidden
              className="absolute -left-10 -top-12 h-36 w-36 rounded-full opacity-15 blur-3xl"
              style={{ background: tint }}
            />
            <div className="relative flex items-start justify-between">
              <span
                className="grid h-11 w-11 place-items-center rounded-2xl border border-line bg-white/5"
                style={{ color: tint }}
              >
                <Icon size={21} strokeWidth={1.8} />
              </span>
              <TrendingUp size={18} className="text-muted" />
            </div>
            <p className="relative mt-9 text-[2.85rem] font-black leading-none tracking-tight text-ink">
              {count.toLocaleString("fa-IR")}
            </p>
            <p className="relative mt-3 text-xs font-bold text-muted">
              {label}
            </p>
            <div className="relative mt-7 h-1 overflow-hidden rounded-full bg-white/8">
              <div
                className={`h-full rounded-full ${bar}`}
                style={{ background: tint, boxShadow: `0 0 18px ${tint}` }}
              />
            </div>
          </section>
        ))}
      </div>
      <div className="grid gap-6 xl:grid-cols-[1.48fr_.78fr]">
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5 sm:px-8">
            <div>
              <span className="eyebrow">EDITORIAL ACTIVITY</span>
              <h2 className="mt-2 text-lg font-black text-ink">
                آخرین فعالیت‌ها
              </h2>
            </div>
            <Link
              href="/admin/posts"
              className="inline-flex items-center gap-1 text-xs font-bold text-forest hover:text-white"
            >
              همهٔ نوشته‌ها <ArrowLeft size={15} />
            </Link>
          </div>
          {latest.length ? (
            <ul className="divide-y divide-line/70">
              {latest.map((post) => (
                <li
                  key={post.id}
                  className="flex flex-wrap items-center justify-between gap-4 px-6 py-4 transition hover:bg-forest/5 sm:px-8"
                >
                  <div className="min-w-0">
                    <Link
                      href={`/admin/posts/${post.id}/edit`}
                      className="block truncate text-[13px] font-extrabold text-ink hover:text-forest"
                    >
                      {post.title}
                    </Link>
                    <p className="mt-1 text-[11px] text-muted">
                      ویرایش: {post.updatedAt.toLocaleDateString("fa-IR")}
                    </p>
                  </div>
                  <StatusBadge status={post.status} />
                </li>
              ))}
            </ul>
          ) : (
            <div className="px-8 py-12 text-center">
              <PenLine size={26} className="mx-auto text-rust" />
              <p className="mt-3 text-sm font-bold text-ink">
                هنوز نوشته‌ای نداری.
              </p>
              <Link
                href="/admin/posts/new"
                className="mt-3 inline-flex items-center gap-1 text-xs font-bold text-forest"
              >
                اولین یادداشت را بساز <ArrowUpLeft size={15} />
              </Link>
            </div>
          )}
        </section>
        <aside className="aurora grid-field flex flex-col rounded-[1.45rem] border border-line p-8">
          <span className="eyebrow">A NOTE FOR YOU</span>
          <h2 className="mt-8 text-[1.5rem] font-black leading-[1.7] text-ink">
            هر نوشته از <span className="gradient-type">یک خط ساده</span> شروع
            می‌شود.
          </h2>
          <p className="mt-4 text-sm leading-8 text-muted">
            اول موضوع را انتخاب کن، بعد ایده را به شکل یک پیش‌نویس ثبت کن. وقتی
            آماده بودی، آن را منتشر کن.
          </p>
          <div className="mt-auto border-t border-line pt-6">
            <Link
              href="/admin/taxonomy"
              className="flex items-center justify-between text-xs font-bold text-forest hover:text-white"
            >
              مدیریت دسته‌ها و برچسب‌ها <ArrowUpLeft size={16} />
            </Link>
          </div>
        </aside>
      </div>
    </div>
  );
}
