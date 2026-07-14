"use client";

import { useTheme } from "next-themes";
import { useTranslations } from "next-intl";
import { useMounted } from "@/lib/use-mounted";
import { MoonIcon, SunIcon } from "./icons";

export function ThemeToggle() {
  const { resolvedTheme, setTheme } = useTheme();
  const t = useTranslations("nav");
  const mounted = useMounted();

  const isDark = resolvedTheme === "dark";

  return (
    <button
      type="button"
      aria-label={t("theme")}
      aria-pressed={mounted ? isDark : undefined}
      onClick={() => setTheme(isDark ? "light" : "dark")}
      className="grid size-11 shrink-0 place-items-center rounded-full border-2 border-border bg-surface text-ink transition hover:bg-surface-2"
    >
      {mounted ? (
        isDark ? (
          <SunIcon className="size-5" />
        ) : (
          <MoonIcon className="size-5" />
        )
      ) : (
        <span className="size-5" />
      )}
    </button>
  );
}
