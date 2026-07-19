"use client";

import { motion } from "framer-motion";

export interface ScoreRecord {
  best: number;
  isRecord: boolean;
}

/** Game-over score line: a celebratory "New record!" chip, or the best-so-far. */
export function ScoreBanner({ record, score }: { record: ScoreRecord; score: number }) {
  if (record.isRecord && score > 0) {
    return (
      <motion.div
        initial={{ scale: 0.6, opacity: 0 }}
        animate={{ scale: 1, opacity: 1 }}
        transition={{ type: "spring", stiffness: 300, damping: 15 }}
        className="flex items-center gap-2 rounded-full bg-accent px-4 py-2 font-display font-bold text-ink shadow-[0_3px_0_0_var(--jl-accent-strong)]"
      >
        <span aria-hidden>🏆</span> New personal record!
      </motion.div>
    );
  }
  return (
    <p className="text-sm font-semibold text-muted">
      Best: <span className="font-bold text-ink">{record.best}</span>
    </p>
  );
}
