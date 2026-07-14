import { ALL_KANA, getKanaList, lessonKana } from "@/data/curriculum";
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

/** Pick `n` distinct distractor strings (romaji or char) unlike the answer. */
function distractors(answer: string, dir: "k2r" | "r2k", pool: Kana[], n = 3): string[] {
  const value = (k: Kana) => (dir === "k2r" ? k.romaji : k.char);
  const candidates = shuffle([...pool, ...ALL_KANA]);
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
  const options = shuffle([answer, ...distractors(answer, direction, pool)]);
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
  for (const kana of newKana) {
    practice.push(makeChoice(kana, "r2k", pool));
    practice.push({ kind: "drill", kana });
  }

  return [...intro, ...shuffle(practice)];
}
