import Link from "next/link";
import { HoshiStatic } from "@/components/mascot/hoshi-static";

export default function NotFound() {
  return (
    <main className="grid min-h-dvh place-items-center px-5 py-10 text-center">
      <div className="flex max-w-sm flex-col items-center gap-5">
        <HoshiStatic className="size-28 opacity-80" />
        <div>
          <h1 className="font-display text-3xl font-bold text-ink">Page not found</h1>
          <p className="mt-2 text-muted">
            Hoshi sniffed everywhere, but this page doesn&apos;t exist (or isn&apos;t unlocked yet).
          </p>
        </div>
        <Link
          href="/learn"
          className="btn-chunky rounded-blob-xl bg-primary px-7 py-4 font-display text-lg font-semibold text-white shadow-[0_6px_0_0_var(--jl-primary-strong)] transition hover:brightness-105"
        >
          Back to learning
        </Link>
      </div>
    </main>
  );
}
