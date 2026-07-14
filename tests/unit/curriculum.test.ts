import { describe, expect, it } from "vitest";
import {
  ALL_KANA,
  getKana,
  getTrackLessons,
  lessonKana,
  trackKana,
} from "@/data/curriculum";

describe("curriculum data integrity", () => {
  it("has 46 basic kana per track (92 total)", () => {
    expect(trackKana("hiragana")).toHaveLength(46);
    expect(trackKana("katakana")).toHaveLength(46);
    expect(ALL_KANA).toHaveLength(92);
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
        // learn lessons introduce kana; reviews reinforce them
        if (lesson.kind === "lesson") expect(lesson.newKanaIds.length).toBeGreaterThan(0);
        expect(lessonKana(lesson).length).toBeGreaterThan(0);
      }
    }
  });

  it("gives every kana a non-empty romaji and mnemonic", () => {
    for (const k of ALL_KANA) {
      expect(k.romaji.length).toBeGreaterThan(0);
      expect(k.mnemonic.length).toBeGreaterThan(0);
    }
  });
});
