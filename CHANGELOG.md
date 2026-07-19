# Changelog

All notable changes to **Japalingo** — _"Learn to read Japanese — the fun way."_ — are documented in this file.

The format is based on [Keep a Changelog](https://keepachangelog.com/en/1.1.0/), and this project adheres to [Semantic Versioning](https://semver.org/spec/v2.0.0.html). All dates are **ISO 8601** (`YYYY-MM-DD`).

> **Phase note:** Japalingo ships in phases — Phase 0 (Planning), Phase 1 (Landing page), Phase 2 (Learning platform: Hiragana + Katakana). See [`ROADMAP.md`](./ROADMAP.md) for the full plan. Learning content is **content-gated** to the `/database` knowledge base — new capabilities land only as the source books grow.

---

## [Unreleased]

Continuing **Phase 2**: full app-UI i18n (EN/DE) and the Dexie/IndexedDB persistence swap.

---

## [0.17.0] - 2026-07-19

**Phase 2 — Extended katakana & the long vowel ー.** The last of the katakana book's content, completing the full katakana system.

### Added

- **Extended combination katakana** — 22 foreign-sound combos from the book's "Combination Katakana" pages: **ファ/フィ/フェ/フォ** (f), **ヴァ/ヴィ/ヴェ/ヴォ** (v), **ウィ/ウェ/ウォ** (w), **ツァ/ツィ/ツェ/ツォ** (ts), plus **ティ・ディ・トゥ・ドゥ・シェ・ジェ・チェ**. Each uses the standard transliteration you read, with the book's pronunciation notes and its own example words (ファン = fan, ヴァイオリン = violin, ウィンドウ = window, モッツァレラ = mozzarella…). Taught in three new katakana units after ヴ.
- **The long vowel ー (chōonpu)** — a concept lesson (like the small っ) teaching that the dash stretches the preceding vowel, with the book's minimal pair チーズ ("chiizu", cheese) vs チズ ("chizu", map).
- **Kana Chart** gains an **Extended Katakana (foreign sounds)** section; **Free Drill** gains a "Foreign ァィゥェォ" row; new **Loanword Pro** badge. Lessons, games, SRS, Speed Review, and mastery all pick them up automatically. That completes the katakana book — the full set is now **127 katakana** (104 hiragana), 231 kana total.

> The two concept lessons (small っ, long vowel ー) now share one `ConceptLesson` component.

---

## [0.16.0] - 2026-07-19

**Phase 2 — Combination kana, ヴ & the small っ.** The rest of the books' "variation" content, all from `/database`.

### Added

- **Combination kana (yōon)** — 33 per script (66 total): きゃ/きゅ/きょ, しゃ/しゅ/しょ, … ぴゃ/ぴゅ/ぴょ, generated from the books' composition rule (an I-row kana + a small ゃ/ゅ/ょ, dropping the "i" — kya, not ki-ya). Uses Hepburn readings (sha/cha/ja) and skips the archaic ぢゃ, as every teacher does. Taught in **five new units** after the dakuten section, with a mid-checkpoint and the Final review sampling across everything.
- **ヴ (vu)** — the one dakuten vowel (dakuten ウ), katakana-only, in its own small **"Extended: ヴ"** unit; used for foreign v-sounds (ヴァイオリン = violin).
- **The small っ / ッ** — a dedicated **concept lesson** (the doubling rule) that teaches the pause and then has you read the book's own example words (いっか → ikka, りったい → rittai …). It sits at the end of the hiragana path; ッ works identically.
- **Kana Chart** gains a full **Combination kana (yōon)** grid (clusters × ゃゅょ) and the ヴ chip. **Free Drill** gains a "Combos ゃゅょ" row (and a "ヴ" row on katakana). New **Combo Master** badge. Everything else — lessons, games, SRS, Speed Review crowns, mastery — picks up all of it automatically.

> Still content-gated for a future pack (present in the katakana book): the extended combination katakana (ファ, ティ, ディ, トゥ, シェ/ジェ/チェ, ツァ, ウィ…) and the long-vowel dash ー.

---

## [0.15.0] - 2026-07-19

**Phase 2 — Dakuten & han-dakuten.** The first content expansion beyond the basic 46: the "variation" kana, transcribed straight from the Tofugu books' variation pages.

### Added

- **50 new kana** (25 per script), all sourced from `/database` — the dakuten (゛) rows **G / Z / D / B** (voiced: か→が, さ→ざ, た→だ, は→ば) and the han-dakuten (゜) **P** row (は→ぱ), for both hiragana and katakana. Each carries the book's own conversion mnemonic (e.g. "the car か runs into the guard が rail"), including the tricky homophones — じ/ぢ (both *ji*, ぢ typed *di*) and ず/づ (both *zu*, づ typed *du*).
- **Path placement after the basics.** Following the Tofugu books and the standard teaching order (master all 46 basics first), five new units — **G row ゛, Z row ゛, D row ゛, B row ゛, P row ゜** — sit at the end of each track, gated behind the basic path. A **"Review: all basics"** checkpoint now closes the basic section, a **"Review: dakuten G–D"** checkpoint lands mid-way, and the **Final review** now covers all 71 kana. Every existing system picks these up for free: lessons, the SRS practice pool, all five games, Free Drill (new G/Z/D/B/P rows), Speed Review crowns, and mastery tracking.
- **Kana Chart** gains a **Dakuten ゛ & Han-dakuten ゜** section below the gojūon grid, tap-to-hear like the rest.
- **Dakuten Master** badge for meeting every variation kana; per-track counts now read **out of 71** (46 basic + 25).

> Scoped out for a future content pack (also present in the books): the niche katakana **ヴ (vu)**, the **combination kana (yōon)** きゃ/しゃ/…, and the **small っ**. The JLPT N5 vocabulary PDF is untouched per request.

---

## [0.14.0] - 2026-07-18

**Phase 2 — Progression & personality.** Three additions that deepen the loop: a second path progression layer, arcade high scores, and an in-lesson mascot coach.

### Added

- **Speed Review checkpoints.** Once every lesson in a unit is done, a gold **⚡ Speed Review** appears on that unit's header — a timed recognition run (≈4s/kana) over the whole unit. Beat the clock with ≥80% correct and the unit earns a **gold 👑 crown** (a one-time **+10 💎** bonus), a second progression layer on top of finishing lessons. Locked units show a dimmed crown; crowned units keep the gold crown (tap to replay). Route: `/learn/review/[unitId]`. (`src/lib/speed-review.ts`, unit tests included.)
- **Local high-score boards for Kana Rain & Romaji Rush.** Each game now keeps a **personal best per track**. A run that beats it triggers a **🏆 "New personal record!"** celebration with confetti on the game-over screen; otherwise it shows your best so far. The Arcade cards surface each game's best (🏆 N) at a glance. Bests persist locally with the rest of your progress.
- **Hoshi coaches you through lessons.** A small **corner Hoshi** now reacts live: hit a **3-in-a-row streak** and it cheers ("On fire! すごい！", "You're flying! ✨", with a ×N badge past 5); slip up and it encourages you ("がんばって！ Keep going"). Reduced-motion friendly (the bubble fades via opacity, no movement required).

---

## [0.13.0] - 2026-07-18

**Phase 2 — Full check, tidy-up & game-feel.** A second full audit (all findings fixed), a decluttered dashboard, and a Duolingo-level animation pass.

### Changed

- **Tidier dashboard — the path comes first.** The Shop banner (already in the header), the Kana Chart row, and the five stacked game cards are gone; in their place one clean **2×2 quick-action grid** (Practice · Free Drill · Arcade · Kana Chart). The learning path now starts within one screen of the top.
- **New Arcade hub** (`/learn/games`) — all five games on one dedicated page, each labeled with the skill it trains (Speed / Recall / Memory / Listening / Reading), with a staggered entrance.

### Added

- **Duolingo-level animation pass** (all honoring `prefers-reduced-motion`):
  - **Confetti** celebration (token-colored, no libraries) + **counting-up XP** + a bobbing Hoshi on lesson results and game wins.
  - Answer feedback everywhere: correct choices **pop**, wrong choices **shake** (lessons + all games).
  - A floating **"+10 XP"** on every correct lesson answer.
  - Exercises **slide** between steps in the lesson player (spring transitions).
  - The header's daily-goal ring now **springs** to its new fill and the streak **flame flickers** while the streak is alive; claimable quest rewards **pulse**.
  - The current path node **pulses** its halo; unlocked nodes lift on hover; combo badges pop in the games; the chart's kana detail card springs open.

### Fixed

- **Streak could silently reset on DST changeover (MEDIUM).** "Yesterday" was computed with fixed 24-hour math, so on the morning after a spring-forward clock change an unbroken streak could read as broken and reset to 1. Day arithmetic is now calendar-based.
- **Service worker could cache error responses (MEDIUM).** A transient 404/500 (e.g. mid-deploy) was cached and later served offline — a poisoned hashed asset would have stuck forever. Only OK responses are cached now.
- **Review lessons always drilled the same kana (MEDIUM).** The capped reverse-recall/drill picks sliced an *unshuffled* gojūon-ordered pool, so the final review's extra practice always hit the first rows (あ–く) and never the tail (わ/を/ん). Picks are shuffled before capping.
- **Ear Training kept talking after exit (LOW).** Speech is now cancelled when leaving mid-round (also fixes a dev-mode double-speak).
- **Kana Rain double-demotion (LOW).** Two copies of the same kana landing in one frame counted as two misses; now deduped to one.
- **Chart detail dialog a11y (LOW).** Escape now closes it and focus moves into the dialog (and back out) properly.

---

## [0.12.0] - 2026-07-15

**Phase 2 — Installable PWA.** Japalingo can now be added to the iPhone/iPad home screen and run full-screen like a native app, with offline support.

### Added

- **Web App Manifest** (`/manifest.webmanifest`) — installable as a standalone app: name, brand theme color, `portrait` orientation, `start_url: /learn` (opens straight into the path), and a full icon set (192 / 512 / maskable) generated from the brand star.
- **iOS home-screen support** — `apple-touch-icon` (180×180), `apple-mobile-web-app-capable` + `mobile-web-app-capable`, app title, and status-bar style, plus `viewport-fit=cover` and `env(safe-area-inset-*)` padding so content clears the notch and home indicator in standalone mode.
- **Offline support** via a service worker (`/sw.js`, registered in production) — cache-first for immutable assets (JS/CSS/fonts/images) and network-first for pages, so the app shell loads instantly and pages you've opened keep working with no connection. The learning path (`/learn`) is precached, and an unreachable new page falls back to a friendly **`/offline`** screen. All learning state already lives on-device, so lessons, games, and SRS run offline once cached.
- **"Add to Home Screen" hint** — a small, dismissible card on the dashboard (iOS Safari only, hidden once installed) explaining the Share → Add to Home Screen flow, since iOS has no install-prompt API.

---

## [0.11.1] - 2026-07-15

**Phase 2 — Quality & correctness pass.** A full logical audit of the learning platform, with every finding fixed: games now only ever quiz kana you've actually met, distractors can't cheat, accuracy/streak/quest bookkeeping is honest, and new learners are walked in gently.

### Fixed

- **Games only use kana you've met.** Romaji Rush, Kana Rain, Kana Match, Ear Training, and Word Builder now draw every round from your **learned** kana (met at least once) instead of all 46 — so a beginner who's done one lesson is never ambushed by characters they've never seen, and answering a game can no longer create or corrupt mastery for un-taught kana. Each game shows a friendly **"learn a bit more first"** gate until enough kana are met (Kana Rain 3, Romaji Rush / Ear Training 4, Kana Match 6, Word Builder 4 readable words).
- **Clean multiple-choice distractors.** Lesson choices, Romaji Rush, and Ear Training now pick wrong answers **only from the same script** and never one that reads the same as the correct answer — no more a katakana option appearing among hiragana, and no "two right answers." (`build-queue.ts` + game round builders; pinned by new tests.)
- **Word Builder only shows words you can read** — every character already met (hiragana words for now; katakana words remain content-gated) — and now awards **coins + daily-quest credit** on a correct read, like every other correct answer.
- **Honest accuracy.** Your Journey's accuracy is now over **graded answers only** (a new per-kana `attempts` counter), so passively viewing a kana on the chart no longer skews the number.
- **Streak badges stay earned.** "On Fire" / "Week Warrior" now track your **best-ever streak**, so breaking a streak no longer revokes a badge you already earned. The streak flame also stays lit through a single missed day when a Streak Freeze is banked.
- **Kana Rain records misses.** A kana that reaches the line now counts as a miss against its mastery + review schedule, instead of silently vanishing.
- **Quests can't be over-claimed.** Claiming a daily quest re-verifies it's actually complete against freshly-rolled metrics.
- **Gentler onboarding.** Finishing onboarding now flows into the **"Meet the Sounds" primer**, which then hands straight off to your **first lesson** — no more landing cold on the dashboard.
- **Smarter Free Drill.** "Weakest rows" and each drill session now prefer kana you've **started** (seen but shaky) over rows you've never been taught. Review lessons gained reverse-recall + self-drill steps (not just one-way matching), and the final review now covers the **whole script**.

---

## [0.11.0] - 2026-07-15

**Phase 2 — Beginner toolkit.** Five additions that help an absolute beginner: real spaced-repetition scheduling, a reference chart, a sounds primer, a settings screen, and a progress view.

### Added

- **Real SRS "due today" scheduling.** Each kana now carries a review **due-date** whose interval grows with mastery (4h → 1d → … → 16d) and shrinks on a miss. The Practice hub shows how many kana are **due now** (and "all caught up!" when none are), reviews the due set first, and the dashboard's Practice card carries a **"N due"** badge. Answering reschedules the kana. (`src/lib/srs.ts` + a `useNow` hook; the Practice hub now freezes its review set at session start so answering can't rebuild the queue mid-review.)
- **Gojūon reference chart** (`/learn/chart`, from a dashboard link) — the classic 5×10 Hiragana/Katakana grid with the usual gaps (y/w rows) and ん. Cells are **tinted by mastery**; tap any one for a detail card with its reading, a Listen button, the "sounds like" anchor, the mnemonic, and an example word — all from the `/database` books. The reference beginners keep reaching for.
- **"Meet the Sounds" primer** (`/learn/sounds`) — a 3-step intro for absolute beginners: the **5 vowels** with their pronunciation anchors (from `/database`), then how every other kana is just a **consonant + a vowel** (the k-row falls out of "k + あいうえお"), then off to the path. A **"New here? Meet the sounds" card** appears on the dashboard while you've met fewer than 5 kana, and hides once you're rolling.
- **Settings** (`/settings`, from the profile) — **theme** (light / dark / system), **daily goal**, **sound effects** on/off, and **pronunciation speed** (Normal / Slow, with a test button — handy for beginners who want kana spoken slower), plus a note that motion follows the device's Reduce-Motion setting, and Reset. Sound prefs are saved and applied to the audio engine via a small `AudioSync` at the app root.
- **"Your Journey" view** (`/journey`, from the profile) — the insights the profile didn't cover: per-script **progress bars** (Hiragana/Katakana met out of 46), overall **accuracy** (correct ÷ answers), **mastered** and **due-now** counts, and a **"focus on these next"** list of your lowest-mastery kana with a one-tap **"Drill your weakest"** into Free Drill.

---

## [0.10.0] - 2026-07-15

**Phase 2 — Free Drill.** MARU-style free practice, outside the learning path.

### Added

- **Free Drill** (`/learn/drill`, from a dashboard card) — pick any gojūon rows of Hiragana or Katakana and train just those, independent of the winding path. Each row card shows a **mastery bar** and how many of its kana you've met, so you can see at a glance what needs work; an **"⚠️ Weakest"** preset auto-selects your lowest rows (plus "All rows" / "Clear").
- **SRS-guided sessions** — a drill prioritizes the **weakest kana** in your selection and caps each round to 12, so even "All rows" becomes a focused session on what you need most. Answers feed the same XP + per-kana mastery + daily-quest pipeline, and the row bars update as you improve.
- `src/lib/drill.ts` (row grouping, row-mastery summary, weakest-row + session selection) with unit tests — 43 total.

### Notes

- Free Drill reuses the existing exercise engine (Quick Match + Kana Drill) over your chosen kana — no new learning content, so it stays within the `/database` rule.

---

## [0.9.1] - 2026-07-15

**Phase 2 — Audio fix.** Speech that failed silently now works more often, and fails honestly when it can't.

### Fixed

- **Japanese pronunciation was silent for some browsers.** `ttsAvailable()` only checked that the Speech API *existed*, not that any voice was installed — so a voice-less browser showed the Ear Training game and Listen buttons but every `speak()` failed with `synthesis-failed` (silence). Speech now:
  - **Waits for the voice list to load** before the first utterance (`getVoices()` is empty on the first call in Chrome/Edge, so early calls — like Ear Training speaking on mount — were being dropped),
  - **resumes a spontaneously-paused synth** and only cancels when something is actually queued (a known Chrome quirk that swallowed utterances), and
  - **prefers a Japanese voice**, falling back to the `ja-JP` language hint.
- **Honest fallback when no _Japanese_ voice exists.** The check now requires an installed **Japanese** voice — a browser with only English voices (which still plays general audio + SFX) was slipping through as "ready" and then staying silent on Japanese text. Ear Training now shows a clear "no Japanese voice" message (with a tip and a note that general audio is separate), and the Listen buttons show a muted "No audio" chip instead of doing nothing. Detection waits for voices to load so it doesn't false-trigger.



**Phase 2 — Hoshi's Shop.** A two-currency economy with real ways to spend.

### Added

- **Second currency — Coins 🪙** — earned from every correct answer across games, lessons, and practice, alongside the existing **Gems 💎** (from finishing lessons and claiming quests). The header now shows both.
- **Hoshi's Shop** (`/learn/shop`) — reachable from the header and a dashboard card, with **three kinds of sink**:
  - **Hoshi cosmetics** — hats, face, and neck items you buy and **equip**; equipped pieces render right on the mascot (shown on the shop hero and your profile).
  - **Streak Freeze** — banked (up to 3) and **auto-spent to bridge a single missed day** so your streak survives.
  - **XP Boost** — 15 minutes of **double XP**, applied in the store's XP math and shown as a live countdown.
- 13 launch items across Boosts & Protection, Hats, Face, and Neck, priced in whichever currency fits. Purchases validate affordability, ownership, freeze cap, and active-boost state; the profile gains Coins + Freezes stats and shows Hoshi in their current outfit.
- Unit tests for the catalog and the economy (coin earning, buy/deny, equip toggle, streak-freeze bridging, XP-boost doubling) — 39 total.

### Notes

- Cosmetics and boosts are pure mascot/UI + gamification — no learning content — so the shop is **not** content-gated.

---

## [0.8.0] - 2026-07-15

**Phase 2 — Romaji Rush.** The fifth game mode: a tap-based speed round.

### Added

- **Romaji Rush** — a 60-second rush that mixes both directions (see a kana, tap its reading; or see a reading, tap the kana) with a live score, a combo multiplier, and a depleting timer that flushes red in the final seconds. It's fully tap-driven (no typing), so it plays great on phones, and every answer feeds XP + mastery into the SRS and counts toward your daily quests. Launchable per track from the dashboard, where it now headlines the games grid.

---

## [0.7.0] - 2026-07-15

**Phase 2 — Daily Quests.** A motivation loop over the games and lessons you already have.

### Added

- **Daily Quests** — a three-quest board on the dashboard (reach your daily goal, nail N correct answers, earn N XP) that refreshes each day. The set rotates deterministically by the day, tracks your real activity from every game and lesson, and each completed quest is **claimable for gems** with a satisfying reward. Quests reset at your local midnight and read correctly across day boundaries.
- Store support: day-scoped `dailyCorrect` counter and `claimedQuests`, a consolidated daily-rollover helper, a `claimQuest` action, and read-time selectors — with unit tests for quest rotation, completion, and claim idempotency (30 tests total).

### Notes

- Quests are pure gamification over **existing** activity (today's XP + correct answers); no new learning content, so this stays within the `/database` content-gating rule.

---

## [0.6.1] - 2026-07-14

**Phase 2 — polish pass.** An adversarial review of the whole learning app, then the real fixes: correctness, hydration, mobile, and accessibility.

### Fixed

- **Daily rollover math** — the streak and daily-goal ring now turn over at the player's **local** midnight (was UTC, so they reset mid-afternoon for many timezones) and are derived at read time: a broken streak no longer keeps showing the old flame, and yesterday's XP no longer counts toward today's goal before you've practised.
- **Hydration** — the screens that render randomized content (Ear Training, Word Builder, and review lessons) no longer mismatch between server and client on first load; the randomized round is gated behind mount, matching the rest of the app.
- **Ear Training replay** — "Play again" no longer reports cumulative XP from earlier games.

### Added / Changed

- **Kana Rain on touch** — phones now get a **tap keypad** (the readings of the falling kana) instead of being forced to type into a timed game behind the soft keyboard; keyboard players keep the text input.
- **Reduced motion** — Kana Rain (a JS animation that bypassed the global reduced-motion handling) now honors `prefers-reduced-motion` with a gentle, constant pace.

### Accessibility

- Right/wrong feedback in **Ear Training** and **Word Builder** now includes text ("Correct!" / "It was あ = a"), not colour alone.
- Onboarding reason/goal choices expose `aria-pressed`; profile mastery cells announce their level to assistive tech; game/lesson exit buttons meet the 44px touch-target size.
- The Japanese TTS voice is cached and refreshed on `voiceschanged`, so it's picked reliably after the first utterance.

---

## [0.6.0] - 2026-07-14

**Phase 2 — Learning platform (milestone 4).** Two more game modes.

### Added

- **Ear Training** — hear a kana (Web Speech TTS) and pick it from four options; feeds XP + mastery. Falls back gracefully when speech audio is unavailable.
- **Word Builder** — read real Japanese words (from the `/database` reading pages, e.g. あお = blue, くうき = air) and pick the meaning: the "you can already read Japanese!" moment, with a hear-it button.
- The dashboard now offers all four games (Kana Rain, Kana Match, Ear Training, Word Builder) plus the Practice hub.

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

[Unreleased]: https://github.com/japalingo/japalingo/compare/v0.11.0...HEAD
[0.11.0]: https://github.com/japalingo/japalingo/compare/v0.10.0...v0.11.0
[0.10.0]: https://github.com/japalingo/japalingo/compare/v0.9.1...v0.10.0
[0.9.1]: https://github.com/japalingo/japalingo/compare/v0.9.0...v0.9.1
[0.9.0]: https://github.com/japalingo/japalingo/compare/v0.8.0...v0.9.0
[0.8.0]: https://github.com/japalingo/japalingo/compare/v0.7.0...v0.8.0
[0.7.0]: https://github.com/japalingo/japalingo/compare/v0.6.1...v0.7.0
[0.6.1]: https://github.com/japalingo/japalingo/compare/v0.6.0...v0.6.1
[0.6.0]: https://github.com/japalingo/japalingo/compare/v0.5.0...v0.6.0
[0.5.0]: https://github.com/japalingo/japalingo/compare/v0.4.0...v0.5.0
[0.4.0]: https://github.com/japalingo/japalingo/compare/v0.3.0...v0.4.0
[0.3.0]: https://github.com/japalingo/japalingo/compare/v0.2.0...v0.3.0
[0.2.0]: https://github.com/japalingo/japalingo/compare/v0.1.0...v0.2.0
[0.1.0]: https://github.com/japalingo/japalingo/releases/tag/v0.1.0
