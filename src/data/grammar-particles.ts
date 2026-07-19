/**
 * Particle Quick Reference — transcribed verbatim from Appendix B (page 77) of
 * `database/Japalingo_Japanese_Grammar_for_Absolute_Beginners.pdf`.
 * Source of truth: /database — do not add or alter particles from elsewhere.
 */
export interface ParticleRef {
  particle: string;
  function: string;
  example: string;
}

export const GRAMMAR_PARTICLES: ParticleRef[] = [
  { particle: "は", function: "topic / contrast", example: "私は学生です" },
  { particle: "が", function: "focus, bearer, identification", example: "だれが来ますか" },
  { particle: "も", function: "also; with negative, nobody/nothing", example: "私も行きます" },
  { particle: "を", function: "direct object; route", example: "本を読む" },
  { particle: "に", function: "target, time, recipient, existence location, result", example: "学校に行く" },
  { particle: "へ", function: "direction", example: "日本へ行く" },
  { particle: "で", function: "action location, means, material, cause", example: "電車で行く" },
  { particle: "と", function: "complete list, companion, quotation, natural condition", example: "友達と話す" },
  { particle: "や", function: "open list", example: "本や雑誌" },
  { particle: "の", function: "possession, category, substitution, explanation", example: "私の本" },
  { particle: "から", function: "from/since; reason", example: "九時から / 雨だから" },
  { particle: "まで", function: "until / as far as", example: "五時まで" },
  { particle: "か", function: "question; or", example: "行きますか" },
  { particle: "ね", function: "shared confirmation", example: "暑いですね" },
  { particle: "よ", function: "emphasized information", example: "安いですよ" },
  { particle: "だけ", function: "only", example: "一つだけ" },
  { particle: "しか", function: "only + negative", example: "一つしかない" },
  { particle: "より", function: "comparison baseline", example: "AよりB" },
  { particle: "ほど", function: "extent", example: "思ったほど" },
  { particle: "くらい／ぐらい", function: "approximately / degree", example: "三時間ぐらい" },
];

/** The book's note on combining particles (same appendix). */
export const PARTICLE_COMBINATIONS_NOTE =
  "に／で／へ／から／まで + は or も are common: 日本には, 学校でも. は and も usually replace が and を.";
