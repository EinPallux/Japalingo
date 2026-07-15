/**
 * Free-drill helpers — group a track's kana into gojūon rows and summarise how
 * well the learner knows each, so the Drill screen can guide practice toward
 * weak rows (MARU-style) without touching the learning path.
 */
import { trackKana } from "@/data/curriculum";
import type { Kana, KanaProgress, KanaRow, Track } from "@/types";

const ROW_ORDER: KanaRow[] = ["a", "k", "s", "t", "n", "h", "m", "y", "r", "w"];

const ROW_TITLE: Record<KanaRow, string> = {
  a: "Vowels",
  k: "K row",
  s: "S row",
  t: "T row",
  n: "N row",
  h: "H row",
  m: "M row",
  y: "Y row",
  r: "R row",
  w: "W row",
};

/** Cap a single drill session so a big selection stays focused. */
export const DRILL_SESSION_SIZE = 12;

export interface RowInfo {
  row: KanaRow;
  title: string;
  kana: Kana[];
  sample: string;
  /** Mean mastery (0–5) across the row's kana. */
  avgMastery: number;
  seen: number;
  mastered: number;
}

function mastery(progress: Record<string, KanaProgress>, id: string): number {
  return progress[id]?.mastery ?? 0;
}

/** The track's kana grouped into rows, each with a mastery summary. */
export function trackRows(track: Track, progress: Record<string, KanaProgress>): RowInfo[] {
  const kana = trackKana(track);
  return ROW_ORDER.map((row) => {
    const rowKana = kana.filter((k) => k.row === row);
    const total = rowKana.reduce((sum, k) => sum + mastery(progress, k.id), 0);
    return {
      row,
      title: ROW_TITLE[row],
      kana: rowKana,
      sample: rowKana[0]?.char ?? "",
      avgMastery: rowKana.length ? total / rowKana.length : 0,
      seen: rowKana.filter((k) => (progress[k.id]?.seen ?? 0) > 0).length,
      mastered: rowKana.filter((k) => mastery(progress, k.id) >= 5).length,
    };
  });
}

/** All kana belonging to the chosen rows, in gojūon order. */
export function kanaForRows(track: Track, rows: KanaRow[]): Kana[] {
  const wanted = new Set(rows);
  return trackKana(track).filter((k) => wanted.has(k.row));
}

/** The `n` rows most in need of practice (lowest average mastery). */
export function weakestRows(rows: RowInfo[], n = 3): KanaRow[] {
  return [...rows]
    .sort((a, b) => a.avgMastery - b.avgMastery || ROW_ORDER.indexOf(a.row) - ROW_ORDER.indexOf(b.row))
    .slice(0, n)
    .map((r) => r.row);
}

/**
 * Pick the session's kana from a selection: weakest first, capped, so a large
 * pick becomes a focused drill on what the learner needs most.
 */
export function drillSession(
  kana: Kana[],
  progress: Record<string, KanaProgress>,
  size = DRILL_SESSION_SIZE,
): Kana[] {
  return [...kana]
    .sort((a, b) => mastery(progress, a.id) - mastery(progress, b.id))
    .slice(0, size);
}
