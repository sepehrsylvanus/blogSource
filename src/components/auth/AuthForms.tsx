"use client";

import { useActionState } from "react";
import Link from "next/link";
import { AlertCircle, AtSign, KeyRound, Loader2, LogIn, User, UserPlus } from "lucide-react";
import { loginAction, registerAction, type AuthState } from "@/app/actions";

const initial: AuthState = { status: "idle", message: "" };

const inputClass =
  "w-full rounded-xl border border-line bg-ink px-4 py-3 text-sm text-paper placeholder:text-faint transition-colors focus:border-ember/60 focus:outline-none";

function ErrorBox({ message }: { message: string | undefined }) {
  if (!message) return null;
  return (
    <p className="flex items-center gap-2 rounded-xl border border-ember/30 bg-ember/10 px-4 py-3 text-sm text-ember">
      <AlertCircle className="size-4 shrink-0" />
      {message}
    </p>
  );
}

export function LoginForm({ next }: { next: string }) {
  const [state, formAction, pending] = useActionState(loginAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <input type="hidden" name="next" value={next} />
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs text-mute">
          <AtSign className="size-3.5" /> ایمیل
        </span>
        <input name="email" type="email" required dir="ltr" placeholder="you@email.com" className={`${inputClass} font-mono`} />
      </label>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs text-mute">
          <KeyRound className="size-3.5" /> رمز عبور
        </span>
        <input name="password" type="password" required dir="ltr" placeholder="••••••••" className={`${inputClass} font-mono`} />
      </label>

      {state.status === "error" && <ErrorBox message={state.message} />}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-4 py-3.5 font-bold text-ink transition-all hover:bg-ember-2 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <LogIn className="size-4" />}
        ورود به حساب
      </button>

      <p className="text-center text-xs leading-6 text-faint">
        حساب نداری؟{" "}
        <Link href="/register" className="font-semibold text-ember-2 hover:text-ember">
          همین‌جا بساز و شروع به نوشتن کن
        </Link>
      </p>
    </form>
  );
}

export function RegisterForm() {
  const [state, formAction, pending] = useActionState(registerAction, initial);

  return (
    <form action={formAction} className="space-y-4">
      <div className="grid gap-4 sm:grid-cols-2">
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs text-mute">
            <User className="size-3.5" /> نام نمایشی
          </span>
          <input name="name" required placeholder="مثلاً: سارا کدنویس" className={inputClass} />
        </label>
        <label className="block">
          <span className="mb-2 flex items-center gap-2 text-xs text-mute">
            <AtSign className="size-3.5" /> نام کاربری
          </span>
          <input name="username" required dir="ltr" placeholder="sara-codes" className={`${inputClass} font-mono`} />
        </label>
      </div>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs text-mute">
          <AtSign className="size-3.5" /> ایمیل
        </span>
        <input name="email" type="email" required dir="ltr" placeholder="you@email.com" className={`${inputClass} font-mono`} />
      </label>
      <label className="block">
        <span className="mb-2 flex items-center gap-2 text-xs text-mute">
          <KeyRound className="size-3.5" /> رمز عبور
        </span>
        <input name="password" type="password" required minLength={8} dir="ltr" placeholder="حداقل ۸ کاراکتر" className={`${inputClass} font-mono`} />
      </label>

      {state.status === "error" && <ErrorBox message={state.message} />}

      <button
        type="submit"
        disabled={pending}
        className="flex w-full items-center justify-center gap-2 rounded-xl bg-ember px-4 py-3.5 font-bold text-ink transition-all hover:bg-ember-2 disabled:opacity-60"
      >
        {pending ? <Loader2 className="size-4 animate-spin" /> : <UserPlus className="size-4" />}
        ثبت‌نام و ورود به آتلیه
      </button>

      <p className="text-center text-xs leading-6 text-faint">
        قبلاً ثبت‌نام کردی؟{" "}
        <Link href="/login" className="font-semibold text-ember-2 hover:text-ember">
          وارد شو
        </Link>
      </p>
    </form>
  );
}
