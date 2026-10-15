"use client";

import { useActionState, useState } from "react";
import Image from "next/image";
import Link from "next/link";
import {
  ArrowUpLeft,
  Eye,
  ImagePlus,
  Link2,
  PenLine,
  Save,
  Sparkles,
  X,
} from "lucide-react";
import { savePost } from "@/app/admin/actions";
import { CoverArt } from "@/components/cover-art";
import { Markdown } from "@/components/markdown";

type Choice = { id: string; name: string; slug: string };
type EditorPost = {
  id: string;
  title: string;
  slug: string;
  excerpt: string;
  body: string;
  status: "draft" | "published" | "archived";
  categoryId: string | null;
  coverPath: string | null;
  seoTitle: string | null;
  seoDescription: string | null;
};

export function PostEditor({
  post,
  categories,
  tags,
  selectedTagIds = [],
}: {
  post?: EditorPost;
  categories: Choice[];
  tags: Choice[];
  selectedTagIds?: string[];
}) {
  const [state, action, pending] = useActionState(savePost, { error: "" });
  const [coverPath, setCoverPath] = useState(post?.coverPath || "");
  const [title, setTitle] = useState(post?.title || "");
  const [body, setBody] = useState(post?.body || "");
  const [view, setView] = useState<"write" | "preview">("write");
  const [uploading, setUploading] = useState(false);
  const [uploadError, setUploadError] = useState("");

  async function upload(file?: File) {
    if (!file) return;
    if (file.size > 5 * 1024 * 1024) {
      setUploadError("حجم عکس باید کمتر از ۵ مگابایت باشد.");
      return;
    }
    setUploading(true);
    setUploadError("");
    const payload = new FormData();
    payload.append("file", file);
    try {
      const res = await fetch("/api/media/upload", {
        method: "POST",
        body: payload,
      });
      if (!res.ok) throw new Error("upload failed");
      const result = (await res.json()) as { path: string };
      setCoverPath(result.path);
    } catch {
      setUploadError("آپلود ناموفق بود. دسترسی، فرمت و حجم تصویر را بررسی کن.");
    } finally {
      setUploading(false);
    }
  }

  return (
    <form
      action={action}
      className="grid items-start gap-6 xl:grid-cols-[minmax(0,1fr)_315px]"
    >
      <input type="hidden" name="id" value={post?.id || ""} />
      <input type="hidden" name="coverPath" value={coverPath} />
      <div className="min-w-0 space-y-6">
        <section className="panel relative overflow-hidden p-6 sm:p-8">
          <div className="mb-7 flex items-center justify-between border-b border-line pb-5">
            <div>
              <span className="eyebrow">01 / THE STORY</span>
              <h2 className="mt-2 text-xl font-black text-ink">داستانِ تو</h2>
            </div>
            <PenLine size={22} className="text-rust" />
          </div>
          <div className="space-y-6">
            <div>
              <label htmlFor="post-title" className="label">
                عنوان یادداشت <span className="text-rust">*</span>
              </label>
              <input
                id="post-title"
                name="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                required
                minLength={3}
                maxLength={180}
                placeholder="عنوانی که خواننده را کنجکاو کند..."
                className="field text-base font-semibold"
              />
              <p className="mt-2 text-[11px] text-muted">
                روشن، کوتاه و به‌یادماندنی بنویس.
              </p>
            </div>
            <div className="grid gap-5 sm:grid-cols-2">
              <div>
                <label htmlFor="post-slug" className="label">
                  نشانی انگلیسی (slug) <span className="text-rust">*</span>
                </label>
                <div className="relative">
                  <Link2
                    size={17}
                    className="absolute right-4 top-1/2 -translate-y-1/2 text-muted"
                  />
                  <input
                    id="post-slug"
                    name="slug"
                    defaultValue={post?.slug}
                    required
                    pattern="[a-z0-9]+(-[a-z0-9]+)*"
                    maxLength={180}
                    dir="ltr"
                    placeholder="a-good-story"
                    className="field pr-11 text-left"
                  />
                </div>
              </div>
              <div>
                <label htmlFor="post-excerpt" className="label">
                  خلاصه <span className="text-rust">*</span>
                </label>
                <textarea
                  id="post-excerpt"
                  name="excerpt"
                  defaultValue={post?.excerpt}
                  required
                  minLength={20}
                  maxLength={320}
                  rows={2}
                  placeholder="این یادداشت دربارهٔ چیست؟"
                  className="field leading-7"
                />
              </div>
            </div>
          </div>
        </section>
        <section className="panel overflow-hidden">
          <div className="flex flex-wrap items-center justify-between gap-3 border-b border-line px-6 py-5 sm:px-8">
            <div>
              <span className="eyebrow">02 / WORDS MATTER</span>
              <h2 className="mt-2 text-xl font-black text-ink">متن یادداشت</h2>
            </div>
            <div className="inline-flex rounded-xl bg-[#0a1626] p-1 text-xs font-bold">
              <button
                type="button"
                aria-pressed={view === "write"}
                onClick={() => setView("write")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${view === "write" ? "bg-[#264457] text-forest shadow-[0_0_18px_#61e8e826]" : "text-muted"}`}
              >
                <PenLine size={14} /> نوشتن
              </button>
              <button
                type="button"
                aria-pressed={view === "preview"}
                onClick={() => setView("preview")}
                className={`inline-flex items-center gap-1.5 rounded-lg px-3 py-2 transition ${view === "preview" ? "bg-[#264457] text-forest shadow-[0_0_18px_#61e8e826]" : "text-muted"}`}
              >
                <Eye size={14} /> پیش‌نمایش زنده
              </button>
            </div>
          </div>
          <div className="px-6 py-5 sm:px-8">
            <p className="mb-4 flex items-center gap-1.5 text-[11px] text-muted">
              <Sparkles size={14} className="text-rust" /> Markdown پشتیبانی
              می‌شود: تیتر، فهرست، لینک، نقل‌قول و کد.
            </p>
            <label htmlFor="post-body" className="sr-only">
              متن یادداشت با فرمت Markdown
            </label>
            <textarea
              id="post-body"
              name="body"
              value={body}
              onChange={(e) => setBody(e.target.value)}
              required
              minLength={30}
              maxLength={100000}
              rows={19}
              dir="auto"
              placeholder="# شروع یک داستان تازه&#10;&#10;اینجا بنویس..."
              className={`field min-h-[450px] font-mono text-sm leading-8 ${view === "preview" ? "sr-only" : "block"}`}
            />
            <div
              className={
                view === "preview"
                  ? "min-h-[450px] rounded-xl border border-line bg-[#0c1726] p-5 sm:p-7"
                  : "hidden"
              }
            >
              {body.trim() ? (
                <Markdown text={body} />
              ) : (
                <p className="text-sm text-muted">
                  هنوز متنی برای پیش‌نمایش نوشته نشده است.
                </p>
              )}
            </div>
            <div className="mt-3 flex items-center justify-between text-[11px] text-muted">
              <span>برای پیش‌نمایش خصوصی کامل، مطلب را ذخیره کن.</span>
              <span>{body.length.toLocaleString("fa-IR")} / ۱۰۰٬۰۰۰ نویسه</span>
            </div>
          </div>
        </section>
        <section className="panel p-6 sm:p-8">
          <span className="eyebrow">03 / THE DETAILS</span>
          <h2 className="mt-2 text-xl font-black text-ink">جزئیاتِ دیده‌شدن</h2>
          <p className="mt-2 text-xs leading-7 text-muted">
            اختیاری، اما برای نتیجهٔ جست‌وجو و اشتراک‌گذاری مفید است.
          </p>
          <div className="mt-6 grid gap-5 sm:grid-cols-2">
            <div>
              <label htmlFor="seo-title" className="label">
                عنوان سئو
              </label>
              <input
                id="seo-title"
                name="seoTitle"
                defaultValue={post?.seoTitle || ""}
                maxLength={70}
                placeholder="حداکثر ۷۰ نویسه"
                className="field"
              />
            </div>
            <div>
              <label htmlFor="seo-description" className="label">
                توضیح سئو
              </label>
              <textarea
                id="seo-description"
                name="seoDescription"
                defaultValue={post?.seoDescription || ""}
                maxLength={160}
                rows={2}
                placeholder="یک توضیح کوتاه برای موتور جست‌وجو"
                className="field leading-7"
              />
            </div>
          </div>
        </section>
      </div>
      <aside className="space-y-5 xl:sticky xl:top-6">
        <section className="panel border-forest/25 p-6">
          <div className="mb-5 flex items-center justify-between">
            <h2 className="text-base font-black text-ink">تنظیمات انتشار</h2>
            <span className="h-2 w-2 rounded-full bg-rust" />
          </div>
          <div className="space-y-5">
            <div>
              <label htmlFor="post-status" className="label">
                وضعیت
              </label>
              <select
                id="post-status"
                name="status"
                defaultValue={post?.status || "draft"}
                className="field"
              >
                <option value="draft">پیش‌نویس — فقط مدیر</option>
                <option value="published">منتشرشده — برای همه</option>
                <option value="archived">بایگانی — پنهان</option>
              </select>
            </div>
            <div>
              <label htmlFor="post-category" className="label">
                دسته‌بندی
              </label>
              <select
                id="post-category"
                name="categoryId"
                defaultValue={post?.categoryId || ""}
                className="field"
              >
                <option value="">بدون دسته‌بندی</option>
                {categories.map((category) => (
                  <option key={category.id} value={category.id}>
                    {category.name}
                  </option>
                ))}
              </select>
            </div>
            <button
              type="submit"
              disabled={pending || uploading}
              className="button-dark w-full"
            >
              <Save size={17} />
              {pending ? "در حال ذخیره..." : "ذخیرهٔ یادداشت"}
            </button>
            {state.error && (
              <p
                role="alert"
                className="rounded-xl border border-[#a45e7c] bg-[#4b2539]/50 p-3 text-xs leading-6 text-[#ffc7da]"
              >
                {state.error}
              </p>
            )}
            {post && (
              <Link
                href={`/admin/posts/${post.id}/preview`}
                className="inline-flex w-full items-center justify-center gap-1 text-xs font-bold text-forest hover:text-rust"
              >
                دیدن پیش‌نمایش خصوصی <ArrowUpLeft size={14} />
              </Link>
            )}
          </div>
        </section>
        <section className="panel overflow-hidden border-rust/25 p-6">
          <div className="mb-4 flex items-center gap-2">
            <ImagePlus size={19} className="text-rust" />
            <h2 className="text-base font-black text-ink">تصویر شاخص</h2>
          </div>
          <div className="relative aspect-[1.55] overflow-hidden rounded-xl">
            {coverPath ? (
              <Image
                src={coverPath}
                alt="پیش‌نمایش تصویر شاخص"
                fill
                sizes="315px"
                className="object-cover"
              />
            ) : (
              <CoverArt
                slug={post?.slug || "new-post"}
                className="h-full w-full"
              />
            )}
          </div>
          <p className="mt-3 text-[11px] leading-6 text-muted">
            JPEG، PNG یا WebP، حداکثر ۵ مگابایت. اگر تصویر نگذاری یک طرح اختصاصی
            نمایش داده می‌شود.
          </p>
          <label
            htmlFor="cover-upload"
            className="button-outline mt-4 w-full cursor-pointer"
          >
            <ImagePlus size={16} />
            {uploading ? "در حال آپلود..." : "بارگذاری تصویر"}
          </label>
          <input
            id="cover-upload"
            type="file"
            accept="image/jpeg,image/png,image/webp"
            aria-label="انتخاب تصویر شاخص"
            disabled={uploading}
            onChange={(e) => {
              void upload(e.target.files?.[0]);
              e.target.value = "";
            }}
            className="sr-only"
          />
          {coverPath && (
            <button
              type="button"
              onClick={() => setCoverPath("")}
              className="mt-3 inline-flex items-center gap-1 text-xs font-semibold text-rust"
            >
              <X size={14} /> حذف تصویر
            </button>
          )}
          {uploadError && (
            <p role="alert" className="mt-3 text-xs leading-6 text-[#ffc7da]">
              {uploadError}
            </p>
          )}
        </section>
        <section className="panel p-6">
          <h2 className="text-base font-black text-ink">برچسب‌ها</h2>
          <p className="mt-1 text-[11px] leading-6 text-muted">
            موضوع‌های مرتبط را انتخاب کن.
          </p>
          <div className="mt-4 flex flex-wrap gap-2">
            {tags.map((tag) => (
              <label key={tag.id} className="cursor-pointer">
                <input
                  type="checkbox"
                  name="tagIds"
                  value={tag.id}
                  defaultChecked={selectedTagIds.includes(tag.id)}
                  className="peer sr-only"
                />
                <span className="inline-flex rounded-full border border-line px-3 py-2 text-[11px] font-bold text-muted transition hover:border-forest peer-checked:border-forest peer-checked:bg-[#174b4e] peer-checked:text-forest peer-focus-visible:outline-2 peer-focus-visible:outline-offset-2 peer-focus-visible:outline-rust">
                  #{tag.name}
                </span>
              </label>
            ))}
            {!tags.length && (
              <p className="text-xs leading-6 text-muted">
                هنوز برچسبی نیست. از صفحهٔ «دسته و برچسب» شروع کن.
              </p>
            )}
          </div>
        </section>
      </aside>
    </form>
  );
}
