import { getRequestConfig } from "next-intl/server";
import { cookies } from "next/headers";
import { defaultLocale, isLocale, LOCALE_COOKIE, type Locale } from "./config";

/**
 * next-intl request config (no i18n routing): the active locale comes from a
 * cookie set by the language toggle and defaults to English. German is ready.
 *
 * NOTE: reading cookies() here intentionally opts all routes into on-demand
 * (SSR) rendering rather than static generation. That is an accepted trade-off
 * for the cookie-based, no-routing locale strategy; if static prerendering per
 * locale is ever needed, move the locale into the URL ([locale] segments).
 */
export default getRequestConfig(async () => {
  const store = await cookies();
  const cookieLocale = store.get(LOCALE_COOKIE)?.value;
  const locale: Locale = isLocale(cookieLocale) ? cookieLocale : defaultLocale;

  return {
    locale,
    messages: (await import(`../../messages/${locale}.json`)).default,
  };
});
