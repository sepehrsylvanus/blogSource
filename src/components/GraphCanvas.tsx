"use client";

import { useCallback, useEffect, useRef, useState } from "react";
import { useRouter } from "next/navigation";
import type { GraphEdge, GraphNode } from "@/lib/types";

type SimNode = GraphNode & { x: number; y: number; vx: number; vy: number };

const EMBER = "#ff5a36";
const EMBER2 = "#ffb26b";
const MUTE = "#5a5a6c";
const LINE = "rgba(140,140,170,0.16)";

/**
 * Force-directed knowledge graph on <canvas>.
 * Custom physics: coulomb-ish repulsion + spring edges + center gravity.
 * No d3 — every force is hand-tuned.
 */
export function GraphCanvas({ nodes, edges }: { nodes: GraphNode[]; edges: GraphEdge[] }) {
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const router = useRouter();
  const [hovered, setHovered] = useState<string | null>(null);
  const stateRef = useRef<{
    nodes: SimNode[];
    hovered: string | null;
    dragging: string | null;
    mouse: { x: number; y: number };
  }>({ nodes: [], hovered: null, dragging: null, mouse: { x: -9999, y: -9999 } });

  const radiusOf = useCallback((n: GraphNode) => {
    if (n.kind === "tag") return 7 + Math.min(12, n.weight * 2.5);
    return 11 + Math.min(18, n.weight * 3);
  }, []);

  useEffect(() => {
    const canvas = canvasRef.current;
    if (!canvas) return;
    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const sim = stateRef.current;
    // deterministic-ish init on a circle
    sim.nodes = nodes.map((n, i) => ({
      ...n,
      x: Math.cos((i / nodes.length) * Math.PI * 2) * 180 + (Math.random() - 0.5) * 60,
      y: Math.sin((i / nodes.length) * Math.PI * 2) * 180 + (Math.random() - 0.5) * 60,
      vx: 0,
      vy: 0,
    }));
    const byId = new Map(sim.nodes.map((n) => [n.id, n]));
    const adjacency = new Map<string, Set<string>>();
    for (const e of edges) {
      adjacency.set(e.source, new Set([...(adjacency.get(e.source) ?? []), e.target]));
      adjacency.set(e.target, new Set([...(adjacency.get(e.target) ?? []), e.source]));
    }

    let raf = 0;
    let w = 0;
    let h = 0;
    let dpr = 1;

    const resize = () => {
      const rect = canvas.getBoundingClientRect();
      dpr = Math.min(2, window.devicePixelRatio || 1);
      w = rect.width;
      h = rect.height;
      canvas.width = w * dpr;
      canvas.height = h * dpr;
    };
    resize();
    const ro = new ResizeObserver(resize);
    ro.observe(canvas);

    const tick = () => {
      const list = sim.nodes;
      const cx = 0;
      const cy = 0;

      // repulsion
      for (let i = 0; i < list.length; i++) {
        for (let j = i + 1; j < list.length; j++) {
          const a = list[i];
          const b = list[j];
          let dx = a.x - b.x;
          let dy = a.y - b.y;
          let d2 = dx * dx + dy * dy;
          if (d2 < 1) {
            dx = Math.random() - 0.5;
            dy = Math.random() - 0.5;
            d2 = 1;
          }
          const d = Math.sqrt(d2);
          const min = radiusOf(a) + radiusOf(b) + 26;
          const force = (min * min * 6) / d2 / d;
          const fx = (dx / d) * force;
          const fy = (dy / d) * force;
          a.vx += fx;
          a.vy += fy;
          b.vx -= fx;
          b.vy -= fy;
        }
      }

      // springs
      for (const e of edges) {
        const a = byId.get(e.source);
        const b = byId.get(e.target);
        if (!a || !b) continue;
        const dx = b.x - a.x;
        const dy = b.y - a.y;
        const d = Math.max(1, Math.hypot(dx, dy));
        const rest = 90;
        const f = (d - rest) * 0.012;
        const fx = (dx / d) * f;
        const fy = (dy / d) * f;
        a.vx += fx;
        a.vy += fy;
        b.vx -= fx;
        b.vy -= fy;
      }

      // gravity + integrate
      for (const n of list) {
        n.vx += (cx - n.x) * 0.004;
        n.vy += (cy - n.y) * 0.004;
        if (sim.dragging === n.id) {
          n.vx = (sim.mouse.x - n.x) * 0.3;
          n.vy = (sim.mouse.y - n.y) * 0.3;
        }
        n.vx *= 0.86;
        n.vy *= 0.86;
        n.x += n.vx;
        n.y += n.vy;
      }

      // draw
      ctx.setTransform(dpr, 0, 0, dpr, 0, 0);
      ctx.clearRect(0, 0, w, h);
      ctx.translate(w / 2, h / 2);

      const hoveredId = sim.hovered;
      const neighbors = hoveredId ? (adjacency.get(hoveredId) ?? new Set<string>()) : new Set<string>();

      // edges
      for (const e of edges) {
        const a = byId.get(e.source);
        const b = byId.get(e.target);
        if (!a || !b) continue;
        const hot =
          hoveredId &&
          (e.source === hoveredId ||
            e.target === hoveredId ||
            (neighbors.has(e.source) && e.target === hoveredId));
        ctx.beginPath();
        ctx.moveTo(a.x, a.y);
        ctx.lineTo(b.x, b.y);
        ctx.strokeStyle = hot ? "rgba(255,90,54,0.55)" : LINE;
        ctx.lineWidth = hot ? 1.6 : 1;
        ctx.stroke();
      }

      // nodes
      const font = '12px var(--font-mono), monospace';
      for (const n of list) {
        const r = radiusOf(n);
        const isHovered = hoveredId === n.id;
        const isNeighbor = neighbors.has(n.id);
        const dim = hoveredId && !isHovered && !isNeighbor;

        ctx.globalAlpha = dim ? 0.25 : 1;
        ctx.beginPath();
        ctx.arc(n.x, n.y, isHovered ? r + 3 : r, 0, Math.PI * 2);
        if (n.kind === "tag") {
          ctx.fillStyle = isHovered || isNeighbor ? EMBER2 : "#232330";
          ctx.fill();
          ctx.strokeStyle = isHovered ? EMBER2 : "rgba(255,178,107,0.4)";
          ctx.lineWidth = 1;
          ctx.stroke();
        } else {
          const grad = ctx.createRadialGradient(n.x - r / 3, n.y - r / 3, 0, n.x, n.y, r * 1.2);
          grad.addColorStop(0, isHovered ? "#ffffff" : EMBER2);
          grad.addColorStop(1, EMBER);
          ctx.fillStyle = grad;
          ctx.fill();
          if (isHovered) {
            ctx.beginPath();
            ctx.arc(n.x, n.y, r + 8, 0, Math.PI * 2);
            ctx.strokeStyle = "rgba(255,90,54,0.35)";
            ctx.lineWidth = 5;
            ctx.stroke();
          }
        }

        if (isHovered || (n.kind === "post" && n.weight >= 4) || isNeighbor) {
          ctx.font = font;
          ctx.fillStyle = n.kind === "tag" ? EMBER2 : "#ededf0";
          ctx.textAlign = "center";
          const label = n.kind === "tag" ? `#${n.label}` : n.label;
          const short = label.length > 30 ? `${label.slice(0, 30)}…` : label;
          ctx.fillText(short, n.x, n.y - r - 10);
        }
        ctx.globalAlpha = 1;
      }

      raf = requestAnimationFrame(tick);
    };
    raf = requestAnimationFrame(tick);

    const unproject = (clientX: number, clientY: number) => {
      const rect = canvas.getBoundingClientRect();
      return { x: clientX - rect.left - rect.width / 2, y: clientY - rect.top - rect.height / 2 };
    };
    const pick = (x: number, y: number): SimNode | null => {
      for (const n of sim.nodes) {
        if (Math.hypot(n.x - x, n.y - y) < radiusOf(n) + 6) return n;
      }
      return null;
    };

    const onMove = (e: PointerEvent) => {
      const p = unproject(e.clientX, e.clientY);
      sim.mouse = p;
      if (sim.dragging) return;
      const hit = pick(p.x, p.y);
      sim.hovered = hit?.id ?? null;
      setHovered(hit?.id ?? null);
      canvas.style.cursor = hit ? (hit.kind === "post" ? "pointer" : "grab") : "default";
    };
    const onDown = (e: PointerEvent) => {
      const p = unproject(e.clientX, e.clientY);
      const hit = pick(p.x, p.y);
      if (hit) {
        sim.dragging = hit.id;
        canvas.setPointerCapture(e.pointerId);
      }
    };
    const onUp = () => {
      const id = sim.dragging;
      sim.dragging = null;
      if (!id) return;
      const n = byId.get(id);
      if (!n) return;
      const dist = Math.hypot(sim.mouse.x - n.x, sim.mouse.y - n.y);
      // small displacement counts as click on posts
      if (n.kind === "post" && n.href && dist < 140) router.push(n.href);
    };
    const onLeave = () => {
      sim.hovered = null;
      setHovered(null);
    };

    canvas.addEventListener("pointermove", onMove);
    canvas.addEventListener("pointerdown", onDown);
    canvas.addEventListener("pointerup", onUp);
    canvas.addEventListener("pointerleave", onLeave);

    return () => {
      cancelAnimationFrame(raf);
      ro.disconnect();
      canvas.removeEventListener("pointermove", onMove);
      canvas.removeEventListener("pointerdown", onDown);
      canvas.removeEventListener("pointerup", onUp);
      canvas.removeEventListener("pointerleave", onLeave);
    };
  }, [nodes, edges, radiusOf, router]);

  return (
    <div className="relative">
      <canvas
        ref={canvasRef}
        className="h-[68vh] min-h-[420px] w-full touch-none rounded-3xl border border-line bg-ink-2/50"
        aria-label="گراف تعاملی دانش"
        role="img"
      />
      <div className="pointer-events-none absolute bottom-4 start-4 flex flex-wrap items-center gap-4 rounded-xl border border-line bg-ink/80 px-4 py-2.5 font-mono text-[11px] text-faint backdrop-blur">
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full bg-ember" /> نوشته
        </span>
        <span className="flex items-center gap-2">
          <span className="size-2.5 rounded-full border border-ember-2/60 bg-ink-3" /> تگ
        </span>
        <span className="hidden sm:inline">بکش و رها کن — روی نوشته کلیک کن تا باز شود</span>
      </div>
      {hovered && (
        <div className="pointer-events-none absolute end-4 top-4 rounded-lg bg-ink/80 px-3 py-1.5 font-mono text-[10px] text-mute backdrop-blur">
          {stateRef.current.nodes.find((n) => n.id === hovered)?.label}
        </div>
      )}
    </div>
  );
}
