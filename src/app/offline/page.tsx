import type { Metadata } from "next";
import { HoshiStatic } from "@/components/mascot/hoshi-static";

export const metadata: Metadata = { title: "Offline — Japalingo" };

export default function OfflinePage() {
  return (
    <main id="main" className="mx-auto flex min-h-dvh max-w-md flex-col items-center justify-center gap-6 px-6 text-center">
      <HoshiStatic className="size-32" />
      <div>
        <h1 className="font-display text-3xl font-bold text-ink">You&apos;re offline</h1>
        <p className="mt-2 text-muted">
          Hoshi can&apos;t reach the internet right now. Pages you&apos;ve already opened still work
          offline — head back to the path to keep learning, and reconnect for anything new.
        </p>
      </div>
      <a
        href="/learn"
        className="rounded-blob bg-primary px-6 py-3 font-display font-bold text-white shadow-[0_4px_0_0_var(--jl-primary-strong)] transition active:translate-y-0.5"
      >
        Back to learning
      </a>
    </main>
  );
}
