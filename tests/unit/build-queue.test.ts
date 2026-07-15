import { describe, expect, it } from "vitest";
import { getTrackLessons, trackKana } from "@/data/curriculum";
import { buildQueue } from "@/features/lessons/build-queue";

describe("buildQueue distractors", () => {
  const hiraChars = new Set(trackKana("hiragana").map((k) => k.char));
  const kataChars = new Set(trackKana("katakana").map((k) => k.char));
  const hiraReadings = new Set(
    trackKana("hiragana").flatMap((k) => [k.romaji, ...(k.altRomaji ?? [])]),
  );

  it("only offers same-track options — never the other script, never a homophone", () => {
    for (const lesson of getTrackLessons("hiragana")) {
      for (const ex of buildQueue(lesson)) {
        if (ex.kind !== "choice") continue;
        const answer = ex.direction === "k2r" ? ex.kana.romaji : ex.kana.char;

        // The correct answer is always present, and no option repeats.
        expect(ex.options).toContain(answer);
        expect(new Set(ex.options).size).toBe(ex.options.length);

        for (const opt of ex.options) {
          if (ex.direction === "r2k") {
            expect(hiraChars.has(opt)).toBe(true); // a hiragana character…
            expect(kataChars.has(opt)).toBe(false); // …never a katakana one
          } else {
            expect(hiraReadings.has(opt)).toBe(true); // a valid hiragana reading
          }
        }

        // No distractor reads the same as the answer (in k2r the option *is* a
        // reading, so a duplicate reading would be a second correct answer).
        if (ex.direction === "k2r") {
          const others = ex.options.filter((o) => o !== answer);
          expect(others).not.toContain(ex.kana.romaji);
        }
      }
    }
  });

  it("teaches every new kana before testing it (mnemonic precedes its choices)", () => {
    const lesson = getTrackLessons("hiragana")[0]!;
    const queue = buildQueue(lesson);
    const firstMnemonic = queue.findIndex((e) => e.kind === "mnemonic");
    const firstChoice = queue.findIndex((e) => e.kind === "choice");
    expect(firstMnemonic).toBeGreaterThanOrEqual(0);
    expect(firstMnemonic).toBeLessThan(firstChoice);
  });
});
