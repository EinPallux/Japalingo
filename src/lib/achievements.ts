import { ALL_KANA } from "@/data/curriculum";
import type { KanaProgress, Track } from "@/types";

const RANKS = [
  { name: "Kana Sprout", min: 0 },
  { name: "Apprentice", min: 100 },
  { name: "Reader", min: 300 },
  { name: "Scholar", min: 700 },
  { name: "Kana Master", min: 1500 },
] as const;

export function rankFor(xp: number): { name: string; min: number; next: number | null } {
  let current: { name: string; min: number } = RANKS[0];
  for (const r of RANKS) if (xp >= r.min) current = r;
  const idx = RANKS.findIndex((r) => r.name === current.name);
  return { name: current.name, min: current.min, next: RANKS[idx + 1]?.min ?? null };
}

export interface Badge {
  id: string;
  name: string;
  desc: string;
  emoji: string;
  earned: boolean;
}

export interface ProgressSnapshot {
  xp: number;
  streakCount: number;
  completedLessons: string[];
  kana: Record<string, KanaProgress>;
}

export function trackSeen(kana: Record<string, KanaProgress>, track: Track): number {
  return ALL_KANA.filter((k) => k.track === track && (kana[k.id]?.seen ?? 0) > 0).length;
}
export function totalSeen(kana: Record<string, KanaProgress>): number {
  return ALL_KANA.filter((k) => (kana[k.id]?.seen ?? 0) > 0).length;
}
export function totalMastered(kana: Record<string, KanaProgress>): number {
  return ALL_KANA.filter((k) => (kana[k.id]?.mastery ?? 0) >= 5).length;
}

export function badgesFor(s: ProgressSnapshot): Badge[] {
  return [
    { id: "first", name: "First Steps", desc: "Finish your first lesson", emoji: "👣", earned: s.completedLessons.length >= 1 },
    { id: "onfire", name: "On Fire", desc: "Reach a 3-day streak", emoji: "🔥", earned: s.streakCount >= 3 },
    { id: "week", name: "Week Warrior", desc: "Reach a 7-day streak", emoji: "📅", earned: s.streakCount >= 7 },
    { id: "rising", name: "Rising Star", desc: "Earn 500 XP", emoji: "⭐", earned: s.xp >= 500 },
    { id: "hira", name: "Hiragana Hero", desc: "Meet all 46 hiragana", emoji: "あ", earned: trackSeen(s.kana, "hiragana") >= 46 },
    { id: "kata", name: "Katakana Champ", desc: "Meet all 46 katakana", emoji: "ア", earned: trackSeen(s.kana, "katakana") >= 46 },
    { id: "master", name: "Kana Master", desc: "Fully master 25 kana", emoji: "👑", earned: totalMastered(s.kana) >= 25 },
  ];
}
