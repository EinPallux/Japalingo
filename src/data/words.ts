import type { ExampleWord } from "@/types";
import { ALL_KANA } from "./curriculum";

/**
 * Real Japanese words for Word Builder, all sourced from the reading pages of
 * `database/tofugu-learn-hiragana-book.pdf`. Every word is spelled in basic
 * hiragana the learner meets on the path — the "you can already read Japanese!"
 * moment. Do not add words that aren't attested in /database.
 */
export const WORDS: ExampleWord[] = [
  { kana: "あお", romaji: "ao", meaning: "blue" },
  { kana: "いえ", romaji: "ie", meaning: "house" },
  { kana: "うえ", romaji: "ue", meaning: "up / above" },
  { kana: "おう", romaji: "ou", meaning: "king" },
  { kana: "か", romaji: "ka", meaning: "mosquito" },
  { kana: "き", romaji: "ki", meaning: "tree" },
  { kana: "かき", romaji: "kaki", meaning: "persimmon" },
  { kana: "くうき", romaji: "kuuki", meaning: "air" },
  { kana: "け", romaji: "ke", meaning: "hair" },
  { kana: "こえ", romaji: "koe", meaning: "voice" },
];

/**
 * The full Word Builder pool: the seed words above plus every example word the
 * kana datasets carry from BOTH books' reading-practice pages (hiragana and
 * katakana, ~100 words total) — deduped by spelling. All /database-attested.
 */
export const BUILDER_WORDS: ExampleWord[] = (() => {
  const seen = new Set<string>();
  const out: ExampleWord[] = [];
  for (const w of [...WORDS, ...ALL_KANA.flatMap((k) => k.examples ?? [])]) {
    if (seen.has(w.kana)) continue;
    seen.add(w.kana);
    out.push(w);
  }
  return out;
})();
