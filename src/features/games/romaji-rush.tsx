"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { NotEnoughKana } from "@/components/game/not-enough-kana";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { sfx } from "@/lib/audio";
import { learnedKana } from "@/lib/learned";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { Kana, Track } from "@/types";

const DURATION_MS = 60_000;
/** Fewest met kana needed to offer four distinct answer choices. */
const MIN_KANA = 4;

type Direction = "k2r" | "r2k";
type Round = { kana: Kana; direction: Direction; prompt: string; answer: string; options: string[] };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function makeRound(pool: Kana[]): Round {
  const kana = pool[Math.floor(Math.random() * pool.length)]!;
  const direction: Direction = Math.random() < 0.5 ? "k2r" : "r2k";
  const value = (k: Kana) => (direction === "k2r" ? k.romaji : k.char);
  const answer = value(kana);

  const seen = new Set([answer]);
  const options = [answer];
  // Distractors share the answer's track and never its reading, so no option is
  // secretly also correct and no cross-script character sneaks in.
  for (const k of shuffle(pool)) {
    if (k.romaji === kana.romaji) continue;
    const v = value(k);
    if (!seen.has(v)) {
      seen.add(v);
      options.push(v);
    }
    if (options.length === 4) break;
  }
  return {
    kana,
    direction,
    prompt: direction === "k2r" ? kana.char : kana.romaji,
    answer,
    options: shuffle(options),
  };
}

/** Gate on mount + a big-enough learned pool, then hand a ready pool to the game
 *  (so its first round is dealt from real, rehydrated data — never an empty set). */
export function RomajiRush({ track }: { track: Track }) {
  const mounted = useMounted();
  const kanaProgress = useProgress((s) => s.kana);
  const pool = useMemo(() => learnedKana(track, kanaProgress), [track, kanaProgress]);

  if (!mounted) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </main>
    );
  }

  if (pool.length < MIN_KANA) {
    return <NotEnoughKana need={MIN_KANA} have={pool.length} />;
  }

  return <RomajiRushGame pool={pool} />;
}

function RomajiRushGame({ pool }: { pool: Kana[] }) {
  const router = useRouter();

  const [status, setStatus] = useState<"playing" | "over">("playing");
  const [round, setRound] = useState<Round>(() => makeRound(pool));
  const [picked, setPicked] = useState<string | null>(null);
  const [score, setScore] = useState(0);
  const [correct, setCorrect] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [leftMs, setLeftMs] = useState(DURATION_MS);

  const deadlineRef = useRef(0);
  const advanceRef = useRef<number | null>(null);

  // Countdown clock. Restarts whenever a game (re)starts.
  useEffect(() => {
    if (status !== "playing") return;
    deadlineRef.current = Date.now() + DURATION_MS;
    const id = window.setInterval(() => {
      const remaining = deadlineRef.current - Date.now();
      if (remaining <= 0) {
        window.clearInterval(id);
        setLeftMs(0);
        setStatus("over");
      } else {
        setLeftMs(remaining);
      }
    }, 100);
    return () => window.clearInterval(id);
  }, [status]);

  useEffect(
    () => () => {
      if (advanceRef.current) window.clearTimeout(advanceRef.current);
    },
    [],
  );

  const pick = (opt: string) => {
    if (picked || status !== "playing") return;
    const ok = opt === round.answer;
    setPicked(opt);
    useProgress.getState().answer(round.kana.id, ok);
    if (ok) {
      const next = combo + 1;
      setCombo(next);
      setBestCombo((b) => Math.max(b, next));
      setScore((s) => s + 10 * Math.min(next, 5));
      setCorrect((c) => c + 1);
      sfx.correct();
    } else {
      setCombo(0);
      sfx.wrong();
    }
    // Snappy on a hit; linger a touch on a miss so the answer registers.
    advanceRef.current = window.setTimeout(
      () => {
        setPicked(null);
        setRound(makeRound(pool));
      },
      ok ? 180 : 650,
    );
  };

  const restart = () => {
    if (advanceRef.current) window.clearTimeout(advanceRef.current);
    setScore(0);
    setCorrect(0);
    setCombo(0);
    setBestCombo(0);
    setLeftMs(DURATION_MS);
    setPicked(null);
    setRound(makeRound(pool));
    setStatus("playing");
  };

  if (status === "over") {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <HoshiStatic className="size-32" />
          <h1 className="font-display text-3xl font-bold text-ink">Time! ⏱️</h1>
          <div className="grid w-full grid-cols-3 gap-3">
            <Stat label="Score" value={score} tone="text-primary" />
            <Stat label="Correct" value={correct} tone="text-success-strong" />
            <Stat label="Best combo" value={`×${bestCombo}`} tone="text-secondary-strong" />
          </div>
          <div className="flex w-full flex-col gap-3">
            <Button onClick={restart} size="lg" className="w-full">
              Play again
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
  const pct = Math.max(0, Math.min(100, (leftMs / DURATION_MS) * 100));
  const low = seconds <= 10;

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Exit game"
          onClick={() => router.push("/learn")}
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2"
        >
          <CloseIcon className="size-6" />
        </button>
        <div className="flex items-center gap-3 font-display font-bold">
          {combo > 1 ? <span className="text-sm text-secondary-strong">×{combo}</span> : null}
          <span className="text-primary" aria-label={`Score ${score}`}>
            {score}
          </span>
        </div>
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
        <p className="text-sm font-bold uppercase tracking-wide text-muted">
          {round.direction === "k2r" ? "Which reading?" : "Which character?"}
        </p>
        <div className="grid size-40 place-items-center rounded-blob-xl bg-surface-2">
          <span
            lang={round.direction === "k2r" ? "ja" : undefined}
            className={cn(
              "font-bold text-ink",
              round.direction === "k2r" ? "font-jp text-8xl" : "font-display text-6xl",
            )}
          >
            {round.prompt}
          </span>
        </div>

        <div className="grid w-full grid-cols-2 gap-3">
          {round.options.map((opt) => {
            const isAnswer = opt === round.answer;
            const state = !picked ? "idle" : isAnswer ? "correct" : opt === picked ? "wrong" : "dim";
            return (
              <button
                key={opt}
                type="button"
                disabled={Boolean(picked)}
                onClick={() => pick(opt)}
                className={cn(
                  "grid place-items-center rounded-blob-lg border-2 py-5 font-bold transition",
                  round.direction === "r2k" ? "font-jp text-4xl" : "font-display text-2xl",
                  state === "idle" && "border-border bg-surface text-ink hover:border-primary/50 hover:bg-primary-tint",
                  state === "correct" && "border-success bg-success/15 text-success-strong",
                  state === "wrong" && "border-error bg-error/15 text-error-strong",
                  state === "dim" && "border-border bg-surface text-muted opacity-60",
                )}
              >
                <span lang={round.direction === "r2k" ? "ja" : undefined}>{opt}</span>
              </button>
            );
          })}
        </div>
      </div>
    </main>
  );
}

function Stat({ label, value, tone }: { label: string; value: string | number; tone: string }) {
  return (
    <div className="rounded-blob-lg border border-border bg-surface p-4">
      <p className={cn("font-display text-2xl font-bold", tone)}>{value}</p>
      <p className="text-xs font-semibold text-muted">{label}</p>
    </div>
  );
}
