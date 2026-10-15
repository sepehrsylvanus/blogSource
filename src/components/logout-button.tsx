"use client";

import { useState } from "react";
import { useRouter } from "next/navigation";
import { LogOut } from "lucide-react";
import { authClient } from "@/lib/auth-client";

export function LogoutButton({ compact = false }: { compact?: boolean }) {
  const router = useRouter();
  const [busy, setBusy] = useState(false);
  return (
    <button
      type="button"
      disabled={busy}
      aria-label="خروج از میز نویسنده"
      className="inline-flex items-center gap-2 rounded-xl border border-line bg-surface px-3.5 py-2.5 text-xs font-bold text-muted transition hover:border-forest hover:text-forest disabled:opacity-50"
      onClick={async () => {
        setBusy(true);
        try {
          await authClient.signOut();
          router.replace("/login");
          router.refresh();
        } finally {
          setBusy(false);
        }
      }}
    >
      <LogOut size={15} />
      {!compact && (busy ? "خروج..." : "خروج")}
    </button>
  );
}
