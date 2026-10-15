"use client";

import { RotateCcw, TriangleAlert } from "lucide-react";

export default function SiteError({
  reset,
}: {
  error: Error & { digest?: string };
  reset: () => void;
}) {
  return (
    <main
      role="alert"
      className="mx-auto grid min-h-[60vh] max-w-7xl place-items-center px-5 py-16 text-center"
    >
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-2xl border border-rust/40 bg-rust/10 text-rust">
          <TriangleAlert size={28} />
        </span>
        <h1 className="mt-6 text-3xl font-black text-ink">
          بارگذاری این صفحه ممکن نشد.
        </h1>
        <p className="mt-3 text-sm leading-8 text-muted">
          ممکن است ارتباط با پایگاه‌داده موقتاً برقرار نباشد. کمی بعد دوباره
          تلاش کن.
        </p>
        <button type="button" onClick={reset} className="button-dark mt-7">
          <RotateCcw size={16} /> تلاش دوباره
        </button>
      </div>
    </main>
  );
}
