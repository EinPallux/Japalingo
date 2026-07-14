# Japalingo

### Learn to read Japanese — the fun way.

Japalingo is a playful, gamified web app for mastering Japanese **kana** — every hiragana and katakana — with mnemonics, mini-games, and a shiba who believes in you. Think of it as the next big competitor to Duolingo, but laser-focused on Japanese and starting where every learner should: actually being able to *read* the writing system. Free, local-first, and scientifically-backed by spaced repetition — no login, no paywalls, no punishment.

---

**Status:** Phase 0 (Planning) — **COMPLETE**. Phase 1 (Landing Page) — **next.**

![status: planning-complete](https://img.shields.io/badge/status-planning--complete-5B5BF6)
![phase](https://img.shields.io/badge/next-phase%201%20landing-FF5C9D)
![license: TBD](https://img.shields.io/badge/license-TBD-lightgrey)
![made with Next.js](https://img.shields.io/badge/made%20with-Next.js%2015-2A2A4A)

> Note: badges are static, decorative placeholders — they display no live external data.

---

## ✨ Features

Everything below is *planned*. Phase 0 ships the blueprint; the app itself arrives in Phase 1+.

- 🧠 **Mnemonic-driven learning** — every kana comes with a memorable shape-to-sound story (あ has the letter "A" hiding inside it; き looks like a key) so you *remember* kana instead of grinding them.
- 🎮 **Lots of ways to play** — because one drill gets boring:
  - 🌸 **Kana Rain** — our signature arcade mode: kana fall like sakura petals, type the romaji before they land.
  - 🃏 **Kana Drill** — SRS flashcards for the core study loop.
  - ⚡ **Quick Match** — multiple choice, kana → romaji (and back), with a timed option.
  - 🎴 **Kana Match** — flip-and-pair memory grid.
  - 👂 **Ear Training** — hear the sound, pick the kana.
  - ⌨️ **Romaji Rush** — type the reading fast, chase the combo meter.
  - 🧩 **Word Builder** — read real example words from the books ("you can already read Japanese!").
- 🔁 **Spaced repetition (SRS)** — a review hub schedules each kana exactly when you're about to forget it (Leitner / SM-2-lite).
- 🏆 **Motivation, everywhere** — XP, daily streaks, daily goals & rotating quests, gems, achievement badges, and per-kana mastery **crowns** (levels 0–5).
- 🐕 **Meet Hoshi** — a round, expressive 3D Shiba Inu companion who guides, cheers, and (gently) worries when you're about to break a streak.
- 🌗 **Light & dark mode** — light-mode-first, with an optional dark theme.
- 💾 **Offline local progress** — your progress lives in your browser (IndexedDB). No account, no login, no data leaving your device.

## 🎯 Scope

Right now Japalingo covers **Hiragana & Katakana only** — the full kana system, including dakuten/handakuten, yōon combos, the small-っ pause, katakana extended sounds for foreign words, and the long-vowel mark ー.

New capabilities (vocabulary, kanji, grammar, listening, and beyond) are **content-gated**: they unlock only as the `/database` knowledge base grows. When the owner adds knowledge, we build the matching lessons and games — never before.

## 🛠️ Tech Stack

*Recommended defaults — overridable by the owner.*

| Area | Choice |
| --- | --- |
| Framework | **Next.js 15** (App Router) + **React 19** + **TypeScript** (strict) |
| Styling | **Tailwind CSS v4** + CSS custom properties (design tokens / theming) |
| Animation | **Framer Motion** (springy, satisfying UI motion) |
| 3D / WebGL | **Three.js** via **@react-three/fiber** + **@react-three/drei** |
| State | **Zustand** (modular stores); TanStack Query reserved for a future backend |
| Persistence | **IndexedDB** via **Dexie**, behind a `ProgressRepository` interface — local-only now, cloud adapter later |
| Audio | **Web Speech API** (SpeechSynthesis) for pronunciation; **Web Audio API** for generated SFX — no external audio assets |
| i18n | **next-intl** — English default, German-ready |
| Testing | **Vitest** + **Testing Library** (unit); **Playwright** (e2e) |
| Tooling | **ESLint + Prettier**, **npm** |

No backend server in Phases 0–2 — everything runs client-side and static.

## 🚀 Getting Started

> ⚠️ **The repo is currently planning docs only.** Application code lands in **Phase 1**. The commands below are the intended workflow for when source arrives — they won't do anything yet.

**Prerequisites**

- **Node.js 20+**
- **npm** (bundled with Node)

**Once Phase 1 code exists:**

```bash
# Install dependencies
npm install

# Start the dev server (http://localhost:3000)
npm run dev

# Production build
npm run build

# Run the test suites
npm test
```

## 📁 Project Structure

```text
database/            # source PDFs — knowledge base, do not edit
public/              # self-hosted fonts, mascot sprites, kana SVGs, static
src/
  app/               # Next.js App Router routes ((marketing), (app) groups)
  components/        # ui/ layout/ mascot/ game/ path/ cards/ feedback/
  features/          # onboarding/ path/ lessons/ games/<mode>/ gamification/ profile/
  lib/               # data-layer, srs/, audio/, storage/, i18n/, three/, utils
  data/              # typed kana datasets transcribed from /database
  stores/            # zustand stores
  styles/            # tokens.css, tailwind, globals
  types/
tests/               # unit + e2e (Playwright)
```

## 📚 Documentation

The planning docs are the heart of Phase 0. Start with `CLAUDE.md` and `DESIGN_DOCUMENT.md`.

| Doc | What's inside |
| --- | --- |
| [CLAUDE.md](./CLAUDE.md) | Ground rules for contributors & AI agents (esp. the `/database`-only content rule) |
| [DESIGN_DOCUMENT.md](./DESIGN_DOCUMENT.md) | Product vision, brand, design tokens, UX, gamification |
| [ARCHITECTURE.md](./ARCHITECTURE.md) | Technical architecture, data layer, module boundaries |
| [GAME_MODES.md](./GAME_MODES.md) | Every learning & game mode, in detail |
| [CONTENT_MODEL.md](./CONTENT_MODEL.md) | Kana data schema, units, lessons, SRS state |
| [ROADMAP.md](./ROADMAP.md) | Phase-by-phase plan and future content gates |
| [CHANGELOG.md](./CHANGELOG.md) | Notable changes over time |
| [OPEN_QUESTIONS.md](./OPEN_QUESTIONS.md) | Default decisions for the owner to confirm or override |

## 🙏 Credits

Learning content is adapted from **Tofugu's** free **"Learn Hiragana"** and **"Learn Katakana"** books, stored in [`/database`](./database). Their mnemonic-first teaching style is the backbone of how Japalingo helps you remember kana. A huge thank-you to **Tofugu** for making these resources free — go check out their work.

The mascot (Hoshi the Shiba Inu) and all product defaults are recommended starting points; the product owner may override any of them.

## 📄 License

**TBD** — the owner should choose a license before public release.
