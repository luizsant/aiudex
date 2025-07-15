import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon, Play } from "lucide-react";
import TestimonialsSection from "@/components/TestimonialsSection";
import FeaturesSection from "@/components/FeaturesSection";
import BenefitsSection from "@/components/BenefitsSection";
import StatsSection from "@/components/StatsSection";
import { testimonials } from "@/lib/testimonials-data";

interface LandingPageLayoutProps {
  // Configuração do tema
  theme: {
    primaryColor: string;
    secondaryColor: string;
    gradientFrom: string;
    gradientTo: string;
    badgeBgColor: string;
    badgeTextColor: string;
  };

  // Configuração do header
  header: {
    logoIcon: LucideIcon;
    ctaText: string;
  };

  // Configuração do hero
  hero: {
    badgeIcon: LucideIcon;
    badgeText: string;
    title: string;
    subtitle: string;
    primaryButtonText: string;
    secondaryButtonText: string;
    showStats?: boolean;
    stats?: any[];
  };

  // Seções opcionais
  sections?: {
    comparison?: {
      title: string;
      subtitle: string;
      before: {
        title: string;
        icon: LucideIcon;
        items: string[];
      };
      after: {
        title: string;
        icon: LucideIcon;
        items: string[];
      };
    };
    features?: any[];
    benefits?: any[];
    customSections?: React.ReactNode[];
  };

  // Configuração dos depoimentos
  testimonialsConfig?: {
    testimonials?: any[];
  };
}

const LandingPageLayout: React.FC<LandingPageLayoutProps> = ({
  theme,
  header,
  hero,
  sections = {},
  testimonialsConfig,
}) => {
  const HeaderIcon = header.logoIcon;
  const BadgeIcon = hero.badgeIcon;

  return (
    <div
      className={`min-h-screen bg-gradient-to-br ${theme.gradientFrom} ${theme.gradientTo}`}>
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div
                className={`w-8 h-8 bg-gradient-to-r ${theme.primaryColor} ${theme.secondaryColor} rounded-lg flex items-center justify-center`}>
                <HeaderIcon className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JurisAI</span>
            </div>
            <Button variant="outline" className="hidden md:flex">
              {header.ctaText}
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div
              className={`inline-flex items-center ${theme.badgeBgColor} ${theme.badgeTextColor} px-4 py-2 rounded-full text-sm font-semibold mb-6`}>
              <BadgeIcon className="w-4 h-4 mr-2" />
              {hero.badgeText}
            </div>

            <h1
              className={`text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r ${theme.primaryColor} ${theme.secondaryColor} bg-clip-text text-transparent`}>
              {hero.title}
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              {hero.subtitle}
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className={`bg-gradient-to-r ${theme.primaryColor} ${theme.secondaryColor} hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg`}>
                <Play className="w-5 h-5 mr-2" />
                {hero.primaryButtonText}
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                {hero.secondaryButtonText}
              </Button>
            </div>

            {/* Stats */}
            {hero.showStats && hero.stats && (
              <StatsSection stats={hero.stats} />
            )}
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      {sections.comparison && (
        <section className="py-20 bg-white">
          <div className="container mx-auto px-4">
            <div className="text-center mb-16">
              <h2 className="text-4xl md:text-5xl font-bold mb-6">
                {sections.comparison.title}
              </h2>
              <p className="text-xl text-gray-600 max-w-3xl mx-auto">
                {sections.comparison.subtitle}
              </p>
            </div>

            <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
              {/* Before */}
              <Card className="border-red-200 bg-red-50">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <sections.comparison.before.icon className="w-8 h-8 text-red-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-red-700 mb-2">
                      {sections.comparison.before.title}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {sections.comparison.before.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            ×
                          </span>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>

              {/* After */}
              <Card className="border-green-200 bg-green-50">
                <CardContent className="p-8">
                  <div className="text-center mb-6">
                    <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                      <sections.comparison.after.icon className="w-8 h-8 text-green-600" />
                    </div>
                    <h3 className="text-2xl font-bold text-green-700 mb-2">
                      {sections.comparison.after.title}
                    </h3>
                  </div>

                  <div className="space-y-4">
                    {sections.comparison.after.items.map((item, index) => (
                      <div key={index} className="flex items-center space-x-3">
                        <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                          <span className="text-white text-sm font-bold">
                            ✓
                          </span>
                        </div>
                        <span className="text-gray-700">{item}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>
        </section>
      )}

      {/* Features */}
      {sections.features && <FeaturesSection features={sections.features} />}

      {/* Benefits */}
      {sections.benefits && <BenefitsSection benefits={sections.benefits} />}

      {/* Custom Sections */}
      {sections.customSections?.map((section, index) => (
        <div key={index}>{section}</div>
      ))}

      {/* Testimonials */}
      <TestimonialsSection
        testimonials={testimonialsConfig?.testimonials || testimonials}
      />
    </div>
  );
};

export default LandingPageLayout;
