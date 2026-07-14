"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { CheckIcon, LockIcon, StarIcon } from "@/components/ui/icons";
import { getTrackLessons, getUnit } from "@/data/curriculum";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { Track } from "@/types";

type NodeState = "complete" | "current" | "locked";

export function PathView({ track }: { track: Track }) {
  const router = useRouter();
  const completed = useProgress((s) => s.completedLessons);
  const lessons = getTrackLessons(track);

  const stateFor = (i: number): NodeState => {
    const lesson = lessons[i]!;
    if (completed.includes(lesson.id)) return "complete";
    const prev = lessons[i - 1];
    const prevDone = i === 0 || (prev ? completed.includes(prev.id) : false);
    return prevDone ? "current" : "locked";
  };

  return (
    <div className="mx-auto flex max-w-md flex-col items-center px-4 pb-24 pt-6">
      <div className="mb-2 flex flex-col items-center gap-2 text-center">
        <HoshiStatic className="size-20" />
        <p className="font-display text-xl font-bold text-ink">
          {track === "hiragana" ? "Hiragana" : "Katakana"}
        </p>
        <p className="text-sm text-muted">Learn to read all 46 basic characters.</p>
      </div>

      {lessons.map((lesson, i) => {
        const state = stateFor(i);
        const unit = getUnit(lesson.unitId)!;
        const showHeader = i === 0 || lessons[i - 1]?.unitId !== lesson.unitId;
        const offset = Math.sin(i * 0.8) * 70;
        const isReview = lesson.kind === "review";

        return (
          <div key={lesson.id} className="flex w-full flex-col items-center">
            {showHeader ? (
              <div className="mb-2 mt-8 w-full rounded-blob-lg bg-surface-2 px-5 py-3 text-center">
                <p className="font-display font-bold text-ink">{unit.title}</p>
                <p lang="ja" className="font-jp text-sm text-muted">
                  {unit.subtitle}
                </p>
              </div>
            ) : null}

            <div className="relative my-3" style={{ transform: `translateX(${offset}px)` }}>
              {state === "current" ? (
                <motion.span
                  animate={{ y: [0, -5, 0] }}
                  transition={{ duration: 1.2, repeat: Infinity }}
                  className="absolute -top-9 left-1/2 z-10 -translate-x-1/2 rounded-full bg-ink px-3 py-1 text-xs font-bold text-white"
                >
                  START
                </motion.span>
              ) : null}
              <button
                type="button"
                disabled={state === "locked"}
                aria-label={`${lesson.title}${state === "locked" ? " (locked)" : ""}`}
                onClick={() => {
                  if (state !== "locked") router.push(`/learn/lesson/${lesson.id}`);
                }}
                className={cn(
                  "grid size-[76px] place-items-center rounded-full transition active:translate-y-1",
                  state === "complete" &&
                    (isReview
                      ? "bg-secondary text-white shadow-[0_5px_0_0_var(--jl-secondary-strong)]"
                      : "bg-accent text-ink shadow-[0_5px_0_0_var(--jl-accent-strong)]"),
                  state === "current" &&
                    "bg-primary text-white shadow-[0_5px_0_0_var(--jl-primary-strong)] ring-4 ring-primary/25",
                  state === "locked" && "bg-surface-2 text-muted",
                )}
              >
                {state === "complete" ? (
                  isReview ? (
                    <StarIcon className="size-8" />
                  ) : (
                    <CheckIcon className="size-9" />
                  )
                ) : state === "locked" ? (
                  <LockIcon className="size-7" />
                ) : isReview ? (
                  <StarIcon className="size-8" />
                ) : (
                  <span className="font-display text-2xl font-bold">{lesson.order}</span>
                )}
              </button>
            </div>

            <p
              className="mb-1 max-w-[170px] text-center text-xs font-semibold text-muted"
              style={{ transform: `translateX(${offset}px)` }}
            >
              {lesson.title}
            </p>
          </div>
        );
      })}
    </div>
  );
}
