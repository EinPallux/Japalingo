"use client";

import { useLocale, useTranslations } from "next-intl";
import { useRouter } from "next/navigation";
import { useTransition } from "react";
import { setLocale } from "@/i18n/actions";
import type { Locale } from "@/i18n/config";

export function LanguageToggle() {
  const locale = useLocale();
  const t = useTranslations("nav");
  const router = useRouter();
  const [pending, startTransition] = useTransition();

  const next: Locale = locale === "en" ? "de" : "en";

  return (
    <button
      type="button"
      aria-label={`${t("language")}: ${locale.toUpperCase()}`}
      disabled={pending}
      onClick={() =>
        startTransition(async () => {
          await setLocale(next);
          router.refresh();
        })
      }
      className="grid h-11 min-w-11 shrink-0 place-items-center rounded-full border-2 border-border bg-surface px-3 font-display text-sm font-bold uppercase text-ink transition hover:bg-surface-2 disabled:opacity-60"
    >
      {locale}
    </button>
  );
}
