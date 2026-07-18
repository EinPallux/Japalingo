"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { useMediaQuery } from "@/lib/use-media-query";

/** Token-colored confetti palette — CSS vars so it follows the theme. */
const COLORS = [
  "var(--jl-primary)",
  "var(--jl-secondary)",
  "var(--jl-accent)",
  "var(--jl-success)",
  "var(--jl-info)",
];

type Piece = {
  x: number; // start X (vw %)
  drift: number; // horizontal drift (px)
  delay: number;
  duration: number;
  size: number;
  color: string;
  round: boolean;
  spin: number;
};

/**
 * A one-shot celebratory confetti burst (results screens, big wins). Pieces are
 * plain divs animated with Framer Motion — no canvas, no external lib. Skipped
 * entirely for prefers-reduced-motion users (a static shower would just be
 * visual noise), and pointer-events-none so it never blocks the CTA underneath.
 */
export function Confetti({ pieces = 26 }: { pieces?: number }) {
  const reduce = useMediaQuery("(prefers-reduced-motion: reduce)");

  // Lazy state init: the random layout is rolled exactly once per mount
  // (same pattern the games use for their random first round).
  const [parts] = useState<Piece[]>(() =>
    Array.from({ length: pieces }, (_, i) => ({
      x: 4 + Math.random() * 92,
      drift: (Math.random() - 0.5) * 140,
      delay: Math.random() * 0.5,
      duration: 2.1 + Math.random() * 1.4,
      size: 7 + Math.random() * 7,
      color: COLORS[i % COLORS.length]!,
      round: Math.random() > 0.5,
      spin: (Math.random() - 0.5) * 720,
    })),
  );

  if (reduce) return null;

  return (
    <div aria-hidden className="pointer-events-none fixed inset-0 z-50 overflow-hidden">
      {parts.map((p, i) => (
        <motion.div
          key={i}
          initial={{ x: 0, y: -30, opacity: 1, rotate: 0 }}
          animate={{ y: "105vh", x: p.drift, rotate: p.spin, opacity: [1, 1, 0.9, 0] }}
          transition={{ duration: p.duration, delay: p.delay, ease: [0.15, 0.4, 0.6, 1] }}
          style={{
            position: "absolute",
            top: 0,
            left: `${p.x}%`,
            width: p.size,
            height: p.round ? p.size : p.size * 1.7,
            borderRadius: p.round ? "50%" : 3,
            backgroundColor: p.color,
          }}
        />
      ))}
    </div>
  );
}
