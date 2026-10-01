"use client";

import { useEffect, useRef } from "react";

/** Fires a one-shot view increment for the post — invisible sensor. */
export function ViewBeacon({ slug }: { slug: string }) {
  const fired = useRef(false);

  useEffect(() => {
    if (fired.current) return;
    fired.current = true;
    fetch(`/api/posts/${encodeURIComponent(slug)}/view`, { method: "POST" }).catch(() => undefined);
  }, [slug]);

  return null;
}
