"use client";

import { motion } from "framer-motion";
import { useState } from "react";
import { ListenButton } from "@/components/app/listen-button";
import { Button } from "@/components/ui/button";
import { sfx } from "@/lib/audio";
import type { Grade } from "@/lib/srs";
import { cn } from "@/lib/utils";
import type { Kana } from "@/types";

const GRADES: { grade: Grade; label: string; className: string }[] = [
  { grade: "again", label: "Again", className: "border-error/60 text-error-strong hover:bg-error/10" },
  { grade: "hard", label: "Hard", className: "border-accent-strong/50 text-accent-strong hover:bg-accent-tint" },
  { grade: "good", label: "Good", className: "border-primary/50 text-primary hover:bg-primary-tint" },
  { grade: "easy", label: "Easy", className: "border-success/60 text-success-strong hover:bg-success/10" },
];

export function KanaDrill({ kana, onRate }: { kana: Kana; onRate: (grade: Grade) => void }) {
  const [revealed, setRevealed] = useState(false);

  return (
    <div className="flex w-full flex-col items-center gap-7 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-muted">Do you remember this one?</p>

      <div className="grid min-h-52 w-full max-w-md place-items-center gap-3 rounded-blob-xl bg-surface-2 p-6">
        <span lang="ja" className="font-jp text-8xl font-bold text-ink">
          {kana.char}
        </span>
        {revealed ? (
          <motion.div initial={{ opacity: 0, y: 8 }} animate={{ opacity: 1, y: 0 }}>
            <p className="font-display text-2xl font-bold text-primary">{kana.romaji}</p>
            <p className="mt-1 text-sm text-muted">{kana.mnemonic}</p>
          </motion.div>
        ) : null}
      </div>

      <ListenButton text={kana.char} />

      {revealed ? (
        <div className="grid w-full max-w-md grid-cols-2 gap-3 sm:grid-cols-4">
          {GRADES.map(({ grade, label, className }) => (
            <button
              key={grade}
              type="button"
              data-testid="grade"
              onClick={() => {
                if (grade === "again") sfx.wrong();
                else sfx.correct();
                onRate(grade);
              }}
              className={cn(
                "rounded-blob border-2 bg-surface px-3 py-3 font-display font-bold transition",
                className,
              )}
            >
              {label}
            </button>
          ))}
        </div>
      ) : (
        <Button onClick={() => setRevealed(true)} size="lg" variant="ghost" className="w-full max-w-xs">
          Reveal
        </Button>
      )}
    </div>
  );
}
