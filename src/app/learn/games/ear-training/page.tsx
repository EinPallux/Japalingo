import { EarTraining } from "@/features/games/ear-training";
import type { Track } from "@/types";

export const metadata = { title: "Ear Training — Japalingo" };

export default async function EarTrainingPage({
  searchParams,
}: {
  searchParams: Promise<{ track?: string }>;
}) {
  const { track } = await searchParams;
  const resolved: Track = track === "katakana" ? "katakana" : "hiragana";
  return <EarTraining track={resolved} />;
}
