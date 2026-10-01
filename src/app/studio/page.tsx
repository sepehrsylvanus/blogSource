import Link from "next/link";
import type { Metadata } from "next";
import {
  CircleCheck,
  Clock3,
  Eye,
  FileText,
  Heart,
  PenLine,
  Pencil,
  Sparkles,
} from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getAuthorStats, getPostsByAuthor } from "@/lib/data";
import { formatDateFa, num } from "@/lib/markdown";
import { DeletePostButton } from "@/components/DeletePostButton";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "آتلیه" };

export default async function StudioPage({
  searchParams,
}: {
  searchParams: Promise<{ welcome?: string; saved?: string; deleted?: string }>;
}) {
  const user = await requireUser("/studio");
  const params = await searchParams;
  const [stats, posts] = await Promise.all([
    getAuthorStats(user.id),
    getPostsByAuthor(user.id, true),
  ]);

  const notice = params.welcome
    ? { text: `خوش آمدی ${user.name}! آتلیه‌ات آماده است — اولین نوشته‌ات را بنویس.`, tone: "mint" }
    : params.saved
      ? { text: "پیش‌نویس ذخیره شد.", tone: "mint" }
      : params.deleted
        ? { text: "نوشته حذف شد.", tone: "ember" }
        : null;

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="flex flex-wrap items-end justify-between gap-4">
        <div>
          <p className="font-mono text-xs tracking-[0.25em] text-faint" dir="ltr">
            STUDIO ~ @{user.username}
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">آتلیه‌ی {user.name}</h1>
        </div>
        <div className="flex items-center gap-2">
          <Link
            href={`/authors/${user.username}`}
            className="flex items-center gap-2 rounded-2xl border border-line bg-ink-3 px-5 py-3 text-sm font-semibold text-mute transition-colors hover:border-ember/50 hover:text-paper"
          >
            صفحه‌ی عمومی من
          </Link>
          <Link
            href="/write"
            className="flex items-center gap-2 rounded-2xl bg-ember px-5 py-3 font-bold text-ink transition-colors hover:bg-ember-2"
          >
            <PenLine className="size-4" />
            نوشته‌ی جدید
          </Link>
        </div>
      </div>

      {notice && (
        <p
          className={`mt-6 flex items-center gap-2 rounded-2xl border px-4 py-3 text-sm ${
            notice.tone === "mint"
              ? "border-mint/30 bg-mint/10 text-mint"
              : "border-ember/30 bg-ember/10 text-ember"
          }`}
        >
          {params.welcome ? <Sparkles className="size-4" /> : <CircleCheck className="size-4" />}
          {notice.text}
        </p>
      )}

      {/* stats */}
      <dl className="mt-8 grid grid-cols-2 gap-px overflow-hidden rounded-2xl border border-line bg-line-soft sm:grid-cols-4">
        {[
          { label: "منتشرشده", value: stats.posts, icon: FileText },
          { label: "پیش‌نویس", value: stats.drafts, icon: Clock3 },
          { label: "بازدید نوشته‌هایم", value: stats.views, icon: Eye },
          { label: "تشویقی که گرفتم", value: stats.claps, icon: Heart },
        ].map((s) => (
          <div key={s.label} className="bg-ink-2 p-5">
            <dt className="flex items-center gap-1.5 text-xs text-faint">
              <s.icon className="size-3.5" />
              {s.label}
            </dt>
            <dd className="mt-2 font-mono text-2xl font-bold text-paper" dir="ltr">
              {num(s.value)}
            </dd>
          </div>
        ))}
      </dl>

      {/* posts list */}
      <h2 className="mt-12 mb-6 text-xl font-black">نوشته‌های من</h2>
      {posts.length === 0 ? (
        <div className="grid place-items-center gap-4 rounded-3xl border border-dashed border-line py-20 text-center">
          <PenLine className="size-10 text-faint" />
          <p className="max-w-xs text-sm leading-7 text-mute">
            هنوز چیزی ننوشتی. اولین نوشته هم بزرگ‌ترین قدم است —
            <Link href="/posts/beyond-crud" className="text-ember-2"> این یکی </Link>
            را بخوان اگر دنبال ایده‌ای.
          </p>
          <Link href="/write" className="rounded-xl bg-ember px-5 py-2.5 text-sm font-bold text-ink hover:bg-ember-2">
            شروع نوشتن
          </Link>
        </div>
      ) : (
        <div className="overflow-hidden rounded-2xl border border-line">
          {posts.map((post) => (
            <div
              key={post.slug}
              className="flex flex-wrap items-center gap-4 border-b border-line-soft bg-ink-2 px-5 py-4 transition-colors last:border-b-0 hover:bg-ink-3"
            >
              <span
                className={`rounded-full px-2.5 py-1 font-mono text-[10px] font-bold ${
                  post.status === "published"
                    ? "bg-mint/10 text-mint"
                    : "bg-ember-2/10 text-ember-2"
                }`}
              >
                {post.status === "published" ? "منتشر شده" : "پیش‌نویس"}
              </span>
              <div className="min-w-0 flex-1">
                <p className="truncate text-sm font-bold text-paper">{post.title}</p>
                <p className="mt-0.5 flex flex-wrap items-center gap-3 text-[11px] text-faint">
                  <span>{formatDateFa(post.publishedAt)}</span>
                  <span className="flex items-center gap-1"><Eye className="size-3" />{num(post.views)}</span>
                  <span className="flex items-center gap-1"><Heart className="size-3" />{num(post.claps)}</span>
                </p>
              </div>
              <div className="flex items-center gap-2">
                {post.status === "published" && (
                  <Link
                    href={`/posts/${post.slug}`}
                    className="rounded-lg border border-line px-3 py-1.5 text-xs text-faint transition-colors hover:text-paper"
                  >
                    مشاهده
                  </Link>
                )}
                <Link
                  href={`/write/${post.slug}`}
                  className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-faint transition-colors hover:border-ember/60 hover:text-ember"
                >
                  <Pencil className="size-3.5" />
                  ویرایش
                </Link>
                <DeletePostButton slug={post.slug} title={post.title} />
              </div>
            </div>
          ))}
        </div>
      )}
    </div>
  );
}
