# Changelog

All notable changes to **Japalingo** — _"Learn to read Japanese — the fun way."_ — are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). All dates are **ISO 8601** (`YYYY-MM-DD`).

> **Phase note:** Japalingo ships in phases — Phase 0 (Planning), Phase 1 (Landing page), Phase 2 (Learning platform: Hiragana + Katakana). See [`ROADMAP.md`](./ROADMAP.md) for the full plan. Learning content is **content-gated** to the `/database` knowledge base — new capabilities land only as the source books grow.

---

## [Unreleased]

Continuing **Phase 2**: more game modes (Ear Training, Romaji Rush, Word Builder), daily quests, and full app-UI i18n (EN/DE).

---

## [0.5.0] - 2026-07-14

**Phase 2 — Learning platform (milestone 3).** Practice, profile, and a memory game.

### Added

- **Practice hub** (`/learn/practice`) — a spaced-review screen that gathers your weakest seen kana across both tracks and runs a mixed review session (feeds XP + mastery).
- **Profile** (`/profile`) — rank + stats (XP, streak, gems, kana met/mastered, lessons), a per-track **mastery grid** that colours all 46 kana by how well you know them, an achievement/badge shelf, and a reset. Reachable from the app-header avatar.
- **Kana Match** — a memory/concentration game: flip cards to pair each kana with its reading; correct pairs feed XP + mastery. Launchable per-track from the dashboard.
- The dashboard now surfaces **Practice**, **Kana Rain**, and **Kana Match** as quick actions. Rank + achievement helpers with unit tests (21 total).

---

## [0.4.0] - 2026-07-14

**Phase 2 — Learning platform (milestone 2).** Katakana + the signature arcade.

### Added

- **Katakana track** — all 46 basic katakana transcribed from the Tofugu `/database` book (mnemonics; pronunciations mirror the hiragana counterparts). The curriculum is now generated from a shared spec so both tracks stay in parity, and the dashboard gains a **Hiragana / Katakana track switcher** (saved locally).
- **Kana Rain** — the signature arcade game: kana fall, type the romaji to pop them before they hit the line; lives, a combo multiplier, and a live score. Correct clears feed XP + mastery into the SRS, so playing is real practice. Launchable from the dashboard for either track.
- Data-integrity tests for the curriculum (18 unit tests total).

---

## [0.3.0] - 2026-07-14

**Phase 2 — Learning platform (milestone 1).** The first playable learning loop: Hiragana, end to end.

### Added

- **Hiragana content** — all 46 basic kana transcribed from the Tofugu `/database` book (pronunciation anchors, mnemonics, example words), plus a 15-node curriculum of Units → Lessons with review checkpoints (`src/data`).
- **Path dashboard** (`/learn`) — a winding node path with locked / current / complete states, unit headers, an app top bar (streak, XP, gems, daily-goal ring), and a locked "Katakana — coming soon" section.
- **Onboarding** — a first-visit flow (welcome + name, motivation, daily goal) shown once and saved locally.
- **Lesson player + game modes** — a per-lesson exercise pipeline with three modes: **Mnemonic Story** (teach, with audio + memory hint), **Quick Match** (multiple choice, both directions), and **Kana Drill** (flashcard self-rating). Answer feedback, a progress bar, and a results/celebration screen.
- **Gamification & SRS** — XP, a daily streak, gems, a daily-goal ring, and per-kana mastery (0–5) with a Leitner-lite scheduler. Progress persists locally via a Zustand store.
- **Audio** — Japanese pronunciation via the Web Speech API and generated SFX (correct / wrong / level-up / complete) via the Web Audio API — no audio files.
- Unit tests for the SRS math and the progress store.

### Notes

- Scope so far is **Hiragana only** (Katakana is intentionally locked). Three of the ten planned game modes ship; the rest, plus the SRS practice hub, profile, and quests, are next.
- App-UI copy is currently English-only; the marketing site stays EN/DE. Full app i18n is a follow-up.
- Progress persistence uses `localStorage` (Zustand persist); the Dexie/IndexedDB `ProgressRepository` swap remains on the plan.

---

## [0.2.0] - 2026-07-14

**Phase 1 — Landing page.** The first application code: a playful, Vercel-ready marketing site.

### Added

- **Landing page (`/`)** — responsive, light/dark, reduced-motion-aware marketing site: sticky nav, 3D **Hoshi** hero, "how it works", features, game showcase, an interactive "you can already read Japanese" moment (real words from `/database`), a gradient final CTA, and a footer. Plus a friendly `/learn` "coming in Phase 2" placeholder so no CTA dead-ends.
- **App scaffolding (Vercel-ready)** — Next.js 16 (App Router, Turbopack) + React 19 + TypeScript (strict); `vercel.json`; ESLint (flat config) + Prettier; Vitest + Testing Library (passing) and a Playwright e2e spec.
- **Design system** — Tailwind CSS v4 with CSS-custom-property design tokens (light + dark) in `src/styles/`, the chunky "shadow-lip" button, cards, pills, section headings, reveal-on-scroll, and theme/language toggles.
- **Hoshi mascot** — a hand-built, animated **SVG** Shiba Inu hero (gentle float, periodic blink, twinkling star, floating color bubbles) whose motion is suppressed for reduced-motion users via a root `MotionConfig`. (An earlier procedural 3D/WebGL Hoshi was dropped in favor of this cuter, lighter SVG; Three.js is reserved for Phase 2 celebration effects.)
- **Self-hosted type** — Fredoka + Nunito via `next/font`, and a kana-subset **M PLUS Rounded 1c** (self-hosted woff2 built from the OFL font, ~40 KB/weight) so Japanese renders on-brand with no runtime CDN.
- **i18n** — next-intl (no-routing, cookie-based locale) with full **English + German** message catalogs and a language toggle. Light/dark via next-themes (`data-theme`).

### Notes

- Scaffolded on **Next.js 16** (the current latest) rather than the 15 named at planning time; App Router + Vercel behavior is equivalent, and the docs were updated to match.
- Routes render on demand (SSR) because the UI locale is read from a cookie — fine for a marketing site; locale-routed static generation is a possible later optimization.

---

## [0.1.0] - 2026-07-14

**Phase 0 — Planning.** No application code; this release is the canonical planning corpus that every later phase builds against.

### Added

- Initial repository planning and single-source-of-truth canon for the product.
- Planning documents:
  - [`CLAUDE.md`](./CLAUDE.md) — agent + contributor guardrails, incl. the `/database`-only content rule.
  - [`README.md`](./README.md) — project overview, positioning, and getting-started map.
  - [`DESIGN_DOCUMENT.md`](./DESIGN_DOCUMENT.md) — brand, design tokens, motion, and UX principles.
  - [`ARCHITECTURE.md`](./ARCHITECTURE.md) — tech stack, folder structure, and data-layer interfaces.
  - [`GAME_MODES.md`](./GAME_MODES.md) — the ten canonical learn/game modes and the Phase 2 ship set.
  - [`CONTENT_MODEL.md`](./CONTENT_MODEL.md) — the `Kana` / `Unit` / `Lesson` schema and learning-path structure.
  - [`ROADMAP.md`](./ROADMAP.md) — the phased delivery plan (Phase 0 → 2 → content-gated future).
  - [`OPEN_QUESTIONS.md`](./OPEN_QUESTIONS.md) — the four default decisions for owner confirmation/override.
- Canonical **tech-stack** decisions: Next.js 15 (App Router) + React 19 + TypeScript (strict), Tailwind CSS v4, Framer Motion, Three.js via @react-three/fiber + drei, Zustand, IndexedDB via Dexie, Web Speech API audio, next-intl — all local-only, no backend in Phase 0–2.
- Canonical **brand** system: Indigo "Ai" primary, Sakura Pink, Gold, and the full semantic palette; sans-serif type (Fredoka / Nunito / M PLUS Rounded 1c); light-mode-first with optional dark mode.
- Canonical **mascot** decision: **Hoshi** (星, "star"), a cream/tan **Shiba Inu** guide and cheerleader, with a defined expression set and a cosmetic collection loop.
- Canonical **gamification** design: XP, streaks (with Streak Freeze), daily goals + quests, Gems, Crowns/mastery with SRS review, badges, and leaderboard-ready structures.
- **Content model** extracted from the `/database` Tofugu books (*Learn Hiragana*, *Learn Katakana*): 46 basic kana per script plus dakuten / handakuten / yōon combos, katakana extended foreign-sound combos, the long-vowel mark ー, real mnemonics, conversion mnemonics, and example words — the sole ground truth for all learning content.

[Unreleased]: https://github.com/japalingo/japalingo/compare/v0.5.0...HEAD
[0.5.0]: https://github.com/japalingo/japalingo/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/japalingo/japalingo/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/japalingo/japalingo/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/japalingo/japalingo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/japalingo/japalingo/releases/tag/v0.1.0
