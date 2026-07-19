"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { HoshiCoach, type CoachMood } from "@/components/mascot/hoshi-coach";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { CloseIcon } from "@/components/ui/icons";
import { getTrackLessons, getUnit } from "@/data/curriculum";
import { sfx } from "@/lib/audio";
import { useMounted } from "@/lib/use-mounted";
import { useProgress } from "@/stores/progress";
import type { Lesson } from "@/types";
import { buildQueue } from "./build-queue";
import { KanaDrill } from "./modes/kana-drill";
import { MnemonicStory } from "./modes/mnemonic-story";
import { QuickMatch } from "./modes/quick-match";
import { ConceptLesson } from "./concept-lesson";
import { LessonResults } from "./results";

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const mounted = useMounted();
  const queue = useMemo(() => buildQueue(lesson), [lesson]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [xpBefore] = useState(() => useProgress.getState().xp);
  // Hoshi coach: a running correct-streak drives its cheer/encourage reactions.
  const [coach, setCoach] = useState<{ mood: CoachMood; nonce: number; streak: number }>({
    mood: "idle",
    nonce: 0,
    streak: 0,
  });

  const answer = useProgress((s) => s.answer);
  const rate = useProgress((s) => s.rate);
  const markSeen = useProgress((s) => s.markSeen);
  const completeLesson = useProgress((s) => s.completeLesson);
  const completedLessons = useProgress((s) => s.completedLessons);

  // Enforce the path gate at the route level: a lesson is playable once it's
  // already completed, is the track's first, or its predecessor is completed —
  // the same rule the path UI uses. Locked URLs bounce back to the path.
  const unlocked = useMemo(() => {
    if (completedLessons.includes(lesson.id)) return true;
    const track = getUnit(lesson.unitId)?.track ?? "hiragana";
    const lessons = getTrackLessons(track);
    const i = lessons.findIndex((l) => l.id === lesson.id);
    const prev = lessons[i - 1];
    return i <= 0 || (prev ? completedLessons.includes(prev.id) : false);
  }, [lesson, completedLessons]);
  useEffect(() => {
    if (mounted && !unlocked) router.replace("/learn");
  }, [mounted, unlocked, router]);

  // React to an answer: bump the streak (or reset it) and pick Hoshi's mood.
  const react = (correct: boolean) =>
    setCoach((c) => {
      const streak = correct ? c.streak + 1 : 0;
      const mood: CoachMood = correct ? (streak >= 3 ? "cheer" : "idle") : "encourage";
      return { mood, streak, nonce: c.nonce + 1 };
    });

  const exit = () => router.push("/learn");

  // One step may only be answered once — a double-tap on Continue during the
  // exit animation must not grade twice or silently skip the next exercise.
  const steppedRef = useRef(-1);
  const advance = () => {
    if (steppedRef.current === index) return;
    steppedRef.current = index;
    if (index + 1 >= queue.length) {
      completeLesson(lesson.id);
      sfx.complete();
      setEarnedXp(useProgress.getState().xp - xpBefore);
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  // Gate randomized exercises (review lessons shuffle their first item) behind
  // mount so the server render never mismatches the client's first render.
  if (!mounted || !unlocked) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </main>
    );
  }

  // The small っ and long-vowel ー are writing rules, not kana — self-contained.
  if (lesson.kind === "sokuon" || lesson.kind === "chouon") {
    return <ConceptLesson lesson={lesson} onExit={exit} />;
  }

  if (done) {
    return <LessonResults lesson={lesson} xpEarned={earnedXp} onContinue={exit} />;
  }

  const ex = queue[index];
  const pct = Math.round((index / Math.max(queue.length, 1)) * 100);

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-5">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          aria-label="Exit lesson"
          onClick={exit}
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2"
        >
          <CloseIcon className="size-6" />
        </button>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-success transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center overflow-x-clip py-4">
        {/* Each exercise slides in from the right and out to the left —
            the Duolingo-style forward momentum between steps. */}
        <AnimatePresence mode="wait" initial={false}>
          <motion.div
            key={index}
            initial={{ opacity: 0, x: 60 }}
            animate={{ opacity: 1, x: 0 }}
            exit={{ opacity: 0, x: -60 }}
            transition={{ type: "spring", stiffness: 380, damping: 32 }}
            className="flex w-full items-center justify-center"
          >
            {ex?.kind === "mnemonic" && (
              <MnemonicStory
                kana={ex.kana}
                onContinue={() => {
                  if (steppedRef.current === index) return; // double-tap guard
                  sfx.pop();
                  markSeen(ex.kana.id);
                  advance();
                }}
              />
            )}
            {ex?.kind === "choice" && (
              <QuickMatch
                kana={ex.kana}
                direction={ex.direction}
                options={ex.options}
                onAnswer={(correct) => {
                  if (steppedRef.current === index) return; // double-tap guard
                  answer(ex.kana.id, correct);
                  react(correct);
                  advance();
                }}
              />
            )}
            {ex?.kind === "drill" && (
              <KanaDrill
                kana={ex.kana}
                onRate={(grade) => {
                  if (steppedRef.current === index) return; // double-tap guard
                  rate(ex.kana.id, grade);
                  react(grade !== "again");
                  advance();
                }}
              />
            )}
          </motion.div>
        </AnimatePresence>
      </div>

      <HoshiCoach mood={coach.mood} nonce={coach.nonce} streak={coach.streak} />
    </main>
  );
}
