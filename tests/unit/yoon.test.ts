import { describe, expect, it } from "vitest";
import { ALL_KANA, getKana, getLesson, getUnit, trackKana } from "@/data/curriculum";
import { SOKUON_WORDS } from "@/data/sokuon";

describe("yōon (combination kana)", () => {
  it("generates 33 yōon per track with correct composition", () => {
    for (const track of ["hiragana", "katakana"] as const) {
      const yoon = trackKana(track).filter((k) => k.row === "yoon");
      expect(yoon).toHaveLength(33);
      // every yōon reads as a 2/3-letter cluster ending in a/u/o and its char is
      // two code points (base + small y-kana)
      for (const k of yoon) {
        expect(k.romaji).toMatch(/^[a-z]+[auo]$/);
        expect([...k.char]).toHaveLength(2);
        expect(k.vowel).toMatch(/^[auo]$/);
      }
    }
  });

  it("uses Hepburn readings (sha/cha/ja, not sya/tya/zya)", () => {
    expect(getKana("hira-kya")).toMatchObject({ char: "きゃ", romaji: "kya" });
    expect(getKana("hira-sha")).toMatchObject({ char: "しゃ", romaji: "sha" });
    expect(getKana("hira-cha")).toMatchObject({ char: "ちゃ", romaji: "cha" });
    expect(getKana("hira-ja")).toMatchObject({ char: "じゃ", romaji: "ja" });
    expect(getKana("hira-ryo")).toMatchObject({ char: "りょ", romaji: "ryo" });
    expect(getKana("kata-kyo")).toMatchObject({ char: "キョ", romaji: "kyo" });
    expect(getKana("kata-ja")).toMatchObject({ char: "ジャ", romaji: "ja" });
  });

  it("excludes the archaic ぢゃ row (teaches じゃ instead)", () => {
    // no yōon should read from ぢ / ヂ
    expect(getKana("hira-dya")).toBeUndefined();
    const chars = ALL_KANA.filter((k) => k.row === "yoon").map((k) => k.char);
    expect(chars.some((c) => c.startsWith("ぢ") || c.startsWith("ヂ"))).toBe(false);
  });
});

describe("ヴ (vu)", () => {
  it("exists in katakana only, as its own extended unit", () => {
    expect(getKana("kata-vu")).toMatchObject({ char: "ヴ", romaji: "vu", row: "v" });
    expect(getKana("hira-vu")).toBeUndefined();
    expect(trackKana("hiragana").some((k) => k.row === "v")).toBe(false);
    expect(getUnit("kata-v")?.kanaIds).toEqual(["kata-vu"]);
  });
});

describe("extended combination katakana", () => {
  it("adds 22 extended combos, katakana only, with clean ids", () => {
    const ext = trackKana("katakana").filter((k) => k.row === "ext");
    expect(ext).toHaveLength(22);
    expect(trackKana("hiragana").some((k) => k.row === "ext")).toBe(false);
    expect(new Set(ext.map((k) => k.id)).size).toBe(22);
  });

  it("keeps homophone ids distinct from existing kana", () => {
    // these readings collide with basic kana, so the extended kana use other ids
    expect(getKana("kata-uwo")).toMatchObject({ char: "ウォ", romaji: "wo" }); // vs ヲ (kata-wo)
    expect(getKana("kata-dhi")).toMatchObject({ char: "ディ", romaji: "di" }); // vs ヂ (kata-di)
    expect(getKana("kata-dwu")).toMatchObject({ char: "ドゥ", romaji: "du" }); // vs ヅ (kata-du)
    expect(getKana("kata-wo")?.char).toBe("ヲ"); // unchanged
    expect(getKana("kata-di")?.char).toBe("ヂ");
  });

  it("spells the loanword sounds the book teaches", () => {
    expect(getKana("kata-fa")).toMatchObject({ char: "ファ", romaji: "fa" });
    expect(getKana("kata-va")).toMatchObject({ char: "ヴァ", romaji: "va" });
    expect(getKana("kata-tsa")).toMatchObject({ char: "ツァ", romaji: "tsa" });
    expect(getKana("kata-she")).toMatchObject({ char: "シェ", romaji: "she" });
    expect(getKana("kata-che")).toMatchObject({ char: "チェ", romaji: "che" });
  });

  it("teaches the long-vowel ー as a katakana concept lesson", () => {
    const lesson = getLesson("kata-chouon-learn");
    expect(lesson?.kind).toBe("chouon");
    expect(lesson?.newKanaIds).toEqual([]);
  });
});

describe("small っ sokuon lesson", () => {
  it("is a hiragana concept lesson with no kana, using the book's words", () => {
    const lesson = getLesson("hira-sokuon-learn");
    expect(lesson?.kind).toBe("sokuon");
    expect(lesson?.newKanaIds).toEqual([]);
    // the book's example words double a consonant
    expect(SOKUON_WORDS.length).toBeGreaterThanOrEqual(3);
    for (const w of SOKUON_WORDS) {
      expect(w.kana).toContain("っ");
      expect(w.romaji).toMatch(/(.)\1/); // has a doubled letter
    }
  });
});
