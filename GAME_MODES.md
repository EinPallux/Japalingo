# GAME_MODES.md — Learning & Game Modes for Japalingo

> Every kana, learned from many angles. This document specs all **10** learning and game
> modes: the skills each trains, how a round plays out, how it scores XP and feeds the SRS,
> and how any mode plugs into the lesson pipeline and games arcade through one shared
> `GameMode` contract.
>
> **Governance:** all learning content (kana, mnemonics, example words, stroke order) comes
> **only** from `/database` — the two Tofugu books. No mode invents kana facts. See
> `CLAUDE.md` §2 and `CONTENT_MODEL.md`.

---

## 1. Philosophy — same content, many angles

Kana mastery is not one skill; it is a small bundle of related skills that each need their own
reps. Reading あ off a page and *producing* あ from the sound "a" are different tasks, and both
differ again from *writing* あ stroke by stroke. Japalingo's answer to "how do I actually
remember these?" is **variety of retrieval**: hit the *same* kana through recognition, recall,
production, and speed until it is automatic from every direction.

The angles every mode maps to:

| Angle | Direction | Question the player answers | Modes that train it |
|-------|-----------|-----------------------------|---------------------|
| **Recognition** | kana → sound | "What sound is this shape?" | Mnemonic Story, Kana Drill, Quick Match, Kana Match |
| **Recall** | sound → kana | "Which shape makes this sound?" | Romaji Rush, Ear Training, Kana Rain, Quick Match (reverse) |
| **Production** | intent → written kana | "Can I write it, correct strokes?" | Stroke Master |
| **Application / meaning** | kana → real words | "Can I read actual Japanese?" | Word Builder |
| **Speed / automaticity** *(cross-cutting)* | fast recall under pressure | "Can I do it without thinking?" | Kana Rain, Kana Sprint, timed Quick Match / Romaji Rush |

Principles shared by every mode:

- **Motivation first, never punishing.** Wrong answers teach — a gentle shake, the correct
  reading revealed, and a chance to move on. No hearts or lives block learning (CANON §6).
- **Both scripts.** Every mode runs on hiragana **and** katakana, across every category
  (basic, dakuten, handakuten, yōon, extended, special).
- **Filterable.** Each round is built from a kana set filtered by **unit** and/or **mastery** —
  so one mode serves a first lesson, a targeted review, or an all-kana challenge.
- **Feeds the system.** Every answer emits an XP delta and an SRS/mastery signal. Games are
  not side content; they *are* the study loop.
- **Audio-aware.** All modes can speak the kana via `AudioService` (TTS). Ear Training
  *depends* on it; the rest use it for reinforcement on reveal.

---

## 2. Mode summary

| # | Mode | Skill(s) trained | Input type | Phase 2 |
|---|------|------------------|-----------|---------|
| 1 | **Mnemonic Story** | Recognition (teaching intro) | Tap / continue | **SHIP (core)** |
| 2 | **Kana Drill** | Recognition + Recall | Self-rating buttons | **SHIP (core)** |
| 3 | **Quick Match** | Recognition + Recall (reverse) | Tap choice (timed opt.) | **SHIP (core)** |
| 4 | **Kana Match** | Recognition | Tap pairs (grid) | **SHIP (core)** |
| 5 | **Romaji Rush** | Recall | Keyboard (type romaji) | **SHIP (core)** |
| 6 | **Ear Training (Kiku)** | Listening + Recall | Tap / type (audio-led) | **SHIP (core)** |
| 7 | **Stroke Master (Kaki)** | Production (writing) | Canvas / pointer trace | Stretch / fast-follow |
| 8 | **Kana Rain** | Recall + Speed | Keyboard (type romaji) | **SHIP (core, signature)** |
| 9 | **Word Builder (Kotoba)** | Application / meaning | Tap + arrange / type | **SHIP (core)** |
| 10 | **Kana Sprint** | Recall + Speed | Mixed (type / tap) | Stretch / fast-follow |

**Ship set (Phase 2 core):** Mnemonic Story, Kana Drill, Quick Match, Kana Match, Ear Training,
Romaji Rush, **Kana Rain**, **Word Builder**.
**Phase 2 stretch / early fast-follow:** Stroke Master, Kana Sprint. The roadmap makes the split
explicit (`ROADMAP.md`).

---

## 3. Mode specifications

Each mode follows one template: Purpose · Skills · Mechanics & round flow · Scoring & XP ·
Difficulty & adaptivity (SRS) · Feedback & celebration · Data requirements · Accessibility ·
Ship status.

> **XP baseline:** unless noted, a correct answer awards **+2 XP**, a first-try correct adds a
> small **+1** speed/accuracy bonus, a completed round adds **+5**, and a perfect round adds
> **+5** more. Numbers are tunable in the gamification store; ratios matter more than absolutes
> (`DESIGN_DOCUMENT.md` §gamification).

---

### 3.1 Mnemonic Story

- **Purpose.** The teaching step for *new* kana: introduces a kana by shape, sound, the book's
  mnemonic, a supplemental image idea, and an animated stroke-order walkthrough — the "aha,
  that's why it looks like that" moment before any quizzing.
- **Skill(s).** Recognition (kana → sound), first exposure; seeds production via stroke preview.
- **Mechanics & round flow.**
  1. Big kana in **M PLUS Rounded 1c** fills the hero; the app speaks it (TTS).
  2. **Pronunciation:** reading + primary romaji + the book's English anchor (か "ka" — like the
     *ca* in *car*).
  3. **Mnemonic** card: the real Tofugu mnemonic (き = "looks like a **key**"; か = "a
     **mosquito** — mosquito = *ka*") with the `mnemonicImageIdea` illustrated.
  4. **Stroke order** animates on tap (left→right, top→bottom) with replay; katakana screens note
     the conversion mnemonic where relevant (K→G "car → guard rail", etc.).
  5. Hoshi reacts, then a chunky **"Got it!"** button advances.
- **Scoring & XP.** No quiz scoring. Completing grants **+3 XP** and marks the kana
  **introduced** (mastery 0 → SRS-eligible on first correct quiz).
- **Difficulty & adaptivity (SRS).** No difficulty; it **primes** SRS by registering each new
  kana so downstream modes can schedule it. Can resurface a mnemonic as a hint for struggling
  items (mastery ≤ 1).
- **Feedback & celebration.** Warm, low-stakes — Hoshi encouragement, soft chime on reveal.
  Nothing to fail.
- **Data requirements.** `char`, `romaji`, `altRomaji`, `pronunciationHint`, `mnemonic`,
  `mnemonicImageIdea`, `strokeOrder`, `strokeCount`, `type`; `baseKanaId`/`comboParts` for the
  derivation/conversion story.
- **Accessibility.** Stroke animation respects `prefers-reduced-motion` (numbered static diagram
  fallback). Mnemonic is real text, not baked into an image. Audio button keyboard-focusable.
- **Ship status.** **Phase 2 core.**

---

### 3.2 Kana Drill

- **Purpose.** The core self-study loop — Anki/MARU-style SRS flashcards; the backbone of the
  `/practice` review hub. Show a kana, recall the reading, reveal, self-rate.
- **Skill(s).** Recognition + Recall (reveal runs either direction: kana→reading or reading→kana).
- **Mechanics & round flow.**
  1. Card shows the prompt side (kana, or romaji in reverse mode); player recalls silently.
  2. Tap **"Show answer"** — card flips springily, TTS speaks it, mnemonic available as a hint.
  3. Player **self-rates**: **Again · Hard · Good · Easy** (Leitner/SM-2-lite buckets).
  4. Rating updates the SRS interval + next-due date; the next due card appears.
  5. Round ends after N cards or when the due queue empties.
- **Scoring & XP.** **+2 XP** for Good/Easy, **+1** for Hard, **0** for Again (no penalty).
  **+5** completion. Self-ratings are cross-checked against objective modes to correct
  over-generous scoring.
- **Difficulty & adaptivity (SRS).** This mode *is* the SRS surface: **pulls due items** first,
  backfills with lowest-mastery kana, and **writes mastery** directly (Again resets, Easy jumps
  forward). Filterable by unit/mastery for targeted decks.
- **Feedback & celebration.** Calm, focused. A Good/Easy streak triggers a subtle combo shimmer;
  end-of-deck shows "X reviewed, Y due tomorrow" with Hoshi cheering.
- **Data requirements.** `char`, `romaji`, `altRomaji`, `pronunciationHint`, `mnemonic`, `type`,
  plus live `KanaProgress` (interval, ease, due date, mastery).
- **Accessibility.** Fully keyboard-driven (Space = reveal, 1–4 = rate); reduced-motion crossfade
  instead of flip; large high-contrast prompt text.
- **Ship status.** **Phase 2 core** (engine behind `/practice`).

---

### 3.3 Quick Match

- **Purpose.** Fast multiple-choice recognition/recall: see a kana → pick its romaji from 4; or
  reverse — see/hear romaji → pick the kana. The most versatile lesson-filler exercise.
- **Skill(s).** Recognition (kana→romaji) and Recall (romaji→kana, reverse mode).
- **Mechanics & round flow.**
  1. Prompt appears (kana or romaji) with **4 answer tiles**.
  2. **Smart distractors** from the same row/column or visually confusable kana (シ/ツ, ソ/ン,
     は/ほ, ね/れ/わ) via `row`, `vowel`, and shape-neighbor tables.
  3. Tap a tile: correct → green pop + chime; wrong → gentle red shake, correct tile highlights,
     TTS speaks the right answer.
  4. Optional **timed mode**: a per-question ring; fast answers earn bonus XP.
  5. Repeat for N questions (default 8–12 in a lesson slot).
- **Scoring & XP.** **+2 XP** correct, **+1** first-try speed bonus (timed). No deduction for
  wrong — the item re-queues later in the round. **+5** completion, **+5** perfect.
- **Difficulty & adaptivity (SRS).** Distractors ramp toward near-neighbors as mastery rises;
  **due SRS items are injected** into the pool. Each answer is an objective signal that **updates
  mastery** (and calibrates Kana Drill self-ratings).
- **Feedback & celebration.** Per-answer micro-feedback; end-of-round accuracy bar + Hoshi
  reaction scaled to score. Wrong answers never end the round.
- **Data requirements.** `char`, `romaji`, `altRomaji`, `type`, `row`, `vowel`, `category` (for
  distractors); `pronunciationHint` for reveal.
- **Accessibility.** Large tiles, keyboard-selectable (1–4 / arrows + Enter). Feedback is never
  color-only — ✓/✗ icons + text accompany green/red. Timer optional (disable for anxiety-free
  play).
- **Ship status.** **Phase 2 core.**

---

### 3.4 Kana Match

- **Purpose.** A memory/concentration grid: flip cards to pair **kana ↔ romaji**. Reinforces
  recognition through repeated exposure; low-pressure fun for short sessions.
- **Skill(s).** Recognition (binding shape to sound), plus incidental recall from repeated flips.
- **Mechanics & round flow.**
  1. A grid of face-down tiles (default **4×4 = 8 pairs**; scalable 3×4 → 6×4).
  2. Half carry a kana, half the matching romaji.
  3. Flip two tiles: **match** → they lock with a pop + chime, TTS speaks the kana; **no match**
     → both flip back after a beat (no penalty).
  4. Continue until cleared; a **move counter** + timer track a personal best.
- **Scoring & XP.** **+2 XP** per matched pair; efficiency bonus **+1 to +5** by moves-to-clear
  vs. theoretical minimum (rewards memory, not luck). **+5** completion.
- **Difficulty & adaptivity (SRS).** Grid size scales with the filtered set; **due/low-mastery
  kana are seeded preferentially** so reviews double as a game. A cleared pair is a light positive
  mastery signal (weaker than an objective answer).
- **Feedback & celebration.** Satisfying flip/lock animations; clearing the last pair triggers
  confetti + Hoshi celebrating. No fail state — the board is always completable.
- **Data requirements.** `char`, `romaji`, `altRomaji`, `type`; `category`/`row` to keep a board
  coherent (e.g. all-K-row).
- **Accessibility.** Tiles keyboard-navigable (arrows + Enter); stable focus order. Matched state
  uses shape + label, not color alone. Reduced-motion crossfades; board size adapts to viewport.
- **Ship status.** **Phase 2 core.**

---

### 3.5 Romaji Rush

- **Purpose.** Typed recall: a kana appears and the player **types its romaji**. No
  multiple-choice scaffolding — forces true production of the reading, with a combo rhythm.
- **Skill(s).** Recall (kana → romaji, typed).
- **Mechanics & round flow.**
  1. A kana shows; a text input is auto-focused.
  2. Player types the romaji and submits (Enter, or auto-submit on exact length).
  3. **Forgiving checking:** accepts `romaji` and any `altRomaji` (し → `shi`/`si`, ふ → `fu`/`hu`,
     づ → `zu`, ぢ → `ji`/`di`), case-insensitive, trimmed.
  4. Correct → green pop, **combo meter** ticks up, next kana slides in. Wrong → gentle shake,
     input clears, correct romaji shown; combo resets (score does not).
  5. Round is a fixed count or a short timed block.
- **Scoring & XP.** **+2 XP** per correct, plus a **combo multiplier** (≈ ×1.1 per 5-streak,
  capped) scaling a hot streak's XP. Wrong costs no XP — only the combo. **+5** completion; perfect
  run adds a bonus.
- **Difficulty & adaptivity (SRS).** Set filtered by unit/mastery, **due items injected**;
  difficulty scales by widening the pool (add dakuten/yōon) and tightening the optional timer.
  Typed correctness is a strong objective signal that **updates mastery**.
- **Feedback & celebration.** Combo meter + streak flames make speed feel good; milestone combos
  pop Hoshi's "cheering-combo" pose. Mistakes are quiet and instructive.
- **Data requirements.** `char`, `romaji`, **`altRomaji`** (critical for forgiving input), `type`,
  `pronunciationHint`. Yōon/sokuon follow the book's romaji rules (きょ=`kyo`, しゃ=`sha`, small っ
  doubles the next consonant).
- **Accessibility.** Keyboard-based by design; on-screen input for touch. IME-safe (compares
  romaji, not Japanese input). Clear labels/aria; reveal is text + audio. Timer optional.
- **Ship status.** **Phase 2 core.**

---

### 3.6 Ear Training (Kiku)

- **Purpose.** Listening-led recall: **hear** the kana (TTS) → pick or type it. Trains the
  sound→shape mapping that reading-only practice neglects and prepares the ear for real Japanese.
- **Skill(s).** Listening + Recall (sound → kana).
- **Mechanics & round flow.**
  1. A prominent **Sky-colored play button** speaks the kana via `AudioService` (auto-plays once;
     freely replayable).
  2. Player responds in one of two sub-modes: **Pick** (choose from 4 kana tiles) or **Type**
     (type the romaji heard — harder).
  3. Correct → green pop + kana revealed; wrong → replay + gentle shake + reveal.
  4. Repeat for N items; mixes similar-sounding pairs as mastery grows.
- **Scoring & XP.** **+2 XP** correct (**+1** for the harder Type sub-mode). Replays are free and
  never penalized — listening again is the point. **+5** completion.
- **Difficulty & adaptivity (SRS).** Pick → Type progression as mastery rises; **due SRS items
  injected**; confusable-sound sets (e.g. long vs short vowels for katakana ー) appear higher.
  Answers **update mastery** on the listening dimension.
- **Feedback & celebration.** Encouraging; the reveal always pairs sound + shape so a miss still
  teaches. Hoshi "listening" pose while audio plays.
- **Data requirements.** `char`, `romaji`, `altRomaji`, `pronunciationHint`, `type`; **depends on
  `AudioService` TTS** for every prompt. Distractors use `row`/`vowel` for near-sound confusers.
- **Accessibility.** **Audio is essential**, so provide a caption toggle and always reveal the
  written kana on answer for deaf/HoH users; the mode is skippable and non-blocking in a lesson if
  audio is unavailable. Play button keyboard-focusable with clear aria-label + replay key.
- **Ship status.** **Phase 2 core** (hard dependency on the TTS `AudioService`).

---

### 3.7 Stroke Master (Kaki)

- **Purpose.** Production through **writing**: trace the kana on a canvas following correct stroke
  order/direction; validate order and rough shape. Cements muscle memory as the books' "PRACTICE
  WRITING" pages intend.
- **Skill(s).** Production (handwriting), with recognition reinforcement.
- **Mechanics & round flow.**
  1. Target kana shows as a faint guide with numbered stroke starts.
  2. Player traces each stroke with finger/mouse/stylus.
  3. Validator checks per stroke: **correct order**, start/end region, direction (left→right,
     top→bottom) against `strokeOrder`, with generous tolerance.
  4. Wrong-order stroke → a gentle nudge ("try stroke 2 next"), never a hard fail.
  5. On completion the kana animates a clean redraw + TTS reads it.
- **Scoring & XP.** **+3 XP** per completed character (production is high-value), with a small
  neatness/order bonus. Retries are free.
- **Difficulty & adaptivity (SRS).** Levels: **trace-on-guide → faded guide → blank canvas from
  memory** as mastery rises. Feeds a **production mastery** sub-signal, tracked separately from
  reading mastery; SRS can surface low-production kana.
- **Feedback & celebration.** Per-stroke encouragement; completion sparkle + Hoshi. Mistakes are
  coached, not scored down.
- **Data requirements.** **`strokeOrder`** (SVG path/stroke list) + **`strokeCount`** — *authored
  in Phase 2*, which is exactly why this mode is stretch: it needs richer per-kana data than the
  ship set. Also `char`, `romaji`, `type`.
- **Accessibility.** Pointer/touch drawing has a "step through strokes" assistive fallback (watch +
  confirm) so it's completable without fine motor input. Reduced-motion disables the animated
  redraw; large canvas targets.
- **Ship status.** **Phase 2 stretch / early fast-follow** — gated on stroke-order data authoring.

---

### 3.8 Kana Rain

- **Purpose.** The **signature arcade** mode. Kana fall from the top like sakura petals; the
  player **types the romaji** to clear each before it lands. Fast, addictive, the best driver of
  automatic recall and speed.
- **Skill(s).** Recall + Speed (recall under time pressure).
- **Mechanics & round flow.**
  1. Kana drift down at a rising rate (sakura-petal motion).
  2. Typing a correct match **pops** the falling kana (confetti + chime) and grows the combo.
  3. A kana that reaches the bottom **gently fades**, logged as "missed" — no life lost by default
     (motivation-first; an optional "focus" variant with a soft petal-basket limit may be revisited
     per CANON §6, never the default).
  4. Waves escalate; a **combo multiplier** rewards clean streaks. Ends on a timer or endless.
  5. End screen: score, best combo, kana/min, and a **personal best** (locally leaderboard-ready
     now; backend leagues later).
- **Scoring & XP.** Points per cleared kana × combo multiplier → converted to **XP** at round end
  (capped to stay comparable to other modes). A miss breaks the combo, not the XP; perfect waves
  add bonus XP. Powers the **"Speed Demon (Kana Rain)"** achievement.
- **Difficulty & adaptivity (SRS).** Fall speed + spawn rate scale with the session and mastery;
  set filtered by unit/mastery with **due items spawned more often** so the arcade doubles as
  review. Each clear/miss **updates mastery** (fast, high-volume signal).
- **Feedback & celebration.** Juicy — petal pops, screen-shake-lite on big combos, Hoshi cheering.
  Misses fade softly; the round never feels like failure. Springy and `prefers-reduced-motion`-aware.
- **Data requirements.** `char`, `romaji`, **`altRomaji`**, `type`, `category` (to scope waves),
  `row`/`vowel` for confusable clusters. Optional TTS on clear.
- **Accessibility.** Keyboard-first (typing is the game); on-screen keyboard for touch. Reduced-motion
  slows/steadies the fall and cuts particles; low-power fallback drops the 3D/particle layer. Speed
  and density are user-adjustable; never color-only feedback.
- **Ship status.** **Phase 2 core — the signature mode.**

---

### 3.9 Word Builder (Kotoba)

- **Purpose.** The **"you can already read Japanese!"** moment. Using only kana the player has
  learned, they read and build **real words straight from the Tofugu books** — bridging kana →
  meaning and proving the learning pays off.
- **Skill(s).** Application / meaning (reading whole words), reinforcing recognition + recall in
  context.
- **Real example words (from `/database` — `DB_EXTRACT.md`; never invent vocab beyond the books):**

  | Word | Romaji | Meaning | Kana used |
  |------|--------|---------|-----------|
  | あお | ao | blue | あ, お |
  | いえ | ie | house | い, え |
  | うえ | ue | above / up | う, え |
  | おう | ou | king | お, う |
  | き | ki | tree | き |
  | かき | kaki | oyster / persimmon | か, き |
  | くうき | kuuki | air | く, う, き |
  | こえ | koe | voice | こ, え |
  | け | ke | hair | け |
  | あ | a | ah! (realization) | あ |

  *(More words are harvested per column during Phase 2 transcription — see `CONTENT_MODEL.md`.
  Word availability is gated by which kana the player has unlocked.)*
- **Mechanics & round flow.**
  1. Prompt shows the target word's **meaning** (and/or an image) plus its audio.
  2. Player **builds the word** by tapping/arranging kana tiles in order (hear "blue" → assemble
     あお), or in a harder variant **types the romaji**.
  3. Correct → the word lights up, TTS reads it, and a "**You just read a real Japanese word!**"
     celebration fires for early wins.
  4. Reverse sub-mode: show the kana word → pick its meaning (reading comprehension).
  5. Words are drawn only from unlocked kana, so success is guaranteed from lesson one (あ, then
     あお after the vowels unit).
- **Scoring & XP.** **+3 XP** per correctly built/read word (application is high-value). The first
  real word triggers a one-time bonus + badge-style moment. **+5** completion.
- **Difficulty & adaptivity (SRS).** Word length and typing (vs. tapping) scale with progress;
  words are chosen to **exercise due/low-mastery kana** in context (こえ reviews こ, え). Per-kana
  results within a word **update mastery** for each character.
- **Feedback & celebration.** The strongest motivational payoff in the app — big, warm celebration
  on the first real words, Hoshi over the moon. Errors just reshuffle tiles.
- **Data requirements.** `exampleWords: [{ kana, romaji, meaning }]` (core field), plus each
  constituent kana's `char`, `romaji`, `altRomaji`, `type`, and unlock/mastery state to gate
  availability. TTS for the spoken word.
- **Accessibility.** Tile arrangement keyboard-navigable (select + place); typing variant IME-safe.
  Meaning is text (i18n-translatable), audio captioned; large tiles for touch.
- **Ship status.** **Phase 2 core.**

---

### 3.10 Kana Sprint

- **Purpose.** An **endless timed challenge** across *all* learned kana — mixed prompts, combo
  multipliers, personal bests. The mastery/flex mode: prove you know the whole set cold, fast.
- **Skill(s).** Recall + Speed (broad, mixed-direction recall at pace).
- **Mechanics & round flow.**
  1. Choose scope (all learned / a track / a unit) and a clock (60s / 90s, or endless).
  2. Rapid-fire prompts stream in, **mixing formats** — kana→romaji type, romaji→kana pick,
     audio→kana — stress-testing every angle at once.
  3. Answer fast; correct answers extend a **combo multiplier**; the timer never stops for a miss
     (miss = combo reset, keep going).
  4. End screen: score, accuracy, best combo, kana/min, and **personal best** (built to slot into
     leagues/leaderboards when a backend exists — CANON §6).
- **Scoring & XP.** Score = Σ(points × combo), converted to capped XP at end. Fuels speed
  achievements and the local "personal best" stand-in for leagues.
- **Difficulty & adaptivity (SRS).** Inherently high-mixed; scope filter is the main dial.
  **Weights due/weak kana** more heavily so a sprint is also a broad review. High-volume answers
  **update mastery** across the set.
- **Feedback & celebration.** Arcade energy — combo flares, Hoshi hype at new personal bests.
  Timer pressure is opt-in scope; misses never end the run early.
- **Data requirements.** `char`, `romaji`, `altRomaji`, `type`, `row`, `vowel`, `category`;
  `AudioService` for the audio-prompt format. Reuses the same fields as Quick Match / Romaji Rush /
  Ear Training (it composes their prompt types).
- **Accessibility.** Mixed input honors keyboard + touch; audio prompts skippable if TTS is off.
  All Kana Rain / Quick Match rules apply (no color-only feedback, adjustable pace, focus management
  across changing prompt types).
- **Ship status.** **Phase 2 stretch / early fast-follow** — composes existing ship-set modes, so
  it lands shortly after the core set with little new content dependency.

---

## 4. The shared `GameMode` plugin interface

Every mode implements one contract. This is what lets the lesson player and the games arcade run
*any* mode without knowing its internals, and lets a new mode drop in without touching core
(consistent with `CLAUDE.md` §6 and `ARCHITECTURE.md`).

```ts
type Skill = 'recognition' | 'recall' | 'production' | 'listening' | 'application' | 'speed';

interface GameMode {
  id: GameModeId;                   // canonical id union (CONTENT_MODEL.md), e.g. "kana-rain"
  name: string;                     // display name, e.g. "Kana Rain"
  skills: Skill[];                  // angles this mode trains
  supports: { hiragana: boolean; katakana: boolean };  // both = true for every mode

  // Build a playable round from a filtered kana set (by unit / mastery).
  createRound(kana: Kana[], opts: RoundOptions): Round;

  // Score a single answer: emits XP delta + correct/wrong + an SRS signal.
  scoreAnswer(round: Round, answer: Answer): AnswerResult;

  // The playable UI. Receives the round + callbacks, stays presentational.
  Component: React.FC<GameModeProps>;
}

interface RoundOptions {
  unitId?: string;                  // filter to a unit
  masteryMax?: number;              // only kana at mastery <= n (review)
  dueOnly?: boolean;                // pull SRS-due items first
  script?: 'hiragana' | 'katakana' | 'both';
  count?: number;                   // round length
  timed?: boolean;                  // enable optional timer / speed bonus
}

interface AnswerResult {
  correct: boolean;
  xp: number;                       // delta to the gamification store
  srs: { kanaId: string; grade: 'again' | 'hard' | 'good' | 'easy' };  // mastery/interval update
}
```

### How a mode plugs in

- **Registry.** Each mode registers once in a `gameModeRegistry` keyed by `id`. Nothing hardcodes
  the list; the arcade and lesson player read from the registry.
- **Filtering is the mode's only input contract.** Callers pass a **filtered `Kana[]`** (by
  unit/mastery/script) plus `RoundOptions`. Modes never query content directly — the data layer and
  SRS scheduler hand them a set. This makes "filterable by unit/mastery" and "works for both
  scripts" uniform across all ten modes.
- **Scoring is centralized.** `scoreAnswer` returns `{ xp, srs }`; the **gamification store** applies
  XP/streak/quests and the **SRS scheduler** applies the grade to `KanaProgress` (mastery/crown +
  next due date). Modes never write progress themselves.
- **Two consumption surfaces, one contract:**
  - **Lesson pipeline** (`/lesson/[id]`): `Mnemonic Story` (for new kana) → a mix of ship-set modes
    → results/celebration. The player composes modes by `id`.
  - **Games arcade** (`/games`, `/games/[mode]`): the same modes, launched standalone with a scope
    picker (all learned / unit / mastery). Same `createRound` / `scoreAnswer` path.
- **Adding a mode = one folder.** Implement the interface under `src/features/games/<mode>/`,
  register it, declare `skills` + `supports`. No changes to the lesson player, arcade, SRS, or
  gamification code. See `CLAUDE.md` §8.

### Cross-cutting requirements (all modes)

- ✅ Works for **both** hiragana and katakana (`supports.hiragana && supports.katakana`).
- ✅ **Filterable** by unit and mastery via `RoundOptions`.
- ✅ Feeds **XP** (gamification store) and **SRS/mastery** (`AnswerResult.srs`).
- ✅ **TTS-audio-aware** through `AudioService`; **Ear Training depends on it**, the rest use it for
  reinforcement.
- ✅ **Never punishing** — no learning-blocking hearts; wrong answers teach and re-queue.
- ✅ Accessible — keyboard-navigable, non-color-only feedback, `prefers-reduced-motion` and low-power
  fallbacks, sans-serif only.

---

*Content source: the two Tofugu books in `/database` (`DB_EXTRACT.md`). Names, colors, tokens, tech
versions, and phase definitions per `CANON`. See `CONTENT_MODEL.md` for the `Kana` schema,
`ARCHITECTURE.md` for services, and `ROADMAP.md` for the ship/stretch split.*
