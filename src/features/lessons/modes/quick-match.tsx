"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ListenButton } from "@/components/app/listen-button";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/audio";
import { XP_PER_CORRECT } from "@/lib/srs";
import { cn } from "@/lib/utils";
import type { Kana } from "@/types";

export function QuickMatch({
  kana,
  direction,
  options,
  onAnswer,
}: {
  kana: Kana;
  direction: "k2r" | "r2k";
  options: string[];
  onAnswer: (correct: boolean) => void;
}) {
  const answer = direction === "k2r" ? kana.romaji : kana.char;
  const prompt = direction === "k2r" ? kana.char : kana.romaji;
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === answer;

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === answer) sfx.correct();
    else sfx.wrong();
  };

  return (
    <div className="flex w-full flex-col items-center gap-7 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-muted">
        {direction === "k2r" ? "Which reading?" : "Which character?"}
      </p>

      <motion.div
        initial={{ scale: 0.85, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className={cn(
          "relative grid size-40 place-items-center rounded-blob-xl bg-surface-2",
          picked && !correct && "anim-shake",
        )}
      >
        <span
          lang={direction === "k2r" ? "ja" : undefined}
          className={cn(
            "font-bold text-ink",
            direction === "k2r" ? "font-jp text-8xl" : "font-display text-6xl",
          )}
        >
          {prompt}
        </span>
        {/* Floating "+XP" reward on a correct pick — the little dopamine hit. */}
        {picked && correct ? (
          <motion.span
            initial={{ opacity: 0, y: 6, scale: 0.7 }}
            animate={{ opacity: [0, 1, 1, 0], y: -46, scale: 1.05 }}
            transition={{ duration: 1.1, ease: "easeOut" }}
            className="pointer-events-none absolute -top-2 right-0 font-display text-lg font-bold text-accent-strong"
            aria-hidden
          >
            +{XP_PER_CORRECT} XP
          </motion.span>
        ) : null}
      </motion.div>

      {direction === "k2r" ? <ListenButton text={kana.char} /> : null}

      <div className="grid w-full max-w-md grid-cols-2 gap-3">
        {options.map((opt) => {
          const isAnswer = opt === answer;
          const state = !picked
            ? "idle"
            : isAnswer
              ? "correct"
              : opt === picked
                ? "wrong"
                : "dim";
          return (
            <button
              key={opt}
              type="button"
              data-testid="choice-option"
              disabled={Boolean(picked)}
              onClick={() => choose(opt)}
              className={cn(
                "rounded-blob-lg border-2 px-4 py-5 font-bold transition",
                direction === "r2k" ? "font-jp text-4xl" : "font-display text-2xl",
                state === "idle" &&
                  "border-border bg-surface text-ink hover:border-primary/50 hover:bg-primary-tint",
                state === "correct" && "anim-pop border-success bg-success/15 text-success-strong",
                state === "wrong" && "anim-shake border-error bg-error/15 text-error-strong",
                state === "dim" && "border-border bg-surface text-muted opacity-60",
              )}
            >
              <span lang={direction === "r2k" ? "ja" : undefined}>{opt}</span>
            </button>
          );
        })}
      </div>

      {picked ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full max-w-md flex-col items-center gap-3"
        >
          <p className={cn("font-bold", correct ? "text-success-strong" : "text-error-strong")}>
            {correct ? "Nice! " : "Not quite — "}
            <span lang="ja" className="font-jp">
              {kana.char}
            </span>{" "}
            = {kana.romaji}
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
