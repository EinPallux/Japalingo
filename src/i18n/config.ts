export const locales = ["en", "de"] as const;
export type Locale = (typeof locales)[number];

export const defaultLocale: Locale = "en";

/** Cookie that stores the visitor's chosen UI language (no i18n routing needed). */
export const LOCALE_COOKIE = "japalingo.locale";

export const localeNames: Record<Locale, string> = {
  en: "English",
  de: "Deutsch",
};

export function isLocale(value: string | undefined): value is Locale {
  return !!value && (locales as readonly string[]).includes(value);
}
