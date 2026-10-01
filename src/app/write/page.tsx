import type { Metadata } from "next";
import { PenLine } from "lucide-react";
import { requireUser } from "@/lib/auth";
import { getTags } from "@/lib/data";
import { PostEditor } from "@/components/editor/PostEditor";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "نوشتن نوشته‌ی جدید" };

export default async function WritePage() {
  const user = await requireUser("/write");
  const tags = await getTags();

  return (
    <div className="mx-auto max-w-6xl px-5 py-12">
      <div className="mb-8 flex flex-wrap items-center justify-between gap-4">
        <div>
          <p className="flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-faint" dir="ltr">
            <PenLine className="size-3.5 text-ember" />
            STUDIO ~ /new-post
          </p>
          <h1 className="mt-3 text-3xl font-black sm:text-4xl">نوشته‌ی جدید</h1>
        </div>
        <p className="text-sm text-mute">
          به نام <b className="text-ember-2">{user.name}</b> منتشر می‌شود
        </p>
      </div>

      <PostEditor post={null} tagSuggestions={tags.map((t) => t.name)} />
    </div>
  );
}
