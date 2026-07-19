"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { LockIcon } from "@/components/ui/icons";
import { VOCAB } from "@/data/vocab";
import {
  getVocabWords,
  isVocabDeckUnlocked,
  vocabSections,
} from "@/data/vocab-decks";
import { isDue } from "@/lib/srs";
import { useMounted } from "@/lib/use-mounted";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { KanaProgress, VocabDeck, VocabWord } from "@/types";
import { VocabReview } from "./vocab-review";

const REVIEW_SIZE = 12;

export function VocabHub() {
  const mounted = useMounted();
  const vocab = useProgress((s) => s.vocab);
  const completedDecks = useProgress((s) => s.completedVocabDecks);
  const now = useNow();
  const [reviewWords, setReviewWords] = useState<VocabWord[] | null>(null);

  const learned = useMemo(() => VOCAB.filter((w) => (vocab[w.id]?.seen ?? 0) > 0), [vocab]);
  const mastered = useMemo(
    () => VOCAB.filter((w) => (vocab[w.id]?.mastery ?? 0) >= 3).length,
    [vocab],
  );
  const due = useMemo(() => learned.filter((w) => isDue(vocab[w.id], now)), [learned, vocab, now]);
  const reviewSet = useMemo(() => {
    const source = due.length ? due : learned;
    return [...source]
      .sort((a, b) => (vocab[a.id]?.mastery ?? 0) - (vocab[b.id]?.mastery ?? 0))
      .slice(0, REVIEW_SIZE);
  }, [due, learned, vocab]);

  const sections = useMemo(() => vocabSections(), []);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  if (reviewWords) {
    return <VocabReview words={reviewWords} onExit={() => setReviewWords(null)} />;
  }

  return (
    <>
      <AppHeader />
      <main id="main" className="pb-safe">
        <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-5">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-ink">Vocabulary</h1>
            <p className="mt-1 text-sm text-muted">
              {VOCAB.length} JLPT N5 words — learn to read them in kana, no kanji required.
            </p>
          </div>

          {/* Progress at a glance */}
          <div className="grid grid-cols-3 gap-3">
            <Stat value={learned.length} label="learned" tone="primary" />
            <Stat value={mastered} label="mastered" tone="success" />
            <Stat value={due.length} label="due now" tone={due.length ? "secondary" : "muted"} />
          </div>

          {learned.length > 0 ? (
            <Button
              onClick={() => setReviewWords(reviewSet)}
              size="lg"
              variant={due.length ? "primary" : "ghost"}
              className="w-full"
            >
              {due.length ? `Review ${Math.min(due.length, REVIEW_SIZE)} words` : "Practice words"}
            </Button>
          ) : null}

          {/* Deck path, grouped by section */}
          {sections.map((group) => (
            <section key={group.section} className="flex flex-col gap-2">
              <h2 className="mt-2 px-1 font-display text-sm font-bold uppercase tracking-wide text-muted">
                {group.section}
              </h2>
              {group.decks.map((deck) => (
                <DeckRow
                  key={deck.id}
                  deck={deck}
                  vocab={vocab}
                  unlocked={isVocabDeckUnlocked(deck, completedDecks)}
                  completed={completedDecks.includes(deck.id)}
                />
              ))}
            </section>
          ))}
        </div>
      </main>
    </>
  );
}

function Stat({
  value,
  label,
  tone,
}: {
  value: number;
  label: string;
  tone: "primary" | "success" | "secondary" | "muted";
}) {
  const color =
    tone === "primary"
      ? "text-primary bg-primary-tint"
      : tone === "success"
        ? "text-success-strong bg-success/15"
        : tone === "secondary"
          ? "text-secondary-strong bg-secondary-tint"
          : "text-muted bg-surface-2";
  return (
    <div className={cn("rounded-blob-lg border border-border p-3 text-center", color)}>
      <p className="font-display text-2xl font-bold">{value}</p>
      <p className="text-xs font-semibold text-muted">{label}</p>
    </div>
  );
}

function DeckRow({
  deck,
  vocab,
  unlocked,
  completed,
}: {
  deck: VocabDeck;
  vocab: Record<string, KanaProgress>;
  unlocked: boolean;
  completed: boolean;
}) {
  const words = getVocabWords(deck.wordIds);
  const learned = words.filter((w) => (vocab[w.id]?.seen ?? 0) > 0).length;
  const pct = Math.round((learned / Math.max(words.length, 1)) * 100);

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "grid size-12 shrink-0 place-items-center rounded-blob-lg text-2xl",
          unlocked ? "bg-surface-2" : "bg-surface-2 opacity-50",
        )}
      >
        {unlocked ? deck.emoji : <LockIcon className="size-5 text-muted" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="font-display font-bold text-ink">{deck.title}</span>
          {completed ? (
            <span aria-label="completed" className="text-success-strong">
              ✓
            </span>
          ) : null}
        </span>
        <span lang="ja" className="block truncate font-jp text-sm text-muted">
          {deck.subtitle}
        </span>
        {unlocked && learned > 0 ? (
          <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
          </span>
        ) : null}
      </span>
      <span className="shrink-0 text-xs font-semibold text-muted">
        {learned}/{words.length}
      </span>
    </>
  );

  if (!unlocked) {
    return (
      <div className="flex cursor-not-allowed items-center gap-3 rounded-blob-lg border border-border bg-surface px-4 py-3 opacity-70">
        {inner}
      </div>
    );
  }

  return (
    <Link
      href={`/learn/vocab/${deck.id}`}
      className="flex items-center gap-3 rounded-blob-lg border border-border bg-surface px-4 py-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]"
    >
      {inner}
    </Link>
  );
}
