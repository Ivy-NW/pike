import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "PIKE Business Dashboard",
  description: "Create quests, manage venues, and track redemptions.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
