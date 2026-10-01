"use client";

import { Trash2 } from "lucide-react";
import { deletePostAction } from "@/app/actions";

export function DeletePostButton({ slug, title }: { slug: string; title: string }) {
  return (
    <form
      action={deletePostAction}
      onSubmit={(e) => {
        if (!window.confirm(`«${title}» برای همیشه حذف می‌شود. مطمئنی؟`)) {
          e.preventDefault();
        }
      }}
    >
      <input type="hidden" name="slug" value={slug} />
      <button
        type="submit"
        className="flex items-center gap-1.5 rounded-lg border border-line px-3 py-1.5 text-xs text-faint transition-colors hover:border-ember/60 hover:text-ember"
        title="حذف نوشته"
      >
        <Trash2 className="size-3.5" />
        حذف
      </button>
    </form>
  );
}
