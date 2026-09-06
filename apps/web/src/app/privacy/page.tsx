import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata = { title: "Privacy — PIKE" };

export default function PrivacyPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="container legal-page">
        <article className="legal-page__panel">
          <p className="legal-page__meta">Legal / Privacy</p>
          <h1 className="section-heading">Privacy Policy</h1>
          <p className="section-subheading">
            PIKE&apos;s full privacy policy will be published here before launch. Unauthenticated
            web-flow visitors are identified only at claim time, with no location tracking beyond
            the marker-scan event itself.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
