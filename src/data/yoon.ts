import type { Kana, Track } from "@/types";

/**
 * Combination kana (yōon), generated from the composition rule the Tofugu books
 * teach: an I-row kana + a small ゃ/ゅ/ょ, with the base's trailing "i" dropped in
 * romaji (き + ゃ → きゃ = kya). The 11 modern clusters (the archaic ぢゃ is
 * excluded, as everywhere teaches じゃ instead). Same rule for both scripts.
 *
 * Source: `database/tofugu-learn-hiragana-book.pdf` p.66 / katakana book p.65.
 */

// [base I-row char, base reading, romaji cluster] per track.
const CLUSTERS: { hira: [string, string]; kata: [string, string]; cluster: string }[] = [
  { hira: ["き", "ki"], kata: ["キ", "ki"], cluster: "ky" },
  { hira: ["し", "shi"], kata: ["シ", "shi"], cluster: "sh" },
  { hira: ["ち", "chi"], kata: ["チ", "chi"], cluster: "ch" },
  { hira: ["に", "ni"], kata: ["ニ", "ni"], cluster: "ny" },
  { hira: ["ひ", "hi"], kata: ["ヒ", "hi"], cluster: "hy" },
  { hira: ["み", "mi"], kata: ["ミ", "mi"], cluster: "my" },
  { hira: ["り", "ri"], kata: ["リ", "ri"], cluster: "ry" },
  { hira: ["ぎ", "gi"], kata: ["ギ", "gi"], cluster: "gy" },
  { hira: ["じ", "ji"], kata: ["ジ", "ji"], cluster: "j" },
  { hira: ["び", "bi"], kata: ["ビ", "bi"], cluster: "by" },
  { hira: ["ぴ", "pi"], kata: ["ピ", "pi"], cluster: "py" },
];

const SMALL: Record<Track, { a: string; u: string; o: string }> = {
  hiragana: { a: "ゃ", u: "ゅ", o: "ょ" },
  katakana: { a: "ャ", u: "ュ", o: "ョ" },
};
const Y_KANA: Record<"a" | "u" | "o", string> = { a: "ya", u: "yu", o: "yo" };
const COLUMNS: ("a" | "u" | "o")[] = ["a", "u", "o"];

/** Romaji for a cluster + vowel: sh/ch/j drop the trailing y (sha, cha, ja). */
function yoonRomaji(cluster: string, vowel: "a" | "u" | "o"): string {
  return cluster + vowel;
}

/** All 33 yōon for a track, in gojūon-ish order. */
export function buildYoon(track: Track, prefix: string): Kana[] {
  const small = SMALL[track];
  const out: Kana[] = [];
  for (const c of CLUSTERS) {
    const [baseChar, baseRomaji] = track === "hiragana" ? c.hira : c.kata;
    for (const vowel of COLUMNS) {
      const smallChar = small[vowel];
      const romaji = yoonRomaji(c.cluster, vowel);
      out.push({
        id: `${prefix}-${romaji}`,
        char: baseChar + smallChar,
        romaji,
        track,
        row: "yoon",
        vowel,
        pronunciation: `“${romaji}” — ${baseChar} + small ${smallChar}, said as one quick syllable.`,
        mnemonic: `${baseChar} (${baseRomaji}) + small ${smallChar} (${Y_KANA[vowel]}) → ${baseChar}${smallChar} (${romaji}). Drop the “i”: ${baseRomaji} + ${Y_KANA[vowel]} = ${romaji}.`,
      });
    }
  }
  return out;
}
