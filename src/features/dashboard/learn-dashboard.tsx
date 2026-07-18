"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppHeader } from "@/components/app/app-header";
import { IosInstallHint } from "@/components/app/ios-install-hint";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Onboarding } from "@/features/onboarding/onboarding";
import { PathView } from "@/features/path/path-view";
import { DailyQuests } from "@/features/quests/daily-quests";
import { ALL_KANA } from "@/data/curriculum";
import { totalSeen } from "@/lib/achievements";
import { isDue } from "@/lib/srs";
import { useMounted } from "@/lib/use-mounted";
import { useNow } from "@/lib/use-now";
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
  const kanaProgress = useProgress((s) => s.kana);
  const now = useNow();
  const dueCount = useMemo(
    () => ALL_KANA.filter((k) => isDue(kanaProgress[k.id], now)).length,
    [kanaProgress, now],
  );
  const seenCount = useMemo(() => totalSeen(kanaProgress), [kanaProgress]);

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
      <main id="main" className="pb-safe">
        <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-5">
          <IosInstallHint />
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

          {seenCount < 5 ? (
            <Link
              href="/learn/sounds"
              className="flex items-center justify-between gap-3 rounded-blob-lg border border-primary/30 bg-gradient-to-r from-primary-tint to-secondary-tint px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <span className="flex items-center gap-3">
                <span aria-hidden className="text-2xl">
                  🔰
                </span>
                <span>
                  <span className="block font-display font-bold text-ink">New here? Meet the sounds</span>
                  <span className="text-sm text-muted">The 5 vowels + how kana are built — 1 min</span>
                </span>
              </span>
              <span aria-hidden className="font-display text-xl text-primary">
                ▸
              </span>
            </Link>
          ) : null}

          <DailyQuests />

          {/* Quick actions — one tidy 2×2 grid, so the path stays close to the top.
              (The Shop lives in the header; all five games live in the Arcade.) */}
          <div className="grid grid-cols-2 gap-3">
            <QuickAction
              href="/learn/practice"
              emoji="🧠"
              label="Practice"
              desc={dueCount > 0 ? `${dueCount} kana ready` : "Review weak kana"}
              tint="from-info/15 to-primary-tint"
              badge={dueCount > 0 ? `${dueCount} due` : undefined}
            />
            <QuickAction
              href="/learn/drill"
              emoji="🎯"
              label="Free Drill"
              desc="Train any rows"
              tint="from-secondary-tint to-primary-tint"
            />
            <QuickAction
              href="/learn/games"
              emoji="🕹️"
              label="Arcade"
              desc="5 kana games"
              tint="from-accent-tint to-secondary-tint"
            />
            <QuickAction
              href="/learn/chart"
              emoji="📖"
              label="Kana Chart"
              desc="Tap to hear & review"
              tint="from-primary-tint to-accent-tint"
            />
          </div>
        </div>

        <PathView track={activeTrack} />
      </main>
    </>
  );
}

function QuickAction({
  href,
  emoji,
  label,
  desc,
  tint,
  badge,
}: {
  href: string;
  emoji: string;
  label: string;
  desc: string;
  tint: string;
  badge?: string;
}) {
  return (
    <Link
      href={href}
      className={cn(
        "relative flex flex-col gap-1 rounded-blob-lg border border-border bg-gradient-to-br px-4 py-3.5 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
        tint,
      )}
    >
      {badge ? (
        <span className="absolute right-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-white">
          {badge}
        </span>
      ) : null}
      <span aria-hidden className="text-2xl">
        {emoji}
      </span>
      <span className="font-display text-sm font-bold text-ink">{label}</span>
      <span className="text-xs text-muted">{desc}</span>
    </Link>
  );
}
