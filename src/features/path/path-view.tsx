"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { CheckIcon, LockIcon, StarIcon } from "@/components/ui/icons";
import { getTrackLessons, getUnit, isUnitComplete, trackKana } from "@/data/curriculum";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { Track } from "@/types";

type NodeState = "complete" | "current" | "locked";

export function PathView({ track }: { track: Track }) {
  const router = useRouter();
  const completed = useProgress((s) => s.completedLessons);
  const crownedUnits = useProgress((s) => s.crownedUnits);
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
        <p className="text-sm text-muted">
          Read all {trackKana(track).length} kana — 46 basics, then dakuten &amp; han-dakuten.
        </p>
      </div>

      {lessons.map((lesson, i) => {
        const state = stateFor(i);
        const unit = getUnit(lesson.unitId)!;
        const showHeader = i === 0 || lessons[i - 1]?.unitId !== lesson.unitId;
        const offset = Math.sin(i * 0.8) * 70;
        const isReview = lesson.kind === "review";
        const unitComplete = isUnitComplete(unit.id, completed);
        const unitCrowned = crownedUnits.includes(unit.id);

        return (
          <div key={lesson.id} className="flex w-full flex-col items-center">
            {showHeader ? (
              <div className="mb-2 mt-8 flex w-full items-center gap-3 rounded-blob-lg bg-surface-2 px-5 py-3">
                <div className="min-w-0 flex-1 text-center">
                  <p className="font-display font-bold text-ink">{unit.title}</p>
                  <p lang="ja" className="font-jp text-sm text-muted">
                    {unit.subtitle}
                  </p>
                </div>
                <UnitCrown unitId={unit.id} complete={unitComplete} crowned={unitCrowned} />
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
                  state !== "locked" && "hover:scale-105",
                  state === "complete" &&
                    (isReview
                      ? "bg-secondary text-white shadow-[0_5px_0_0_var(--jl-secondary-strong)]"
                      : "bg-accent text-ink shadow-[0_5px_0_0_var(--jl-accent-strong)]"),
                  // ring-4 is the static halo for reduced-motion users; the pulse
                  // animation takes over box-shadow entirely when motion is allowed.
                  state === "current" &&
                    "anim-ring-pulse bg-primary text-white shadow-[0_5px_0_0_var(--jl-primary-strong)] ring-4 ring-primary/25",
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

/**
 * The unit's Speed Review affordance: a gold crown once earned, a tappable
 * "Speed Review" pill once the unit's lessons are done, or a dim locked crown
 * while the unit is still in progress.
 */
function UnitCrown({
  unitId,
  complete,
  crowned,
}: {
  unitId: string;
  complete: boolean;
  crowned: boolean;
}) {
  if (crowned) {
    return (
      <Link
        href={`/learn/review/${unitId}`}
        aria-label="Unit crowned — replay Speed Review"
        className="grid size-11 shrink-0 place-items-center rounded-full bg-accent text-xl shadow-[0_3px_0_0_var(--jl-accent-strong)] transition hover:brightness-105 active:translate-y-0.5"
      >
        <span aria-hidden>👑</span>
      </Link>
    );
  }
  if (complete) {
    return (
      <Link
        href={`/learn/review/${unitId}`}
        className="anim-claim flex shrink-0 items-center gap-1 rounded-full border-2 border-accent-strong/40 bg-accent-tint px-3 py-1.5 font-display text-xs font-bold text-accent-strong transition hover:brightness-105"
      >
        <span aria-hidden>⚡</span> Speed Review
      </Link>
    );
  }
  return (
    <span
      aria-label="Speed Review locked — finish the unit to unlock"
      className="grid size-11 shrink-0 place-items-center rounded-full bg-surface text-lg text-muted opacity-50"
    >
      <span aria-hidden>👑</span>
    </span>
  );
}
