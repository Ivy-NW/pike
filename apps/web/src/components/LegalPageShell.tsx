import type { ReactNode } from "react";
import { LandingFooter } from "@/components/landing/LandingFooter";
import { LandingHeader } from "@/components/landing/LandingHeader";

export function LegalPageShell({
  crumb,
  title,
  updated,
  intro,
  children,
}: {
  crumb: string;
  title: string;
  updated: string;
  intro?: ReactNode;
  children: ReactNode;
}) {
  return (
    <>
      <LandingHeader />
      <main id="main-content" className="container legal-page">
        <article className="legal-page__panel legal-content">
          <p className="legal-page__meta">{crumb}</p>
          <h1 className="section-heading">{title}</h1>
          <p className="legal-content__updated">Last updated: {updated}</p>
          {intro ? <p className="legal-content__lede">{intro}</p> : null}
          {children}
        </article>
      </main>
      <LandingFooter />
    </>
  );
}
