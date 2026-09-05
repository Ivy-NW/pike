import { Footer } from "@/components/Footer";
import { Header } from "@/components/Header";

export const metadata = { title: "Terms — PIKE" };

export default function TermsPage() {
  return (
    <>
      <Header />
      <main id="main-content" className="container legal-page">
        <article className="legal-page__panel">
          <p className="legal-page__meta">Legal / Terms</p>
          <h1 className="section-heading">Terms of Service</h1>
          <p className="section-subheading">
            PIKE&apos;s terms of service will be published here before launch. This page will cover
            player participation, venue campaigns, reward claims, and acceptable use.
          </p>
        </article>
      </main>
      <Footer />
    </>
  );
}
