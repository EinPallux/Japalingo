"use client";

import { useEffect, useState } from "react";

/**
 * Current epoch ms, refreshed on an interval — so components can compare against
 * SRS due-dates or countdowns without calling `Date.now()` during render (which
 * is impure and would thrash). Returns 0 until the first tick; that tick fires
 * in a pre-paint animation frame, so mounted consumers never visibly flash a
 * wrong "0 due" state before the real counts land.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.requestAnimationFrame(tick);
    const id = window.setInterval(tick, intervalMs);
    return () => {
      window.cancelAnimationFrame(first);
      window.clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}
