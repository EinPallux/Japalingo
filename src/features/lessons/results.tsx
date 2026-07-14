"use client";

import { motion } from "framer-motion";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { lessonKana } from "@/data/curriculum";
import type { Lesson } from "@/types";

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

  return (
    <main id="main" className="grid min-h-dvh place-items-center px-5 py-10">
      <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
        <motion.div
          initial={{ scale: 0.6, opacity: 0 }}
          animate={{ scale: 1, opacity: 1 }}
          transition={{ type: "spring", stiffness: 240, damping: 16 }}
        >
          <HoshiStatic className="size-40" />
        </motion.div>

        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Lesson complete! 🎉</h1>
          <p className="mt-1 text-muted">
            <span lang="ja" className="font-jp">
              よくできました！
            </span>{" "}
            (Well done!)
          </p>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          <div className="rounded-blob-lg border border-border bg-accent-tint p-4">
            <p className="font-display text-3xl font-bold text-accent-strong">+{xpEarned}</p>
            <p className="text-sm font-semibold text-muted">XP earned</p>
          </div>
          <div className="rounded-blob-lg border border-border bg-primary-tint p-4">
            <p className="font-display text-3xl font-bold text-primary">{kanaCount}</p>
            <p className="text-sm font-semibold text-muted">kana practiced</p>
          </div>
        </div>

        <Button onClick={onContinue} size="lg" className="w-full">
          Continue
        </Button>
      </div>
    </main>
  );
}
