import { notFound } from "next/navigation";
import { getGrammarChapter } from "@/lib/grammar";
import { GrammarLesson } from "@/features/grammar/grammar-lesson";

export default async function GrammarChapterPage({
  params,
}: {
  params: Promise<{ chapterId: string }>;
}) {
  const { chapterId } = await params;
  const chapter = getGrammarChapter(chapterId);
  if (!chapter) notFound();
  return <GrammarLesson chapter={chapter} />;
}
