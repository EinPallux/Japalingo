"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { ALL_KANA } from "@/data/curriculum";
import { useMounted } from "@/lib/use-mounted";
import { useProgress } from "@/stores/progress";
import { PracticeSession } from "./practice-session";

const REVIEW_SIZE = 12;

export function PracticeHub() {
  const mounted = useMounted();
  const kanaProgress = useProgress((s) => s.kana);
  const [inSession, setInSession] = useState(false);

  const learned = useMemo(
    () => ALL_KANA.filter((k) => (kanaProgress[k.id]?.seen ?? 0) > 0),
    [kanaProgress],
  );
  const reviewSet = useMemo(
    () =>
      [...learned]
        .sort((a, b) => (kanaProgress[a.id]?.mastery ?? 0) - (kanaProgress[b.id]?.mastery ?? 0))
        .slice(0, REVIEW_SIZE),
    [learned, kanaProgress],
  );

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  if (inSession) {
    return <PracticeSession kana={reviewSet} onExit={() => setInSession(false)} />;
  }

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto flex max-w-md flex-col items-center gap-6 px-5 py-10 text-center">
        <HoshiStatic className="size-28" />
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Practice</h1>
          <p className="mt-1 text-muted">Spaced review keeps kana from slipping away.</p>
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
              <div className="rounded-blob-lg border border-border bg-secondary-tint p-4">
                <p className="font-display text-3xl font-bold text-secondary-strong">
                  {reviewSet.length}
                </p>
                <p className="text-sm font-semibold text-muted">to review now</p>
              </div>
            </div>
            <Button onClick={() => setInSession(true)} size="lg" className="w-full">
              Start review
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
