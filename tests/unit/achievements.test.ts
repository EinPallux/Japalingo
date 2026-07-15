import { describe, expect, it } from "vitest";
import { badgesFor, rankFor } from "@/lib/achievements";
import type { KanaProgress } from "@/types";

const emptyKana: Record<string, KanaProgress> = {};

describe("rankFor", () => {
  it("maps XP to the right rank tier", () => {
    expect(rankFor(0).name).toBe("Kana Sprout");
    expect(rankFor(150).name).toBe("Apprentice");
    expect(rankFor(800).name).toBe("Scholar");
    expect(rankFor(5000).name).toBe("Kana Master");
  });

  it("reports the next threshold (null at the top)", () => {
    expect(rankFor(0).next).toBe(100);
    expect(rankFor(5000).next).toBeNull();
  });
});

describe("badgesFor", () => {
  it("earns First Steps after one lesson and On Fire at a 3-day streak", () => {
    const badges = badgesFor({ xp: 0, streakCount: 3, completedLessons: ["l1"], kana: emptyKana });
    expect(badges.find((b) => b.id === "first")?.earned).toBe(true);
    expect(badges.find((b) => b.id === "onfire")?.earned).toBe(true);
    expect(badges.find((b) => b.id === "week")?.earned).toBe(false);
    expect(badges.find((b) => b.id === "rising")?.earned).toBe(false);
  });

  it("keeps streak badges earned via bestStreak even after the streak breaks", () => {
    // Current streak is 0 (broken), but the learner once reached 7 days.
    const badges = badgesFor({ xp: 0, streakCount: 0, bestStreak: 7, completedLessons: [], kana: emptyKana });
    expect(badges.find((b) => b.id === "onfire")?.earned).toBe(true);
    expect(badges.find((b) => b.id === "week")?.earned).toBe(true);
  });
});
