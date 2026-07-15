"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppHeader } from "@/components/app/app-header";
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

          <div className="grid grid-cols-2 gap-3">
            <Link
              href="/learn/practice"
              className="relative flex flex-col gap-1 rounded-blob-lg border border-border bg-gradient-to-br from-info/15 to-primary-tint px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              {dueCount > 0 ? (
                <span className="absolute right-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-white">
                  {dueCount} due
                </span>
              ) : null}
              <span aria-hidden className="text-2xl">
                🧠
              </span>
              <span className="font-display font-bold text-ink">Practice</span>
              <span className="text-xs text-muted">
                {dueCount > 0 ? `${dueCount} kana ready to review` : "Review your weakest kana"}
              </span>
            </Link>
            <Link
              href="/learn/drill"
              className="flex flex-col gap-1 rounded-blob-lg border border-border bg-gradient-to-br from-secondary-tint to-primary-tint px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
            >
              <span aria-hidden className="text-2xl">
                🎯
              </span>
              <span className="font-display font-bold text-ink">Free Drill</span>
              <span className="text-xs text-muted">Train any rows, MARU-style</span>
            </Link>
          </div>

          <Link
            href="/learn/shop"
            className="flex items-center justify-between rounded-blob-lg border border-border bg-gradient-to-r from-accent-tint to-secondary-tint px-5 py-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden className="text-2xl">
                🛍️
              </span>
              <span>
                <span className="block font-display font-bold text-ink">Shop</span>
                <span className="text-sm text-muted">Dress up Hoshi &amp; power up</span>
              </span>
            </span>
            <span aria-hidden className="font-display text-xl text-secondary-strong">
              ▸
            </span>
          </Link>

          <Link
            href="/learn/chart"
            className="flex items-center justify-between rounded-blob-lg border border-border bg-surface px-5 py-3 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]"
          >
            <span className="flex items-center gap-3">
              <span aria-hidden className="text-2xl">
                📖
              </span>
              <span className="font-display font-bold text-ink">Kana Chart</span>
            </span>
            <span className="text-xs text-muted">tap any kana to hear &amp; review ▸</span>
          </Link>

          <div className="grid grid-cols-2 gap-3">
            {[
              { href: `/learn/games/romaji-rush?track=${activeTrack}`, emoji: "⏱️", label: "Romaji Rush", desc: "Beat the 60s clock", tint: "from-secondary-tint to-accent-tint", wide: true },
              { href: `/learn/games/kana-rain?track=${activeTrack}`, emoji: "🌸", label: "Kana Rain", desc: "Type before it lands", tint: "from-primary-tint to-secondary-tint" },
              { href: `/learn/games/kana-match?track=${activeTrack}`, emoji: "🃏", label: "Kana Match", desc: "Flip & pair", tint: "from-accent-tint to-secondary-tint" },
              { href: `/learn/games/ear-training?track=${activeTrack}`, emoji: "🎧", label: "Ear Training", desc: "Hear it, pick it", tint: "from-info/15 to-secondary-tint" },
              { href: `/learn/games/word-builder`, emoji: "📖", label: "Word Builder", desc: "Read real words", tint: "from-accent-tint to-primary-tint" },
            ].map((a) => (
              <Link
                key={a.label}
                href={a.href}
                className={cn(
                  "flex items-center gap-3 rounded-blob-lg border border-border bg-gradient-to-br px-3 py-3 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
                  a.tint,
                  a.wide && "col-span-2",
                )}
              >
                <span aria-hidden className="text-2xl">
                  {a.emoji}
                </span>
                <span>
                  <span className="block font-display text-sm font-bold text-ink">{a.label}</span>
                  <span className="text-xs text-muted">{a.desc}</span>
                </span>
              </Link>
            ))}
          </div>
        </div>

        <PathView track={activeTrack} />
      </main>
    </>
  );
}
