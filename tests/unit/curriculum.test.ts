import { describe, expect, it } from "vitest";
import {
  ALL_KANA,
  getKana,
  getTrackLessons,
  lessonKana,
  trackKana,
} from "@/data/curriculum";

describe("curriculum data integrity", () => {
  it("has the full kana set — basics, dakuten, yōon + katakana extensions", () => {
    // hiragana: 46 basic + 25 dakuten + 33 yōon = 104.
    expect(trackKana("hiragana")).toHaveLength(104);
    // katakana adds ヴ (1) + 22 extended combos = 127.
    expect(trackKana("katakana")).toHaveLength(127);
    expect(ALL_KANA).toHaveLength(231);
  });

  it("has a lesson path for each track starting at the vowels", () => {
    const hira = getTrackLessons("hiragana");
    const kata = getTrackLessons("katakana");
    expect(hira.length).toBeGreaterThan(10);
    expect(hira[0]?.id).toBe("hira-vowels-learn");
    expect(kata[0]?.id).toBe("kata-vowels-learn");
  });

  it("resolves every kana id referenced by every lesson", () => {
    for (const track of ["hiragana", "katakana"] as const) {
      for (const lesson of getTrackLessons(track)) {
        for (const id of [...lesson.newKanaIds, ...lesson.reviewKanaIds]) {
          expect(getKana(id), `missing kana ${id} in ${lesson.id}`).toBeDefined();
        }
        // learn lessons introduce kana; reviews reinforce them. Concept lessons
        // (sokuon っ, chouon ー) teach a writing rule, so have no kana.
        if (lesson.kind === "lesson") expect(lesson.newKanaIds.length).toBeGreaterThan(0);
        if (lesson.kind === "lesson" || lesson.kind === "review") {
          expect(lessonKana(lesson).length).toBeGreaterThan(0);
        }
      }
    }
  });

  it("gives every kana a non-empty romaji and mnemonic", () => {
    for (const k of ALL_KANA) {
      expect(k.romaji.length).toBeGreaterThan(0);
      expect(k.mnemonic.length).toBeGreaterThan(0);
    }
  });

  it("carries the books' practice-reading words on both tracks", async () => {
    const { HIRAGANA } = await import("@/data/hiragana");
    const { KATAKANA } = await import("@/data/katakana");
    // every basic gojūon ROW has at least one example word attached
    const rows = ["a", "k", "s", "t", "n", "h", "m", "y", "r", "w"];
    for (const row of rows) {
      expect(
        HIRAGANA.some((k) => k.row === row && k.examples?.length),
        `hiragana ${row}-row has no practice words`,
      ).toBe(true);
      expect(
        KATAKANA.some((k) => k.row === row && k.examples?.length),
        `katakana ${row}-row has no practice words`,
      ).toBe(true);
    }
    // and the combined Word Builder pool is a real pool now, not 10 words
    const { BUILDER_WORDS } = await import("@/data/words");
    expect(BUILDER_WORDS.length).toBeGreaterThanOrEqual(90);
    expect(new Set(BUILDER_WORDS.map((w) => w.kana)).size).toBe(BUILDER_WORDS.length);
  });
});
