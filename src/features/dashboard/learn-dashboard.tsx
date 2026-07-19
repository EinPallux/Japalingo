"use client";

import Link from "next/link";
import { useMemo } from "react";
import { AppHeader } from "@/components/app/app-header";
import { IosInstallHint } from "@/components/app/ios-install-hint";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Onboarding } from "@/features/onboarding/onboarding";
import { PathView } from "@/features/path/path-view";
import { DailyQuests } from "@/features/quests/daily-quests";
import { ALL_KANA, getTrackLessons } from "@/data/curriculum";
import { VOCAB } from "@/data/vocab";
import { GRAMMAR_CHAPTERS } from "@/data/grammar";
import { REVIEWABLE_POINT_IDS } from "@/lib/grammar";
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
  const vocabProgress = useProgress((s) => s.vocab);
  const now = useNow();
  const dueCount = useMemo(
    () => ALL_KANA.filter((k) => isDue(kanaProgress[k.id], now)).length,
    [kanaProgress, now],
  );
  const seenCount = useMemo(() => totalSeen(kanaProgress), [kanaProgress]);
  const vocabDue = useMemo(
    () => VOCAB.filter((w) => isDue(vocabProgress[w.id], now)).length,
    [vocabProgress, now],
  );
  const vocabLearned = useMemo(
    () => VOCAB.filter((w) => (vocabProgress[w.id]?.seen ?? 0) > 0).length,
    [vocabProgress],
  );
  const grammarProgress = useProgress((s) => s.grammar);
  const completedGrammar = useProgress((s) => s.completedGrammarChapters);
  const grammarChaptersDone = completedGrammar.length;
  const grammarDue = useMemo(
    () =>
      GRAMMAR_CHAPTERS.flatMap((c) => c.points).filter(
        // only quizzable points count as due — example-less rules can't be
        // reviewed, so counting them would show a badge that never clears
        (p) => REVIEWABLE_POINT_IDS.has(p.id) && isDue(grammarProgress[p.id], now),
      ).length,
    [grammarProgress, now],
  );
  const completedLessons = useProgress((s) => s.completedLessons);
  // The single most important tap: the next unfinished lesson on the active
  // kana path, surfaced as a hero button so it's never buried below the fold.
  const nextLesson = useMemo(
    () => getTrackLessons(activeTrack).find((l) => !completedLessons.includes(l.id)),
    [activeTrack, completedLessons],
  );
  // A gentle sequence hint while the learner is still early in hiragana.
  const kanaBeginner = seenCount < 15;

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

          {/* The hero: continue the kana path — always the first, biggest tap. */}
          {nextLesson ? (
            <Link
              href={`/learn/lesson/${nextLesson.id}`}
              className="btn-chunky flex items-center justify-between gap-3 rounded-blob-xl bg-primary px-5 py-4 text-white shadow-[0_6px_0_0_var(--jl-primary-strong)] transition hover:brightness-105"
            >
              <span className="min-w-0">
                <span className="block text-xs font-bold uppercase tracking-wide opacity-80">
                  {completedLessons.length > 0 ? "Continue learning" : "Start here"}
                </span>
                <span className="block truncate font-display text-lg font-bold">{nextLesson.title}</span>
              </span>
              <span aria-hidden className="shrink-0 font-display text-2xl">
                ▸
              </span>
            </Link>
          ) : null}

          <DailyQuests />

          {/* Quick actions — one tidy 2×2 grid.
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

          {/* The other two tracks — compact, with a sequence hint for beginners
              (kana first: both tracks display their Japanese in kana). */}
          <div className="grid grid-cols-2 gap-3">
            <TrackCard
              href="/learn/vocab"
              emoji="📚"
              label="Vocabulary"
              due={vocabDue}
              desc={
                vocabLearned > 0
                  ? `${vocabLearned}/${VOCAB.length} words`
                  : kanaBeginner
                    ? "Best after some hiragana"
                    : `${VOCAB.length} JLPT N5 words`
              }
            />
            <TrackCard
              href="/learn/grammar"
              emoji="🧩"
              label="Grammar"
              due={grammarDue}
              desc={
                grammarChaptersDone > 0
                  ? `${grammarChaptersDone}/${GRAMMAR_CHAPTERS.length} chapters`
                  : kanaBeginner
                    ? "Best after some hiragana"
                    : `${GRAMMAR_CHAPTERS.length} beginner chapters`
              }
            />
          </div>

          {/* Secondary destinations, discoverable without digging into Profile. */}
          <div className="flex items-center justify-center gap-4 text-sm font-semibold text-muted">
            <Link href="/journey" className="transition hover:text-ink">
              📈 Your journey
            </Link>
            <span aria-hidden>·</span>
            <Link href="/settings" className="transition hover:text-ink">
              ⚙️ Settings
            </Link>
          </div>
        </div>

        <PathView track={activeTrack} />
      </main>
    </>
  );
}

function TrackCard({
  href,
  emoji,
  label,
  desc,
  due,
}: {
  href: string;
  emoji: string;
  label: string;
  desc: string;
  due: number;
}) {
  return (
    <Link
      href={href}
      className="relative flex flex-col gap-1 rounded-blob-lg border border-border bg-surface px-4 py-3.5 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]"
    >
      {due > 0 ? (
        <span className="absolute right-2 top-2 rounded-full bg-secondary px-2 py-0.5 text-xs font-bold text-white">
          {due} due
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
