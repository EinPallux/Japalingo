import { tablesForChapter } from "@/data/grammar-tables";
import type { GrammarChapter, GrammarPoint, GrammarTable } from "@/types";
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
  | { kind: "table"; table: GrammarTable }
  | { kind: "translate"; item: TaggedExample; options: string[] }
  | { kind: "reverse"; item: TaggedExample; options: string[] }
  | { kind: "build"; item: TaggedExample; tiles: string[]; answer: string[] }
  /** The chapter's closing reflection: its common-mistake warning + Mini Check. */
  | { kind: "wrapup"; chapter: GrammarChapter };

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
  // Shuffle the tiles, retrying while the deal lands already-solved (a 2-chunk
  // sentence is pre-solved 50% of the time on a single shuffle). Only a sentence
  // whose chunks are all identical can survive the retries — accept that.
  let tiles = shuffle(answer);
  for (let i = 0; i < 6 && tiles.join(" ") === answer.join(" "); i++) tiles = shuffle(answer);
  return { kind: "build", item, tiles, answer };
}

/**
 * Build a chapter lesson: teach every point, then a shuffled practice set that
 * drills the chapter's own sentences three ways (translate / reverse / build).
 * A pure-table point with no examples still gets its teaching card.
 */
export function buildGrammarQueue(chapter: GrammarChapter): GrammarExercise[] {
  const intro: GrammarExercise[] = chapter.points.map((point) => ({ kind: "teach", point }));
  // conjugation reference cards (verb / adjective / て-form chapters) sit right
  // after the teaching, before drilling begins
  const tables: GrammarExercise[] = tablesForChapter(chapter.id).map((table) => ({ kind: "table", table }));
  const pool = chapterExamples(chapter);

  const practice: GrammarExercise[] = [];
  for (const item of pool) {
    practice.push(makeChoice("translate", item, pool));
    const build = makeBuild(item);
    // a second angle per sentence: build it if we can, else recall it in reverse
    practice.push(build ?? makeChoice("reverse", item, pool));
  }

  // Close with the book's own reflection step — the "Common mistake" warning
  // and the chapter's three Mini Check self-test questions.
  const wrapup: GrammarExercise[] =
    chapter.commonMistake || chapter.miniCheck?.length ? [{ kind: "wrapup", chapter }] : [];

  return [...intro, ...tables, ...shuffle(practice), ...wrapup];
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
