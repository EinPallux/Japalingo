import type { Kana, Lesson, Track, Unit } from "@/types";
import { HIRAGANA } from "./hiragana";
import { KATAKANA } from "./katakana";

/** Every kana we teach, indexed by id (both tracks). */
export const ALL_KANA: Kana[] = [...HIRAGANA, ...KATAKANA];
const KANA_BY_ID = new Map(ALL_KANA.map((k) => [k.id, k]));

export function getKana(id: string): Kana | undefined {
  return KANA_BY_ID.get(id);
}
export function getKanaList(ids: string[]): Kana[] {
  return ids.map((id) => KANA_BY_ID.get(id)).filter((k): k is Kana => Boolean(k));
}

/** The 10 gojūon groups, shared by both tracks (kana referenced by suffix). */
const GROUPS = [
  { id: "vowels", title: "Vowels", learnTitle: "Meet the vowels", suffixes: ["a", "i", "u", "e", "o"] },
  { id: "k", title: "K row", learnTitle: "The K row", suffixes: ["ka", "ki", "ku", "ke", "ko"] },
  { id: "s", title: "S row", learnTitle: "The S row", suffixes: ["sa", "shi", "su", "se", "so"] },
  { id: "t", title: "T row", learnTitle: "The T row", suffixes: ["ta", "chi", "tsu", "te", "to"] },
  { id: "n", title: "N row", learnTitle: "The N row", suffixes: ["na", "ni", "nu", "ne", "no"] },
  { id: "h", title: "H row", learnTitle: "The H row", suffixes: ["ha", "hi", "fu", "he", "ho"] },
  { id: "m", title: "M row", learnTitle: "The M row", suffixes: ["ma", "mi", "mu", "me", "mo"] },
  { id: "y", title: "Y row", learnTitle: "The Y row", suffixes: ["ya", "yu", "yo"] },
  { id: "r", title: "R row", learnTitle: "The R row", suffixes: ["ra", "ri", "ru", "re", "ro"] },
  { id: "w", title: "W row", learnTitle: "The W row", suffixes: ["wa", "wo", "n"] },
] as const;

const REVIEW_AFTER: Record<string, { title: string; groups: string[] | "sample" }> = {
  k: { title: "Review: A–K", groups: ["vowels", "k"] },
  t: { title: "Review: S–T", groups: ["s", "t"] },
  h: { title: "Review: N–H", groups: ["n", "h"] },
  r: { title: "Review: M–R", groups: ["m", "y", "r"] },
  w: { title: "Final review", groups: "sample" },
};

function suffixesForGroups(groupIds: string[]): string[] {
  return groupIds.flatMap((gid) => GROUPS.find((g) => g.id === gid)?.suffixes ?? []);
}

function buildTrack(track: Track, prefix: string): { units: Unit[]; lessons: Lesson[] } {
  const units: Unit[] = [];
  const lessons: Lesson[] = [];
  let order = 0;

  GROUPS.forEach((g, gi) => {
    const kanaIds = g.suffixes.map((s) => `${prefix}-${s}`);
    const unitId = `${prefix}-${g.id}`;
    units.push({
      id: unitId,
      track,
      title: g.title,
      subtitle: kanaIds.map((id) => getKana(id)?.char ?? "").join(" "),
      kanaIds,
      order: gi + 1,
    });

    const prevGroup = GROUPS[gi - 1];
    const reviewIds = (prevGroup?.suffixes.slice(0, 2) ?? []).map((s) => `${prefix}-${s}`);
    lessons.push({
      id: `${unitId}-learn`,
      unitId,
      title: g.learnTitle,
      newKanaIds: kanaIds,
      reviewKanaIds: reviewIds,
      order: (order += 1),
      kind: "lesson",
    });

    const rev = REVIEW_AFTER[g.id];
    if (rev) {
      // The final checkpoint reviews the whole script; sectional reviews cover
      // just the groups since the previous checkpoint.
      const suffixes =
        rev.groups === "sample"
          ? GROUPS.flatMap((gg) => gg.suffixes)
          : suffixesForGroups(rev.groups);
      lessons.push({
        id: `${unitId}-review`,
        unitId,
        title: rev.title,
        newKanaIds: [],
        reviewKanaIds: suffixes.map((s) => `${prefix}-${s}`),
        order: (order += 1),
        kind: "review",
      });
    }
  });

  return { units, lessons };
}

const hira = buildTrack("hiragana", "hira");
const kata = buildTrack("katakana", "kata");

export const UNITS_BY_TRACK: Record<Track, Unit[]> = {
  hiragana: hira.units,
  katakana: kata.units,
};
export const LESSONS_BY_TRACK: Record<Track, Lesson[]> = {
  hiragana: hira.lessons,
  katakana: kata.lessons,
};
export const ALL_LESSONS: Lesson[] = [...hira.lessons, ...kata.lessons];
const ALL_UNITS: Unit[] = [...hira.units, ...kata.units];

const LESSON_BY_ID = new Map(ALL_LESSONS.map((l) => [l.id, l]));
const UNIT_BY_ID = new Map(ALL_UNITS.map((u) => [u.id, u]));

export function getLesson(id: string): Lesson | undefined {
  return LESSON_BY_ID.get(id);
}
export function getUnit(id: string): Unit | undefined {
  return UNIT_BY_ID.get(id);
}
export function getTrackLessons(track: Track): Lesson[] {
  return LESSONS_BY_TRACK[track];
}
export function trackKana(track: Track): Kana[] {
  return track === "hiragana" ? HIRAGANA : KATAKANA;
}

/** All kana a lesson touches (new + review), as full Kana objects. */
export function lessonKana(lesson: Lesson): Kana[] {
  return getKanaList([...lesson.newKanaIds, ...lesson.reviewKanaIds]);
}
