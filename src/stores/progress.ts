import { create } from "zustand";
import { createJSONStorage, persist } from "zustand/middleware";
import type { KanaProgress, Track } from "@/types";
import {
  applyAnswer,
  applyRating,
  emptyProgress,
  type Grade,
  nextDue,
  XP_LESSON_COMPLETE,
  XP_PER_CORRECT,
} from "@/lib/srs";
import { COIN_PER_CORRECT, getShopItem, MAX_STREAK_FREEZES, XP_BOOST_MS } from "@/lib/shop";
import type { QuestMetric } from "@/lib/quests";

/** Local-time day key (YYYY-MM-DD). Using local components — not toISOString's
 *  UTC — so streaks and the daily goal roll over at the user's own midnight. */
function dateKey(d: Date): string {
  const pad = (n: number) => String(n).padStart(2, "0");
  return `${d.getFullYear()}-${pad(d.getMonth() + 1)}-${pad(d.getDate())}`;
}
function today(): string {
  return dateKey(new Date());
}
/** N *calendar* days ago. Uses Date's day-field rollover (not fixed 24h math),
 *  so a 23/25-hour DST day can never make "yesterday" resolve two days back
 *  and silently break an active streak. */
function daysAgo(n: number): string {
  const d = new Date();
  return dateKey(new Date(d.getFullYear(), d.getMonth(), d.getDate() - n));
}
function yesterday(): string {
  return daysAgo(1);
}
/** Two days ago — the last active day when exactly one day was missed. */
function dayBefore(): string {
  return daysAgo(2);
}

export interface ProgressState {
  onboardingComplete: boolean;
  name: string;
  reason: string | null;
  dailyGoalXp: number;
  xp: number;
  gems: number;
  /** Plentiful currency, earned per correct answer. */
  coins: number;
  streakCount: number;
  /** Highest streak ever reached — badges read this so they never un-earn. */
  bestStreak: number;
  streakDate: string | null;
  todayXp: number;
  todayDate: string | null;
  /** Correct answers today (drives daily quests). Rolls over with `todayDate`. */
  dailyCorrect: number;
  /** Quest ids already claimed today. Rolls over with `todayDate`. */
  claimedQuests: string[];
  /** Streak Freezes in the bank — auto-spent to bridge a single missed day. */
  streakFreezes: number;
  /** Cosmetic item ids the player owns. */
  ownedCosmetics: string[];
  /** Currently worn cosmetic per slot. */
  equipped: { hat: string | null; face: string | null; neck: string | null };
  /** Epoch ms until which XP is doubled (0 = no active boost). */
  xpBoostUntil: number;
  /** Preferences. */
  sfxEnabled: boolean;
  speechRate: number;
  kana: Record<string, KanaProgress>;
  completedLessons: string[];
  /** Unit ids that earned a gold crown by beating their Speed Review. */
  crownedUnits: string[];
  /** Personal-best scores per game, keyed `${gameId}:${track}`. */
  bestScores: Record<string, number>;
  activeTrack: Track;

  completeOnboarding(data: { name: string; reason: string | null; dailyGoalXp: number }): void;
  setActiveTrack(track: Track): void;
  setDailyGoal(xp: number): void;
  setSfxEnabled(on: boolean): void;
  setSpeechRate(rate: number): void;
  addXp(n: number): void;
  answer(kanaId: string, correct: boolean): void;
  rate(kanaId: string, grade: Grade): void;
  markSeen(kanaId: string): void;
  /** Word Builder solve: XP + coins + daily-correct, no per-kana SRS change. */
  rewardCorrect(): void;
  completeLesson(lessonId: string): { alreadyDone: boolean };
  /** Crown a unit gold after a won Speed Review (idempotent; grants gems once). */
  crownUnit(unitId: string): { alreadyCrowned: boolean };
  /** Record a game score; returns the best so far and whether it beat it. */
  recordScore(key: string, score: number): { best: number; isRecord: boolean };
  claimQuest(id: string, reward: number, metric: QuestMetric, target: number): void;
  /** Attempt a purchase; returns why it failed so the UI can explain. */
  buyItem(id: string): { ok: boolean; reason?: "unknown" | "owned" | "max" | "active" | "funds" };
  /** Toggle a cosmetic on/off in its slot (must be owned). */
  equip(id: string): void;
  progressFor(kanaId: string): KanaProgress;
  reset(): void;
}

const initial = {
  onboardingComplete: false,
  name: "",
  reason: null as string | null,
  dailyGoalXp: 30,
  xp: 0,
  gems: 0,
  coins: 0,
  streakCount: 0,
  bestStreak: 0,
  streakDate: null as string | null,
  todayXp: 0,
  todayDate: null as string | null,
  dailyCorrect: 0,
  claimedQuests: [] as string[],
  streakFreezes: 0,
  ownedCosmetics: [] as string[],
  equipped: { hat: null, face: null, neck: null } as {
    hat: string | null;
    face: string | null;
    neck: string | null;
  },
  xpBoostUntil: 0,
  sfxEnabled: true,
  speechRate: 0.9,
  kana: {} as Record<string, KanaProgress>,
  completedLessons: [] as string[],
  crownedUnits: [] as string[],
  bestScores: {} as Record<string, number>,
  activeTrack: "hiragana" as Track,
};

/** Gems awarded the first time a unit's Speed Review is beaten. */
export const GEM_CROWN_REWARD = 10;

type DailyOpts = { xp?: number; correct?: number; coins?: number };

/**
 * Roll the day-scoped counters over to `today` (zeroing them on a new day),
 * then apply this activity's XP + correct-answer + coin deltas and advance the
 * streak. Centralising the lazy rollover keeps `todayXp`, `dailyCorrect`, the
 * streak, `claimedQuests`, coins, and the XP-boost multiplier consistent no
 * matter which action fires first. A missed single day is auto-bridged by a
 * Streak Freeze when one is banked.
 */
function applyDaily(s: ProgressState, opts: DailyOpts): Partial<ProgressState> {
  const t = today();
  const sameDay = s.todayDate === t;
  const boosted = s.xpBoostUntil > Date.now();
  const addXp = (opts.xp ?? 0) * (boosted ? 2 : 1);

  let streakCount = s.streakCount;
  let streakDate = s.streakDate;
  let streakFreezes = s.streakFreezes;
  if (addXp > 0 && s.streakDate !== t) {
    if (s.streakDate === yesterday()) {
      streakCount = s.streakCount + 1;
    } else if (s.streakDate === dayBefore() && s.streakFreezes > 0) {
      streakCount = s.streakCount + 1; // one missed day, bridged by a freeze
      streakFreezes = s.streakFreezes - 1;
    } else {
      streakCount = 1;
    }
    streakDate = t;
  }

  return {
    xp: s.xp + addXp,
    coins: s.coins + (opts.coins ?? 0),
    todayDate: t,
    todayXp: (sameDay ? s.todayXp : 0) + addXp,
    dailyCorrect: (sameDay ? s.dailyCorrect : 0) + (opts.correct ?? 0),
    claimedQuests: sameDay ? s.claimedQuests : [],
    streakCount,
    // Ratchet the all-time best up (seeding from the current streak for saves
    // that predate the field), so streak badges stay earned after a break.
    bestStreak: Math.max(s.bestStreak ?? s.streakCount, streakCount),
    streakDate,
    streakFreezes,
  };
}

export const useProgress = create<ProgressState>()(
  persist(
    (set, get) => ({
      ...initial,

      completeOnboarding: ({ name, reason, dailyGoalXp }) =>
        set({ onboardingComplete: true, name, reason, dailyGoalXp }),

      setActiveTrack: (activeTrack) => set({ activeTrack }),

      setDailyGoal: (dailyGoalXp) => set({ dailyGoalXp }),
      setSfxEnabled: (sfxEnabled) => set({ sfxEnabled }),
      setSpeechRate: (speechRate) => set({ speechRate }),

      addXp: (n) => set((s) => applyDaily(s, { xp: n })),

      answer: (kanaId, correct) =>
        set((s) => {
          const cur = s.kana[kanaId] ?? emptyProgress();
          const next = applyAnswer(cur, correct);
          return {
            kana: { ...s.kana, [kanaId]: { ...next, due: nextDue(next.mastery, Date.now()) } },
            ...applyDaily(s, correct ? { xp: XP_PER_CORRECT, correct: 1, coins: COIN_PER_CORRECT } : {}),
          };
        }),

      rate: (kanaId, grade) =>
        set((s) => {
          const cur = s.kana[kanaId] ?? emptyProgress();
          const next = applyRating(cur, grade);
          return {
            kana: { ...s.kana, [kanaId]: { ...next, due: nextDue(next.mastery, Date.now()) } },
            ...applyDaily(s, grade !== "again" ? { xp: XP_PER_CORRECT, correct: 1, coins: COIN_PER_CORRECT } : {}),
          };
        }),

      markSeen: (kanaId) =>
        set((s) => {
          const cur = s.kana[kanaId] ?? emptyProgress();
          return {
            kana: {
              ...s.kana,
              [kanaId]: { ...cur, seen: cur.seen + 1, due: nextDue(cur.mastery, Date.now()) },
            },
            ...applyDaily(s, { xp: 2 }),
          };
        }),

      rewardCorrect: () =>
        set((s) => applyDaily(s, { xp: XP_PER_CORRECT, correct: 1, coins: COIN_PER_CORRECT })),

      completeLesson: (lessonId) => {
        const alreadyDone = get().completedLessons.includes(lessonId);
        if (!alreadyDone) {
          set((s) => ({
            completedLessons: [...s.completedLessons, lessonId],
            gems: s.gems + 5,
            ...applyDaily(s, { xp: XP_LESSON_COMPLETE }),
          }));
        }
        return { alreadyDone };
      },

      crownUnit: (unitId) => {
        const alreadyCrowned = get().crownedUnits.includes(unitId);
        if (!alreadyCrowned) {
          set((s) => ({
            crownedUnits: [...s.crownedUnits, unitId],
            gems: s.gems + GEM_CROWN_REWARD,
          }));
        }
        return { alreadyCrowned };
      },

      recordScore: (key, score) => {
        const prev = get().bestScores[key] ?? 0;
        const isRecord = score > prev;
        if (isRecord) set((s) => ({ bestScores: { ...s.bestScores, [key]: score } }));
        return { best: Math.max(prev, score), isRecord };
      },

      claimQuest: (id, reward, metric, target) =>
        set((s) => {
          const base = applyDaily(s, {});
          const claimed = base.claimedQuests ?? [];
          if (claimed.includes(id)) return {};
          // Re-verify completion against freshly-rolled metrics — never grant a
          // reward for a quest that isn't actually done (or is a new day's zero).
          const value = metric === "correct" ? (base.dailyCorrect ?? 0) : (base.todayXp ?? 0);
          if (value < target) return {};
          return { ...base, gems: s.gems + reward, claimedQuests: [...claimed, id] };
        }),

      buyItem: (id) => {
        const item = getShopItem(id);
        if (!item) return { ok: false, reason: "unknown" as const };
        const s = get();
        if (item.kind === "cosmetic" && s.ownedCosmetics.includes(id))
          return { ok: false, reason: "owned" as const };
        if (item.kind === "streakFreeze" && s.streakFreezes >= MAX_STREAK_FREEZES)
          return { ok: false, reason: "max" as const };
        if (item.kind === "xpBoost" && s.xpBoostUntil > Date.now())
          return { ok: false, reason: "active" as const };
        const balance = item.currency === "coins" ? s.coins : s.gems;
        if (balance < item.price) return { ok: false, reason: "funds" as const };

        set((st) => {
          const spend =
            item.currency === "coins" ? { coins: st.coins - item.price } : { gems: st.gems - item.price };
          if (item.kind === "cosmetic")
            return { ...spend, ownedCosmetics: [...st.ownedCosmetics, id] };
          if (item.kind === "streakFreeze")
            return { ...spend, streakFreezes: st.streakFreezes + 1 };
          return { ...spend, xpBoostUntil: Date.now() + XP_BOOST_MS };
        });
        return { ok: true };
      },

      equip: (id) =>
        set((s) => {
          const item = getShopItem(id);
          if (!item || item.kind !== "cosmetic" || !item.slot || !s.ownedCosmetics.includes(id))
            return {};
          const worn = s.equipped[item.slot] === id;
          return { equipped: { ...s.equipped, [item.slot]: worn ? null : id } };
        }),

      progressFor: (kanaId) => get().kana[kanaId] ?? emptyProgress(),

      reset: () => set({ ...initial }),
    }),
    {
      name: "japalingo-progress",
      version: 1,
      storage: createJSONStorage(() => localStorage),
    },
  ),
);

/**
 * `todayXp`/`streakCount` are only rolled over when XP is written. These
 * selectors derive the *current* values at read time so the UI never shows a
 * stale daily ring (yesterday's XP counting toward today) or a lingering streak
 * flame after a missed day — the flame stays lit while the last active day is
 * today or yesterday, and reads as broken (0) once a day is skipped.
 */
export function selectTodayXp(s: ProgressState): number {
  return s.todayDate === today() ? s.todayXp : 0;
}
export function selectStreak(s: ProgressState): number {
  if (!s.streakDate) return 0;
  if (s.streakDate === today() || s.streakDate === yesterday()) return s.streakCount;
  // One missed day is survivable while a Streak Freeze is banked — show the
  // flame as still alive (it'll be spent the moment the learner returns).
  if (s.streakDate === dayBefore() && s.streakFreezes > 0) return s.streakCount;
  return 0;
}

/** The current local day key — for comparing against the stored `todayDate`. */
export function todayKey(): string {
  return today();
}

/** Today's quest metrics, derived at read time (zeroed once the day rolls). */
export function selectDaily(s: ProgressState): { xp: number; correct: number; claimed: string[] } {
  const active = s.todayDate === today();
  return {
    xp: active ? s.todayXp : 0,
    correct: active ? s.dailyCorrect : 0,
    claimed: active ? s.claimedQuests : [],
  };
}

/** Stable day number (local) — rotates the daily quest set deterministically.
 *  Math.round (not floor) so the ±1h DST offset of local midnight vs UTC can't
 *  skip or repeat a number. */
export function dayNumber(): number {
  const d = new Date();
  return Math.round(new Date(d.getFullYear(), d.getMonth(), d.getDate()).getTime() / 86_400_000);
}

/**
 * Minutes left on the XP boost given the stored deadline. Pass `s.xpBoostUntil`
 * (a stable value) plus the current time computed in render — never wrap this in
 * a zustand hook selector, or the Date.now()-derived result would change every
 * render and thrash `useSyncExternalStore`.
 */
export function boostMinutesLeft(xpBoostUntil: number, nowMs: number): number {
  return Math.max(0, Math.ceil((xpBoostUntil - nowMs) / 60_000));
}
