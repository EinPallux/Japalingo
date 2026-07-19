import { notFound } from "next/navigation";
import { getVocabDeck } from "@/data/vocab-decks";
import { VocabLesson } from "@/features/vocab/vocab-lesson";

export default async function VocabDeckPage({ params }: { params: Promise<{ deckId: string }> }) {
  const { deckId } = await params;
  const deck = getVocabDeck(deckId);
  if (!deck) notFound();
  return <VocabLesson deck={deck} />;
}
