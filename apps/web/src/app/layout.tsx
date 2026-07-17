import type { ReactNode } from "react";
import { Inter, Space_Grotesk } from "next/font/google";
import "./globals.css";

const bodyFont = Inter({ subsets: ["latin"], variable: "--font-body", display: "swap" });
const headingFont = Space_Grotesk({ subsets: ["latin"], variable: "--font-heading", display: "swap" });

export const metadata = {
  title: "PIKE — Turn a visit into a quest",
  description:
    "Point your camera at a marker, complete the quest, and walk away with a reward. No app required to start.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${bodyFont.variable} ${headingFont.variable}`}>
      <body>{children}</body>
    </html>
  );
}
