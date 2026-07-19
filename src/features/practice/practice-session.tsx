"use client";

import { useMemo, useRef, useState } from "react";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { buildReviewQueue } from "@/features/lessons/build-queue";
import { KanaDrill } from "@/features/lessons/modes/kana-drill";
import { QuickMatch } from "@/features/lessons/modes/quick-match";
import { sfx } from "@/lib/audio";
import { useProgress } from "@/stores/progress";
import type { Kana } from "@/types";

export function PracticeSession({ kana, onExit }: { kana: Kana[]; onExit: () => void }) {
  const queue = useMemo(() => buildReviewQueue(kana), [kana]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [xpBefore] = useState(() => useProgress.getState().xp);

  const answer = useProgress((s) => s.answer);
  const rate = useProgress((s) => s.rate);

  // double-tap guard: one grade per exercise, even mid transition
  const steppedRef = useRef(-1);
  const advance = () => {
    if (steppedRef.current === index) return;
    steppedRef.current = index;
    if (index + 1 >= queue.length) {
      sfx.complete();
      setEarnedXp(useProgress.getState().xp - xpBefore);
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (done) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <HoshiStatic className="size-32" />
          <h1 className="font-display text-3xl font-bold text-ink">Review done! 💪</h1>
          <p className="text-muted">
            +{earnedXp} XP · {kana.length} kana refreshed
          </p>
          <Button onClick={onExit} size="lg" className="w-full max-w-xs">
            Done
          </Button>
        </div>
      </main>
    );
  }

  const ex = queue[index];
  const pct = Math.round((index / Math.max(queue.length, 1)) * 100);

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-5">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          aria-label="Exit review"
          onClick={onExit}
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2"
        >
          <CloseIcon className="size-6" />
        </button>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-success transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center py-4">
        {ex?.kind === "choice" && (
          <QuickMatch
            key={index}
            kana={ex.kana}
            direction={ex.direction}
            options={ex.options}
            onAnswer={(correct) => {
              if (steppedRef.current === index) return; // double-tap guard
              answer(ex.kana.id, correct);
              advance();
            }}
          />
        )}
        {ex?.kind === "drill" && (
          <KanaDrill
            key={index}
            kana={ex.kana}
            onRate={(grade) => {
              if (steppedRef.current === index) return; // double-tap guard
              rate(ex.kana.id, grade);
              advance();
            }}
          />
        )}
      </div>
    </main>
  );
}
