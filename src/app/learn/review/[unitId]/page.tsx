import { notFound } from "next/navigation";
import { getUnit } from "@/data/curriculum";
import { SpeedReview } from "@/features/review/speed-review";

export default async function SpeedReviewPage({ params }: { params: Promise<{ unitId: string }> }) {
  const { unitId } = await params;
  const unit = getUnit(unitId);
  if (!unit) notFound();
  return <SpeedReview unit={unit} />;
}
