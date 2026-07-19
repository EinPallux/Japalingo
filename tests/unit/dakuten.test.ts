import { describe, expect, it } from "vitest";
import { ALL_KANA, getKana, getTrackUnits, trackKana } from "@/data/curriculum";
import type { KanaRow } from "@/types";

const DAKUTEN_ROWS: KanaRow[] = ["g", "z", "d", "b", "p"];

describe("dakuten / han-dakuten data", () => {
  it("adds exactly 25 variation kana per track (5 rows × 5)", () => {
    for (const track of ["hiragana", "katakana"] as const) {
      const dak = trackKana(track).filter((k) => DAKUTEN_ROWS.includes(k.row));
      expect(dak).toHaveLength(25);
      for (const row of DAKUTEN_ROWS) {
        expect(dak.filter((k) => k.row === row)).toHaveLength(5);
      }
    }
  });

  it("gives every kana a unique id", () => {
    const ids = ALL_KANA.map((k) => k.id);
    expect(new Set(ids).size).toBe(ids.length);
  });

  it("maps the voiced rows to the correct characters and readings", () => {
    // K→G, S→Z, T→D, H→B, H→P
    expect(getKana("hira-ga")).toMatchObject({ char: "が", romaji: "ga", row: "g", vowel: "a" });
    expect(getKana("hira-za")).toMatchObject({ char: "ざ", romaji: "za", row: "z" });
    expect(getKana("hira-da")).toMatchObject({ char: "だ", romaji: "da", row: "d" });
    expect(getKana("hira-ba")).toMatchObject({ char: "ば", romaji: "ba", row: "b" });
    expect(getKana("hira-pa")).toMatchObject({ char: "ぱ", romaji: "pa", row: "p" });
    expect(getKana("kata-ga")).toMatchObject({ char: "ガ", romaji: "ga", row: "g" });
    expect(getKana("kata-po")).toMatchObject({ char: "ポ", romaji: "po", row: "p" });
  });

  it("handles the ji/di and zu/du homophone pairs per the book", () => {
    // し→じ is ji (not zi); ち→ぢ is ji but typed di; つ→づ is zu but typed du
    expect(getKana("hira-ji")).toMatchObject({ char: "じ", romaji: "ji" });
    expect(getKana("hira-di")).toMatchObject({ char: "ぢ", romaji: "ji", altRomaji: ["di"] });
    expect(getKana("hira-du")).toMatchObject({ char: "づ", romaji: "zu", altRomaji: ["du"] });
    expect(getKana("kata-di")).toMatchObject({ char: "ヂ", romaji: "ji", altRomaji: ["di"] });
  });

  it("teaches variation rows only after all ten basic rows, on the path", () => {
    const units = getTrackUnits("hiragana");
    const ids = units.map((u) => u.id);
    // basic W row unit comes before every dakuten unit
    const wIdx = ids.indexOf("hira-w");
    for (const row of DAKUTEN_ROWS) {
      expect(ids.indexOf(`hira-${row}`)).toBeGreaterThan(wIdx);
    }
    expect(units).toHaveLength(15);
  });
});
