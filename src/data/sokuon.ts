/**
 * Small っ (sokuon) reading-practice words, taken verbatim from the reading
 * examples on `database/tofugu-learn-hiragana-book.pdf` p.67. The small っ marks
 * a quick pause and doubles the following consonant in romaji.
 */
export interface SokuonWord {
  kana: string;
  romaji: string;
  /** Which consonant the small っ doubles. */
  note: string;
}

export const SOKUON_WORDS: SokuonWord[] = [
  { kana: "いっか", romaji: "ikka", note: "doubles the k" },
  { kana: "いった", romaji: "itta", note: "doubles the t" },
  { kana: "かっこ", romaji: "kakko", note: "doubles the k" },
  { kana: "りったい", romaji: "rittai", note: "doubles the t" },
];
