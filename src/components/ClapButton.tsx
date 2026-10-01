"use client";

import { useRef, useState, useTransition } from "react";
import { motion, AnimatePresence } from "motion/react";
import { Heart } from "lucide-react";
import { clapAction } from "@/app/actions";
import { num } from "@/lib/markdown";

type Particle = { id: number; x: number; y: number; hue: number };

export function ClapButton({ slug, initial }: { slug: string; initial: number }) {
  const [count, setCount] = useState(initial);
  const [particles, setParticles] = useState<Particle[]>([]);
  const [mine, setMine] = useState(0);
  const [, startTransition] = useTransition();
  const idRef = useRef(0);
  const lastRef = useRef(0);

  const clap = () => {
    const now = Date.now();
    if (now - lastRef.current < 260) return;
    lastRef.current = now;

    setCount((c) => c + 1);
    setMine((m) => m + 1);

    const burst: Particle[] = Array.from({ length: 7 }, () => ({
      id: ++idRef.current,
      x: (Math.random() - 0.5) * 110,
      y: -30 - Math.random() * 80,
      hue: 12 + Math.random() * 30,
    }));
    setParticles((p) => [...p.slice(-40), ...burst]);
    setTimeout(() => {
      setParticles((p) => p.filter((pp) => !burst.some((b) => b.id === pp.id)));
    }, 900);

    startTransition(async () => {
      try {
        await clapAction(slug);
      } catch {
        setCount((c) => c - 1);
      }
    });
  };

  return (
    <div className="relative inline-block">
      <div className="pointer-events-none absolute inset-0" aria-hidden>
        <AnimatePresence>
          {particles.map((p) => (
            <motion.span
              key={p.id}
              initial={{ opacity: 1, x: 0, y: 0, scale: 0.4 }}
              animate={{ opacity: 0, x: p.x, y: p.y, scale: 1.1 }}
              exit={{ opacity: 0 }}
              transition={{ duration: 0.85, ease: "easeOut" }}
              className="absolute left-1/2 top-1/2 size-2 rounded-full"
              style={{ background: `hsl(${p.hue} 95% 60%)` }}
            />
          ))}
        </AnimatePresence>
      </div>

      <motion.button
        onClick={clap}
        whileTap={{ scale: 0.92 }}
        className="group relative flex items-center gap-3 rounded-2xl border border-ember/40 bg-gradient-to-b from-ember/15 to-ember/5 px-6 py-4 transition-colors hover:border-ember"
        aria-label="تشویق نوشته"
      >
        <motion.span
          key={count}
          initial={{ scale: 1.35 }}
          animate={{ scale: 1 }}
          transition={{ type: "spring", stiffness: 500, damping: 18 }}
          className="text-ember"
        >
          <Heart className="size-6 fill-ember/20 transition-all group-hover:fill-ember/40" />
        </motion.span>
        <span className="text-start">
          <span className="block font-mono text-lg font-bold leading-5 text-paper" dir="ltr">
            {num(count)}
          </span>
          <span className="block text-[11px] text-mute">
            {mine > 0 ? `+${new Intl.NumberFormat("fa-IR").format(mine)} از تو` : "تشویق — هر چند بار که دوست داری"}
          </span>
        </span>
      </motion.button>
    </div>
  );
}
