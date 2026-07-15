"use client";

import { useEffect, useState } from "react";

/**
 * Current epoch ms, refreshed on an interval — so components can compare against
 * SRS due-dates or countdowns without calling `Date.now()` during render (which
 * is impure and would thrash). Returns 0 until the first post-mount tick (guard
 * with `now > 0`); the initial tick fires on the next macrotask, so no flicker.
 */
export function useNow(intervalMs = 60_000): number {
  const [now, setNow] = useState(0);
  useEffect(() => {
    const tick = () => setNow(Date.now());
    const first = window.setTimeout(tick, 0);
    const id = window.setInterval(tick, intervalMs);
    return () => {
      window.clearTimeout(first);
      window.clearInterval(id);
    };
  }, [intervalMs]);
  return now;
}
