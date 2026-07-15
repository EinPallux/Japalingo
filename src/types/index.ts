export type Track = "hiragana" | "katakana";
export type Vowel = "a" | "i" | "u" | "e" | "o" | null;
export type KanaRow = "a" | "k" | "s" | "t" | "n" | "h" | "m" | "y" | "r" | "w";

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
  kind: "lesson" | "review";
}

/** Per-kana mastery state for the local user (SRS-lite Leitner box 0–5). */
export interface KanaProgress {
  mastery: number; // 0..5 crowns
  seen: number;
  correct: number;
  streak: number; // consecutive correct
  lastResult: "correct" | "wrong" | null;
  /** Epoch ms when this kana is next due for review (set once seen). */
  due?: number;
}
