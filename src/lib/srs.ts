import type { KanaProgress } from "@/types";

export const XP_PER_CORRECT = 10;
export const XP_LESSON_COMPLETE = 20;
export const MAX_MASTERY = 5;

export type Grade = "again" | "hard" | "good" | "easy";

const HOUR = 3_600_000;
const DAY = 86_400_000;

/**
 * Spaced-repetition intervals by mastery box (0–5): the higher the mastery, the
 * longer until the kana is due again. A miss drops the box, so it returns soon.
 */
export const REVIEW_INTERVALS_MS = [4 * HOUR, DAY, 2 * DAY, 4 * DAY, 8 * DAY, 16 * DAY];

export function reviewIntervalMs(mastery: number): number {
  const box = Math.max(0, Math.min(REVIEW_INTERVALS_MS.length - 1, Math.round(mastery)));
  return REVIEW_INTERVALS_MS[box]!;
}

/** When should a kana next surface for review, given its mastery and now? */
export function nextDue(mastery: number, now: number): number {
  return now + reviewIntervalMs(mastery);
}

/** A seen kana is due once its scheduled time has passed (missing = due now). */
export function isDue(p: KanaProgress | undefined, now: number): boolean {
  return Boolean(p && p.seen > 0 && (p.due ?? 0) <= now);
}

export function emptyProgress(): KanaProgress {
  return { mastery: 0, seen: 0, correct: 0, streak: 0, lastResult: null, due: 0 };
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
