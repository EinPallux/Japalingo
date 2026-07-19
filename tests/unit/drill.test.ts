import { describe, expect, it } from "vitest";
import { drillSession, kanaForRows, trackRows, weakestRows } from "@/lib/drill";
import { emptyProgress } from "@/lib/srs";
import type { KanaProgress } from "@/types";

describe("free drill", () => {
  it("groups a track into its rows, covering every kana with no empty rows", () => {
    const hira = trackRows("hiragana", {});
    // basics(10) + dakuten(5) + yoon(1) = 16; hiragana has no ヴ row.
    expect(hira).toHaveLength(16);
    expect(hira.reduce((n, r) => n + r.kana.length, 0)).toBe(104);
    expect(hira[0]!.title).toBe("Vowels");
    expect(hira.map((r) => r.row)).toContain("yoon");
    expect(hira.map((r) => r.row)).not.toContain("v"); // ヴ is katakana-only

    const kata = trackRows("katakana", {});
    expect(kata.reduce((n, r) => n + r.kana.length, 0)).toBe(127);
    expect(kata.map((r) => r.row)).toContain("v"); // ヴ row present here
    expect(kata.map((r) => r.row)).toContain("ext"); // extended combos row
    // no row is ever empty for the track it's shown in
    expect(kata.every((r) => r.kana.length > 0)).toBe(true);
  });

  it("selects kana for the chosen rows only", () => {
    const vowels = kanaForRows("hiragana", ["a"]);
    expect(vowels.map((k) => k.romaji).sort()).toEqual(["a", "e", "i", "o", "u"]);

    const two = kanaForRows("katakana", ["a", "k"]);
    expect(two).toHaveLength(10);
    expect(two.every((k) => k.track === "katakana")).toBe(true);
  });

  it("summarises row mastery", () => {
    const progress: Record<string, KanaProgress> = {
      "hira-a": { ...emptyProgress(), mastery: 5, seen: 3 },
      "hira-i": { ...emptyProgress(), mastery: 5, seen: 3 },
    };
    const rows = trackRows("hiragana", progress);
    const vowels = rows.find((r) => r.row === "a")!;
    expect(vowels.seen).toBe(2);
    expect(vowels.avgMastery).toBeCloseTo(2); // two of five kana at mastery 5
  });

  it("recommends the weakest STARTED rows, never untouched ones", () => {
    const progress: Record<string, KanaProgress> = {
      // vowels: seen and strong
      "hira-a": { ...emptyProgress(), mastery: 5, seen: 3 },
      "hira-i": { ...emptyProgress(), mastery: 5, seen: 3 },
      // k row: seen but shaky — this is the real "weakest"
      "hira-ka": { ...emptyProgress(), mastery: 1, seen: 2 },
      "hira-ki": { ...emptyProgress(), mastery: 0, seen: 2 },
    };
    const weakest = weakestRows(trackRows("hiragana", progress), 3);
    expect(weakest[0]).toBe("k"); // started-but-shaky leads
    expect(weakest).not.toContain("s"); // never-seen rows aren't "weak", just untaught
  });

  it("falls back to all rows before anything has been started", () => {
    expect(weakestRows(trackRows("hiragana", {}), 3)).toHaveLength(3);
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
