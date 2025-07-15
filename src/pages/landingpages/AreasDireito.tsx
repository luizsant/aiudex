import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Scale,
  Gavel,
  Building,
  Car,
  Shield,
  Users,
  FileText,
  CheckCircle,
  ArrowRight,
  Star,
  Play,
  Zap,
  Target,
  BookOpen,
  Award,
} from "lucide-react";
import TestimonialsSection from "@/components/TestimonialsSection";
import { testimonials } from "@/lib/testimonials-data";

const AreasDireitoLanding = () => {
  const areas = [
    {
      icon: Scale,
      title: "Direito Civil",
      description: "Contratos, responsabilidade civil, direito de família",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      pecas: ["Petição Inicial", "Contrato", "Testamento", "Divórcio"],
    },
    {
      icon: Building,
      title: "Direito Trabalhista",
      description: "Relações de trabalho, rescisão, assédio moral",
      color: "text-green-600",
      bgColor: "bg-green-100",
      pecas: [
        "Reclamação Trabalhista",
        "Rescisão Indireta",
        "Hora Extra",
        "FGTS",
      ],
    },
    {
      icon: Shield,
      title: "Direito Penal",
      description: "Defesa criminal, habeas corpus, recursos",
      color: "text-red-600",
      bgColor: "bg-red-100",
      pecas: ["Habeas Corpus", "Recurso", "Queixa-Crime", "Defesa Prévia"],
    },
    {
      icon: Car,
      title: "Direito do Consumidor",
      description: "Proteção ao consumidor, recall, danos morais",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      pecas: ["Ação de Indenização", "Reclamação", "Defesa", "Recurso"],
    },
    {
      icon: Users,
      title: "Direito Previdenciário",
      description: "Aposentadoria, benefícios, revisão de vida",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      pecas: ["Revisão de Vida", "Aposentadoria", "Auxílio-Doença", "BPC"],
    },
    {
      icon: Gavel,
      title: "Direito Administrativo",
      description: "Licitações, improbidade, servidores públicos",
      color: "text-indigo-600",
      bgColor: "bg-indigo-100",
      pecas: [
        "Mandado de Segurança",
        "Ação Popular",
        "Improbidade",
        "Licitação",
      ],
    },
  ];

  const stats = [
    {
      number: "15+",
      label: "Áreas do Direito",
      description: "Cobertura completa",
    },
    {
      number: "200+",
      label: "Tipos de Peças",
      description: "Templates especializados",
    },
    {
      number: "100%",
      label: "Atualizado",
      description: "Legislação vigente",
    },
    {
      number: "24/7",
      label: "Disponível",
      description: "Acesso ilimitado",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 to-indigo-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
                <Scale className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JurisAI</span>
            </div>
            <Button variant="outline" className="hidden md:flex">
              Explorar Áreas
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-blue-100 text-blue-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Scale className="w-4 h-4 mr-2" />
              Todas as Áreas do Direito
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-blue-700 to-indigo-600 bg-clip-text text-transparent">
              Especializado em
              <br />
              <span className="text-gray-900">15+ Áreas</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              O editor jurídico mais completo do Brasil, com
              <span className="font-bold text-blue-600">
                {" "}
                200+ tipos de peças
              </span>
              especializadas em todas as áreas do direito
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-700 hover:to-indigo-700 text-white px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Ver Todas as Áreas
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                Começar Gratuito
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {stats.map((stat, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-blue-100 to-indigo-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <Target className="w-8 h-8 text-blue-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-2">
                    {stat.number}
                  </h3>
                  <p className="text-sm font-semibold text-gray-700 mb-1">
                    {stat.label}
                  </p>
                  <p className="text-xs text-gray-600">{stat.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Areas Grid */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Áreas Especializadas
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Templates e peças específicas para cada área do direito
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-3 gap-8 max-w-7xl mx-auto">
            {areas.map((area, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 ${area.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                    <area.icon className={`w-8 h-8 ${area.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {area.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{area.description}</p>

                  <div className="space-y-2 mb-6">
                    <p className="text-sm font-semibold text-gray-700 mb-2">
                      Peças Principais:
                    </p>
                    {area.pecas.map((peca, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{peca}</span>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full">
                    Ver Peças
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Demo Section */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-blue-600 to-indigo-600 p-6">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Seletor de Áreas</h3>
                      <p className="text-blue-100">
                        Escolha sua área e veja as peças disponíveis
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm">15 Áreas</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="grid md:grid-cols-3 gap-8">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">
                      Área Selecionada
                    </h4>
                    <div className="bg-blue-50 p-4 rounded-lg border-2 border-blue-200">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                          <Scale className="w-5 h-5 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-semibold text-blue-700">
                            Direito Civil
                          </p>
                          <p className="text-sm text-blue-600">
                            Contratos e responsabilidade
                          </p>
                        </div>
                      </div>
                    </div>
                  </div>

                  <div className="md:col-span-2">
                    <h4 className="font-bold text-gray-700 mb-4">
                      Peças Disponíveis
                    </h4>
                    <div className="grid grid-cols-2 gap-3">
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700">
                          Petição Inicial
                        </p>
                        <p className="text-xs text-gray-500">
                          Ação de indenização
                        </p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700">
                          Contrato
                        </p>
                        <p className="text-xs text-gray-500">Compra e venda</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700">
                          Testamento
                        </p>
                        <p className="text-xs text-gray-500">Público</p>
                      </div>
                      <div className="bg-gray-50 p-3 rounded-lg border border-gray-200">
                        <p className="text-sm font-medium text-gray-700">
                          Divórcio
                        </p>
                        <p className="text-xs text-gray-500">Consensual</p>
                      </div>
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </section>

      {/* Depoimentos Magic UI */}
      <TestimonialsSection testimonials={testimonials} />

      {/* CTA Section */}
      <section className="py-20 bg-gradient-to-r from-blue-600 to-indigo-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Explore Todas as Áreas
          </h2>
          <p className="text-xl text-blue-100 mb-8 max-w-3xl mx-auto">
            Descubra como o JurisAI pode ajudar em sua área de atuação
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-white text-blue-600 hover:bg-gray-100 px-8 py-4 text-lg">
              Ver Todas as Áreas
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
              <Award className="w-5 h-5" />
              <span>15+ Áreas</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>200+ Peças</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>100% Atualizado</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-blue-600 to-indigo-600 rounded-lg flex items-center justify-center">
              <Scale className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">JurisAI</span>
          </div>
          <p className="text-gray-400">
            O editor jurídico mais completo para todas as áreas do direito
          </p>
        </div>
      </footer>
    </div>
  );
};

export default AreasDireitoLanding;
