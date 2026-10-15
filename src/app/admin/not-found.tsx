import Link from "next/link";
import { ArrowRight, FileQuestion } from "lucide-react";

export default function AdminNotFound() {
  return (
    <div className="panel mx-auto max-w-2xl px-6 py-16 text-center">
      <span className="mx-auto grid h-14 w-14 place-items-center rounded-2xl border border-forest/40 bg-forest/10 text-forest">
        <FileQuestion size={26} />
      </span>
      <h1 className="mt-6 text-2xl font-black text-ink">
        این یادداشت پیدا نشد.
      </h1>
      <p className="mt-3 text-sm leading-8 text-muted">
        ممکن است حذف شده باشد یا نشانی‌اش درست نباشد.
      </p>
      <Link href="/admin/posts" className="button-dark mt-7">
        <ArrowRight size={16} /> بازگشت به نوشته‌ها
      </Link>
    </div>
  );
}
