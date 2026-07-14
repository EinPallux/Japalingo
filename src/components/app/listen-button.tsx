"use client";

import { speakJa, ttsAvailable } from "@/lib/audio";
import { useMounted } from "@/lib/use-mounted";
import { SpeakerIcon } from "@/components/ui/icons";

export function ListenButton({ text, label = "Listen" }: { text: string; label?: string }) {
  const mounted = useMounted();
  if (!mounted || !ttsAvailable()) return null;

  return (
    <button
      type="button"
      onClick={() => speakJa(text)}
      className="inline-flex items-center gap-2 rounded-full bg-info/15 px-4 py-2 font-display font-bold text-info transition hover:bg-info/25"
    >
      <SpeakerIcon className="size-5" />
      {label}
    </button>
  );
}
