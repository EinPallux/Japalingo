"use client";

import { useEffect, useState } from "react";
import { ensureSpeech, type SpeechStatus } from "./audio";

/**
 * Resolves whether spoken audio actually works in this browser. Starts as
 * "checking", then settles to "ready" or "unavailable" once the voice list
 * loads — so audio-dependent UI can show an honest fallback instead of failing
 * silently. The setState happens in an async callback (not synchronously in the
 * effect), which keeps it hydration- and lint-safe.
 */
export function useSpeechStatus(): "checking" | SpeechStatus {
  const [status, setStatus] = useState<"checking" | SpeechStatus>("checking");
  useEffect(() => {
    let alive = true;
    ensureSpeech().then((s) => {
      if (alive) setStatus(s);
    });
    return () => {
      alive = false;
    };
  }, []);
  return status;
}
