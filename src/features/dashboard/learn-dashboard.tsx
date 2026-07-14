"use client";

import Link from "next/link";
import { AppHeader } from "@/components/app/app-header";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Onboarding } from "@/features/onboarding/onboarding";
import { PathView } from "@/features/path/path-view";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { Track } from "@/types";

const TRACKS: { id: Track; label: string; sample: string }[] = [
  { id: "hiragana", label: "Hiragana", sample: "あ" },
  { id: "katakana", label: "Katakana", sample: "ア" },
];

export function LearnDashboard() {
  const mounted = useMounted();
  const onboarded = useProgress((s) => s.onboardingComplete);
  const activeTrack = useProgress((s) => s.activeTrack);
  const setActiveTrack = useProgress((s) => s.setActiveTrack);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  if (!onboarded) return <Onboarding />;

  return (
    <>
      <AppHeader />
      <main id="main">
        <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-5">
          <div className="flex gap-1 rounded-full bg-surface-2 p-1">
            {TRACKS.map((t) => (
              <button
                key={t.id}
                type="button"
                onClick={() => setActiveTrack(t.id)}
                aria-pressed={activeTrack === t.id}
                className={cn(
                  "flex flex-1 items-center justify-center gap-2 rounded-full py-2 font-display font-bold transition",
                  activeTrack === t.id
                    ? "bg-surface text-primary shadow-[var(--shadow-soft)]"
                    : "text-muted hover:text-ink",
                )}
              >
                <span lang="ja" className="font-jp">
                  {t.sample}
                </span>
                {t.label}
              </button>
            ))}
          </div>

          <div className="grid grid-cols-3 gap-3">
            {[
              { href: "/learn/practice", emoji: "🧠", label: "Practice", tint: "from-info/15 to-primary-tint" },
              { href: `/learn/games/kana-rain?track=${activeTrack}`, emoji: "🌸", label: "Kana Rain", tint: "from-primary-tint to-secondary-tint" },
              { href: `/learn/games/kana-match?track=${activeTrack}`, emoji: "🃏", label: "Kana Match", tint: "from-accent-tint to-secondary-tint" },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className={cn(
                  "flex flex-col items-center gap-1 rounded-blob-lg border border-border bg-gradient-to-br px-2 py-4 text-center transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
                  a.tint,
                )}
              >
                <span aria-hidden className="text-2xl">
                  {a.emoji}
                </span>
                <span className="font-display text-sm font-bold text-ink">{a.label}</span>
              </Link>
            ))}
          </div>
        </div>

        <PathView track={activeTrack} />
      </main>
    </>
  );
}
