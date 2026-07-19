/**
 * Concept lessons — writing rules that aren't kana with their own reading:
 * the small っ (sokuon, doubles the next consonant) and the long-vowel ー
 * (chōonpu, stretches the preceding vowel). Example words are transcribed from
 * `database/*` (hiragana book p.67; katakana book p.66).
 */
import { SOKUON_WORDS } from "./sokuon";

export interface ConceptWord {
  kana: string;
  romaji: string;
  note: string;
}

export interface ConceptDef {
  markChar: string;
  eyebrow: string;
  title: string;
  /** Intro prose lines shown on the concept card. */
  paragraphs: string[];
  words: ConceptWord[];
  doneTitle: string;
  doneNote: string;
}

export const CONCEPTS: Record<"sokuon" | "chouon", ConceptDef> = {
  sokuon: {
    markChar: "っ",
    eyebrow: "New idea",
    title: "The small っ",
    paragraphs: [
      "A little half-size っ (a mini つ) has no sound of its own. It marks a quick pause and doubles the next consonant.",
      "So いっか is read “ikka” — the k is doubled. (Katakana’s ッ works exactly the same way.)",
    ],
    words: SOKUON_WORDS,
    doneTitle: "Small っ mastered! 🎉",
    doneNote: "Now you can spot the little pause and double it.",
  },
  chouon: {
    markChar: "ー",
    eyebrow: "New idea",
    title: "The long vowel ー",
    paragraphs: [
      "Katakana stretches a vowel with a dash: ー. Just hold the vowel right before it a beat longer.",
      "チーズ is “chiizu” (cheese) — with the dash. Without it, チズ is “chizu” and means “map”!",
    ],
    words: [{ kana: "チーズ", romaji: "chiizu", note: "the ー stretches the “i” — it means cheese" }],
    doneTitle: "Long vowel ー mastered! 🎉",
    doneNote: "Spot the dash and hold that vowel a little longer.",
  },
};
