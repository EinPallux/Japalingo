"use client";

import { HoshiStatic } from "@/components/mascot/hoshi-static";

export default function ErrorPage({ reset }: { error: Error & { digest?: string }; reset: () => void }) {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10 text-center">
      <div className="flex max-w-sm flex-col items-center gap-5">
        <HoshiStatic className="size-28 opacity-80" />
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Something went wrong</h1>
          <p className="mt-2 text-muted">
            Hoshi tripped over a bug. Your progress is saved on this device — nothing is lost.
          </p>
        </div>
        <div className="flex w-full flex-col gap-3">
          <button
            type="button"
            onClick={reset}
            className="btn-chunky rounded-blob-xl bg-primary px-7 py-4 font-display text-lg font-semibold text-white shadow-[0_6px_0_0_var(--jl-primary-strong)] transition hover:brightness-105"
          >
            Try again
          </button>
          <a
            href="/learn"
            className="btn-chunky rounded-blob-xl border-2 border-border bg-surface px-7 py-4 font-display text-lg font-semibold text-ink shadow-[0_6px_0_0_var(--jl-border)] transition hover:bg-surface-2"
          >
            Back to learning
          </a>
        </div>
      </div>
    </main>
  );
}
