import { Features } from "@/components/marketing/features";
import { FinalCta } from "@/components/marketing/final-cta";
import { GameShowcase } from "@/components/marketing/game-showcase";
import { Hero } from "@/components/marketing/hero";
import { HowItWorks } from "@/components/marketing/how-it-works";
import { ReadingMoment } from "@/components/marketing/reading-moment";
import { SiteFooter } from "@/components/marketing/site-footer";
import { SiteNav } from "@/components/marketing/site-nav";

export default function HomePage() {
  return (
    <>
      <SiteNav />
      <main>
        <Hero />
        <HowItWorks />
        <Features />
        <GameShowcase />
        <ReadingMoment />
        <FinalCta />
      </main>
      <SiteFooter />
    </>
  );
}
