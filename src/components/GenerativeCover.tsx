import { useMemo } from "react";

/** Deterministic 32-bit hash — same slug, same art, every render. */
function hashOf(input: string): number {
  let h = 2166136261;
  for (let i = 0; i < input.length; i++) {
    h ^= input.charCodeAt(i);
    h = Math.imul(h, 16777619);
  }
  return h >>> 0;
}

const PALETTES: [string, string, string][] = [
  ["#ff5a36", "#ffb26b", "#2a0d05"],
  ["#7c6bff", "#c0b6ff", "#12081f"],
  ["#19c37d", "#9ff0c9", "#04180f"],
  ["#f5c518", "#ffe38f", "#1c1202"],
  ["#3d9bff", "#a5d8ff", "#031322"],
  ["#ff4d8d", "#ffb0cf", "#1f0512"],
];

/**
 * Generative cover art — deterministic per slug. No stock photos,
 * no AI images; just SVG physics: blurred blobs, a grid and one giant glyph.
 */
export function GenerativeCover({
  seed,
  glyph,
  className,
}: {
  seed: string;
  glyph: string;
  className?: string;
}) {
  const art = useMemo(() => {
    const h = hashOf(seed);
    const palette = PALETTES[h % PALETTES.length];
    const blob = (i: number) => {
      const x = 200 + ((h >> (i * 3)) % 800);
      const y = 120 + ((h >> (i * 5)) % 400);
      const r = 140 + ((h >> (i * 7)) % 220);
      return { x, y, r };
    };
    const rotate = (h % 60) - 30;
    const gridOpacity = 0.05 + (h % 10) / 300;
    return { palette, blobs: [blob(1), blob(2), blob(3)], rotate, gridOpacity, uid: h.toString(36) };
  }, [seed]);

  return (
    <svg
      viewBox="0 0 1200 630"
      preserveAspectRatio="xMidYMid slice"
      className={className}
      aria-hidden
      role="presentation"
    >
      <defs>
        <radialGradient id={`glow-${art.uid}`} cx="50%" cy="50%" r="50%">
          <stop offset="0%" stopColor={art.palette[0]} stopOpacity="0.9" />
          <stop offset="100%" stopColor={art.palette[0]} stopOpacity="0" />
        </radialGradient>
        <pattern id={`grid-${art.uid}`} width="48" height="48" patternUnits="userSpaceOnUse">
          <path
            d="M 48 0 L 0 0 0 48"
            fill="none"
            stroke={art.palette[1]}
            strokeOpacity={art.gridOpacity}
            strokeWidth="1"
          />
        </pattern>
      </defs>

      <rect width="1200" height="630" fill={art.palette[2]} />
      <rect width="1200" height="630" fill={`url(#grid-${art.uid})`} />
      {art.blobs.map((b, i) => (
        <circle key={i} cx={b.x} cy={b.y} r={b.r} fill={`url(#glow-${art.uid})`} opacity={0.5 - i * 0.09} />
      ))}
      <text
        x="600"
        y="400"
        textAnchor="middle"
        fontSize="380"
        fontWeight="900"
        fill="none"
        stroke={art.palette[1]}
        strokeOpacity="0.35"
        strokeWidth="2"
        transform={`rotate(${art.rotate} 600 315)`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {glyph}
      </text>
      <text
        x="600"
        y="408"
        textAnchor="middle"
        fontSize="380"
        fontWeight="900"
        fill={art.palette[0]}
        fillOpacity="0.12"
        transform={`rotate(${art.rotate} 600 315)`}
        style={{ fontFamily: "var(--font-mono)" }}
      >
        {glyph}
      </text>
    </svg>
  );
}
