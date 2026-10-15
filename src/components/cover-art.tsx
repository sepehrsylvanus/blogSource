const palettes = ["sage", "clay", "sky", "plum", "sand"] as const;

/** A locally rendered fallback for posts with no uploaded image. */
export function CoverArt({
  slug,
  className = "",
}: {
  slug: string;
  className?: string;
}) {
  const hash = [...slug].reduce(
    (value, letter) => (Math.imul(value, 31) + letter.charCodeAt(0)) >>> 0,
    0,
  );
  const variant = palettes[hash % palettes.length];
  return (
    <div
      aria-hidden="true"
      className={`cover-art cover-art--${variant} ${className}`}
    >
      <span className="cover-art__mark">ح</span>
      <span
        className="absolute bottom-4 left-5 z-10 text-[10px] font-black tracking-[.2em] opacity-55"
        dir="ltr"
      >
        HASHIEH / JOURNAL
      </span>
    </div>
  );
}
