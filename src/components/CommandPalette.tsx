"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import { Command } from "cmdk";
import {
  Search,
  FileText,
  Hash,
  FolderGit2,
  Home,
  Network,
  Radar,
  User,
  CornerDownLeft,
  Loader2,
} from "lucide-react";
import type { SearchResult } from "@/lib/types";

type PalettePost = { slug: string; title: string; tags: string[] };

const quickLinks = [
  { href: "/", label: "خانه", icon: Home },
  { href: "/posts", label: "نوشته‌ها", icon: FileText },
  { href: "/graph", label: "گراف دانش", icon: Network },
  { href: "/stack", label: "رادار تکنولوژی", icon: Radar },
  { href: "/about", label: "درباره", icon: User },
];

function ResultIcon({ type }: { type: SearchResult["type"] }) {
  if (type === "tag") return <Hash className="size-4 shrink-0 text-mint" />;
  if (type === "project") return <FolderGit2 className="size-4 shrink-0 text-ember-2" />;
  return <FileText className="size-4 shrink-0 text-ember" />;
}

export function CommandPalette({ posts }: { posts: PalettePost[] }) {
  const [open, setOpen] = useState(false);
  const [query, setQuery] = useState("");
  const [results, setResults] = useState<SearchResult[]>([]);
  const [loading, setLoading] = useState(false);
  const router = useRouter();
  const debounceRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  useEffect(() => {
    const onKey = (e: KeyboardEvent) => {
      if ((e.metaKey || e.ctrlKey) && e.key.toLowerCase() === "k") {
        e.preventDefault();
        setOpen((v) => !v);
      }
      if (e.key === "Escape") setOpen(false);
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, []);

  const search = useCallback((value: string) => {
    setQuery(value);
    if (debounceRef.current) clearTimeout(debounceRef.current);
    if (value.trim().length < 2) {
      setResults([]);
      setLoading(false);
      return;
    }
    setLoading(true);
    debounceRef.current = setTimeout(async () => {
      try {
        const res = await fetch(`/api/search?q=${encodeURIComponent(value)}`);
        const data = (await res.json()) as { results: SearchResult[] };
        setResults(data.results);
      } catch {
        setResults([]);
      } finally {
        setLoading(false);
      }
    }, 140);
  }, []);

  const go = useCallback(
    (href: string) => {
      setOpen(false);
      setQuery("");
      setResults([]);
      router.push(href);
    },
    [router],
  );

  return (
    <>
      <button
        onClick={() => setOpen(true)}
        className="flex items-center gap-2 rounded-xl border border-line bg-ink-3 px-3 py-2 text-xs text-faint transition-colors hover:border-faint hover:text-mute"
        aria-label="جستجو (Ctrl+K)"
      >
        <Search className="size-3.5" />
        <span className="hidden lg:inline">جستجو...</span>
        <kbd className="hidden rounded-md border border-line bg-ink px-1.5 font-mono text-[10px] lg:inline" dir="ltr">
          ⌘K
        </kbd>
      </button>

      {open && (
        <div className="fixed inset-0 z-[90]" role="dialog" aria-modal="true" aria-label="جستجو">
          <div
            className="absolute inset-0 bg-ink/70 backdrop-blur-sm"
            onClick={() => setOpen(false)}
          />
          <div className="absolute inset-x-4 top-[14%] mx-auto max-w-xl">
            <Command
              shouldFilter={false}
              className="overflow-hidden rounded-2xl border border-line bg-ink-2 shadow-[0_40px_120px_-20px_rgba(0,0,0,0.9)]"
            >
              <div className="flex items-center gap-3 border-b border-line-soft px-4">
                {loading ? (
                  <Loader2 className="size-4 animate-spin text-ember" />
                ) : (
                  <Search className="size-4 text-faint" />
                )}
                <Command.Input
                  value={query}
                  onValueChange={search}
                  placeholder="جستجو در نوشته‌ها، تگ‌ها و پروژه‌ها..."
                  className="w-full bg-transparent py-4 text-sm text-paper placeholder:text-faint focus:outline-none"
                  autoFocus
                />
                <kbd className="rounded-md border border-line bg-ink px-1.5 py-0.5 font-mono text-[10px] text-faint">
                  ESC
                </kbd>
              </div>

              <Command.List className="max-h-[340px] overflow-y-auto p-2">
                {query.trim().length >= 2 && !loading && results.length === 0 && (
                  <div className="px-3 py-8 text-center text-sm text-faint">
                    چیزی پیدا نشد — شاید موضوع ویدیوی بعدی کانال باشد
                  </div>
                )}

                {query.trim().length < 2 && (
                  <>
                    <Command.Group heading="میان‌بر" className="text-[11px] text-faint [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
                      {quickLinks.map((link) => (
                        <Command.Item
                          key={link.href}
                          value={link.href}
                          onSelect={() => go(link.href)}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mute transition-colors data-[selected=true]:bg-ink-3 data-[selected=true]:text-paper"
                        >
                          <link.icon className="size-4 text-faint" />
                          {link.label}
                          <CornerDownLeft className="ms-auto size-3.5 text-faint opacity-0 transition-opacity data-[selected=true]:opacity-100" />
                        </Command.Item>
                      ))}
                    </Command.Group>
                    <Command.Group heading="آخرین نوشته‌ها" className="text-[11px] text-faint [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
                      {posts.map((p) => (
                        <Command.Item
                          key={p.slug}
                          value={`/posts/${p.slug}`}
                          onSelect={() => go(`/posts/${p.slug}`)}
                          className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 text-sm text-mute transition-colors data-[selected=true]:bg-ink-3 data-[selected=true]:text-paper"
                        >
                          <FileText className="size-4 shrink-0 text-ember/70" />
                          <span className="truncate">{p.title}</span>
                        </Command.Item>
                      ))}
                    </Command.Group>
                  </>
                )}

                {results.length > 0 && (
                  <Command.Group heading="نتایج" className="text-[11px] text-faint [&_[cmdk-group-heading]]:px-3 [&_[cmdk-group-heading]]:py-2">
                    {results.map((r, i) => (
                      <Command.Item
                        key={`${r.href}-${i}`}
                        value={`${r.title}-${i}`}
                        onSelect={() => go(r.href)}
                        className="flex cursor-pointer items-center gap-3 rounded-xl px-3 py-2.5 transition-colors data-[selected=true]:bg-ink-3"
                      >
                        <ResultIcon type={r.type} />
                        <span className="min-w-0">
                          <span className="block truncate text-sm text-paper">{r.title}</span>
                          <span className="block truncate text-xs text-faint">{r.subtitle}</span>
                        </span>
                      </Command.Item>
                    ))}
                  </Command.Group>
                )}
              </Command.List>

              <div className="flex items-center justify-between border-t border-line-soft px-4 py-2.5 font-mono text-[10px] text-faint">
                <span dir="ltr">MongoDB regex search · debounced</span>
                <span className="flex items-center gap-1">
                  <kbd className="rounded border border-line bg-ink px-1">↑↓</kbd> حرکت
                  <kbd className="rounded border border-line bg-ink px-1">↵</kbd> انتخاب
                </span>
              </div>
            </Command>
          </div>
        </div>
      )}
    </>
  );
}
