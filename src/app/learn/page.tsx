import type { Metadata } from "next";
import { useTranslations } from "next-intl";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { Pill } from "@/components/ui/pill";

export const metadata: Metadata = {
  title: "Coming soon — Japalingo",
};

export default function LearnPage() {
  const t = useTranslations("soon");

  return (
    <main className="grid min-h-dvh place-items-center py-16">
      <Container className="flex max-w-xl flex-col items-center gap-6 text-center">
        <HoshiStatic className="size-40 drop-shadow-[0_20px_40px_rgba(42,42,74,0.22)]" />
        <Pill tone="accent">{t("badge")}</Pill>
        <h1 className="text-balance font-display text-3xl font-bold text-ink sm:text-4xl">
          {t("title")}
        </h1>
        <p className="text-balance text-lg text-muted">{t("body")}</p>
        <Button href="/" size="lg">
          {t("back")}
        </Button>
      </Container>
    </main>
  );
}
