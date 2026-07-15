"use client";

import { useSyncExternalStore } from "react";

/**
 * Subscribe to a CSS media query without an effect/setState (SSR-safe).
 * Returns false during SSR + first hydration render, then the real match on
 * the client — so it never causes a hydration divergence. Use for runtime
 * checks in JS logic (e.g. `(pointer: coarse)`, `(prefers-reduced-motion: reduce)`).
 */
export function useMediaQuery(query: string): boolean {
  return useSyncExternalStore(
    (onChange) => {
      if (typeof window === "undefined" || !window.matchMedia) return () => {};
      const mql = window.matchMedia(query);
      mql.addEventListener("change", onChange);
      return () => mql.removeEventListener("change", onChange);
    },
    () => window.matchMedia(query).matches,
    () => false,
  );
}
