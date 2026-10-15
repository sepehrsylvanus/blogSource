"use client";

import { useEffect, useState } from "react";
import { Check, Link2 } from "lucide-react";

export function ReadingProgress() {
  const [progress, setProgress] = useState(0);
  useEffect(() => {
    const update = () => {
      const limit = document.documentElement.scrollHeight - window.innerHeight;
      setProgress(
        limit > 0
          ? Math.min(100, Math.round((window.scrollY / limit) * 100))
          : 0,
      );
    };
    update();
    window.addEventListener("scroll", update, { passive: true });
    window.addEventListener("resize", update);
    return () => {
      window.removeEventListener("scroll", update);
      window.removeEventListener("resize", update);
    };
  }, []);
  return (
    <div
      aria-hidden="true"
      className="fixed left-0 right-0 top-0 z-[60] h-[3px]"
    >
      <div
        className="h-full bg-gradient-to-l from-forest to-rust shadow-[0_0_14px_#80eadf] transition-[width] duration-100"
        style={{ width: `${progress}%` }}
      />
    </div>
  );
}

export function CopyLinkButton() {
  const [message, setMessage] = useState("");
  async function copy() {
    try {
      await navigator.clipboard.writeText(window.location.href);
      setMessage("لینک کپی شد");
    } catch {
      setMessage("از نوار نشانی مرورگر کپی کن");
    }
    window.setTimeout(() => setMessage(""), 3000);
  }
  return (
    <button
      type="button"
      onClick={() => void copy()}
      className="button-outline relative text-xs"
    >
      {message === "لینک کپی شد" ? <Check size={15} /> : <Link2 size={15} />}
      <span aria-live="polite">{message || "کپی لینک"}</span>
    </button>
  );
}
