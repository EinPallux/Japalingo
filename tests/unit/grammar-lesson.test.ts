import { describe, expect, it } from "vitest";
import { GRAMMAR_CHAPTERS } from "@/data/grammar";
import { chapterExamples, getGrammarChapter } from "@/lib/grammar";
import { buildGrammarQueue, buildGrammarReviewQueue } from "@/lib/grammar-lesson";

const chapter = GRAMMAR_CHAPTERS[0]!; // Ch1 (no conjugation tables)

describe("grammar exercise queue", () => {
  it("teaches every point, then drills each sentence twice", () => {
    const q = buildGrammarQueue(chapter);
    const teach = q.filter((e) => e.kind === "teach");
    expect(teach).toHaveLength(chapter.points.length);
    // teaching cards lead
    const firstPractice = q.findIndex((e) => e.kind !== "teach");
    expect(q.slice(0, firstPractice).every((e) => e.kind === "teach")).toBe(true);
    // two practice exercises per example (+ the closing wrap-up step)
    const exCount = chapterExamples(chapter).length;
    const practice = q.filter((e) => e.kind !== "teach" && e.kind !== "wrapup");
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

  it("embeds each chapter table in its point's teach card (verb chapter)", async () => {
    const { tablesForPoint, tablesForChapter } = await import("@/data/grammar-tables");
    // the verb tables now live INSIDE their points, not as separate steps
    expect(tablesForPoint("g6-1").map((t) => t.id)).toContain("verb-groups");
    expect(tablesForPoint("g6-2").map((t) => t.id)).toContain("verb-plain");
    expect(tablesForChapter("g6")).toHaveLength(0); // nothing doubled as a step
    const q = buildGrammarQueue(getGrammarChapter("g6")!);
    expect(q.filter((e) => e.kind === "table")).toHaveLength(0);
  });

  it("closes every chapter with a wrap-up (Mini Check) step", () => {
    for (const c of GRAMMAR_CHAPTERS) {
      const q = buildGrammarQueue(c);
      const last = q[q.length - 1]!;
      expect(last.kind, `chapter ${c.id} should end on its wrap-up`).toBe("wrapup");
    }
  });
});
