"use client";

import { useEffect, useState } from "react";
import { ListTree } from "lucide-react";
import type { Heading } from "@/lib/types";

export function TOC({ headings }: { headings: Heading[] }) {
  const [active, setActive] = useState<string>("");

  useEffect(() => {
    if (headings.length === 0) return;
    const observer = new IntersectionObserver(
      (entries) => {
        for (const entry of entries) {
          if (entry.isIntersecting) setActive(entry.target.id);
        }
      },
      { rootMargin: "-80px 0px -70% 0px", threshold: 0 },
    );
    for (const h of headings) {
      const el = document.getElementById(h.id);
      if (el) observer.observe(el);
    }
    return () => observer.disconnect();
  }, [headings]);

  if (headings.length === 0) return null;

  return (
    <nav aria-label="فهرست نوشته" className="space-y-1">
      <p className="mb-3 flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-faint">
        <ListTree className="size-3.5" />
        فهرست نوشته
      </p>
      <ul className="space-y-1 border-s border-line">
        {headings.map((h) => (
          <li key={h.id}>
            <a
              href={`#${h.id}`}
              className={`-ms-px block border-s-2 py-1 pe-3 text-[13px] leading-6 transition-all duration-200 ${
                h.depth === 3 ? "ps-7" : "ps-4"
              } ${
                active === h.id
                  ? "border-ember text-paper"
                  : "border-transparent text-faint hover:text-mute"
              }`}
            >
              {h.text}
            </a>
          </li>
        ))}
      </ul>
    </nav>
  );
}
