import { VOCAB } from "@/data/vocab";
import type { VocabWord } from "@/types";

/**
 * Vocab exercises are all kana-first — the word is always its `reading`, never
 * its kanji, so a learner who can't read kanji is never blocked:
 *  • learn  — a teaching card (kana, meaning, kanji shown only as reference)
 *  • m2w    — meaning → pick the kana word
 *  • w2m    — kana word → pick the meaning
 *  • listen — hear the word → pick the meaning
 */
export type VocabExercise =
  | { kind: "learn"; word: VocabWord }
  | { kind: "m2w"; word: VocabWord; options: string[] }
  | { kind: "w2m"; word: VocabWord; options: string[] }
  | { kind: "listen"; word: VocabWord; options: string[] };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/**
 * All spoken/written variants of a word's reading, normalized: a handful of
 * entries list variants ("はし/おはし") or optional particles ("あと(で)").
 * Comparing variant SETS (not raw strings) is what keeps はし (bridge) from
 * offering はし/おはし (chopsticks) as a distractor — same kana, both correct.
 */
function readingVariants(w: VocabWord): string[] {
  return w.reading
    .split("/")
    .map((v) => v.replace(/[（(][^)）]*[)）]/g, "").replace(/[。？！…\s]/g, "").trim())
    .filter(Boolean);
}

/** Distinct enough to be a fair distractor: no shared reading variant, different gloss. */
function distinct(a: VocabWord, b: VocabWord): boolean {
  if (a.meaning === b.meaning) return false;
  const bVariants = new Set(readingVariants(b));
  return !readingVariants(a).some((v) => bVariants.has(v));
}

/**
 * `n` distractor strings unlike the answer. `field` selects reading or meaning.
 * Candidates come from the deck pool first, then the whole vocabulary, and never
 * duplicate the answer's value or each other — so two options can't both be right.
 */
function distractors(
  word: VocabWord,
  field: "reading" | "meaning",
  pool: VocabWord[],
  n = 3,
): string[] {
  const answer = word[field];
  const candidates = [...shuffle(pool), ...shuffle(VOCAB)].filter((w) => distinct(w, word));
  const seen = new Set<string>([answer]);
  const out: string[] = [];
  for (const w of candidates) {
    const v = w[field];
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
      if (out.length === n) break;
    }
  }
  return out;
}

function makeRecall(
  word: VocabWord,
  kind: "m2w" | "w2m" | "listen",
  pool: VocabWord[],
): VocabExercise {
  // m2w answers with the reading; w2m/listen answer with the meaning.
  const field = kind === "m2w" ? "reading" : "meaning";
  const answer = word[field];
  const options = shuffle([answer, ...distractors(word, field, pool, 3)]);
  return { kind, word, options };
}

/**
 * A deck lesson: teach every word, then drill each one in both directions, with
 * a listening step mixed in for a subset. The practice half is shuffled so the
 * order feels fresh; the teach cards stay up front.
 */
export function buildVocabQueue(words: VocabWord[]): VocabExercise[] {
  const intro: VocabExercise[] = words.map((word) => ({ kind: "learn", word }));

  const listenIds = new Set(shuffle(words).slice(0, Math.ceil(words.length / 3)).map((w) => w.id));
  const practice: VocabExercise[] = [];
  for (const word of words) {
    // one direction becomes a listening exercise for the chosen subset
    practice.push(makeRecall(word, listenIds.has(word.id) ? "listen" : "w2m", words));
    practice.push(makeRecall(word, "m2w", words));
  }

  return [...intro, ...shuffle(practice)];
}

/** A pure-review queue over already-seen words (no teaching step). */
export function buildVocabReviewQueue(words: VocabWord[]): VocabExercise[] {
  const queue: VocabExercise[] = [];
  for (const word of words) {
    queue.push(makeRecall(word, "w2m", words));
    queue.push(makeRecall(word, "m2w", words));
  }
  for (const word of shuffle(words).slice(0, Math.min(4, words.length))) {
    queue.push(makeRecall(word, "listen", words));
  }
  return shuffle(queue);
}
