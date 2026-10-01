export function Marquee({ items }: { items: string[] }) {
  const doubled = [...items, ...items];
  return (
    <div
      className="relative overflow-hidden border-y border-line/60 bg-ink-2/40 py-4"
      dir="ltr"
      aria-hidden
    >
      <div className="pointer-events-none absolute inset-y-0 -left-px z-10 w-24 bg-gradient-to-r from-ink to-transparent" />
      <div className="pointer-events-none absolute inset-y-0 -right-px z-10 w-24 bg-gradient-to-l from-ink to-transparent" />
      <div className="flex w-max animate-marquee [animation-direction:reverse] gap-10 pe-10 hover:[animation-play-state:paused]">
        {doubled.map((item, i) => (
          <span
            key={`${item}-${i}`}
            className="flex items-center gap-10 whitespace-nowrap font-mono text-sm text-faint transition-colors hover:text-ember"
          >
            {item}
            <span className="size-1.5 rotate-45 bg-ember/50" />
          </span>
        ))}
      </div>
    </div>
  );
}
