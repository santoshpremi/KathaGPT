import { CTASection } from "./components/CTASection";
import { DownloadSection } from "./components/DownloadSection";
import { FAQ } from "./components/FAQ";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";
import { InstallSetup } from "./components/InstallSetup";
import { PageBackground } from "./components/PageBackground";
import { ProductShowcase } from "./components/ProductShowcase";
import { TechStack } from "./components/TechStack";
import { TrustBar } from "./components/TrustBar";

export default function App() {
  return (
    <div className="relative min-h-screen">
      <PageBackground id="fable" />
      <div className="relative z-10">
        <Header />
        <main>
          <Hero />
          <TrustBar />
          <ProductShowcase />
          <TechStack />
          <Features />
          <DownloadSection />
          <InstallSetup />
          <FAQ />
          <CTASection />
        </main>
        <Footer />
      </div>
    </div>
  );
}
