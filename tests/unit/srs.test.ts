import { describe, expect, it } from "vitest";
import { applyAnswer, applyRating, emptyProgress, MAX_MASTERY } from "@/lib/srs";

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
