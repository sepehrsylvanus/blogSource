import type { Metadata } from "next";
import { ExternalLink, FolderGit2, Radar, Wrench } from "lucide-react";
import { getProjects, getTechUsage } from "@/lib/data";
import { RadarChart, RingLegend } from "@/components/RadarChart";
import { Reveal } from "@/components/Reveal";

export const dynamic = "force-dynamic";

export const metadata: Metadata = {
  title: "رادار تکنولوژی",
  description: "همه‌ی تکنولوژی‌هایی که در پروژه‌هایم استفاده کرده‌ام — تجمیع‌شده از روی دیتابیس، با وضعیت adopt / trial / assess / hold.",
};

export default async function StackPage() {
  const [techs, projects] = await Promise.all([getTechUsage(), getProjects()]);
  const used = techs.filter((t) => t.projectCount > 0 || t.postCount > 0 || t.ring !== "hold");

  return (
    <div className="mx-auto max-w-6xl px-5 py-14">
      <Reveal>
        <p className="flex items-center gap-2 font-mono text-xs tracking-[0.25em] text-faint" dir="ltr">
          <Radar className="size-3.5 text-ember" />
          TECH RADAR — AGGREGATED LIVE FROM POSTGRES
        </p>
        <h1 className="mt-4 text-4xl font-black sm:text-5xl">رادار تکنولوژی</h1>
        <p className="mt-5 max-w-2xl leading-8 text-mute">
          سؤال «تو دقیقاً با چه تکنولوژی‌هایی کار کردی؟» دیگر یک جواب کلیشه‌ای ندارد.
          این رادار با یک <b className="text-paper">aggregation زنده</b> از روی همه‌ی پروژه‌ها و نوشته‌ها ساخته می‌شود؛
          هر نقطه یک تکنولوژی است و فاصله‌اش از مرکز، میزان اعتمادم بهش را نشان می‌دهد.
        </p>
      </Reveal>

      <Reveal delay={0.1} className="mt-10">
        <div className="rounded-3xl border border-line bg-ink-2/50 p-4 sm:p-8">
          <RadarChart items={techs} />
        </div>
      </Reveal>

      <Reveal delay={0.15} className="mt-8">
        <RingLegend />
      </Reveal>

      {/* usage bars */}
      <section className="mt-20">
        <Reveal>
          <h2 className="flex items-center gap-2.5 text-2xl font-black sm:text-3xl">
            <Wrench className="size-6 text-ember" />
            تکنولوژی‌ها در عمل
          </h2>
          <p className="mt-3 max-w-xl text-sm leading-7 text-mute">
            مرتب‌شده بر اساس تعداد پروژه‌هایی که از هر تکنولوژی استفاده کرده‌اند.
          </p>
        </Reveal>
        <div className="mt-8 overflow-hidden rounded-3xl border border-line">
          {used.map((t, i) => {
            const max = Math.max(...used.map((u) => u.projectCount), 1);
            return (
              <Reveal key={t.name} delay={Math.min(i, 10) * 0.04}>
                <div className="group grid grid-cols-[1fr_auto] items-center gap-4 border-b border-line-soft bg-ink-2 px-5 py-4 transition-colors last:border-b-0 hover:bg-ink-3 sm:grid-cols-[220px_1fr_auto]">
                  <div className="flex items-center gap-3">
                    <span className="font-mono text-sm font-bold text-paper" dir="ltr">{t.name}</span>
                  </div>
                  <div className="hidden items-center gap-3 sm:flex">
                    <div className="h-1.5 flex-1 overflow-hidden rounded-full bg-ink">
                      <div
                        className="h-full rounded-full bg-gradient-to-l from-ember to-ember-2 transition-all duration-700"
                        style={{ width: `${Math.max(6, (t.projectCount / max) * 100)}%` }}
                      />
                    </div>
                    <span className="flex gap-1">
                      {t.years.map((y) => (
                        <span key={y} className="rounded bg-ink px-1.5 py-0.5 font-mono text-[9px] text-faint" dir="ltr">{y}</span>
                      ))}
                    </span>
                  </div>
                  <div className="flex items-center gap-4 font-mono text-[11px] text-faint">
                    <span><b className="text-ember-2">{t.projectCount}</b> پروژه</span>
                    <span className="hidden sm:inline"><b className="text-mint">{t.postCount}</b> اشاره</span>
                  </div>
                </div>
              </Reveal>
            );
          })}
        </div>
      </section>

      {/* projects */}
      <section className="mt-20">
        <Reveal>
          <h2 className="flex items-center gap-2.5 text-2xl font-black sm:text-3xl">
            <FolderGit2 className="size-6 text-ember" />
            پروژه‌های کانال
          </h2>
        </Reveal>
        <div className="mt-8 grid gap-5 md:grid-cols-2">
          {projects.map((p, i) => (
            <Reveal key={p.id} delay={(i % 2) * 0.08}>
              <div className="group flex h-full flex-col rounded-3xl border border-line bg-ink-2 p-6 transition-all hover:border-ember/40">
                <div className="flex items-start justify-between gap-3">
                  <h3 className="font-mono text-lg font-bold text-paper" dir="ltr">{p.name}</h3>
                  <span className="shrink-0 rounded-lg bg-ink-3 px-2.5 py-1 font-mono text-[10px] text-ember-2" dir="ltr">
                    {p.year}
                  </span>
                </div>
                <p className="mt-3 text-sm leading-7 text-mute">{p.tagline}</p>
                <p className="mt-2 border-s-2 border-ember ps-3 text-xs leading-6 text-faint">{p.highlight}</p>
                <div className="mt-4 flex flex-wrap gap-1.5 pt-2">
                  {p.tech.map((t) => (
                    <span key={t} className="rounded-md bg-ink-3 px-2 py-1 font-mono text-[10px] text-mute" dir="ltr">
                      {t}
                    </span>
                  ))}
                </div>
                {p.url && (
                  <a
                    href={p.url}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="mt-5 inline-flex items-center gap-1.5 text-xs font-semibold text-ember opacity-0 transition-opacity group-hover:opacity-100"
                  >
                    دیدن ویدیوی ساختش در کانال
                    <ExternalLink className="size-3.5" />
                  </a>
                )}
              </div>
            </Reveal>
          ))}
        </div>
      </section>
    </div>
  );
}
