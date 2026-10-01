import type { Metadata } from "next";
import { redirect } from "next/navigation";
import { PenLine } from "lucide-react";
import { getCurrentUser } from "@/lib/auth";
import { RegisterForm } from "@/components/auth/AuthForms";

export const dynamic = "force-dynamic";

export const metadata: Metadata = { title: "ثبت‌نام نویسنده" };

export default async function RegisterPage() {
  const user = await getCurrentUser();
  if (user) redirect("/studio");

  return (
    <div className="mx-auto flex min-h-[75vh] max-w-md flex-col justify-center px-5 py-16">
      <div className="mb-8 text-center">
        <span className="mx-auto grid size-12 place-items-center rounded-2xl bg-gradient-to-br from-ember to-ember-2 text-ink">
          <PenLine className="size-5" />
        </span>
        <h1 className="mt-5 text-3xl font-black">نویسنده شو</h1>
        <p className="mt-2 text-sm leading-7 text-mute">
          این بلاگ فقط مال من نیست؛ ثبت‌نام کن، برو تو آتلیه و بنویس.
          <br />
          نوشته‌ات با نام خودت منتشر می‌شود.
        </p>
      </div>

      <div className="rounded-3xl border border-line bg-ink-2 p-6 sm:p-8">
        <RegisterForm />
      </div>
    </div>
  );
}
