import Header from "@/components/Header";
import VideoHeroSection from "@/components/VideoHeroSection";
import EditorSection from "@/components/EditorSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import InstitutionsSection from "@/components/InstitutionsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

export default function Home() {
  return (
    <div className="min-h-screen">
      <Header />
      <VideoHeroSection />
      <div id="features">
        <FeaturesSection />
      </div>
      <EditorSection />
      <TestimonialsSection />
      <div id="pricing">
        <PricingSection />
      </div>
      <InstitutionsSection />
      <ContactSection />
      <Footer />
    </div>
  );
}
