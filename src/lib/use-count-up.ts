"use client";

import { useEffect, useRef, useState } from "react";

/**
 * Animate a number from 0 to `target` (ease-out) — for XP counters on results
 * screens. Jumps straight to the target for prefers-reduced-motion users. All
 * state writes happen inside the rAF callback (never the effect body).
 */
export function useCountUp(target: number, durationMs = 900): number {
  const [value, setValue] = useState(0);
  const rafRef = useRef(0);

  useEffect(() => {
    const reduce = window.matchMedia("(prefers-reduced-motion: reduce)").matches;
    const start = performance.now();
    const tick = (now: number) => {
      if (target <= 0) {
        setValue(0);
        return;
      }
      if (reduce) {
        setValue(target);
        return;
      }
      const t = Math.min(1, (now - start) / durationMs);
      const eased = 1 - Math.pow(1 - t, 3);
      setValue(Math.round(eased * target));
      if (t < 1) rafRef.current = requestAnimationFrame(tick);
    };
    rafRef.current = requestAnimationFrame(tick);
    return () => cancelAnimationFrame(rafRef.current);
  }, [target, durationMs]);

  return value;
}
