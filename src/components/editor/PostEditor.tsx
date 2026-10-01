"use client";

import { useActionState, useEffect, useMemo, useRef, useState } from "react";
import {
  AlertCircle,
  BookOpenText,
  Clock3,
  Eye,
  FilePenLine,
  Loader2,
  Rocket,
  Save,
  Trash2,
} from "lucide-react";
import { savePostAction, type SavePostState } from "@/app/actions";
import { readingTimeFa } from "@/lib/markdown";
import { Markdown } from "@/components/Markdown";
import type { Post } from "@/lib/types";

const initial: SavePostState = { status: "idle", message: "" };

const inputClass =
  "w-full rounded-xl border border-line bg-ink-2 px-4 py-3 text-sm text-paper placeholder:text-faint transition-colors focus:border-ember/60 focus:outline-none";

type Draft = { title: string; excerpt: string; content: string; tags: string; slug: string };

export function PostEditor({
  post,
  tagSuggestions,
}: {
  post: Post | null;
  tagSuggestions: string[];
}) {
  const storageKey = `sd-editor-${post ? post.slug : "new"}`;

  const [title, setTitle] = useState(post?.title ?? "");
  const [excerpt, setExcerpt] = useState(post?.excerpt ?? "");
  const [content, setContent] = useState(post?.content ?? "");
  const [tags, setTags] = useState(post?.tags.join(", ") ?? "");
  const [slug, setSlug] = useState(post?.slug ?? "");
  const [tab, setTab] = useState<"write" | "preview">("write");
  const [restored, setRestored] = useState(false);
  const [state, formAction, pending] = useActionState(savePostAction, initial);
  const saveTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const [savedAt, setSavedAt] = useState<string | null>(null);

  // Restore local draft (only if the server version was untouched)
  useEffect(() => {
    try {
      const raw = localStorage.getItem(storageKey);
      if (!raw) return;
      const draft = JSON.parse(raw) as Draft;
      if (draft.content && draft.content !== content) {
        setTitle(draft.title);
        setExcerpt(draft.excerpt);
        setContent(draft.content);
        setTags(draft.tags);
        setSlug(draft.slug);
        setRestored(true);
      }
    } catch {
      // corrupted draft — ignore
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  // Autosave to localStorage
  useEffect(() => {
    if (saveTimer.current) clearTimeout(saveTimer.current);
    saveTimer.current = setTimeout(() => {
      try {
        if (title || content) {
          localStorage.setItem(storageKey, JSON.stringify({ title, excerpt, content, tags, slug }));
          setSavedAt(
            new Date().toLocaleTimeString("fa-IR", { hour: "2-digit", minute: "2-digit" }),
          );
        }
      } catch {
        // storage full — skip
      }
    }, 900);
    return () => {
      if (saveTimer.current) clearTimeout(saveTimer.current);
    };
  }, [title, excerpt, content, tags, slug, storageKey]);

  const readMin = useMemo(() => readingTimeFa(content), [content]);
  const words = useMemo(() => content.split(/\s+/).filter(Boolean).length, [content]);
  const canSubmit = title.trim().length >= 4 && excerpt.trim().length >= 10 && content.trim().length >= 50;

  const clearLocal = () => {
    localStorage.removeItem(storageKey);
    setRestored(false);
    setSavedAt(null);
  };

  return (
    <form
      action={formAction}
      onSubmit={() => localStorage.removeItem(storageKey)}
      className="space-y-5"
    >
      {post && <input type="hidden" name="editing" value={post.slug} />}
      <button type="submit" name="intent" value="draft" className="hidden" aria-hidden tabIndex={-1} />

      {/* top meta fields */}
      <div className="grid gap-4 lg:grid-cols-[1fr_260px]">
        <div className="space-y-4">
          <label className="block">
            <span className="mb-2 flex items-center justify-between text-xs text-mute">
              عنوان نوشته
              <span dir="ltr" className="font-mono text-[10px] text-faint">{title.length}/140</span>
            </span>
            <input
              name="title"
              value={title}
              onChange={(e) => setTitle(e.target.value)}
              maxLength={140}
              required
              placeholder="عنوان را طوری بنویس که نتوان نکرد..."
              className={`${inputClass} text-base font-bold`}
            />
          </label>
          <label className="block">
            <span className="mb-2 flex items-center justify-between text-xs text-mute">
              چکیده (در کارت‌ها و گوگل دیده می‌شود)
              <span dir="ltr" className="font-mono text-[10px] text-faint">{excerpt.length}/280</span>
            </span>
            <textarea
              name="excerpt"
              value={excerpt}
              onChange={(e) => setExcerpt(e.target.value)}
              maxLength={280}
              required
              rows={2}
              placeholder="دو جمله که کنجکاو‌مان می‌کند..."
              className={`${inputClass} resize-none leading-7`}
            />
          </label>
        </div>

        <div className="space-y-4 rounded-2xl border border-line bg-ink-2 p-4">
          {!post && (
            <label className="block">
              <span className="mb-2 block text-xs text-mute">اسلاگ (اختیاری — لاتین)</span>
              <input
                name="slug"
                value={slug}
                onChange={(e) => setSlug(e.target.value)}
                dir="ltr"
                placeholder="my-first-post"
                className={`${inputClass} font-mono text-xs`}
              />
            </label>
          )}
          <label className="block">
            <span className="mb-2 block text-xs text-mute">تگ‌ها (با ویرگول، حداکثر ۵ تا)</span>
            <input
              name="tags"
              value={tags}
              onChange={(e) => setTags(e.target.value)}
              dir="ltr"
              placeholder="nextjs, mongodb"
              className={`${inputClass} font-mono text-xs`}
            />
          </label>
          {tagSuggestions.length > 0 && (
            <div className="flex flex-wrap gap-1.5">
              {tagSuggestions.slice(0, 8).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => {
                    const list = tags.split(",").map((x) => x.trim()).filter(Boolean);
                    if (!list.includes(t)) setTags([...list, t].join(", "));
                  }}
                  className="rounded-md bg-ink-3 px-2 py-1 font-mono text-[10px] text-faint transition-colors hover:text-ember"
                  dir="ltr"
                >
                  #{t}
                </button>
              ))}
            </div>
          )}
          <div className="flex items-center justify-between border-t border-line-soft pt-3 font-mono text-[10px] text-faint">
            <span className="flex items-center gap-1">
              <Clock3 className="size-3" />
              {readMin} دقیقه
            </span>
            <span dir="ltr">{words} words</span>
          </div>
          {savedAt && (
            <p className="flex items-center gap-1 text-[10px] text-faint">
              <Save className="size-3" />
              پیش‌نویس محلی: {savedAt}
            </p>
          )}
          {restored && (
            <button
              type="button"
              onClick={clearLocal}
              className="flex items-center gap-1 text-[10px] text-ember hover:text-ember-2"
            >
              <Trash2 className="size-3" />
              پاک کردن پیش‌نویس محلی بازیابی‌شده
            </button>
          )}
        </div>
      </div>

      {/* editor + preview */}
      <div className="rounded-2xl border border-line bg-ink-2">
        <div className="flex items-center justify-between border-b border-line-soft px-4 py-2.5">
          <div className="flex gap-1 lg:hidden">
            <button
              type="button"
              onClick={() => setTab("write")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${tab === "write" ? "bg-ink-3 font-bold text-paper" : "text-faint"}`}
            >
              <FilePenLine className="size-3.5" /> نوشتن
            </button>
            <button
              type="button"
              onClick={() => setTab("preview")}
              className={`flex items-center gap-1.5 rounded-lg px-3 py-1.5 text-xs ${tab === "preview" ? "bg-ink-3 font-bold text-paper" : "text-faint"}`}
            >
              <Eye className="size-3.5" /> پیش‌نمایش
            </button>
          </div>
          <p className="hidden items-center gap-2 font-mono text-[10px] tracking-widest text-faint lg:flex" dir="ltr">
            <BookOpenText className="size-3.5" />
            MARKDOWN LIVE PREVIEW
          </p>
          <p className="font-mono text-[10px] text-faint" dir="ltr">
            ## تیتر · **بولد** · ~~~ کد
          </p>
        </div>

        <div className="grid lg:grid-cols-2">
          <textarea
            name="content"
            value={content}
            onChange={(e) => setContent(e.target.value)}
            required
            dir="auto"
            placeholder={`این‌جا بنویس...\n\n## اولین تیتر\n\n- مارک‌داون کامل پشتیبانی می‌شود\n- جدول، کد، نقل‌قول، لینک\n\nپرونده‌ي هر نوشته را با ~~~ کد شروع کن.`}
            className={`min-h-[55vh] resize-y border-0 bg-transparent p-5 font-sans text-[15px] leading-8 text-paper placeholder:text-faint focus:outline-none lg:border-e lg:border-line-soft ${
              tab === "preview" ? "hidden lg:block" : ""
            }`}
            style={{ fontFeatureSettings: '"ss01"' }}
          />
          <div
            className={`max-h-[70vh] overflow-y-auto p-6 lg:p-7 ${
              tab === "write" ? "hidden lg:block" : ""
            }`}
          >
            {content.trim() ? (
              <>
                <h2 className="mb-6 border-b border-line-soft pb-4 text-2xl font-black leading-10">
                  {title || "بدون عنوان"}
                </h2>
                <Markdown content={content} />
              </>
            ) : (
              <p className="grid min-h-40 place-items-center text-sm text-faint">
                پیش‌نمایش این‌جا زنده دیده می‌شود...
              </p>
            )}
          </div>
        </div>
      </div>

      {state.status === "error" && (
        <p className="flex items-center gap-2 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
          <AlertCircle className="size-4 shrink-0" />
          {state.message}
        </p>
      )}

      {/* actions */}
      <div className="sticky bottom-4 z-20 flex items-center gap-3 rounded-2xl border border-line bg-ink-2/95 p-3 shadow-[0_20px_60px_-20px_rgba(0,0,0,0.8)] backdrop-blur">
        <button
          type="submit"
          name="intent"
          value="publish"
          disabled={pending || !canSubmit}
          className="flex flex-1 items-center justify-center gap-2 rounded-xl bg-ember px-5 py-3 font-bold text-ink transition-all hover:bg-ember-2 disabled:opacity-50 sm:flex-none"
        >
          {pending ? <Loader2 className="size-4 animate-spin" /> : <Rocket className="size-4" />}
          {post ? "به‌روزرسانی" : "انتشار"}
        </button>
        <button
          type="submit"
          name="intent"
          value="draft"
          disabled={pending}
          className="flex items-center justify-center gap-2 rounded-xl border border-line px-5 py-3 font-semibold text-mute transition-colors hover:border-faint hover:text-paper disabled:opacity-50"
        >
          <Save className="size-4" />
          پیش‌نویس
        </button>
        <p className="ms-auto hidden font-mono text-[10px] text-faint sm:block" dir="ltr">
          {canSubmit ? "ready to ship" : "title + excerpt + 50 chars"}
        </p>
      </div>
    </form>
  );
}
