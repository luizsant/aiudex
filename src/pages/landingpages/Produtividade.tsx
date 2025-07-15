import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  Zap,
  TrendingUp,
  Target,
  CheckCircle,
  FileText,
  Users,
  BarChart3,
  ArrowRight,
  Star,
  Play,
  Shield,
  Award,
  Calendar,
} from "lucide-react";
import TestimonialsSection from "@/components/TestimonialsSection";
import FeaturesSection from "@/components/FeaturesSection";
import BenefitsSection from "@/components/BenefitsSection";
import StatsSection from "@/components/StatsSection";
import { testimonials } from "@/lib/testimonials-data";
import { featuresByArea } from "@/lib/features-data";
import { benefitsByArea } from "@/lib/benefits-data";
import { statsByArea } from "@/lib/stats-data";

const ProdutividadeLanding = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JurisAI</span>
            </div>
            <Button variant="outline" className="hidden md:flex">
              Começar Gratuitamente
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-green-100 text-green-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Zap className="w-4 h-4 mr-2" />
              Transforme sua Produtividade
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
              Economize 32 Horas
              <br />
              <span className="text-gray-900">Por Mês</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              O editor jurídico com IA que reduz o tempo de criação de peças em
              <span className="font-bold text-green-600"> 73%</span> e aumenta
              sua produtividade em
              <span className="font-bold text-blue-600"> 3.2x</span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Ver Demonstração
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                Começar Gratuito
              </Button>
            </div>

            {/* Stats */}
            <StatsSection stats={statsByArea.produtividade} />
          </div>
        </div>
      </section>

      {/* Comparison Section */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Antes vs Depois
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Veja como o JurisAI transforma completamente sua rotina de
              trabalho
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {/* Before */}
            <Card className="border-red-200 bg-red-50">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-red-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Clock className="w-8 h-8 text-red-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-red-700 mb-2">
                    Método Tradicional
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">×</span>
                    </div>
                    <span className="text-gray-700">4h 30min por peça</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">×</span>
                    </div>
                    <span className="text-gray-700">2.1 peças por dia</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">×</span>
                    </div>
                    <span className="text-gray-700">35% de retrabalho</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-red-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm font-bold">×</span>
                    </div>
                    <span className="text-gray-700">
                      Pesquisa manual de jurisprudência
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* After */}
            <Card className="border-green-200 bg-green-50">
              <CardContent className="p-8">
                <div className="text-center mb-6">
                  <div className="w-16 h-16 bg-green-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Zap className="w-8 h-8 text-green-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-green-700 mb-2">
                    Com JurisAI
                  </h3>
                </div>

                <div className="space-y-4">
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">1h 15min por peça</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">6.8 peças por dia</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">12% de retrabalho</span>
                  </div>
                  <div className="flex items-center space-x-3">
                    <div className="w-6 h-6 bg-green-500 rounded-full flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                    <span className="text-gray-700">
                      IA sugere jurisprudência automaticamente
                    </span>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Features */}
      <FeaturesSection
        features={featuresByArea.produtividade.map((feature) => ({
          icon: "CheckCircle",
          title: feature,
          description: feature,
        }))}
      />

      {/* Benefits */}
      <BenefitsSection benefits={benefitsByArea.produtividade} />

      {/* Depoimentos Magic UI */}
      <TestimonialsSection testimonials={testimonials} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-green-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Comece a Economizar Tempo Hoje
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Junte-se a milhares de advogados que já transformaram sua
            produtividade
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
              Começar Gratuito
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-blue-600 px-8 py-4 text-lg">
              Falar com Especialista
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-blue-100">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>Segurança Garantida</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>7 dias grátis</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Suporte 24/7</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-green-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">JurisAI</span>
          </div>
          <p className="text-gray-400">
            Transformando a advocacia com inteligência artificial
          </p>
        </div>
      </footer>
    </div>
  );
};

export default ProdutividadeLanding;
