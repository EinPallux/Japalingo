"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { getKana } from "@/data/curriculum";
import { speakJa } from "@/lib/audio";
import { useSpeechStatus } from "@/lib/use-speech";
import type { Kana } from "@/types";

const VOWEL_IDS = ["hira-a", "hira-i", "hira-u", "hira-e", "hira-o"];
const K_ROW_IDS = ["hira-ka", "hira-ki", "hira-ku", "hira-ke", "hira-ko"];

function kanaList(ids: string[]): Kana[] {
  return ids.map((id) => getKana(id)).filter((k): k is Kana => Boolean(k));
}

const anim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function SoundsPrimer() {
  const router = useRouter();
  const [step, setStep] = useState(0);
  const speech = useSpeechStatus();
  const vowels = kanaList(VOWEL_IDS);
  const kRow = kanaList(K_ROW_IDS);

  const canHear = speech === "ready";
  const finish = () => router.push("/learn");

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-6 px-5 py-10">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div key="s0" {...anim} className="flex flex-col items-center gap-5 text-center">
              <HoshiStatic className="size-28" />
              <div>
                <h1 className="font-display text-3xl font-bold text-ink">Start with 5 sounds</h1>
                <p className="mt-2 text-muted">
                  Japanese reading is built from just five vowels. Learn these and you&apos;re most of
                  the way there.
                </p>
              </div>
              <div className="flex w-full flex-col gap-2">
                {vowels.map((k) => (
                  <SoundRow key={k.id} kana={k} canHear={canHear} />
                ))}
              </div>
              {!canHear ? (
                <p className="text-xs text-muted">
                  🔇 Tapping plays audio only if your browser has a Japanese voice — the readings below
                  work either way.
                </p>
              ) : null}
              <Button onClick={() => setStep(1)} size="lg" className="w-full">
                Got it — next
              </Button>
            </motion.div>
          ) : null}

          {step === 1 ? (
            <motion.div key="s1" {...anim} className="flex flex-col items-center gap-5 text-center">
              <HoshiStatic className="size-24" />
              <div>
                <h1 className="font-display text-2xl font-bold text-ink">Add a consonant</h1>
                <p className="mt-2 text-muted">
                  Every other kana is a consonant + one of those vowels. Add a <strong>k</strong> and
                  the whole row falls out:
                </p>
              </div>
              <p className="font-display text-lg font-bold text-ink">
                k +{" "}
                <span lang="ja" className="font-jp text-primary">
                  あいうえお
                </span>
              </p>
              <div className="grid w-full grid-cols-5 gap-2">
                {kRow.map((k) => (
                  <button
                    key={k.id}
                    type="button"
                    onClick={() => speakJa(k.char)}
                    className="flex flex-col items-center gap-1 rounded-blob-lg border border-border bg-surface py-3 transition hover:border-primary/40"
                  >
                    <span lang="ja" className="font-jp text-2xl font-bold text-ink">
                      {k.char}
                    </span>
                    <span className="text-xs font-bold text-muted">{k.romaji}</span>
                  </button>
                ))}
              </div>
              <p className="text-sm text-muted">
                Same trick for s, t, n, h, m, y, r, w — that&apos;s the whole system.
              </p>
              <div className="flex w-full gap-3">
                <Button onClick={() => setStep(0)} size="lg" variant="ghost" className="flex-1">
                  Back
                </Button>
                <Button onClick={() => setStep(2)} size="lg" className="flex-1">
                  Next
                </Button>
              </div>
            </motion.div>
          ) : null}

          {step === 2 ? (
            <motion.div key="s2" {...anim} className="flex flex-col items-center gap-5 text-center">
              <HoshiStatic className="size-32" />
              <div>
                <h1 className="font-display text-3xl font-bold text-ink">That&apos;s the whole system! 🎉</h1>
                <p className="mt-2 text-muted">
                  46 basic sounds, all from 5 vowels. Hoshi will teach them one row at a time — with a
                  story to make each one stick.
                </p>
              </div>
              <Button onClick={finish} size="lg" className="w-full">
                Start learning 🚀
              </Button>
              <button
                type="button"
                onClick={() => setStep(0)}
                className="text-sm font-semibold text-muted transition hover:text-ink"
              >
                Replay the primer
              </button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={
                "h-2 rounded-full transition-all " + (i === step ? "w-8 bg-primary" : "w-2 bg-border")
              }
            />
          ))}
        </div>
      </div>
    </div>
  );
}

function SoundRow({ kana, canHear }: { kana: Kana; canHear: boolean }) {
  return (
    <button
      type="button"
      onClick={() => speakJa(kana.char)}
      className="flex items-center gap-4 rounded-blob-lg border border-border bg-surface px-4 py-3 text-left transition hover:border-primary/40"
    >
      <span lang="ja" className="font-jp text-4xl font-bold text-primary">
        {kana.char}
      </span>
      <span className="min-w-0 flex-1">
        <span className="font-display text-lg font-bold text-ink">{kana.romaji}</span>
        <span className="block truncate text-sm text-muted">{kana.pronunciation}</span>
      </span>
      <span aria-hidden className="text-lg text-info">
        {canHear ? "🔊" : "🔇"}
      </span>
    </button>
  );
}
