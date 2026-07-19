import { describe, expect, it } from "vitest";
import { getKanaList, getTrackUnits, trackKana } from "@/data/curriculum";
import {
  buildSpeedQuiz,
  crownThreshold,
  isCrownWin,
  MIN_SECONDS,
  SECONDS_PER_KANA,
  timeLimitMs,
} from "@/lib/speed-review";

describe("speed review", () => {
  const vowels = getKanaList(getTrackUnits("hiragana")[0]!.kanaIds); // あ い う え お
  const hiraReadings = new Set(
    trackKana("hiragana").flatMap((k) => [k.romaji, ...(k.altRomaji ?? [])]),
  );

  it("builds one recognition question per unit kana with clean options", () => {
    const quiz = buildSpeedQuiz(vowels);
    expect(quiz).toHaveLength(vowels.length);
    for (const q of quiz) {
      expect(q.options).toContain(q.kana.romaji); // answer present
      expect(new Set(q.options).size).toBe(q.options.length); // no dupes
      expect(q.options.length).toBeGreaterThanOrEqual(2);
      // every option is a real hiragana reading (same-track, no cross-script)
      for (const opt of q.options) expect(hiraReadings.has(opt)).toBe(true);
    }
  });

  it("scales the time limit with kana count but floors it", () => {
    expect(timeLimitMs(2)).toBe(MIN_SECONDS * 1000); // floored
    expect(timeLimitMs(10)).toBe(10 * SECONDS_PER_KANA * 1000);
  });

  it("requires ~80% correct AND beating the clock to crown", () => {
    expect(crownThreshold(5)).toBe(4); // 5 kana → 4 needed
    expect(crownThreshold(3)).toBe(3); // 3 kana → all needed
    expect(isCrownWin(4, 5, false)).toBe(true);
    expect(isCrownWin(3, 5, false)).toBe(false); // not accurate enough
    expect(isCrownWin(5, 5, true)).toBe(false); // ran out of time
  });
});
