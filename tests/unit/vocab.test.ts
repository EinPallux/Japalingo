import { describe, expect, it } from "vitest";
import { VOCAB } from "@/data/vocab";
import {
  deckWords,
  getVocabDeck,
  getVocabWord,
  isVocabDeckUnlocked,
  speakableReading,
  vocabSections,
  VOCAB_DECKS,
} from "@/data/vocab-decks";

const KANA = /[぀-ヿ]/; // at least one hiragana/katakana code point

describe("vocab dataset (JLPT N5)", () => {
  it("has the full 802-word set transcribed from the book", () => {
    expect(VOCAB).toHaveLength(802);
    const greetings = VOCAB.filter((w) => w.tags?.includes("greeting"));
    expect(greetings).toHaveLength(46); // entries 757–802
  });

  it("gives every word a unique id, a kana reading, and an English meaning", () => {
    const ids = new Set<string>();
    for (const w of VOCAB) {
      expect(w.id).toMatch(/^v-\d+$/);
      expect(ids.has(w.id)).toBe(false);
      ids.add(w.id);
      expect(KANA.test(w.reading)).toBe(true); // reading is kana-first
      expect(w.meaning.length).toBeGreaterThan(0);
      // no transcription markers leak into the quizzed reading
      expect(w.reading).not.toMatch(/[～〜[\]]/);
    }
  });

  it("keeps kanji strictly optional — most words carry none, and none is required", () => {
    const withKanji = VOCAB.filter((w) => w.kanji).length;
    expect(withKanji).toBeGreaterThan(0);
    expect(withKanji).toBeLessThan(VOCAB.length); // kanji is reference, not mandatory
  });

  it("teaches わたし/わたくし as 'I' (regression: parser dropped 1-letter meanings)", () => {
    const watashi = VOCAB.find((w) => w.id === "v-753")!;
    expect(watashi.reading).toBe("わたし");
    expect(watashi.meaning).toBe("I");
    expect(watashi.kanji).toBe("私");
    expect(watashi.example?.en).toBe("I'm studying Japanese.");
    const watakushi = VOCAB.find((w) => w.id === "v-752")!;
    expect(watakushi.meaning).toBe("I");
    expect(watakushi.example?.jp).toContain("さとう");
  });

  it("produces a clean, speakable reading for variant/particle forms", () => {
    // "くらい/ぐらい" → first variant; "あと(で)" → drop the optional particle
    const kurai = VOCAB.find((w) => w.reading.includes("/"));
    expect(kurai && speakableReading(kurai)).not.toContain("/");
    const paren = VOCAB.find((w) => w.reading.includes("("));
    if (paren) expect(speakableReading(paren)).not.toContain("(");
  });
});

describe("vocab decks", () => {
  it("partitions every word into exactly one deck, in batches of ≤12", () => {
    const seen = new Set<string>();
    for (const deck of VOCAB_DECKS) {
      expect(deck.wordIds.length).toBeGreaterThan(0);
      expect(deck.wordIds.length).toBeLessThanOrEqual(12);
      for (const id of deck.wordIds) {
        expect(getVocabWord(id), `unknown word ${id}`).toBeDefined();
        expect(seen.has(id), `word ${id} in two decks`).toBe(false);
        seen.add(id);
      }
    }
    expect(seen.size).toBe(VOCAB.length);
  });

  it("orders core words by frequency — the most common words come first", () => {
    const core = VOCAB_DECKS.filter((d) => d.section === "Core Vocabulary");
    const firstDeckFreq = deckWords(core[0]!).map((w) => w.freq ?? 0);
    const lastDeckFreq = deckWords(core[core.length - 1]!).map((w) => w.freq ?? 0);
    const avg = (xs: number[]) => xs.reduce((a, b) => a + b, 0) / xs.length;
    expect(avg(firstDeckFreq)).toBeGreaterThan(avg(lastDeckFreq));
  });

  it("puts greetings first and groups decks under section headers", () => {
    const sections = vocabSections();
    expect(sections[0]?.section).toBe("Greetings & Phrases");
    expect(sections.some((s) => s.section === "Core Vocabulary")).toBe(true);
    // sections are contiguous — each appears once
    expect(new Set(sections.map((s) => s.section)).size).toBe(sections.length);
  });

  it("gates decks: the first is open, later decks unlock as the prior is cleared", () => {
    const [first, second] = VOCAB_DECKS;
    expect(isVocabDeckUnlocked(first!, [])).toBe(true);
    expect(isVocabDeckUnlocked(second!, [])).toBe(false);
    expect(isVocabDeckUnlocked(second!, [first!.id])).toBe(true);
  });

  it("resolves each deck by id", () => {
    expect(getVocabDeck(VOCAB_DECKS[0]!.id)).toBe(VOCAB_DECKS[0]);
    expect(getVocabDeck("nope")).toBeUndefined();
  });
});
