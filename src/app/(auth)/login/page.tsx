"use client";

import { useState } from "react";
import Image from "next/image";
import Link from "next/link";
import { useRouter } from "next/navigation";
import {
  ArrowLeft,
  ArrowRight,
  LockKeyhole,
  Mail,
  PenLine,
  ShieldCheck,
  Sparkles,
} from "lucide-react";
import { authClient } from "@/lib/auth-client";

export default function LoginPage() {
  const router = useRouter();
  const [error, setError] = useState("");
  const [busy, setBusy] = useState(false);
  async function onSubmit(event: React.FormEvent<HTMLFormElement>) {
    event.preventDefault();
    setBusy(true);
    setError("");
    const data = new FormData(event.currentTarget);
    try {
      const result = await authClient.signIn.email({
        email: String(data.get("email") || ""),
        password: String(data.get("password") || ""),
      });
      if (result.error) {
        setError("ایمیل یا گذرواژه درست نیست؛ دوباره امتحان کن.");
        return;
      }
      router.replace("/admin");
      router.refresh();
    } catch {
      setError("ارتباط برقرار نشد. چند لحظهٔ دیگر دوباره امتحان کن.");
    } finally {
      setBusy(false);
    }
  }

  return (
    <main className="grid min-h-screen bg-paper lg:grid-cols-[1fr_.92fr]">
      <div className="grid-field relative flex min-h-screen flex-col overflow-hidden px-6 py-7 sm:px-12 lg:px-[clamp(3rem,7vw,8rem)] lg:py-10">
        <div
          aria-hidden
          className="absolute -right-24 top-1/4 h-80 w-80 rounded-full bg-[#6551bc]/17 blur-[90px]"
        />
        <div className="relative flex items-center justify-between">
          <Link
            href="/"
            className="flex items-center gap-2.5 font-black text-ink"
          >
            <span className="grid h-10 w-10 place-items-center rounded-xl bg-gradient-to-br from-[#8df9e2] to-[#a98cff] text-xl text-[#071323] shadow-[0_0_25px_#72e9e151]">
              ح
            </span>
            <span className="text-xl">
              حاشیه<span className="text-forest">.</span>
            </span>
          </Link>
          <Link
            href="/"
            className="inline-flex items-center gap-2 text-xs font-bold text-muted hover:text-forest"
          >
            بازگشت به مجله <ArrowRight size={15} />
          </Link>
        </div>
        <div className="relative mx-auto flex w-full max-w-[450px] flex-1 flex-col justify-center py-14">
          <span className="eyebrow">WRITER STUDIO / میز نویسنده</span>
          <h1 className="mt-6 text-[clamp(2.75rem,4vw,4.5rem)] font-black leading-[1.45] tracking-[-.05em] text-ink">
            برگردیم سراغ <span className="gradient-type">ایده‌ها.</span>
          </h1>
          <p className="mt-4 text-sm leading-8 text-muted">
            فضای تو برای ساختن، نوشتن و منتشر کردنِ داستان بعدی.
          </p>
          <form onSubmit={onSubmit} className="panel mt-9 space-y-6 p-6 sm:p-8">
            <div>
              <label htmlFor="email" className="label">
                ایمیل نویسنده
              </label>
              <div className="relative">
                <Mail
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-forest"
                />
                <input
                  id="email"
                  type="email"
                  name="email"
                  autoComplete="username"
                  required
                  dir="ltr"
                  placeholder="you@example.com"
                  className="field h-[54px] pr-12 text-left"
                />
              </div>
            </div>
            <div>
              <label htmlFor="password" className="label">
                گذرواژه
              </label>
              <div className="relative">
                <LockKeyhole
                  size={18}
                  className="absolute right-4 top-1/2 -translate-y-1/2 text-forest"
                />
                <input
                  id="password"
                  type="password"
                  name="password"
                  autoComplete="current-password"
                  required
                  dir="ltr"
                  placeholder="••••••••••••"
                  className="field h-[54px] pr-12 text-left"
                />
              </div>
            </div>
            {error && (
              <p
                role="alert"
                className="rounded-xl border border-[#ac657f] bg-[#4d2639]/60 px-4 py-3 text-sm leading-7 text-[#ffc7d8]"
              >
                {error}
              </p>
            )}
            <button
              type="submit"
              disabled={busy}
              className="button-dark h-[54px] w-full text-sm"
            >
              {busy ? "در حال بررسی..." : "ورود به میز نویسنده"}{" "}
              <ArrowLeft size={18} />
            </button>
          </form>
          <p className="mt-7 flex items-start gap-2 rounded-2xl border border-line bg-surface/80 p-4 text-xs leading-6 text-muted">
            <ShieldCheck size={17} className="mt-1 shrink-0 text-forest" /> حساب
            نویسنده فقط توسط مدیر سرور ایجاد می‌شود؛ ثبت‌نام عمومی فعال نیست.
          </p>
        </div>
        <p className="relative text-[11px] text-muted">
          © {new Date().getFullYear()} حاشیه · جایی برای ایده‌هایی که می‌مانند.
        </p>
      </div>
      <aside
        className="relative hidden min-h-screen overflow-hidden bg-[#101b2c] lg:block"
        aria-label="تصویر الهام‌بخش حاشیه"
      >
        <Image
          src="/neon-studio.jpg"
          alt="منشور آبی در استودیوی خلاق تاریک"
          fill
          priority
          sizes="50vw"
          className="object-cover object-[40%_50%]"
        />
        <div
          aria-hidden
          className="absolute inset-0 bg-gradient-to-t from-[#080e1e]/95 via-[#080e1e]/20 to-transparent"
        />
        <div className="absolute bottom-[12%] right-[10%] left-[10%] text-white">
          <span className="inline-flex items-center gap-2 text-xs font-bold tracking-widest text-forest">
            <PenLine size={17} /> فضای نوشتن <Sparkles size={14} />
          </span>
          <p className="mt-5 max-w-xl text-[clamp(2rem,2.9vw,3.5rem)] font-black leading-[1.6]">
            چیزهای بزرگ، با یک خط شروع می‌شوند.
          </p>
          <div className="mt-8 h-[2px] w-24 bg-gradient-to-l from-forest to-rust" />
        </div>
      </aside>
    </main>
  );
}
