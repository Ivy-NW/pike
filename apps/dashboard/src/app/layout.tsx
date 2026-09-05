import type { ReactNode } from "react";
import { Orbitron, Inter } from "next/font/google";
import { themeInitScript } from "@pike/design-tokens";
import "./globals.css";

const orbitron = Orbitron({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-orbitron", display: "swap" });
const inter = Inter({ subsets: ["latin"], weight: ["400", "500", "600", "700"], variable: "--font-inter", display: "swap" });

export const metadata = {
  title: "PIKE Business Dashboard",
  description: "Create quests, manage venues, and track redemptions.",
  icons: {
    icon: "/favicon.png",
  },
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en" className={`${orbitron.variable} ${inter.variable}`} suppressHydrationWarning>
      <head>
        <script dangerouslySetInnerHTML={{ __html: themeInitScript }} />
      </head>
      <body>{children}</body>
    </html>
  );
}
