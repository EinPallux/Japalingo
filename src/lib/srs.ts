import type { KanaProgress } from "@/types";

export const XP_PER_CORRECT = 10;
export const XP_LESSON_COMPLETE = 20;
export const MAX_MASTERY = 5;

export type Grade = "again" | "hard" | "good" | "easy";

export function emptyProgress(): KanaProgress {
  return { mastery: 0, seen: 0, correct: 0, streak: 0, lastResult: null };
}

/** Objective answer (choice / listen): correct bumps mastery, wrong demotes one box. */
export function applyAnswer(p: KanaProgress, correct: boolean): KanaProgress {
  return {
    mastery: correct ? Math.min(MAX_MASTERY, p.mastery + 1) : Math.max(0, p.mastery - 1),
    seen: p.seen + 1,
    correct: p.correct + (correct ? 1 : 0),
    streak: correct ? p.streak + 1 : 0,
    lastResult: correct ? "correct" : "wrong",
  };
}

/** Self-rating (Kana Drill, MARU-style): again resets, easy jumps ahead. */
export function applyRating(p: KanaProgress, grade: Grade): KanaProgress {
  const delta = grade === "again" ? -2 : grade === "hard" ? 0 : grade === "good" ? 1 : 2;
  const correct = grade !== "again";
  return {
    mastery: Math.max(0, Math.min(MAX_MASTERY, p.mastery + delta)),
    seen: p.seen + 1,
    correct: p.correct + (correct ? 1 : 0),
    streak: correct ? p.streak + 1 : 0,
    lastResult: correct ? "correct" : "wrong",
  };
}
