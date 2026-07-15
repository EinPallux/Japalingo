import { describe, expect, it } from "vitest";
import { dailyQuests, questView } from "@/lib/quests";

describe("daily quests", () => {
  it("offers three quests including a daily-goal quest scaled to the user's goal", () => {
    const qs = dailyQuests(100, 30);
    expect(qs).toHaveLength(3);
    const goal = qs.find((q) => q.id === "goal");
    expect(goal?.metric).toBe("goal");
    expect(goal?.target).toBe(30);
  });

  it("is stable within a day but rotates the quest set across days", () => {
    const a = dailyQuests(100, 30)
      .map((q) => q.id)
      .join();
    const again = dailyQuests(100, 30)
      .map((q) => q.id)
      .join();
    expect(a).toBe(again);

    const nextDay = dailyQuests(101, 30)
      .map((q) => q.id)
      .join();
    expect(nextDay).not.toBe(a);
  });

  it("marks a quest done at the target and claimed when its id is in the list", () => {
    const goal = dailyQuests(0, 30)[0]!;
    expect(questView(goal, { xp: 10, correct: 0 }, []).done).toBe(false);

    const hit = questView(goal, { xp: 30, correct: 0 }, []);
    expect(hit.done).toBe(true);
    expect(hit.claimed).toBe(false);

    expect(questView(goal, { xp: 30, correct: 0 }, ["goal"]).claimed).toBe(true);
  });

  it("tracks correct-answer quests against the correct metric, not XP", () => {
    const correctQuest = dailyQuests(0, 30).find((q) => q.metric === "correct")!;
    const view = questView(correctQuest, { xp: 999, correct: 0 }, []);
    expect(view.value).toBe(0);
    expect(view.done).toBe(false);
  });
});
