import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { selectStreak, selectTodayXp, useProgress } from "@/stores/progress";

const s = () => useProgress.getState();

beforeEach(() => s().reset());
afterEach(() => vi.useRealTimers());

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

  it("stops counting yesterday's XP toward today's goal (read-time reset)", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    s().addXp(10);
    expect(selectTodayXp(s())).toBe(10);

    vi.setSystemTime(new Date(2026, 0, 2, 12, 0, 0)); // next local day, no activity yet
    expect(selectTodayXp(s())).toBe(0);
    expect(s().todayXp).toBe(10); // raw value only rolls over on the next write
  });

  it("keeps the streak lit through yesterday and breaks it after a skipped day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    s().addXp(10);
    expect(selectStreak(s())).toBe(1);

    // A whole day later with no activity yet: the flame is still lit (grace day).
    vi.setSystemTime(new Date(2026, 0, 2, 12, 0, 0));
    expect(selectStreak(s())).toBe(1);

    // Practicing today extends it to 2.
    s().addXp(10);
    expect(s().streakCount).toBe(2);
    expect(selectStreak(s())).toBe(2);

    // Skip several days: the streak reads as broken.
    vi.setSystemTime(new Date(2026, 0, 6, 12, 0, 0));
    expect(selectStreak(s())).toBe(0);
  });

  it("uses local calendar days, not UTC, for the day boundary", () => {
    vi.useFakeTimers();
    // 2026-03-02 00:30 local — still 2026-03-01 in UTC for negative offsets, but
    // the store must treat it as its own local day regardless of timezone.
    vi.setSystemTime(new Date(2026, 2, 2, 0, 30, 0));
    s().addXp(10);
    expect(selectTodayXp(s())).toBe(10);
    expect(s().todayDate).toBe("2026-03-02");
  });
});
