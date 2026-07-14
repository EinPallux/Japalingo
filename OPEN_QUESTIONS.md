# Japalingo — Open Questions

> **These questions are NON-BLOCKING.** Every item below already has a **recommended default that is in effect right now**, so planning and building can proceed without waiting on answers. The owner can confirm any default with a check, or override it **in writing** at any time — an override updates the canon and the affected docs follow.

**How to use this doc:** skim Section A first (the four foundational decisions), then Section B (softer product calls). Tick `[x]` to confirm, or replace the default with your choice in the "Override" line. Nothing here blocks Phase 0/1/2 work.

---

## Section A — The 4 Key Decisions

These are the load-bearing defaults from the canonical brief. All four were chosen to be **motivating, fast to ship, and expandable** as the `/database` knowledge base grows.

### Q1 — Framework

- [x] **Default (recommended): Next.js (App Router) + React 19 + TypeScript (strict).** Scaffolded in Phase 1 on the current latest, **Next.js 16** (the "15" named at planning time; App Router/Vercel behavior is equivalent).
- [ ] Alternative: **Vite SPA** (client-only single-page app).
- Override: `__________________________`

**Rationale.** Next.js App Router gives us one codebase that serves a fast, SEO-friendly marketing site (Phase 1 landing with the 3D Hoshi hero) *and* the interactive learning app (Phase 2), with file-based routing that maps cleanly onto our planned routes (`/`, `/learn`, `/lesson/[id]`, `/practice`, `/games`, `/profile`, `/onboarding`, `/settings`). It supports static export for cheap hosting today while leaving a clean seam to add server/backend features later (accounts, cloud sync, leagues) without a rewrite. A Vite SPA would be marginally simpler to start but weaker on marketing SEO and would need more plumbing to grow into a backend-connected product.

### Q2 — Accounts & persistence

- [x] **Default (recommended): Local-only, no login, backend-ready.** Progress in IndexedDB (via Dexie) behind a `ProgressRepository` interface; small prefs in localStorage.
- [ ] Alternative: **Full accounts + cloud sync now** (auth provider + hosted database from day one).
- Override: `__________________________`

**Rationale.** Motivation is the #1 goal, and a signup wall is the biggest drop-off point in a learning app. Local-only persistence lets a new user start their first lesson in seconds with zero friction, while the `ProgressRepository` seam means a cloud adapter can be dropped in later with no changes to feature code. Building full accounts + sync now would add auth, a backend, privacy/GDPR surface, and hosting cost before we have proven the core learning loop — premature for Phase 2. Cloud sync stays on the future, content-gated roadmap.

### Q3 — Audio / pronunciation

- [x] **Default (recommended): Browser Web Speech API (`SpeechSynthesis`) for Japanese TTS, behind a swappable `AudioService` interface.** SFX generated at runtime via the Web Audio API (oscillator blips) so no audio files ship.
- [ ] Alternative: **No audio for now** / add recorded pronunciation files later.
- Override: `__________________________`

**Rationale.** SpeechSynthesis ships in every modern browser, needs zero assets or licensing, and is enough to power **Ear Training (Kiku)** and "listen" buttons from day one. Wrapping it in an `AudioService` interface means we can later swap in higher-quality recorded audio (or a hosted TTS provider) per-kana without touching game code. Voice availability/quality varies by OS/browser, which is the known trade-off — but "some audio now, upgradeable" beats "no audio" for a reading app, and recorded files remain on the roadmap.

### Q4 — Mascot

- [x] **Default (recommended): a Shiba Inu named _Hoshi_** (星, "star") — round, cream/tan, curly tail, big friendly eyes.
- [ ] Alternatives considered: **kitsune (fox)** / **origami crane** / **mochi blob**.
- Override: `__________________________`

**Rationale.** Hoshi is guide, cheerleader, and emotional stake — the "a shiba who believes in you" promise in the landing subhead. A Shiba Inu is unmistakably Japanese, universally loved, and highly expressive across the required emotion set (happy, waving, celebrating, thinking, worried, sleeping, level-up), which drives the cosmetics/collection motivation loop. A kitsune, origami crane, or mochi blob could each work thematically, but the shiba maximizes warmth and instant likeability. **Flagged as a recommended default the owner may override** — a mascot swap mainly affects art/copy, not architecture.

---

## Section B — Other Product Questions

Genuinely open, lower-priority calls. Defaults are in effect; weigh in when convenient.

### B1 — Signature color palette

- [x] Confirm the signature palette: **Indigo "Ai" `#5B5BF6`** + **Sakura Pink `#FF5C9D`** + **Gold `#FFC53D`** (with the full supporting token set in the design doc).
- [ ] Request a different signature color: `__________________________`

Context: indigo carries primary CTAs/links/focus, sakura carries streaks/highlights, gold carries XP/rewards. Changing a signature hue is low-cost because all colors live as CSS custom properties (design tokens) — but it touches brand identity, so confirm before Phase 1 visual polish.

### B2 — Hearts / lives mechanic

- [x] **Default: never introduce punishing hearts/lives that block learning.** Motivation-first.
- [ ] Override: allow an optional "focus"/lives mechanic to be revisited later: `__________________________`

Context: Duolingo's hearts gate practice and frustrate learners. Our stance is to celebrate every win and never shame; streaks, daily goals, quests, gems, and crowns supply the pressure instead. Revisitable only as an *optional* focus mode if the owner asks.

### B3 — Monetization stance

- [x] **Default: free, no paywalls.** Gems/coins are earned in-app and spent only on Streak Freezes and Hoshi cosmetics.
- [ ] Override: `__________________________`

Context: the product positions itself as "free, playful, and scientifically-backed." No feature is gated behind payment. If monetization is ever explored, it should not block learning content.

### B4 — Target locales beyond English + German

- [x] **Default: English (default UI) + German (`de`) as the first planned locale.** Architected for i18n via next-intl.
- [ ] Add more locales: `__________________________`

Context: the owner is German, so `de` is the first translation target. The i18n layer makes adding locales straightforward; name any others you want prioritized (e.g. Spanish, French, Portuguese) and they'll be slotted into the roadmap.

### B5 — Stroke-order data sourcing

- [x] **Default: stroke-order data comes ONLY from `/database` (the Tofugu books) or explicit written owner approval for another source.**
- [ ] Approve a specific external stroke-order source: `__________________________`

Context: **governance rule** — all learning content (kana, mnemonics, example words, stroke order) is sourced only from `/database`. The books teach the writing rule (left→right, top→bottom) and per-kana stroke practice; stroke-order path data is authored during Phase 2 transcription **from those pages**. Powering **Stroke Master (Kaki)** from any outside dataset requires explicit owner sign-off first.

### B6 — Deployment target

- [x] **Confirmed by owner (2026-07-14): Vercel.** No backend server in Phase 0–2; everything runs client-side + SSR/static on Vercel. A `vercel.json` (framework: nextjs) ships in Phase 1.
- [ ] Override: `__________________________`

Context: a Vercel deploy is cheap, fast, and matches the local-only, no-backend architecture (Q2). If/when accounts + cloud sync land on the future roadmap, the deployment target can be revisited alongside the backend decision.

---

## Change log for overrides

When the owner overrides a default, note it here (date + decision) so downstream docs stay in sync.

| Date | Question | New decision | Notes |
|------|----------|--------------|-------|
| 2026-07-14 | B6 — Deployment | **Vercel** (explicitly confirmed) | Owner: "The whole project should be deployed on Vercel." `vercel.json` added in Phase 1. |
| 2026-07-14 | Q1 — Framework | Next.js **16** (latest) | Scaffolded on the current latest major; equivalent App Router/Vercel behavior to the "15" named at planning. |
| 2026-07-14 | Q4 — Mascot rendering | Landing hero uses an **animated SVG** Hoshi (not 3D) | Owner found the procedural 3D/WebGL model unappealing; replaced with the cuter, lighter animated SVG. Hoshi identity unchanged. Three.js reserved for Phase 2 celebration effects. |
