import type { Kana, Lesson, Unit } from "@/types";
import { HIRAGANA } from "./hiragana";

/** Every kana we currently teach, indexed by id. (Hiragana only for now.) */
export const ALL_KANA: Kana[] = [...HIRAGANA];
const KANA_BY_ID = new Map(ALL_KANA.map((k) => [k.id, k]));

export function getKana(id: string): Kana | undefined {
  return KANA_BY_ID.get(id);
}
export function getKanaList(ids: string[]): Kana[] {
  return ids.map((id) => KANA_BY_ID.get(id)).filter((k): k is Kana => Boolean(k));
}

const ids = (chars: string[]) => chars.map((c) => `hira-${c}`);

export const HIRAGANA_UNITS: Unit[] = [
  { id: "hira-vowels", track: "hiragana", title: "Vowels", subtitle: "あ い う え お",
    kanaIds: ids(["a", "i", "u", "e", "o"]), order: 1 },
  { id: "hira-k", track: "hiragana", title: "K row", subtitle: "か き く け こ",
    kanaIds: ids(["ka", "ki", "ku", "ke", "ko"]), order: 2 },
  { id: "hira-s", track: "hiragana", title: "S row", subtitle: "さ し す せ そ",
    kanaIds: ids(["sa", "shi", "su", "se", "so"]), order: 3 },
  { id: "hira-t", track: "hiragana", title: "T row", subtitle: "た ち つ て と",
    kanaIds: ids(["ta", "chi", "tsu", "te", "to"]), order: 4 },
  { id: "hira-n", track: "hiragana", title: "N row", subtitle: "な に ぬ ね の",
    kanaIds: ids(["na", "ni", "nu", "ne", "no"]), order: 5 },
  { id: "hira-h", track: "hiragana", title: "H row", subtitle: "は ひ ふ へ ほ",
    kanaIds: ids(["ha", "hi", "fu", "he", "ho"]), order: 6 },
  { id: "hira-m", track: "hiragana", title: "M row", subtitle: "ま み む め も",
    kanaIds: ids(["ma", "mi", "mu", "me", "mo"]), order: 7 },
  { id: "hira-y", track: "hiragana", title: "Y row", subtitle: "や ゆ よ",
    kanaIds: ids(["ya", "yu", "yo"]), order: 8 },
  { id: "hira-r", track: "hiragana", title: "R row", subtitle: "ら り る れ ろ",
    kanaIds: ids(["ra", "ri", "ru", "re", "ro"]), order: 9 },
  { id: "hira-w", track: "hiragana", title: "W + ん", subtitle: "わ を ん",
    kanaIds: ids(["wa", "wo", "n"]), order: 10 },
];

const learn = (unitId: string, order: number, title: string, newIds: string[], reviewIds: string[] = []): Lesson => ({
  id: `${unitId}-learn`, unitId, title, newKanaIds: newIds, reviewKanaIds: reviewIds, order, kind: "lesson",
});
const review = (unitId: string, order: number, title: string, reviewIds: string[]): Lesson => ({
  id: `${unitId}-review`, unitId, title, newKanaIds: [], reviewKanaIds: reviewIds, order, kind: "review",
});

/** Ordered path of lessons (winding node path). Reviews checkpoint prior kana. */
export const LESSONS: Lesson[] = [
  learn("hira-vowels", 1, "Meet the vowels", ids(["a", "i", "u", "e", "o"])),
  learn("hira-k", 2, "The K row", ids(["ka", "ki", "ku", "ke", "ko"]), ids(["a", "o"])),
  review("hira-k", 3, "Review: A–K", ids(["a", "i", "u", "e", "o", "ka", "ki", "ku", "ke", "ko"])),
  learn("hira-s", 4, "The S row", ids(["sa", "shi", "su", "se", "so"]), ids(["ka", "ki"])),
  learn("hira-t", 5, "The T row", ids(["ta", "chi", "tsu", "te", "to"]), ids(["sa", "shi"])),
  review("hira-t", 6, "Review: S–T", ids(["sa", "shi", "su", "se", "so", "ta", "chi", "tsu", "te", "to"])),
  learn("hira-n", 7, "The N row", ids(["na", "ni", "nu", "ne", "no"]), ids(["ta", "to"])),
  learn("hira-h", 8, "The H row", ids(["ha", "hi", "fu", "he", "ho"]), ids(["na", "no"])),
  review("hira-h", 9, "Review: N–H", ids(["na", "ni", "nu", "ne", "no", "ha", "hi", "fu", "he", "ho"])),
  learn("hira-m", 10, "The M row", ids(["ma", "mi", "mu", "me", "mo"]), ids(["ha", "he"])),
  learn("hira-y", 11, "The Y row", ids(["ya", "yu", "yo"]), ids(["ma", "mo"])),
  learn("hira-r", 12, "The R row", ids(["ra", "ri", "ru", "re", "ro"]), ids(["ya", "yo"])),
  review("hira-r", 13, "Review: M–R", ids(["ma", "mi", "mu", "ya", "yu", "yo", "ra", "ri", "ru", "re", "ro"])),
  learn("hira-w", 14, "W + ん", ids(["wa", "wo", "n"]), ids(["ra", "ro"])),
  review("hira-w", 15, "Final review", ids(["a", "ka", "sa", "ta", "na", "ha", "ma", "ya", "ra", "wa", "shi", "tsu", "fu", "wo", "n"])),
];

const LESSON_BY_ID = new Map(LESSONS.map((l) => [l.id, l]));
export function getLesson(id: string): Lesson | undefined {
  return LESSON_BY_ID.get(id);
}
export function getUnit(id: string): Unit | undefined {
  return HIRAGANA_UNITS.find((u) => u.id === id);
}

/** All kana a lesson touches (new + review), as full Kana objects. */
export function lessonKana(lesson: Lesson): Kana[] {
  return getKanaList([...lesson.newKanaIds, ...lesson.reviewKanaIds]);
}
