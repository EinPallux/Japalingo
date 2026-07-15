"use client";

import { useRouter } from "next/navigation";
import { useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { HoshiAvatar } from "@/components/mascot/hoshi-avatar";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { trackKana } from "@/data/curriculum";
import {
  badgesFor,
  rankFor,
  totalMastered,
  totalSeen,
} from "@/lib/achievements";
import { equippedEmojis } from "@/lib/shop";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { selectStreak, useProgress } from "@/stores/progress";
import type { KanaProgress, Track } from "@/types";

function masteryClass(m: number): string {
  if (m >= 5) return "bg-accent text-ink border-accent-strong";
  if (m >= 3) return "bg-primary text-white border-primary";
  if (m >= 1) return "bg-primary-tint text-primary border-primary/30";
  return "bg-surface-2 text-muted border-border";
}

function MasteryGrid({ track, kana }: { track: Track; kana: Record<string, KanaProgress> }) {
  return (
    <div className="grid grid-cols-6 gap-1.5 sm:grid-cols-8">
      {trackKana(track).map((k) => {
        const m = kana[k.id]?.mastery ?? 0;
        return (
          <div
            key={k.id}
            role="img"
            title={`${k.char} = ${k.romaji} · mastery ${m}/5`}
            aria-label={`${k.romaji} — mastery ${m} of 5`}
            className={cn(
              "grid aspect-square place-items-center rounded-blob-sm border font-jp text-lg font-bold",
              masteryClass(m),
            )}
          >
            <span lang="ja" aria-hidden>
              {k.char}
            </span>
          </div>
        );
      })}
    </div>
  );
}

function Stat({ value, label }: { value: string | number; label: string }) {
  return (
    <div className="rounded-blob-lg border border-border bg-surface p-4 text-center">
      <p className="font-display text-2xl font-bold text-ink">{value}</p>
      <p className="text-xs font-semibold text-muted">{label}</p>
    </div>
  );
}

export function ProfileView() {
  const router = useRouter();
  const mounted = useMounted();
  const state = useProgress();
  const [gridTrack, setGridTrack] = useState<Track>("hiragana");

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  const rank = rankFor(state.xp);
  const badges = badgesFor(state);
  const seen = totalSeen(state.kana);
  const mastered = totalMastered(state.kana);

  const reset = () => {
    if (window.confirm("Reset all progress? This can't be undone.")) {
      state.reset();
      router.push("/learn");
    }
  };

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
        <div className="flex flex-col items-center gap-2 text-center">
          <HoshiAvatar size={104} equipped={equippedEmojis(state.equipped)} />
          <h1 className="font-display text-2xl font-bold text-ink">{state.name || "friend"}</h1>
          <span className="rounded-full bg-primary-tint px-3 py-1 text-sm font-bold text-primary">
            {rank.name}
          </span>
        </div>

        <div className="grid grid-cols-3 gap-3">
          <Stat value={`⚡ ${state.xp}`} label="Total XP" />
          <Stat value={`🔥 ${selectStreak(state)}`} label="Day streak" />
          <Stat value={`🪙 ${state.coins}`} label="Coins" />
          <Stat value={`💎 ${state.gems}`} label="Gems" />
          <Stat value={`❄️ ${state.streakFreezes}`} label="Freezes" />
          <Stat value={`${seen}/92`} label="Kana met" />
          <Stat value={mastered} label="Mastered" />
          <Stat value={state.completedLessons.length} label="Lessons" />
        </div>

        <section className="flex flex-col gap-3">
          <div className="flex items-center justify-between">
            <h2 className="font-display text-lg font-bold text-ink">Mastery</h2>
            <div className="flex gap-1 rounded-full bg-surface-2 p-1 text-sm font-bold">
              {(["hiragana", "katakana"] as Track[]).map((t) => (
                <button
                  key={t}
                  type="button"
                  onClick={() => setGridTrack(t)}
                  aria-pressed={gridTrack === t}
                  className={cn(
                    "rounded-full px-3 py-1 transition",
                    gridTrack === t ? "bg-surface text-primary shadow-[var(--shadow-soft)]" : "text-muted",
                  )}
                >
                  {t === "hiragana" ? "あ" : "ア"}
                </button>
              ))}
            </div>
          </div>
          <MasteryGrid track={gridTrack} kana={state.kana} />
          <div className="flex flex-wrap gap-3 text-xs text-muted">
            <Legend cls="bg-surface-2" label="new" />
            <Legend cls="bg-primary-tint" label="learning" />
            <Legend cls="bg-primary" label="strong" />
            <Legend cls="bg-accent" label="mastered" />
          </div>
        </section>

        <section className="flex flex-col gap-3">
          <h2 className="font-display text-lg font-bold text-ink">Badges</h2>
          <div className="grid grid-cols-2 gap-3">
            {badges.map((b) => (
              <div
                key={b.id}
                className={cn(
                  "flex items-center gap-3 rounded-blob-lg border p-3",
                  b.earned ? "border-accent-strong/40 bg-accent-tint" : "border-border bg-surface opacity-60",
                )}
              >
                <span aria-hidden className={cn("text-2xl", !b.earned && "grayscale")}>
                  {b.emoji}
                </span>
                <div>
                  <p className="font-display text-sm font-bold text-ink">{b.name}</p>
                  <p className="text-xs text-muted">{b.desc}</p>
                </div>
              </div>
            ))}
          </div>
        </section>

        <div className="flex flex-col gap-3 pt-2">
          <Button href="/learn" size="lg" className="w-full">
            Back to learning
          </Button>
          <button
            type="button"
            onClick={reset}
            className="text-sm font-semibold text-muted transition hover:text-error-strong"
          >
            Reset all progress
          </button>
        </div>
      </main>
    </>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-3 rounded-sm border border-border", cls)} />
      {label}
    </span>
  );
}
