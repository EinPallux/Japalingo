"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useRouter } from "next/navigation";
import { useState } from "react";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";

const REASONS = [
  { id: "anime", label: "Anime & manga", emoji: "🎌" },
  { id: "travel", label: "Travel to Japan", emoji: "✈️" },
  { id: "heritage", label: "Heritage & family", emoji: "🏮" },
  { id: "brain", label: "Train my brain", emoji: "🧠" },
  { id: "fun", label: "Just for fun", emoji: "✨" },
];

const GOALS = [
  { xp: 20, label: "Casual", note: "5 min / day" },
  { xp: 30, label: "Regular", note: "10 min / day" },
  { xp: 50, label: "Serious", note: "15 min / day" },
  { xp: 80, label: "Intense", note: "20 min / day" },
];

const anim = {
  initial: { opacity: 0, y: 12 },
  animate: { opacity: 1, y: 0 },
  exit: { opacity: 0, y: -12 },
};

export function Onboarding() {
  const router = useRouter();
  const completeOnboarding = useProgress((s) => s.completeOnboarding);
  const [step, setStep] = useState(0);
  const [name, setName] = useState("");
  const [reason, setReason] = useState<string | null>(null);
  const [goal, setGoal] = useState(30);

  // Send new learners straight into the sounds primer — the gentlest on-ramp —
  // rather than dropping them cold onto the dashboard.
  const finish = () => {
    completeOnboarding({ name: name.trim() || "friend", reason, dailyGoalXp: goal });
    router.push("/learn/sounds");
  };

  return (
    <div className="fixed inset-0 z-50 overflow-y-auto bg-bg">
      <div className="mx-auto flex min-h-dvh max-w-md flex-col justify-center gap-8 px-5 py-10">
        <AnimatePresence mode="wait">
          {step === 0 ? (
            <motion.div key="s0" {...anim} className="flex flex-col items-center gap-6 text-center">
              <HoshiStatic className="size-40" />
              <div>
                <h1 className="font-display text-3xl font-bold text-ink">Hi, I&apos;m Hoshi! 🌟</h1>
                <p className="mt-2 text-muted">
                  Let&apos;s learn to read Japanese together — the fun way. What should I call you?
                </p>
              </div>
              <input
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Your name (optional)"
                maxLength={20}
                aria-label="Your name"
                className="w-full rounded-blob border-2 border-border bg-surface px-4 py-3 text-center font-display text-lg text-ink outline-none focus:border-primary"
              />
              <Button onClick={() => setStep(1)} size="lg" className="w-full">
                Let&apos;s go!
              </Button>
            </motion.div>
          ) : null}

          {step === 1 ? (
            <motion.div key="s1" {...anim} className="flex flex-col gap-5">
              <div className="text-center">
                <h1 className="font-display text-2xl font-bold text-ink">
                  Why are you learning Japanese?
                </h1>
                <p className="mt-1 text-muted">This helps Hoshi cheer you on.</p>
              </div>
              <div className="flex flex-col gap-3">
                {REASONS.map((r) => (
                  <button
                    key={r.id}
                    type="button"
                    onClick={() => setReason(r.id)}
                    aria-pressed={reason === r.id}
                    className={cn(
                      "flex items-center gap-3 rounded-blob-lg border-2 px-4 py-3 text-left font-semibold transition",
                      reason === r.id
                        ? "border-primary bg-primary-tint text-primary"
                        : "border-border bg-surface text-ink hover:bg-surface-2",
                    )}
                  >
                    <span aria-hidden className="text-2xl">
                      {r.emoji}
                    </span>
                    {r.label}
                  </button>
                ))}
              </div>
              <Button onClick={() => setStep(2)} size="lg" className="w-full">
                Continue
              </Button>
            </motion.div>
          ) : null}

          {step === 2 ? (
            <motion.div key="s2" {...anim} className="flex flex-col gap-5">
              <div className="text-center">
                <h1 className="font-display text-2xl font-bold text-ink">Set your daily goal</h1>
                <p className="mt-1 text-muted">You can change this anytime.</p>
              </div>
              <div className="flex flex-col gap-3">
                {GOALS.map((g) => (
                  <button
                    key={g.xp}
                    type="button"
                    onClick={() => setGoal(g.xp)}
                    aria-pressed={goal === g.xp}
                    className={cn(
                      "flex items-center justify-between rounded-blob-lg border-2 px-4 py-3 font-semibold transition",
                      goal === g.xp
                        ? "border-primary bg-primary-tint"
                        : "border-border bg-surface hover:bg-surface-2",
                    )}
                  >
                    <span className="font-display text-ink">{g.label}</span>
                    <span className="text-sm text-muted">
                      {g.note} · {g.xp} XP
                    </span>
                  </button>
                ))}
              </div>
              <Button onClick={finish} size="lg" className="w-full">
                Start learning! 🚀
              </Button>
            </motion.div>
          ) : null}
        </AnimatePresence>

        <div className="flex justify-center gap-2">
          {[0, 1, 2].map((i) => (
            <span
              key={i}
              className={cn(
                "h-2 rounded-full transition-all",
                i === step ? "w-8 bg-primary" : "w-2 bg-border",
              )}
            />
          ))}
        </div>
      </div>
    </div>
  );
}
