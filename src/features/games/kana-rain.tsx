"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { NotEnoughKana } from "@/components/game/not-enough-kana";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { sfx } from "@/lib/audio";
import { learnedKana } from "@/lib/learned";
import { useMediaQuery } from "@/lib/use-media-query";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { Kana, Track } from "@/types";
import { useRouter } from "next/navigation";

type Drop = { key: number; kana: Kana; x: number; y: number; speed: number };

const START_LIVES = 3;
const MAX_ON_SCREEN = 6;
/** Fewest met kana needed before the rain is fair to play. */
const MIN_KANA = 3;

/** Gate on mount + a big-enough learned pool, then run the game on a ready pool
 *  (so the falling kana are only ones the learner has actually met). */
export function KanaRain({ track }: { track: Track }) {
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

  return <KanaRainGame pool={pool} />;
}

function KanaRainGame({ pool }: { pool: Kana[] }) {
  const router = useRouter();
  // Touch devices can't comfortably type into a timed game — offer a tap keypad.
  const coarse = useMediaQuery("(pointer: coarse)");
  // The fall is a JS RAF loop, so it bypasses the global CSS/Framer reduced-
  // motion handling; gentle it manually for users who ask for less motion.
  const reduceMotion = useMediaQuery("(prefers-reduced-motion: reduce)");

  const [status, setStatus] = useState<"playing" | "over">("playing");
  const [drops, setDrops] = useState<Drop[]>([]);
  const [score, setScore] = useState(0);
  const [combo, setCombo] = useState(0);
  const [bestCombo, setBestCombo] = useState(0);
  const [lives, setLives] = useState(START_LIVES);
  const [cleared, setCleared] = useState(0);
  const [input, setInput] = useState("");

  // mutable game state (updated in the RAF loop / handlers, never read in render)
  const dropsRef = useRef<Drop[]>([]);
  const livesRef = useRef(START_LIVES);
  const comboRef = useRef(0);
  const spawnRef = useRef(0);
  const elapsedRef = useRef(0);
  const lastRef = useRef<number | null>(null);
  const idRef = useRef(0);

  const newDrop = (): Drop => {
    const kana = pool[Math.floor(Math.random() * pool.length)]!;
    idRef.current += 1;
    const base = reduceMotion ? 5.5 : 9;
    const variance = reduceMotion ? 1.5 : 4;
    return {
      key: idRef.current,
      kana,
      x: 8 + Math.random() * 78,
      y: -6,
      speed: base + Math.random() * variance,
    };
  };

  const start = () => {
    dropsRef.current = [];
    livesRef.current = START_LIVES;
    comboRef.current = 0;
    spawnRef.current = 0;
    elapsedRef.current = 0;
    lastRef.current = null;
    setDrops([]);
    setScore(0);
    setCombo(0);
    setBestCombo(0);
    setLives(START_LIVES);
    setCleared(0);
    setInput("");
    setStatus("playing");
  };

  useEffect(() => {
    if (status !== "playing") return;
    let raf = 0;

    const loop = (t: number) => {
      const last = lastRef.current ?? t;
      lastRef.current = t;
      const dt = Math.min(0.05, (t - last) / 1000);
      elapsedRef.current += dt;
      // Reduced motion: keep a gentle, constant pace (no speed-up ramp).
      const boost = reduceMotion ? 1 : 1 + elapsedRef.current / 70;

      let cur = dropsRef.current.map((d) => ({ ...d, y: d.y + d.speed * boost * dt }));
      const landedDrops = cur.filter((d) => d.y >= 100);
      cur = cur.filter((d) => d.y < 100);
      if (landedDrops.length > 0) {
        livesRef.current = Math.max(0, livesRef.current - landedDrops.length);
        comboRef.current = 0;
        sfx.wrong();
        setLives(livesRef.current);
        setCombo(0);
        // A kana hitting the line is a genuine miss — record it so mastery and
        // the SRS schedule reflect the ones the learner couldn't read in time.
        const { answer } = useProgress.getState();
        for (const d of landedDrops) answer(d.kana.id, false);
      }

      spawnRef.current += dt;
      const interval = reduceMotion ? 1.8 : Math.max(0.75, 1.7 - elapsedRef.current / 45);
      if (spawnRef.current >= interval && cur.length < MAX_ON_SCREEN) {
        spawnRef.current = 0;
        cur.push(newDrop());
      }

      dropsRef.current = cur;
      setDrops(cur);

      if (livesRef.current <= 0) {
        setStatus("over");
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    // seed one drop then run
    dropsRef.current = [newDrop()];
    setDrops(dropsRef.current);
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  // Pop the lowest (most urgent) drop whose reading matches. Shared by the
  // typed input and the touch keypad.
  const clearReading = (raw: string): boolean => {
    const v = raw.toLowerCase().trim();
    if (!v) return false;
    const match = dropsRef.current
      .filter((d) => d.kana.romaji === v || d.kana.altRomaji?.includes(v))
      .sort((a, b) => b.y - a.y)[0];
    if (!match) return false;

    dropsRef.current = dropsRef.current.filter((d) => d.key !== match.key);
    setDrops(dropsRef.current);
    comboRef.current += 1;
    const nextCombo = comboRef.current;
    setCombo(nextCombo);
    setBestCombo((b) => Math.max(b, nextCombo));
    setScore((s) => s + 10 * nextCombo);
    setCleared((c) => c + 1);
    sfx.correct();
    useProgress.getState().answer(match.kana.id, true);
    return true;
  };

  const handleInput = (value: string) => {
    setInput(value);
    if (clearReading(value)) setInput("");
  };

  // Distinct readings currently falling, for the touch keypad (stable order).
  const keypad = Array.from(new Set(drops.map((d) => d.kana.romaji))).sort();

  if (status === "over") {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 py-10">
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <HoshiStatic className="size-32" />
          <h1 className="font-display text-3xl font-bold text-ink">Game over!</h1>
          <div className="grid w-full grid-cols-3 gap-3">
            <Stat label="Score" value={score} tone="text-primary" />
            <Stat label="Best combo" value={`×${bestCombo}`} tone="text-secondary-strong" />
            <Stat label="Cleared" value={cleared} tone="text-success-strong" />
          </div>
          <div className="flex w-full flex-col gap-3">
            <Button onClick={start} size="lg" className="w-full">
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

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col px-4 pt-4 pb-safe">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Exit game"
          onClick={() => router.push("/learn")}
          className="grid size-11 place-items-center rounded-full text-muted transition hover:bg-surface-2"
        >
          <CloseIcon className="size-6" />
        </button>
        <div className="flex items-center gap-3 font-display font-bold">
          <span aria-label={`${lives} lives`}>{"❤️".repeat(lives) || "💔"}</span>
          <span className="text-primary" aria-label={`Score ${score}`}>
            {score}
          </span>
        </div>
      </div>

      <div className="relative flex-1 overflow-hidden rounded-blob-lg border-2 border-border bg-surface-2/50">
        {combo > 1 ? (
          <span className="absolute left-1/2 top-3 z-10 -translate-x-1/2 rounded-full bg-secondary px-3 py-1 text-sm font-bold text-white">
            ×{combo} combo
          </span>
        ) : null}
        {drops.map((d) => (
          <span
            key={d.key}
            lang="ja"
            className="font-jp absolute -translate-x-1/2 select-none text-5xl font-bold text-ink"
            style={{ left: `${d.x}%`, top: `${d.y}%` }}
          >
            {d.kana.char}
          </span>
        ))}
        <div className="pointer-events-none absolute inset-x-0 bottom-0 h-1 bg-error/40" />
      </div>

      {coarse ? (
        <div
          className="mt-3 grid grid-cols-4 gap-2"
          role="group"
          aria-label="Tap the reading of a falling kana"
        >
          {keypad.length === 0 ? (
            <p className="col-span-4 py-4 text-center text-sm text-muted">Kana incoming…</p>
          ) : (
            keypad.map((r) => (
              <button
                key={r}
                type="button"
                onClick={() => clearReading(r)}
                className="rounded-blob border-2 border-border bg-surface px-2 py-3 font-display text-lg font-bold text-ink transition active:translate-y-0.5 active:bg-primary-tint"
              >
                {r}
              </button>
            ))
          )}
        </div>
      ) : (
        <input
          autoFocus
          value={input}
          onChange={(e) => handleInput(e.target.value)}
          placeholder="type the reading…"
          aria-label="Type the reading of a falling kana"
          autoCapitalize="none"
          autoComplete="off"
          spellCheck={false}
          className="mt-3 w-full rounded-blob border-2 border-border bg-surface px-4 py-4 text-center font-display text-xl text-ink outline-none focus:border-primary"
        />
      )}
      <p className="mt-2 text-center text-xs text-muted">
        {coarse
          ? "Tap the reading of a kana to pop it before it hits the line."
          : "Type the romaji and the kana pops before it hits the line."}
      </p>
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
