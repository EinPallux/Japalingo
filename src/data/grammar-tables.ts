import type { GrammarTable } from "@/types";

/**
 * Conjugation reference tables, transcribed verbatim from
 * `database/Japalingo_Japanese_Grammar_for_Absolute_Beginners.pdf`:
 * Appendix A ("Conjugation at a Glance", pages 75–76) plus the class/formation
 * tables from the adjective (Ch5), verb (Ch6), and て-form (Ch12) chapters.
 * These give the table-heavy chapters a clean, at-a-glance reference card.
 *
 * Source of truth: /database — do not add or alter forms from elsewhere.
 */
export const GRAMMAR_TABLES: GrammarTable[] = [
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
  },
];

/** The reference tables shown for a given chapter, in book order. */
export function tablesForChapter(chapterId: string): GrammarTable[] {
  return GRAMMAR_TABLES.filter((t) => t.chapterIds.includes(chapterId));
}
