import Link from "next/link";
import { ArrowRight, Compass } from "lucide-react";

export default function SiteNotFound() {
  return (
    <main className="mx-auto grid min-h-[65vh] max-w-7xl place-items-center px-5 py-20 text-center sm:px-8">
      <div>
        <span className="mx-auto grid h-16 w-16 place-items-center rounded-[1.35rem] border border-forest/40 bg-forest/10 text-forest">
          <Compass size={30} strokeWidth={1.5} />
        </span>
        <p
          className="mt-7 text-xs font-black tracking-[.2em] text-rust"
          dir="ltr"
        >
          PAGE NOT FOUND / 404
        </p>
        <h1 className="mt-4 text-[clamp(2.3rem,5vw,4.6rem)] font-black leading-[1.55] text-forest">
          این صفحه را پیدا نکردیم.
        </h1>
        <p className="mx-auto mt-3 max-w-lg text-sm leading-8 text-muted">
          شاید نشانی تغییر کرده، یا این یادداشت هنوز منتشر نشده باشد. از صفحهٔ
          اول دوباره شروع کن.
        </p>
        <Link href="/" className="button-dark mt-8">
          <ArrowRight size={17} /> بازگشت به صفحهٔ اول
        </Link>
      </div>
    </main>
  );
}
