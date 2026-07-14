import { notFound } from "next/navigation";
import { getLesson } from "@/data/curriculum";
import { LessonPlayer } from "@/features/lessons/lesson-player";

export default async function LessonPage({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  const lesson = getLesson(id);
  if (!lesson) notFound();
  return <LessonPlayer lesson={lesson} />;
}
