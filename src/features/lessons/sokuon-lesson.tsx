"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ListenButton } from "@/components/app/listen-button";
import { Confetti } from "@/components/feedback/confetti";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { SOKUON_WORDS } from "@/data/sokuon";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { Lesson } from "@/types";

const anim = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

/**
 * A self-contained concept lesson for the small っ. Unlike a normal kana lesson,
 * っ has no reading of its own — it's a doubling rule — so this teaches the rule
 * (from the book) and then has the learner read the book's example words. Routed
 * to by the lesson player when `lesson.kind === "sokuon"`.
 */
export function SokuonLesson({ lesson, onExit }: { lesson: Lesson; onExit: () => void }) {
  const completeLesson = useProgress((s) => s.completeLesson);
  // step 0 = concept intro, 1..N = read a word, then the finish screen.
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const word = SOKUON_WORDS[step - 1];

  const next = () => {
    if (step > SOKUON_WORDS.length) return;
    if (step === SOKUON_WORDS.length) {
      completeLesson(lesson.id);
      sfx.complete();
      setDone(true);
      return;
    }
    setStep((s) => s + 1);
    setRevealed(false);
  };

  if (done) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 py-10">
        <Confetti />
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <div className="anim-bob">
            <HoshiStatic className="size-36" />
          </div>
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">Small っ mastered! 🎉</h1>
            <p className="mt-1 text-muted">Now you can spot the little pause and double it.</p>
          </div>
          <Button onClick={onExit} size="lg" className="w-full max-w-xs">
            Continue
          </Button>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-5">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          aria-label="Exit lesson"
          onClick={onExit}
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2"
        >
          <CloseIcon className="size-6" />
        </button>
        <div className="h-4 flex-1 overflow-hidden rounded-full bg-surface-2">
          <div
            className="h-full rounded-full bg-success transition-all duration-300"
            style={{ width: `${Math.round((step / (SOKUON_WORDS.length + 1)) * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-x-clip py-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 ? (
            <motion.div key="intro" {...anim} className="flex w-full flex-col items-center gap-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-secondary-strong">New idea</p>
              <div className="grid size-40 place-items-center rounded-blob-xl bg-primary-tint">
                <span lang="ja" className="font-jp text-7xl font-bold text-primary">
                  っ
                </span>
              </div>
              <div className="max-w-md">
                <h1 className="font-display text-2xl font-bold text-ink">The small っ</h1>
                <p className="mt-2 text-muted">
                  A little half-size っ (a mini つ) has <strong>no sound of its own</strong>. It marks a
                  quick pause and <strong>doubles the next consonant</strong>.
                </p>
                <p className="mt-3 text-ink">
                  So{" "}
                  <span lang="ja" className="font-jp text-xl font-bold">
                    いっか
                  </span>{" "}
                  is read <strong>ikka</strong> — the k is doubled. (Katakana&apos;s ッ works exactly the
                  same way.)
                </p>
              </div>
              <Button onClick={next} size="lg" className="w-full max-w-xs">
                Got it — let&apos;s read some
              </Button>
            </motion.div>
          ) : word ? (
            <motion.div key={step} {...anim} className="flex w-full flex-col items-center gap-7 text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-muted">How do you read this?</p>
              <div className="grid min-h-40 w-full max-w-md place-items-center gap-3 rounded-blob-xl bg-surface-2 px-4 py-6">
                <span lang="ja" className="font-jp text-6xl font-bold text-ink">
                  {word.kana}
                </span>
                {revealed ? (
                  <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
                    <p className="font-display text-3xl font-bold text-primary">{word.romaji}</p>
                    <p className="mt-1 text-sm text-muted">The small っ {word.note}.</p>
                  </motion.div>
                ) : null}
              </div>
              <ListenButton text={word.kana} />
              {revealed ? (
                <Button onClick={next} size="lg" className="w-full max-w-xs">
                  {step === SOKUON_WORDS.length ? "Finish" : "Next"}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    sfx.tap();
                    setRevealed(true);
                  }}
                  size="lg"
                  variant="ghost"
                  className={cn("w-full max-w-xs")}
                >
                  Reveal the reading
                </Button>
              )}
            </motion.div>
          ) : null}
        </AnimatePresence>
      </div>
    </main>
  );
}
