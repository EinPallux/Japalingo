import type { Kana } from "@/types";

/**
 * Extended combination katakana, transcribed from
 * `database/learn-katakana-book-by-tofugu.pdf` p.65-66 ("COMBINATION KATAKANA").
 * These pair a U-row-ish base (ヴ/ウ/フ/ツ) or T-row base with a SMALL vowel
 * (ァ/ィ/ゥ/ェ/ォ) to spell sounds Japanese didn't traditionally have, so foreign
 * loanwords can be written. Readings use the standard transliteration (the sound
 * you read), with the book's pronunciation notes. Katakana-only.
 *
 * IDs avoid clashing with existing kana that share a reading: ウォ→kata-uwo
 * (ヲ is kata-wo), ディ→kata-dhi (ヂ is kata-di), ドゥ→kata-dwu (ヅ is kata-du).
 */
export const KATAKANA_EXT: Kana[] = [
  // ヴ + small vowel — v-sounds (pronounced more like b/bw, per the book).
  { id: "kata-va", char: "ヴァ", romaji: "va", track: "katakana", row: "ext", vowel: "a",
    pronunciation: "“va” (sounds more like “bwa”) — ヴ + small ァ. For foreign v-sounds.",
    mnemonic: "ヴ (vu) + small ァ → ヴァ (va). For v-words like ヴァイオリン (violin).",
    examples: [{ kana: "ヴァイオリン", romaji: "vaiorin", meaning: "violin" }] },
  { id: "kata-vi", char: "ヴィ", romaji: "vi", track: "katakana", row: "ext", vowel: "i",
    pronunciation: "“vi” (like “bwi”) — ヴ + small ィ.",
    mnemonic: "ヴ + small ィ → ヴィ (vi). As in ヴィジュアル (visual).",
    examples: [{ kana: "ヴィジュアル", romaji: "vijuaru", meaning: "visual" }] },
  { id: "kata-ve", char: "ヴェ", romaji: "ve", track: "katakana", row: "ext", vowel: "e",
    pronunciation: "“ve” (like “bwe”) — ヴ + small ェ.",
    mnemonic: "ヴ + small ェ → ヴェ (ve). For v-sounds." },
  { id: "kata-vo", char: "ヴォ", romaji: "vo", track: "katakana", row: "ext", vowel: "o",
    pronunciation: "“vo” (like “bwo”) — ヴ + small ォ.",
    mnemonic: "ヴ + small ォ → ヴォ (vo). For v-sounds." },

  // ウ + small vowel — w-sounds (the w-column only has ワ and ヲ, so these fill in).
  { id: "kata-wi", char: "ウィ", romaji: "wi", track: "katakana", row: "ext", vowel: "i",
    pronunciation: "“wi” — ウ + small ィ. A w-sound.",
    mnemonic: "ウ (u) + small ィ → ウィ (wi). As in ウィンドウ (window).",
    examples: [{ kana: "ウィンドウ", romaji: "windou", meaning: "window" }] },
  { id: "kata-we", char: "ウェ", romaji: "we", track: "katakana", row: "ext", vowel: "e",
    pronunciation: "“we” — ウ + small ェ.",
    mnemonic: "ウ + small ェ → ウェ (we). As in ウェンズデー (Wednesday).",
    examples: [{ kana: "ウェンズデー", romaji: "wenzudee", meaning: "Wednesday" }] },
  { id: "kata-uwo", char: "ウォ", romaji: "wo", track: "katakana", row: "ext", vowel: "o",
    pronunciation: "“wo” (a real w+o) — ウ + small ォ. Type ウ then small ォ (“xo”).",
    mnemonic: "ウ + small ォ → ウォ (wo). A true “w-o”, unlike the particle を." },

  // フ + small vowel — f-sounds.
  { id: "kata-fa", char: "ファ", romaji: "fa", track: "katakana", row: "ext", vowel: "a",
    pronunciation: "“fa” — フ + small ァ. For f-sounds.",
    mnemonic: "フ (fu) + small ァ → ファ (fa). As in ファン (fan).",
    examples: [{ kana: "ファン", romaji: "fan", meaning: "fan" }] },
  { id: "kata-fi", char: "フィ", romaji: "fi", track: "katakana", row: "ext", vowel: "i",
    pronunciation: "“fi” — フ + small ィ.",
    mnemonic: "フ + small ィ → フィ (fi). As in フィッシュ (fish).",
    examples: [{ kana: "フィッシュ", romaji: "fisshu", meaning: "fish" }] },
  { id: "kata-fe", char: "フェ", romaji: "fe", track: "katakana", row: "ext", vowel: "e",
    pronunciation: "“fe” — フ + small ェ.",
    mnemonic: "フ + small ェ → フェ (fe). For f-sounds." },
  { id: "kata-fo", char: "フォ", romaji: "fo", track: "katakana", row: "ext", vowel: "o",
    pronunciation: "“fo” — フ + small ォ.",
    mnemonic: "フ + small ォ → フォ (fo). For f-sounds." },

  // ツ + small vowel — ts/tz-sounds.
  { id: "kata-tsa", char: "ツァ", romaji: "tsa", track: "katakana", row: "ext", vowel: "a",
    pronunciation: "“tsa” — ツ + small ァ. A ts/tz-sound.",
    mnemonic: "ツ (tsu) + small ァ → ツァ (tsa). As in モッツァレラ (Mozzarella).",
    examples: [{ kana: "モッツァレラ", romaji: "mottsarera", meaning: "mozzarella" }] },
  { id: "kata-tsi", char: "ツィ", romaji: "tsi", track: "katakana", row: "ext", vowel: "i",
    pronunciation: "“tsi” — ツ + small ィ.",
    mnemonic: "ツ + small ィ → ツィ (tsi). A ts-sound." },
  { id: "kata-tse", char: "ツェ", romaji: "tse", track: "katakana", row: "ext", vowel: "e",
    pronunciation: "“tse” — ツ + small ェ.",
    mnemonic: "ツ + small ェ → ツェ (tse). A ts-sound." },
  { id: "kata-tso", char: "ツォ", romaji: "tso", track: "katakana", row: "ext", vowel: "o",
    pronunciation: "“tso” — ツ + small ォ.",
    mnemonic: "ツ + small ォ → ツォ (tso). A ts-sound." },

  // A few more scattered combos (book p.66).
  { id: "kata-ti", char: "ティ", romaji: "ti", track: "katakana", row: "ext", vowel: "i",
    pronunciation: "“ti” — テ + small ィ (type “thi”). Used in words like “party”.",
    mnemonic: "テ (te) + small ィ → ティ (ti). A hard “tee”, as in party." },
  { id: "kata-dhi", char: "ディ", romaji: "di", track: "katakana", row: "ext", vowel: "i",
    pronunciation: "“di” — デ + small ィ (type “dhi”). Used in words like “candy”.",
    mnemonic: "デ (de) + small ィ → ディ (di). A hard “dee”, as in candy." },
  { id: "kata-tu", char: "トゥ", romaji: "tu", track: "katakana", row: "ext", vowel: "u",
    pronunciation: "“tu” — ト + small ゥ (type “twu”). As in “two”.",
    mnemonic: "ト (to) + small ゥ → トゥ (tu). The “too” in two." },
  { id: "kata-dwu", char: "ドゥ", romaji: "du", track: "katakana", row: "ext", vowel: "u",
    pronunciation: "“du” — ド + small ゥ (type “dwu”). As in “do”.",
    mnemonic: "ド (do) + small ゥ → ドゥ (du). A “doo” sound." },
  { id: "kata-she", char: "シェ", romaji: "she", track: "katakana", row: "ext", vowel: "e",
    pronunciation: "“she” — シ + small ェ. As in “shell”.",
    mnemonic: "シ (shi) + small ェ → シェ (she). As in shell." },
  { id: "kata-je", char: "ジェ", romaji: "je", track: "katakana", row: "ext", vowel: "e",
    pronunciation: "“je” — ジ + small ェ. As in “jelly”.",
    mnemonic: "ジ (ji) + small ェ → ジェ (je). As in jelly." },
  { id: "kata-che", char: "チェ", romaji: "che", track: "katakana", row: "ext", vowel: "e",
    pronunciation: "“che” — チ + small ェ. As in “check”.",
    mnemonic: "チ (chi) + small ェ → チェ (che). As in check." },
];
