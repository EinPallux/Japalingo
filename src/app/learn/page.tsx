import type { Metadata } from "next";
import { LearnDashboard } from "@/features/dashboard/learn-dashboard";

export const metadata: Metadata = {
  title: "Learn Japanese — Japalingo",
};

export default function LearnPage() {
  return <LearnDashboard />;
}
