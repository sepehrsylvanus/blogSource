import Link from "next/link";

export default function NotFound() {
  return (
    <div className="mx-auto flex min-h-[70vh] max-w-6xl flex-col items-center justify-center px-5 text-center">
      <p className="font-mono text-[10rem] font-black leading-none text-line sm:text-[14rem]" dir="ltr">
        404
      </p>
      <h1 className="-mt-6 text-2xl font-black text-paper sm:-mt-10">این آدرس به هیچ گره‌ای وصل نیست</h1>
      <p className="mt-4 max-w-sm text-sm leading-7 text-mute">
        صفحه‌ای که دنبالش بودی یا جابه‌جا شده یا هیچ‌وقت وجود نداشته. گراف دانش همیشه راه بازگشت را بلد است.
      </p>
      <div className="mt-8 flex gap-3">
        <Link href="/" className="rounded-xl bg-ember px-5 py-3 text-sm font-bold text-ink transition-colors hover:bg-ember-2">
          برگرد خانه
        </Link>
        <Link href="/graph" className="rounded-xl border border-line bg-ink-3 px-5 py-3 text-sm font-bold text-paper transition-colors hover:text-ember">
          دیدن گراف دانش
        </Link>
      </div>
    </div>
  );
}
