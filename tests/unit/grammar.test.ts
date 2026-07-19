import { describe, expect, it } from "vitest";
import { GRAMMAR_CHAPTERS, GRAMMAR_PATTERNS } from "@/data/grammar";
import { GRAMMAR_TABLES, tablesForPoint } from "@/data/grammar-tables";
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

describe("reviewable points (empty-review-screen regression)", () => {
  it("marks exactly the points with examples as reviewable", async () => {
    const { REVIEWABLE_POINT_IDS } = await import("@/lib/grammar");
    for (const c of GRAMMAR_CHAPTERS) {
      for (const p of c.points) {
        expect(REVIEWABLE_POINT_IDS.has(p.id)).toBe(p.examples.length > 0);
      }
    }
    // the known example-less rules are excluded (they'd make empty queues)
    expect(REVIEWABLE_POINT_IDS.has("g1-4")).toBe(false);
    expect(REVIEWABLE_POINT_IDS.has("g1-1")).toBe(true);
  });
});

describe("reference tables (Appendix A + restored in-chapter tables)", () => {
  it("every table is rectangular — each row matches its column count", () => {
    expect(GRAMMAR_TABLES.length).toBeGreaterThanOrEqual(29);
    for (const t of GRAMMAR_TABLES) {
      expect(t.columns.length).toBeGreaterThan(1);
      expect(t.rows.length).toBeGreaterThan(0);
      for (const row of t.rows) expect(row).toHaveLength(t.columns.length);
      for (const id of t.chapterIds) expect(getGrammarChapter(id), `bad chapter ${id}`).toBeDefined();
    }
  });

  it("resolves every pointId a table is attached to", () => {
    const pointIds = new Set(GRAMMAR_CHAPTERS.flatMap((c) => c.points.map((p) => p.id)));
    for (const t of GRAMMAR_TABLES) {
      for (const pid of t.pointIds ?? []) {
        expect(pointIds.has(pid), `table ${t.id} → unknown point ${pid}`).toBe(true);
      }
    }
  });

  it("restores the previously-lost chapter tables at their points", () => {
    // the 11 formerly-blank teaching cards each carry a table now
    for (const pid of ["g2-5", "g5-3", "g6-2", "g6-4", "g7-2", "g7-5", "g10-4", "g19-5", "g21-6", "g22-3", "g23-6"]) {
      expect(tablesForPoint(pid).length, `point ${pid} still blank`).toBeGreaterThan(0);
    }
    // the big content restorations
    expect(tablesForPoint("g22-1").map((t) => t.id)).toContain("numbers");
    expect(tablesForPoint("g22-2").map((t) => t.id)).toContain("counters");
    expect(tablesForPoint("g23-1").map((t) => t.id)).toContain("contractions");
    expect(tablesForPoint("g24-4").map((t) => t.id)).toContain("keigo");
    // wave 2: the remaining in-chapter tables (ch4/8/12-18/20)
    for (const [pid, id] of [
      ["g4-5", "qword-mo"], ["g8-1", "aru-iru"], ["g8-2", "position-words"], ["g8-3", "time-ni"],
      ["g12-3", "te-connect"], ["g13-1", "teiru-readings"], ["g13-2", "trans-intrans"],
      ["g14-5", "obligation-ladder"], ["g15-1", "potential-formation"], ["g15-4", "volitional-plans"],
      ["g16-1", "kara-node"], ["g16-4", "conditionals"], ["g17-4", "ndesu-formation"],
      ["g17-5", "koto-no"], ["g18-1", "giving-verbs"], ["g18-2", "favor-actions"],
      ["g18-3", "favor-requests"], ["g20-1", "sou-appearance"], ["g20-3", "you-mitai"],
      ["g20-5", "probability"],
    ] as const) {
      expect(tablesForPoint(pid).map((t) => t.id), pid).toContain(id);
    }
    // g16-4 carries both the overview AND the ば-formation table
    expect(tablesForPoint("g16-4").map((t) => t.id)).toContain("ba-formation");
  });

  it("shows a point-embedded table as a lesson step in OTHER chapters that claim it", async () => {
    const { tablesForChapter } = await import("@/data/grammar-tables");
    // godan-endings is embedded in ch6 (g6-4) but a standalone step in ch12
    expect(tablesForChapter("g6").map((t) => t.id)).not.toContain("godan-endings");
    expect(tablesForChapter("g12").map((t) => t.id)).toContain("godan-endings");
  });
});

describe("mini checks, particles, and pollution regressions", () => {
  it("gives every chapter exactly 3 objectives and 3 Mini Check questions", () => {
    for (const c of GRAMMAR_CHAPTERS) {
      expect(c.objectives, c.id).toHaveLength(3);
      expect(c.miniCheck, c.id).toHaveLength(3);
      // regression: g24's miniCheck once swallowed the whole appendix text
      for (const q of c.miniCheck ?? []) {
        expect(q).not.toMatch(/A\s*P\s*P\s*E\s*N\s*D\s*I\s*X|P\s*A\s*R\s*T/);
        expect(q.length).toBeLessThan(200);
      }
    }
  });

  it("carries the Appendix B particle reference (20 particles)", async () => {
    const { GRAMMAR_PARTICLES } = await import("@/data/grammar-particles");
    expect(GRAMMAR_PARTICLES).toHaveLength(20);
    expect(GRAMMAR_PARTICLES[0]).toMatchObject({ particle: "は" });
    expect(GRAMMAR_PARTICLES.every((p) => p.function && p.example)).toBe(true);
  });
});
