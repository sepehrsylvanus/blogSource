"use client";

import { useRef, useState, type ReactNode } from "react";
import { Check, Copy, Terminal } from "lucide-react";

export function CodeShell({ children, language }: { children: ReactNode; language: string | null }) {
  const [copied, setCopied] = useState(false);
  const ref = useRef<HTMLPreElement>(null);

  const copy = async () => {
    const code = ref.current?.querySelector("code")?.innerText;
    if (!code) return;
    try {
      await navigator.clipboard.writeText(code);
      setCopied(true);
      setTimeout(() => setCopied(false), 1800);
    } catch {
      // clipboard blocked — ignore
    }
  };

  return (
    <pre ref={ref} className="group relative not-prose">
      <div className="flex items-center justify-between border-b border-line-soft px-4 py-2">
        <span className="flex items-center gap-2 font-mono text-[10px] tracking-widest text-faint">
          <Terminal className="size-3" />
          {language ?? "code"}
        </span>
        <button
          onClick={copy}
          className="flex items-center gap-1.5 rounded-md border border-line px-2 py-1 font-mono text-[10px] text-faint transition-all hover:border-ember/50 hover:text-ember"
          aria-label="کپی کد"
        >
          {copied ? <Check className="size-3 text-mint" /> : <Copy className="size-3" />}
          {copied ? "copied" : "copy"}
        </button>
      </div>
      {children}
    </pre>
  );
}
