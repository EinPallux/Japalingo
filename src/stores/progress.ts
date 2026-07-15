import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { KanaProgress, Track } from "@/types";
import {
  applyAnswer,
  applyRating,
  emptyProgress,
  type Grade,
  XP_LESSON_COMPLETE,
  XP_PER_CORRECT,
} from "@/lib/srs";

/** Local-time day key (YYYY-MM-DD). Using local components — not toISOString's
 *  UTC — so streaks and the daily goal roll over at the user's own midnight. */
function dateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function today(): string {
  return dateKey(new Date());
}
function yesterday(): string {
  return dateKey(new Date(Date.now() - 86_400_000));
}

export interface ProgressState {
  onboardingComplete: boolean;
  name: string;
  reason: string | null;
  dailyGoalXp: number;
  xp: number;
  gems: number;
  streakCount: number;
  streakDate: string | null;
  todayXp: number;
  todayDate: string | null;
  /** Correct answers today (drives daily quests). Rolls over with `todayDate`. */
  dailyCorrect: number;
  /** Quest ids already claimed today. Rolls over with `todayDate`. */
  claimedQuests: string[];
  kana: Record<string, KanaProgress>;
  completedLessons: string[];
  activeTrack: Track;

  completeOnboarding(data: { name: string; reason: string | null; dailyGoalXp: number }): void;
  setActiveTrack(track: Track): void;
  addXp(n: number): void;
  answer(kanaId: string, correct: boolean): void;
  rate(kanaId: string, grade: Grade): void;
  markSeen(kanaId: string): void;
  completeLesson(lessonId: string): { alreadyDone: boolean };
  claimQuest(id: string, reward: number): void;
  progressFor(kanaId: string): KanaProgress;
  reset(): void;
}

const initial = {
  onboardingComplete: false,
  name: "",
  reason: null as string | null,
  dailyGoalXp: 30,
  xp: 0,
  gems: 0,
  streakCount: 0,
  streakDate: null as string | null,
  todayXp: 0,
  todayDate: null as string | null,
  dailyCorrect: 0,
  claimedQuests: [] as string[],
  kana: {} as Record<string, KanaProgress>,
  completedLessons: [] as string[],
  activeTrack: "hiragana" as Track,
};

type DailyOpts = { xp?: number; correct?: number };

/**
 * Roll the day-scoped counters over to `today` (zeroing them on a new day),
 * then apply this activity's XP + correct-answer deltas and advance the streak.
 * Centralising the lazy rollover keeps `todayXp`, `dailyCorrect`, the streak,
 * and `claimedQuests` consistent no matter which action fires first.
 */
function applyDaily(s: ProgressState, opts: DailyOpts): Partial<ProgressState> {
  const t = today();
  const sameDay = s.todayDate === t;
  const addXp = opts.xp ?? 0;

  let streakCount = s.streakCount;
  let streakDate = s.streakDate;
  if (addXp > 0 && s.streakDate !== t) {
    streakCount = s.streakDate === yesterday() ? s.streakCount + 1 : 1;
    streakDate = t;
  }

  return {
    xp: s.xp + addXp,
    todayDate: t,
    todayXp: (sameDay ? s.todayXp : 0) + addXp,
    dailyCorrect: (sameDay ? s.dailyCorrect : 0) + (opts.correct ?? 0),
    claimedQuests: sameDay ? s.claimedQuests : [],
    streakCount,
    streakDate,
  };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,

      completeOnboarding: ({ name, reason, dailyGoalXp }) =>
        set({ onboardingComplete: true, name, reason, dailyGoalXp }),

      setActiveTrack: (activeTrack) => set({ activeTrack }),

      addXp: (n) => set((s) => applyDaily(s, { xp: n })),

      answer: (kanaId, correct) =>
        set((s) => {
          const cur = s.kana[kanaId] ?? emptyProgress();
          return {
            kana: { ...s.kana, [kanaId]: applyAnswer(cur, correct) },
            ...applyDaily(s, correct ? { xp: XP_PER_CORRECT, correct: 1 } : {}),
          };
        }),

      rate: (kanaId, grade) =>
        set((s) => {
          const cur = s.kana[kanaId] ?? emptyProgress();
          const ok = grade !== "again";
          return {
            kana: { ...s.kana, [kanaId]: applyRating(cur, grade) },
            ...applyDaily(s, ok ? { xp: XP_PER_CORRECT, correct: 1 } : {}),
          };
        }),

      markSeen: (kanaId) =>
        set((s) => {
          const cur = s.kana[kanaId] ?? emptyProgress();
          return {
            kana: { ...s.kana, [kanaId]: { ...cur, seen: cur.seen + 1 } },
            ...applyDaily(s, { xp: 2 }),
          };
        }),

      completeLesson: (lessonId) => {
        const alreadyDone = get().completedLessons.includes(lessonId);
        if (!alreadyDone) {
          set((s) => ({
            completedLessons: [...s.completedLessons, lessonId],
            gems: s.gems + 5,
            ...applyDaily(s, { xp: XP_LESSON_COMPLETE }),
          }));
        }
        return { alreadyDone };
      },

      claimQuest: (id, reward) =>
        set((s) => {
          const base = applyDaily(s, {});
          const claimed = base.claimedQuests ?? [];
          if (claimed.includes(id)) return {};
          return { ...base, gems: s.gems + reward, claimedQuests: [...claimed, id] };
        }),

      progressFor: (kanaId) => get().kana[kanaId] ?? emptyProgress(),

      reset: () => set({ ...initial }),
    }),
    {
      name: "japalingo-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/**
 * `todayXp`/`streakCount` are only rolled over when XP is written. These
 * selectors derive the *current* values at read time so the UI never shows a
 * stale daily ring (yesterday's XP counting toward today) or a lingering streak
 * flame after a missed day — the flame stays lit while the last active day is
 * today or yesterday, and reads as broken (0) once a day is skipped.
 */
export function selectTodayXp(s: ProgressState): number {
  return s.todayDate === today() ? s.todayXp : 0;
}
export function selectStreak(s: ProgressState): number {
  if (!s.streakDate) return 0;
  return s.streakDate === today() || s.streakDate === yesterday() ? s.streakCount : 0;
}

/** The current local day key — for comparing against the stored `todayDate`. */
export function todayKey(): string {
  return today();
}

/** Today's quest metrics, derived at read time (zeroed once the day rolls). */
export function selectDaily(s: ProgressState): { xp: number; correct: number; claimed: string[] } {
  const active = s.todayDate === today();
  return {
    xp: active ? s.todayXp : 0,
    correct: active ? s.dailyCorrect : 0,
    claimed: active ? s.claimedQuests : [],
  };
}

/** Stable day number (local) — rotates the daily quest set deterministically. */
export function dayNumber(): number {
  const d = new Date();
  return Math.floor(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86_400_000);
}
