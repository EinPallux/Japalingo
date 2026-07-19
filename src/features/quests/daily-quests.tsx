"use client";

import { sfx } from "@/lib/audio";
import { dailyQuests, questView } from "@/lib/quests";
import { cn } from "@/lib/utils";
import { dayNumber, todayKey, useProgress } from "@/stores/progress";

const NO_CLAIMS: string[] = [];

/**
 * Daily quest board for the dashboard. Reads the day-scoped metrics from the
 * store (already gated behind `mounted` by the dashboard, so no hydration
 * concern here) and lets the player claim a gem reward for each completed quest.
 */
export function DailyQuests() {
  // Select stable primitives/references only — deriving a fresh object or array
  // inside a zustand selector triggers an infinite re-render loop.
  const goal = useProgress((s) => s.dailyGoalXp);
  const todayDate = useProgress((s) => s.todayDate);
  const todayXp = useProgress((s) => s.todayXp);
  const dailyCorrect = useProgress((s) => s.dailyCorrect);
  const claimedQuests = useProgress((s) => s.claimedQuests);
  const claim = useProgress((s) => s.claimQuest);

  // Read-time daily rollover: zero the metrics/claims once the day has changed.
  const active = todayDate === todayKey();
  const metrics = { xp: active ? todayXp : 0, correct: active ? dailyCorrect : 0 };
  const claimed = active ? claimedQuests : NO_CLAIMS;

  const quests = dailyQuests(dayNumber(), goal).map((q) => questView(q, metrics, claimed));
  const claimedCount = quests.filter((q) => q.claimed).length;

  return (
    <section className="rounded-blob-lg border border-border bg-surface p-4">
      <div className="mb-3 flex items-center justify-between gap-2">
        <h2 className="flex items-center gap-2 font-display font-bold text-ink">
          <span aria-hidden>📋</span> Daily Quests
        </h2>
        <span className="text-xs font-semibold text-muted">
          {claimedCount}/{quests.length} · resets at midnight
        </span>
      </div>

      <ul className="flex flex-col gap-3">
        {quests.map((q) => {
          const pct = q.target > 0 ? Math.min(100, Math.round((q.value / q.target) * 100)) : 0;
          return (
            <li key={q.id} className="flex items-center gap-3">
              <span
                aria-hidden
                className="grid size-9 shrink-0 place-items-center rounded-blob bg-surface-2 text-lg"
              >
                {q.emoji}
              </span>
              <div className="min-w-0 flex-1">
                <div className="flex items-center justify-between gap-2">
                  <p className="truncate text-sm font-semibold text-ink">{q.label}</p>
                  <span className="shrink-0 text-xs font-bold text-muted">
                    {Math.min(q.value, q.target)}/{q.target}
                  </span>
                </div>
                <div
                  className="mt-1 h-2 overflow-hidden rounded-full bg-surface-2"
                  role="progressbar"
                  aria-valuenow={pct}
                  aria-valuemin={0}
                  aria-valuemax={100}
                  aria-label={`${q.label}: ${pct}% complete`}
                >
                  <div
                    className={cn(
                      "h-full rounded-full transition-all duration-300",
                      q.claimed ? "bg-success" : "bg-accent",
                    )}
                    style={{ width: `${pct}%` }}
                  />
                </div>
              </div>

              {q.claimed ? (
                <span
                  aria-label="Claimed"
                  className="shrink-0 font-display text-base font-bold text-success-strong"
                >
                  ✓
                </span>
              ) : q.done ? (
                <button
                  type="button"
                  onClick={() => {
                    claim(q.id, q.reward, q.metric, q.target);
                    sfx.coin();
                  }}
                  className="anim-claim shrink-0 rounded-full bg-accent px-3 py-1.5 font-display text-sm font-bold text-ink shadow-[0_3px_0_0_var(--jl-accent-strong)] transition hover:brightness-105 active:translate-y-0.5"
                >
                  +{q.reward} 💎
                </button>
              ) : null}
            </li>
          );
        })}
      </ul>
    </section>
  );
}
