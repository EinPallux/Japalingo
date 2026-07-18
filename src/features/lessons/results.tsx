"use client";

import { motion } from "framer-motion";
import { Confetti } from "@/components/feedback/confetti";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { lessonKana } from "@/data/curriculum";
import { useCountUp } from "@/lib/use-count-up";
import type { Lesson } from "@/types";

const pop = {
  hidden: { opacity: 0, y: 16, scale: 0.92 },
  show: { opacity: 1, y: 0, scale: 1, transition: { type: "spring" as const, stiffness: 320, damping: 22 } },
};

export function LessonResults({
  lesson,
  xpEarned,
  onContinue,
}: {
  lesson: Lesson;
  xpEarned: number;
  onContinue: () => void;
}) {
  const kanaCount = new Set(lessonKana(lesson).map((k) => k.id)).size;
  const xp = useCountUp(xpEarned);

  return (
    <main id="main" className="grid min-h-dvh place-items-center px-5 py-10">
      <Confetti />
      <motion.div
        initial="hidden"
        animate="show"
        transition={{ staggerChildren: 0.12 }}
        className="flex w-full max-w-md flex-col items-center gap-6 text-center"
      >
        <motion.div
          initial={{ scale: 0.4, opacity: 0, rotate: -8 }}
          animate={{ scale: 1, opacity: 1, rotate: 0 }}
          transition={{ type: "spring", stiffness: 260, damping: 14 }}
        >
          <div className="anim-bob">
            <HoshiStatic className="size-40" />
          </div>
        </motion.div>

        <motion.div variants={pop}>
          <h1 className="font-display text-3xl font-bold text-ink">Lesson complete! 🎉</h1>
          <p className="mt-1 text-muted">
            <span lang="ja" className="font-jp">
              よくできました！
            </span>{" "}
            (Well done!)
          </p>
        </motion.div>

        <div className="grid w-full grid-cols-2 gap-3">
          <motion.div variants={pop} className="rounded-blob-lg border border-border bg-accent-tint p-4">
            <p className="font-display text-3xl font-bold text-accent-strong">+{xp}</p>
            <p className="text-sm font-semibold text-muted">XP earned</p>
          </motion.div>
          <motion.div variants={pop} className="rounded-blob-lg border border-border bg-primary-tint p-4">
            <p className="font-display text-3xl font-bold text-primary">{kanaCount}</p>
            <p className="text-sm font-semibold text-muted">kana practiced</p>
          </motion.div>
        </div>

        <motion.div variants={pop} className="w-full">
          <Button onClick={onContinue} size="lg" className="w-full">
            Continue
          </Button>
        </motion.div>
      </motion.div>
    </main>
  );
}
