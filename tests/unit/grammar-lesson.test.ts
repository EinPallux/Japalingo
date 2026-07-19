import { describe, expect, it } from "vitest";
import { GRAMMAR_CHAPTERS } from "@/data/grammar";
import { chapterExamples } from "@/lib/grammar";
import { buildGrammarQueue, buildGrammarReviewQueue } from "@/lib/grammar-lesson";

const chapter = GRAMMAR_CHAPTERS[0]!; // Ch1

describe("grammar exercise queue", () => {
  it("teaches every point, then drills each sentence twice", () => {
    const q = buildGrammarQueue(chapter);
    const teach = q.filter((e) => e.kind === "teach");
    expect(teach).toHaveLength(chapter.points.length);
    // teaching cards lead
    const firstPractice = q.findIndex((e) => e.kind !== "teach");
    expect(q.slice(0, firstPractice).every((e) => e.kind === "teach")).toBe(true);
    // two practice exercises per example
    const exCount = chapterExamples(chapter).length;
    const practice = q.filter((e) => e.kind !== "teach");
    expect(practice).toHaveLength(exCount * 2);
  });

  it("offers four distinct options with the answer present, for choice exercises", () => {
    for (const ex of buildGrammarQueue(chapter)) {
      if (ex.kind !== "translate" && ex.kind !== "reverse") continue;
      expect(ex.options).toHaveLength(4);
      expect(new Set(ex.options).size).toBe(4);
      const answer = ex.kind === "translate" ? ex.item.ex.en : ex.item.ex.kana;
      expect(ex.options).toContain(answer);
    }
  });

  it("build exercises shuffle the exact answer chunks — no missing or extra tiles", () => {
    for (const ex of buildGrammarQueue(chapter)) {
      if (ex.kind !== "build") continue;
      expect([...ex.tiles].sort()).toEqual([...ex.answer].sort());
      expect(ex.answer.length).toBeGreaterThanOrEqual(2);
    }
  });

  it("review queues skip teaching and only quiz", () => {
    const items = chapterExamples(chapter);
    const q = buildGrammarReviewQueue(items);
    expect(q.every((e) => e.kind !== "teach")).toBe(true);
    expect(q.length).toBeGreaterThan(0);
  });
});
