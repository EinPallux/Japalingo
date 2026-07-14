# Changelog

All notable changes to **Japalingo** — _"Learn to read Japanese — the fun way."_ — are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). All dates are **ISO 8601** (`YYYY-MM-DD`).

> **Phase note:** Japalingo ships in phases — Phase 0 (Planning), Phase 1 (Landing page), Phase 2 (Learning platform: Hiragana + Katakana). See [`ROADMAP.md`](./ROADMAP.md) for the full plan. Learning content is **content-gated** to the `/database` knowledge base — new capabilities land only as the source books grow.

---

## [Unreleased]

Work targeted for **Phase 2 — Learning platform** (Hiragana + Katakana only): onboarding, the winding path dashboard, the lesson player, the ship-set of game modes, the SRS practice hub, gamification, local persistence, and profile. Not yet started.

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

[Unreleased]: https://github.com/japalingo/japalingo/compare/v0.2.0...HEAD
[0.2.0]: https://github.com/japalingo/japalingo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/japalingo/japalingo/releases/tag/v0.1.0
