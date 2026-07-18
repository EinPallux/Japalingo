import type { Metadata } from "next";
import { Arcade } from "@/features/games/arcade";

export const metadata: Metadata = { title: "Arcade — Japalingo" };

export default function GamesHubPage() {
  return <Arcade />;
}
