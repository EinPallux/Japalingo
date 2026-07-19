import type { VocabDeck, VocabWord } from "@/types";
import { VOCAB } from "./vocab";

/** Every vocab word, indexed by id. */
export const VOCAB_BY_ID = new Map(VOCAB.map((w) => [w.id, w]));

export function getVocabWord(id: string): VocabWord | undefined {
  return VOCAB_BY_ID.get(id);
}
export function getVocabWords(ids: string[]): VocabWord[] {
  return ids.map((id) => VOCAB_BY_ID.get(id)).filter((w): w is VocabWord => Boolean(w));
}

/** The form shown to the learner — kana reading (never the kanji). */
export function vocabDisplay(w: VocabWord): string {
  return w.display ?? w.reading;
}

/**
 * A clean, speakable form of the reading for text-to-speech: a handful of words
 * list reading variants ("くらい/ぐらい") or optional particles ("あと(で)"); take
 * the first variant and drop the parenthetical so the voice reads it naturally.
 */
export function speakableReading(w: VocabWord): string {
  const first = w.reading.split("/")[0]!;
  const clean = first.replace(/[（(][^)）]*[)）]/g, "").replace(/…/g, "").trim();
  return clean || w.reading;
}

const DECK_SIZE = 12;

// Source order (roughly gojūon, as printed) — a stable tiebreak for the sort.
const SOURCE_ORDER = new Map(VOCAB.map((w, i) => [w.id, i]));

/**
 * Learning-efficiency order: most frequent workbook words first (they unlock the
 * most everyday text per word learned), falling back to the book's own order for
 * ties and for the words that carry no frequency count.
 */
function byFrequency(a: VocabWord, b: VocabWord): number {
  return (b.freq ?? 0) - (a.freq ?? 0) || SOURCE_ORDER.get(a.id)! - SOURCE_ORDER.get(b.id)!;
}

function chunk<T>(arr: T[], size: number): T[][] {
  const out: T[][] = [];
  for (let i = 0; i < arr.length; i += size) out.push(arr.slice(i, i + size));
  return out;
}

// A friendly rotating icon set for the core-vocabulary decks.
const CORE_EMOJI = ["📦", "🌸", "🍙", "⛩️", "🎏", "🍜", "🗻", "🎌", "🍵", "🌊", "🏮", "🌿"];

function buildDecks(): VocabDeck[] {
  const isGreeting = (w: VocabWord) => w.tags?.includes("greeting");
  const greetings = VOCAB.filter(isGreeting).sort(byFrequency);
  const core = VOCAB.filter((w) => !isGreeting(w)).sort(byFrequency);

  const decks: VocabDeck[] = [];
  let order = 0;
  const peek = (words: VocabWord[]) => words.slice(0, 3).map((w) => w.reading).join(" · ");

  // Greetings first — the most immediately useful, motivating words to start with.
  chunk(greetings, DECK_SIZE).forEach((words, i) => {
    decks.push({
      id: `vd-greet-${i + 1}`,
      title: `Greetings ${i + 1}`,
      subtitle: peek(words),
      emoji: "👋",
      section: "Greetings & Phrases",
      wordIds: words.map((w) => w.id),
      order: (order += 1),
    });
  });

  // Then the core vocabulary, highest-frequency batches first.
  chunk(core, DECK_SIZE).forEach((words, i) => {
    decks.push({
      id: `vd-core-${i + 1}`,
      title: `Words ${i + 1}`,
      subtitle: peek(words),
      emoji: CORE_EMOJI[i % CORE_EMOJI.length]!,
      section: "Core Vocabulary",
      wordIds: words.map((w) => w.id),
      order: (order += 1),
    });
  });

  return decks;
}

export const VOCAB_DECKS: VocabDeck[] = buildDecks();

const DECK_BY_ID = new Map(VOCAB_DECKS.map((d) => [d.id, d]));

export function getVocabDeck(id: string): VocabDeck | undefined {
  return DECK_BY_ID.get(id);
}

/** All words a deck teaches, as full objects. */
export function deckWords(deck: VocabDeck): VocabWord[] {
  return getVocabWords(deck.wordIds);
}

/**
 * A deck is playable once the previous deck in the path is completed — the first
 * deck is always open. This gives the vocabulary path the same "clear one to
 * unlock the next" progression as the kana path.
 */
export function isVocabDeckUnlocked(deck: VocabDeck, completedDecks: string[]): boolean {
  if (deck.order <= 1) return true;
  const prev = VOCAB_DECKS.find((d) => d.order === deck.order - 1);
  return !prev || completedDecks.includes(prev.id);
}

/** Decks grouped by their section header, in path order. */
export function vocabSections(): { section: string; decks: VocabDeck[] }[] {
  const out: { section: string; decks: VocabDeck[] }[] = [];
  for (const deck of VOCAB_DECKS) {
    let group = out[out.length - 1];
    if (!group || group.section !== deck.section) {
      group = { section: deck.section, decks: [] };
      out.push(group);
    }
    group.decks.push(deck);
  }
  return out;
}
