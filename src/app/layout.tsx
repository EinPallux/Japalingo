import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { ThemeProvider } from "@/components/theme-provider";
import "@/styles/globals.css";

const fredoka = Fredoka({
  subsets: ["latin"],
  weight: ["400", "500", "600", "700"],
  variable: "--font-fredoka",
  display: "swap",
});

const nunito = Nunito({
  subsets: ["latin"],
  weight: ["400", "600", "700", "800"],
  variable: "--font-nunito",
  display: "swap",
});

// Self-hosted, kana-subset M PLUS Rounded 1c (see src/fonts, built from the Tofugu-era
// M PLUS Rounded 1c OFL font). Keeps Japanese text on-brand without an external CDN.
const jpRounded = localFont({
  src: [
    { path: "../fonts/MPLUSRounded1c-Regular.woff2", weight: "400", style: "normal" },
    { path: "../fonts/MPLUSRounded1c-Medium.woff2", weight: "500", style: "normal" },
    { path: "../fonts/MPLUSRounded1c-Bold.woff2", weight: "700", style: "normal" },
  ],
  variable: "--font-jp-rounded",
  display: "swap",
  fallback: ["IPAGothic", "Noto Sans JP", "Hiragino Sans", "Yu Gothic", "sans-serif"],
});

export async function generateMetadata(): Promise<Metadata> {
  const t = await getTranslations("meta");
  return {
    title: t("title"),
    description: t("description"),
    applicationName: "Japalingo",
    metadataBase: new URL("https://japalingo.vercel.app"),
    openGraph: {
      title: t("title"),
      description: t("description"),
      type: "website",
      siteName: "Japalingo",
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
    },
  };
}

export const viewport: Viewport = {
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7fd" },
    { media: "(prefers-color-scheme: dark)", color: "#111129" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${fredoka.variable} ${nunito.variable} ${jpRounded.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}>
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
