import type { Metadata } from "next";
import { LearnDashboard } from "@/features/dashboard/learn-dashboard";

export const metadata: Metadata = {
  title: "Learn Hiragana — Japalingo",
};

export default function LearnPage() {
  return <LearnDashboard />;
}
