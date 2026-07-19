"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { AppHeader } from "@/components/app/app-header";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";

const GAMES = [
  { slug: "romaji-rush", emoji: "⏱️", label: "Romaji Rush", desc: "Beat the 60-second clock", skill: "Speed", tint: "from-secondary-tint to-accent-tint", tracked: true, scored: true },
  { slug: "kana-rain", emoji: "🌸", label: "Kana Rain", desc: "Type the reading before it lands", skill: "Recall", tint: "from-primary-tint to-secondary-tint", tracked: true, scored: true },
  { slug: "kana-match", emoji: "🃏", label: "Kana Match", desc: "Flip cards & pair kana with sounds", skill: "Memory", tint: "from-accent-tint to-secondary-tint", tracked: true, scored: false },
  { slug: "ear-training", emoji: "🎧", label: "Ear Training", desc: "Hear a kana, pick the character", skill: "Listening", tint: "from-info/15 to-secondary-tint", tracked: true, scored: false },
  { slug: "word-builder", emoji: "📖", label: "Word Builder", desc: "Read real Japanese words", skill: "Reading", tint: "from-accent-tint to-primary-tint", tracked: false, scored: false },
];

const list = {
  hidden: {},
  show: { transition: { staggerChildren: 0.06 } },
};
const item = {
  hidden: { opacity: 0, y: 14 },
  show: { opacity: 1, y: 0, transition: { type: "spring" as const, stiffness: 300, damping: 24 } },
};

/** The games hub — every mini-game in one place, so the dashboard stays tidy. */
export function Arcade() {
  const mounted = useMounted();
  const activeTrack = useProgress((s) => s.activeTrack);
  const bestScores = useProgress((s) => s.bestScores);
  const track = mounted ? activeTrack : "hiragana";

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6 pb-safe">
        <div className="flex flex-col items-center gap-2 text-center">
          <HoshiStatic className="size-20" />
          <h1 className="font-display text-3xl font-bold text-ink">Arcade</h1>
          <p className="text-sm text-muted">
            Five ways to play with the kana you&apos;ve learned — every round counts toward your
            mastery and daily quests.
          </p>
        </div>

        <motion.div variants={list} initial="hidden" animate="show" className="flex flex-col gap-3">
          {GAMES.map((g) => {
            // Rain & Rush keep a per-track personal best; surface it on the card.
            const best = g.scored && mounted ? (bestScores[`${g.slug}:${track}`] ?? 0) : 0;
            return (
              <motion.div key={g.slug} variants={item}>
                <Link
                  href={g.tracked ? `/learn/games/${g.slug}?track=${track}` : `/learn/games/${g.slug}`}
                  className={cn(
                    "flex items-center gap-4 rounded-blob-lg border border-border bg-gradient-to-br px-4 py-4 transition hover:-translate-y-0.5 hover:shadow-[var(--shadow-lift)]",
                    g.tint,
                  )}
                >
                  <span aria-hidden className="grid size-12 shrink-0 place-items-center rounded-blob bg-surface/70 text-2xl">
                    {g.emoji}
                  </span>
                  <span className="min-w-0 flex-1">
                    <span className="block font-display font-bold text-ink">{g.label}</span>
                    <span className="text-xs text-muted">{g.desc}</span>
                  </span>
                  <span className="flex shrink-0 flex-col items-end gap-1">
                    <span className="rounded-full bg-surface/80 px-2.5 py-1 text-[11px] font-bold text-muted">
                      {g.skill}
                    </span>
                    {best > 0 ? (
                      <span className="text-[11px] font-bold text-accent-strong">🏆 {best}</span>
                    ) : null}
                  </span>
                </Link>
              </motion.div>
            );
          })}
        </motion.div>

        <Link
          href="/learn"
          className="text-center text-sm font-bold text-muted transition hover:text-ink"
        >
          ← Back to the path
        </Link>
      </main>
    </>
  );
}
