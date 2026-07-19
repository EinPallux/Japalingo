"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useState } from "react";
import { ListenButton } from "@/components/app/listen-button";
import { Confetti } from "@/components/feedback/confetti";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { CONCEPTS } from "@/data/concepts";
import { sfx } from "@/lib/audio";
import { useProgress } from "@/stores/progress";
import type { Lesson } from "@/types";

const anim = {
  initial: { opacity: 0, x: 50 },
  animate: { opacity: 1, x: 0 },
  exit: { opacity: 0, x: -50 },
};

/**
 * A self-contained lesson for a writing *rule* rather than a kana with a reading
 * — the small っ (doubling) and the long vowel ー (stretch). It teaches the rule,
 * then has the learner read the book's example words. Routed to by the lesson
 * player when `lesson.kind` is "sokuon" or "chouon".
 */
export function ConceptLesson({ lesson, onExit }: { lesson: Lesson; onExit: () => void }) {
  const concept = CONCEPTS[lesson.kind as "sokuon" | "chouon"];
  const completeLesson = useProgress((s) => s.completeLesson);
  // step 0 = concept intro, 1..N = read a word, then the finish screen.
  const [step, setStep] = useState(0);
  const [revealed, setRevealed] = useState(false);
  const [done, setDone] = useState(false);

  const word = concept.words[step - 1];

  const next = () => {
    if (step === concept.words.length) {
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
            <h1 className="font-display text-3xl font-bold text-ink">{concept.doneTitle}</h1>
            <p className="mt-1 text-muted">{concept.doneNote}</p>
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
            style={{ width: `${Math.round((step / (concept.words.length + 1)) * 100)}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-x-clip py-4">
        <AnimatePresence mode="wait" initial={false}>
          {step === 0 ? (
            <motion.div key="intro" {...anim} className="flex w-full flex-col items-center gap-6 text-center">
              <p className="text-sm font-bold uppercase tracking-wide text-secondary-strong">
                {concept.eyebrow}
              </p>
              <div className="grid size-40 place-items-center rounded-blob-xl bg-primary-tint">
                <span lang="ja" className="font-jp text-7xl font-bold text-primary">
                  {concept.markChar}
                </span>
              </div>
              <div className="max-w-md">
                <h1 className="font-display text-2xl font-bold text-ink">{concept.title}</h1>
                {concept.paragraphs.map((para) => (
                  <p key={para} className="mt-2 text-muted">
                    {para}
                  </p>
                ))}
              </div>
              <Button onClick={next} size="lg" className="w-full max-w-xs">
                Got it — let&apos;s read
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
                    <p className="mt-1 text-sm text-muted">{word.note}.</p>
                  </motion.div>
                ) : null}
              </div>
              <ListenButton text={word.kana} />
              {revealed ? (
                <Button onClick={next} size="lg" className="w-full max-w-xs">
                  {step === concept.words.length ? "Finish" : "Next"}
                </Button>
              ) : (
                <Button
                  onClick={() => {
                    sfx.tap();
                    setRevealed(true);
                  }}
                  size="lg"
                  variant="ghost"
                  className="w-full max-w-xs"
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
