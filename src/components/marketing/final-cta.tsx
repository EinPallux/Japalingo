import { useTranslations } from "next-intl";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";

export function FinalCta() {
  const t = useTranslations("finalCta");

  return (
    <section className="py-20 sm:py-24">
      <Container>
        <div className="relative overflow-hidden rounded-blob-xl bg-gradient-to-br from-primary to-secondary px-6 py-16 text-center sm:px-12">
          <div
            aria-hidden
            className="absolute -right-10 -top-10 size-48 rounded-full bg-white/15 blur-2xl"
          />
          <div
            aria-hidden
            className="absolute -bottom-12 -left-8 size-56 rounded-full bg-white/10 blur-2xl"
          />
          {/* contrast scrim so white copy clears WCAG AA over the vivid gradient */}
          <div aria-hidden className="absolute inset-0 bg-ink/35" />

          <div className="relative">
            <Reveal>
              <HoshiStatic className="mx-auto mb-6 size-28 drop-shadow-[0_16px_30px_rgb(var(--jl-shadow)/0.35)]" />
            </Reveal>
            <Reveal delay={0.05}>
              <h2 className="text-balance font-display text-3xl font-bold text-white sm:text-4xl">
                {t("title")}
              </h2>
            </Reveal>
            <Reveal delay={0.1}>
              <p className="mx-auto mt-3 max-w-xl text-balance text-lg text-white">
                {t("subtitle")}
              </p>
            </Reveal>
            <Reveal delay={0.15}>
              <div className="mt-8 flex justify-center">
                <Button href="/learn" size="lg" variant="accent">
                  {t("cta")}
                </Button>
              </div>
            </Reveal>
            <Reveal delay={0.2}>
              <p className="mt-4 text-sm font-semibold text-white">{t("trust")}</p>
            </Reveal>
          </div>
        </div>
      </Container>
    </section>
  );
}
