export type Track = "hiragana" | "katakana";
export type Vowel = "a" | "i" | "u" | "e" | "o" | null;
/**
 * Gojūon consonant rows, the dakuten (g/z/d/b) and han-dakuten (p) rows, plus
 * "yoon" (combination kana like きゃ) and "v" (the katakana ヴ).
 */
export type KanaRow =
  | "a"
  | "k"
  | "s"
  | "t"
  | "n"
  | "h"
  | "m"
  | "y"
  | "r"
  | "w"
  | "g"
  | "z"
  | "d"
  | "b"
  | "p"
  | "yoon"
  | "v"
  | "ext";

export interface ExampleWord {
  kana: string;
  romaji: string;
  meaning: string;
}

/** One readable kana, transcribed from the Tofugu /database books. */
export interface Kana {
  id: string; // stable slug, e.g. "hira-a"
  char: string; // あ
  romaji: string; // "a" (primary Hepburn)
  altRomaji?: string[]; // ["si"] for し, etc.
  track: Track;
  row: KanaRow;
  vowel: Vowel; // null for ん
  pronunciation: string; // English anchor from "HOW TO PRONOUNCE"
  mnemonic: string; // the shape↔sound story from "HOW TO REMEMBER"
  examples?: ExampleWord[]; // real words from the reading pages
}

export type GameModeId = "mnemonic" | "choice" | "drill";

export interface Unit {
  id: string;
  track: Track;
  title: string;
  subtitle: string; // the kana it teaches, e.g. "あ い う え お"
  kanaIds: string[];
  order: number;
}

export interface Lesson {
  id: string;
  unitId: string;
  title: string;
  newKanaIds: string[];
  reviewKanaIds: string[];
  order: number;
  /** "sokuon"/"chouon" are self-contained concept lessons (small っ, long vowel ー). */
  kind: "lesson" | "review" | "sokuon" | "chouon";
}

/** Part of speech, where the source book tags one. */
export type VocabPos = "i-adj" | "na-adj" | "noun" | "adv";

/** An example sentence: Japanese + its English translation (when the book gives one). */
export interface VocabExample {
  jp: string;
  en?: string;
}

/**
 * One JLPT N5 vocabulary word, transcribed from `database/Vocabulary_of_JLPT_N5.pdf`.
 * Kana-FIRST: `reading` is the form learners are quizzed on; `kanji` is optional
 * reference and never required to answer.
 */
export interface VocabWord {
  id: string; // stable slug, e.g. "v-1"
  reading: string; // kana reading (the quizzed form), ～ marker stripped
  meaning: string; // English gloss
  display?: string; // original form with ～ / punctuation, when it differs from reading
  kanji?: string; // optional kanji form (reference only)
  pos?: VocabPos;
  example?: VocabExample;
  freq?: number; // times seen in the official N5 workbook (higher = more common)
  note?: string; // a short usage note from the book
  tags?: string[]; // "suffix" | "prefix" | "greeting"
}

/** One example sentence from the grammar book: script + kana reading + translation. */
export interface GrammarExample {
  jp: string; // Japanese in natural script (kanji + kana)
  kana: string; // full kana reading, space-separated into phrases
  en: string; // natural English translation
}

/** One grammar point within a chapter (a numbered teaching item). */
export interface GrammarPoint {
  id: string; // e.g. "g7-2"
  heading: string;
  explain: string; // the book's lead explanation (may be empty for pure tables)
  patterns: string[]; // formation boxes, e.g. "Noun + です → polite: is/are"
  examples: GrammarExample[];
}

/** A grammar chapter — the grammar path's progression node. */
export interface GrammarChapter {
  id: string; // e.g. "g7"
  num: number; // 1..24
  part: "I" | "II" | "III";
  title: string;
  subtitle: string;
  objectives: string[]; // "After this chapter, you can ..."
  points: GrammarPoint[];
  commonMistake?: string;
  miniCheck?: string[];
}

/** One of the book's 50 Core Patterns (Appendix C) — a compact review index. */
export interface GrammarPattern {
  n: number; // 1..50
  form: string; // e.g. "N は N です"
  meaning: string; // e.g. "A is B"
}

/** An ordered, gated batch of vocab words — the vocabulary path's progression node. */
export interface VocabDeck {
  id: string;
  title: string;
  subtitle: string; // a peek at the words inside
  emoji: string;
  section: string; // grouping header, e.g. "Greetings"
  wordIds: string[];
  order: number;
}

/** Per-kana mastery state for the local user (SRS-lite Leitner box 0–5). */
export interface KanaProgress {
  mastery: number; // 0..5 crowns
  seen: number;
  correct: number;
  /** Graded answers only (excludes passive "met it" views) — the accuracy base. */
  attempts?: number;
  streak: number; // consecutive correct
  lastResult: "correct" | "wrong" | null;
  /** Epoch ms when this kana is next due for review (set once seen). */
  due?: number;
}
