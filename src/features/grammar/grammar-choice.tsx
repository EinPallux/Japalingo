"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ListenButton } from "@/components/app/listen-button";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/audio";
import { XP_PER_CORRECT } from "@/lib/srs";
import { cn } from "@/lib/utils";
import type { GrammarExample } from "@/types";

type Kind = "translate" | "reverse";

const PROMPT: Record<Kind, string> = {
  translate: "What does this mean?",
  reverse: "Say it in Japanese",
};

export function GrammarChoice({
  ex,
  kind,
  options,
  onAnswer,
}: {
  ex: GrammarExample;
  kind: Kind;
  options: string[];
  onAnswer: (correct: boolean) => void;
}) {
  // translate answers with the English; reverse answers with the kana sentence.
  const answer = kind === "translate" ? ex.en : ex.kana;
  const optionsAreKana = kind === "reverse";
  const [picked, setPicked] = useState<string | null>(null);
  const correct = picked === answer;

  const choose = (opt: string) => {
    if (picked) return;
    setPicked(opt);
    if (opt === answer) sfx.correct();
    else sfx.wrong();
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-muted">{PROMPT[kind]}</p>

      <motion.div
        initial={{ scale: 0.94, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 320, damping: 20 }}
        className={cn(
          "flex min-h-24 w-full flex-col items-center justify-center gap-2 rounded-blob-xl bg-surface-2 px-5 py-6",
          picked && !correct && "anim-shake",
        )}
      >
        {kind === "translate" ? (
          <>
            <span lang="ja" className="font-jp text-2xl font-bold text-ink">
              {ex.jp}
            </span>
            <span lang="ja" className="font-jp text-sm text-muted">
              {ex.kana}
            </span>
            <ListenButton text={ex.jp} />
          </>
        ) : (
          <span className="font-display text-xl font-bold text-ink">{ex.en}</span>
        )}
      </motion.div>

      <div className="grid w-full gap-3">
        {options.map((opt) => {
          const isAnswer = opt === answer;
          const state = !picked ? "idle" : isAnswer ? "correct" : opt === picked ? "wrong" : "dim";
          return (
            <button
              key={opt}
              type="button"
              data-testid="grammar-option"
              disabled={Boolean(picked)}
              onClick={() => choose(opt)}
              className={cn(
                "rounded-blob-lg border-2 px-4 py-3 font-semibold transition",
                optionsAreKana ? "font-jp text-lg" : "font-display text-base",
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

      {picked ? (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full flex-col items-center gap-3"
        >
          <p className={cn("font-bold", correct ? "text-success-strong" : "text-error-strong")}>
            {correct ? `Nice! +${XP_PER_CORRECT} XP` : "Not quite"}
          </p>
          <p lang="ja" className="text-sm text-muted">
            <span className="font-jp text-ink">{ex.jp}</span> — {ex.en}
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
