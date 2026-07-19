"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ListenButton } from "@/components/app/listen-button";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/audio";
import { XP_PER_CORRECT } from "@/lib/srs";
import { cn } from "@/lib/utils";
import type { GrammarExample } from "@/types";

/** Assemble the kana sentence from shuffled phrase tiles (kana-first — no kanji
 *  needed). Tap a bank tile to place it; tap a placed tile to send it back. */
export function GrammarBuild({
  ex,
  tiles,
  answer,
  onAnswer,
}: {
  ex: GrammarExample;
  tiles: string[];
  answer: string[];
  onAnswer: (correct: boolean) => void;
}) {
  // tiles indexed for stable identity (chunks can repeat)
  const [bank, setBank] = useState<number[]>(() => tiles.map((_, i) => i));
  const [placed, setPlaced] = useState<number[]>([]);
  const [checked, setChecked] = useState<null | boolean>(null);

  const place = (i: number) => {
    if (checked !== null) return;
    sfx.pop();
    setBank((b) => b.filter((x) => x !== i));
    setPlaced((p) => [...p, i]);
  };
  const unplace = (i: number) => {
    if (checked !== null) return;
    sfx.tap();
    setPlaced((p) => p.filter((x) => x !== i));
    setBank((b) => [...b, i]);
  };

  const check = () => {
    const built = placed.map((i) => tiles[i]);
    const ok = built.join(" ") === answer.join(" ");
    setChecked(ok);
    if (ok) sfx.correct();
    else sfx.wrong();
  };

  return (
    <div className="flex w-full max-w-lg flex-col items-center gap-6 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-muted">Build the sentence</p>

      <div className="flex w-full flex-col items-center gap-1 rounded-blob-xl bg-surface-2 px-5 py-4">
        <span className="font-display text-lg font-bold text-ink">{ex.en}</span>
      </div>

      {/* Answer line */}
      <div
        className={cn(
          "flex min-h-16 w-full flex-wrap content-start items-start gap-2 rounded-blob-lg border-2 border-dashed border-border bg-surface p-3",
          checked === false && "anim-shake border-error",
          checked === true && "border-success",
        )}
      >
        {placed.length === 0 ? (
          <span className="m-auto text-sm text-muted">Tap the tiles below in order</span>
        ) : null}
        {placed.map((i) => (
          <motion.button
            key={i}
            layout
            type="button"
            onClick={() => unplace(i)}
            lang="ja"
            className="rounded-blob-md border-2 border-primary/40 bg-primary-tint px-3 py-2 font-jp text-lg font-semibold text-ink"
          >
            {tiles[i]}
          </motion.button>
        ))}
      </div>

      {/* Tile bank */}
      <div className="flex min-h-16 w-full flex-wrap items-start justify-center gap-2">
        {bank.map((i) => (
          <motion.button
            key={i}
            layout
            type="button"
            data-testid="build-tile"
            onClick={() => place(i)}
            lang="ja"
            className="rounded-blob-md border-2 border-border bg-surface px-3 py-2 font-jp text-lg font-semibold text-ink transition hover:border-primary/50 hover:bg-primary-tint"
          >
            {tiles[i]}
          </motion.button>
        ))}
      </div>

      {checked === null ? (
        <Button onClick={check} size="lg" disabled={bank.length > 0} className="w-full">
          Check
        </Button>
      ) : (
        <motion.div
          initial={{ opacity: 0, y: 8 }}
          animate={{ opacity: 1, y: 0 }}
          className="flex w-full flex-col items-center gap-3"
        >
          <p className={cn("font-bold", checked ? "text-success-strong" : "text-error-strong")}>
            {checked ? `Correct! +${XP_PER_CORRECT} XP` : "Not quite"}
          </p>
          <p lang="ja" className="flex flex-col items-center gap-1 text-sm text-muted">
            <span className="font-jp text-base text-ink">{answer.join(" ")}</span>
            <span>{ex.en}</span>
          </p>
          <ListenButton text={ex.jp} />
          <Button
            onClick={() => onAnswer(checked)}
            size="lg"
            variant={checked ? "primary" : "secondary"}
            className="w-full"
          >
            Continue
          </Button>
        </motion.div>
      )}
    </div>
  );
}
