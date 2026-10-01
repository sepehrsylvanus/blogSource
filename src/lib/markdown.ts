import type { Heading } from "./types";

/** Persian-aware slug for heading anchors: keeps arabic/persian letters, latin and digits. */
export function slugifyHeading(text: string): string {
  return text
    .trim()
    .toLowerCase()
    .replace(/[`*_~]/g, "")
    .replace(/[^\p{Script=Arabic}a-z0-9\s-]/gu, "")
    .replace(/\s+/g, "-")
    .replace(/-+/g, "-")
    .replace(/^-|-$/g, "");
}

export function extractHeadings(markdown: string): Heading[] {
  const inFence = /^(```|~~~)/;
  const out: Heading[] = [];
  let fenced = false;
  for (const raw of markdown.split("\n")) {
    const line = raw.trimEnd();
    if (inFence.test(line.trim())) {
      fenced = !fenced;
      continue;
    }
    if (fenced) continue;
    const m = /^(#{2,3})\s+(.+)$/.exec(line);
    if (m) {
      const text = m[2].replace(/[*`]/g, "").trim();
      out.push({ depth: m[1].length, text, id: slugifyHeading(text) });
    }
  }
  return out;
}

export function readingTimeFa(markdown: string): number {
  const words = markdown
    .replace(/(```|~~~)[\s\S]*?(\1)/g, " ")
    .split(/\s+/)
    .filter(Boolean).length;
  return Math.max(1, Math.round(words / 170));
}

export function stripMarkdown(markdown: string): string {
  return markdown
    .replace(/(```|~~~)[\s\S]*?\1/g, " ")
    .replace(/[#>*_`|\[\]()!]/g, "")
    .replace(/\s+/g, " ")
    .trim();
}

/** Recursively pull plain text out of React children (used for heading ids). */
export function textOf(node: unknown): string {
  if (node == null || typeof node === "boolean") return "";
  if (typeof node === "string" || typeof node === "number") return String(node);
  if (Array.isArray(node)) return node.map(textOf).join("");
  if (typeof node === "object" && "props" in (node as Record<string, unknown>)) {
    return textOf((node as { props: { children?: unknown } }).props.children);
  }
  return "";
}

export function escapeRegExp(input: string): string {
  return input.replace(/[.*+?^${}()|[\]\\]/g, "\\$&");
}

export function formatDateFa(iso: string): string {
  return new Intl.DateTimeFormat("fa-IR", {
    year: "numeric",
    month: "long",
    day: "numeric",
  }).format(new Date(iso));
}

/** Latin digits look better with the mono font in this design system. */
export function num(n: number): string {
  return new Intl.NumberFormat("en-US").format(n);
}
