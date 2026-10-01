import Link from "next/link";
import type { Metadata } from "next";
import { FileText, Network } from "lucide-react";
import { getGraph, getPosts } from "@/lib/data";
import { GraphCanvas } from "@/components/GraphCanvas";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "گراف دانش",
  description: "نقشه‌ی زنده‌ی نوشته‌ها و تگ‌های وبلاگ — هر گره یک نوشته، هر یال یک پیوند.",
};

export default async function GraphPage() {
  const [graph, posts] = await Promise.all([getGraph(), getPosts({ limit: 50 })]);

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <p className="flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-faint" dir="ltr">
          <Network className="size-3.5 text-ember" />
          KNOWLEDGE GRAPH — {graph.nodes.length} NODES / {graph.edges.length} EDGES
        </p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">گراف دانش</h1>
        <p className="mt-5 max-w-2xl leading-8 text-mute">
          وبلاگ‌ها معمولاً لیستی از فایل‌ها هستند؛ ولی دانش، لیست نیست — <b className="text-paper">شبکه</b> است.
          این نقشه نشان می‌دهد کدام نوشته‌ها به هم ارجاع داده‌اند و کدام تگ‌ها قطب‌های اصلی‌اند.
          گره‌های نارنجی نوشته‌اند؛ رویشان کلیک کن تا باز شوند.
        </p>
      </Reveal>

      <Reveal delay={0.12} className="mt-10">
        <GraphCanvas nodes={graph.nodes} edges={graph.edges} />
      </Reveal>

      <div className="mt-10 grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
        {posts.map((p, i) => (
          <Reveal key={p.slug} delay={(i % 4) * 0.05}>
            <Link
              href={`/posts/${p.slug}`}
              className="group flex items-start gap-3 rounded-2xl border border-line bg-ink-2 p-4 transition-colors hover:border-ember/40"
            >
              <span className="mt-0.5 grid size-7 shrink-0 place-items-center rounded-lg bg-ember/10 text-ember">
                <FileText className="size-3.5" />
              </span>
              <span>
                <span className="block text-sm font-bold leading-6 text-paper group-hover:text-ember-2">
                  {p.title}
                </span>
                <span className="mt-1 block font-mono text-[10px] text-faint" dir="ltr">
                  {p.tags.map((t) => `#${t}`).join(" ")}
                </span>
              </span>
            </Link>
          </Reveal>
        ))}
      </div>
    </div>
  );
}
