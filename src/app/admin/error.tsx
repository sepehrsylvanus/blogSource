"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

export default function AdminError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <div
      role="alert"
      className="panel mx-auto max-w-2xl px-6 py-14 text-center"
    >
      <TriangleAlert size={28} className="mx-auto text-rust" />
      <h1 className="mt-5 text-xl font-black text-ink">
        نمایش این بخش ممکن نشد.
      </h1>
      <p className="mt-3 text-sm leading-7 text-muted">
        ارتباط یا درخواست را دوباره بررسی کن؛ جزئیات خطا در لاگ سرور ثبت می‌شود.
      </p>
      <button type="button" onClick={reset} className="button-dark mt-7">
        <RotateCcw size={16} /> تلاش دوباره
      </button>
    </div>
  );
}
