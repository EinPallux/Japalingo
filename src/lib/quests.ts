/**
 * Daily quests — a lightweight motivation loop over EXISTING activity (today's
 * XP, correct answers, daily goal). No new learning content: quests never
 * reference kana facts, so this stays within the /database governance rule.
 *
 * Each day offers three quests, chosen deterministically from the day number so
 * the set is stable across reloads but rotates day to day.
 */

export type QuestMetric = "xp" | "correct" | "goal";

export interface Quest {
  id: string;
  label: string;
  emoji: string;
  metric: QuestMetric;
  target: number; // for "goal", target is the user's daily-goal XP
  reward: number; // gems granted on claim
}

export interface QuestView extends Quest {
  value: number;
  done: boolean;
  claimed: boolean;
}

export interface DailyMetrics {
  xp: number;
  correct: number;
}

const CORRECT_QUESTS: Quest[] = [
  { id: "correct-10", label: "Nail 10 correct answers", emoji: "💯", metric: "correct", target: 10, reward: 10 },
  { id: "correct-20", label: "Nail 20 correct answers", emoji: "💯", metric: "correct", target: 20, reward: 15 },
  { id: "correct-30", label: "Nail 30 correct answers", emoji: "💯", metric: "correct", target: 30, reward: 20 },
];

const XP_QUESTS: Quest[] = [
  { id: "xp-50", label: "Earn 50 XP", emoji: "⚡", metric: "xp", target: 50, reward: 10 },
  { id: "xp-80", label: "Earn 80 XP", emoji: "⚡", metric: "xp", target: 80, reward: 15 },
  { id: "xp-120", label: "Earn 120 XP", emoji: "⚡", metric: "xp", target: 120, reward: 20 },
];

function rotate<T>(list: T[], dayNum: number): T {
  const i = ((dayNum % list.length) + list.length) % list.length;
  return list[i]!;
}

/** The three quests for a given (local) day number and the user's daily goal. */
export function dailyQuests(dayNum: number, goalXp: number): Quest[] {
  const goalQuest: Quest = {
    id: "goal",
    label: "Reach your daily goal",
    emoji: "🎯",
    metric: "goal",
    target: goalXp,
    reward: 15,
  };
  return [goalQuest, rotate(CORRECT_QUESTS, dayNum), rotate(XP_QUESTS, dayNum)];
}

export function questValue(q: Quest, m: DailyMetrics): number {
  return q.metric === "correct" ? m.correct : m.xp; // "xp" and "goal" both track today's XP
}

export function questView(q: Quest, m: DailyMetrics, claimed: string[]): QuestView {
  const value = questValue(q, m);
  return { ...q, value, done: value >= q.target, claimed: claimed.includes(q.id) };
}
