import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { KeyRound } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { LoginForm } from "@/components/auth/AuthForms";
import { ADMIN_EMAIL, ADMIN_PASSWORD, WRITER_EMAIL, WRITER_PASSWORD } from "@/lib/seed/accounts";

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

      {/* Never print credentials in a production build. */}
      {process.env.NODE_ENV !== "production" ? (
        <div className="mt-6 rounded-2xl border border-dashed border-line p-4 text-center">
          <p className="font-mono text-[10px] uppercase tracking-widest text-faint" dir="ltr">
            seeded test accounts
          </p>
          <p className="mt-1.5 text-xs text-mute">
            مدیر:{" "}
            <span className="font-mono text-ember-2" dir="ltr">{ADMIN_EMAIL}</span> /{" "}
            <span className="font-mono text-ember-2" dir="ltr">{ADMIN_PASSWORD}</span>
          </p>
          <p className="mt-1 text-xs text-mute">
            نویسنده:{" "}
            <span className="font-mono text-ember-2" dir="ltr">{WRITER_EMAIL}</span> /{" "}
            <span className="font-mono text-ember-2" dir="ltr">{WRITER_PASSWORD}</span>
          </p>
        </div>
      ) : null}
    </div>
  );
}
