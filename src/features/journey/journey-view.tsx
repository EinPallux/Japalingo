"use client";

import { useMemo } from "react";
import { AppHeader } from "@/components/app/app-header";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { ALL_KANA, trackKana } from "@/data/curriculum";
import { totalMastered, totalSeen, trackSeen } from "@/lib/achievements";
import { isDue } from "@/lib/srs";
import { useMounted } from "@/lib/use-mounted";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { Track } from "@/types";

function masteredInTrack(kana: ReturnType<typeof useProgress.getState>["kana"], track: Track): number {
  return trackKana(track).filter((k) => (kana[k.id]?.mastery ?? 0) >= 5).length;
}

export function JourneyView() {
  const mounted = useMounted();
  const kana = useProgress((s) => s.kana);
  const now = useNow();

  const stats = useMemo(() => {
    let attempts = 0;
    let correct = 0;
    for (const k of ALL_KANA) {
      const p = kana[k.id];
      if (p) {
        // Accuracy is over graded answers only — `attempts` (falling back to
        // `seen` for pre-attempts saves), never passive "met it" views.
        attempts += p.attempts ?? p.seen;
        correct += p.correct;
      }
    }
    const weakest = ALL_KANA.filter((k) => (kana[k.id]?.seen ?? 0) > 0)
      .sort((a, b) => (kana[a.id]?.mastery ?? 0) - (kana[b.id]?.mastery ?? 0))
      .slice(0, 8);
    return {
      seen: totalSeen(kana),
      mastered: totalMastered(kana),
      accuracy: attempts ? Math.round((correct / attempts) * 100) : 0,
      attempts,
      hira: { seen: trackSeen(kana, "hiragana"), mastered: masteredInTrack(kana, "hiragana") },
      kata: { seen: trackSeen(kana, "katakana"), mastered: masteredInTrack(kana, "katakana") },
      due: ALL_KANA.filter((k) => isDue(kana[k.id], now)).length,
      weakest,
    };
  }, [kana, now]);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  if (stats.seen === 0) {
    return (
      <>
        <AppHeader />
        <main id="main" className="mx-auto flex max-w-md flex-col items-center gap-6 px-5 py-16 text-center">
          <HoshiStatic className="size-28" />
          <p className="text-ink">Learn your first kana and your journey will start showing up here!</p>
          <Button href="/learn" size="lg">
            Start learning
          </Button>
        </main>
      </>
    );
  }

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
        <h1 className="text-center font-display text-3xl font-bold text-ink">Your Journey</h1>

        <section className="flex flex-col gap-4 rounded-blob-lg border border-border bg-surface p-5">
          <Bar label="Hiragana" sample="あ" value={stats.hira.seen} max={trackKana("hiragana").length} />
          <Bar label="Katakana" sample="ア" value={stats.kata.seen} max={trackKana("katakana").length} />
          <p className="text-center text-xs text-muted">
            Characters met, out of {trackKana("hiragana").length} in each script (46 basic + dakuten).
          </p>
        </section>

        <div className="grid grid-cols-3 gap-3">
          <Tile value={`${stats.accuracy}%`} label="accuracy" tone="text-success-strong" />
          <Tile value={stats.mastered} label="mastered 👑" tone="text-accent-strong" />
          <Tile value={stats.due} label="due now" tone="text-secondary-strong" />
        </div>
        <p className="-mt-3 text-center text-xs text-muted">
          {stats.accuracy}% right across {stats.attempts} answers.
        </p>

        <section className="flex flex-col gap-3 rounded-blob-lg border border-border bg-surface p-5">
          <h2 className="font-display text-lg font-bold text-ink">Focus on these next</h2>
          <p className="text-sm text-muted">Your lowest-mastery kana — the ones worth a little extra love.</p>
          <div className="flex flex-wrap gap-2">
            {stats.weakest.map((k) => {
              const m = kana[k.id]?.mastery ?? 0;
              return (
                <span
                  key={k.id}
                  title={`${k.romaji} · mastery ${m}/5`}
                  className="flex items-center gap-1.5 rounded-full border border-border bg-surface-2 px-3 py-1.5"
                >
                  <span lang="ja" className="font-jp text-lg font-bold text-ink">
                    {k.char}
                  </span>
                  <span className="text-xs font-semibold text-muted">{"👑".repeat(m) || "·"}</span>
                </span>
              );
            })}
          </div>
          <Button href="/learn/drill" size="lg" className="w-full">
            Drill your weakest
          </Button>
        </section>
      </main>
    </>
  );
}

function Bar({ label, sample, value, max }: { label: string; sample: string; value: number; max: number }) {
  const pct = Math.round((value / max) * 100);
  return (
    <div>
      <div className="mb-1 flex items-center justify-between text-sm">
        <span className="flex items-center gap-2 font-display font-bold text-ink">
          <span lang="ja" className="font-jp text-primary">
            {sample}
          </span>
          {label}
        </span>
        <span className="font-semibold text-muted">
          {value}/{max}
        </span>
      </div>
      <div className="h-2.5 overflow-hidden rounded-full bg-surface-2">
        <div
          className={cn("h-full rounded-full transition-all", pct >= 100 ? "bg-success" : "bg-primary")}
          style={{ width: `${pct}%` }}
        />
      </div>
    </div>
  );
}

function Tile({ value, label, tone }: { value: string | number; label: string; tone: string }) {
  return (
    <div className="rounded-blob-lg border border-border bg-surface p-4 text-center">
      <p className={cn("font-display text-2xl font-bold", tone)}>{value}</p>
      <p className="text-xs font-semibold text-muted">{label}</p>
    </div>
  );
}
