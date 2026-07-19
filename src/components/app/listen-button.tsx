"use client";

import { speakJa } from "@/lib/audio";
import { useMounted } from "@/lib/use-mounted";
import { useSpeechStatus } from "@/lib/use-speech";
import { SpeakerIcon } from "@/components/ui/icons";

export function ListenButton({ text, label = "Listen" }: { text: string; label?: string }) {
  const mounted = useMounted();
  const speech = useSpeechStatus();
  if (!mounted) return null;

  // The browser has no installed voice — show an honest, non-interactive hint
  // rather than a button that produces silence.
  if (speech === "unavailable") {
    return (
      <span
        title="No Japanese speech voice is installed in this browser."
        className="inline-flex items-center gap-2 rounded-full bg-surface-2 px-4 py-2 font-display font-bold text-muted"
      >
        <SpeakerIcon className="size-5" />
        No audio
      </span>
    );
  }

  return (
    <button
      type="button"
      onClick={() => speakJa(text)}
      // icon-only variants (label="") still need an accessible name
      aria-label={label || "Listen"}
      className="inline-flex items-center gap-2 rounded-full bg-info/15 px-4 py-2 font-display font-bold text-info transition hover:bg-info/25"
    >
      <SpeakerIcon className="size-5" />
      {label}
    </button>
  );
}
