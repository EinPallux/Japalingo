import { getKanaList, lessonKana, trackKana } from "@/data/curriculum";
import type { Kana, Lesson } from "@/types";

export type Exercise =
  | { kind: "mnemonic"; kana: Kana }
  | { kind: "choice"; kana: Kana; direction: "k2r" | "r2k"; options: string[] }
  | { kind: "drill"; kana: Kana };

function shuffle<T>(arr: T[]): T[] {
  const a = [...arr];
  for (let i = a.length - 1; i > 0; i--) {
    const j = Math.floor(Math.random() * (i + 1));
    [a[i], a[j]] = [a[j]!, a[i]!];
  }
  return a;
}

/** True if two kana read the same (homophones must never both be options). */
function sameReading(a: Kana, b: Kana): boolean {
  return (
    a.romaji === b.romaji ||
    Boolean(a.altRomaji?.includes(b.romaji)) ||
    Boolean(b.altRomaji?.includes(a.romaji))
  );
}

/**
 * Pick `n` distinct distractor strings (romaji or char) unlike the answer.
 * Distractors are drawn only from the answer's OWN track — never the other
 * script — and never share a reading with the answer, so a katakana card never
 * appears among hiragana options and two options can't both be "correct". The
 * lesson's own pool is preferred, falling back to the rest of the track.
 */
function distractors(kana: Kana, dir: "k2r" | "r2k", pool: Kana[], n = 3): string[] {
  const value = (k: Kana) => (dir === "k2r" ? k.romaji : k.char);
  const answer = value(kana);
  const candidates = [...shuffle(pool), ...shuffle(trackKana(kana.track))].filter(
    (k) => k.track === kana.track && !sameReading(k, kana),
  );
  const seen = new Set<string>([answer]);
  const out: string[] = [];
  for (const k of candidates) {
    const v = value(k);
    if (!seen.has(v)) {
      seen.add(v);
      out.push(v);
      if (out.length === n) break;
    }
  }
  return out;
}

function makeChoice(kana: Kana, direction: "k2r" | "r2k", pool: Kana[]): Exercise {
  const answer = direction === "k2r" ? kana.romaji : kana.char;
  const options = shuffle([answer, ...distractors(kana, direction, pool)]);
  return { kind: "choice", kana, direction, options };
}

/**
 * Build a lesson's exercise pipeline: teach each new kana with a Mnemonic Story,
 * then a shuffled mix of multiple-choice (both directions) and drill exercises
 * over the lesson's new + review kana.
 */
export function buildQueue(lesson: Lesson): Exercise[] {
  const pool = lessonKana(lesson);
  const newKana = getKanaList(lesson.newKanaIds);

  const intro: Exercise[] = newKana.map((kana) => ({ kind: "mnemonic", kana }));

  const practice: Exercise[] = [];
  for (const kana of pool) practice.push(makeChoice(kana, "k2r", pool));
  if (newKana.length > 0) {
    // A teaching lesson deepens its new kana with reverse recall + a self-drill.
    for (const kana of newKana) {
      practice.push(makeChoice(kana, "r2k", pool));
      practice.push({ kind: "drill", kana });
    }
  } else {
    // A pure-review lesson has no new kana, so add reverse recall + a few drills
    // over its pool — otherwise it degrades to one-way matching. Cap the extra
    // steps so a big final review (whole script) stays a digestible length: the
    // k2r pass already covers every kana for recognition.
    for (const kana of pool.slice(0, 12)) practice.push(makeChoice(kana, "r2k", pool));
    for (const kana of pool.slice(0, Math.min(4, pool.length))) {
      practice.push({ kind: "drill", kana });
    }
  }

  return [...intro, ...shuffle(practice)];
}

/** Build a pure-review queue (no teaching step) over a set of already-seen kana. */
export function buildReviewQueue(kana: Kana[]): Exercise[] {
  const queue: Exercise[] = [];
  for (const k of kana) {
    queue.push(makeChoice(k, "k2r", kana));
    queue.push(makeChoice(k, "r2k", kana));
  }
  for (const k of kana.slice(0, Math.min(4, kana.length))) {
    queue.push({ kind: "drill", kana: k });
  }
  return shuffle(queue);
}
