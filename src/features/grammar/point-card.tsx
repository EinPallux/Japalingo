"use client";

import { ListenButton } from "@/components/app/listen-button";
import { cn } from "@/lib/utils";
import type { GrammarExample, GrammarPoint } from "@/types";

export function ExampleRow({ ex }: { ex: GrammarExample }) {
  return (
    <div className="rounded-blob-lg border border-border bg-surface-2 p-3 text-left">
      <div className="flex items-start justify-between gap-2">
        <p lang="ja" className="font-jp text-lg text-ink">
          {ex.jp}
        </p>
        <ListenButton text={ex.jp} label="" />
      </div>
      <p lang="ja" className="mt-0.5 font-jp text-sm text-muted">
        {ex.kana}
      </p>
      <p className="mt-1 text-sm text-ink">{ex.en}</p>
    </div>
  );
}

/** The teaching card for one grammar point: heading, explanation, the formation
 *  pattern(s), and the book's example sentences with audio. */
export function PointCard({ point, className }: { point: GrammarPoint; className?: string }) {
  return (
    <div className={cn("flex w-full max-w-lg flex-col gap-4", className)}>
      <div className="flex flex-col gap-3 rounded-blob-xl border border-border bg-surface p-5">
        <h2 lang="ja" className="font-display text-xl font-bold text-ink">
          {point.heading}
        </h2>
        {point.patterns.map((p) => (
          <p
            key={p}
            lang="ja"
            className="rounded-blob-lg bg-primary-tint px-3 py-2 font-jp text-sm font-semibold text-primary"
          >
            {p}
          </p>
        ))}
        {point.explain ? <p lang="ja" className="text-ink">{point.explain}</p> : null}
      </div>

      {point.examples.length > 0 ? (
        <div className="flex flex-col gap-2">
          {point.examples.map((ex) => (
            <ExampleRow key={ex.jp} ex={ex} />
          ))}
        </div>
      ) : null}
    </div>
  );
}
