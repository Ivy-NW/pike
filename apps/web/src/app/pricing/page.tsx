import { LandingHeader } from "@/components/landing/LandingHeader";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { Pricing } from "@/components/landing/LandingSections";

export const metadata = { title: "PIKE pricing", description: "Start free with 100 verified visits a month, then buy prepaid packs with M-Pesa as you need more." };
export default function PricingPage() { return <><LandingHeader /><main id="main-content"><Pricing /></main><LandingFooter /></>; }
