"use client";

import { useState } from "react";
import { motion } from "motion/react";
import type { TechCategory, TechRing, TechUsage } from "@/lib/types";

const SIZE = 640;
const C = SIZE / 2;
const RING_LABEL: Record<TechRing, string> = {
  adopt: "خانه‌ی اصلی",
  trial: "در حال آزمایش",
  assess: "زیر نظر",
  hold: "بایگانی",
};
const RING_RADIUS: Record<TechRing, number> = {
  adopt: 95,
  trial: 165,
  assess: 230,
  hold: 288,
};
const RING_DESC: Record<TechRing, string> = {
  adopt: "در هر پروژه استفاده‌شان می‌کنم",
  trial: "جدی دارم تست‌شان می‌کنم",
  assess: "نظارت می‌کنم؛ هنوز قاطع نیستم",
  hold: "از چرخه خارج شده‌اند",
};

export const CATEGORY_LABEL: Record<TechCategory, string> = {
  framework: "فریم‌ورک و زبان",
  data: "داده و بک‌اند",
  style: "استایل و موشن",
  tool: "ابزار و زیرساخت",
};

const CATEGORY_COLOR: Record<TechCategory, string> = {
  framework: "#ff5a36",
  data: "#82aaff",
  style: "#ffb26b",
  tool: "#6ee7b7",
};

/** Golden-angle scatter inside each ring × quadrant cell — deterministic. */
function positionOf(item: TechUsage, indexInCell: number, totalInCell: number) {
  const catIndex = (["framework", "data", "style", "tool"] as TechCategory[]).indexOf(item.category);
  const baseAngle = (catIndex * Math.PI) / 2 - Math.PI / 2; // quadrant start
  const spread = Math.PI / 2 - 0.5;
  const angle = baseAngle + 0.25 + (totalInCell === 1 ? spread / 2 : (indexInCell / (totalInCell - 1)) * spread);
  const jitter = ((indexInCell * 37) % 13) / 13 - 0.5;
  const r = RING_RADIUS[item.ring] + jitter * 18;
  return { x: C + Math.cos(angle) * r, y: C + Math.sin(angle) * r };
}

export function RadarChart({ items }: { items: TechUsage[] }) {
  const [hover, setHover] = useState<TechUsage | null>(null);

  const cells = new Map<string, TechUsage[]>();
  for (const item of items) {
    const key = `${item.category}-${item.ring}`;
    cells.set(key, [...(cells.get(key) ?? []), item]);
  }
  const placed = items.map((item) => {
    const cell = cells.get(`${item.category}-${item.ring}`)!;
    return { item, ...positionOf(item, cell.indexOf(item), cell.length) };
  });

  return (
    <div className="relative mx-auto max-w-[640px]">
      <svg viewBox={`0 0 ${SIZE} ${SIZE}`} className="w-full" role="img" aria-label="رادار تکنولوژی">
        {/* rings */}
        {(Object.keys(RING_RADIUS) as TechRing[]).map((ring) => (
          <circle
            key={ring}
            cx={C}
            cy={C}
            r={RING_RADIUS[ring]}
            fill="none"
            stroke="var(--color-line)"
            strokeDasharray={ring === "hold" ? "3 6" : undefined}
            strokeWidth="1"
          />
        ))}
        {/* quadrant dividers */}
        {[0, 1, 2, 3].map((i) => {
          const a = (i * Math.PI) / 2;
          return (
            <line
              key={i}
              x1={C + Math.cos(a) * 40}
              y1={C + Math.sin(a) * 40}
              x2={C + Math.cos(a) * 300}
              y2={C + Math.sin(a) * 300}
              stroke="var(--color-line-soft)"
              strokeWidth="1"
            />
          );
        })}
        {/* quadrant labels */}
        {(["framework", "data", "style", "tool"] as TechCategory[]).map((cat, i) => {
          const a = (i * Math.PI) / 2 - Math.PI / 2 + Math.PI / 4;
          const x = C + Math.cos(a) * 322;
          const y = C + Math.sin(a) * 322;
          return (
            <text
              key={cat}
              x={x}
              y={y}
              textAnchor="middle"
              fill={CATEGORY_COLOR[cat]}
              fontSize="12"
              fontFamily="var(--font-mono)"
              fontWeight="700"
            >
              {CATEGORY_LABEL[cat]}
            </text>
          );
        })}
        {/* ring labels */}
        {(Object.keys(RING_RADIUS) as TechRing[]).map((ring) => (
          <text
            key={ring}
            x={C + 6}
            y={C - RING_RADIUS[ring] + 14}
            fill="var(--color-faint)"
            fontSize="10"
            fontFamily="var(--font-mono)"
          >
            {RING_LABEL[ring]}
          </text>
        ))}
        {/* dots */}
        {placed.map(({ item, x, y }, i) => (
          <motion.g
            key={item.name}
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.15 + i * 0.035, type: "spring", stiffness: 300, damping: 20 }}
            style={{ transformOrigin: `${x}px ${y}px` }}
            onMouseEnter={() => setHover(item)}
            onMouseLeave={() => setHover(null)}
            className="cursor-pointer"
          >
            <circle cx={x} cy={y} r="16" fill="transparent" />
            <circle
              cx={x}
              cy={y}
              r={item.ring === "adopt" ? 6.5 : 5}
              fill={CATEGORY_COLOR[item.category]}
              opacity={hover === item ? 1 : 0.85}
              style={{ filter: hover === item ? `drop-shadow(0 0 10px ${CATEGORY_COLOR[item.category]})` : undefined }}
            />
            {(item.projectCount >= 2 || hover === item) && (
              <text
                x={x}
                y={y - 11}
                textAnchor="middle"
                fill={hover === item ? "var(--color-paper)" : "var(--color-mute)"}
                fontSize="10.5"
                fontWeight={hover === item ? 700 : 400}
                fontFamily="var(--font-mono)"
                style={{ pointerEvents: "none" }}
              >
                {item.name}
              </text>
            )}
          </motion.g>
        ))}
      </svg>

      {/* hover tooltip */}
      <div
        aria-live="polite"
        className={`pointer-events-none absolute bottom-2 start-1/2 z-10 w-64 -translate-x-1/2 rtl:translate-x-1/2 rounded-xl border border-line bg-ink/95 p-4 backdrop-blur transition-opacity duration-200 ${hover ? "opacity-100" : "opacity-0"}`}
      >
        {hover && (
          <>
            <p className="flex items-center justify-between font-mono text-sm font-bold text-paper" dir="ltr">
              {hover.name}
              <span
                className="rounded-md px-1.5 py-0.5 text-[9px]"
                style={{ background: `${CATEGORY_COLOR[hover.category]}22`, color: CATEGORY_COLOR[hover.category] }}
              >
                {RING_LABEL[hover.ring]}
              </span>
            </p>
            <p className="mt-2 text-xs leading-6 text-mute">{hover.note || CATEGORY_LABEL[hover.category]}</p>
            <p className="mt-2 font-mono text-[10px] text-faint">
              {hover.projectCount} پروژه · {hover.postCount} اشاره در نوشته‌ها
              {hover.years.length > 0 && ` · ${hover.years.join("، ")}`}
            </p>
          </>
        )}
      </div>
    </div>
  );
}

export function RingLegend() {
  return (
    <dl className="grid gap-3 sm:grid-cols-2 lg:grid-cols-4">
      {(Object.keys(RING_LABEL) as TechRing[]).map((ring) => (
        <div key={ring} className="rounded-2xl border border-line bg-ink-2 p-4">
          <dt className="font-mono text-xs font-bold text-ember-2" dir="ltr">
            {ring.toUpperCase()}
            <span className="ms-2 text-paper">{RING_LABEL[ring]}</span>
          </dt>
          <dd className="mt-1.5 text-xs leading-6 text-mute">{RING_DESC[ring]}</dd>
        </div>
      ))}
    </dl>
  );
}
