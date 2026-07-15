import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";

/**
 * Friendly gate shown when a game is opened before the learner has met enough
 * kana to play it fairly. Keeps beginners from being quizzed on characters they
 * haven't been taught (which would also corrupt their mastery data).
 */
export function NotEnoughKana({
  need,
  have,
  unit = "kana",
}: {
  need: number;
  have: number;
  unit?: string;
}) {
  return (
    <main id="main" className="grid min-h-dvh place-items-center px-5 text-center">
      <div className="flex max-w-sm flex-col items-center gap-4">
        <HoshiStatic className="size-28" />
        <h1 className="font-display text-2xl font-bold text-ink">Let&apos;s learn a bit more first!</h1>
        <p className="text-ink">
          This game needs at least <strong>{need}</strong> {unit} you&apos;ve met — you have{" "}
          <strong>{have}</strong> so far. Finish a lesson or two and come back!
        </p>
        <Button href="/learn" size="lg">
          Go learn some kana
        </Button>
      </div>
    </main>
  );
}
