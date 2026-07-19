import type { GrammarTable } from "@/types";

/**
 * Reference tables, transcribed verbatim from
 * `database/Japalingo_Japanese_Grammar_for_Absolute_Beginners.pdf`:
 * Appendix A ("Conjugation at a Glance", pages 75–76) plus every in-chapter
 * formation/function table (chapters 1, 2, 5, 6, 7, 10, 12, 19, 21, 22, 23, 24).
 * Tables with `pointIds` render inside those points' teach cards — restoring
 * the book's tables exactly where its text teaches them. Tables marked
 * `reference` also appear in the hub's "Conjugation at a glance" section.
 *
 * Source of truth: /database — do not add or alter forms from elsewhere.
 */
export const GRAMMAR_TABLES: GrammarTable[] = [
  // ---- Conjugation at a Glance (Appendix A) + Ch3/5/6/12 formation tables ----
  {
    id: "nouns-na",
    title: "Nouns & な-adjectives",
    columns: ["", "Plain", "Polite"],
    rows: [
      ["affirmative", "学生だ / 静かだ", "学生です / 静かです"],
      ["negative", "学生じゃない / 静かじゃない", "学生じゃありません / 静かじゃありません"],
      ["past", "学生だった / 静かだった", "学生でした / 静かでした"],
      ["past negative", "学生じゃなかった / 静かじゃなかった", "学生じゃありませんでした / 静かじゃありませんでした"],
    ],
    chapterIds: ["g3", "g5"],
    pointIds: ["g3-2", "g5-3"],
    reference: true,
  },
  {
    id: "adj-classes",
    title: "The two adjective classes",
    columns: ["Class", "Dictionary", "Before a noun", "As a predicate"],
    rows: [
      ["い-adjective", "高い", "高い山", "山は高い"],
      ["な-adjective", "静か", "静かな町", "町は静かだ／静かです"],
    ],
    note: "The class is grammatical, not just spelling: きれい ends in い but is a な-adjective (きれいな部屋).",
    chapterIds: ["g5"],
    pointIds: ["g5-1"],
    reference: true,
  },
  {
    id: "i-adj",
    title: "い-adjectives",
    columns: ["", "Plain", "Polite"],
    rows: [
      ["affirmative", "高い", "高いです"],
      ["negative", "高くない", "高くないです / 高くありません"],
      ["past", "高かった", "高かったです"],
      ["past negative", "高くなかった", "高くなかったです / 高くありませんでした"],
    ],
    note: "Exception: いい (“good”) inflects from the older base よい — よくない, よかった, よくなかった. Never いくない.",
    chapterIds: ["g5"],
    pointIds: ["g5-2"],
    reference: true,
  },
  {
    id: "verb-groups",
    title: "The three verb groups",
    columns: ["Group", "How it behaves", "Examples"],
    rows: [
      ["一段 Ichidan / ru-verbs", "usually end in -いる or -える; る is removed in many forms", "食べる, 見る, 起きる"],
      ["五段 Godan / u-verbs", "the final kana moves through vowel rows", "書く, 話す, 飲む, 買う, 帰る"],
      ["Irregular", "use special stems", "する, 来る（くる）"],
    ],
    note: "Not every -いる/-える verb is Ichidan — 帰る, 入る, 走る, 切る, 知る, 要る are Godan. Learn each verb with its group.",
    chapterIds: ["g6"],
    pointIds: ["g6-1"],
    reference: true,
  },
  {
    id: "verb-plain",
    title: "Verbs: basic plain forms",
    columns: ["", "食べる", "書く", "する", "来る"],
    rows: [
      ["non-past +", "食べる", "書く", "する", "来る"],
      ["non-past −", "食べない", "書かない", "しない", "来ない"],
      ["past +", "食べた", "書いた", "した", "来た"],
      ["past −", "食べなかった", "書かなかった", "しなかった", "来なかった"],
    ],
    chapterIds: ["g6"],
    pointIds: ["g6-2"],
    reference: true,
  },
  {
    id: "verb-polite",
    title: "Verbs: basic polite (ます) forms",
    columns: ["", "Form"],
    rows: [
      ["non-past +", "〜ます"],
      ["non-past −", "〜ません"],
      ["past +", "〜ました"],
      ["past −", "〜ませんでした"],
    ],
    chapterIds: ["g6"],
    pointIds: ["g6-5"],
    reference: true,
  },
  {
    id: "godan-endings",
    title: "Godan endings: ない, た, て, and potential",
    columns: ["Dictionary", "ない", "た", "て", "Potential"],
    rows: [
      ["〜う", "〜わない", "〜った", "〜って", "〜える"],
      ["〜つ", "〜たない", "〜った", "〜って", "〜てる"],
      ["〜る", "〜らない", "〜った", "〜って", "〜れる"],
      ["〜む", "〜まない", "〜んだ", "〜んで", "〜める"],
      ["〜ぶ", "〜ばない", "〜んだ", "〜んで", "〜べる"],
      ["〜ぬ", "〜なない", "〜んだ", "〜んで", "〜ねる"],
      ["〜く", "〜かない", "〜いた", "〜いて", "〜ける"],
      ["〜ぐ", "〜がない", "〜いだ", "〜いで", "〜げる"],
      ["〜す", "〜さない", "〜した", "〜して", "〜せる"],
    ],
    note: "Special cases: 行く→行った／行って. ある→ない. する→しない／した／して／できる. 来る→来ない（こない）／来た（きた）／来て（きて）／来られる（こられる）.",
    chapterIds: ["g6", "g12"],
    pointIds: ["g6-4"],
    reference: true,
  },
  {
    id: "te-form",
    title: "Forming the て-form",
    columns: ["Verb type / ending", "て-form", "Examples"],
    rows: [
      ["Ichidan: remove る + て", "〜て", "食べる→食べて, 見る→見て"],
      ["う・つ・る", "〜って", "買う→買って, 待つ→待って, 帰る→帰って"],
      ["む・ぶ・ぬ", "〜んで", "飲む→飲んで, 遊ぶ→遊んで"],
      ["く", "〜いて", "書く→書いて"],
      ["ぐ", "〜いで", "泳ぐ→泳いで"],
      ["す", "〜して", "話す→話して"],
      ["Special forms", "して / 来て / 行って", "する→して, 来る→来て（きて）, 行く→行って"],
    ],
    chapterIds: ["g12"],
    pointIds: ["g12-1"],
    reference: true,
  },

  // ---- Restored in-chapter tables (previously lost in transcription) ----
  {
    id: "plain-polite-intro",
    title: "Plain and polite",
    columns: ["Plain", "Polite", "Meaning"],
    rows: [
      ["食べる", "食べます", "eat / will eat"],
      ["学生だ", "学生です", "is a student"],
      ["高い", "高いです", "is expensive / high"],
    ],
    chapterIds: ["g1"],
    pointIds: ["g1-6"],
  },
  {
    id: "writing-systems",
    title: "The three writing systems",
    columns: ["Script", "Main purpose", "Example"],
    rows: [
      ["ひらがな Hiragana", "grammar, native words, readings", "たべます"],
      ["カタカナ Katakana", "loanwords, names, emphasis", "コーヒー"],
      ["漢字 Kanji", "meaning-bearing word stems", "食べます"],
    ],
    chapterIds: ["g2"],
    pointIds: ["g2-1"],
  },
  {
    id: "five-vowels",
    title: "The five vowels",
    columns: ["Kana", "Approximate sound", "Note"],
    rows: [
      ["あ / ア", "a", "clear “ah”"],
      ["い / イ", "i", "like “ee” but shorter"],
      ["う / ウ", "u", "short and lightly rounded"],
      ["え / エ", "e", "like “e” in “bed”"],
      ["お / オ", "o", "a clear short “o”"],
    ],
    note: "Japanese rhythm is counted in moras, short timing units — おばさん (aunt) and おばあさん (grandmother) differ because the long あ occupies an extra beat.",
    chapterIds: ["g2"],
    pointIds: ["g2-2"],
  },
  {
    id: "particle-readings",
    title: "Three particles with special readings",
    columns: ["Written", "Pronounced as a particle", "Function"],
    rows: [
      ["は", "わ (wa)", "topic"],
      ["へ", "え (e)", "direction"],
      ["を", "お (o)", "direct object"],
    ],
    chapterIds: ["g2"],
    pointIds: ["g2-5"],
  },
  {
    id: "ni-functions",
    title: "に — target, time, recipient, existence, result",
    columns: ["Function", "Example", "Meaning"],
    rows: [
      ["target", "学校に行く", "go to school"],
      ["specific time", "七時に起きる", "get up at seven"],
      ["recipient", "友達に話す", "speak to a friend"],
      ["existence location", "机の上に本がある", "a book is on the desk"],
      ["result", "先生になる", "become a teacher"],
      ["purpose with a verb stem", "買い物に行く", "go shopping"],
    ],
    chapterIds: ["g7"],
    pointIds: ["g7-2"],
  },
  {
    id: "de-functions",
    title: "で — action location, means, material, cause",
    columns: ["Function", "Example", "Meaning"],
    rows: [
      ["action location", "図書館で勉強する", "study at the library"],
      ["means", "電車で行く", "go by train"],
      ["language / method", "日本語で話す", "speak in Japanese"],
      ["material", "木で作る", "make from wood"],
      ["cause / occasion", "病気で休む", "be absent because of illness"],
    ],
    chapterIds: ["g7"],
    pointIds: ["g7-4"],
  },
  {
    id: "to-ya-no",
    title: "と, や, and の",
    columns: ["Particle", "Core function", "Example"],
    rows: [
      ["と", "complete list / together with / quotation", "パンと卵; 友達と行く"],
      ["や", "open, incomplete list", "パンや卵など"],
      ["の", "possession, category, description", "私の本; 日本語の先生"],
    ],
    chapterIds: ["g7"],
    pointIds: ["g7-5"],
  },
  {
    id: "register-predicates",
    title: "Plain vs. polite, by predicate type",
    columns: ["Predicate", "Plain", "Polite"],
    rows: [
      ["Noun", "学生だ", "学生です"],
      ["な-adjective", "元気だ", "元気です"],
      ["い-adjective", "忙しい", "忙しいです"],
      ["Verb", "行く", "行きます"],
    ],
    note: "Do not mix endings mechanically: です replaces plain だ (学生です, not 学生だです); い-adjectives conjugate themselves (忙しかったです, not 忙しいでした).",
    chapterIds: ["g10"],
    pointIds: ["g10-1"],
  },
  {
    id: "address-suffixes",
    title: "Addressing people",
    columns: ["Form", "Typical use"],
    rows: [
      ["〜さん", "neutral-polite name suffix"],
      ["〜先生", "teachers, doctors, recognized specialists"],
      ["〜くん", "often younger or male people, students, or subordinates; context-dependent"],
      ["〜ちゃん", "affectionate or diminutive"],
      ["様（さま）", "very respectful; customers and formal correspondence"],
    ],
    chapterIds: ["g10"],
    pointIds: ["g10-2"],
  },
  {
    id: "family-words",
    title: "Family words depend on perspective",
    columns: ["Your own family (speaking outward)", "Someone else's family / direct address"],
    rows: [
      ["母（はは）", "お母さん（おかあさん）"],
      ["父（ちち）", "お父さん（おとうさん）"],
      ["兄（あに）", "お兄さん（おにいさん）"],
      ["姉（あね）", "お姉さん（おねえさん）"],
    ],
    chapterIds: ["g10"],
    pointIds: ["g10-4"],
  },
  {
    id: "degree-approx",
    title: "Degree and approximation",
    columns: ["Expression", "Use", "Example"],
    rows: [
      ["くらい／ぐらい", "approximately; degree", "三時間ぐらい"],
      ["ほど", "extent; “as ... as”", "思ったほど高くない"],
      ["約（やく）", "approximately, more formal", "約百人"],
      ["ごろ", "around a point in time", "七時ごろ"],
      ["ずつ", "each / at a time", "二つずつ"],
    ],
    chapterIds: ["g19"],
    pointIds: ["g19-5"],
  },
  {
    id: "tokoro-phase",
    title: "ところ — the phase of an action",
    columns: ["Form", "Meaning"],
    rows: [
      ["Dictionary form + ところ", "just about to do"],
      ["ている + ところ", "right in the middle of doing"],
      ["Past form + ところ", "have just done / have just discovered the result"],
    ],
    chapterIds: ["g21"],
    pointIds: ["g21-2"],
  },
  {
    id: "before-after-when",
    title: "Before, after, and when",
    columns: ["Pattern", "Example", "Note"],
    rows: [
      ["Dictionary form + 前に", "寝る前に歯を磨く", "before an action"],
      ["Past form + 後で", "食べた後で散歩する", "after a completed action"],
      ["plain form + 時", "日本へ行く時 / 行った時", "the verb form changes the time relation"],
    ],
    chapterIds: ["g21"],
    pointIds: ["g21-6"],
  },
  {
    id: "numbers",
    title: "Basic numbers and sound changes",
    columns: ["Number", "Reading", "Note"],
    rows: [
      ["1 一", "いち", ""],
      ["2 二", "に", ""],
      ["3 三", "さん", ""],
      ["4 四", "よん / し", "よん is often safer in everyday use"],
      ["5 五", "ご", ""],
      ["6 六", "ろく", ""],
      ["7 七", "なな / しち", "clock time commonly uses しち"],
      ["8 八", "はち", ""],
      ["9 九", "きゅう / く", "clock time commonly uses く"],
      ["10 十", "じゅう", ""],
      ["100 百", "ひゃく", "300 さんびゃく; 600 ろっぴゃく; 800 はっぴゃく"],
      ["1000 千", "せん", "3000 さんぜん; 8000 はっせん"],
      ["10000 万", "まん", "Japanese groups large numbers by ten-thousands"],
    ],
    chapterIds: ["g22"],
    pointIds: ["g22-1"],
  },
  {
    id: "counters",
    title: "Frequent counters",
    columns: ["Counter", "Used for", "Examples / irregularities"],
    rows: [
      ["〜つ", "general objects, 1-10", "ひとつ, ふたつ, みっつ ... とお"],
      ["〜人（にん）", "people", "ひとり, ふたり, さんにん"],
      ["〜本（ほん）", "long cylindrical objects", "いっぽん, さんぼん, ろっぽん"],
      ["〜枚（まい）", "flat objects", "いちまい, にまい"],
      ["〜台（だい）", "machines and vehicles", "いちだい"],
      ["〜匹（ひき）", "small animals", "いっぴき, さんびき, ろっぴき"],
      ["〜回（かい）", "number of times", "いっかい, さんかい"],
      ["〜冊（さつ）", "bound books", "いっさつ, はっさつ"],
    ],
    note: "Learn counters as sound packages — sound changes such as いっぽん and さんぼん are part of using the grammar naturally.",
    chapterIds: ["g22"],
    pointIds: ["g22-2"],
  },
  {
    id: "clock-time",
    title: "Clock time and duration",
    columns: ["Expression", "Reading", "Meaning"],
    rows: [
      ["七時", "しちじ", "7:00"],
      ["九時", "くじ", "9:00"],
      ["四時半", "よじはん", "4:30"],
      ["一時間", "いちじかん", "one hour"],
      ["三十分", "さんじゅっぷん / さんじっぷん", "thirty minutes"],
    ],
    chapterIds: ["g22"],
    pointIds: ["g22-3"],
  },
  {
    id: "contractions",
    title: "Common casual contractions",
    columns: ["Full form", "Casual form", "Example"],
    rows: [
      ["〜ている", "〜てる", "何してる？"],
      ["〜でいる", "〜でる", "読んでる"],
      ["〜てしまう", "〜ちゃう", "忘れちゃった"],
      ["〜でしまう", "〜じゃう", "飲んじゃった"],
      ["〜なくては", "〜なくちゃ", "行かなくちゃ"],
      ["〜なければ", "〜なきゃ", "勉強しなきゃ"],
      ["という / と", "って", "明日行くって"],
      ["ではない", "じゃない", "学生じゃない"],
    ],
    chapterIds: ["g23"],
    pointIds: ["g23-1"],
  },
  {
    id: "beginner-errors",
    title: "Frequent beginner errors",
    columns: ["Error", "Better approach"],
    rows: [
      ["state every English subject", "use context; include 私 only when needed"],
      ["attach です to a complete plain ending", "replace or conjugate the ending correctly"],
      ["treat は as a universal subject marker", "check topic/contrast versus focus"],
      ["confuse に and で at places", "existence/destination = に; action = で"],
      ["keep using romaji indefinitely", "automate kana early"],
      ["translate word by word", "learn Japanese patterns as complete units"],
    ],
    chapterIds: ["g23"],
    pointIds: ["g23-6"],
  },
  {
    id: "passive-formation",
    title: "Passive formation",
    columns: ["Group", "Formation", "Example"],
    rows: [
      ["Ichidan", "る → られる", "食べる→食べられる"],
      ["Godan", "あ-row + れる", "書く→書かれる, 買う→買われる"],
      ["する", "される", "説明する→説明される"],
      ["来る", "来られる（こられる）", "来る→来られる"],
    ],
    chapterIds: ["g24"],
    pointIds: ["g24-1"],
  },
  {
    id: "causative-formation",
    title: "Causative formation — make or allow someone to act",
    columns: ["Group", "Formation", "Example"],
    rows: [
      ["Ichidan", "る → させる", "食べる→食べさせる"],
      ["Godan", "あ-row + せる", "書く→書かせる, 買う→買わせる"],
      ["する", "させる", "勉強させる"],
      ["来る", "来させる（こさせる）", "make/let someone come"],
    ],
    chapterIds: ["g24"],
    pointIds: ["g24-2"],
  },
  {
    id: "keigo",
    title: "Respectful and humble language",
    columns: ["General", "Respectful (their action)", "Humble (your action)"],
    rows: [
      ["行く／来る", "いらっしゃる", "参る／伺う"],
      ["いる", "いらっしゃる", "おる"],
      ["言う", "おっしゃる", "申す／申し上げる"],
      ["見る", "ご覧になる", "拝見する"],
      ["食べる／飲む", "召し上がる", "いただく"],
      ["する", "なさる", "いたす"],
      ["知っている", "ご存じだ", "存じている"],
    ],
    note: "Respectful forms elevate the other person's action; humble forms lower your own. They are not interchangeable versions of “extra polite.”",
    chapterIds: ["g24"],
    pointIds: ["g24-4"],
  },
];

/** Tables shown as their own lesson step for a chapter (only those not already
 *  embedded in a point's teach card). */
export function tablesForChapter(chapterId: string): GrammarTable[] {
  return GRAMMAR_TABLES.filter((t) => t.chapterIds.includes(chapterId) && !t.pointIds?.length);
}

/** Tables embedded in a specific point's teach card, in book order. */
export function tablesForPoint(pointId: string): GrammarTable[] {
  return GRAMMAR_TABLES.filter((t) => t.pointIds?.includes(pointId));
}

/** The hub's "Conjugation at a glance" quick-reference set. */
export const REFERENCE_TABLES: GrammarTable[] = GRAMMAR_TABLES.filter((t) => t.reference);
