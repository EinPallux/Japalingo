"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useState } from "react";
import { Confetti } from "@/components/feedback/confetti";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { NotEnoughKana } from "@/components/game/not-enough-kana";
import { Button } from "@/components/ui/button";
import { CloseIcon, SpeakerIcon } from "@/components/ui/icons";
import { sfx, speakJa } from "@/lib/audio";
import { learnedKana } from "@/lib/learned";
import { useMounted } from "@/lib/use-mounted";
import { useSpeechStatus } from "@/lib/use-speech";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { Kana, Track } from "@/types";

const ROUNDS = 10;
/** Fewest met kana needed to offer four distinct options. */
const MIN_KANA = 4;

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function pickRound(pool: Kana[]): { target: Kana; options: Kana[] } {
  const target = pool[Math.floor(Math.random() * pool.length)]!;
  const options: Kana[] = [target];
  // Only offer options that read differently from the target (and each other),
  // so a wrong pick is never actually a correct reading of the sound played.
  for (const k of shuffle(pool)) {
    if (options.some((o) => o.romaji === k.romaji)) continue;
    options.push(k);
    if (options.length === 4) break;
  }
  return { target, options: shuffle(options) };
}

/**
 * Gate on mount, a working Japanese voice, and a big-enough learned pool, then
 * hand a ready pool to the game so its first round is real (never an empty set).
 */
export function EarTraining({ track }: { track: Track }) {
  const mounted = useMounted();
  const speech = useSpeechStatus();
  const kanaProgress = useProgress((s) => s.kana);
  const pool = useMemo(() => learnedKana(track, kanaProgress), [track, kanaProgress]);

  // Gate on mount (so the randomized round doesn't mismatch the SSR HTML) and on
  // resolving whether speech works, so we never show a silent game.
  if (!mounted || speech === "checking") {
    return (
      <main id="main" className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </main>
    );
  }

  if (speech === "unavailable") {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 text-center">
        <div className="flex max-w-sm flex-col items-center gap-4">
          <HoshiStatic className="size-28" />
          <p className="text-ink">
            Ear Training needs a <strong>Japanese</strong> voice, and this browser doesn&apos;t have
            one installed.
          </p>
          <p className="text-sm text-muted">
            (Your general audio still works — that&apos;s separate.) Chrome and Edge usually include a
            Japanese voice; on Windows/macOS you may need to add a Japanese text-to-speech voice in
            system settings. Everything else in the app works without it.
          </p>
          <Button href="/learn" size="lg">
            Back to path
          </Button>
        </div>
      </main>
    );
  }

  if (pool.length < MIN_KANA) {
    return <NotEnoughKana need={MIN_KANA} have={pool.length} />;
  }

  return <EarTrainingGame pool={pool} />;
}

function EarTrainingGame({ pool }: { pool: Kana[] }) {
  const router = useRouter();

  const [round, setRound] = useState(0);
  const [rd, setRd] = useState(() => pickRound(pool));
  const [picked, setPicked] = useState<string | null>(null);
  const [correctCount, setCorrectCount] = useState(0);
  const [done, setDone] = useState(false);
  const [earned, setEarned] = useState(0);
  const [xpBefore, setXpBefore] = useState(() => useProgress.getState().xp);

  // Reaching this component means a Japanese voice is ready, so auto-play each
  // round's sound (until the game is done). The cleanup cancels any in-flight
  // utterance so exiting mid-round doesn't keep talking on the next screen —
  // and it also swallows StrictMode's dev double-invoke.
  useEffect(() => {
    if (!done) speakJa(rd.target.char);
    return () => {
      if (typeof window !== "undefined") window.speechSynthesis?.cancel();
    };
  }, [rd, done]);

  const pick = (k: Kana) => {
    if (picked) return;
    const ok = k.id === rd.target.id;
    setPicked(k.id);
    if (ok) {
      sfx.correct();
      setCorrectCount((c) => c + 1);
    } else {
      sfx.wrong();
    }
    useProgress.getState().answer(rd.target.id, ok);
  };

  const next = () => {
    if (round + 1 >= ROUNDS) {
      sfx.complete();
      setEarned(useProgress.getState().xp - xpBefore);
      setDone(true);
      return;
    }
    setRound((r) => r + 1);
    setRd(pickRound(pool));
    setPicked(null);
  };

  if (done) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 py-10">
        {correctCount >= ROUNDS / 2 ? <Confetti /> : null}
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <div className="anim-bob">
            <HoshiStatic className="size-32" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">Nice ears! 🎧</h1>
          <p className="text-muted">
            {correctCount}/{ROUNDS} correct · +{earned} XP
          </p>
          <div className="flex w-full flex-col gap-3">
            <Button
              onClick={() => {
                setRound(0);
                setRd(pickRound(pool));
                setPicked(null);
                setCorrectCount(0);
                setEarned(0);
                setXpBefore(useProgress.getState().xp);
                setDone(false);
              }}
              size="lg"
              className="w-full"
            >
              Play again
            </Button>
            <Button href="/learn" size="lg" variant="ghost" className="w-full">
              Back to path
            </Button>
          </div>
        </div>
      </main>
    );
  }

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-5">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          aria-label="Exit game"
          onClick={() => router.push("/learn")}
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2"
        >
          <CloseIcon className="size-6" />
        </button>
        <p className="font-display font-bold text-muted">
          {round + 1} / {ROUNDS}
        </p>
      </div>

      <div className="flex flex-1 flex-col items-center justify-center gap-8 text-center">
        <p className="text-sm font-bold uppercase tracking-wide text-muted">Which kana did you hear?</p>

        <button
          type="button"
          onClick={() => speakJa(rd.target.char)}
          aria-label="Play the sound again"
          className="grid size-28 place-items-center rounded-full bg-info/15 text-info transition hover:bg-info/25"
        >
          <SpeakerIcon className="size-12" />
        </button>

        <div className="grid w-full max-w-md grid-cols-2 gap-3">
          {rd.options.map((k) => {
            const isTarget = k.id === rd.target.id;
            const state = !picked ? "idle" : isTarget ? "correct" : k.id === picked ? "wrong" : "dim";
            return (
              <button
                key={k.id}
                type="button"
                disabled={Boolean(picked)}
                onClick={() => pick(k)}
                className={cn(
                  "grid place-items-center rounded-blob-lg border-2 py-6 font-jp text-5xl font-bold transition",
                  state === "idle" && "border-border bg-surface text-ink hover:border-primary/50 hover:bg-primary-tint",
                  state === "correct" && "anim-pop border-success bg-success/15 text-success-strong",
                  state === "wrong" && "anim-shake border-error bg-error/15 text-error-strong",
                  state === "dim" && "border-border bg-surface text-muted opacity-60",
                )}
              >
                <span lang="ja">{k.char}</span>
              </button>
            );
          })}
        </div>

        {picked ? (
          <div className="flex w-full max-w-md flex-col items-center gap-3">
            <p
              aria-live="polite"
              className={cn(
                "font-bold",
                picked === rd.target.id ? "text-success-strong" : "text-error-strong",
              )}
            >
              {picked === rd.target.id ? "Correct! " : "It was "}
              <span lang="ja" className="font-jp text-xl">
                {rd.target.char}
              </span>{" "}
              = {rd.target.romaji}
            </p>
            <Button onClick={next} size="lg" className="w-full">
              Continue
            </Button>
          </div>
        ) : null}
      </div>
    </main>
  );
}
