"use client";

import { useSyncExternalStore } from "react";

const emptySubscribe = () => () => {};

/**
 * Returns false during SSR + first hydration render, true once mounted on the client.
 * Uses useSyncExternalStore (no effect/setState) so it's safe for hydration-sensitive UI
 * like theme toggles and the WebGL hero.
 */
export function useMounted(): boolean {
  return useSyncExternalStore(
    emptySubscribe,
    () => true,
    () => false,
  );
}
