"use client";

import { motion } from "framer-motion";
import { HoshiStatic } from "@/components/mascot/hoshi-static";

export type CoachMood = "idle" | "cheer" | "encourage";

const CHEERS = ["Nice streak! 🔥", "On fire! すごい！", "Unstoppable! 💪", "You're flying! ✨"];
const ENCOURAGE = ["You've got this! 💛", "がんばって！ Keep going", "Almost — shake it off!", "Next one's yours!"];

/**
 * A small corner Hoshi that coaches during a lesson: it cheers on a hot streak
 * (3+ correct in a row) and encourages after a slip. `nonce` bumps on every
 * answer so the bubble re-triggers; the message auto-fades via an opacity
 * keyframe (no timers), which also keeps it reduced-motion friendly — Framer
 * keeps opacity animations while dropping the transform for those users.
 */
export function HoshiCoach({ mood, nonce, streak }: { mood: CoachMood; nonce: number; streak: number }) {
  const cheering = mood === "cheer";
  const message =
    mood === "cheer"
      ? CHEERS[nonce % CHEERS.length]
      : mood === "encourage"
        ? ENCOURAGE[nonce % ENCOURAGE.length]
        : "";

  return (
    <div className="pointer-events-none fixed bottom-3 left-3 z-30 flex items-end gap-2">
      <motion.div
        key={cheering ? `cheer-${nonce}` : "hoshi"}
        animate={cheering ? { y: [0, -10, 0], rotate: [0, -6, 6, 0] } : { y: 0, rotate: 0 }}
        transition={{ duration: 0.6 }}
        className="relative"
      >
        <HoshiStatic className="size-14 drop-shadow-sm sm:size-16" />
        {cheering && streak >= 5 ? (
          <span
            aria-hidden
            className="absolute -right-1 -top-1 rounded-full bg-secondary px-1.5 py-0.5 text-[10px] font-bold text-white"
          >
            ×{streak}
          </span>
        ) : null}
      </motion.div>

      {mood !== "idle" ? (
        <motion.div
          key={`bubble-${nonce}`}
          initial={{ opacity: 0, y: 8, scale: 0.85 }}
          animate={{ opacity: [0, 1, 1, 0], y: [8, 0, 0, 0], scale: [0.85, 1, 1, 1] }}
          transition={{ duration: 2.4, times: [0, 0.12, 0.78, 1], ease: "easeOut" }}
          className="mb-3 max-w-[52vw] rounded-blob border border-border bg-surface px-3 py-1.5 text-xs font-semibold text-ink shadow-[var(--shadow-soft)]"
        >
          {message}
        </motion.div>
      ) : null}
    </div>
  );
}
