import Link from "next/link";
import { connection } from "next/server";
import { ArrowRight, PenLine } from "lucide-react";
import { PostEditor } from "@/components/post-editor";
import { getCategories, getTags } from "@/lib/queries";

export default async function NewPost() {
  await connection();
  const [categories, tags] = await Promise.all([getCategories(), getTags()]);
  return (
    <div>
      <Link
        href="/admin/posts"
        className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-forest"
      >
        <ArrowRight size={16} /> همهٔ نوشته‌ها
      </Link>
      <div className="mb-8 mt-6 flex flex-wrap items-end justify-between gap-3">
        <div>
          <span className="eyebrow">NEW STORY / یک صفحهٔ تازه</span>
          <h1 className="mt-3 text-[clamp(2rem,3.7vw,3.6rem)] font-black text-ink">
            یک <span className="gradient-type">یادداشت تازه.</span>
          </h1>
          <p className="mt-2 text-sm text-muted">
            از اولین جمله شروع کن؛ بقیهٔ داستان در راه است.
          </p>
        </div>
        <span className="hidden h-12 w-12 place-items-center rounded-2xl border border-forest/40 bg-forest/10 text-forest sm:grid">
          <PenLine size={22} />
        </span>
      </div>
      <PostEditor categories={categories} tags={tags} />
    </div>
  );
}
