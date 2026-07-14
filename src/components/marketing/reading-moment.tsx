"use client";

import { AnimatePresence, motion } from "framer-motion";
import { useTranslations } from "next-intl";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

type Word = { kana: string; romaji: string; meaning: string };

export function ReadingMoment() {
  const t = useTranslations("reading");
  const words = t.raw("words") as Word[];
  const [revealed, setRevealed] = useState<Set<number>>(new Set());

  const toggle = (i: number) =>
    setRevealed((prev) => {
      const next = new Set(prev);
      if (next.has(i)) {
        next.delete(i);
      } else {
        next.add(i);
      }
      return next;
    });

  return (
    <section className="bg-surface-2/60 py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <Reveal delay={0.1}>
          <ul className="mt-14 flex flex-wrap justify-center gap-4">
            {words.map((word, i) => {
              const isOpen = revealed.has(i);
              return (
                <li key={word.kana}>
                  <button
                    type="button"
                    onClick={() => toggle(i)}
                    aria-pressed={isOpen}
                    className="flex h-40 w-36 flex-col items-center justify-center gap-2 rounded-blob-lg border-2 border-border bg-surface p-4 text-center shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-1 hover:border-primary/40 hover:shadow-[var(--shadow-lift)]"
                  >
                    <span lang="ja" className="font-jp text-5xl font-bold text-ink">
                      {word.kana}
                    </span>
                    <AnimatePresence mode="wait" initial={false}>
                      {isOpen ? (
                        <motion.span
                          key="answer"
                          initial={{ opacity: 0, y: 6, scale: 0.9 }}
                          animate={{ opacity: 1, y: 0, scale: 1 }}
                          exit={{ opacity: 0 }}
                          transition={{ duration: 0.25, ease: [0.22, 1, 0.36, 1] }}
                          className="flex flex-col"
                        >
                          <span className="font-display font-bold text-primary">{word.romaji}</span>
                          <span className="text-sm font-semibold text-success-strong">
                            {word.meaning}
                          </span>
                        </motion.span>
                      ) : (
                        <motion.span
                          key="hint"
                          initial={{ opacity: 0 }}
                          animate={{ opacity: 1 }}
                          exit={{ opacity: 0 }}
                          className="text-xs font-bold uppercase tracking-wide text-muted"
                        >
                          {t("reveal")}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </button>
                </li>
              );
            })}
          </ul>
        </Reveal>

        <Reveal delay={0.15}>
          <div className="mt-10 flex flex-col items-center gap-4">
            <Button href="/learn" size="lg">
              {t("cta")}
            </Button>
            <p className="max-w-md text-center text-xs text-muted">{t("footnote")}</p>
          </div>
        </Reveal>
      </Container>
    </section>
  );
}
