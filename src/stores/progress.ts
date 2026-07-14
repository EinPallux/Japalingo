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
  kana: {} as Record<string, KanaProgress>,
  completedLessons: [] as string[],
  activeTrack: "hiragana" as Track,
};

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,

      completeOnboarding: ({ name, reason, dailyGoalXp }) =>
        set({ onboardingComplete: true, name, reason, dailyGoalXp }),

      setActiveTrack: (activeTrack) => set({ activeTrack }),

      addXp: (n) =>
        set((s) => {
          const t = today();
          const todayXp = s.todayDate === t ? s.todayXp + n : n;
          let streakCount = s.streakCount;
          let streakDate = s.streakDate;
          if (s.streakDate !== t) {
            streakCount = s.streakDate === yesterday() ? s.streakCount + 1 : 1;
            streakDate = t;
          }
          return { xp: s.xp + n, todayXp, todayDate: t, streakCount, streakDate };
        }),

      answer: (kanaId, correct) => {
        set((s) => {
          const cur = s.kana[kanaId] ?? emptyProgress();
          return { kana: { ...s.kana, [kanaId]: applyAnswer(cur, correct) } };
        });
        if (correct) get().addXp(XP_PER_CORRECT);
      },

      rate: (kanaId, grade) => {
        set((s) => {
          const cur = s.kana[kanaId] ?? emptyProgress();
          return { kana: { ...s.kana, [kanaId]: applyRating(cur, grade) } };
        });
        if (grade !== "again") get().addXp(XP_PER_CORRECT);
      },

      markSeen: (kanaId) => {
        set((s) => {
          const cur = s.kana[kanaId] ?? emptyProgress();
          return { kana: { ...s.kana, [kanaId]: { ...cur, seen: cur.seen + 1 } } };
        });
        get().addXp(2);
      },

      completeLesson: (lessonId) => {
        const alreadyDone = get().completedLessons.includes(lessonId);
        if (!alreadyDone) {
          set((s) => ({
            completedLessons: [...s.completedLessons, lessonId],
            gems: s.gems + 5,
          }));
          get().addXp(XP_LESSON_COMPLETE);
        }
        return { alreadyDone };
      },

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
