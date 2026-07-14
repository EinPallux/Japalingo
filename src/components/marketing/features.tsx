import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

type Feature = { emoji: string; title: string; body: string };

const ACCENTS = ["bg-primary-tint", "bg-secondary-tint", "bg-accent-tint", "bg-primary-tint"];

export function Features() {
  const t = useTranslations("features");
  const items = t.raw("items") as Feature[];

  return (
    <section id="features" className="scroll-mt-24 bg-surface-2/60 py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-4">
          {items.map((item, i) => (
            <Reveal key={item.title} delay={i * 0.08}>
              <div className="h-full rounded-blob-lg border border-border bg-surface p-6 shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)]">
                <span
                  className={`mb-4 grid size-14 place-items-center rounded-blob text-3xl ${ACCENTS[i % ACCENTS.length]}`}
                >
                  {item.emoji}
                </span>
                <h3 className="mb-2 font-display text-lg font-bold text-ink">{item.title}</h3>
                <p className="text-sm text-muted">{item.body}</p>
              </div>
            </Reveal>
          ))}
        </div>
      </Container>
    </section>
  );
}
