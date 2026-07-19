"use client";

import { ListenButton } from "@/components/app/listen-button";
import { speakableReading, vocabDisplay } from "@/data/vocab-decks";
import { cn } from "@/lib/utils";
import type { VocabWord } from "@/types";

const POS_LABEL: Record<string, string> = {
  "i-adj": "い-adjective",
  "na-adj": "な-adjective",
  noun: "noun",
  adv: "adverb",
};

/** Kanji shown only as a small, clearly-optional reference chip — never required. */
export function KanjiChip({ kanji }: { kanji: string }) {
  return (
    <span className="inline-flex items-center gap-1.5 rounded-full bg-surface-2 px-3 py-1 text-sm text-muted">
      <span className="text-xs font-bold uppercase tracking-wide">kanji</span>
      <span lang="ja" className="font-jp text-base text-ink">
        {kanji}
      </span>
    </span>
  );
}

/**
 * The teaching card for one vocab word: the kana reading front and centre, its
 * meaning, an optional kanji reference chip, and the example sentence with audio.
 */
export function WordCard({ word, className }: { word: VocabWord; className?: string }) {
  return (
    <div className={cn("flex w-full max-w-md flex-col items-center gap-4 text-center", className)}>
      <div className="flex w-full flex-col items-center gap-3 rounded-blob-xl border border-border bg-surface p-6">
        <span lang="ja" className="font-jp text-6xl font-bold text-ink">
          {vocabDisplay(word)}
        </span>
        <p className="font-display text-xl font-bold text-primary">{word.meaning}</p>
        {word.pos ? (
          <span className="text-xs font-semibold uppercase tracking-wide text-muted">
            {POS_LABEL[word.pos]}
          </span>
        ) : null}
        <div className="flex flex-wrap items-center justify-center gap-2">
          <ListenButton text={speakableReading(word)} />
          {word.kanji ? <KanjiChip kanji={word.kanji} /> : null}
        </div>
        {word.note ? <p className="text-sm text-muted">{word.note}</p> : null}
      </div>

      {word.example ? (
        <div className="w-full rounded-blob-lg border border-border bg-surface-2 p-4 text-left">
          <div className="flex items-start justify-between gap-3">
            <p lang="ja" className="font-jp text-lg text-ink">
              {word.example.jp}
            </p>
            <ListenButton text={word.example.jp} label="" />
          </div>
          {word.example.en ? <p className="mt-1 text-sm text-muted">{word.example.en}</p> : null}
        </div>
      ) : null}
    </div>
  );
}
