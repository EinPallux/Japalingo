import type { Metadata } from "next";
import { VocabHub } from "@/features/vocab/vocab-hub";

export const metadata: Metadata = {
  title: "Vocabulary — Japalingo",
};

export default function VocabPage() {
  return <VocabHub />;
}
