import { Flame } from "lucide-react";

const DAY = 86_400_000;
const WEEKS = 26;

/** GitHub-style publishing rhythm — RTL: newest week at the far left. */
export function Heatmap({ activity }: { activity: { date: string; count: number }[] }) {
  const map = new Map(activity.map((a) => [a.date, a.count]));
  const today = new Date();
  today.setHours(0, 0, 0, 0);

  // Build weeks ending today
  const weeks: { date: Date; count: number }[][] = [];
  const start = new Date(today.getTime() - (WEEKS * 7 - 1) * DAY);
  // align start to Saturday (first day of Persian week)
  const dow = (start.getDay() + 1) % 7; // 0 = Saturday
  start.setTime(start.getTime() - dow * DAY);

  const cursor = new Date(start);
  while (cursor <= today) {
    const week: { date: Date; count: number }[] = [];
    for (let d = 0; d < 7; d++) {
      const key = cursor.toISOString().slice(0, 10);
      week.push({ date: new Date(cursor), count: map.get(key) ?? 0 });
      cursor.setTime(cursor.getTime() + DAY);
    }
    weeks.push(week);
  }

  const total = activity.reduce((s, a) => s + a.count, 0);

  return (
    <div className="rounded-2xl border border-line bg-ink-2 p-5 sm:p-6">
      <div className="mb-5 flex flex-wrap items-center justify-between gap-2">
        <p className="flex items-center gap-2 font-mono text-[11px] font-bold tracking-widest text-faint">
          <Flame className="size-3.5 text-ember" />
          ریتم نوشتن — ۲۶ هفته‌ی اخیر
        </p>
        <p className="font-mono text-[11px] text-faint">
          <span className="text-ember-2" dir="ltr">{total}</span> انتشار در این بازه
        </p>
      </div>

      <div className="flex flex-row-reverse justify-end gap-[3px] overflow-x-auto pb-1" role="img" aria-label="هیت‌مپ انتشار نوشته‌ها">
        {weeks.map((week, wi) => (
          <div key={wi} className="flex flex-col gap-[3px]">
            {week.map((cell) => {
              const future = cell.date > today;
              const level = future ? 0 : Math.min(4, cell.count);
              return (
                <span
                  key={cell.date.toISOString()}
                  title={`${new Intl.DateTimeFormat("fa-IR", { dateStyle: "medium" }).format(cell.date)} — ${cell.count} انتشار`}
                  className="size-[11px] rounded-[3px] transition-transform hover:scale-125"
                  style={{
                    background: future
                      ? "transparent"
                      : level === 0
                        ? "var(--color-ink-3)"
                        : `color-mix(in srgb, var(--color-ember) ${22 + level * 22}%, var(--color-ink-3))`,
                    boxShadow: level > 2 ? "0 0 8px rgba(255,90,54,0.35)" : undefined,
                  }}
                />
              );
            })}
          </div>
        ))}
      </div>

      <div className="mt-4 flex items-center justify-end gap-1.5 font-mono text-[10px] text-faint">
        کمتر
        {[0, 1, 2, 3, 4].map((l) => (
          <span
            key={l}
            className="size-[11px] rounded-[3px]"
            style={{
              background:
                l === 0
                  ? "var(--color-ink-3)"
                  : `color-mix(in srgb, var(--color-ember) ${22 + l * 22}%, var(--color-ink-3))`,
            }}
          />
        ))}
        بیشتر
      </div>
    </div>
  );
}
