"use client";

import { motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useEffect, useRef, useState } from "react";
import { Confetti } from "@/components/feedback/confetti";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { getKanaList, isUnitComplete } from "@/data/curriculum";
import { sfx } from "@/lib/audio";
import {
  buildSpeedQuiz,
  crownThreshold,
  isCrownWin,
  type SpeedQuestion,
  timeLimitMs,
} from "@/lib/speed-review";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { GEM_CROWN_REWARD, useProgress } from "@/stores/progress";
import type { Unit } from "@/types";

/** Gate on mount + unit completion, then run the timed quiz on a ready set. */
export function SpeedReview({ unit }: { unit: Unit }) {
  const router = useRouter();
  const mounted = useMounted();
  const completed = useProgress((s) => s.completedLessons);

  if (!mounted) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </main>
    );
  }

  // Concept units (small っ, long ー) hold no kana — a Speed Review over them
  // would be a 0-question, unwinnable run. Bounce direct URLs back to the path.
  if (unit.kanaIds.length === 0) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 text-center">
        <div className="flex max-w-sm flex-col items-center gap-4">
          <HoshiStatic className="size-28" />
          <h1 className="font-display text-2xl font-bold text-ink">Nothing to review here!</h1>
          <p className="text-ink">
            <strong>{unit.title}</strong> teaches a reading rule, not kana — it has no Speed Review.
          </p>
          <Button onClick={() => router.push("/learn")} size="lg">
            Back to the path
          </Button>
        </div>
      </main>
    );
  }

  if (!isUnitComplete(unit.id, completed)) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 text-center">
        <div className="flex max-w-sm flex-col items-center gap-4">
          <HoshiStatic className="size-28" />
          <h1 className="font-display text-2xl font-bold text-ink">Finish the unit first!</h1>
          <p className="text-ink">
            Complete every lesson in <strong>{unit.title}</strong>, then come back to earn its gold
            crown in a Speed Review.
          </p>
          <Button onClick={() => router.push("/learn")} size="lg">
            Back to the path
          </Button>
        </div>
      </main>
    );
  }

  return <SpeedReviewGame unit={unit} />;
}

function SpeedReviewGame({ unit }: { unit: Unit }) {
  const router = useRouter();
  const [quiz, setQuiz] = useState<SpeedQuestion[]>(() =>
    buildSpeedQuiz(getKanaList(unit.kanaIds)),
  );
  const total = quiz.length;
  const limit = timeLimitMs(total);

  const [index, setIndex] = useState(0);
  const [picked, setPicked] = useState<string | null>(null);
  const [correct, setCorrect] = useState(0);
  const [leftMs, setLeftMs] = useState(limit);
  const [phase, setPhase] = useState<"playing" | "won" | "lost">("playing");
  const [gemsEarned, setGemsEarned] = useState(0);

  const deadlineRef = useRef(0);
  const advanceRef = useRef<number | null>(null);
  const correctRef = useRef(0);
  const finishedRef = useRef(false);

  const restart = () => {
    if (advanceRef.current) window.clearTimeout(advanceRef.current);
    correctRef.current = 0;
    finishedRef.current = false;
    setQuiz(buildSpeedQuiz(getKanaList(unit.kanaIds)));
    setIndex(0);
    setPicked(null);
    setCorrect(0);
    setLeftMs(limit);
    setGemsEarned(0);
    setPhase("playing");
  };

  // Finish the run: decide crown vs. retry, and crown the unit on a win.
  // Idempotent — the clock and the last-question advance timeout can race
  // (deadline landing inside the post-answer delay); whichever fires first
  // decides the outcome, and the loser is ignored + its timer cleared.
  const finish = (finalCorrect: number, timedOut: boolean) => {
    if (finishedRef.current) return;
    finishedRef.current = true;
    if (advanceRef.current) {
      window.clearTimeout(advanceRef.current);
      advanceRef.current = null;
    }
    if (isCrownWin(finalCorrect, total, timedOut)) {
      const { alreadyCrowned } = useProgress.getState().crownUnit(unit.id);
      setGemsEarned(alreadyCrowned ? 0 : GEM_CROWN_REWARD);
      sfx.levelUp();
      setPhase("won");
    } else {
      sfx.wrong();
      setPhase("lost");
    }
  };

  // Countdown clock while playing.
  useEffect(() => {
    if (phase !== "playing") return;
    deadlineRef.current = Date.now() + limit;
    const id = window.setInterval(() => {
      const remaining = deadlineRef.current - Date.now();
      if (remaining <= 0) {
        window.clearInterval(id);
        setLeftMs(0);
        finish(correctRef.current, true);
      } else {
        setLeftMs(remaining);
      }
    }, 100);
    return () => window.clearInterval(id);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [phase]);

  useEffect(
    () => () => {
      if (advanceRef.current) window.clearTimeout(advanceRef.current);
    },
    [],
  );

  const q = quiz[index];

  const pick = (opt: string) => {
    if (picked || phase !== "playing" || !q) return;
    const ok = opt === q.kana.romaji;
    setPicked(opt);
    useProgress.getState().answer(q.kana.id, ok);
    if (ok) {
      correctRef.current += 1;
      setCorrect(correctRef.current);
      sfx.correct();
    } else {
      sfx.wrong();
    }
    advanceRef.current = window.setTimeout(
      () => {
        if (index + 1 >= total) {
          finish(correctRef.current, false);
        } else {
          setIndex((i) => i + 1);
          setPicked(null);
        }
      },
      ok ? 220 : 520,
    );
  };

  if (phase !== "playing") {
    const won = phase === "won";
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 py-10">
        {won ? <Confetti /> : null}
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          {won ? (
            <motion.div
              initial={{ scale: 0.3, rotate: -12, opacity: 0 }}
              animate={{ scale: 1, rotate: 0, opacity: 1 }}
              transition={{ type: "spring", stiffness: 260, damping: 12 }}
              className="text-7xl"
              aria-hidden
            >
              👑
            </motion.div>
          ) : (
            <div className="anim-bob">
              <HoshiStatic className="size-32" />
            </div>
          )}
          <div>
            <h1 className="font-display text-3xl font-bold text-ink">
              {won ? "Unit crowned! 👑" : "So close!"}
            </h1>
            <p className="mt-1 text-muted">
              {correct}/{total} correct
              {won
                ? gemsEarned > 0
                  ? ` · +${gemsEarned} 💎`
                  : " · already crowned"
                : ` · you need ${crownThreshold(total)} in time`}
            </p>
          </div>
          <div className="flex w-full flex-col gap-3">
            <Button onClick={restart} size="lg" className="w-full">
              {won ? "Run it again" : "Try again"}
            </Button>
            <Button onClick={() => router.push("/learn")} size="lg" variant="ghost" className="w-full">
              Back to path
            </Button>
          </div>
        </div>
      </main>
    );
  }

  const seconds = Math.ceil(leftMs / 1000);
  const pct = Math.max(0, Math.min(100, (leftMs / limit) * 100));
  const low = seconds <= 5;

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-4 pb-safe">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Exit Speed Review"
          onClick={() => router.push("/learn")}
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2"
        >
          <CloseIcon className="size-6" />
        </button>
        <p className="font-display text-sm font-bold text-muted">
          ⚡ Speed Review · {index + 1}/{total}
        </p>
      </div>

      <div
        className="h-3 overflow-hidden rounded-full bg-surface-2"
        role="timer"
        aria-label={`${seconds} seconds left`}
      >
        <div
          className={cn(
            "h-full rounded-full transition-[width] duration-100 ease-linear",
            low ? "bg-error" : "bg-accent",
          )}
          style={{ width: `${pct}%` }}
        />
      </div>
      <p className={cn("mt-1 text-center text-sm font-bold", low ? "text-error-strong" : "text-muted")}>
        {seconds}s
      </p>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-muted">Which reading?</p>
        <div className="grid size-40 place-items-center rounded-blob-xl bg-surface-2">
          <span lang="ja" className="font-jp text-8xl font-bold text-ink">
            {q?.kana.char}
          </span>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          {q?.options.map((opt) => {
            const isAnswer = opt === q.kana.romaji;
            const state = !picked ? "idle" : isAnswer ? "correct" : opt === picked ? "wrong" : "dim";
            return (
              <button
                key={opt}
                type="button"
                disabled={Boolean(picked)}
                onClick={() => pick(opt)}
                className={cn(
                  "grid place-items-center rounded-blob-lg border-2 py-5 font-display text-2xl font-bold transition",
                  state === "idle" && "border-border bg-surface text-ink hover:border-primary/50 hover:bg-primary-tint",
                  state === "correct" && "anim-pop border-success bg-success/15 text-success-strong",
                  state === "wrong" && "anim-shake border-error bg-error/15 text-error-strong",
                  state === "dim" && "border-border bg-surface text-muted opacity-60",
                )}
              >
                {opt}
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}
