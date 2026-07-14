import type { ExampleWord } from "@/types";

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
