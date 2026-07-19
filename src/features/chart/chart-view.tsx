"use client";

import { motion } from "framer-motion";
import { Fragment, useEffect, useMemo, useRef, useState } from "react";
import { AppHeader } from "@/components/app/app-header";
import { ListenButton } from "@/components/app/listen-button";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { CloseIcon } from "@/components/ui/icons";
import { trackKana } from "@/data/curriculum";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";
import type { Kana, KanaRow, Track, Vowel } from "@/types";

const VOWELS: Exclude<Vowel, null>[] = ["a", "i", "u", "e", "o"];
const BASIC_ROWS: KanaRow[] = ["a", "k", "s", "t", "n", "h", "m", "y", "r", "w"];
const DAKUTEN_ROWS: KanaRow[] = ["g", "z", "d", "b", "p"];
const ROW_LABEL: Record<KanaRow, string> = {
  a: "–",
  k: "k",
  s: "s",
  t: "t",
  n: "n",
  h: "h",
  m: "m",
  y: "y",
  r: "r",
  w: "w",
  g: "g",
  z: "z",
  d: "d",
  b: "b",
  p: "p",
  yoon: "yō",
  v: "v",
};

// Yōon are a separate grid: consonant clusters × the three small-y columns.
const YOON_CLUSTERS = ["ky", "sh", "ch", "ny", "hy", "my", "ry", "gy", "j", "by", "py"];
const YOON_COLS: { vowel: Exclude<Vowel, null>; head: string }[] = [
  { vowel: "a", head: "ゃ" },
  { vowel: "u", head: "ゅ" },
  { vowel: "o", head: "ょ" },
];

const TRACKS: { id: Track; label: string; sample: string }[] = [
  { id: "hiragana", label: "Hiragana", sample: "あ" },
  { id: "katakana", label: "Katakana", sample: "ア" },
];

function tint(mastery: number): string {
  if (mastery >= 5) return "border-accent-strong bg-accent text-ink";
  if (mastery >= 3) return "border-primary bg-primary text-white";
  if (mastery >= 1) return "border-primary/30 bg-primary-tint text-primary";
  return "border-border bg-surface text-ink";
}

function Divider({ children }: { children: React.ReactNode }) {
  return (
    <div className="mt-1 flex items-center gap-2">
      <span className="h-px flex-1 bg-border" />
      <span className="text-center text-xs font-bold uppercase tracking-wide text-muted">{children}</span>
      <span className="h-px flex-1 bg-border" />
    </div>
  );
}

/** The yōon grid: consonant clusters (rows) × small ゃ/ゅ/ょ (columns). */
function YoonGrid({
  get,
  masteryOf,
  onSelect,
}: {
  get: (cluster: string, v: Exclude<Vowel, null>) => Kana | undefined;
  masteryOf: (k: Kana) => number;
  onSelect: (k: Kana) => void;
}) {
  return (
    <div className="grid grid-cols-[1.4rem_repeat(3,1fr)] gap-1.5">
      <span aria-hidden />
      {YOON_COLS.map((c) => (
        <span key={c.vowel} lang="ja" className="text-center font-jp text-xs font-bold text-muted">
          {c.head}
        </span>
      ))}
      {YOON_CLUSTERS.map((cluster) => (
        <Fragment key={cluster}>
          <span className="grid place-items-center text-[10px] font-bold text-muted">{cluster}</span>
          {YOON_COLS.map((c) => {
            const k = get(cluster, c.vowel);
            if (!k) return <span key={c.vowel} aria-hidden className="aspect-square rounded-blob-sm bg-surface-2/30" />;
            return (
              <button
                key={c.vowel}
                type="button"
                onClick={() => onSelect(k)}
                aria-label={`${k.romaji}, mastery ${masteryOf(k)} of 5`}
                className={cn(
                  "grid aspect-square place-items-center rounded-blob-sm border font-jp text-base font-bold transition hover:brightness-105",
                  tint(masteryOf(k)),
                )}
              >
                <span lang="ja" aria-hidden>
                  {k.char}
                </span>
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

/** One 5-column gojūon grid section (rows × vowels), tinted by mastery. */
function KanaGrid({
  rows,
  get,
  masteryOf,
  onSelect,
}: {
  rows: KanaRow[];
  get: (row: KanaRow, v: Exclude<Vowel, null>) => Kana | undefined;
  masteryOf: (k: Kana) => number;
  onSelect: (k: Kana) => void;
}) {
  return (
    <div className="grid grid-cols-[1.1rem_repeat(5,1fr)] gap-1.5">
      <span aria-hidden />
      {VOWELS.map((v) => (
        <span key={v} className="text-center text-xs font-bold uppercase text-muted">
          {v}
        </span>
      ))}

      {rows.map((row) => (
        <Fragment key={row}>
          <span className="grid place-items-center text-xs font-bold text-muted">{ROW_LABEL[row]}</span>
          {VOWELS.map((v) => {
            const k = get(row, v);
            if (!k) return <span key={v} aria-hidden className="aspect-square rounded-blob-sm bg-surface-2/30" />;
            return (
              <button
                key={v}
                type="button"
                onClick={() => onSelect(k)}
                aria-label={`${k.romaji}, mastery ${masteryOf(k)} of 5`}
                className={cn(
                  "grid aspect-square place-items-center rounded-blob-sm border font-jp text-lg font-bold transition hover:brightness-105",
                  tint(masteryOf(k)),
                )}
              >
                <span lang="ja" aria-hidden>
                  {k.char}
                </span>
              </button>
            );
          })}
        </Fragment>
      ))}
    </div>
  );
}

export function ChartView() {
  const mounted = useMounted();
  const kanaProgress = useProgress((s) => s.kana);
  const activeTrack = useProgress((s) => s.activeTrack);
  const [track, setTrack] = useState<Track>(activeTrack);
  const [selected, setSelected] = useState<Kana | null>(null);

  const lookup = useMemo(() => {
    const m = new Map<string, Kana>();
    trackKana(track).forEach((k) => m.set(`${k.row}-${k.vowel}`, k));
    return m;
  }, [track]);
  // Yōon key off their consonant cluster (romaji minus the trailing vowel).
  const yoonLookup = useMemo(() => {
    const m = new Map<string, Kana>();
    trackKana(track)
      .filter((k) => k.row === "yoon")
      .forEach((k) => m.set(`${k.romaji.slice(0, -1)}-${k.vowel}`, k));
    return m;
  }, [track]);
  const nKana = useMemo(() => trackKana(track).find((k) => k.vowel === null), [track]);
  const vuKana = useMemo(() => trackKana(track).find((k) => k.row === "v"), [track]);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  const masteryOf = (k: Kana) => kanaProgress[k.id]?.mastery ?? 0;

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto flex max-w-md flex-col gap-4 px-4 py-6">
        <div className="text-center">
          <h1 className="font-display text-3xl font-bold text-ink">Kana Chart</h1>
          <p className="mt-1 text-muted">Tap any kana to hear it and see how to remember it.</p>
        </div>

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

        <KanaGrid rows={BASIC_ROWS} get={(row, v) => lookup.get(`${row}-${v}`)} masteryOf={masteryOf} onSelect={setSelected} />

        <Divider>Dakuten ゛ &amp; Han-dakuten ゜</Divider>
        <KanaGrid rows={DAKUTEN_ROWS} get={(row, v) => lookup.get(`${row}-${v}`)} masteryOf={masteryOf} onSelect={setSelected} />

        <Divider>Combination kana (yōon)</Divider>
        <YoonGrid
          get={(cluster, v) => yoonLookup.get(`${cluster}-${v}`)}
          masteryOf={masteryOf}
          onSelect={setSelected}
        />

        {vuKana ? (
          <div className="flex items-center justify-center gap-2">
            <span className="text-xs font-semibold text-muted">Also:</span>
            <button
              type="button"
              onClick={() => setSelected(vuKana)}
              aria-label={`vu, mastery ${masteryOf(vuKana)} of 5`}
              className={cn(
                "grid size-11 place-items-center rounded-blob-sm border font-jp text-lg font-bold transition hover:brightness-105",
                tint(masteryOf(vuKana)),
              )}
            >
              <span lang="ja" aria-hidden>
                {vuKana.char}
              </span>
            </button>
            <span className="text-xs text-muted">ヴ (vu) — for foreign v-sounds</span>
          </div>
        ) : null}

        {nKana ? (
          <button
            type="button"
            onClick={() => setSelected(nKana)}
            aria-label={`${nKana.romaji}, mastery ${masteryOf(nKana)} of 5`}
            className={cn(
              "flex items-center justify-center gap-2 rounded-blob-lg border py-2 font-jp text-lg font-bold transition hover:brightness-105",
              tint(masteryOf(nKana)),
            )}
          >
            <span lang="ja">{nKana.char}</span>
            <span className="font-display text-sm">= {nKana.romaji}</span>
          </button>
        ) : null}

        <div className="flex flex-wrap justify-center gap-3 text-xs text-muted">
          <Legend cls="bg-surface border-border" label="new" />
          <Legend cls="bg-primary-tint" label="learning" />
          <Legend cls="bg-primary" label="strong" />
          <Legend cls="bg-accent" label="mastered" />
        </div>
      </main>

      {selected ? (
        <KanaDetail kana={selected} mastery={masteryOf(selected)} onClose={() => setSelected(null)} />
      ) : null}
    </>
  );
}

function Legend({ cls, label }: { cls: string; label: string }) {
  return (
    <span className="flex items-center gap-1.5">
      <span className={cn("size-3 rounded-sm border border-border", cls)} />
      {label}
    </span>
  );
}

function KanaDetail({ kana, mastery, onClose }: { kana: Kana; mastery: number; onClose: () => void }) {
  const ex = kana.examples?.[0];
  const closeRef = useRef<HTMLButtonElement | null>(null);

  // Minimal dialog a11y: Escape closes, and focus lands on the Close button so
  // keyboard users aren't left tabbing the chart underneath the overlay.
  useEffect(() => {
    closeRef.current?.focus();
    const onKey = (e: KeyboardEvent) => {
      if (e.key === "Escape") onClose();
    };
    window.addEventListener("keydown", onKey);
    return () => window.removeEventListener("keydown", onKey);
  }, [onClose]);

  return (
    <div
      className="fixed inset-0 z-50 grid place-items-end bg-ink/40 p-3 sm:place-items-center"
      role="dialog"
      aria-modal="true"
      aria-label={`${kana.romaji} details`}
      onClick={onClose}
    >
      <motion.div
        initial={{ opacity: 0, y: 24, scale: 0.96 }}
        animate={{ opacity: 1, y: 0, scale: 1 }}
        transition={{ type: "spring", stiffness: 380, damping: 30 }}
        className="w-full max-w-sm rounded-blob-xl border border-border bg-surface p-6 text-center shadow-[var(--shadow-lift)]"
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-1 flex justify-end">
          <button
            ref={closeRef}
            type="button"
            onClick={onClose}
            aria-label="Close"
            className="grid size-9 place-items-center rounded-full text-muted transition hover:bg-surface-2"
          >
            <CloseIcon className="size-5" />
          </button>
        </div>
        <span lang="ja" className="font-jp text-7xl font-bold text-primary">
          {kana.char}
        </span>
        <p className="mt-1 font-display text-2xl font-bold text-ink">{kana.romaji}</p>
        <div className="mt-3 flex justify-center">
          <ListenButton text={kana.char} />
        </div>
        <div className="mt-4 space-y-2 text-left text-sm">
          <p className="text-muted">
            <span className="font-bold text-ink">Sounds like:</span> {kana.pronunciation}
          </p>
          <p className="text-ink">
            <span className="font-bold">Remember:</span> {kana.mnemonic}
          </p>
          {ex ? (
            <p className="text-muted">
              <span className="font-bold text-ink">Example:</span>{" "}
              <span lang="ja" className="font-jp">
                {ex.kana}
              </span>{" "}
              ({ex.romaji}) = {ex.meaning}
            </p>
          ) : null}
        </div>
        <p className="mt-4 text-xs font-semibold text-muted">
          Mastery {mastery}/5 {"👑".repeat(mastery)}
        </p>
      </motion.div>
    </div>
  );
}
