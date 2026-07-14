import { beforeEach, describe, expect, it } from "vitest";
import { useProgress } from "@/stores/progress";

const s = () => useProgress.getState();

beforeEach(() => s().reset());

describe("progress store", () => {
  it("awards XP, mastery, and a streak on a correct answer", () => {
    s().answer("hira-a", true);
    expect(s().xp).toBe(10);
    expect(s().kana["hira-a"]?.mastery).toBe(1);
    expect(s().streakCount).toBe(1);
  });

  it("gives no XP on a wrong answer but records the miss", () => {
    s().answer("hira-a", false);
    expect(s().xp).toBe(0);
    expect(s().kana["hira-a"]?.lastResult).toBe("wrong");
  });

  it("completes a lesson once, granting XP + gems idempotently", () => {
    expect(s().completeLesson("hira-vowels-learn").alreadyDone).toBe(false);
    expect(s().completedLessons).toContain("hira-vowels-learn");
    expect(s().gems).toBe(5);
    expect(s().xp).toBe(20);

    expect(s().completeLesson("hira-vowels-learn").alreadyDone).toBe(true);
    expect(s().completedLessons).toHaveLength(1);
    expect(s().gems).toBe(5);
  });

  it("starts the daily streak on first activity", () => {
    expect(s().streakCount).toBe(0);
    s().addXp(5);
    expect(s().streakCount).toBe(1);
    expect(s().todayXp).toBe(5);
  });
});
