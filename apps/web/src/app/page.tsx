import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { SocialProofStrip } from "@/components/SocialProofStrip";
import { VisitStory, PlayerJourney, ExperienceThemes, VenueValue, TrustLayer, BusinessCta } from "@/components/LandingSections";
import { TechnicalAdvantage } from "@/components/TechnicalAdvantage";
import { AppDownload } from "@/components/AppDownload";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return <><a className="skip-link" href="#main-content">Skip to main content</a><Header /><main id="main-content"><Hero /><SocialProofStrip /><VisitStory /><PlayerJourney /><ExperienceThemes /><VenueValue /><TechnicalAdvantage /><TrustLayer /><BusinessCta /><AppDownload /></main><Footer /></>;
}
