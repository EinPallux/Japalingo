"use client";

import { cn } from "@/lib/utils";
import type { GrammarTable } from "@/types";

/** A clean, horizontally-scrollable conjugation table. The first column reads as
 *  a row label; the rest are Japanese forms (font-jp). */
export function GrammarTableCard({ table, className }: { table: GrammarTable; className?: string }) {
  return (
    <div className={cn("flex w-full max-w-lg flex-col gap-3", className)}>
      <h2 className="font-display text-xl font-bold text-ink">{table.title}</h2>
      <div className="overflow-x-auto rounded-blob-lg border border-border bg-surface">
        <table className="w-full border-collapse text-left text-sm">
          <thead>
            <tr className="border-b border-border bg-surface-2">
              {table.columns.map((c, i) => (
                <th
                  key={i}
                  lang="ja"
                  className="whitespace-nowrap px-3 py-2 font-display text-xs font-bold uppercase tracking-wide text-muted"
                >
                  {c}
                </th>
              ))}
            </tr>
          </thead>
          <tbody>
            {table.rows.map((row, ri) => (
              <tr key={ri} className="border-b border-border last:border-0">
                {row.map((cell, ci) => (
                  <td
                    key={ci}
                    lang="ja"
                    className={cn(
                      "px-3 py-2 align-top",
                      ci === 0
                        ? "whitespace-nowrap font-display text-xs font-semibold text-muted"
                        : "font-jp text-ink",
                    )}
                  >
                    {cell}
                  </td>
                ))}
              </tr>
            ))}
          </tbody>
        </table>
      </div>
      {table.note ? <p lang="ja" className="text-sm text-muted">{table.note}</p> : null}
    </div>
  );
}
