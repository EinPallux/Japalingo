import type { MetadataRoute } from "next";

/**
 * Web App Manifest — makes Japalingo installable as a standalone app (iOS "Add to
 * Home Screen", Android/desktop install). Next injects the <link rel="manifest">
 * automatically. `start_url` drops the learner straight into the path.
 */
export default function manifest(): MetadataRoute.Manifest {
  return {
    name: "Japalingo — Learn to read Japanese",
    short_name: "Japalingo",
    description:
      "Learn to read Japanese — the fun way. Master hiragana & katakana with playful mnemonics, mini-games, and spaced repetition.",
    id: "/",
    start_url: "/learn",
    scope: "/",
    display: "standalone",
    orientation: "portrait",
    background_color: "#f7f7fd",
    theme_color: "#5b5bf6",
    lang: "en",
    dir: "ltr",
    categories: ["education"],
    icons: [
      { src: "/icon-192.png", sizes: "192x192", type: "image/png", purpose: "any" },
      { src: "/icon-512.png", sizes: "512x512", type: "image/png", purpose: "any" },
      { src: "/icon-maskable-512.png", sizes: "512x512", type: "image/png", purpose: "maskable" },
    ],
  };
}
