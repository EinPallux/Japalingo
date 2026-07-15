"use client";

import { useState, useSyncExternalStore } from "react";

const DISMISS_KEY = "japalingo-a2hs-dismissed";

/** iOS Safari, not already running as an installed standalone app. */
function shouldOfferInstall(): boolean {
  if (typeof navigator === "undefined" || typeof window === "undefined") return false;
  const ua = navigator.userAgent;
  const isIOS =
    /iPad|iPhone|iPod/.test(ua) ||
    // iPadOS 13+ reports as desktop Safari but has touch points.
    (navigator.platform === "MacIntel" && navigator.maxTouchPoints > 1);
  if (!isIOS) return false;
  // A2HS only works from Safari — skip Chrome/Firefox/Edge on iOS.
  if (/CriOS|FxiOS|EdgiOS/.test(ua)) return false;
  const standalone =
    window.matchMedia("(display-mode: standalone)").matches ||
    (navigator as unknown as { standalone?: boolean }).standalone === true;
  return !standalone;
}

const subscribe = () => () => {};

/** Eligibility is a client-only read (navigator + localStorage); routed through
 *  useSyncExternalStore so it stays false during SSR/hydration (no mismatch). */
function getSnapshot(): boolean {
  try {
    if (localStorage.getItem(DISMISS_KEY)) return false;
  } catch {
    /* private mode — fall through and offer it */
  }
  return shouldOfferInstall();
}

/**
 * A small, dismissible hint nudging iPhone/iPad users to install Japalingo to the
 * home screen for the full-screen, offline app. iOS has no install-prompt API, so
 * this explains the Share → "Add to Home Screen" flow. Shown once per device until
 * dismissed; never renders on other platforms or inside the installed app.
 */
export function IosInstallHint() {
  const [dismissed, setDismissed] = useState(false);
  const eligible = useSyncExternalStore(subscribe, getSnapshot, () => false);

  if (!eligible || dismissed) return null;

  const dismiss = () => {
    setDismissed(true);
    try {
      localStorage.setItem(DISMISS_KEY, "1");
    } catch {
      /* ignore */
    }
  };

  return (
    <div className="flex items-start gap-3 rounded-blob-lg border border-primary/30 bg-gradient-to-r from-primary-tint to-secondary-tint px-4 py-3">
      <span aria-hidden className="text-2xl">
        📲
      </span>
      <div className="min-w-0 flex-1">
        <p className="font-display text-sm font-bold text-ink">Install Japalingo</p>
        <p className="text-xs text-muted">
          Tap{" "}
          <span aria-label="the Share button" className="font-bold text-primary">
            Share ⬆️
          </span>{" "}
          in Safari, then <span className="font-bold">Add to Home Screen</span> — for the full-screen
          app that works offline.
        </p>
      </div>
      <button
        type="button"
        onClick={dismiss}
        aria-label="Dismiss install hint"
        className="grid size-7 shrink-0 place-items-center rounded-full text-muted transition hover:bg-surface-2"
      >
        ✕
      </button>
    </div>
  );
}
