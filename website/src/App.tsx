import { DownloadSection } from "./components/DownloadSection";
import { FAQ } from "./components/FAQ";
import { Features } from "./components/Features";
import { Footer } from "./components/Footer";
import { Header } from "./components/Header";
import { Hero } from "./components/Hero";

export default function App() {
  return (
    <div className="min-h-screen">
      <Header />
      <main>
        <Hero />
        <Features />
        <DownloadSection />
        <FAQ />
      </main>
      <Footer />
    </div>
  );
}
