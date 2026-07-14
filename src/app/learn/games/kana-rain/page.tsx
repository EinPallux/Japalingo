import { KanaRain } from "@/features/games/kana-rain";
import type { Track } from "@/types";

export const metadata = { title: "Kana Rain — Japalingo" };

export default async function KanaRainPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  const resolved: Track = track === "katakana" ? "katakana" : "hiragana";
  return <KanaRain track={resolved} />;
}
