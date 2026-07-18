"use client";

import { useRouter } from "next/navigation";
import { useEffect, useMemo, useRef, useState } from "react";
import { Confetti } from "@/components/feedback/confetti";
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

const PAIRS = 6;

type Card = { uid: string; kanaId: string; kind: "kana" | "romaji"; label: string };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

function buildCards(learned: Kana[]): Card[] {
  const chosen = shuffle(learned).slice(0, PAIRS);
  const cards = chosen.flatMap((k): Card[] => [
    { uid: `${k.id}-k`, kanaId: k.id, kind: "kana", label: k.char },
    { uid: `${k.id}-r`, kanaId: k.id, kind: "romaji", label: k.romaji },
  ]);
  return shuffle(cards);
}

export function KanaMatch({ track }: { track: Track }) {
  const mounted = useMounted();
  const kanaProgress = useProgress((s) => s.kana);
  const learned = useMemo(() => learnedKana(track, kanaProgress), [track, kanaProgress]);

  // Gate on mount so the localStorage-derived learned set doesn't mismatch SSR.
  if (!mounted) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </main>
    );
  }

  if (learned.length < PAIRS) {
    return <NotEnoughKana need={PAIRS} have={learned.length} />;
  }

  return <KanaMatchGame learned={learned} />;
}

/** The playable board — only mounted once enough kana have been met, so its
 *  initial card deal is always drawn from real, learned characters. */
function KanaMatchGame({ learned }: { learned: Kana[] }) {
  const router = useRouter();
  const [cards, setCards] = useState<Card[]>(() => buildCards(learned));
  const [flipped, setFlipped] = useState<string[]>([]);
  const [matched, setMatched] = useState<Set<string>>(new Set());
  const [moves, setMoves] = useState(0);
  const [busy, setBusy] = useState(false);
  const flipBackTimer = useRef<number | null>(null);

  useEffect(
    () => () => {
      if (flipBackTimer.current) window.clearTimeout(flipBackTimer.current);
    },
    [],
  );

  const done = matched.size === PAIRS;

  const restart = () => {
    setCards(buildCards(learned));
    setFlipped([]);
    setMatched(new Set());
    setMoves(0);
    setBusy(false);
  };

  const flip = (card: Card) => {
    if (busy || flipped.includes(card.uid) || matched.has(card.kanaId)) return;
    sfx.tap();
    const next = [...flipped, card.uid];
    setFlipped(next);
    if (next.length < 2) return;

    setMoves((m) => m + 1);
    const [a, b] = next.map((uid) => cards.find((c) => c.uid === uid)!);
    if (a && b && a.kanaId === b.kanaId && a.kind !== b.kind) {
      sfx.correct();
      useProgress.getState().answer(a.kanaId, true);
      const isLast = matched.size + 1 === PAIRS;
      setMatched((prev) => new Set(prev).add(a.kanaId));
      setFlipped([]);
      if (isLast) {
        sfx.complete();
        useProgress.getState().addXp(15);
      }
    } else {
      setBusy(true);
      sfx.wrong();
      flipBackTimer.current = window.setTimeout(() => {
        setFlipped([]);
        setBusy(false);
      }, 850);
    }
  };

  if (done) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center px-5 py-10">
        <Confetti />
        <div className="flex w-full max-w-md flex-col items-center gap-6 text-center">
          <div className="anim-bob">
            <HoshiStatic className="size-32" />
          </div>
          <h1 className="font-display text-3xl font-bold text-ink">All matched! 🎉</h1>
          <p className="text-muted">Cleared {PAIRS} pairs in {moves} moves.</p>
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

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col px-4 py-4">
      <div className="mb-4 flex items-center justify-between">
        <button
          type="button"
          aria-label="Exit game"
          onClick={() => router.push("/learn")}
          className="grid size-11 place-items-center rounded-full text-muted transition hover:bg-surface-2"
        >
          <CloseIcon className="size-6" />
        </button>
        <p className="font-display font-bold text-ink">
          {matched.size}/{PAIRS} pairs · {moves} moves
        </p>
      </div>

      <p className="mb-4 text-center text-sm text-muted">Match each character with its reading.</p>

      <div className="grid grid-cols-3 gap-3">
        {cards.map((card) => {
          const isUp = flipped.includes(card.uid) || matched.has(card.kanaId);
          const isMatched = matched.has(card.kanaId);
          return (
            <button
              key={card.uid}
              type="button"
              onClick={() => flip(card)}
              aria-label={isUp ? card.label : "Hidden card"}
              className={cn(
                "grid aspect-square place-items-center rounded-blob-lg border-2 font-bold transition",
                card.kind === "kana" ? "font-jp text-4xl" : "font-display text-2xl",
                isMatched
                  ? "anim-pop border-success bg-success/15 text-success-strong"
                  : isUp
                    ? "border-primary bg-primary-tint text-ink"
                    : "border-transparent bg-primary text-primary shadow-[0_4px_0_0_var(--jl-primary-strong)] hover:brightness-105",
              )}
            >
              <span lang={card.kind === "kana" ? "ja" : undefined}>{isUp ? card.label : "・"}</span>
            </button>
          );
        })}
      </div>
    </main>
  );
}
