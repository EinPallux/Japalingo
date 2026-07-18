"use client";

import { motion } from "framer-motion";
import Link from "next/link";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { selectStreak, selectTodayXp, useProgress } from "@/stores/progress";

function Stat({
  icon,
  value,
  label,
  className,
}: {
  icon: string;
  value: number;
  label: string;
  className?: string;
}) {
  return (
    <span className={cn("flex items-center gap-1", className)} aria-label={`${label}: ${value}`}>
      <span aria-hidden>{icon}</span>
      <span>{value}</span>
    </span>
  );
}

function DailyGoalRing({ value, goal }: { value: number; goal: number }) {
  const pct = goal > 0 ? Math.min(1, value / goal) : 0;
  const r = 15;
  const c = 2 * Math.PI * r;
  const complete = pct >= 1;
  return (
    <div
      className="relative grid size-10 place-items-center"
      aria-label={`Daily goal: ${value} of ${goal} XP`}
      title={`Daily goal: ${value}/${goal} XP`}
    >
      <svg viewBox="0 0 40 40" className="size-10 -rotate-90">
        <circle cx="20" cy="20" r={r} fill="none" stroke="var(--jl-border)" strokeWidth="5" />
        {/* The ring springs to its new fill whenever XP lands — a live reward. */}
        <motion.circle
          cx="20"
          cy="20"
          r={r}
          fill="none"
          stroke="var(--jl-accent)"
          strokeWidth="5"
          strokeLinecap="round"
          strokeDasharray={c}
          initial={false}
          animate={{ strokeDashoffset: c * (1 - pct) }}
          transition={{ type: "spring", stiffness: 90, damping: 18 }}
        />
      </svg>
      <span aria-hidden className={cn("absolute text-[11px]", complete && "anim-pop")}>
        {complete ? "✅" : "🎯"}
      </span>
    </div>
  );
}

export function AppHeader() {
  const mounted = useMounted();
  const xp = useProgress((s) => s.xp);
  const coins = useProgress((s) => s.coins);
  const gems = useProgress((s) => s.gems);
  const streak = useProgress(selectStreak);
  const todayXp = useProgress(selectTodayXp);
  const goal = useProgress((s) => s.dailyGoalXp);
  const name = useProgress((s) => s.name);

  const initial = mounted && name.trim() ? name.trim()[0]!.toUpperCase() : "・";

  return (
    <header className="sticky top-0 z-40 border-b border-border bg-bg/85 pt-safe backdrop-blur-md">
      <div className="mx-auto flex h-16 max-w-3xl items-center justify-between gap-3 px-4">
        <Link href="/learn" className="flex items-center gap-2" aria-label="Japalingo — learn">
          <HoshiStatic className="size-8" />
          <span className="hidden font-display text-lg font-bold text-ink sm:inline">Japalingo</span>
        </Link>
        <div className="flex items-center gap-2 font-display font-bold sm:gap-3">
          <span
            className="flex items-center gap-1 text-secondary-strong"
            aria-label={`Day streak: ${mounted ? streak : 0}`}
          >
            {/* The flame flickers while the streak is alive. */}
            <span aria-hidden className={cn(mounted && streak > 0 && "anim-flame")}>
              🔥
            </span>
            <span>{mounted ? streak : 0}</span>
          </span>
          <Stat icon="🪙" value={mounted ? coins : 0} label="Coins" className="text-accent-strong" />
          <Stat icon="💎" value={mounted ? gems : 0} label="Gems" className="text-info" />
          <DailyGoalRing value={mounted ? todayXp : 0} goal={mounted ? goal : 30} />
          <Link
            href="/learn/shop"
            aria-label="Shop"
            className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-border bg-surface text-lg transition hover:bg-surface-2"
          >
            <span aria-hidden>🛍️</span>
          </Link>
          <Link
            href="/profile"
            aria-label="Your profile"
            className="grid size-10 shrink-0 place-items-center rounded-full border-2 border-border bg-surface text-ink transition hover:bg-surface-2"
          >
            <span className="font-display text-sm font-bold">{initial}</span>
          </Link>
        </div>
      </div>
    </header>
  );
}
