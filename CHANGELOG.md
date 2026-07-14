# Changelog

All notable changes to **Japalingo** — _"Learn to read Japanese — the fun way."_ — are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). All dates are **ISO 8601** (`YYYY-MM-DD`).

> **Phase note:** Japalingo ships in phases — Phase 0 (Planning), Phase 1 (Landing page), Phase 2 (Learning platform: Hiragana + Katakana). See [`ROADMAP.md`](./ROADMAP.md) for the full plan. Learning content is **content-gated** to the `/database` knowledge base — new capabilities land only as the source books grow.

---

## [Unreleased]

Work targeted for **Phase 1 — Landing page**. This is planning intent, not shipped code.

### Added (planned)

- **Landing page (`/`)** — playful marketing site with the 3D **Hoshi the Shiba Inu** hero (react-three-fiber + drei; floating kana / tori / sakura particles), plus features, game showcase, how-it-works, and CTA sections. Light-mode-first with optional dark mode; fully responsive.
- **App scaffolding** — Next.js 15 (App Router) + React 19 + TypeScript (strict); Tailwind CSS v4 with CSS-custom-property design tokens; folder structure per [`ARCHITECTURE.md`](./ARCHITECTURE.md); ESLint + Prettier; Vitest + Testing Library + Playwright; npm.
- **Design system** — self-hosted sans-serif type (Fredoka / Nunito / M PLUS Rounded 1c), brand color tokens (Indigo "Ai" `#5B5BF6`, Sakura Pink `#FF5C9D`, Gold `#FFC53D`, and the semantic set), chunky "shadow-lip" buttons, Framer Motion springs, and core reusable UI components.
- **i18n scaffold** — next-intl dictionary layer; English default, German (`de`) as the first planned locale.

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

[Unreleased]: https://github.com/japalingo/japalingo/compare/v0.1.0...HEAD
[0.1.0]: https://github.com/japalingo/japalingo/releases/tag/v0.1.0
