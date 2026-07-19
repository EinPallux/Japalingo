import { GRAMMAR_CHAPTERS } from "@/data/grammar";
import type { GrammarChapter, GrammarExample, GrammarPoint } from "@/types";

export const GRAMMAR_PARTS: { id: "I" | "II" | "III"; title: string; blurb: string }[] = [
  { id: "I", title: "Foundations", blurb: "Sentence logic, nouns, adjectives, verbs, particles" },
  { id: "II", title: "Building Sentences", blurb: "The て-form, questions, requests, conditions" },
  { id: "III", title: "Everyday Japanese", blurb: "Comparison, appearance, counters, casual speech" },
];

const CHAPTER_BY_ID = new Map(GRAMMAR_CHAPTERS.map((c) => [c.id, c]));

export function getGrammarChapter(id: string): GrammarChapter | undefined {
  return CHAPTER_BY_ID.get(id);
}

/** Every example in a chapter, tagged with the point it belongs to (+ a stable id). */
export interface TaggedExample {
  id: string; // `${pointId}#${index}`
  pointId: string;
  ex: GrammarExample;
}

export function chapterExamples(chapter: GrammarChapter): TaggedExample[] {
  const out: TaggedExample[] = [];
  for (const p of chapter.points) {
    p.examples.forEach((ex, i) => out.push({ id: `${p.id}#${i}`, pointId: p.id, ex }));
  }
  return out;
}

/** Every example across the whole book — the distractor + review pool. */
export const ALL_GRAMMAR_EXAMPLES: TaggedExample[] = GRAMMAR_CHAPTERS.flatMap(chapterExamples);

const POINT_BY_ID = new Map<string, GrammarPoint>(
  GRAMMAR_CHAPTERS.flatMap((c) => c.points.map((p) => [p.id, p] as const)),
);
export function getGrammarPoint(id: string): GrammarPoint | undefined {
  return POINT_BY_ID.get(id);
}

/** Chapters grouped by part, in order. */
export function grammarSections(): { part: "I" | "II" | "III"; title: string; blurb: string; chapters: GrammarChapter[] }[] {
  return GRAMMAR_PARTS.map((p) => ({
    part: p.id,
    title: p.title,
    blurb: p.blurb,
    chapters: GRAMMAR_CHAPTERS.filter((c) => c.part === p.id),
  }));
}

/**
 * A chapter is playable once the previous chapter is completed — chapter 1 is
 * always open. Grammar builds strictly on itself, so the gate mirrors the book's
 * "the chapters build on one another" note.
 */
export function isChapterUnlocked(chapter: GrammarChapter, completed: string[]): boolean {
  if (chapter.num <= 1) return true;
  const prev = GRAMMAR_CHAPTERS.find((c) => c.num === chapter.num - 1);
  return !prev || completed.includes(prev.id);
}

/** Split a kana reading into tap-able phrase chunks for the "build" exercise:
 *  the book's space segmentation, with 、 kept as its own boundary. */
export function readingChunks(kana: string): string[] {
  return kana
    .replace(/、/g, "、 ")
    .split(/\s+/)
    .map((c) => c.trim())
    .filter(Boolean);
}
