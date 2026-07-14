"use client";

import { useRouter } from "next/navigation";
import { useMemo, useState } from "react";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { CloseIcon } from "@/components/ui/icons";
import { sfx } from "@/lib/audio";
import { useMounted } from "@/lib/use-mounted";
import { useProgress } from "@/stores/progress";
import type { Lesson } from "@/types";
import { buildQueue } from "./build-queue";
import { KanaDrill } from "./modes/kana-drill";
import { MnemonicStory } from "./modes/mnemonic-story";
import { QuickMatch } from "./modes/quick-match";
import { LessonResults } from "./results";

export function LessonPlayer({ lesson }: { lesson: Lesson }) {
  const router = useRouter();
  const mounted = useMounted();
  const queue = useMemo(() => buildQueue(lesson), [lesson]);
  const [index, setIndex] = useState(0);
  const [done, setDone] = useState(false);
  const [earnedXp, setEarnedXp] = useState(0);
  const [xpBefore] = useState(() => useProgress.getState().xp);

  const answer = useProgress((s) => s.answer);
  const rate = useProgress((s) => s.rate);
  const markSeen = useProgress((s) => s.markSeen);
  const completeLesson = useProgress((s) => s.completeLesson);

  const exit = () => router.push("/learn");

  const advance = () => {
    if (index + 1 >= queue.length) {
      completeLesson(lesson.id);
      sfx.complete();
      setEarnedXp(useProgress.getState().xp - xpBefore);
      setDone(true);
    } else {
      setIndex((i) => i + 1);
    }
  };

  // Gate randomized exercises (review lessons shuffle their first item) behind
  // mount so the server render never mismatches the client's first render.
  if (!mounted) {
    return (
      <main id="main" className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </main>
    );
  }

  if (done) {
    return <LessonResults lesson={lesson} xpEarned={earnedXp} onContinue={exit} />;
  }

  const ex = queue[index];
  const pct = Math.round((index / Math.max(queue.length, 1)) * 100);

  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-2xl flex-col px-4 py-5">
      <div className="mb-8 flex items-center gap-4">
        <button
          type="button"
          aria-label="Exit lesson"
          onClick={exit}
          className="grid size-11 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2"
        >
          <CloseIcon className="size-6" />
        </button>
        <div
          className="h-4 flex-1 overflow-hidden rounded-full bg-surface-2"
          role="progressbar"
          aria-valuenow={pct}
          aria-valuemin={0}
          aria-valuemax={100}
        >
          <div
            className="h-full rounded-full bg-success transition-all duration-300"
            style={{ width: `${pct}%` }}
          />
        </div>
      </div>

      <div className="flex flex-1 items-center justify-center py-4">
        {ex?.kind === "mnemonic" && (
          <MnemonicStory
            key={index}
            kana={ex.kana}
            onContinue={() => {
              markSeen(ex.kana.id);
              advance();
            }}
          />
        )}
        {ex?.kind === "choice" && (
          <QuickMatch
            key={index}
            kana={ex.kana}
            direction={ex.direction}
            options={ex.options}
            onAnswer={(correct) => {
              answer(ex.kana.id, correct);
              advance();
            }}
          />
        )}
        {ex?.kind === "drill" && (
          <KanaDrill
            key={index}
            kana={ex.kana}
            onRate={(grade) => {
              rate(ex.kana.id, grade);
              advance();
            }}
          />
        )}
      </div>
    </main>
  );
}
