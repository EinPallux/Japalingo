import type { Metadata, Viewport } from "next";
import { Fredoka, Nunito } from "next/font/google";
import localFont from "next/font/local";
import { NextIntlClientProvider } from "next-intl";
import { getLocale, getMessages, getTranslations } from "next-intl/server";
import { AudioSync } from "@/components/app/audio-sync";
import { ServiceWorkerRegister } from "@/components/app/service-worker-register";
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
      images: [
        {
          url: "/og.png",
          width: 1200,
          height: 630,
          alt: "Japalingo — learn to read Japanese, the fun way",
        },
      ],
    },
    twitter: {
      card: "summary_large_image",
      title: t("title"),
      description: t("description"),
      images: ["/og.png"],
    },
    icons: {
      icon: [{ url: "/favicon.svg", type: "image/svg+xml" }],
      apple: [{ url: "/apple-touch-icon.png", sizes: "180x180" }],
    },
    // Installable-app metadata for iOS "Add to Home Screen".
    appleWebApp: {
      capable: true,
      title: "Japalingo",
      statusBarStyle: "default",
    },
    other: {
      // Next emits the standard `mobile-web-app-capable` from appleWebApp.capable;
      // add the legacy Apple tag too, for iOS versions before 16.4.
      "apple-mobile-web-app-capable": "yes",
    },
  };
}

export const viewport: Viewport = {
  // Extend under the notch/home indicator so safe-area insets can be honored.
  viewportFit: "cover",
  themeColor: [
    { media: "(prefers-color-scheme: light)", color: "#f7f7fd" },
    { media: "(prefers-color-scheme: dark)", color: "#111129" },
  ],
};

export default async function RootLayout({ children }: { children: React.ReactNode }) {
  const locale = await getLocale();
  const messages = await getMessages();
  const t = await getTranslations("nav");

  return (
    <html
      lang={locale}
      suppressHydrationWarning
      className={`${fredoka.variable} ${nunito.variable} ${jpRounded.variable}`}
    >
      <body className="min-h-dvh antialiased">
        <a
          href="#main"
          className="sr-only rounded-blob bg-primary px-4 py-2 font-display font-semibold text-white focus:not-sr-only focus:absolute focus:left-4 focus:top-4 focus:z-[100]"
        >
          {t("skip")}
        </a>
        <ThemeProvider attribute="data-theme" defaultTheme="light" enableSystem disableTransitionOnChange>
          <NextIntlClientProvider locale={locale} messages={messages}>
            <AudioSync />
            <ServiceWorkerRegister />
            {children}
          </NextIntlClientProvider>
        </ThemeProvider>
      </body>
    </html>
  );
}
