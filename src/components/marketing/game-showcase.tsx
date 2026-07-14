import { useTranslations } from "next-intl";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";
import { Reveal } from "@/components/ui/reveal";
import { SectionHeading } from "@/components/ui/section-heading";

type Game = { emoji: string; name: string; tag: string; desc: string };

export function GameShowcase() {
  const t = useTranslations("games");
  const items = t.raw("items") as Game[];

  return (
    <section id="games" className="scroll-mt-24 py-20 sm:py-24">
      <Container>
        <SectionHeading eyebrow={t("eyebrow")} title={t("title")} subtitle={t("subtitle")} />

        <div className="mt-14 grid gap-6 sm:grid-cols-2 lg:grid-cols-3">
          {items.map((game, i) => {
            const signature = i === 0;
            return (
              <Reveal key={game.name} delay={i * 0.07}>
                <div
                  className={`group relative h-full overflow-hidden rounded-blob-lg border p-6 shadow-[var(--shadow-soft)] transition duration-200 hover:-translate-y-1 hover:shadow-[var(--shadow-lift)] ${
                    signature
                      ? "border-primary/40 bg-primary-tint"
                      : "border-border bg-surface"
                  }`}
                >
                  <div className="mb-4 flex items-center justify-between">
                    <span
                      aria-hidden
                      className="text-4xl transition-transform duration-200 group-hover:scale-110"
                    >
                      {game.emoji}
                    </span>
                    <Pill tone={signature ? "primary" : "neutral"}>{game.tag}</Pill>
                  </div>
                  <h3 className="mb-2 font-display text-xl font-bold text-ink">{game.name}</h3>
                  <p className="text-sm text-muted">{game.desc}</p>
                </div>
              </Reveal>
            );
          })}
        </div>

        <Reveal delay={0.1}>
          <p className="mt-8 text-center text-sm font-semibold text-muted">{t("more")}</p>
        </Reveal>
      </Container>
    </section>
  );
}
