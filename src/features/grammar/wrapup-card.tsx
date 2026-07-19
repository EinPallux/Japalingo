"use client";

import type { GrammarChapter } from "@/types";

/**
 * The chapter's closing reflection, straight from the book: its "Common
 * mistake" warning box (where the chapter has one) and the three "Mini Check"
 * self-test questions. Ungraded — a moment to think before the confetti.
 */
export function WrapupCard({ chapter }: { chapter: GrammarChapter }) {
  return (
    <div className="flex w-full max-w-lg flex-col gap-4">
      {chapter.commonMistake ? (
        <div className="rounded-blob-lg border border-error/30 bg-error/10 p-4">
          <p className="mb-1 font-display text-sm font-bold uppercase tracking-wide text-error-strong">
            ⚠️ Common mistake
          </p>
          <p lang="ja" className="text-ink">
            {chapter.commonMistake}
          </p>
        </div>
      ) : null}

      {chapter.miniCheck?.length ? (
        <div className="rounded-blob-lg border border-border bg-surface p-4">
          <p className="mb-2 font-display text-sm font-bold uppercase tracking-wide text-muted">
            ✏️ Check yourself
          </p>
          <p className="mb-3 text-sm text-muted">
            Can you answer these out loud? Revisit the chapter if one feels shaky.
          </p>
          <ol className="flex list-decimal flex-col gap-2 pl-5">
            {chapter.miniCheck.map((q) => (
              <li key={q} lang="ja" className="text-ink">
                {q}
              </li>
            ))}
          </ol>
        </div>
      ) : null}
    </div>
  );
}
