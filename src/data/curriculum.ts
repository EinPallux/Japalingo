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

/**
 * The gojūon groups, shared by both tracks (kana referenced by suffix). The
 * first ten are the basic rows; the last five are the "variation" rows the
 * Tofugu books teach after the basics — dakuten (゛: K→G, S→Z, T→D, H→B) and
 * han-dakuten (゜: H→P). Placing them at the end matches the books and the
 * standard teaching order (learn all 46 basics first, then the marked variants).
 */
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
  // Variation kana — dakuten (゛) and han-dakuten (゜).
  { id: "g", title: "G row ゛", learnTitle: "Dakuten: G row (か→が)", suffixes: ["ga", "gi", "gu", "ge", "go"] },
  { id: "z", title: "Z row ゛", learnTitle: "Dakuten: Z row (さ→ざ)", suffixes: ["za", "ji", "zu", "ze", "zo"] },
  { id: "d", title: "D row ゛", learnTitle: "Dakuten: D row (た→だ)", suffixes: ["da", "di", "du", "de", "do"] },
  { id: "b", title: "B row ゛", learnTitle: "Dakuten: B row (は→ば)", suffixes: ["ba", "bi", "bu", "be", "bo"] },
  { id: "p", title: "P row ゜", learnTitle: "Han-dakuten: P row (は→ぱ)", suffixes: ["pa", "pi", "pu", "pe", "po"] },
  // Combination kana (yōon) — an I-row kana + a small ゃ/ゅ/ょ.
  { id: "yks", title: "Combos: K・S", learnTitle: "Combos: きゃ・しゃ", suffixes: ["kya", "kyu", "kyo", "sha", "shu", "sho"] },
  { id: "ytn", title: "Combos: T・N", learnTitle: "Combos: ちゃ・にゃ", suffixes: ["cha", "chu", "cho", "nya", "nyu", "nyo"] },
  { id: "yhm", title: "Combos: H・M", learnTitle: "Combos: ひゃ・みゃ", suffixes: ["hya", "hyu", "hyo", "mya", "myu", "myo"] },
  { id: "yrg", title: "Combos: R・G", learnTitle: "Combos: りゃ・ぎゃ", suffixes: ["rya", "ryu", "ryo", "gya", "gyu", "gyo"] },
  { id: "yjbp", title: "Combos: J・B・P", learnTitle: "Combos: じゃ・びゃ・ぴゃ", suffixes: ["ja", "ju", "jo", "bya", "byu", "byo", "pya", "pyu", "pyo"] },
] as const;

const BASIC_GROUP_IDS = ["vowels", "k", "s", "t", "n", "h", "m", "y", "r", "w"];

const REVIEW_AFTER: Record<string, { title: string; groups: string[] | "sample" }> = {
  k: { title: "Review: A–K", groups: ["vowels", "k"] },
  t: { title: "Review: S–T", groups: ["s", "t"] },
  h: { title: "Review: N–H", groups: ["n", "h"] },
  r: { title: "Review: M–R", groups: ["m", "y", "r"] },
  w: { title: "Review: all basics", groups: BASIC_GROUP_IDS },
  d: { title: "Review: dakuten G–D", groups: ["g", "z", "d"] },
  p: { title: "Review: all dakuten", groups: ["g", "z", "d", "b", "p"] },
  yhm: { title: "Review: combos so far", groups: ["yks", "ytn", "yhm"] },
  yjbp: { title: "Final review", groups: "sample" },
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
      // The final checkpoint samples across the whole script (one per group +
      // the trickier kana) to stay a digestible length; sectional reviews cover
      // just the groups since the previous checkpoint.
      const suffixes =
        rev.groups === "sample"
          ? [...GROUPS.map((gg) => gg.suffixes[0]!), "shi", "tsu", "fu", "ji", "kya", "sha", "cha"]
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

  // Track-specific extras, taught last:
  //  • katakana adds ヴ (vu) — the one dakuten vowel, for foreign v-sounds.
  //  • hiragana adds the small っ concept lesson (the doubling rule).
  const addUnit = (id: string, title: string, kanaIds: string[], learnTitle: string, review?: string[]) => {
    units.push({
      id,
      track,
      title,
      subtitle: kanaIds.map((k) => getKana(k)?.char ?? "").join(" ") || "—",
      kanaIds,
      order: units.length + 1,
    });
    lessons.push({
      id: `${id}-learn`,
      unitId: id,
      title: learnTitle,
      newKanaIds: kanaIds,
      reviewKanaIds: review ?? [],
      order: (order += 1),
      kind: kanaIds.length ? "lesson" : "sokuon",
    });
  };

  if (track === "katakana") {
    const p = prefix;
    addUnit(`${p}-v`, "Extended: ヴ", [`${p}-vu`], "The ヴ (vu) sound", [`${p}-po`, `${p}-bu`]);
    // Extended combination katakana (foreign sounds), taught in three chunks.
    addUnit(`${p}-ext1`, "Katakana: F・V", [`${p}-fa`, `${p}-fi`, `${p}-fe`, `${p}-fo`, `${p}-va`, `${p}-vi`, `${p}-ve`, `${p}-vo`], "Foreign sounds: ファ・ヴァ");
    addUnit(`${p}-ext2`, "Katakana: W・TS", [`${p}-wi`, `${p}-we`, `${p}-uwo`, `${p}-tsa`, `${p}-tsi`, `${p}-tse`, `${p}-tso`], "Foreign sounds: ウィ・ツァ");
    addUnit(`${p}-ext3`, "Katakana: TI・SHE…", [`${p}-ti`, `${p}-dhi`, `${p}-tu`, `${p}-dwu`, `${p}-she`, `${p}-je`, `${p}-che`], "Foreign sounds: ティ・シェ");
    // Long-vowel dash ー — a concept, not a kana.
    units.push({ id: `${p}-chouon`, track, title: "Long vowel ー", subtitle: "ー", kanaIds: [], order: units.length + 1 });
    lessons.push({
      id: `${p}-chouon-learn`,
      unitId: `${p}-chouon`,
      title: "The long vowel ー",
      newKanaIds: [],
      reviewKanaIds: [],
      order: (order += 1),
      kind: "chouon",
    });
  }
  if (track === "hiragana") {
    units.push({ id: `${prefix}-sokuon`, track, title: "Small っ", subtitle: "っ", kanaIds: [], order: units.length + 1 });
    lessons.push({
      id: `${prefix}-sokuon-learn`,
      unitId: `${prefix}-sokuon`,
      title: "The small っ (double it!)",
      newKanaIds: [],
      reviewKanaIds: [],
      order: (order += 1),
      kind: "sokuon",
    });
  }

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
export function getTrackUnits(track: Track): Unit[] {
  return UNITS_BY_TRACK[track];
}
/** Every lesson (learn + review) that belongs to a unit. */
export function getUnitLessons(unitId: string): Lesson[] {
  return ALL_LESSONS.filter((l) => l.unitId === unitId);
}
/** A unit is "cleared" once all its lessons are done — the Speed Review unlock. */
export function isUnitComplete(unitId: string, completed: string[]): boolean {
  const lessons = getUnitLessons(unitId);
  return lessons.length > 0 && lessons.every((l) => completed.includes(l.id));
}
export function trackKana(track: Track): Kana[] {
  return track === "hiragana" ? HIRAGANA : KATAKANA;
}

/** All kana a lesson touches (new + review), as full Kana objects. */
export function lessonKana(lesson: Lesson): Kana[] {
  return getKanaList([...lesson.newKanaIds, ...lesson.reviewKanaIds]);
}
