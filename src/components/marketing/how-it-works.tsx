import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

type Step = { emoji: string; title: string; body: string };

export function HowItWorks() {
  const t = useTranslations("how");
  const steps = t.raw("steps") as Step[];

  return (
    <section id="how" className="scroll-mt-24 py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid gap-6 md:grid-cols-3">
          {steps.map((step, i) => (
            <Reveal key={step.title} delay={i * 0.1}>
              <div className="relative h-full rounded-blob-lg border border-border bg-surface p-7 shadow-[var(--shadow-soft)]">
                <div className="mb-5 flex items-center justify-between">
                  <span className="grid size-14 place-items-center rounded-blob bg-primary-tint text-3xl">
                    {step.emoji}
                  </span>
                  <span className="font-display text-5xl font-bold text-border">{i + 1}</span>
                </div>
                <h3 className="mb-2 font-display text-xl font-bold text-ink">{step.title}</h3>
                <p className="text-muted">{step.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
