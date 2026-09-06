import { LandingHeader } from "@/components/landing/LandingHeader";
import { VerifiedFootfallHero } from "@/components/landing/VerifiedFootfallHero";
import { AntiCheatProof, Attribution, AudienceRoutes, HowItWorks, Objections, WhyPlay, WhyVenues } from "@/components/landing/LandingSections";
import { FinalCta } from "@/components/landing/FinalCta";
import { LandingFooter } from "@/components/landing/LandingFooter";

export default function HomePage() {
  return <><a className="skip-link" href="#main-content">Skip to main content</a><LandingHeader /><main id="main-content"><VerifiedFootfallHero /><WhyVenues /><HowItWorks /><AntiCheatProof /><Attribution /><Objections /><AudienceRoutes /><WhyPlay /><FinalCta /></main><LandingFooter /></>;
}
