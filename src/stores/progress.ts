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

function today(): string {
  return new Date().toISOString().slice(0, 10);
}
function yesterday(): string {
  return new Date(Date.now() - 86_400_000).toISOString().slice(0, 10);
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
