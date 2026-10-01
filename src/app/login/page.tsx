import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/AuthForms";
import { DYNAMIC_ADMIN_EMAIL } from "@/lib/seed/admin";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "ورود" };

export default async function LoginPage({
  searchParams,
}: {
  searchParams: Promise<{ next?: string }>;
}) {
  const user = await getCurrentUser();
  if (user) redirect("/studio");
  const { next } = await searchParams;

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-5 py-16">
      <div className="mb-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-ember to-ember-2 text-ink">
          <KeyRound className="size-5" />
        </span>
        <h1 className="mt-5 text-3xl font-black">خوش برگشتی</h1>
        <p className="mt-2 text-sm text-mute">وارد شو تا آتلیه‌ی نوشتن باز شود</p>
      </div>

      <div className="rounded-3xl border border-line bg-ink-2 p-6 sm:p-8">
        <LoginForm next={next && next.startsWith("/") ? next : "/studio"} />
      </div>

      <div className="mt-6 rounded-2xl border border-dashed border-line p-4 text-center">
        <p className="font-mono text-[10px] uppercase tracking-widest text-faint" dir="ltr">demo account</p>
        <p className="mt-1.5 text-xs text-mute">
          حساب مدیر (سانی):{" "}
          <span className="font-mono text-ember-2" dir="ltr">{DYNAMIC_ADMIN_EMAIL}</span> /{" "}
          <span className="font-mono text-ember-2" dir="ltr">sani1234</span>
        </p>
      </div>
    </div>
  );
}
