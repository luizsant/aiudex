import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  Brain,
  Sparkles,
  Scale,
  FileText,
  CheckCircle,
  ArrowRight,
  Star,
  Shield,
  Award,
  Users,
  Play,
  Zap,
  Target,
  BookOpen,
  Gavel,
} from "lucide-react";
import TestimonialsSection from "@/components/TestimonialsSection";
import { testimonials } from "@/lib/testimonials-data";

const IAJuridicaLanding = () => {
  const aiFeatures = [
    {
      icon: Brain,
      title: "IA Treinada em Direito",
      description: "Modelo especializado com milhões de peças jurídicas",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
    },
    {
      icon: Scale,
      title: "Jurisprudência Atualizada",
      description: "Acesso a decisões dos principais tribunais",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
    },
    {
      icon: Sparkles,
      title: "Sugestões Inteligentes",
      description: "Teses e argumentos baseados em casos similares",
      color: "text-green-600",
      bgColor: "bg-green-100",
    },
    {
      icon: Shield,
      title: "Precisão Jurídica",
      description: "87% de taxa de aprovação em tribunais",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
    },
  ];

  const capabilities = [
    {
      title: "Geração de Peças",
      description: "Petições, recursos, contratos e pareceres",
      icon: FileText,
      examples: [
        "Petição Inicial",
        "Recurso Especial",
        "Contestação",
        "Parecer",
      ],
    },
    {
      title: "Análise Jurídica",
      description: "Interpretação de casos e legislação",
      icon: BookOpen,
      examples: [
        "Análise de Mérito",
        "Risco Processual",
        "Estratégia Legal",
        "Precedentes",
      ],
    },
    {
      title: "Formatação Automática",
      description: "Padrões ABNT e requisitos processuais",
      icon: Gavel,
      examples: [
        "Formatação ABNT",
        "Requisitos Obrigatórios",
        "Estrutura Processual",
        "Citações",
      ],
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-purple-50 to-blue-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
                <Brain className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JurisAI</span>
            </div>
            <Button variant="outline" className="hidden md:flex">
              Testar IA Gratuitamente
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-purple-100 text-purple-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <Brain className="w-4 h-4 mr-2" />
              IA Especializada em Direito
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-purple-700 to-blue-600 bg-clip-text text-transparent">
              IA Jurídica
              <br />
              <span className="text-gray-900">Especializada</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A primeira inteligência artificial treinada especificamente para
              <span className="font-bold text-purple-600">
                {" "}
                advocacia brasileira
              </span>
              , com precisão de{" "}
              <span className="font-bold text-blue-600">87%</span> em tribunais
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-purple-600 to-blue-600 hover:from-purple-700 hover:to-blue-700 text-white px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Ver IA em Ação
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                Testar Gratuito
              </Button>
            </div>

            {/* AI Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {aiFeatures.map((feature, index) => (
                <div key={index} className="text-center">
                  <div
                    className={`w-16 h-16 ${feature.bgColor} rounded-2xl flex items-center justify-center mx-auto mb-4`}>
                    <feature.icon className={`w-8 h-8 ${feature.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {feature.title}
                  </h3>
                  <p className="text-sm text-gray-600">{feature.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* AI Capabilities */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Capacidades da IA
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              O que nossa inteligência artificial pode fazer por você
            </p>
          </div>

          <div className="grid md:grid-cols-3 gap-8 max-w-6xl mx-auto">
            {capabilities.map((capability, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border-purple-200">
                <CardContent className="p-8">
                  <div className="w-16 h-16 bg-gradient-to-r from-purple-100 to-blue-100 rounded-2xl flex items-center justify-center mb-6">
                    <capability.icon className="w-8 h-8 text-purple-600" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {capability.title}
                  </h3>
                  <p className="text-gray-600 mb-6">{capability.description}</p>

                  <div className="space-y-2">
                    {capability.examples.map((example, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{example}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* AI Demo */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-purple-600 to-blue-600 p-6">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <Brain className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">Demonstração da IA</h3>
                      <p className="text-purple-100">
                        Geração de petição inicial com sugestões inteligentes
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm">IA Ativa</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">
                      Entrada do Usuário
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200">
                      <p className="text-sm text-gray-600">
                        <strong>Fatos:</strong> Cliente sofreu acidente de
                        trânsito, teve lesões corporais e danos materiais no
                        valor de R$ 15.000,00
                      </p>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">
                      Sugestões da IA
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-purple-50 p-3 rounded-lg border-l-4 border-purple-400">
                        <p className="text-sm font-semibold text-purple-700">
                          Teses Sugeridas:
                        </p>
                        <p className="text-xs text-purple-600">
                          • Responsabilidade civil objetiva
                        </p>
                        <p className="text-xs text-purple-600">
                          • Dano moral e material
                        </p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-700">
                          Jurisprudência:
                        </p>
                        <p className="text-xs text-blue-600">
                          REsp 1.234.567/SP - STJ
                        </p>
                      </div>
                      <div className="bg-green-50 p-3 rounded-lg border-l-4 border-green-400">
                        <p className="text-sm font-semibold text-green-700">
                          Valor Sugerido:
                        </p>
                        <p className="text-xs text-green-600">
                          R$ 25.000,00 (dano moral)
                        </p>
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
      <section className="py-20 bg-gradient-to-r from-purple-600 to-blue-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Experimente a IA Jurídica
          </h2>
          <p className="text-xl text-purple-100 mb-8 max-w-3xl mx-auto">
            Junte-se aos advogados que já descobriram o poder da inteligência
            artificial especializada
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-white text-purple-600 hover:bg-gray-100 px-8 py-4 text-lg">
              Testar Gratuito
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-purple-600 px-8 py-4 text-lg">
              Ver Demonstração Completa
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-purple-100">
            <div className="flex items-center space-x-2">
              <Shield className="w-5 h-5" />
              <span>87% de Precisão</span>
            </div>
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>IA Especializada</span>
            </div>
            <div className="flex items-center space-x-2">
              <Users className="w-5 h-5" />
              <span>Suporte Técnico</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-purple-600 to-blue-600 rounded-lg flex items-center justify-center">
              <Brain className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">JurisAI</span>
          </div>
          <p className="text-gray-400">
            Inteligência artificial especializada em advocacia brasileira
          </p>
        </div>
      </footer>
    </div>
  );
};

export default IAJuridicaLanding;
