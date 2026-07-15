import { trackKana } from "@/data/curriculum";
import type { Kana, KanaProgress, Track } from "@/types";

/**
 * The kana in a track the learner has actually met (seen at least once). Games
 * draw their rounds from this — never the full 46 — so a beginner is only ever
 * quizzed on characters they've been taught, and answering them can't corrupt
 * mastery for kana they've never seen.
 */
export function learnedKana(track: Track, progress: Record<string, KanaProgress>): Kana[] {
  return trackKana(track).filter((k) => (progress[k.id]?.seen ?? 0) > 0);
}
