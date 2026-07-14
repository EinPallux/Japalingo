# Japalingo — Content Model

> The learning-content data model for **Japalingo** ("Learn to read Japanese — the fun way"): how kana, units, lessons, and SRS progress are represented in typed datasets under `src/data`. **Every learning fact here is sourced from `/database`** (the two Tofugu books); nothing is invented from general knowledge.

Related docs: `ARCHITECTURE.md` (data layer + repository), `GAME_MODES.md` (how content is consumed), `ROADMAP.md` (phasing).

---

## 1. Source & Governance

### 1.1 The two books

All content in Phase 2 derives from exactly two source PDFs living in `/database`:

| File | Title | Pages | Covers |
| --- | --- | --- | --- |
| `database/tofugu-learn-hiragana-book.pdf` | Tofugu — Learn Hiragana | 71 | Hiragana gojūon, dakuten/handakuten, yōon, sokuon |
| `database/learn-katakana-book-by-tofugu.pdf` | Tofugu — Learn Katakana | 69 | Katakana gojūon, dakuten/handakuten, yōon, **extended** foreign combos, long-vowel mark ー |

### 1.2 The governance rule (non-negotiable)

- **All learning content comes ONLY from `/database`.** Kana, mnemonics, mnemonic-image ideas, stroke rules, conversion mnemonics, and example words must trace to one of the two Tofugu books. Do **not** fetch kana facts from the internet or model memory unless the owner explicitly authorizes it for a task.
- **The PDFs are the source of truth** — read-only, do not edit. They are *transcribed* (not paraphrased or embellished) into typed datasets under `src/data`.
- **Transcription happens in Phase 2.** Phase 0 (this doc) defines the schema; Phase 2 fills the datasets page-by-page. Fields marked "authored in Phase 2" (e.g. `strokeOrder` SVG data) stay empty until then.
- **Features are content-gated.** A capability is built only when its content exists in `/database`. Vocabulary, kanji, grammar, and listening are *not* buildable yet — the books cover kana only. See §7 for how new packs plug in.

### 1.3 Each book's per-kana page shape (drives the schema)

Both books present every kana with a consistent three-part page, which maps directly onto our `Kana` fields:

| Book section | Field(s) it populates |
| --- | --- |
| **"HOW TO PRONOUNCE"** — reading + romaji + an English pronunciation anchor | `romaji`, `altRomaji`, `pronunciationHint` |
| **"HOW TO REMEMBER"** — a mnemonic linking shape↔sound + a supplemental image | `mnemonic`, `mnemonicImageIdea` |
| **"PRACTICE WRITING"** — stroke order (rule: left→right, top→bottom) | `strokeCount`, `strokeOrder` |
| **"LET'S PRACTICE READING!"** — review using real words after each column | `exampleWords` |

---

## 2. Coverage Inventory Available NOW

This is the exact content surface the two books give us today. Small tables per group; every character below is attested in `/database`.

### 2.1 Hiragana

**Basic gojūon — 46** (columns: vowel, K, S, T, N, H, M, Y, R, W, plus ん)

| Row | あ-col a | i | u | e | o |
| --- | --- | --- | --- | --- | --- |
| (vowel) | あ a | い i | う u | え e | お o |
| K | か ka | き ki | く ku | け ke | こ ko |
| S | さ sa | **し shi** | す su | せ se | そ so |
| T | た ta | **ち chi** | **つ tsu** | て te | と to |
| N | な na | に ni | ぬ nu | ね ne | の no |
| H | は ha | ひ hi | **ふ fu** | へ he | ほ ho |
| M | ま ma | み mi | む mu | め me | も mo |
| Y | や ya | — | ゆ yu | — | よ yo |
| R | ら ra | り ri | る ru | れ re | ろ ro |
| W | わ wa | — | — | — | **を o** |
| — | **ん n** | | | | |

**Reading exceptions the book explicitly calls out:** し = `shi` (not "si"), ち = `chi` (not "ti"), つ = `tsu` (not "tu"), ふ = `fu`/`hu`, を = `o` (formerly "wo"), ん = lone `n`.

**Dakuten (voiced ゛) — derived from K/S/T/H rows**

| Base→Voiced | a | i | u | e | o |
| --- | --- | --- | --- | --- | --- |
| K→G | が ga | ぎ gi | ぐ gu | げ ge | ご go |
| S→Z | ざ za | **じ ji** | ず zu | ぜ ze | ぞ zo |
| T→D | だ da | **ぢ ji** ("di") | **づ zu** ("du") | で de | ど do |
| H→B | ば ba | び bi | ぶ bu | べ be | ぼ bo |

> Note the book's typing caveats: ぢ is typed "di" but reads `ji`; づ is typed "du" but reads `zu`.

**Handakuten (゜) — H→P only**

| Base→Plosive | a | i | u | e | o |
| --- | --- | --- | --- | --- | --- |
| H→P | ぱ pa | ぴ pi | ぷ pu | ぺ pe | ぽ po |

**Yōon combos** — an I-row kana (き し ち に ひ み り ぎ じ ぢ び ぴ) + a small ゃ/ゅ/ょ. The trailing "i" of the base is dropped in romaji.

| Example | Reads | Rule |
| --- | --- | --- |
| き + ゃ = きゃ | kya | drop the "i" of ki |
| き + ょ = きょ | kyo | |
| し + ゃ = しゃ | sha | |
| び + ゅ = びゅ | byu | |

**Sokuon** — small っ marks a pause and **doubles the following consonant** in romaji.

| Word | Romaji |
| --- | --- |
| いっか | ikka |
| かっこ | kakko |
| りったい | rittai |
| いった | itta |

### 2.2 Katakana

The katakana book assumes hiragana is already known; each character maps to the same *sound* as its hiragana counterpart.

**Basic gojūon — 46** (same sound grid as hiragana)

| Row | a | i | u | e | o |
| --- | --- | --- | --- | --- | --- |
| (vowel) | ア a | イ i | ウ u | エ e | オ o |
| K | カ ka | キ ki | ク ku | ケ ke | コ ko |
| S | サ sa | シ shi | ス su | セ se | ソ so |
| T | タ ta | チ chi | ツ tsu | テ te | ト to |
| N | ナ na | ニ ni | ヌ nu | ネ ne | ノ no |
| H | ハ ha | ヒ hi | フ fu | ヘ he | ホ ho |
| M | マ ma | ミ mi | ム mu | メ me | モ mo |
| Y | ヤ ya | — | ユ yu | — | ヨ yo |
| R | ラ ra | リ ri | ル ru | レ re | ロ ro |
| W | ワ wa | — | — | — | ヲ o |
| — | ン n | | | | |

**Dakuten / handakuten / yōon** — mirror hiragana exactly (G/Z/D/B rows, P row, and I-row + small ャ/ュ/ョ).

**Extended combos for foreign sounds** (katakana-only; U-row or T-row kana + a small ァ/ィ/ゥ/ェ/ォ):

| Combo | Reads | Combo | Reads |
| --- | --- | --- | --- |
| ファ | fa | ティ | ti |
| フィ | fi | ディ | di |
| フェ | fe | トゥ | tu |
| フォ | fo | ドゥ | du |
| ヴァ | va | シェ | she |
| ヴィ | vi | ジェ | je |
| ヴ | vu | チェ | che |
| ヴェ | ve | ウィ | wi |
| ヴォ | vo | ウェ | we |
| ツァ | tsa | ウォ | wo |
| ツェ | tse | ツォ | tso |

> ヴ (from U-row) is commonly used for the "v" sound.

**Long-vowel mark ー (chōonpu)** — katakana-specific; extends the *preceding* vowel. Meaning changes with length: **チーズ** `chiizu` = "cheese" vs **チズ** `chizu` = "map".

### 2.3 Conversion mnemonics (from the books)

These teach the *rule* for reading derived kana and are attached to dakuten/handakuten units:

| Transform | Mnemonic |
| --- | --- |
| K→G | "the car (か) hits the **g**uard (が) rail" |
| S→Z | "my saw (さ) **z**apped (ざ) me" |
| T→D | "TA**D**A! (た/だ)" |
| H→B | "haha (は) at the **b**ar (ば), too much drinking" |
| H→P | "haha so much you get **p**unched (ぱ)" |

---

## 3. The `Kana` TypeScript Schema

The core record. One entry per readable unit (basic, derived, combo, or special). Lives in `src/data` and is typed in `src/types`.

```ts
/** A single readable kana unit transcribed from a Tofugu book. */
export interface Kana {
  /** Stable slug id, key everywhere (units, lessons, SRS): "hira-a", "kata-fa". */
  id: string;
  /** The literal character(s): "あ", "きゃ", "ファ". Source: book page headline. */
  char: string;
  /** Primary Hepburn romaji: "a", "shi", "kya". From "HOW TO PRONOUNCE". */
  romaji: string;
  /** Alternate spellings also marked correct: ふ->["hu"], を->["wo"]. Book-noted only. */
  altRomaji: string[];
  /** Which syllabary this belongs to. */
  type: "hiragana" | "katakana";
  /** Structural category — drives lesson grouping, unlock order, and UI badges. */
  category: "basic" | "dakuten" | "handakuten" | "yoon" | "extended" | "special";
  /** Consonant row; DERIVED kana use the derived row (が -> 'g'), see baseKanaId. */
  row: "a" | "k" | "s" | "t" | "n" | "h" | "m" | "y" | "r" | "w"
     | "g" | "z" | "d" | "b" | "p" | "special";
  /** Vowel column; null for ん and vu-style single extendeds. */
  vowel: "a" | "i" | "u" | "e" | "o" | null;
  /** English pronunciation anchor from "HOW TO PRONOUNCE" (し: "sounds like 'she'"). */
  pronunciationHint: string;
  /** The book's shape<->sound story from "HOW TO REMEMBER" (し: "shepherd's crook"). */
  mnemonic: string;
  /** Text description of the supplemental image (for Mnemonic Story). "HOW TO REMEMBER". */
  mnemonicImageIdea: string;
  /** Stroke count. From "PRACTICE WRITING". Authored in Phase 2. */
  strokeCount: number | null;
  /** Ordered SVG strokes (animated stroke order + Stroke Master validation),
   *  left->right/top->bottom per the book. AUTHORED IN PHASE 2 — null until then. */
  strokeOrder: StrokePath[] | null;
  /** Real words from "LET'S PRACTICE READING!" — powers Word Builder. */
  exampleWords: ExampleWord[];
  /** DERIVED kana: id of the base kana (が -> "hira-ka", ぱ -> "hira-ha"). Else null. */
  baseKanaId: string | null;
  /** COMBOS: part ids (きゃ -> ["hira-ki","hira-small-ya"]). Else null. */
  comboParts: string[] | null;
}

/** One authored stroke (Phase 2). `d` is an SVG path; `order` is 1-based. */
export interface StrokePath { order: number; d: string; }

/** A real example word harvested from a book's reading review. */
export interface ExampleWord { kana: string; romaji: string; meaning: string; }
```

### 3.1 Field-by-field provenance

Each field's inline comment above names its source; in book terms: `char` = page headline; `romaji`/`altRomaji`/`pronunciationHint` = **"HOW TO PRONOUNCE"** (exceptions し=shi, を=o recorded explicitly); `mnemonic`/`mnemonicImageIdea` = **"HOW TO REMEMBER"**; `strokeCount`/`strokeOrder` = **"PRACTICE WRITING"** (transcribed in Phase 2); `exampleWords` = **"LET'S PRACTICE READING!"**. `type` comes from which book the page is in; `category`/`row`/`vowel` from the character's position in the book's grid; and `baseKanaId`/`comboParts` are implied by the derivation shown (K→G, H→P; base + small kana).

---

## 4. Unit & Lesson Schema

Content is organized into **Units** (grouped kana) containing **Lessons** (playable nodes on the path). Per-user mastery is tracked by **KanaProgress**.

```ts
export type Track = "hiragana" | "katakana";

/** A group of related kana = one segment of the learning path. */
export interface Unit {
  id: string;                 // e.g. "hira-vowels", "kata-extended"
  track: Track;
  title: string;              // e.g. "Vowels (あ–お)"
  kanaIds: string[];          // every kana this unit is responsible for
  order: number;              // position within its track (1-based)
}

/** A single playable node on the winding path. */
export interface Lesson {
  id: string;                 // e.g. "hira-vowels-l1"
  unitId: string;
  title: string;              // e.g. "New: あ い う"
  newKanaIds: string[];       // introduced here (get a Mnemonic Story intro)
  reviewKanaIds: string[];    // pulled back in from earlier lessons
  gameModeIds: GameModeId[];  // the pipeline of exercises for this lesson
  order: number;              // position within its unit
}

/** Canonical game-mode identifiers (see GAME_MODES.md). */
export type GameModeId =
  | "mnemonic-story" | "kana-drill"  | "quick-match" | "kana-match"
  | "romaji-rush"    | "ear-training"| "stroke-master"
  | "kana-rain"      | "word-builder"| "kana-sprint";

/** Spaced-repetition state for ONE kana for the current (local) user.
 *  Leitner box + SM-2-lite interval; powers the Practice/Review hub. */
export interface KanaProgress {
  kanaId: string;
  box: number;                // Leitner box 0..5 (higher = longer interval)
  ease: number;               // SM-2-lite ease factor, default 2.5 (floor 1.3)
  interval: number;           // days until next review (SM-2-lite)
  dueAt: number;              // epoch ms of next scheduled review
  streak: number;             // consecutive correct answers
  mastery: 0 | 1 | 2 | 3 | 4 | 5; // crown level shown in UI (mirrors box)
  lastResult: "correct" | "wrong" | null;
}
```

Notes:
- A `Lesson.gameModeIds` pipeline typically opens with `mnemonic-story` for any `newKanaIds`, mixes recognition/recall modes, and closes with results + crown progress.
- `mastery` (0–5 crowns) is the user-facing signal; `box`/`interval`/`dueAt` are scheduler internals — both in `KanaProgress` so the Practice hub can surface "due today."
- `reviewKanaIds` interleaves prior kana into every lesson so the SRS never lets old kana rot.

---

## 5. Track & Unit Breakdown

The concrete unit list for both tracks (per CANON §7). Ordered top-to-bottom = path order. "Introduces" lists the kana each unit is responsible for (`Unit.kanaIds`).

### 5.1 Hiragana track

| # | Unit id | Title | Introduces |
| --- | --- | --- | --- |
| 1 | `hira-vowels` | Vowels (あ–お) | あ い う え お |
| 2 | `hira-k` | K row | か き く け こ |
| 3 | `hira-s` | S row | さ し す せ そ |
| 4 | `hira-t` | T row | た ち つ て と |
| 5 | `hira-n` | N row | な に ぬ ね の |
| 6 | `hira-h` | H row | は ひ ふ へ ほ |
| 7 | `hira-m` | M row | ま み む め も |
| 8 | `hira-y` | Y row | や ゆ よ |
| 9 | `hira-r` | R row | ら り る れ ろ |
| 10 | `hira-w-n` | W + ん | わ を ん |
| 11 | `hira-dakuten` | Dakuten (voiced) | が-row, ざ-row (incl. じ), だ-row (incl. ぢ づ), ば-row |
| 12 | `hira-handakuten` | Handakuten | ぱ ぴ ぷ ぺ ぽ |
| 13 | `hira-combos` | Combos (yōon) | きゃ しゃ ちゃ … + small ゃ ゅ ょ |
| 14 | `hira-sokuon` | Small っ | small っ (sokuon / doubling) |
| 15 | `hira-review` | Track Review | (checkpoint — no new kana) |

### 5.2 Katakana track

Mirrors hiragana, plus the two katakana-specific units the book adds.

| # | Unit id | Title | Introduces |
| --- | --- | --- | --- |
| 1 | `kata-vowels` | Vowels (ア–オ) | ア イ ウ エ オ |
| 2 | `kata-k` | K row | カ キ ク ケ コ |
| 3 | `kata-s` | S row | サ シ ス セ ソ |
| 4 | `kata-t` | T row | タ チ ツ テ ト |
| 5 | `kata-n` | N row | ナ ニ ヌ ネ ノ |
| 6 | `kata-h` | H row | ハ ヒ フ ヘ ホ |
| 7 | `kata-m` | M row | マ ミ ム メ モ |
| 8 | `kata-y` | Y row | ヤ ユ ヨ |
| 9 | `kata-r` | R row | ラ リ ル レ ロ |
| 10 | `kata-w-n` | W + ン | ワ ヲ ン |
| 11 | `kata-dakuten` | Dakuten (voiced) | ガ-row, ザ-row, ダ-row, バ-row |
| 12 | `kata-handakuten` | Handakuten | パ ピ プ ペ ポ |
| 13 | `kata-combos` | Combos (yōon) | キャ シャ … + small ャ ュ ョ |
| 14 | `kata-sokuon` | Small ッ | small ッ (sokuon / doubling) |
| 15 | `kata-extended` | Extended Sounds | ファ ヴァ ティ ディ トゥ シェ ジェ チェ ウィ ツァ … |
| 16 | `kata-long-vowel` | Long Vowel ー | ー (chōonpu) |
| 17 | `kata-review` | Track Review | (checkpoint — no new kana) |

---

## 6. Five Fully-Worked Example `Kana` Entries

Real data from `/database`. `strokeCount`/`strokeOrder` shown as `null` because they are authored during Phase 2 transcription.

### 6.1 あ — basic vowel

```ts
{
  id: "hira-a",
  char: "あ",
  romaji: "a",
  altRomaji: [],
  type: "hiragana",
  category: "basic",
  row: "a",
  vowel: "a",
  pronunciationHint: "'a' as in 'father'.",
  mnemonic: "Find the capital letter \"A\" hiding inside あ.",
  mnemonicImageIdea: "A block letter 'A' traced over the strokes of あ.",
  strokeCount: null,
  strokeOrder: null,
  exampleWords: [
    { kana: "あ",   romaji: "a",  meaning: "ah! (realization)" },
    { kana: "あお", romaji: "ao", meaning: "blue" },
  ],
  baseKanaId: null,
  comboParts: null,
}
```

### 6.2 し — exception kana (shi)

```ts
{
  id: "hira-shi",
  char: "し",
  romaji: "shi",             // exception: NOT "si"
  altRomaji: ["si"],
  type: "hiragana",
  category: "basic",
  row: "s",
  vowel: "i",
  pronunciationHint: "Sounds like the English 'she'. It is 'shi', never 'si'.",
  mnemonic: "し is a shepherd's crook herding sheep — 'shee' → shi.",
  mnemonicImageIdea: "A shepherd's hooked staff shaped like し, a sheep beside it.",
  strokeCount: null,
  strokeOrder: null,
  exampleWords: [],           // harvest S-column review words in Phase 2
  baseKanaId: null,
  comboParts: null,
}
```

### 6.3 が — dakuten of か (ga)

```ts
{
  id: "hira-ga", char: "が", romaji: "ga", altRomaji: [],
  type: "hiragana", category: "dakuten", row: "g" /* derived voiced row */, vowel: "a",
  pronunciationHint: "'ga' as in 'gone' — the voiced version of か.",
  mnemonic: "K→G: the car (か) hits the guard (が) rail. The dakuten ゛ are the dents.",
  mnemonicImageIdea: "A car labelled か crashing into a guard rail, two ゛ dent marks.",
  strokeCount: null, strokeOrder: null, exampleWords: [],
  baseKanaId: "hira-ka" /* derived from か */, comboParts: null,
}
```

### 6.4 きゃ — yōon combo (kya)

```ts
{
  id: "hira-kya", char: "きゃ", romaji: "kya", altRomaji: [],
  type: "hiragana", category: "yoon", row: "k", vowel: "a",
  pronunciationHint: "Blend き + small ゃ into one beat: drop the 'i' → 'kya'.",
  mnemonic: "き (ki) + small ゃ (ya): squish together and drop the 'i' → kya.",
  mnemonicImageIdea: "き and a shrunken ゃ merging into one syllable bubble.",
  strokeCount: null, strokeOrder: null, exampleWords: [],
  baseKanaId: null, comboParts: ["hira-ki", "hira-small-ya"],
}
```

### 6.5 ファ — katakana extended (fa)

```ts
{
  id: "kata-fa", char: "ファ", romaji: "fa", altRomaji: [],
  type: "katakana", category: "extended",
  row: "h" /* built on the フ (H-row/fu) base */, vowel: "a",
  pronunciationHint: "'fa' — foreign sound: フ (fu) + small ァ, keep only the 'f'.",
  mnemonic: "Take フ (fu) and add a small ァ to swap the vowel: fu → fa.",
  mnemonicImageIdea: "フ handing its 'u' to a small ァ that gives back an 'a'.",
  strokeCount: null, strokeOrder: null, exampleWords: [],
  baseKanaId: null, comboParts: ["kata-fu", "kata-small-a"],
}
```

### 6.6 Note — the long-vowel mark ー (chōonpu)

ー is **not a syllable**, so it is modeled as a `special` `Kana` (a reading rule with empty `romaji`), not a sound in the grid. It is katakana-only, extends the *preceding* vowel, and is the whole point of the `kata-long-vowel` unit — taught with the book's minimal pair, since length changes meaning:

```ts
{
  id: "kata-chouonpu", char: "ー", romaji: "" /* no sound */, altRomaji: [],
  type: "katakana", category: "special", row: "special", vowel: null,
  pronunciationHint: "Lengthens the vowel before it; length changes meaning.",
  mnemonic: "A long dash = hold the vowel. チーズ (chiizu, 'cheese') vs チズ (chizu, 'map').",
  mnemonicImageIdea: "A stretched vowel with a long dash; cheese vs a map.",
  strokeCount: 1, strokeOrder: null,
  exampleWords: [
    { kana: "チーズ", romaji: "chiizu", meaning: "cheese" },
    { kana: "チズ",   romaji: "chizu",  meaning: "map" },
  ],
  baseKanaId: null, comboParts: null,
}
```

---

## 7. Extensibility — Future Content Packs

The model is deliberately kana-shaped today because `/database` only holds the two kana books. New capabilities unlock **only when the owner adds the corresponding source to `/database`** (the content-gating rule from §1.2). When that happens, the same three-layer pattern — **typed dataset → units/lessons → game modes** — extends cleanly:

| Future pack | New source in `/database` | New typed record(s) | How it reuses this model |
| --- | --- | --- | --- |
| **Vocabulary** | A vocab book/list | `Vocab { id, kana, romaji, meaning, kanaIds[], partOfSpeech }` | `kanaIds[]` links each word back to `Kana`; `Unit`/`Lesson` gain a `track: "vocab"`; Word Builder scales up. |
| **Kanji** | A kanji source | `Kanji { id, char, onyomi[], kunyomi[], meanings[], radicals[], strokeOrder, exampleWords }` | Mirrors `Kana` (mnemonic, stroke, examples); new `Track = "kanji"`; SRS/`KanaProgress` generalizes to a `SrsItem`. |
| **Grammar** | A grammar source | `GrammarPoint { id, title, explanation, patterns[], exampleSentences[] }` | New `GameMode`s (e.g. sentence-build) added to the union; lessons reference `grammarIds[]`. |
| **Sentences / Listening** | Dialogue + audio source | `Sentence { id, text, reading, translation, audioRef }` | Feeds Ear Training and future listening modes; recorded audio swaps in behind the existing `AudioService`. |

Design principles that keep this open:

- [ ] **Track is an open string set** — adding `"vocab"`/`"kanji"`/`"grammar"` needs no rewrite of `Unit`/`Lesson`.
- [ ] **`GameModeId` is a union** — a new pack adds its mode ids; existing modes stay untouched.
- [ ] **SRS is content-agnostic** — `KanaProgress` generalizes to `SrsItem { itemId, box, ease, interval, dueAt, streak, mastery, lastResult }` so vocab/kanji reuse the exact scheduler.
- [ ] **Everything traces to `/database`** — a pack is "real" only once its dataset lives there and is transcribed; nothing ships on invented content.

---

*Content sources: `database/tofugu-learn-hiragana-book.pdf`, `database/learn-katakana-book-by-tofugu.pdf`. All kana facts, mnemonics, and example words above are transcribed from these two books per the `/database` governance rule.*
