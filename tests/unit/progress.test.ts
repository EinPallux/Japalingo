import { afterEach, beforeEach, describe, expect, it, vi } from "vitest";
import { selectDaily, selectStreak, selectTodayXp, useProgress } from "@/stores/progress";
import { COIN_PER_CORRECT, getShopItem } from "@/lib/shop";

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

  it("counts correct answers toward the daily quest metric", () => {
    s().answer("hira-a", true);
    s().answer("hira-i", true);
    s().answer("hira-u", false);
    expect(selectDaily(s()).correct).toBe(2);
  });

  it("claims a quest reward once (idempotent) and resets claims on a new day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    s().addXp(30);
    const before = s().gems;

    s().claimQuest("goal", 15, "goal", 30);
    expect(s().gems).toBe(before + 15);
    expect(selectDaily(s()).claimed).toContain("goal");

    s().claimQuest("goal", 15, "goal", 30); // already claimed today — no double reward
    expect(s().gems).toBe(before + 15);

    // Next day: claims (and the daily correct/XP counters) reset.
    vi.setSystemTime(new Date(2026, 0, 2, 12, 0, 0));
    expect(selectDaily(s()).claimed).toEqual([]);
    expect(selectDaily(s()).correct).toBe(0);
    expect(selectDaily(s()).xp).toBe(0);
  });

  it("refuses to claim a quest that isn't actually complete", () => {
    s().addXp(10); // only 10 XP toward a 30-XP goal quest
    const before = s().gems;
    s().claimQuest("goal", 15, "goal", 30);
    expect(s().gems).toBe(before); // not done — no reward, not marked claimed
    expect(selectDaily(s()).claimed).not.toContain("goal");
  });

  it("counts only graded answers toward accuracy, not passive views", () => {
    s().answer("hira-a", true);
    s().answer("hira-a", false);
    s().markSeen("hira-a"); // a passive 'met it' view — must not count as an attempt
    const p = s().kana["hira-a"]!;
    expect(p.attempts).toBe(2);
    expect(p.correct).toBe(1);
    expect(p.seen).toBe(3);
  });

  it("rewards Word Builder solves with XP, coins, and daily-correct", () => {
    s().rewardCorrect();
    expect(s().xp).toBe(10);
    expect(s().coins).toBe(COIN_PER_CORRECT);
    expect(selectDaily(s()).correct).toBe(1);
  });

  it("ratchets bestStreak up and never lets it fall after a break", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    s().addXp(10);
    vi.setSystemTime(new Date(2026, 0, 2, 12, 0, 0));
    s().addXp(10); // streak 2
    expect(s().bestStreak).toBe(2);

    // Skip days, then practice again — streak restarts at 1 but best holds at 2.
    vi.setSystemTime(new Date(2026, 0, 10, 12, 0, 0));
    s().addXp(10);
    expect(s().streakCount).toBe(1);
    expect(s().bestStreak).toBe(2);
  });
});

describe("shop economy", () => {
  it("earns coins on correct answers only", () => {
    s().answer("hira-a", true);
    s().answer("hira-i", false);
    expect(s().coins).toBe(COIN_PER_CORRECT);
  });

  it("buys a cosmetic (spending the currency), then denies re-buy and unaffordable buys", () => {
    useProgress.setState({ coins: 200 });
    const price = getShopItem("hat-leaf")!.price;
    expect(s().buyItem("hat-leaf").ok).toBe(true);
    expect(s().coins).toBe(200 - price);
    expect(s().ownedCosmetics).toContain("hat-leaf");

    expect(s().buyItem("hat-leaf")).toEqual({ ok: false, reason: "owned" });

    useProgress.setState({ coins: 0 });
    expect(s().buyItem("hat-party").reason).toBe("funds");
  });

  it("equips and unequips a cosmetic, and refuses unowned ones", () => {
    useProgress.setState({ coins: 500 });
    s().buyItem("hat-leaf");
    s().equip("hat-leaf");
    expect(s().equipped.hat).toBe("hat-leaf");
    s().equip("hat-leaf"); // toggle off
    expect(s().equipped.hat).toBeNull();

    s().equip("hat-crown"); // never bought
    expect(s().equipped.hat).toBeNull();
  });

  it("caps streak freezes and auto-consumes one to bridge a single missed day", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 10, 12, 0, 0));
    useProgress.setState({ gems: 100 });
    expect(s().buyItem("streak-freeze").ok).toBe(true);
    expect(s().streakFreezes).toBe(1);

    s().addXp(10); // streak starts on day 10
    expect(s().streakCount).toBe(1);

    // Skip day 11 entirely; practice on day 12 — the freeze bridges the gap.
    vi.setSystemTime(new Date(2026, 0, 12, 12, 0, 0));
    s().addXp(10);
    expect(s().streakCount).toBe(2);
    expect(s().streakFreezes).toBe(0);
  });

  it("doubles XP while an XP boost is active, then reverts when it expires", () => {
    vi.useFakeTimers();
    vi.setSystemTime(new Date(2026, 0, 1, 12, 0, 0));
    useProgress.setState({ gems: 100 });
    s().buyItem("xp-boost"); // 15 minutes of 2×
    s().addXp(10);
    expect(s().xp).toBe(20);

    vi.setSystemTime(new Date(2026, 0, 1, 12, 20, 0)); // boost expired
    s().addXp(10);
    expect(s().xp).toBe(30);
  });
});
