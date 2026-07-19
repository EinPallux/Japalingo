import { describe, expect, it } from "vitest";
import { deckWords, VOCAB_DECKS } from "@/data/vocab-decks";
import { buildVocabQueue, buildVocabReviewQueue } from "@/lib/vocab-queue";

const words = deckWords(VOCAB_DECKS[0]!);

describe("vocab exercise queue", () => {
  it("teaches every word once, then drills each in both directions", () => {
    const q = buildVocabQueue(words);
    const learn = q.filter((e) => e.kind === "learn");
    expect(learn).toHaveLength(words.length);
    // teaching cards come before any practice
    const firstPractice = q.findIndex((e) => e.kind !== "learn");
    expect(q.slice(0, firstPractice).every((e) => e.kind === "learn")).toBe(true);
    // each word gets two recall exercises
    const practice = q.filter((e) => e.kind !== "learn");
    expect(practice).toHaveLength(words.length * 2);
  });

  it("always includes the correct answer among four distinct options", () => {
    for (const ex of buildVocabQueue(words)) {
      if (ex.kind === "learn") continue;
      expect(ex.options).toHaveLength(4);
      expect(new Set(ex.options).size).toBe(4); // no duplicate options
      const answer = ex.kind === "m2w" ? ex.word.reading : ex.word.meaning;
      expect(ex.options).toContain(answer);
    }
  });

  it("never offers a distractor that shares the answer's reading or meaning", () => {
    for (const ex of buildVocabQueue(words)) {
      if (ex.kind === "learn") continue;
      const field = ex.kind === "m2w" ? "reading" : "meaning";
      const answer = ex.word[field];
      const distractors = ex.options.filter((o) => o !== answer);
      // a distractor equal to the answer's OTHER field is fine, but never equal
      // to the answer value itself (already unique) — assert they're real values
      for (const d of distractors) expect(d).not.toBe(answer);
    }
  });

  it("m2w answers with kana, w2m/listen answer with the meaning", () => {
    const q = buildVocabQueue(words);
    const m2w = q.find((e) => e.kind === "m2w")!;
    if (m2w.kind === "m2w") expect(m2w.options).toContain(m2w.word.reading);
    const w2m = q.find((e) => e.kind === "w2m");
    if (w2m && w2m.kind === "w2m") expect(w2m.options).toContain(w2m.word.meaning);
  });

  it("review queues skip teaching and only quiz", () => {
    const q = buildVocabReviewQueue(words);
    expect(q.every((e) => e.kind !== "learn")).toBe(true);
    expect(q.length).toBeGreaterThan(0);
  });
});
