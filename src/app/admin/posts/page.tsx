import Image from "next/image";
import Link from "next/link";
import { connection } from "next/server";
import {
  Archive,
  CheckCircle2,
  Eye,
  PenLine,
  Plus,
  Search,
} from "lucide-react";
import type { Prisma } from "@/generated/prisma/client";
import { archivePost } from "@/app/admin/actions";
import { CoverArt } from "@/components/cover-art";
import { EmptyState, Pagination } from "@/components/content-ui";
import { StatusBadge } from "@/components/status-badge";
import { prisma } from "@/lib/prisma";
import { safePage } from "@/lib/validation";

const tabs = [
  { value: "all", label: "همه" },
  { value: "published", label: "منتشرشده" },
  { value: "draft", label: "پیش‌نویس" },
  { value: "archived", label: "بایگانی" },
] as const;

export default async function AdminPosts({
  searchParams,
}: {
  searchParams: Promise<{ status?: string; q?: string; page?: string }>;
}) {
  await connection();
  const params = await searchParams;
  const status = tabs.some((tab) => tab.value === params.status)
    ? params.status!
    : "all";
  const q = String(params.q || "")
    .trim()
    .slice(0, 80);
  const page = safePage(params.page);
  const keyword = q.replace(/[\\%_]/g, "\\$&");
  const where: Prisma.PostWhereInput = {
    ...(status !== "all"
      ? { status: status as "draft" | "published" | "archived" }
      : {}),
    ...(keyword
      ? {
          OR: [
            { title: { contains: keyword, mode: "insensitive" } },
            { slug: { contains: keyword, mode: "insensitive" } },
          ],
        }
      : {}),
  };
  const [items, total] = await Promise.all([
    prisma.post.findMany({
      where,
      orderBy: { updatedAt: "desc" },
      take: 12,
      skip: (page - 1) * 12,
      select: {
        id: true,
        title: true,
        slug: true,
        status: true,
        updatedAt: true,
        coverPath: true,
        category: { select: { name: true } },
      },
    }),
    prisma.post.count({ where }),
  ]);
  const pages = Math.max(1, Math.ceil(total / 12));
  const tabHref = (value: string) =>
    `/admin/posts?status=${value}${q ? `&q=${encodeURIComponent(q)}` : ""}`;
  const pageHref = (next: number) =>
    `/admin/posts?${new URLSearchParams({ status, ...(q ? { q } : {}), page: String(next) })}`;

  return (
    <div>
      <div className="flex flex-wrap items-end justify-between gap-5">
        <div>
          <span className="eyebrow">CONTENT LIBRARY / کتابخانهٔ محتوا</span>
          <h1 className="mt-4 text-[clamp(2.2rem,3.7vw,3.7rem)] font-black tracking-tight text-ink">
            همهٔ <span className="gradient-type">نوشته‌ها.</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            از اولین پیش‌نویس تا آخرین یادداشت منتشرشده.
          </p>
        </div>
        <Link href="/admin/posts/new" className="button-dark">
          <Plus size={17} /> مطلب تازه
        </Link>
      </div>
      {params.status === "saved" && (
        <p
          role="status"
          className="mt-6 flex items-center gap-2 rounded-xl border border-[#4d8d85] bg-[#154039] px-4 py-3 text-xs font-bold text-[#b1fbe7]"
        >
          <CheckCircle2 size={17} /> یادداشت با موفقیت ذخیره شد.
        </p>
      )}
      <section className="panel mt-9 overflow-hidden">
        <div className="flex flex-col gap-5 border-b border-line p-5 sm:p-6 lg:flex-row lg:items-center lg:justify-between">
          <nav
            aria-label="فیلتر وضعیت نوشته‌ها"
            className="flex gap-1 overflow-x-auto rounded-xl border border-line bg-[#0b1525] p-1"
          >
            {tabs.map((tab) => (
              <Link
                key={tab.value}
                href={tabHref(tab.value)}
                aria-current={status === tab.value ? "page" : undefined}
                className={`shrink-0 rounded-lg px-3.5 py-2.5 text-xs font-bold transition ${status === tab.value ? "bg-forest text-[#061722]" : "text-muted hover:bg-white/5 hover:text-ink"}`}
              >
                {tab.label}
              </Link>
            ))}
          </nav>
          <form role="search" action="/admin/posts" className="flex gap-2">
            <input type="hidden" name="status" value={status} />
            <label htmlFor="admin-search" className="sr-only">
              جست‌وجو در نوشته‌ها
            </label>
            <div className="relative flex-1">
              <Search
                size={16}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-forest"
              />
              <input
                id="admin-search"
                name="q"
                defaultValue={q}
                maxLength={80}
                placeholder="عنوان یا اسلاگ..."
                className="field h-10 min-w-0 pr-9 text-xs"
              />
            </div>
            <button type="submit" className="button-outline !px-4 !py-2">
              جست‌وجو
            </button>
          </form>
        </div>
        <div className="flex items-center justify-between border-b border-line bg-[#0d1726] px-6 py-3 text-[11px] font-bold text-muted">
          <span>{total.toLocaleString("fa-IR")} یادداشت</span>
          <span>مرتب‌شده بر اساس آخرین ویرایش</span>
        </div>
        {items.length ? (
          <ul className="divide-y divide-line/70">
            {items.map((post) => (
              <li
                key={post.id}
                className="flex flex-wrap items-center gap-4 px-5 py-4 transition hover:bg-forest/5 sm:flex-nowrap sm:px-6"
              >
                <Link
                  href={`/admin/posts/${post.id}/edit`}
                  className="block shrink-0"
                  aria-label={`ویرایش ${post.title}`}
                >
                  <div className="relative h-16 w-[78px] overflow-hidden rounded-xl border border-line">
                    {post.coverPath ? (
                      <Image
                        src={post.coverPath}
                        alt=""
                        fill
                        sizes="80px"
                        className="object-cover"
                      />
                    ) : (
                      <CoverArt
                        slug={post.slug}
                        className="h-full w-full [&_.cover-art__mark]:text-2xl"
                      />
                    )}
                  </div>
                </Link>
                <div className="min-w-[160px] flex-1">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    className="line-clamp-1 text-[13px] font-extrabold text-ink hover:text-forest"
                  >
                    {post.title}
                  </Link>
                  <p className="mt-1 text-[11px] text-muted">
                    {post.category?.name || "بدون دسته"} ·{" "}
                    {post.updatedAt.toLocaleDateString("fa-IR")}
                  </p>
                </div>
                <StatusBadge status={post.status} />
                <div className="mr-auto flex items-center gap-1">
                  <Link
                    href={`/admin/posts/${post.id}/edit`}
                    aria-label={`ویرایش ${post.title}`}
                    className="grid h-9 w-9 place-items-center rounded-lg text-forest transition hover:bg-forest/10"
                  >
                    <PenLine size={16} />
                  </Link>
                  <Link
                    href={`/admin/posts/${post.id}/preview`}
                    aria-label={`پیش‌نمایش ${post.title}`}
                    className="grid h-9 w-9 place-items-center rounded-lg text-forest transition hover:bg-forest/10"
                  >
                    <Eye size={17} />
                  </Link>
                  {post.status !== "archived" && (
                    <form action={archivePost}>
                      <input type="hidden" name="id" value={post.id} />
                      <button
                        type="submit"
                        title="بایگانی"
                        aria-label={`بایگانی ${post.title}`}
                        className="grid h-9 w-9 place-items-center rounded-lg text-rust transition hover:bg-rust/10"
                      >
                        <Archive size={16} />
                      </button>
                    </form>
                  )}
                </div>
              </li>
            ))}
          </ul>
        ) : (
          <div className="p-5">
            <EmptyState
              compact
              title="نوشته‌ای پیدا نشد"
              description="فیلتر یا واژهٔ جست‌وجو را تغییر بده، یا یک مطلب تازه بساز."
              actionHref="/admin/posts/new"
              actionLabel="نوشتن مطلب"
            />
          </div>
        )}
      </section>
      <Pagination page={page} pages={pages} href={pageHref} />
    </div>
  );
}
