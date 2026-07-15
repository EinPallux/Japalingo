import { describe, expect, it } from "vitest";
import { drillSession, kanaForRows, trackRows, weakestRows } from "@/lib/drill";
import { emptyProgress } from "@/lib/srs";
import type { KanaProgress } from "@/types";

describe("free drill", () => {
  it("groups a track into 10 rows covering all 46 kana", () => {
    const rows = trackRows("hiragana", {});
    expect(rows).toHaveLength(10);
    expect(rows.reduce((n, r) => n + r.kana.length, 0)).toBe(46);
    expect(rows[0]!.title).toBe("Vowels");
    expect(rows[0]!.kana.every((k) => k.track === "hiragana")).toBe(true);
  });

  it("selects kana for the chosen rows only", () => {
    const vowels = kanaForRows("hiragana", ["a"]);
    expect(vowels.map((k) => k.romaji).sort()).toEqual(["a", "e", "i", "o", "u"]);

    const two = kanaForRows("katakana", ["a", "k"]);
    expect(two).toHaveLength(10);
    expect(two.every((k) => k.track === "katakana")).toBe(true);
  });

  it("summarises row mastery and surfaces the weakest rows", () => {
    const progress: Record<string, KanaProgress> = {
      "hira-a": { ...emptyProgress(), mastery: 5, seen: 3 },
      "hira-i": { ...emptyProgress(), mastery: 5, seen: 3 },
    };
    const rows = trackRows("hiragana", progress);
    const vowels = rows.find((r) => r.row === "a")!;
    expect(vowels.seen).toBe(2);
    expect(vowels.avgMastery).toBeCloseTo(2); // two of five kana at mastery 5

    // the vowels row now has some mastery, so it shouldn't be among the weakest
    expect(weakestRows(rows, 3)).not.toContain("a");
  });

  it("prioritizes weakest kana and caps the session size", () => {
    const kana = kanaForRows("hiragana", ["a", "k", "s", "t"]); // 20 kana
    const progress: Record<string, KanaProgress> = {
      "hira-a": { ...emptyProgress(), mastery: 5 },
    };
    const session = drillSession(kana, progress, 12);
    expect(session).toHaveLength(12);
    expect(session.some((k) => k.id === "hira-a")).toBe(false); // mastered one dropped
  });
});
