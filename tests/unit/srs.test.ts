import { describe, expect, it } from "vitest";
import {
  applyAnswer,
  applyRating,
  emptyProgress,
  isDue,
  MAX_MASTERY,
  nextDue,
  reviewIntervalMs,
} from "@/lib/srs";

describe("applyAnswer", () => {
  it("bumps mastery and streak on correct", () => {
    const p = applyAnswer(emptyProgress(), true);
    expect(p.mastery).toBe(1);
    expect(p.streak).toBe(1);
    expect(p.correct).toBe(1);
    expect(p.lastResult).toBe("correct");
  });

  it("demotes one box and resets streak on wrong", () => {
    let p = emptyProgress();
    p = applyAnswer(p, true);
    p = applyAnswer(p, true); // mastery 2, streak 2
    p = applyAnswer(p, false);
    expect(p.mastery).toBe(1);
    expect(p.streak).toBe(0);
    expect(p.lastResult).toBe("wrong");
  });

  it("clamps mastery to the 0..MAX range", () => {
    let p = emptyProgress();
    for (let i = 0; i < 10; i++) p = applyAnswer(p, true);
    expect(p.mastery).toBe(MAX_MASTERY);
    p = applyAnswer(emptyProgress(), false);
    expect(p.mastery).toBe(0);
  });
});

describe("applyRating", () => {
  it("maps grades to mastery deltas", () => {
    expect(applyRating({ ...emptyProgress(), mastery: 2 }, "again").mastery).toBe(0);
    expect(applyRating({ ...emptyProgress(), mastery: 2 }, "hard").mastery).toBe(2);
    expect(applyRating({ ...emptyProgress(), mastery: 2 }, "good").mastery).toBe(3);
    expect(applyRating({ ...emptyProgress(), mastery: 2 }, "easy").mastery).toBe(4);
  });

  it("counts non-again grades as correct", () => {
    expect(applyRating(emptyProgress(), "again").streak).toBe(0);
    expect(applyRating(emptyProgress(), "good").streak).toBe(1);
  });
});

describe("review scheduling", () => {
  it("gives longer intervals for higher mastery", () => {
    expect(reviewIntervalMs(0)).toBeLessThan(reviewIntervalMs(2));
    expect(reviewIntervalMs(2)).toBeLessThan(reviewIntervalMs(5));
    // clamps out-of-range mastery
    expect(reviewIntervalMs(99)).toBe(reviewIntervalMs(5));
    expect(reviewIntervalMs(-3)).toBe(reviewIntervalMs(0));
  });

  it("marks a kana due only once seen and past its due time", () => {
    const now = 1_000_000_000;
    // unseen -> never due
    expect(isDue({ ...emptyProgress() }, now)).toBe(false);
    // seen, scheduled in the future -> not due yet
    expect(isDue({ ...emptyProgress(), seen: 1, due: nextDue(1, now) }, now)).toBe(false);
    // seen, due time passed -> due
    expect(isDue({ ...emptyProgress(), seen: 1, due: now - 1 }, now)).toBe(true);
    // seen with no schedule (legacy save) -> treated as due
    expect(isDue({ mastery: 1, seen: 1, correct: 1, streak: 1, lastResult: "correct" }, now)).toBe(true);
  });
});
