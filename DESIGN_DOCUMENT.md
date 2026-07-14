# Japalingo — Design Document

> The design bible for **Japalingo** — *"Learn to read Japanese — the fun way."* A playful, gamified web app that teaches Hiragana & Katakana through mnemonics, mini-games, spaced repetition, and a shiba named **Hoshi**. Light-mode-first, bold, cute, motivating.

**Companion docs:** [`ARCHITECTURE.md`](./ARCHITECTURE.md) (engineering), [`GAME_MODES.md`](./GAME_MODES.md) (learning games), [`CONTENT_MODEL.md`](./CONTENT_MODEL.md) (data), [`ROADMAP.md`](./ROADMAP.md) (phasing), [`CLAUDE.md`](./CLAUDE.md) (agent guide).

**All learning content is sourced only from `/database`** (the two Tofugu books). This doc governs *how it looks and feels*, not *what facts we teach*.

---

## 1. Vision & Product Principles

Japalingo's north star: **the learner genuinely wants to come back tomorrow.** Everything below serves that.

| Principle | What it means in practice |
| --- | --- |
| **Motivation first** | Every screen is designed to make the *next* action irresistible. We reward effort, celebrate wins loudly, and never punish. |
| **Learning that sticks** | Mnemonics (from Tofugu) + spaced repetition (SRS) + multiple recall angles. We optimize for *remembering*, not just exposure. |
| **Delight in every tap** | Springy motion, satisfying sounds, a mascot with feelings. Micro-joy compounds into a habit. |
| **Never punishing** | No lives that block learning, no shaming. A wrong answer is a gentle "try again," an instant re-teach, and a chance to recover. |
| **Playful, not childish** | Bold, cute, and colorful — but clean, modern, and respectful of an adult learner's time. |
| **One kana, many angles** | The same character is met through story, drill, quiz, memory, typing, listening, tracing, and arcade play. Variety kills boredom and deepens memory. |
| **Fast & offline** | Progress is local; the app is quick and works without an account. Zero friction to start. |

**Anti-goals:** no dark patterns, no pay-to-progress, no guilt-tripping notifications, no clutter, no walls of text.

---

## 2. Target User & Jobs-To-Be-Done

**Who:** absolute beginners who can't read any Japanese yet, plus "resetters" who half-learned kana and want a fun, structured way to lock it in.

**Motivations (asked in onboarding):** anime & manga, travel to Japan, heritage/family, gaming, "train my brain," or a step toward serious study.

**Core jobs:**
- *"Help me start reading Japanese without it feeling like homework."*
- *"Make me actually remember these characters, not just recognize them once."*
- *"Give me a reason to keep going every day."*
- *"Let me practice in short, fun bursts on any device."*

---

## 3. Brand Identity

- **Name:** Japalingo
- **Tagline:** *Learn to read Japanese — the fun way.*
- **Landing headline:** **Master Japanese kana. Actually remember them.**
- **Landing subhead:** *Free, playful, and scientifically-backed. Learn every hiragana & katakana with mnemonics, mini-games, and a shiba who believes in you.*

### Voice & tone
Warm, encouraging, playful, a little cheeky — like a fun friend who happens to be a great tutor. Short sentences. Second person. Emoji used sparingly for punch, never as decoration spam.

**Microcopy examples:**
- Correct: *"よし! Nailed it."* / *"That's the one. Hoshi's proud."*
- Wrong (gentle): *"So close — this one's し (shi). Let's meet it again."*
- Streak nudge: *"🔥 10-day streak. Don't leave Hoshi hanging — 3 minutes today?"*
- Empty state: *"No kana due right now. You're ahead of the game. Wanna get playful anyway?"*
- Level up: *"NEW RANK: Kana Apprentice. You're officially reading Japanese."*

---

## 4. Mascot — Hoshi the Shiba Inu

**Hoshi** (星, "star") is a round, cream-and-tan Shiba Inu with a curly tail, big friendly eyes, and huge expressiveness. Hoshi is the emotional stake: a companion who celebrates with you, believes in you, and misses you when you're gone.

**Personality:** upbeat, loyal, a bit of a goofball, endlessly supportive. Never condescending, never sad-guilt-trips you (worry, not shame).

**Expression set (design + animate all of these):**

| State | When it shows |
| --- | --- |
| Idle / happy | Default, waiting on the path |
| Waving | Onboarding welcome, greetings |
| Thinking | While a question is on screen |
| Cheering-combo | Streaks & combos mid-game |
| Celebrating (confetti) | Lesson complete, level up, badge earned |
| Worried | About to break a streak / long absence (gentle, not shaming) |
| Sleeping | Inactive/empty states |
| Level-up | Rank-up moment (with sparkle burst) |

**Leveling & cosmetics:** Hoshi visibly "levels up" with the user and can wear cosmetics (headbands, scarves, seasonal hats) bought with **Gems**. This is a light collection loop — a reason to earn, never a paywall.

**Do:** keep Hoshi reactive to real events; use the 3D Hoshi as the landing hero; let Hoshi coach the first lesson. **Don't:** spam Hoshi into every corner, use Hoshi to guilt the user, or animate Hoshi during focused reading tasks where it distracts.

> Hoshi (Shiba Inu) is the recommended default identity; it can be swapped per [`OPEN_QUESTIONS.md`](./OPEN_QUESTIONS.md) without changing this system.

---

## 5. Design Tokens

All values live in `src/styles/tokens.css` as CSS custom properties and are consumed through Tailwind theme + components. **Never hardcode hex in components** — theming (light/dark) depends on tokens.

### 5.1 Color

| Token | Hex | Usage |
| --- | --- | --- |
| `--color-primary` | `#5B5BF6` | Brand "Ai" indigo — primary CTAs, links, active path node, focus rings |
| `--color-primary-strong` | `#4642D6` | Primary hover/pressed |
| `--color-primary-tint` | `#EEEEFF` | Primary-tinted backgrounds, selected chips |
| `--color-secondary` | `#FF5C9D` | Sakura pink — streaks, highlights, secondary buttons |
| `--color-secondary-tint` | `#FFE9F2` | Sakura-tinted surfaces |
| `--color-accent` | `#FFC53D` | Gold — XP, coins/gems, achievements |
| `--color-accent-strong` | `#F5A623` | Deep gold (borders/shadows on gold) |
| `--color-success` | `#3FC77A` | Correct answers, positive feedback |
| `--color-error` | `#FF5470` | Coral red — wrong answers (gentle, never harsh) |
| `--color-info` | `#38BDF8` | Sky — audio/listen buttons, info |
| `--color-ink` | `#2A2A4A` | Primary text (soft near-black indigo, never pure `#000`) |
| `--color-muted` | `#6E6E8F` | Secondary text, captions |
| `--color-border` | `#E9E9F3` | Card & input borders, dividers |
| `--color-surface` | `#FFFFFF` | Cards, sheets |
| `--color-bg` | `#F7F7FD` | App background (warm off-white) |

**Dark mode (optional, `[data-theme="dark"]`):** `--color-bg #12122A`, `--color-surface #1C1C3A`, `--color-border #2E2E52`, `--color-ink #EDEDFF`, `--color-muted #A0A0C8`; accent hues brightened ~8%. Semantic roles stay identical so components are theme-agnostic.

**Semantic usage rule:** Indigo = *do this*. Sakura = *streaks & delight*. Gold = *reward*. Green/Red = *answer verdict only*. Sky = *audio*. This keeps color meaningful, not decorative.

### 5.2 Typography (sans-serif only, self-hosted — no external CDN)

| Role | Font | Weights | Notes |
| --- | --- | --- | --- |
| Display / headings / buttons | **Fredoka** | 500, 600, 700 | Rounded, bold, playful — the Japalingo "voice" |
| Body / UI | **Nunito** | 400, 600, 700, 800 | Clean, friendly, highly legible |
| Japanese & big kana | **M PLUS Rounded 1c** | 400, 500, 700, 800 | Rounded Japanese face; matches the playful tone. Fallback: Noto Sans JP |

**Type scale** (fluid; rem at 16px base):

| Token | Size | Use |
| --- | --- | --- |
| `display-xl` | 3.5–4.5rem | Landing hero |
| `display` | 2.5–3rem | Section headers |
| `h1` | 2rem | Page titles |
| `h2` | 1.5rem | Card/section titles |
| `body` | 1rem | Default text |
| `small` | 0.875rem | Captions, meta |
| `kana-hero` | 6–9rem | The kana as the star of a lesson/game screen |
| `kana-lg` | 3–4rem | Kana in cards, choices |

The kana is almost always the largest, boldest element on a learning screen — it is the hero.

### 5.3 Spacing, radius, elevation

- **Spacing scale (px):** 4, 8, 12, 16, 24, 32, 48, 64. Generous whitespace; screens breathe.
- **Radius:** `sm 10px`, `md 16px`, `lg 24px`, `xl 32px`, `pill 999px`. Everything is *round* — cards, buttons, chips, avatars.
- **Shadow / elevation:** soft, low-spread, tinted with indigo (`rgba(43,43,74,.10)`), not gray. `e1` cards, `e2` popovers/sheets, `e3` modals.

### 5.4 The signature "chunky button"

The Japalingo button is tactile and toy-like (a hallmark of the genre):

- Filled body in the semantic color, **thick bottom "shadow-lip"** in a darker shade (e.g. primary `#5B5BF6` body over `#4642D6` lip, ~4px).
- Bold Fredoka label, generous padding, `pill`/`lg` radius.
- **Press:** translate down by the lip height + shrink the lip to 0 → a satisfying "clunk." Springy release.
- Variants: `primary`, `secondary` (sakura), `gold` (rewards), `ghost` (bordered/transparent), `success`/`danger` (feedback contexts). Sizes `sm/md/lg`. Disabled = desaturated, no lip.
- Always ≥ 44px tall for touch; visible focus ring (`--color-primary`, 3px, offset).

---

## 6. Motion & 3D

Motion is a feature, not decoration — it makes the app *feel alive and rewarding*. Library: **Framer Motion** for UI; **react-three-fiber + drei** for 3D.

### 6.1 UI motion principles
- **Springy, not linear.** Buttons, cards, and path nodes ease with gentle overshoot.
- **Correct = celebrate.** Green pop, confetti burst, Hoshi cheer, upbeat SFX.
- **Wrong = gentle.** A soft horizontal shake, coral flash, calm re-teach. Never a jarring buzzer.
- **Continuity.** Screen transitions slide/scale with shared elements (the kana card carries between steps).
- **Micro-interactions everywhere.** Hover lifts, tap scales, XP counters roll up, the streak flame flickers.

### 6.2 3D / WebGL usage
- **Landing hero:** a 3D Hoshi in a soft, floating scene — drifting kana glyphs, sakura petals, a stylized torii, gentle parallax on scroll/pointer. This is the "wow" moment (à la Duolingo's animated hero).
- **Celebration bursts:** level-ups and big milestones can pop lightweight 3D confetti/particles.
- **Ambient (optional):** subtle depth on the path background.

### 6.3 Guardrails (non-negotiable)
- **`prefers-reduced-motion`:** disable parallax, confetti, and looping 3D; swap to a static Hoshi illustration and instant transitions.
- **Performance budget:** 3D is code-split and lazy-loaded; the landing hero must not block first paint. Target 60fps on mid-range laptops; a low-power fallback renders a static hero. The app (dashboard/lessons) works fully without any 3D.

---

## 7. Core UI Components

| Component | Look & states |
| --- | --- |
| **Button** | The chunky button (§5.4). Variants + sizes, loading, disabled, icon. |
| **Card / Sheet** | White surface, `lg` radius, soft indigo shadow, thick friendly border optional. Bottom-sheet variant on mobile. |
| **Path node** | Big circular node on the winding path: states = locked (gray), available (pulsing indigo), in-progress (partial crown ring), complete (gold crown), checkpoint (special/legendary look). |
| **Progress ring** | Daily-goal ring (gold fill on track) around the streak/goal widget; also per-lesson progress. |
| **Answer-feedback bar** | Bottom bar that turns green (correct) or coral (wrong) with the correct reading + a "Continue" chunky button; wrong shows the mnemonic hint. |
| **Choice chip / tile** | Large tappable kana/romaji options; hover lift, selected = primary tint + border, correct/wrong flashes. |
| **XP & streak counters** | Gold XP bolt with roll-up animation; sakura streak flame with day count. |
| **Crown badge** | 0–5 crown mastery indicator on kana, lessons, and units. |
| **Achievement/badge** | Collectible medal with locked/unlocked + progress. |
| **Toast / snackbar** | Non-blocking rewards ("+15 XP", "Streak saved!"). |
| **Modal** | Celebrations, streak-freeze offers, settings — dimmed backdrop, springy entrance. |
| **Hoshi reaction slot** | A consistent corner/area where Hoshi reacts to events. |

---

## 8. Screen-by-Screen UX

### 8.1 Landing page (`/`) — marketing
1. **Hero** — 3D Hoshi scene, headline + subhead (§3), primary CTA **"Start learning — it's free"**, secondary "I already know some kana." Trust line: "No account needed. Works offline."
2. **How it works** — 3 playful steps: *Meet a kana → Play to remember it → Keep your streak.*
3. **Feature blocks** — mnemonics that stick; multiple game modes; spaced repetition that schedules your reviews; a mascot who cheers you on. Each with a small animated illustration.
4. **Game showcase** — a carousel/grid previewing modes (Kana Rain, Kana Match, Ear Training, Word Builder…) with looping mini-previews.
5. **"You'll be reading real words" moment** — show あお = *blue*, いえ = *house* (from the books) to prove fast payoff.
6. **Final CTA band** — big Hoshi, restate the promise, one chunky CTA.
7. **Footer** — links (About, Roadmap, GitHub, Credits to Tofugu), light/dark toggle, language switch (EN/DE-ready).

Responsive, light/dark, reduced-motion aware; hero degrades to a static illustration on low-power/reduced-motion.

### 8.2 Dashboard / Learn path (`/learn`) — the home base
- **Center:** the **winding node path** (Duolingo-style) of the active track (Hiragana → Katakana). Unit header banners separate sections; the current node pulses; completed nodes show gold crowns. Tapping a node opens its lesson preview → Start.
- **Right rail (desktop) / top strip (mobile):** streak flame + count, daily-goal ring, gems, current rank, and **Daily Quests** (2–3). A "Practice" shortcut surfaces when SRS reviews are due.
- **Hoshi** sits along the path, reacting to progress.
- Track switcher (Hiragana / Katakana) and a jump-to-current control.

### 8.3 Lesson player (`/lesson/[id]`)
A short, focused pipeline:
1. **Intro** — for any new kana: **Mnemonic Story** (kana hero + Tofugu mnemonic + image idea + animated stroke order).
2. **Exercises** — a mix of the lesson's game modes (Quick Match, Kana Match, Ear Training, Romaji Rush, etc.), interleaving new + review kana. A slim top progress bar; the kana is the hero; the answer-feedback bar handles verdicts.
3. **Results / celebration** — XP earned (roll-up), crowns gained, streak/goal progress, Hoshi celebrating, quest ticks. One chunky **Continue**. Perfect lessons get extra flair.

Exit is always safe (progress saved); wrong answers re-teach instantly and re-queue the kana.

### 8.4 Practice / Review hub (`/practice`) — "the Camp"
The SRS home. Shows **kana due today**, weak/low-mastery kana, and mixed review sessions. Big "Start review" CTA sized by how much is due. Filters by track / unit / mastery. This is where spaced repetition keeps old kana from rotting — framed as a quick, satisfying tune-up, not a chore.

### 8.5 Games arcade (`/games`, `/games/[mode]`)
A playful picker of every unlocked mode (cards with mascot art + "best score"). Choosing a mode opens a setup (track / unit / mastery / length / timed) then the game frame. Arcade play still earns XP and feeds SRS, so "just playing" is real practice. Signature **Kana Rain** is featured.

### 8.6 Profile (`/profile`)
Stats (streak, total XP, rank, kana mastered, crowns), the **badge/achievement** shelf, Hoshi with equipped cosmetics, and per-track mastery grids (a kana chart colored by mastery). Motivational, shareable feel. (Friends/leagues are designed-later.)

### 8.7 Settings (`/settings`)
Theme (light/dark/system), language (EN, DE-ready), audio (voice, rate, SFX on/off), motion (reduced), daily goal, local reminder opt-in, and data controls (export/reset local progress). Privacy note: everything stays on-device.

---

## 9. Onboarding (first Dashboard visit)

Must be **highly motivating**, skippable, and replayable. Six quick steps (Duolingo-style):

1. **Welcome** — Hoshi waves; one-line promise: *"I'm Hoshi. Let's get you reading Japanese — for real, and for fun."*
2. **Why are you learning?** — anime/travel/heritage/gaming/brain/serious-study. Tailors encouragement copy; makes it personal.
3. **How much do you know?** — *Complete beginner* / *Some hiragana* / *Both kana*. Optional **60-second placement quiz** to skip ahead.
4. **Set your daily goal** — Casual (5 XP) / Regular (10) / Serious (15) / Intense (20), previewed with the daily-goal ring. Frames the habit immediately.
5. **Make it yours** — pick a name, an optional local daily reminder, and a starter Hoshi cosmetic (tiny delight, instant investment).
6. **Guided first lesson** — drop onto the path with lesson 1 pulsing; Hoshi coaches the first few answers and celebrates hard. The user should finish onboarding having *already learned their first kana*.

Completion is stored locally; re-engagement hooks (streak, daily goal, quests) are live from minute one.

---

## 10. Gamification & Motivation

The engagement engine. Numbers are tunable in the gamification store; **ratios matter more than absolutes** (this section is the source of truth referenced by [`GAME_MODES.md`](./GAME_MODES.md)).

### 10.1 XP economy
- **+2 XP** per correct answer (baseline).
- **+1** first-try / speed bonus (timed or first-attempt correct).
- **+3 XP** for high-value production/application answers (e.g. Stroke Master character, Word Builder word).
- **+5** round complete, **+5** more for a perfect round.
- **Combo multiplier:** a hot streak scales XP (~×1.1 per 5-in-a-row, capped) so momentum feels great. A wrong answer breaks the combo, **never** deducts XP.

XP drives **rank/level** (fun rank names, e.g. *Kana Sprout → Apprentice → Reader → Kana Master*), the **daily goal**, and future **leagues**.

### 10.2 Streaks
Daily streak with a sakura flame + day count. **Streak Freeze** (buyable with gems) protects a missed day. Nudges are warm ("Hoshi's waiting — 3 minutes keeps your 🔥 alive"), never shaming. Milestones (7/14/30/100 days) get celebration + badges.

### 10.3 Daily goal & daily quests
- **Daily goal** ring (chosen in onboarding) — the day's primary target; completing it pops confetti + Hoshi.
- **Daily quests** — 2–3 rotating (e.g. *Earn 30 XP*, *Play Kana Rain once*, *Hit 90% in 3 lessons*), each granting gems/XP. Fresh reasons to return daily.

### 10.4 Gems / coins
Earned from lessons, goals, and quests. Spent on **Streak Freezes** and **Hoshi cosmetics**. No paywalls — gems are a reward loop, not a currency to buy progress.

### 10.5 Mastery crowns & SRS
Each kana has **0–5 crowns** (mastery). Lessons and units aggregate crown progress; the SRS scheduler (see `ARCHITECTURE.md`) decides when a kana is "due," powering the Practice hub. Crowns are the visible sense of *"I truly know this."*

### 10.6 Achievements / badges
Collectible medals: *Vowel Voyager*, *Dakuten Master*, *Speed Demon (Kana Rain)*, *7-Day Streak*, *Kana Complete*, etc. Locked badges show progress to pull the user forward.

### 10.7 Leagues (designed now, built later)
Weekly leaderboards by XP are part of the long-term motivation design but require a backend/accounts, so Phase 2 ships a **local personal-best** stand-in instead. See [`ROADMAP.md`](./ROADMAP.md).

---

## 11. Accessibility

Accessibility is part of "never punishing" — everyone should feel capable.

- **Contrast:** meet WCAG AA for text and UI; verify token pairings (ink on bg/surface, white on primary/secondary).
- **Keyboard:** full keyboard play (choices, typing modes, navigation); visible focus rings on every interactive element.
- **Screen readers:** kana carry `aria-label`s with the reading; audio buttons are labeled; feedback is announced via live regions.
- **Motion:** honor `prefers-reduced-motion` (see §6.3).
- **Readability:** generous target sizes (≥44px), large kana, optional dyslexia-friendly toggle; never rely on color alone for correctness (pair with icon + text).
- **Audio:** never the *only* channel — everything spoken is also shown.

---

## 12. Responsive & Theming

- **Mobile-first.** The learning experience is designed for phones (thumb-reachable chunky buttons, bottom sheets, top status strip) and scales up to a two-column desktop (path + right rail).
- **Breakpoints (guideline):** `sm 640`, `md 768`, `lg 1024`, `xl 1280`. The path centers with a rail appearing at `lg+`.
- **Theming:** light-mode-first with an optional dark mode. Both are driven entirely by the CSS-variable tokens (§5) toggled via `data-theme` on the root, so **components never branch on theme** — they consume semantic tokens. `system` follows the OS.
- **No horizontal scroll**, ever; wide content (kana grids, game boards) scrolls within its own container.

---

*This document defines the look, feel, and motivation systems of Japalingo. Content facts come exclusively from `/database` per the governance rule in [`CLAUDE.md`](./CLAUDE.md) and [`CONTENT_MODEL.md`](./CONTENT_MODEL.md).*
