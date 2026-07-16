import { Header } from "@/components/Header";
import { Hero } from "@/components/Hero";
import { HowItWorks } from "@/components/HowItWorks";
import { ForBusinesses } from "@/components/ForBusinesses";
import { AppDownload } from "@/components/AppDownload";
import { Footer } from "@/components/Footer";

export default function HomePage() {
  return (
    <>
      <Header />
      <main>
        <Hero />
        <HowItWorks />
        <ForBusinesses />
        <AppDownload />
      </main>
      <Footer />
    </>
  );
}
