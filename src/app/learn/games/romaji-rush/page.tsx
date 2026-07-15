import { RomajiRush } from "@/features/games/romaji-rush";
import type { Track } from "@/types";

export const metadata = { title: "Romaji Rush — Japalingo" };

export default async function RomajiRushPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  const resolved: Track = track === "katakana" ? "katakana" : "hiragana";
  return <RomajiRush track={resolved} />;
}
