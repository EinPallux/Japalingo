# CLAUDE.md — Agent Operating Guide for Japalingo

> You are an AI coding agent working in this repo. Read this file first. It encodes decisions
> that are already made so you can act correctly without re-deriving them. When in doubt, this
> file plus the docs in the [Documentation index](#11-documentation-index) are your source of
> truth — not general knowledge, not model memory.

---

## 1. Project snapshot

**Japalingo** is a playful, gamified web app to learn to *read* Japanese — Hiragana and Katakana first. Positioning: "the next big competitor to Duolingo, but focused on Japanese." Tagline: **"Learn to read Japanese — the fun way."** Mascot: **Hoshi the Shiba Inu**.

**Current status:** Phase 0 **COMPLETE**. Phase 1 (Landing page) **BUILT**. Phase 2 (Learning platform) **IN PROGRESS** — playable: onboarding, **Hiragana + Katakana** tracks with a switcher, the lesson player (Mnemonic Story, Quick Match, Kana Drill), **five game modes** (Romaji Rush, Kana Rain, Kana Match, Ear Training, Word Builder), a **real SRS review scheduler** (per-kana due-dates; "N due" surfacing), a **MARU-style Free Drill** (train any kana rows, weakness-prioritized), a **gojūon reference chart**, a **"Meet the Sounds" beginner primer**, **daily quests**, a **two-currency shop** (Coins + Gems → Hoshi cosmetics, Streak Freezes, XP Boosts), a **profile** with a mastery grid + badges + Hoshi outfit, a **"Your Journey" insights view**, a **Settings** screen (theme, daily goal, sound, speech speed), and XP/streak/coins/gems/mastery with local save + audio. A full logical-correctness audit has been applied (games quiz only met kana, clean distractors, honest accuracy/streak/quest bookkeeping, gentler onboarding → primer → first lesson). **Next: full app-UI i18n (EN/DE) and the Dexie/IndexedDB persistence swap.**

**Phases at a glance:**

| Phase | Name | Scope |
|-------|------|-------|
| 0 | Planning | All planning docs. No app code. **(complete)** |
| 1 | Landing page | Playful marketing site, 3D Hoshi hero, features, game showcase, responsive, light/dark, i18n (EN/DE), design system + tokens + core UI components, Vercel-ready. **(built)** |
| 2 | Learning platform | Hiragana + Katakana ONLY: onboarding, path dashboard, lesson player, ship-set of game modes, SRS practice hub, gamification, local persistence, profile. No accounts/backend. **(next)** |
| Future | Content-gated | Vocabulary, kanji, grammar, sentences/listening, recorded audio, accounts + cloud sync + leagues/friends, PWA polish. Build ONLY when `/database` grows. |

---

## 2. ⚠️ GOVERNANCE — the `/database` ONLY rule (READ THIS)

**This is the single most important rule in the repo. Do not violate it.**

- **All learning content comes ONLY from `/database`.** Today that is exactly two Tofugu books: `database/tofugu-learn-hiragana-book.pdf` and `database/learn-katakana-book-by-tofugu.pdf`.
- **Do NOT fetch kana facts, mnemonics, vocab, stroke orders, or example words from the internet or from your own model memory** — unless the product owner explicitly authorizes it for a specific task, in writing.
- **Features are CONTENT-GATED.** New capabilities (vocabulary, kanji, grammar, listening dialogues, etc.) are built ONLY after the owner adds the matching knowledge to `/database`. No knowledge in `/database` → do not build the feature. If a task asks for a capability with no backing content, stop and flag it.
- **The PDFs are the source of truth.** They get transcribed into typed datasets under `src/data`. **Never edit the PDFs.** Treat `/database` as read-only ground truth.
- When you write learning content, cite which book/section it came from in the data or a comment, so it stays auditable.

> If a request would require inventing kana facts or reaching outside `/database`, it is out of
> scope by default. Surface the gap; don't paper over it with guessed content.

---

## 3. Tech stack + versions

Recommended defaults (overridable only by the owner in writing):

- **Framework:** Next.js (App Router) + React 19 + **TypeScript (strict)** — scaffolded on **Next.js 16** (current latest; planning said 15, behavior is equivalent). Deploys to **Vercel** (`vercel.json`).
- **Styling:** Tailwind CSS v4 + CSS custom properties for design tokens (enables theming)
- **UI animation:** Framer Motion
- **3D / WebGL:** Three.js via `@react-three/fiber` + `@react-three/drei`
- **State:** Zustand (modular stores). TanStack Query is reserved for when a backend exists.
- **Persistence:** IndexedDB via **Dexie**, behind a `ProgressRepository` interface; small prefs in `localStorage`. **Local-only now; cloud adapter later — no login in Phase 2.**
- **Audio:** Web Speech API (`SpeechSynthesis`) for Japanese pronunciation behind an `AudioService` interface (swappable for recorded files later). SFX generated via the Web Audio API (oscillator blips) — **no external audio assets.**
- **i18n:** next-intl (or a light dictionary layer). English default; German-ready.
- **Testing:** Vitest + Testing Library (unit); Playwright (e2e).
- **Tooling:** ESLint + Prettier, TypeScript strict, **npm** as package manager.
- **No backend server in Phase 0–2.** Everything runs client-side + static.

---

## 4. Repository structure

```
database/            # source PDFs — knowledge base, READ-ONLY, do not edit
public/              # self-hosted fonts, mascot sprites, kana SVGs, static assets
src/
  app/               # Next.js App Router routes ((marketing) + (app) route groups)
  components/        # shared UI: ui/ layout/ mascot/ game/ path/ cards/ feedback/
  features/          # feature modules: onboarding/ path/ lessons/ games/<mode>/ gamification/ profile/
  lib/               # data-layer (repository), srs/, audio/, storage/, i18n/, three/ (r3f scenes), utils
  data/              # typed kana datasets transcribed from /database (+ units, lessons)
  stores/            # zustand stores
  styles/            # tokens.css, tailwind, globals
  types/             # shared TypeScript types
tests/               # unit + e2e (Playwright)
# root docs: CLAUDE.md README.md DESIGN_DOCUMENT.md ARCHITECTURE.md
#            GAME_MODES.md CONTENT_MODEL.md ROADMAP.md CHANGELOG.md OPEN_QUESTIONS.md
```

One-line purpose per folder:

| Folder | Purpose |
|--------|---------|
| `database/` | Source PDFs (the two Tofugu books). Read-only ground truth. |
| `public/` | Self-hosted fonts, Hoshi sprites, kana SVGs, other static assets. |
| `src/app/` | Next.js routes, split into `(marketing)` and `(app)` groups. |
| `src/components/` | Reusable presentational components shared across features. |
| `src/features/` | Self-contained feature modules (one folder each). |
| `src/lib/` | Cross-cutting services: data layer, SRS, audio, storage, i18n, 3D, utils. |
| `src/data/` | Typed datasets transcribed from `/database` (kana, units, lessons). |
| `src/stores/` | Zustand state stores, one per domain. |
| `src/styles/` | Design tokens (`tokens.css`), Tailwind config, global styles. |
| `src/types/` | Shared TypeScript type definitions. |
| `tests/` | Vitest unit tests and Playwright e2e tests. |

---

## 5. Commands

> Live as of Phase 1 (`package.json` exists). Run `npm install` first. Node 20+ (dev uses Node 22).

| Command | Purpose |
|---------|---------|
| `npm run dev` | Start the Next.js dev server. |
| `npm run build` | Production build (Turbopack). |
| `npm run start` | Serve the production build. |
| `npm run lint` | ESLint (flat config; `eslint .`). |
| `npm run typecheck` | `tsc --noEmit`. |
| `npm run test` | Vitest unit tests (Testing Library). |
| `npm run test:e2e` | Playwright end-to-end tests. |

---

## 6. Conventions & guardrails

- **TypeScript strict.** No `any` escapes without justification. Type the data layer thoroughly.
- **Functional React components only** (hooks, no classes).
- **ALWAYS use design tokens / CSS variables. NEVER hardcode hex colors** in components. Colors live in `src/styles/tokens.css` and are consumed via CSS custom properties / Tailwind theme. This is what makes light/dark theming work — hardcoding a hex breaks it.
- **Feature-module pattern:** each feature is a self-contained folder under `src/features/` (its components, hooks, logic, tests). Keep cross-feature imports going through `src/lib` or shared `src/components`, not sideways between feature folders.
- **Pluggable `GameMode` interface:** every learning game implements a common contract so new games drop in without touching the lesson player. Sketch:

  ```ts
  interface GameMode {
    id: GameModeId;                   // canonical mode id, e.g. "kana-rain"
    name: string;                     // display name
    skills: ('recognition' | 'recall' | 'production' | 'listening' | 'application' | 'speed')[];
    supports: { hiragana: boolean; katakana: boolean };
    // build a round from a filtered kana set (by unit / mastery)
    createRound(kana: Kana[], opts: RoundOptions): Round;
    scoreAnswer(round: Round, answer: Answer): AnswerResult;   // XP, correct/wrong, SRS signal
    Component: React.FC<GameModeProps>;                        // the playable UI
  }
  ```

  Every mode must work for **both** hiragana and katakana and be filterable by unit/mastery.
- **Accessibility + `prefers-reduced-motion`:** honor reduced-motion (swap springy/3D motion for a lightweight fallback), keyboard-navigable, focus rings, sufficient contrast, alt/aria labels. 3D must degrade gracefully on low-power devices.
- **Sans-serif only.** No serif fonts anywhere. Light-mode-first; dark mode optional.
- **i18n-ready strings.** No hardcoded user-facing UI copy where avoidable — route strings through the i18n layer (English default, German-ready). Kana/romaji content is data, not UI copy.

---

## 7. Brand quick-reference

Do not re-derive these — use them verbatim.

- **Product name:** Japalingo
- **Mascot:** **Hoshi** (星 = "star"), a round, expressive **Shiba Inu** — guide + cheerleader. *(Recommended default; owner may override.)*
- **Tagline:** "Learn to read Japanese — the fun way."

| Token | Hex | Use |
|-------|-----|-----|
| Primary / brand — Indigo "Ai" | `#5B5BF6` | Primary CTAs, links, active node, focus rings |
| Secondary — Sakura Pink | `#FF5C9D` | Streaks, highlights, secondary buttons |
| Accent — Gold | `#FFC53D` | XP, coins, achievements |
| Success — Fresh Green | `#3FC77A` | Correct answers |
| Error — Coral Red | `#FF5470` | Wrong answers |
| Info — Sky | `#38BDF8` | Audio / listen buttons |
| Ink (text) | `#2A2A4A` | Body text (never pure black) |

Full palette (tints, hover states, dark mode) lives in `src/styles/tokens.css` and `CANON`.

**Fonts (sans-serif, self-hosted — no external CDN):**
- **Fredoka** — display / headings / buttons.
- **Nunito** — body / UI.
- **M PLUS Rounded 1c** — Japanese text & big kana (Noto Sans JP fallback).

---

## 8. Adding content & features

Content-gating is the workflow, not a suggestion. New capability = new knowledge in `/database` first.

**How content-gating works:** a feature ships only when `/database` contains the knowledge it teaches. The owner adds source material → an agent transcribes it into typed data under `src/data` → then (and only then) the matching lessons/games are built.

**Rough steps to register a new content pack:**

1. **Confirm the source exists** in `/database`. No source → stop and flag; do not invent content.
2. **Transcribe** the material into typed datasets under `src/data`, conforming to the `Kana` / `Unit` / `Lesson` schema in `CONTENT_MODEL.md`. Cite the source book/section.
3. **Register the pack** in the content registry so the path/dashboard can discover it.
4. **Define its Units and Lessons** (ordered nodes on the winding path + a Review/Checkpoint node per unit).
5. **Assign game modes** — reuse existing `GameMode` implementations (they are content-agnostic) or add a new one via the `GameMode` interface. Ensure each works for the pack's kana and is filterable by unit/mastery.
6. **Wire SRS + gamification** — new kana automatically get mastery/crown tracking and enter the SRS review pool via the data layer; no bespoke wiring per kana.
7. **Add tests** for the new data and any new logic.

See `CONTENT_MODEL.md` for the exact `Kana` schema and `GAME_MODES.md` for the mode contract.

---

## 9. Testing expectations

- **Vitest + Testing Library** for logic and components: the **SRS scheduler**, the **data layer / repository**, **scoring**, gamification math, and component behavior.
- **Playwright** for key end-to-end flows: onboarding, completing a lesson, running a game mode (e.g. Kana Rain), the SRS practice hub, and progress persistence across reloads.
- Prefer tests that pin the learning logic (SRS scheduling, XP/crown math, answer scoring) — these are correctness-critical and content-independent.

---

## 10. Git & branch workflow

- **Develop on branch `claude/japalingo-platform-f5s0cx`.** (This is the current branch.)
- Write **clear, descriptive commit messages** (what changed and why).
- **Push to that branch.**
- **Do NOT open pull requests** unless the product owner explicitly asks.
- Commit or push only when asked; keep `/database` PDFs untouched in every commit.

---

## 11. Documentation index

Root-level planning docs — read the relevant one before working in its area:

- **[README.md](./README.md)** — project overview, quick start, positioning.
- **[DESIGN_DOCUMENT.md](./DESIGN_DOCUMENT.md)** — product design, brand, UX, screens, gamification.
- **[ARCHITECTURE.md](./ARCHITECTURE.md)** — tech architecture, data layer, services, module boundaries.
- **[GAME_MODES.md](./GAME_MODES.md)** — the `GameMode` contract and every learning/game mode.
- **[CONTENT_MODEL.md](./CONTENT_MODEL.md)** — `Kana`/`Unit`/`Lesson` schema, content packs, transcription rules.
- **[ROADMAP.md](./ROADMAP.md)** — phases, ship set, content-gated future work.
- **[CHANGELOG.md](./CHANGELOG.md)** — notable changes over time.
- **[OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md)** — default decisions awaiting owner confirmation/override.
