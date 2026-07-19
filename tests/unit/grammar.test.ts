import { describe, expect, it } from "vitest";
import { GRAMMAR_CHAPTERS, GRAMMAR_PATTERNS } from "@/data/grammar";
import { GRAMMAR_TABLES, tablesForChapter } from "@/data/grammar-tables";
import {
  ALL_GRAMMAR_EXAMPLES,
  getGrammarChapter,
  grammarSections,
  isChapterUnlocked,
  readingChunks,
} from "@/lib/grammar";

const KANA = /[぀-ヿ]/;

describe("grammar dataset", () => {
  it("has all 24 chapters, numbered 1–24 in three parts", () => {
    expect(GRAMMAR_CHAPTERS).toHaveLength(24);
    expect(GRAMMAR_CHAPTERS.map((c) => c.num)).toEqual(Array.from({ length: 24 }, (_, i) => i + 1));
    expect(GRAMMAR_CHAPTERS.filter((c) => c.part === "I")).toHaveLength(8);
    expect(GRAMMAR_CHAPTERS.filter((c) => c.part === "II")).toHaveLength(10);
    expect(GRAMMAR_CHAPTERS.filter((c) => c.part === "III")).toHaveLength(6);
  });

  it("gives every chapter a title, objectives, and points with unique ids", () => {
    const ids = new Set<string>();
    for (const c of GRAMMAR_CHAPTERS) {
      expect(c.id).toBe(`g${c.num}`);
      expect(c.title.length).toBeGreaterThan(0);
      expect(c.objectives.length).toBeGreaterThan(0);
      expect(c.points.length).toBeGreaterThan(0);
      for (const p of c.points) {
        expect(ids.has(p.id)).toBe(false);
        ids.add(p.id);
        expect(p.heading.length).toBeGreaterThan(0);
      }
    }
  });

  it("gives every example a script, a kana reading, and a translation", () => {
    for (const t of ALL_GRAMMAR_EXAMPLES) {
      expect(KANA.test(t.ex.jp)).toBe(true);
      expect(KANA.test(t.ex.kana)).toBe(true);
      expect(t.ex.kana).not.toMatch(/[一-鿿]/); // reading is kana-first, no kanji
      expect(t.ex.en.length).toBeGreaterThan(0);
    }
    expect(ALL_GRAMMAR_EXAMPLES.length).toBeGreaterThan(100);
  });

  it("segments most readings into ≥2 phrase chunks (for the build exercise)", () => {
    const multi = ALL_GRAMMAR_EXAMPLES.filter((t) => readingChunks(t.ex.kana).length >= 2);
    expect(multi.length).toBeGreaterThan(ALL_GRAMMAR_EXAMPLES.length * 0.8);
    expect(readingChunks("わたしは パンを たべます。")).toEqual(["わたしは", "パンを", "たべます。"]);
    // 、 becomes its own boundary
    expect(readingChunks("はい、たべます。")).toEqual(["はい、", "たべます。"]);
  });

  it("carries the 50 Core Patterns reference", () => {
    expect(GRAMMAR_PATTERNS).toHaveLength(50);
    expect(GRAMMAR_PATTERNS[0]).toMatchObject({ n: 1, form: "N は N です" });
    expect(GRAMMAR_PATTERNS.every((p) => p.form && p.meaning)).toBe(true);
  });
});

describe("grammar path", () => {
  it("groups chapters by part, contiguously, covering all 24", () => {
    const sections = grammarSections();
    expect(sections.map((s) => s.part)).toEqual(["I", "II", "III"]);
    expect(sections.flatMap((s) => s.chapters)).toHaveLength(24);
  });

  it("gates chapters: the first is open, later ones unlock as the prior clears", () => {
    const [c1, c2] = GRAMMAR_CHAPTERS;
    expect(isChapterUnlocked(c1!, [])).toBe(true);
    expect(isChapterUnlocked(c2!, [])).toBe(false);
    expect(isChapterUnlocked(c2!, ["g1"])).toBe(true);
  });

  it("resolves a chapter by id", () => {
    expect(getGrammarChapter("g3")?.title).toContain("Noun Sentences");
    expect(getGrammarChapter("nope")).toBeUndefined();
  });
});

describe("conjugation reference tables", () => {
  it("every table is rectangular — each row matches its column count", () => {
    expect(GRAMMAR_TABLES.length).toBeGreaterThanOrEqual(8);
    for (const t of GRAMMAR_TABLES) {
      expect(t.columns.length).toBeGreaterThan(1);
      expect(t.rows.length).toBeGreaterThan(0);
      for (const row of t.rows) expect(row).toHaveLength(t.columns.length);
      for (const id of t.chapterIds) expect(getGrammarChapter(id), `bad chapter ${id}`).toBeDefined();
    }
  });

  it("covers the verb, adjective, and て-form chapters", () => {
    expect(tablesForChapter("g5").length).toBeGreaterThan(0); // adjectives
    expect(tablesForChapter("g6").map((t) => t.id)).toContain("verb-plain"); // verbs
    expect(tablesForChapter("g12").map((t) => t.id)).toContain("te-form"); // て-form
    // a plain grammar chapter with no conjugation gets none
    expect(tablesForChapter("g1")).toHaveLength(0);
  });
});
