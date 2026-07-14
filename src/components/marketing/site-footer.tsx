import Link from "next/link";
import { useTranslations } from "next-intl";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Container } from "@/components/ui/container";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function SiteFooter() {
  const t = useTranslations("footer");

  const columns = [
    {
      heading: t("product"),
      links: [
        { label: t("links.features"), href: "#features" },
        { label: t("links.games"), href: "#games" },
        { label: t("links.how"), href: "#how" },
        { label: t("links.roadmap"), href: "/learn" },
      ],
    },
    {
      heading: t("learn"),
      links: [
        { label: t("links.hiragana"), href: "/learn" },
        { label: t("links.katakana"), href: "/learn" },
      ],
    },
    {
      heading: t("about"),
      links: [
        { label: t("links.github"), href: "/learn" },
        { label: t("links.credits"), href: "/learn" },
      ],
    },
  ];

  return (
    <footer className="border-t border-border bg-surface">
      <Container className="py-14">
        <div className="grid gap-10 md:grid-cols-[1.4fr_1fr_1fr_1fr]">
          <div className="flex flex-col gap-3">
            <Link href="/" className="flex items-center gap-2" aria-label="Japalingo home">
              <HoshiStatic className="size-9" />
              <span className="font-display text-xl font-bold text-ink">Japalingo</span>
            </Link>
            <p className="max-w-xs text-sm text-muted">{t("tagline")}</p>
            <div className="mt-1 flex items-center gap-2">
              <LanguageToggle />
              <ThemeToggle />
            </div>
          </div>

          {columns.map((col) => (
            <div key={col.heading} className="flex flex-col gap-3">
              <h3 className="font-display text-sm font-bold uppercase tracking-wide text-ink">
                {col.heading}
              </h3>
              <ul className="flex flex-col gap-2">
                {col.links.map((link) => (
                  <li key={link.label}>
                    <Link
                      href={link.href}
                      className="text-sm text-muted transition hover:text-primary"
                    >
                      {link.label}
                    </Link>
                  </li>
                ))}
              </ul>
            </div>
          ))}
        </div>

        <div className="mt-12 flex flex-col gap-2 border-t border-border pt-6 text-sm text-muted sm:flex-row sm:items-center sm:justify-between">
          <p className="max-w-xl">{t("credits")}</p>
          <p className="shrink-0">{t("rights")}</p>
        </div>
      </Container>
    </footer>
  );
}
