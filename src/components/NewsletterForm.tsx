"use client";

import { useActionState } from "react";
import { Send, CheckCircle2, AlertCircle } from "lucide-react";
import { subscribeAction, type SubscribeState } from "@/app/actions";

const initialState: SubscribeState = { status: "idle", message: "" };

export function NewsletterForm() {
  const [state, formAction, pending] = useActionState(subscribeAction, initialState);

  return (
    <form action={formAction} className="w-full">
      <div className="flex items-stretch gap-2">
        <input
          type="email"
          name="email"
          required
          dir="ltr"
          placeholder="you@email.com"
          className="w-full rounded-xl border border-line bg-ink-2 px-4 py-2.5 font-mono text-sm text-paper placeholder:text-faint focus:border-ember/60 focus:outline-none"
        />
        <button
          type="submit"
          disabled={pending}
          className="flex shrink-0 items-center gap-2 rounded-xl bg-ember px-4 py-2.5 text-sm font-bold text-ink transition-all duration-200 hover:bg-ember-2 disabled:opacity-50"
        >
          <Send className="size-4 -scale-x-100" />
          {pending ? "..." : "عضویت"}
        </button>
      </div>
      {state.status !== "idle" && (
        <p
          className={`mt-2.5 flex items-center gap-1.5 text-xs ${
            state.status === "ok" || state.status === "duplicate" ? "text-mint" : "text-ember"
          }`}
        >
          {state.status === "ok" || state.status === "duplicate" ? (
            <CheckCircle2 className="size-3.5" />
          ) : (
            <AlertCircle className="size-3.5" />
          )}
          {state.message}
        </p>
      )}
    </form>
  );
}
