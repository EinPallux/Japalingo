"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { HoshiCoach, type CoachMood } from "@/components/mascot/hoshi-coach";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { deckWords } from "@/data/vocab-decks";
import { sfx } from "@/lib/audio";
import { useMounted } from "@/lib/use-mounted";
import { buildVocabQueue } from "@/lib/vocab-queue";
import { useProgress } from "@/stores/progress";
import type { VocabDeck } from "@/types";
import { VocabChoice } from "./vocab-choice";
import { VocabResults } from "./vocab-results";
import { WordCard } from "./word-card";

export function VocabLesson({ deck }: { deck: VocabDeck }) {
  const router = useRouter();
  const mounted = useMounted();
  const words = useMemo(() => deckWords(deck), [deck]);
  const queue = useMemo(() => buildVocabQueue(words), [words]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [xpBefore] = useState(() => useProgress.getState().xp);
  const [coach, setCoach] = useState<{ mood: CoachMood; nonce: number; streak: number }>({
    mood: "idle",
    nonce: 0,
    streak: 0,
  });

  const answerVocab = useProgress((s) => s.answerVocab);
  const markVocabSeen = useProgress((s) => s.markVocabSeen);
  const completeVocabDeck = useProgress((s) => s.completeVocabDeck);

  const react = (correct: boolean) =>
    setCoach((c) => {
      const streak = correct ? c.streak + 1 : 0;
      const mood: CoachMood = correct ? (streak >= 3 ? "cheer" : "idle") : "encourage";
      return { mood, streak, nonce: c.nonce + 1 };
    });

  const exit = () => router.push("/learn/vocab");

  const advance = () => {
    if (index + 1 >= queue.length) {
      completeVocabDeck(deck.id);
      sfx.complete();
      setEarnedXp(useProgress.getState().xp - xpBefore);
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  if (!mounted) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </main>
    );
  }

  if (done) {
    return <VocabResults deck={deck} xpEarned={earnedXp} wordCount={words.length} onContinue={exit} />;
  }

  const ex = queue[index];
  const pct = Math.round((index / Math.max(queue.length, 1)) * 100);

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-5">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          aria-label="Exit lesson"
          onClick={exit}
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
            {ex?.kind === "learn" && (
              <div className="flex w-full flex-col items-center gap-6">
                <WordCard word={ex.word} />
                <Button
                  onClick={() => {
                    markVocabSeen(ex.word.id);
                    advance();
                  }}
                  size="lg"
                  className="w-full max-w-md"
                >
                  Got it
                </Button>
              </div>
            )}
            {ex && ex.kind !== "learn" && (
              <VocabChoice
                word={ex.word}
                kind={ex.kind}
                options={ex.options}
                onAnswer={(correct) => {
                  answerVocab(ex.word.id, correct);
                  react(correct);
                  advance();
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <HoshiCoach mood={coach.mood} nonce={coach.nonce} streak={coach.streak} />
    </main>
  );
}
