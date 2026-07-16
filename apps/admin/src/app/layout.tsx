import type { ReactNode } from "react";
import "./globals.css";

export const metadata = {
  title: "PIKE Admin",
  description: "Platform oversight for PIKE.",
};

export default function RootLayout({ children }: { children: ReactNode }) {
  return (
    <html lang="en">
      <body>{children}</body>
    </html>
  );
}
