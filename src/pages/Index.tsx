import Header from "@/components/Header";
import VideoHeroSection from "@/components/VideoHeroSection";
import EditorSection from "@/components/EditorSection";
import FeaturesSection from "@/components/FeaturesSection";
import TestimonialsSection from "@/components/TestimonialsSection";
import PricingSection from "@/components/PricingSection";
import InstitutionsSection from "@/components/InstitutionsSection";
import ContactSection from "@/components/ContactSection";
import Footer from "@/components/Footer";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Check, Star, Crown, Zap } from "lucide-react";
import { useNavigate } from "react-router-dom";

const Index = () => {
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
};

export default Index;
