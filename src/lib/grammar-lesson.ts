import type { GrammarChapter, GrammarPoint } from "@/types";
import { ALL_GRAMMAR_EXAMPLES, chapterExamples, readingChunks, type TaggedExample } from "./grammar";

/**
 * Grammar exercises are kana-first — the Japanese side is always the kana
 * reading, so a learner who can't yet read every kanji is never blocked:
 *  • teach     — a teaching card for one grammar point
 *  • translate — read the Japanese sentence, pick the English meaning
 *  • reverse   — read the English, pick the Japanese sentence (kana)
 *  • build     — read the English, assemble the sentence from phrase tiles
 */
export type GrammarExercise =
  | { kind: "teach"; point: GrammarPoint }
  | { kind: "translate"; item: TaggedExample; options: string[] }
  | { kind: "reverse"; item: TaggedExample; options: string[] }
  | { kind: "build"; item: TaggedExample; tiles: string[]; answer: string[] };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** `n` distractor strings unlike the answer, drawn from the example pool. */
function distractors(answer: string, field: "en" | "kana", pool: TaggedExample[], n = 3): string[] {
  const seen = new Set<string>([answer]);
  const out: string[] = [];
  for (const t of [...shuffle(pool), ...shuffle(ALL_GRAMMAR_EXAMPLES)]) {
    const v = t.ex[field];
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
      if (out.length === n) break;
    }
  }
  return out;
}

function makeChoice(
  kind: "translate" | "reverse",
  item: TaggedExample,
  pool: TaggedExample[],
): GrammarExercise {
  const field = kind === "translate" ? "en" : "kana";
  const answer = item.ex[field];
  const options = shuffle([answer, ...distractors(answer, field, pool)]);
  return { kind, item, options };
}

function makeBuild(item: TaggedExample): GrammarExercise | null {
  const answer = readingChunks(item.ex.kana);
  if (answer.length < 2) return null; // single-phrase sentences aren't worth building
  // shuffle the tiles; reshuffle once if it lands already-solved
  let tiles = shuffle(answer);
  if (tiles.join(" ") === answer.join(" ")) tiles = shuffle(answer);
  return { kind: "build", item, tiles, answer };
}

/**
 * Build a chapter lesson: teach every point, then a shuffled practice set that
 * drills the chapter's own sentences three ways (translate / reverse / build).
 * A pure-table point with no examples still gets its teaching card.
 */
export function buildGrammarQueue(chapter: GrammarChapter): GrammarExercise[] {
  const intro: GrammarExercise[] = chapter.points.map((point) => ({ kind: "teach", point }));
  const pool = chapterExamples(chapter);

  const practice: GrammarExercise[] = [];
  for (const item of pool) {
    practice.push(makeChoice("translate", item, pool));
    const build = makeBuild(item);
    // a second angle per sentence: build it if we can, else recall it in reverse
    practice.push(build ?? makeChoice("reverse", item, pool));
  }

  return [...intro, ...shuffle(practice)];
}

/** A pure-review queue over a set of already-seen sentences (no teaching). */
export function buildGrammarReviewQueue(items: TaggedExample[]): GrammarExercise[] {
  const queue: GrammarExercise[] = [];
  for (const item of items) {
    queue.push(makeChoice("translate", item, items));
    const build = makeBuild(item);
    queue.push(build ?? makeChoice("reverse", item, items));
  }
  return shuffle(queue);
}
