"use client";

import Link from "next/link";
import { useTranslations } from "next-intl";
import { useRef, useState } from "react";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Button } from "@/components/ui/button";
import { Container } from "@/components/ui/container";
import { CloseIcon, MenuIcon } from "@/components/ui/icons";
import { LanguageToggle } from "@/components/ui/language-toggle";
import { ThemeToggle } from "@/components/ui/theme-toggle";

export function SiteNav() {
  const t = useTranslations("nav");
  const [open, setOpen] = useState(false);
  const toggleRef = useRef<HTMLButtonElement>(null);

  const links = [
    { href: "#how", label: t("how") },
    { href: "#features", label: t("features") },
    { href: "#games", label: t("games") },
  ];

  const closeAndRestoreFocus = () => {
    setOpen(false);
    toggleRef.current?.focus();
  };

  return (
    <header className="sticky top-0 z-50 border-b border-border/70 bg-bg/80 backdrop-blur-md">
      <Container className="flex h-16 items-center justify-between gap-3">
        <Link href="/" className="flex items-center gap-2" aria-label="Japalingo home">
          <HoshiStatic className="size-9" />
          <span className="font-display text-xl font-bold text-ink">Japalingo</span>
        </Link>

        <nav aria-label={t("menu")} className="hidden items-center gap-1 lg:flex">
          {links.map((l) => (
            <a
              key={l.href}
              href={l.href}
              className="rounded-full px-4 py-2 font-semibold whitespace-nowrap text-muted transition hover:bg-surface-2 hover:text-ink"
            >
              {l.label}
            </a>
          ))}
        </nav>

        <div className="flex items-center gap-2">
          <LanguageToggle />
          <ThemeToggle />
          <div className="hidden sm:block">
            <Button href="/learn" size="sm">
              {t("start")}
            </Button>
          </div>
          <button
            ref={toggleRef}
            type="button"
            aria-label={open ? t("closeMenu") : t("openMenu")}
            aria-expanded={open}
            aria-controls="mobile-nav"
            onClick={() => setOpen((o) => !o)}
            className="grid size-11 place-items-center rounded-full border-2 border-border bg-surface text-ink lg:hidden"
          >
            {open ? <CloseIcon className="size-5" /> : <MenuIcon className="size-5" />}
          </button>
        </div>
      </Container>

      {open ? (
        <nav
          id="mobile-nav"
          aria-label={t("menu")}
          onKeyDown={(e) => {
            if (e.key === "Escape") closeAndRestoreFocus();
          }}
          className="border-t border-border bg-surface lg:hidden"
        >
          <Container className="flex flex-col gap-1 py-4">
            {links.map((l) => (
              <a
                key={l.href}
                href={l.href}
                onClick={() => setOpen(false)}
                className="rounded-blob px-4 py-3 font-semibold text-ink transition hover:bg-surface-2"
              >
                {l.label}
              </a>
            ))}
            <Button href="/learn" className="mt-2 w-full">
              {t("start")}
            </Button>
          </Container>
        </nav>
      ) : null}
    </header>
  );
}
