import Navbar from "@/components/landing/Navbar";
import Hero from "@/components/landing/Hero";
import Features from "@/components/landing/Features";
import HowItWorks from "@/components/landing/HowItWorks";
import StellarSection from "@/components/landing/StellarSection";
import Traditions from "@/components/landing/Traditions";
import FAQ from "@/components/landing/FAQ";
import CTASection from "@/components/landing/CTASection";
import Footer from "@/components/landing/Footer";

export default function Home() {
  return (
    <main>
      <Navbar />
      <Hero />
      <Features />
      <HowItWorks />
      <StellarSection />
      <Traditions />
      <FAQ />
      <CTASection />
      <Footer />
    </main>
  );
}
