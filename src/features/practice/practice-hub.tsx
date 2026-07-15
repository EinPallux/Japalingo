"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { ALL_KANA } from "@/data/curriculum";
import { isDue } from "@/lib/srs";
import { useMounted } from "@/lib/use-mounted";
import { useNow } from "@/lib/use-now";
import { useProgress } from "@/stores/progress";
import type { Kana } from "@/types";
import { PracticeSession } from "./practice-session";

const REVIEW_SIZE = 12;

export function PracticeHub() {
  const mounted = useMounted();
  const kanaProgress = useProgress((s) => s.kana);
  const now = useNow();
  // Freeze the reviewed set at session start — otherwise answering mutates the
  // live reviewSet and rebuilds the session's queue mid-review.
  const [sessionKana, setSessionKana] = useState<Kana[] | null>(null);

  const learned = useMemo(
    () => ALL_KANA.filter((k) => (kanaProgress[k.id]?.seen ?? 0) > 0),
    [kanaProgress],
  );
  const due = useMemo(
    () => learned.filter((k) => isDue(kanaProgress[k.id], now)),
    [learned, kanaProgress, now],
  );
  const reviewSet = useMemo(() => {
    const pool = due.length ? due : learned;
    return [...pool]
      .sort((a, b) => (kanaProgress[a.id]?.mastery ?? 0) - (kanaProgress[b.id]?.mastery ?? 0))
      .slice(0, REVIEW_SIZE);
  }, [due, learned, kanaProgress]);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  if (sessionKana) {
    return <PracticeSession kana={sessionKana} onExit={() => setSessionKana(null)} />;
  }

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto flex max-w-md flex-col items-center gap-6 px-5 py-10 text-center">
        <HoshiStatic className="size-28" />
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Practice</h1>
          <p className="mt-1 text-muted">Spaced review brings kana back just before you&apos;d forget.</p>
        </div>

        {learned.length === 0 ? (
          <>
            <div className="rounded-blob-lg border border-border bg-surface p-6">
              <p className="text-ink">Learn a few kana first, then come back to review them here!</p>
            </div>
            <Button href="/learn" size="lg" className="w-full">
              Start learning
            </Button>
          </>
        ) : (
          <>
            <div className="grid w-full grid-cols-2 gap-3">
              <div className="rounded-blob-lg border border-border bg-primary-tint p-4">
                <p className="font-display text-3xl font-bold text-primary">{learned.length}</p>
                <p className="text-sm font-semibold text-muted">kana met</p>
              </div>
              <div
                className={cnPill(due.length)}
              >
                <p
                  className={
                    "font-display text-3xl font-bold " +
                    (due.length ? "text-secondary-strong" : "text-success-strong")
                  }
                >
                  {due.length}
                </p>
                <p className="text-sm font-semibold text-muted">due now</p>
              </div>
            </div>

            {due.length === 0 ? (
              <p className="font-display font-bold text-success-strong">🎉 You&apos;re all caught up!</p>
            ) : null}

            <Button onClick={() => setSessionKana(reviewSet)} size="lg" className="w-full">
              {due.length ? `Review ${Math.min(due.length, REVIEW_SIZE)} kana` : "Practice anyway"}
            </Button>
            <Button href="/learn" size="lg" variant="ghost" className="w-full">
              Back to path
            </Button>
          </>
        )}
      </main>
    </>
  );
}

function cnPill(due: number): string {
  return (
    "rounded-blob-lg border border-border p-4 " + (due ? "bg-secondary-tint" : "bg-success/15")
  );
}
