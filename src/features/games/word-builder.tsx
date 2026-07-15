"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { ListenButton } from "@/components/app/listen-button";
import { NotEnoughKana } from "@/components/game/not-enough-kana";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { WORDS } from "@/data/words";
import { sfx } from "@/lib/audio";
import { learnedKana } from "@/lib/learned";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { ExampleWord } from "@/types";

const ROUNDS = 8;
/** Need at least four readable words so every round can show four options. */
const MIN_WORDS = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** Words the learner can actually decode — every character already met. */
function decodableWords(learnedChars: Set<string>): ExampleWord[] {
  return WORDS.filter((w) => [...w.kana].every((ch) => learnedChars.has(ch)));
}

function buildRounds(words: ExampleWord[]): { word: ExampleWord; options: string[] }[] {
  return shuffle(words)
    .slice(0, Math.min(ROUNDS, words.length))
    .map((word) => {
      const distractors = shuffle(words.filter((w) => w.meaning !== word.meaning))
        .slice(0, 3)
        .map((w) => w.meaning);
      return { word, options: shuffle([word.meaning, ...distractors]) };
    });
}

export function WordBuilder() {
  const mounted = useMounted();
  const kanaProgress = useProgress((s) => s.kana);
  // Word Builder is hiragana-only for now (the /database words are all hiragana);
  // katakana words are content-gated until the owner adds them.
  const words = useMemo(() => {
    const learnedChars = new Set(learnedKana("hiragana", kanaProgress).map((k) => k.char));
    return decodableWords(learnedChars);
  }, [kanaProgress]);

  if (!mounted) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </main>
    );
  }

  if (words.length < MIN_WORDS) {
    return <NotEnoughKana need={MIN_WORDS} have={words.length} unit="readable words" />;
  }

  return <WordBuilderGame words={words} />;
}

/** The quiz itself — mounted only once enough decodable words exist. */
function WordBuilderGame({ words }: { words: ExampleWord[] }) {
  const router = useRouter();
  const rounds = useMemo(() => buildRounds(words), [words]);
  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);
  const [xpBefore] = useState(() => useProgress.getState().xp);

  const cur = rounds[index]!;
  const correct = picked === cur.word.meaning;

  const pick = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === cur.word.meaning) {
      sfx.correct();
      setCorrectCount((c) => c + 1);
      // Reading a real word counts like any correct answer: XP + coins + daily.
      useProgress.getState().rewardCorrect();
    } else {
      sfx.wrong();
    }
  };

  const next = () => {
    if (index + 1 >= rounds.length) {
      sfx.complete();
      setEarned(useProgress.getState().xp - xpBefore);
      setDone(true);
      return;
    }
    setIndex((i) => i + 1);
    setPicked(null);
  };

  if (done) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <HoshiStatic className="size-32" />
          <h1 className="font-display text-3xl font-bold text-ink">You can read Japanese! 📖</h1>
          <p className="text-muted">
            {correctCount}/{rounds.length} words · +{earned} XP
          </p>
          <div className="flex w-full flex-col gap-3">
            <Button onClick={() => router.push("/learn")} size="lg" className="w-full">
              Back to path
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-5">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          aria-label="Exit game"
          onClick={() => router.push("/learn")}
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2"
        >
          <CloseIcon className="size-6" />
        </button>
        <p className="font-display font-bold text-muted">
          {index + 1} / {rounds.length}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-7 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-muted">What does this word mean?</p>

        <div className="grid min-h-32 w-full place-items-center rounded-blob-xl bg-primary-tint px-4 py-6">
          <span lang="ja" className="font-jp text-6xl font-bold text-primary">
            {cur.word.kana}
          </span>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          {cur.options.map((opt) => {
            const isAnswer = opt === cur.word.meaning;
            const state = !picked ? "idle" : isAnswer ? "correct" : opt === picked ? "wrong" : "dim";
            return (
              <button
                key={opt}
                type="button"
                disabled={Boolean(picked)}
                onClick={() => pick(opt)}
                className={cn(
                  "rounded-blob-lg border-2 px-4 py-4 font-display font-bold transition",
                  state === "idle" && "border-border bg-surface text-ink hover:border-primary/50 hover:bg-primary-tint",
                  state === "correct" && "border-success bg-success/15 text-success-strong",
                  state === "wrong" && "border-error bg-error/15 text-error-strong",
                  state === "dim" && "border-border bg-surface text-muted opacity-60",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>

        {picked ? (
          <motion.div
            initial={{ opacity: 0, y: 8 }}
            animate={{ opacity: 1, y: 0 }}
            className="flex w-full flex-col items-center gap-3"
          >
            <p
              aria-live="polite"
              className={cn("font-bold", correct ? "text-success-strong" : "text-error-strong")}
            >
              {correct ? "Correct! " : "Not quite — "}
              <span lang="ja" className="font-jp">
                {cur.word.kana}
              </span>{" "}
              ({cur.word.romaji}) = {cur.word.meaning}
            </p>
            <ListenButton text={cur.word.kana} label="Hear it" />
            <Button onClick={next} size="lg" className="w-full">
              Continue
            </Button>
          </motion.div>
        ) : null}
      </div>
    </main>
  );
}
