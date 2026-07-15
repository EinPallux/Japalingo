import { KanaMatch } from "@/features/games/kana-match";
import type { Track } from "@/types";

export const metadata = { title: "Kana Match — Japalingo" };

export default async function KanaMatchPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  const resolved: Track = track === "katakana" ? "katakana" : "hiragana";
  return <KanaMatch track={resolved} />;
}
