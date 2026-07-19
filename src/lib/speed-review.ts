/**
 * Speed Review — a timed recognition checkpoint over a unit's kana. Beating it
 * (fast + accurate) crowns the unit gold, a second progression layer on top of
 * finishing its lessons. Reuses the lesson builder's vetted, same-track,
 * no-homophone distractors so the quiz can't be gamed or ambiguous.
 */
import { buildReviewQueue, type Exercise } from "@/features/lessons/build-queue";
import type { Kana } from "@/types";

export interface SpeedQuestion {
  kana: Kana;
  options: string[];
}

/** Seconds allowed per kana; the total has a floor so tiny units aren't trivial. */
export const SECONDS_PER_KANA = 4;
export const MIN_SECONDS = 16;

type ChoiceExercise = Extract<Exercise, { kind: "choice" }>;

/** One recognition question (kana → reading) per unit kana, order shuffled. */
export function buildSpeedQuiz(kana: Kana[]): SpeedQuestion[] {
  return buildReviewQueue(kana)
    .filter((e): e is ChoiceExercise => e.kind === "choice" && e.direction === "k2r")
    .map((e) => ({ kana: e.kana, options: e.options }));
}

export function timeLimitMs(count: number): number {
  return Math.max(MIN_SECONDS, count * SECONDS_PER_KANA) * 1000;
}

/** Gold crown = beat the clock with at least 80% correct (rounded up). */
export function crownThreshold(count: number): number {
  return Math.max(1, Math.ceil(count * 0.8));
}

export function isCrownWin(correct: number, count: number, timedOut: boolean): boolean {
  return !timedOut && count > 0 && correct >= crownThreshold(count);
}
