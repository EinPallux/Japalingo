"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { CloseIcon } from "@/components/ui/icons";
import { sfx } from "@/lib/audio";
import { cn } from "@/lib/utils";
import { trackKana } from "@/data/curriculum";
import { useProgress } from "@/stores/progress";
import type { Kana, Track } from "@/types";
import { useRouter } from "next/navigation";

type Drop = { key: number; kana: Kana; x: number; y: number; speed: number };

const START_LIVES = 3;
const MAX_ON_SCREEN = 6;

export function KanaRain({ track }: { track: Track }) {
  const router = useRouter();
  const pool = useMemo(() => trackKana(track), [track]);

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

  const spawn = () => {
    const kana = pool[Math.floor(Math.random() * pool.length)]!;
    idRef.current += 1;
    dropsRef.current = [
      ...dropsRef.current,
      { key: idRef.current, kana, x: 8 + Math.random() * 78, y: -6, speed: 9 + Math.random() * 4 },
    ];
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
      const boost = 1 + elapsedRef.current / 70;

      let cur = dropsRef.current.map((d) => ({ ...d, y: d.y + d.speed * boost * dt }));
      const landed = cur.filter((d) => d.y >= 100).length;
      cur = cur.filter((d) => d.y < 100);
      if (landed > 0) {
        livesRef.current = Math.max(0, livesRef.current - landed);
        comboRef.current = 0;
        sfx.wrong();
        setLives(livesRef.current);
        setCombo(0);
      }

      spawnRef.current += dt;
      const interval = Math.max(0.75, 1.7 - elapsedRef.current / 45);
      if (spawnRef.current >= interval && cur.length < MAX_ON_SCREEN) {
        spawnRef.current = 0;
        const kana = pool[Math.floor(Math.random() * pool.length)]!;
        idRef.current += 1;
        cur.push({ key: idRef.current, kana, x: 8 + Math.random() * 78, y: -6, speed: 9 + Math.random() * 4 });
      }

      dropsRef.current = cur;
      setDrops(cur);

      if (livesRef.current <= 0) {
        setStatus("over");
        return;
      }
      raf = requestAnimationFrame(loop);
    };

    // seed two drops then run
    spawn();
    setDrops(dropsRef.current);
    raf = requestAnimationFrame(loop);
    return () => cancelAnimationFrame(raf);
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [status]);

  const handleInput = (value: string) => {
    setInput(value);
    const v = value.toLowerCase().trim();
    if (!v) return;
    const match = dropsRef.current
      .filter((d) => d.kana.romaji === v || d.kana.altRomaji?.includes(v))
      .sort((a, b) => b.y - a.y)[0];
    if (!match) return;

    dropsRef.current = dropsRef.current.filter((d) => d.key !== match.key);
    setDrops(dropsRef.current);
    comboRef.current += 1;
    const nextCombo = comboRef.current;
    setCombo(nextCombo);
    setBestCombo((b) => Math.max(b, nextCombo));
    setScore((s) => s + 10 * nextCombo);
    setCleared((c) => c + 1);
    setInput("");
    sfx.correct();
    useProgress.getState().answer(match.kana.id, true);
  };

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
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-4">
      <div className="mb-3 flex items-center justify-between gap-3">
        <button
          type="button"
          aria-label="Exit game"
          onClick={() => router.push("/learn")}
          className="grid size-10 place-items-center rounded-full text-muted transition hover:bg-surface-2"
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

      <input
        autoFocus
        value={input}
        onChange={(e) => handleInput(e.target.value)}
        placeholder="type the reading…"
        aria-label="Type the reading of a falling kana"
        autoCapitalize="none"
        autoComplete="off"
        spellCheck={false}
        className={cn(
          "mt-3 w-full rounded-blob border-2 border-border bg-surface px-4 py-4 text-center font-display text-xl text-ink outline-none focus:border-primary",
        )}
      />
      <p className="mt-2 text-center text-xs text-muted">
        Type the romaji and the kana pops before it hits the line.
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
