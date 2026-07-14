# Japalingo — ARCHITECTURE (Engineering Bible)

> The authoritative engineering reference for **Japalingo** — _"Learn to read Japanese — the fun way."_
> Companion docs: `DESIGN_DOCUMENT.md`, `GAME_MODES.md`, `CONTENT_MODEL.md`, `ROADMAP.md`, `OPEN_QUESTIONS.md`.
> Scope of this file: how the code is organized, the runtime shape, the core engines (SRS, audio, state, game-mode plugins), and the rules that keep the codebase modular and expandable.

**Non-negotiable constraints (from CANON):**

- **NO backend server in Phase 0–2.** Everything runs client-side + static. No accounts, no login, no server data.
- All **learning content comes ONLY from `/database`** (the two Tofugu books), transcribed into typed datasets under `src/data`.
- **Sans-serif only. Light-mode-first**, optional dark mode.
- All user data stays **local in the browser** (IndexedDB + a little localStorage). Privacy by default.
- Every choice below is a **recommended default** (overridable by the product owner in writing — see `OPEN_QUESTIONS.md`).

---

## 1. Stack & rationale

| Concern | Choice (CANON §3) | Why (one line) |
| --- | --- | --- |
| Framework | **Next.js 16 (App Router)** | File-based routing, route groups, SSG/SSR, RSC for a fast marketing site; scales to a backend later without a rewrite. (Scaffolded on the current latest; planning said 15.) |
| UI runtime | **React 19** | Concurrent rendering, `use`/transitions, Actions; the ecosystem all our libs target. |
| Language | **TypeScript (strict)** | `strict: true` everywhere; the domain model (kana/SRS) is safer as types-first. |
| Styling | **Tailwind CSS v4 + CSS custom properties** | Utility speed for a big playful UI; tokens live in CSS vars so theming (light/dark) is a variable swap, not a rebuild. |
| UI animation | **Framer Motion** | Springy, bouncy feedback (pop + shake) with `prefers-reduced-motion` support baked in. |
| 3D / WebGL | **Three.js via @react-three/fiber + @react-three/drei** | Declarative R3F scenes for the Hoshi landing hero and celebration bursts; drei gives loaders/controls/helpers for free. |
| State | **Zustand** (modular stores) | Tiny, unopinionated, no provider boilerplate; one store per concern. **TanStack Query reserved** for when a backend exists. |
| Persistence | **IndexedDB via Dexie**, behind a `ProgressRepository` interface; tiny prefs in `localStorage` | Large structured progress data offline; the interface hides the store so a `CloudRepository` can drop in later. **Local-only now, no login in Phase 2.** |
| Audio (speech) | **Web Speech API (`SpeechSynthesis`)** behind an `AudioService` interface | Zero-asset Japanese pronunciation now; swap to recorded files behind the same interface later. |
| Audio (SFX) | **Web Audio API oscillator blips** (correct/wrong/level-up) | No external audio assets shipped; generated in-browser. |
| i18n | **next-intl** | English default, German-ready message catalogs; keeps UI strings out of kana content. |
| Testing | **Vitest + Testing Library** (unit/component), **Playwright** (e2e) | Fast unit engine for SRS/scoring/repo; real-browser e2e for onboarding/lessons/games. |
| Tooling | **ESLint + Prettier**, **npm** | Standard lint/format; npm is the canonical package manager for this repo. |

**Runtime shape.** Phase 1 is a static marketing site; Phase 2 adds the app as a **client-heavy static bundle** — routes render client-side, state hydrates from IndexedDB, TTS/SFX generate in-browser, and `/database` content compiles into static typed modules at build time. There is **no API layer**; the only "backend" is the browser.

---

## 2. Folder structure

Expanded from CANON §11. Directories are grouped so the app can grow content packs and game modes without touching the core.

```
database/                 # SOURCE PDFs (Tofugu books). Knowledge base. DO NOT EDIT.
public/
  fonts/                  # self-hosted Fredoka, Nunito, M PLUS Rounded 1c, Noto Sans JP (no CDN)
  mascot/                 # Hoshi sprite/expression assets (idle, wave, celebrate, ...)
  kana/                   # authored kana stroke-order SVGs (Phase 2)
  static/                 # og images, favicons, misc
src/
  app/                    # Next.js App Router
    (marketing)/          # landing "/" + footer/legal stubs
    (app)/                # /learn /lesson/[id] /practice /games /games/[mode] /profile /onboarding /settings
    layout.tsx            # root: fonts, theme provider, i18n provider
  components/
    ui/                   # buttons (chunky 3D lip), inputs, chips, modals, rings, badges
    layout/               # shells, nav, headers, page frames
    mascot/               # <Hoshi/> + expression controller
    game/                 # shared game chrome (timer, combo meter, results card)
    path/                 # winding path nodes, unit headers, crown/progress markers
    cards/                # kana cards, mnemonic cards, word cards
    feedback/             # correct/wrong overlays, confetti, toast, level-up burst
  features/
    onboarding/           # multi-step onboarding flow (skippable)
    path/                 # /learn dashboard composition
    lessons/              # lesson player pipeline (learn -> games -> results)
    games/
      <mode>/             # ONE folder per game mode (kana-drill, quick-match, kana-rain, ...)
    gamification/         # xp, streak, quests, gems, achievements, crowns UI + logic
    profile/              # stats, badges, Hoshi cosmetics
  lib/
    data-layer/           # ProgressRepository interface + Dexie impl (+ future cloud adapter)
    srs/                  # Leitner/SM-2-lite scheduler
    audio/                # AudioService (speech provider + Web Audio SFX)
    storage/             # Dexie db definition, localStorage prefs helpers, migrations
    i18n/                 # next-intl config, catalog loader
    three/                # r3f scenes (hero, celebration), shared 3D helpers
    game-modes/           # GameMode registry + shared round/scoring types
    utils/                # pure helpers (shuffle, romaji compare, formatting)
  data/                   # TYPED datasets transcribed from /database
    kana/                 # hiragana.ts, katakana.ts (Kana[] per pack)
    units/                # unit + lesson maps referencing kana ids
    index.ts              # content-pack registry
  stores/                 # zustand stores (profile, progress, session, game, ui)
  styles/                 # tokens.css (CSS vars), tailwind entry, globals.css
  types/                  # shared domain types (Kana, Unit, Lesson, KanaProgress, ...)
tests/
  unit/                   # Vitest: srs, scoring, repository, data integrity
  e2e/                    # Playwright: onboarding, lesson, game
# root docs: CLAUDE.md README.md DESIGN_DOCUMENT.md ARCHITECTURE.md GAME_MODES.md
#            CONTENT_MODEL.md ROADMAP.md CHANGELOG.md OPEN_QUESTIONS.md
```

**Naming conventions**

- **Components**: `PascalCase.tsx` (`KanaCard.tsx`, `Hoshi.tsx`). One component per file; co-locate `*.module`-free styles via Tailwind classes.
- **Hooks**: `useThing.ts` (camelCase, `use` prefix). **Stores**: `thingStore.ts`. **Types**: interfaces `PascalCase`; string-union "enums" preferred over TS `enum`.
- **Pure logic / libs**: `kebab-or-camel` files exporting named functions; no default exports for logic modules.
- **Data files**: lowercase (`hiragana.ts`), arrays of typed records; ids are **stable, lowercase, hyphen-free slugs** (e.g. `hira-a`, `kata-shi`, `hira-kya`).
- **Game-mode folders**: kebab-case matching the `GameMode.id` (`kana-rain`).

---

## 3. Domain model

Types-first. These are sketches; the canonical, fully-commented definitions live in `src/types` and are documented in **`CONTENT_MODEL.md`** (this section must stay aligned with it). Shapes follow CANON §5.

```ts
// src/types/kana.ts
export type KanaType = 'hiragana' | 'katakana';
export type KanaCategory =
  | 'basic' | 'dakuten' | 'handakuten' | 'yoon' | 'extended' | 'special';
// row keys mirror the gojūon rows; DERIVED kana use voiced/plosive row keys.
// ん uses row 'n' with a null vowel; the long-vowel mark ー uses 'special'.
export type KanaRow =
  | 'a' | 'k' | 's' | 't' | 'n' | 'h' | 'm' | 'y' | 'r' | 'w'
  | 'g' | 'z' | 'd' | 'b' | 'p' | 'special';
export type Vowel = 'a' | 'i' | 'u' | 'e' | 'o' | null; // ん/special may be null

export interface ExampleWord {
  kana: string;      // e.g. "あお"
  romaji: string;    // "ao"
  meaning: string;   // "blue"
}

export interface Kana {
  id: string;                 // stable slug: "hira-a", "kata-shi", "hira-kya"
  char: string;               // "あ"
  romaji: string;             // primary reading: "a", "shi", "kya"
  altRomaji: string[];        // ["si"] for し, ["hu"] for ふ, etc.
  type: KanaType;
  category: KanaCategory;
  row: KanaRow;
  vowel: Vowel;
  pronunciationHint: string;  // English anchor from "HOW TO PRONOUNCE"
  mnemonic: string;           // "HOW TO REMEMBER" text (Tofugu)
  mnemonicImageIdea: string;  // supplemental image concept
  strokeCount: number | null;              // authored in Phase 2
  strokeOrder: StrokePath[] | null;        // ordered SVG strokes — authored in Phase 2
  exampleWords: ExampleWord[];
  baseKanaId: string | null;  // for dakuten/handakuten derivations (が -> か)
  comboParts: string[] | null;// for yōon/extended (きゃ -> ["hira-ki","hira-small-ya"])
}

export interface StrokePath { order: number; d: string; } // one authored stroke (Phase 2); d = SVG path
```

```ts
// src/types/curriculum.ts
export interface Unit {
  id: string;                 // "hira-vowels", "kata-extended"
  track: KanaType;
  title: string;              // "Vowels (あ–お)"
  order: number;
  kanaIds: string[];          // kana this unit is responsible for (see CONTENT_MODEL.md)
  lessonIds: string[];
  checkpointLessonId?: string; // the Review/Checkpoint node
  unlockAfter?: string[];      // unit ids gating this one (content-gating)
}

export interface Lesson {
  id: string;                 // "hira-vowels-1"
  unitId: string;
  title: string;
  order: number;
  newKanaIds: string[];       // kana introduced (Mnemonic Story step)
  reviewKanaIds: string[];    // kana pulled in for reinforcement
  gameModeIds: GameModeId[];  // modes this lesson pipelines through
  isCheckpoint?: boolean;
}

/** Canonical game-mode identifiers (see CONTENT_MODEL.md / GAME_MODES.md). */
export type GameModeId =
  | 'mnemonic-story' | 'kana-drill'   | 'quick-match' | 'kana-match'
  | 'romaji-rush'    | 'ear-training' | 'stroke-master'
  | 'kana-rain'      | 'word-builder' | 'kana-sprint';
```

```ts
// src/types/progress.ts
export interface KanaProgress {        // SRS state, one per kana per (local) user
  kanaId: string;
  mastery: 0 | 1 | 2 | 3 | 4 | 5;      // crown level shown in UI (mirrors box)
  box: number;                         // Leitner box 0..5
  ease: number;                        // SM-2-lite factor, default 2.5 (floor 1.3)
  interval: number;                    // days until next review
  dueAt: number;                       // epoch ms; when it re-enters "due"
  streak: number;                      // consecutive correct answers
  lastResult: 'correct' | 'wrong' | null;
}

export interface UserProfile {
  id: 'local';                         // single local profile (no accounts)
  displayName: string;
  createdAt: number;
  motivation?: string;                 // onboarding "why"
  startingLevel: 'beginner' | 'some-hiragana' | 'both-kana';
  dailyGoalXp: 5 | 10 | 15 | 20;       // Casual/Regular/Serious/Intense
  hoshiCosmetics: string[];            // owned/equipped cosmetic ids
}

export interface GameResult {
  lessonId?: string;
  gameModeId: string;
  startedAt: number;
  finishedAt: number;
  total: number;
  correct: number;
  accuracy: number;                    // 0..1
  xpEarned: number;
  gemsEarned: number;
  maxCombo: number;
  perKana: Array<{ kanaId: string; correct: boolean; ms: number }>;
}
```

---

## 4. Data & persistence layer

**Principle:** components and stores never touch IndexedDB directly. Everything goes through a single `ProgressRepository` interface. This keeps the app **local-only + offline + private** today and leaves a clean seam for a future `CloudRepository` adapter — **without touching call sites** (CANON §3, §12).

```ts
// src/lib/data-layer/ProgressRepository.ts
export interface ProgressRepository {
  // profile
  getProfile(): Promise<UserProfile | null>;
  saveProfile(profile: UserProfile): Promise<void>;
  // kana SRS progress
  getKanaProgress(kanaId: string): Promise<KanaProgress | null>;
  getAllKanaProgress(): Promise<KanaProgress[]>;
  saveKanaProgress(progress: KanaProgress): Promise<void>;
  bulkSaveKanaProgress(items: KanaProgress[]): Promise<void>;
  // gamification counters
  getStreak(): Promise<StreakState>;
  saveStreak(s: StreakState): Promise<void>;
  addXp(amount: number): Promise<number>;      // returns new total
  getGems(): Promise<number>;
  adjustGems(delta: number): Promise<number>;
  // settings / prefs
  getSettings(): Promise<AppSettings>;
  saveSettings(s: Partial<AppSettings>): Promise<void>;
  // maintenance (privacy: user owns/exports their data)
  exportAll(): Promise<SerializedBackup>;
  importAll(data: SerializedBackup): Promise<void>;
  reset(): Promise<void>;
}

export interface StreakState { current: number; longest: number; lastActiveDay: string; freezes: number; }
export interface AppSettings { theme: 'light' | 'dark' | 'system'; locale: 'en' | 'de'; ttsRate: number; sfxEnabled: boolean; reducedMotion: boolean | 'system'; }
```

**Dexie implementation (now).** `DexieProgressRepository implements ProgressRepository` over these tables; small prefs (theme/locale) also mirror to `localStorage` for first-paint theming.

```ts
// src/lib/storage/db.ts
import Dexie, { type Table } from 'dexie';
export class JapalingoDB extends Dexie {
  profile!: Table<UserProfile, string>;
  kanaProgress!: Table<KanaProgress, string>;             // keyed by kanaId
  counters!: Table<{ key: string; value: number }, string>; // xp, gems
  streak!: Table<StreakState & { key: 'local' }, string>;
  constructor() {
    super('japalingo');
    this.version(1).stores({
      profile: 'id',
      kanaProgress: 'kanaId, box, dueAt, mastery',
      counters: 'key',
      streak: 'key',
    });
  }
}
```

**Future path (documented, not built):** a `CloudRepository implements ProgressRepository` speaks to an API and syncs via TanStack Query; a `SyncingRepository` composes local + cloud (offline-first write-through). Because every caller depends on the **interface**, switching is a **single wiring change** in the store bootstrap — no UI/store rewrites.

**Privacy note:** no telemetry, no analytics beacons, no third-party audio/font CDNs. `exportAll`/`importAll` let a user own and move their data. Deleting browser storage fully resets the app.

---

## 5. SRS engine

A **Leitner / SM-2-lite** hybrid living in `src/lib/srs`. Mastery is the 0–5 **crowns** count (CANON §6); the Leitner **box** drives the interval, and a light **ease** factor (SM-2 flavor) softens graduation. Pure functions — trivially unit-testable, no I/O.

**Box → interval table (default):**

| Box | Interval | Crown meaning |
| --- | --- | --- |
| 0 | new / same session | not yet learned |
| 1 | 1 day | seen once, sticking |
| 2 | 2 days | recognizing |
| 3 | 4 days | comfortable |
| 4 | 8 days | strong |
| 5 | 16+ days (× ease) | **mastered (crown 5)** |

**Answer transitions**

- **Correct** → `box = min(box + 1, 5)`, `mastery = box`, `streak++`, `ease` nudged up slightly, `interval` from the table (× ease at box 5), `dueAt = now + interval`.
- **Incorrect** → **demote toward the start** (Leitner): `box = max(box - 2, 0)` (or `0` on a lapse from box ≤ 2), `mastery` follows box, `streak = 0`, `ease` nudged down (floor 1.3), short relearn interval (same-session / next-day).
- **"Hard/again" self-rating** (Kana Drill's MARU-style self-rate) maps to a partial demotion; "easy" can skip a box.

```ts
// src/lib/srs/scheduler.ts
export type Grade = 'again' | 'hard' | 'good' | 'easy';
export const BOX_INTERVAL_DAYS = [0, 1, 2, 4, 8, 16] as const;

export function schedule(p: KanaProgress, grade: Grade, now = Date.now()): KanaProgress {
  const correct = grade !== 'again';
  let { box, ease, streak } = p;
  if (grade === 'again')      { box = Math.max(box - 2, 0); ease = Math.max(ease - 0.2, 1.3); streak = 0; }
  else if (grade === 'hard')  { box = Math.max(box - 1, 0); ease = Math.max(ease - 0.05, 1.3); streak += 1; }
  else if (grade === 'good')  { box = Math.min(box + 1, 5); streak += 1; }
  else /* easy */             { box = Math.min(box + 2, 5); ease = ease + 0.1; streak += 1; }

  const base = BOX_INTERVAL_DAYS[box];
  const interval = box >= 5 ? Math.round(base * ease) : base;
  return {
    ...p, box, ease, streak,
    mastery: box as KanaProgress['mastery'],
    interval,
    dueAt: now + interval * 86_400_000,
    lastResult: correct ? 'correct' : 'wrong',
  };
}

// Practice hub selection: what is "due" right now, most-overdue first.
export function selectDue(all: KanaProgress[], now = Date.now(), limit = 20): KanaProgress[] {
  return all.filter(p => p.dueAt <= now)
            .sort((a, b) => a.dueAt - b.dueAt)
            .slice(0, limit);
}
```

**Practice hub (`/practice`, the "Camp"):** `selectDue` feeds a mixed review session across all learned kana, filterable by unit/mastery; overdue and low-mastery items surface first. This hub is the SRS heartbeat.

**New-vs-review mixing in lessons:** a lesson introduces `newKanaIds` via **Mnemonic Story**, then interleaves them with a few **due `reviewKanaIds`** in the mini-games — default pool ≈ **70% new / 30% review** while new kana remain in the unit; checkpoints flip **review-heavy**. Keeps novelty high without letting earlier kana decay.

---

## 6. Audio service

All sound goes through one `AudioService` (`src/lib/audio`). Two providers ship: **speech** (Japanese pronunciation via Web Speech `SpeechSynthesis`) and **SFX** (Web Audio oscillator blips). **No external audio assets are shipped** (CANON §3). The interface makes recorded audio a later drop-in.

```ts
// src/lib/audio/AudioService.ts
export interface SpeechProvider {
  isSupported(): boolean;
  listJapaneseVoices(): SpeechSynthesisVoice[];      // filter voice.lang startsWith 'ja'
  speak(text: string, opts?: { rate?: number; voiceURI?: string }): void;
  cancel(): void;
}

export type Sfx = 'correct' | 'wrong' | 'levelUp' | 'combo' | 'tap';
export interface SfxProvider {
  play(sfx: Sfx): void;
  setEnabled(on: boolean): void;
}

export interface AudioService {
  speech: SpeechProvider;
  sfx: SfxProvider;
  pronounce(kanaOrWord: string, opts?: { rate?: number }): void; // convenience over speech
}
```

**Speech provider (now).** Wraps `window.speechSynthesis`: on init it picks the best `ja-JP` voice (prefers native/local), exposes voice selection + rate in settings, and falls back gracefully (silent no-op + visible caption) when no Japanese voice exists. Used by **Ear Training (Kiku)** and every "listen" button (Sky-colored).

**SFX provider (now).** Generated at runtime with an `AudioContext` + `OscillatorNode` + gain envelope — no files:

```ts
// src/lib/audio/webAudioSfx.ts (sketch)
function blip(ctx: AudioContext, freq: number, ms: number, type: OscillatorType = 'sine') {
  const osc = ctx.createOscillator(), gain = ctx.createGain();
  osc.type = type; osc.frequency.value = freq;
  gain.gain.setValueAtTime(0.0001, ctx.currentTime);
  gain.gain.exponentialRampToValueAtTime(0.2, ctx.currentTime + 0.01);
  gain.gain.exponentialRampToValueAtTime(0.0001, ctx.currentTime + ms / 1000);
  osc.connect(gain).connect(ctx.destination);
  osc.start(); osc.stop(ctx.currentTime + ms / 1000);
}
// correct = bright rising two-tone; wrong = soft low blip (never harsh); levelUp = arpeggio.
```

**Swap path (later):** a `RecordedSpeechProvider` implementing `SpeechProvider` (loads `/public` audio or a CDN) and a `SampleSfxProvider` implementing `SfxProvider` can replace the generated ones behind the same `AudioService` — call sites (`audio.pronounce(...)`, `audio.sfx.play('correct')`) never change.

---

## 7. State management

Zustand, one store per concern (`src/stores`). **Stores hold runtime state and call the `ProgressRepository`; they never write to IndexedDB directly.** On boot each store hydrates from the repository; on mutation it optimistically updates memory and persists via the repo.

| Store | Owns | Persists via |
| --- | --- | --- |
| `profileStore` | `UserProfile`, onboarding completion, daily goal, Hoshi cosmetics | `repo.getProfile/saveProfile` |
| `progressStore` | all `KanaProgress`, crown totals, "due" queries (delegates to `srs`) | `repo.*KanaProgress` |
| `sessionStore` | the active lesson pipeline: step index, round pool, new/review mix, results accumulator | writes `GameResult` + progress on finish |
| `gameStore` | active game-mode runtime: current round, score, combo, timer | emits `GameResult` to `sessionStore`/`repo` |
| `uiStore` | theme (light/dark/system), locale, modals, toasts, reduced-motion pref | `repo.getSettings/saveSettings` (+ localStorage mirror) |
| `gamificationStore` | XP total, level/rank, streak, gems, daily quests, achievements | `repo.addXp/adjustGems/saveStreak` |

**Rule:** a store may depend on `lib/*` engines (srs, audio) and the repository, but **never on another store's internal setters** — cross-store effects go through explicit actions/events. This keeps stores independently testable and swappable.

---

## 8. Game-mode plugin architecture

**Central to "expandable" (CANON §8).** Every learning/game mode implements one `GameMode` contract and **registers itself**; the lesson player and arcade discover modes from a registry. Adding a mode = add a folder + register it. **No core files change.**

```ts
// src/lib/game-modes/types.ts
export type Skill =
  | 'recognition' | 'recall' | 'production' | 'listening' | 'application' | 'speed';

export interface RoundOptions {
  unitId?: string;              // filter to a unit
  masteryMax?: number;          // only kana at mastery <= n (review)
  dueOnly?: boolean;            // pull SRS-due items first
  script?: 'hiragana' | 'katakana' | 'both';
  count?: number;               // round length
  timed?: boolean;              // enable optional timer / speed bonus
  rng?: () => number;           // seedable RNG for deterministic tests
}

export interface Round<TData = unknown> {
  id: string;
  targetKanaIds: string[];      // what this round tests
  data: TData;                  // mode-specific payload (options, grid, falling items…)
}

export interface Answer<TData = unknown> { round: Round<TData>; correct: boolean; ms: number; }

export interface AnswerResult {
  correct: boolean;
  xp: number;                                                        // delta to gamification store
  srs: { kanaId: string; grade: 'again' | 'hard' | 'good' | 'easy' }; // mastery/interval update
}

export interface GameMode<TData = unknown> {
  id: GameModeId;               // canonical mode id (see CONTENT_MODEL.md / GAME_MODES.md)
  name: string;                 // display name (via i18n key)
  skills: Skill[];              // what it trains
  supports: { hiragana: boolean; katakana: boolean };   // both true by default
  createRound(kana: Kana[], opts: RoundOptions): Round<TData>;
  scoreAnswer(round: Round<TData>, answer: Answer<TData>): AnswerResult;
  Component: React.ComponentType<GameModeViewProps<TData>>;          // the playable UI
}

export interface GameModeViewProps<TData> {
  round: Round<TData>;
  onAnswer: (a: Answer<TData>) => void;
  audio: AudioService;
}
```

```ts
// src/lib/game-modes/registry.ts
const registry = new Map<string, GameMode<any>>();
export const registerGameMode = (m: GameMode<any>) => registry.set(m.id, m);
export const getGameMode = (id: string) => registry.get(id);
export const listGameModes = () => [...registry.values()];
```

Each mode in `src/features/games/<mode>/` exports its `GameMode` and calls `registerGameMode`. The **lesson player** iterates `lesson.gameModeIds`, generates rounds from the SRS-selected pool, and routes answers into `sessionStore` + `srs.schedule`; the **arcade** (`/games`) just lists the registry. Ship-set (CANON §8): Mnemonic Story, Kana Drill, Quick Match, Kana Match, Ear Training, Romaji Rush, **Kana Rain**, Word Builder; stretch: Stroke Master, Kana Sprint. Full specs in **`GAME_MODES.md`**.

---

## 9. Content pipeline

**Governance (CANON §4):** content only comes from `/database`. PDFs are the source of truth and are **never edited** — they are **transcribed by hand** into typed modules under `src/data`, and all facts (kana, mnemonics, example words, rules) come only from the books (see `DB_EXTRACT.md` for the ground-truth set).

**PDF → typed dataset flow:**

1. Read a kana page in the Tofugu PDF (pronunciation anchor, mnemonic, image idea, stroke order, example words).
2. Author a `Kana` record in `src/data/kana/hiragana.ts` or `katakana.ts` with a stable id (`hira-a`).
3. Derived kana (dakuten/handakuten/yōon/extended) reference a `baseKanaId`/`comboParts` back to basics (e.g. が → `baseKanaId: 'hira-ka'`; きゃ → `comboParts`).
4. Group ids into `Unit`s and `Lesson`s under `src/data/units/` following the path structure (CANON §7): Vowels → K → S → T → N → H → M → Y → R → W + ん → Dakuten → Handakuten → Combos → Small っ → Track Review; katakana mirrors it + Extended Sounds + Long Vowel ー.
5. Register the pack in `src/data/index.ts` (the content-pack registry) with which `KanaType` it is and which game modes apply.
6. A **Vitest data-integrity test** asserts: unique ids, every `baseKanaId`/`comboParts`/lesson `kanaId` resolves, every unit/lesson id is reachable, romaji non-empty.

**Adding a NEW content pack later (content-gating in action):**

- [ ] Owner adds the new knowledge to `/database` (e.g. a vocabulary or kanji book).
- [ ] Transcribe it into a new typed dataset under `src/data/<pack>/` (new record type if needed, documented in `CONTENT_MODEL.md`).
- [ ] Define its `Unit`s + `Lesson`s and the id references.
- [ ] Choose which existing **game modes** apply (or add a new `GameMode` per §8) and list them on the lessons.
- [ ] Register the pack + set its `unlockAfter` gating so it appears on the path only when prerequisites are met.
- [ ] Add data-integrity + e2e coverage.

New capabilities (vocab, kanji, grammar, listening) are **only built when `/database` gains the content** — the architecture makes the wiring mechanical, but the gate is intentional.

---

## 10. i18n

**next-intl** (CANON §3). **English is the default locale; German (`de`) is the first planned locale** (CANON §0). Kana learning content is **never** in the UI catalogs — it lives in `src/data` as language-neutral records (kana + romaji + book English glosses), so translating the UI never risks the learning facts.

```
src/lib/i18n/
  config.ts               # locales: ['en', 'de'], defaultLocale: 'en'
  request.ts              # next-intl request config (loads active catalog)
messages/
  en.json                 # UI strings ONLY (buttons, onboarding copy, labels)
  de.json                 # German-ready (same keys)
```

- Message keys are namespaced by feature (`onboarding.welcome.title`, `games.kanaRain.name`, `practice.dueCount`); components read them via `useTranslations('namespace')` — **no hardcoded UI text**. Locale persists in `AppSettings` via the repository.
- Kana `romaji`/`meaning`/`mnemonic` come from the dataset, not the catalog. (Mnemonics are English by book source; a later localized-mnemonic layer, if ever needed, would be a separate data field — flagged in `OPEN_QUESTIONS.md`, not built now.)

---

## 11. Theming & tokens

Design tokens (CANON §2) are **CSS custom properties** in `src/styles/tokens.css`, consumed by Tailwind v4 and components. **Light-mode-first**; dark mode is an optional variable override. Sans-serif only.

```css
/* src/styles/tokens.css */
:root {
  --brand: #5B5BF6;        --brand-hover: #4642D6;  --brand-tint: #EEEEFF;
  --sakura: #FF5C9D;       --sakura-tint: #FFE9F2;
  --gold: #FFC53D;         --gold-deep: #F5A623;
  --success: #3FC77A;      --error: #FF5470;        --info: #38BDF8;
  --ink: #2A2A4A;          --muted: #6E6E8F;        --border: #E9E9F3;
  --surface: #FFFFFF;      --bg: #F7F7FD;
  --font-display: 'Fredoka', system-ui, sans-serif;
  --font-body: 'Nunito', system-ui, sans-serif;
  --font-jp: 'M PLUS Rounded 1c', 'Noto Sans JP', sans-serif;
}
:root[data-theme='dark'] {
  --bg: #12122A; --surface: #1C1C3A; --border: #2E2E52; --ink: #EDEDFF; --muted: #A0A0C8;
  /* accent hues brightened ~8% */
}
```

- Theme switch = set `data-theme` on `<html>` (from `uiStore`, default `system`). First-paint theme is read from the localStorage mirror to avoid a flash.
- Buttons use the chunky bottom "shadow lip" (Duolingo-style) built from token colors.
- **Reduced motion** and **theme** are user settings, both persisted.

---

## 12. Performance & 3D strategy

- **Static-first:** the marketing site is SSG; app routes ship as a static client bundle. No SSR data-fetching (no backend).
- **Code-splitting:** each `src/features/games/<mode>` is dynamically imported so a lesson only loads the modes it uses; heavy screens (`/games/[mode]`, lesson player) are route-split by App Router.
- **Lazy 3D:** all `@react-three/fiber` scenes load via `next/dynamic({ ssr: false })`, mounted only when in view. Three.js is **never** in the initial marketing budget beyond the hero, which itself lazy-mounts after first paint.
- **Budget (guidance):** landing initial JS ≤ ~180 KB gz excluding the deferred 3D chunk; 3D hero loaded on idle/intersection; interaction stays 60fps on mid-range mobile.
- **Reduced-motion fallback:** if `prefers-reduced-motion` (or the user setting) is on, R3F scenes render a **static image/gradient fallback**, Framer Motion springs collapse to instant, and confetti is suppressed — same static fallback on low-power/no-WebGL devices. Fonts are **self-hosted** with `font-display: swap`; no external CDN requests (privacy + perf).

---

## 13. Testing strategy

| Layer | Tool | Covers |
| --- | --- | --- |
| **Unit** | Vitest | `srs.schedule`/`selectDue` transitions (all grades, box floors/ceilings), game-mode `scoreAnswer`/`createRound` (seeded rng), `DexieProgressRepository` (fake-indexeddb), data-integrity (ids resolve). |
| **Component** | Vitest + Testing Library | `KanaCard`, results/feedback overlays, path nodes, onboarding steps, a game-mode `Component` with a mocked `AudioService`. |
| **E2E** | Playwright | Three golden flows below, in a real browser, with IndexedDB persistence. |

**E2E golden flows (must always pass):**

1. **Onboarding** — welcome → motivation → level → daily goal → name/cosmetic → guided first lesson; completion persists locally and is skippable.
2. **Complete a lesson** — from `/learn`, open a pulsing lesson, run the pipeline (mnemonic → games → results), verify XP + crown progress persisted and the next node unlocks.
3. **Play a game** — enter `/games/[mode]` (e.g. Kana Rain), play a round, confirm scoring/combo and that a `GameResult` is written.

- SRS and scoring are **pure** → highest-value unit tests, deterministic via seeded rng. Audio is mocked (no real TTS/AudioContext), with a thin smoke test on provider selection.
- CI runs `lint → typecheck → vitest → playwright` on every push.

---

## 14. Build, deploy & privacy

- **Build:** Next.js 16 (Turbopack) output, deployed on **Vercel** (`vercel.json`). No custom server runtime, no accounts, no API keys — nothing to configure server-side in Phase 0–2.
- **Privacy (core promise):** all user data — profile, SRS progress, XP, streak, gems, settings — lives **only in the browser** (IndexedDB + a little localStorage). No sign-up, no tracking, no analytics beacons, no third-party CDNs for fonts or audio. TTS/SFX are generated locally. Users can **export/import** their data and **reset** by clearing storage.
- **Future (content-gated):** when accounts + cloud sync arrive, they slot behind the existing `ProgressRepository` (a `CloudRepository`/`SyncingRepository`) and TanStack Query — an additive change, opt-in, never a precondition for learning.

---

## 15. Extensibility principles

1. **Content is data, not code.** Kana/units/lessons are typed records in `src/data`, sourced only from `/database`. New content = new data + registration, not new engine code.
2. **Depend on interfaces, not implementations.** `ProgressRepository`, `AudioService`, `SpeechProvider`, `SfxProvider` hide their backing so local→cloud and generated→recorded swaps touch one wiring point.
3. **Game modes are plugins.** Implement `GameMode`, register it, done — the core lesson player and arcade never change to add a mode.
4. **One store per concern; persist through the repository.** Stores never write storage directly and never reach into each other's internals.
5. **Pure engines stay pure.** SRS and scoring are I/O-free pure functions → deterministic, seedable, trivially tested.
6. **Content-gating is intentional.** Capabilities unlock only when `/database` grows; the architecture makes the wiring mechanical but the gate deliberate.
7. **Tokens over hardcoded styles; keys over hardcoded strings.** Theming = CSS vars; copy = i18n catalogs; learning facts stay out of both.
8. **Everything degrades gracefully.** No WebGL, no Japanese TTS voice, or reduced-motion all have first-class fallbacks.
9. **Local + offline + private by default.** The browser is the only backend until the owner decides otherwise, in writing.
