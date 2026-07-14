"use client";

import { motion, useReducedMotion } from "framer-motion";
import { useTranslations } from "next-intl";
import { HoshiHero } from "@/components/mascot/hoshi-hero";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { ArrowRightIcon } from "@/components/ui/icons";
import { Pill } from "@/components/ui/pill";
import { Reveal } from "@/components/ui/reveal";

type Stat = { value: string; label: string };

const FLOATING_KANA = [
  { c: "あ", top: "10%", left: "4%", size: "text-6xl", tone: "text-primary/20", delay: 0 },
  { c: "ア", top: "68%", left: "8%", size: "text-5xl", tone: "text-secondary/25", delay: 0.6 },
  { c: "き", top: "16%", left: "90%", size: "text-5xl", tone: "text-accent-strong/25", delay: 1.1 },
  { c: "ラ", top: "74%", left: "86%", size: "text-6xl", tone: "text-info/25", delay: 0.3 },
  { c: "の", top: "42%", left: "94%", size: "text-4xl", tone: "text-primary/15", delay: 0.9 },
];

function FloatingKana() {
  const reduce = useReducedMotion();

  return (
    <div aria-hidden className="pointer-events-none absolute inset-0 overflow-hidden">
      {FLOATING_KANA.map((k) => (
        <motion.span
          key={k.c}
          className={`font-jp absolute font-bold ${k.size} ${k.tone}`}
          style={{ top: k.top, left: k.left }}
          animate={reduce ? undefined : { y: [0, -16, 0], rotate: [-5, 5, -5] }}
          transition={{ duration: 6 + k.delay, repeat: Infinity, ease: "easeInOut", delay: k.delay }}
        >
          {k.c}
        </motion.span>
      ))}
    </div>
  );
}

export function Hero() {
  const t = useTranslations("hero");
  const stats = t.raw("stats") as Stat[];

  return (
    <section className="relative overflow-hidden pb-16 pt-10 sm:pt-16 lg:pb-24 lg:pt-20">
      {/* decorative blobs */}
      <div
        aria-hidden
        className="absolute -left-24 top-0 size-72 rounded-full bg-primary/20 blur-3xl"
      />
      <div
        aria-hidden
        className="absolute -right-16 top-40 size-72 rounded-full bg-secondary/20 blur-3xl"
      />
      <FloatingKana />

      <Container className="relative grid items-center gap-10 lg:grid-cols-2 lg:gap-6">
        <div className="flex flex-col items-start gap-6">
          <Reveal>
            <Pill tone="accent">🎌 {t("badge")}</Pill>
          </Reveal>

          <Reveal delay={0.05}>
            <h1 className="text-balance font-display text-4xl font-bold leading-[1.05] tracking-tight text-ink sm:text-5xl lg:text-6xl">
              {t("titleLine1")}
              <br />
              <span className="bg-gradient-to-r from-primary to-secondary bg-clip-text text-transparent">
                {t("titleLine2")}
              </span>
            </h1>
          </Reveal>

          <Reveal delay={0.1}>
            <p className="max-w-xl text-balance text-lg text-muted">{t("subtitle")}</p>
          </Reveal>

          <Reveal delay={0.15}>
            <div className="flex flex-wrap items-center gap-3">
              <Button href="/learn" size="lg">
                {t("ctaPrimary")}
                <ArrowRightIcon className="size-5" />
              </Button>
              <Button href="/learn" size="lg" variant="outline">
                {t("ctaSecondary")}
              </Button>
            </div>
          </Reveal>

          <Reveal delay={0.2}>
            <p className="text-sm font-semibold text-muted">{t("trust")}</p>
          </Reveal>

          <Reveal delay={0.25}>
            <dl className="mt-2 flex flex-wrap gap-6">
              {stats.map((s) => (
                <div key={s.label} className="flex flex-col">
                  <dt className="font-display text-2xl font-bold text-primary">{s.value}</dt>
                  <dd className="text-sm font-semibold text-muted">{s.label}</dd>
                </div>
              ))}
            </dl>
          </Reveal>
        </div>

        <div className="flex justify-center lg:justify-end">
          <HoshiHero />
        </div>
      </Container>
    </section>
  );
}
