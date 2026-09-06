import type { ReactNode } from "react";
import { Inter, Orbitron } from "next/font/google";
import { themeInitScript } from "@pike/design-tokens";
import "./globals.css";

const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });
const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-orbitron", display: "swap" });
const SITE_URL = process.env.NEXT_PUBLIC_SITE_URL ?? "https://pike.app";
const TITLE = "PIKE — Verified footfall for Nairobi venues";
const DESCRIPTION = "Pay for verified venue visits after a customer’s camera recognises your specific PIKE marker. Start with 100 free completions each month.";
const OG_IMAGE = "/images/landing/scan-poster.webp";

export const metadata = {
  metadataBase: new URL(SITE_URL), title: TITLE, description: DESCRIPTION, icons: { icon: "/favicon.png" },
  openGraph: { title: TITLE, description: DESCRIPTION, url: SITE_URL, siteName: "PIKE", type: "website", images: [{ url: OG_IMAGE, width: 720, height: 540, alt: "A PIKE marker-linked reward claim screen" }] },
  twitter: { card: "summary_large_image", title: TITLE, description: DESCRIPTION, images: [OG_IMAGE] },
};

const organizationJsonLd = { "@context": "https://schema.org", "@type": "Organization", name: "PIKE", url: SITE_URL, description: DESCRIPTION };

export default function RootLayout({ children }: { children: ReactNode }) {
  return <html lang="en" className={`${inter.variable} ${orbitron.variable}`} suppressHydrationWarning><head><script dangerouslySetInnerHTML={{ __html: `${themeInitScript};document.documentElement.setAttribute('data-js','');` }} /><script type="application/ld+json" dangerouslySetInnerHTML={{ __html: JSON.stringify(organizationJsonLd) }} /></head><body>{children}</body></html>;
}
