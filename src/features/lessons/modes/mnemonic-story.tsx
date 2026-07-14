"use client";

import { motion } from "framer-motion";
import { ListenButton } from "@/components/app/listen-button";
import { Button } from "@/components/ui/button";
import type { Kana } from "@/types";

export function MnemonicStory({ kana, onContinue }: { kana: Kana; onContinue: () => void }) {
  return (
    <div className="flex flex-col items-center gap-6 text-center">
      <p className="text-sm font-bold uppercase tracking-wide text-secondary-strong">New character</p>

      <motion.div
        initial={{ scale: 0.7, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 260, damping: 18 }}
        className="grid size-44 place-items-center rounded-blob-xl bg-primary-tint"
      >
        <span lang="ja" className="font-jp text-8xl font-bold text-primary">
          {kana.char}
        </span>
      </motion.div>

      <div>
        <p className="font-display text-3xl font-bold text-ink">{kana.romaji}</p>
        <p className="mt-1 text-muted">{kana.pronunciation}</p>
      </div>

      <ListenButton text={kana.char} />

      <div className="max-w-md rounded-blob-lg border border-border bg-surface p-5">
        <p className="mb-1 text-xs font-bold uppercase tracking-wide text-muted">Memory hint</p>
        <p className="text-ink">{kana.mnemonic}</p>
      </div>

      <Button onClick={onContinue} size="lg" className="w-full max-w-xs">
        Got it!
      </Button>
    </div>
  );
}
