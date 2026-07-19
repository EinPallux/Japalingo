"use client";

import { useTheme } from "next-themes";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { AppHeader } from "@/components/app/app-header";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { sfx, speakJa } from "@/lib/audio";
import { useMounted } from "@/lib/use-mounted";
import { cn } from "@/lib/utils";
import { useProgress } from "@/stores/progress";

const THEMES = [
  { id: "light", label: "Light" },
  { id: "dark", label: "Dark" },
  { id: "system", label: "System" },
];

const GOALS = [
  { xp: 20, label: "Casual" },
  { xp: 30, label: "Regular" },
  { xp: 50, label: "Serious" },
  { xp: 80, label: "Intense" },
];

const SPEEDS = [
  { rate: 0.9, label: "Normal" },
  { rate: 0.6, label: "Slow" },
];

export function SettingsView() {
  const mounted = useMounted();
  const router = useRouter();
  const { theme, setTheme } = useTheme();

  const dailyGoalXp = useProgress((s) => s.dailyGoalXp);
  const setDailyGoal = useProgress((s) => s.setDailyGoal);
  const sfxEnabled = useProgress((s) => s.sfxEnabled);
  const setSfxEnabled = useProgress((s) => s.setSfxEnabled);
  const speechRate = useProgress((s) => s.speechRate);
  const setSpeechRate = useProgress((s) => s.setSpeechRate);
  const reset = useProgress((s) => s.reset);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  const doReset = () => {
    if (window.confirm("Reset all progress? This can't be undone.")) {
      reset();
      router.push("/learn");
    }
  };

  return (
    <>
      <AppHeader />
      <main id="main" className="mx-auto flex max-w-md flex-col gap-6 px-4 py-8">
        <h1 className="text-center font-display text-3xl font-bold text-ink">Settings</h1>

        <Section title="Appearance">
          <Row label="Theme">
            <Segmented
              options={THEMES.map((t) => ({ value: t.id, label: t.label }))}
              value={theme ?? "system"}
              onChange={(v) => setTheme(v)}
            />
          </Row>
        </Section>

        <Section title="Learning">
          <Row label="Daily goal">
            <Segmented
              options={GOALS.map((g) => ({ value: String(g.xp), label: g.label }))}
              value={String(dailyGoalXp)}
              onChange={(v) => setDailyGoal(Number(v))}
            />
          </Row>
          <p className="text-xs text-muted">{dailyGoalXp} XP a day keeps your streak alive.</p>
        </Section>

        <Section title="Sound">
          <Row label="Sound effects">
            <Toggle
              on={sfxEnabled}
              onChange={(on) => {
                setSfxEnabled(on);
                if (on) sfx.tap();
              }}
            />
          </Row>
          <Row label="Pronunciation speed">
            <div className="flex items-center gap-2">
              <Segmented
                options={SPEEDS.map((s) => ({ value: String(s.rate), label: s.label }))}
                value={String(speechRate)}
                onChange={(v) => {
                  setSpeechRate(Number(v));
                  speakJa("あ", Number(v));
                }}
              />
              <button
                type="button"
                onClick={() => speakJa("こんにちは", speechRate)}
                aria-label="Hear a sample"
                className="grid size-9 shrink-0 place-items-center rounded-full bg-info/15 text-info transition hover:bg-info/25"
              >
                🔊
              </button>
            </div>
          </Row>
          <p className="text-xs text-muted">Spoken kana need a Japanese voice installed in your browser.</p>
        </Section>

        <Section title="Motion">
          <p className="text-sm text-muted">
            Animations automatically follow your device&apos;s <strong>Reduce Motion</strong> setting —
            no toggle needed.
          </p>
        </Section>

        <Section title="Learning">
          <Link
            href="/learn/sounds"
            className="flex items-center justify-between gap-2 rounded-blob-lg border border-border bg-surface-2 px-4 py-3 transition hover:border-primary/40"
          >
            <span>
              <span className="block font-display font-bold text-ink">Replay “Meet the sounds”</span>
              <span className="text-sm text-muted">The 1-minute intro to how kana are built</span>
            </span>
            <span aria-hidden className="font-display text-primary">
              ▸
            </span>
          </Link>
        </Section>

        <div className="flex flex-col gap-3 pt-2">
          <button
            type="button"
            onClick={doReset}
            className="rounded-blob-lg border border-error/40 bg-error/10 px-4 py-3 font-display font-bold text-error-strong transition hover:bg-error/15"
          >
            Reset all progress
          </button>
        </div>
      </main>
    </>
  );
}

function Section({ title, children }: { title: string; children: React.ReactNode }) {
  return (
    <section className="flex flex-col gap-3 rounded-blob-lg border border-border bg-surface p-4">
      <h2 className="font-display text-lg font-bold text-ink">{title}</h2>
      {children}
    </section>
  );
}

function Row({ label, children }: { label: string; children: React.ReactNode }) {
  return (
    <div className="flex flex-wrap items-center justify-between gap-3">
      <span className="font-semibold text-ink">{label}</span>
      {children}
    </div>
  );
}

function Segmented({
  options,
  value,
  onChange,
}: {
  options: { value: string; label: string }[];
  value: string;
  onChange: (value: string) => void;
}) {
  return (
    <div className="flex gap-1 rounded-full bg-surface-2 p-1">
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          onClick={() => onChange(o.value)}
          aria-pressed={value === o.value}
          className={cn(
            "rounded-full px-3 py-1.5 text-sm font-bold transition",
            value === o.value ? "bg-surface text-primary shadow-[var(--shadow-soft)]" : "text-muted hover:text-ink",
          )}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

function Toggle({ on, onChange }: { on: boolean; onChange: (on: boolean) => void }) {
  return (
    <button
      type="button"
      role="switch"
      aria-checked={on}
      onClick={() => onChange(!on)}
      className={cn(
        "relative h-7 w-12 shrink-0 rounded-full transition",
        on ? "bg-primary" : "bg-surface-2",
      )}
    >
      <span
        className={cn(
          "absolute top-1 size-5 rounded-full bg-white shadow transition-all",
          on ? "left-6" : "left-1",
        )}
      />
    </button>
  );
}
