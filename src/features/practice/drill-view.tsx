"use client";

import { useMemo, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { drillSession, kanaForRows, trackRows, weakestRows, DRILL_SESSION_SIZE } from "@/lib/drill";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { Kana, KanaRow, Track } from "@/types";
import { PracticeSession } from "./practice-session";

const TRACKS: { id: Track; label: string; sample: string }[] = [
  { id: "hiragana", label: "Hiragana", sample: "あ" },
  { id: "katakana", label: "Katakana", sample: "ア" },
];

function barClass(avg: number): string {
  if (avg >= 4) return "bg-success";
  if (avg >= 2) return "bg-primary";
  if (avg > 0) return "bg-accent";
  return "bg-border";
}

export function DrillView() {
  const mounted = useMounted();
  const kanaProgress = useProgress((s) => s.kana);
  const activeTrack = useProgress((s) => s.activeTrack);

  const [track, setTrack] = useState<Track>(activeTrack);
  const [selected, setSelected] = useState<Set<KanaRow>>(new Set());
  const [sessionKana, setSessionKana] = useState<Kana[] | null>(null);

  const rows = useMemo(() => trackRows(track, kanaProgress), [track, kanaProgress]);
  const totals = useMemo(
    () =>
      rows.reduce(
        (acc, r) => ({
          total: acc.total + r.kana.length,
          seen: acc.seen + r.seen,
          mastered: acc.mastered + r.mastered,
        }),
        { total: 0, seen: 0, mastered: 0 },
      ),
    [rows],
  );

  const picked = kanaForRows(track, [...selected]);
  const sessionCount = Math.min(picked.length, DRILL_SESSION_SIZE);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  if (sessionKana) {
    return <PracticeSession kana={sessionKana} onExit={() => setSessionKana(null)} />;
  }

  const toggle = (row: KanaRow) =>
    setSelected((prev) => {
      const next = new Set(prev);
      if (next.has(row)) next.delete(row);
      else next.add(row);
      return next;
    });

  const start = () => {
    if (picked.length === 0) return;
    setSessionKana(drillSession(picked, kanaProgress));
  };

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto flex max-w-md flex-col gap-5 px-4 py-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-ink">Free Drill</h1>
          <p className="mt-1 text-muted">
            Pick any rows and train them — Hoshi focuses each session on your weakest kana.
          </p>
        </div>

        {/* Track switcher */}
        <div className="flex gap-1 rounded-full bg-surface-2 p-1">
          {TRACKS.map((t) => (
            <button
              key={t.id}
              type="button"
              onClick={() => setTrack(t.id)}
              aria-pressed={track === t.id}
              className={cn(
                "flex flex-1 items-center justify-center gap-2 rounded-full py-2 font-display font-bold transition",
                track === t.id ? "bg-surface text-primary shadow-[var(--shadow-soft)]" : "text-muted hover:text-ink",
              )}
            >
              <span lang="ja" className="font-jp">
                {t.sample}
              </span>
              {t.label}
            </button>
          ))}
        </div>

        {/* Analysis summary */}
        <div className="grid grid-cols-2 gap-3">
          <div className="rounded-blob-lg border border-border bg-primary-tint p-4 text-center">
            <p className="font-display text-2xl font-bold text-primary">
              {totals.seen}/{totals.total}
            </p>
            <p className="text-xs font-semibold text-muted">kana met</p>
          </div>
          <div className="rounded-blob-lg border border-border bg-accent-tint p-4 text-center">
            <p className="font-display text-2xl font-bold text-accent-strong">
              {totals.mastered}/{totals.total}
            </p>
            <p className="text-xs font-semibold text-muted">mastered 👑</p>
          </div>
        </div>

        {/* Presets */}
        <div className="flex flex-wrap gap-2">
          <Preset onClick={() => setSelected(new Set(rows.map((r) => r.row)))}>All rows</Preset>
          <Preset onClick={() => setSelected(new Set(weakestRows(rows, 3)))}>⚠️ Weakest</Preset>
          <Preset onClick={() => setSelected(new Set())}>Clear</Preset>
        </div>

        {/* Row grid */}
        <div className="grid grid-cols-2 gap-3">
          {rows.map((r) => {
            const on = selected.has(r.row);
            const pct = Math.round((r.avgMastery / 5) * 100);
            return (
              <button
                key={r.row}
                type="button"
                onClick={() => toggle(r.row)}
                aria-pressed={on}
                className={cn(
                  "flex flex-col gap-2 rounded-blob-lg border-2 p-3 text-left transition",
                  on
                    ? "border-primary bg-primary-tint"
                    : "border-border bg-surface hover:border-primary/40",
                )}
              >
                <div className="flex items-center justify-between">
                  <span lang="ja" className="font-jp text-2xl font-bold text-ink">
                    {r.sample}
                  </span>
                  <span
                    aria-hidden
                    className={cn(
                      "grid size-6 place-items-center rounded-full text-xs font-bold",
                      on ? "bg-primary text-white" : "bg-surface-2 text-muted",
                    )}
                  >
                    {on ? "✓" : "+"}
                  </span>
                </div>
                <div>
                  <p className="font-display text-sm font-bold text-ink">{r.title}</p>
                  <div className="mt-1 h-1.5 overflow-hidden rounded-full bg-surface-2">
                    <div className={cn("h-full rounded-full", barClass(r.avgMastery))} style={{ width: `${pct}%` }} />
                  </div>
                  <p className="mt-1 text-xs text-muted">met {r.seen}/{r.kana.length}</p>
                </div>
              </button>
            );
          })}
        </div>

        <div className="sticky bottom-0 -mx-4 mt-1 flex flex-col gap-2 border-t border-border bg-bg/90 px-4 pb-3 pt-3 backdrop-blur">
          {picked.length > DRILL_SESSION_SIZE ? (
            <p className="text-center text-xs text-muted">
              Focusing on your weakest {DRILL_SESSION_SIZE} of {picked.length} selected kana.
            </p>
          ) : null}
          <Button onClick={start} size="lg" disabled={picked.length === 0} className="w-full">
            {picked.length === 0 ? "Pick a row to start" : `Start drill · ${sessionCount} kana`}
          </Button>
        </div>
      </main>
    </>
  );
}

function Preset({ onClick, children }: { onClick: () => void; children: React.ReactNode }) {
  return (
    <button
      type="button"
      onClick={onClick}
      className="rounded-full border border-border bg-surface px-3 py-1.5 text-sm font-bold text-ink transition hover:bg-surface-2"
    >
      {children}
    </button>
  );
}
