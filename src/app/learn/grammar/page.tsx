import type { Metadata } from "next";
import { GrammarHub } from "@/features/grammar/grammar-hub";

export const metadata: Metadata = {
  title: "Grammar — Japalingo",
};

export default function GrammarPage() {
  return <GrammarHub />;
}
