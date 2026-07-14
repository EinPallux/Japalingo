"use client";

import { AppHeader } from "@/components/app/app-header";
import { HoshiStatic } from "@/components/mascot/hoshi-static";
import { Onboarding } from "@/features/onboarding/onboarding";
import { PathView } from "@/features/path/path-view";
import { useMounted } from "@/lib/use-mounted";
import { useProgress } from "@/stores/progress";

export function LearnDashboard() {
  const mounted = useMounted();
  const onboarded = useProgress((s) => s.onboardingComplete);

  if (!mounted) {
    return (
      <div className="grid min-h-dvh place-items-center">
        <HoshiStatic className="size-24 opacity-70" />
      </div>
    );
  }

  if (!onboarded) return <Onboarding />;

  return (
    <>
      <AppHeader />
      <main id="main">
        <PathView />
      </main>
    </>
  );
}
