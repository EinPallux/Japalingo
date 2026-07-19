"use client";

import { motion } from "framer-motion";
import { useEffect, useState } from "react";
import { ListenButton } from "@/components/app/listen-button";
import { Button } from "@/components/ui/button";
import { SpeakerIcon } from "@/components/ui/icons";
import { speakableReading } from "@/data/vocab-decks";
import { sfx, speakJa } from "@/lib/audio";
import { XP_PER_CORRECT } from "@/lib/srs";
import { cn } from "@/lib/utils";
import type { VocabWord } from "@/types";
import { KanjiChip } from "./word-card";

type Kind = "m2w" | "w2m" | "listen";

const PROMPT: Record<Kind, string> = {
  m2w: "Which word?",
  w2m: "What does it mean?",
  listen: "Listen — what does it mean?",
};

export function VocabChoice({
  word,
  kind,
  options,
  onAnswer,
}: {
  word: VocabWord;
  kind: Kind;
  options: string[];
  onAnswer: (correct: boolean) => void;
}) {
  // m2w answers with the reading; w2m/listen answer with the meaning.
  const answer = kind === "m2w" ? word.reading : word.meaning;
  const optionsAreKana = kind === "m2w";
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === answer;

  // Listening exercises play the word once when they appear.
  useEffect(() => {
    if (kind === "listen") speakJa(speakableReading(word));
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, []);

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === answer) sfx.correct();
    else sfx.wrong();
  };

  return (
    <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-muted">{PROMPT[kind]}</p>

      {/* Prompt */}
      <motion.div
        initial={{ scale: 0.9, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className={cn(
          "flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-blob-xl bg-surface-2 px-5 py-6",
          picked && !correct && "anim-shake",
        )}
      >
        {kind === "listen" ? (
          <button
            type="button"
            aria-label="Play the word again"
            onClick={() => speakJa(speakableReading(word))}
            className="grid size-20 place-items-center rounded-full bg-info/15 text-info transition hover:bg-info/25"
          >
            <SpeakerIcon className="size-9" />
          </button>
        ) : kind === "w2m" ? (
          <>
            <span lang="ja" className="font-jp text-5xl font-bold text-ink">
              {word.reading}
            </span>
            <ListenButton text={speakableReading(word)} />
          </>
        ) : (
          <span className="font-display text-2xl font-bold text-ink">{word.meaning}</span>
        )}
      </motion.div>

      {/* Options */}
      <div className="grid w-full grid-cols-2 gap-3">
        {options.map((opt) => {
          const isAnswer = opt === answer;
          const state = !picked ? "idle" : isAnswer ? "correct" : opt === picked ? "wrong" : "dim";
          return (
            <button
              key={opt}
              type="button"
              data-testid="vocab-option"
              disabled={Boolean(picked)}
              onClick={() => choose(opt)}
              className={cn(
                "min-h-16 rounded-blob-lg border-2 px-3 py-4 font-bold transition",
                optionsAreKana ? "font-jp text-2xl" : "font-display text-base",
                state === "idle" &&
                  "border-border bg-surface text-ink hover:border-primary/50 hover:bg-primary-tint",
                state === "correct" && "anim-pop border-success bg-success/15 text-success-strong",
                state === "wrong" && "anim-shake border-error bg-error/15 text-error-strong",
                state === "dim" && "border-border bg-surface text-muted opacity-60",
              )}
            >
              <span lang={optionsAreKana ? "ja" : undefined}>{opt}</span>
            </button>
          );
        })}
      </div>

      {/* Reward + reveal + continue */}
      {picked ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full flex-col items-center gap-3"
        >
          <p
            className={cn(
              "flex flex-wrap items-center justify-center gap-x-2 font-bold",
              correct ? "text-success-strong" : "text-error-strong",
            )}
          >
            <span>{correct ? `Nice! +${XP_PER_CORRECT} XP` : "Not quite —"}</span>
            <span lang="ja" className="font-jp text-ink">
              {word.reading}
            </span>
            <span className="text-ink">= {word.meaning}</span>
            {word.kanji ? <KanjiChip kanji={word.kanji} /> : null}
          </p>
          <Button
            onClick={() => onAnswer(correct)}
            size="lg"
            variant={correct ? "primary" : "secondary"}
            className="w-full"
          >
            Continue
          </Button>
        </motion.div>
      ) : null}
    </div>
  );
}
