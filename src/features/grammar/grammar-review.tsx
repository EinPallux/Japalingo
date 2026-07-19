"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useMemo, useState } from "react";
import { HoshiCoach, type CoachMood } from "@/components/mascot/hoshi-coach";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { sfx } from "@/lib/audio";
import type { TaggedExample } from "@/lib/grammar";
import { buildGrammarReviewQueue } from "@/lib/grammar-lesson";
import { useProgress } from "@/stores/progress";
import { GrammarBuild } from "./grammar-build";
import { GrammarChoice } from "./grammar-choice";

export function GrammarReview({ items, onExit }: { items: TaggedExample[]; onExit: () => void }) {
  const queue = useMemo(() => buildGrammarReviewQueue(items), [items]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [xpBefore] = useState(() => useProgress.getState().xp);
  const [coach, setCoach] = useState<{ mood: CoachMood; nonce: number; streak: number }>({
    mood: "idle",
    nonce: 0,
    streak: 0,
  });

  const answerGrammar = useProgress((s) => s.answerGrammar);

  const grade = (pointId: string, correct: boolean) => {
    answerGrammar(pointId, correct);
    setCoach((c) => {
      const streak = correct ? c.streak + 1 : 0;
      const mood: CoachMood = correct ? (streak >= 3 ? "cheer" : "idle") : "encourage";
      return { mood, streak, nonce: c.nonce + 1 };
    });
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
            +{earnedXp} XP · {items.length} points refreshed
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

      <div className="flex flex-1 items-center justify-center overflow-x-clip py-4">
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="flex w-full items-center justify-center"
          >
            {(ex?.kind === "translate" || ex?.kind === "reverse") && (
              <GrammarChoice
                ex={ex.item.ex}
                kind={ex.kind}
                options={ex.options}
                onAnswer={(correct) => grade(ex.item.pointId, correct)}
              />
            )}
            {ex?.kind === "build" && (
              <GrammarBuild
                ex={ex.item.ex}
                tiles={ex.tiles}
                answer={ex.answer}
                onAnswer={(correct) => grade(ex.item.pointId, correct)}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <HoshiCoach mood={coach.mood} nonce={coach.nonce} streak={coach.streak} />
    </main>
  );
}
