"use client";

import Link from "next/link";
import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { LockIcon } from "@/components/ui/icons";
import { GRAMMAR_CHAPTERS, GRAMMAR_PATTERNS } from "@/data/grammar";
import { GRAMMAR_TABLES } from "@/data/grammar-tables";
import {
  ALL_GRAMMAR_EXAMPLES,
  grammarSections,
  isChapterUnlocked,
  REVIEWABLE_POINT_IDS,
  type TaggedExample,
} from "@/lib/grammar";
import { isDue } from "@/lib/srs";
import { useMounted } from "@/lib/use-mounted";
import { useNow } from "@/lib/use-now";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { GrammarChapter, KanaProgress } from "@/types";
import { GrammarReview } from "./grammar-review";
import { GrammarTableCard } from "./table-card";

const ALL_POINTS = GRAMMAR_CHAPTERS.flatMap((c) => c.points);
const REVIEW_POINTS = 6;

export function GrammarHub() {
  const mounted = useMounted();
  const grammar = useProgress((s) => s.grammar);
  const completed = useProgress((s) => s.completedGrammarChapters);
  const now = useNow();
  const [reviewItems, setReviewItems] = useState<TaggedExample[] | null>(null);

  const learned = useMemo(() => ALL_POINTS.filter((p) => (grammar[p.id]?.seen ?? 0) > 0), [grammar]);
  const mastered = useMemo(
    () => ALL_POINTS.filter((p) => (grammar[p.id]?.mastery ?? 0) >= 3).length,
    [grammar],
  );
  // Only points WITH example sentences can be quizzed — example-less points
  // (pure rules/tables) must not feed the due-count or the review session, or
  // the badge could never be cleared and the queue could come up empty.
  const reviewable = useMemo(() => learned.filter((p) => REVIEWABLE_POINT_IDS.has(p.id)), [learned]);
  const duePoints = useMemo(
    () => reviewable.filter((p) => isDue(grammar[p.id], now)),
    [reviewable, grammar, now],
  );
  const reviewSet = useMemo(() => {
    const source = (duePoints.length ? duePoints : reviewable)
      .slice()
      .sort((a, b) => (grammar[a.id]?.mastery ?? 0) - (grammar[b.id]?.mastery ?? 0))
      .slice(0, REVIEW_POINTS);
    const ids = new Set(source.map((p) => p.id));
    return ALL_GRAMMAR_EXAMPLES.filter((t) => ids.has(t.pointId));
  }, [duePoints, reviewable, grammar]);

  const sections = useMemo(() => grammarSections(), []);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  if (reviewItems) {
    return <GrammarReview items={reviewItems} onExit={() => setReviewItems(null)} />;
  }

  return (
    <>
      <AppHeader />
      <main id="main" className="pb-safe">
        <div className="mx-auto flex max-w-md flex-col gap-4 px-4 pt-5">
          <div className="text-center">
            <h1 className="font-display text-3xl font-bold text-ink">Grammar</h1>
            <p className="mt-1 text-sm text-muted">
              From your first sentence to everyday Japanese — {GRAMMAR_CHAPTERS.length} chapters, built for
              absolute beginners.
            </p>
          </div>

          {learned.length === 0 ? (
            <div className="rounded-blob-lg border border-info/30 bg-info/10 px-4 py-3 text-sm text-ink">
              💡 New to Japanese? Learn to read <strong>hiragana</strong> first — grammar examples are shown
              in kana, so a little reading goes a long way.
            </div>
          ) : null}

          <div className="grid grid-cols-3 gap-3">
            <Stat value={learned.length} label="learned" tone="primary" />
            <Stat value={mastered} label="mastered" tone="success" />
            <Stat value={duePoints.length} label="due now" tone={duePoints.length ? "secondary" : "muted"} />
          </div>

          {reviewable.length > 0 ? (
            <Button
              onClick={() => setReviewItems(reviewSet)}
              size="lg"
              variant={duePoints.length ? "primary" : "ghost"}
              className="w-full"
            >
              {duePoints.length ? `Review ${Math.min(duePoints.length, REVIEW_POINTS)} points` : "Practice grammar"}
            </Button>
          ) : null}

          {sections.map((group) => (
            <section key={group.part} className="flex flex-col gap-2">
              <div className="mt-2 px-1">
                <h2 className="font-display text-sm font-bold uppercase tracking-wide text-muted">
                  Part {group.part} · {group.title}
                </h2>
                <p className="text-xs text-muted">{group.blurb}</p>
              </div>
              {group.chapters.map((chapter) => (
                <ChapterRow
                  key={chapter.id}
                  chapter={chapter}
                  grammar={grammar}
                  unlocked={isChapterUnlocked(chapter, completed)}
                  completed={completed.includes(chapter.id)}
                />
              ))}
            </section>
          ))}

          <ConjugationReference />
          <PatternsReference />
        </div>
      </main>
    </>
  );
}

/** The book's Appendix A conjugation tables — a collapsible quick reference. */
function ConjugationReference() {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-2 rounded-blob-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span>
          <span className="block font-display font-bold text-ink">Conjugation at a glance</span>
          <span className="text-sm text-muted">Nouns, adjectives, verbs & the て-form</span>
        </span>
        <span aria-hidden className={cn("text-muted transition", open && "rotate-90")}>
          ▸
        </span>
      </button>
      {open ? (
        <div className="flex flex-col gap-5 border-t border-border px-4 py-4">
          {GRAMMAR_TABLES.map((t) => (
            <GrammarTableCard key={t.id} table={t} className="max-w-none" />
          ))}
        </div>
      ) : null}
    </section>
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

function ChapterRow({
  chapter,
  grammar,
  unlocked,
  completed,
}: {
  chapter: GrammarChapter;
  grammar: Record<string, KanaProgress>;
  unlocked: boolean;
  completed: boolean;
}) {
  const learned = chapter.points.filter((p) => (grammar[p.id]?.seen ?? 0) > 0).length;
  const pct = Math.round((learned / Math.max(chapter.points.length, 1)) * 100);

  const inner = (
    <>
      <span
        aria-hidden
        className={cn(
          "grid size-11 shrink-0 place-items-center rounded-blob-lg font-display text-lg font-bold",
          unlocked ? "bg-primary-tint text-primary" : "bg-surface-2 text-muted",
        )}
      >
        {unlocked ? chapter.num : <LockIcon className="size-5" />}
      </span>
      <span className="min-w-0 flex-1">
        <span className="flex items-center gap-2">
          <span className="truncate font-display font-bold text-ink">{chapter.title}</span>
          {completed ? (
            <span aria-label="completed" className="shrink-0 text-success-strong">
              ✓
            </span>
          ) : null}
        </span>
        <span className="block truncate text-sm text-muted">{chapter.subtitle}</span>
        {unlocked && learned > 0 ? (
          <span className="mt-1.5 block h-1.5 w-full overflow-hidden rounded-full bg-surface-2">
            <span className="block h-full rounded-full bg-success" style={{ width: `${pct}%` }} />
          </span>
        ) : null}
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
      href={`/learn/grammar/${chapter.id}`}
      className="flex items-center gap-3 rounded-blob-lg border border-border bg-surface px-4 py-3 transition hover:-translate-y-0.5 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]"
    >
      {inner}
    </Link>
  );
}

/** The book's 50 Core Patterns — a compact, collapsible review index. */
function PatternsReference() {
  const [open, setOpen] = useState(false);
  return (
    <section className="mt-2 rounded-blob-lg border border-border bg-surface">
      <button
        type="button"
        onClick={() => setOpen((o) => !o)}
        aria-expanded={open}
        className="flex w-full items-center justify-between gap-2 px-4 py-3 text-left"
      >
        <span>
          <span className="block font-display font-bold text-ink">50 Core Patterns</span>
          <span className="text-sm text-muted">A quick reference index of every pattern</span>
        </span>
        <span aria-hidden className={cn("text-muted transition", open && "rotate-90")}>
          ▸
        </span>
      </button>
      {open ? (
        <ol className="flex flex-col gap-1 border-t border-border px-4 py-3">
          {GRAMMAR_PATTERNS.map((p) => (
            <li key={p.n} className="flex items-baseline gap-2 text-sm">
              <span className="w-6 shrink-0 text-right font-mono text-xs text-muted">{p.n}</span>
              <span lang="ja" className="font-jp font-semibold text-ink">
                {p.form}
              </span>
              <span className="text-muted">— {p.meaning}</span>
            </li>
          ))}
        </ol>
      ) : null}
    </section>
  );
}
