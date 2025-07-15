import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import {
  FileText,
  Copy,
  CheckCircle,
  ArrowRight,
  Star,
  Play,
  Zap,
  Target,
  BookOpen,
  Award,
  Users,
  Shield,
  Clock,
  TrendingUp,
  Sparkles,
} from "lucide-react";
import TestimonialsSection from "@/components/TestimonialsSection";
import { testimonials } from "@/lib/testimonials-data";

const TemplatesLanding = () => {
  const templateCategories = [
    {
      icon: FileText,
      title: "Petições Iniciais",
      description: "Modelos para iniciar processos em todas as áreas",
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      count: "45+ modelos",
      examples: [
        "Ação de Indenização",
        "Divórcio",
        "Reclamação Trabalhista",
        "Habeas Corpus",
      ],
    },
    {
      icon: Copy,
      title: "Recursos",
      description: "Templates para todos os tipos de recursos",
      color: "text-green-600",
      bgColor: "bg-green-100",
      count: "32+ modelos",
      examples: ["Recurso Especial", "Recurso Ordinário", "Agravo", "Embargos"],
    },
    {
      icon: BookOpen,
      title: "Contratos",
      description: "Modelos de contratos comerciais e civis",
      color: "text-purple-600",
      bgColor: "bg-purple-100",
      count: "28+ modelos",
      examples: [
        "Compra e Venda",
        "Locação",
        "Prestação de Serviços",
        "Sociedade",
      ],
    },
    {
      icon: Shield,
      title: "Pareceres",
      description: "Templates para pareceres jurídicos",
      color: "text-amber-600",
      bgColor: "bg-amber-100",
      count: "25+ modelos",
      examples: [
        "Parecer Civil",
        "Parecer Trabalhista",
        "Parecer Penal",
        "Parecer Tributário",
      ],
    },
  ];

  const popularTemplates = [
    {
      name: "Petição Inicial - Ação de Indenização",
      area: "Civil",
      downloads: "2.847",
      rating: 4.9,
      description:
        "Modelo completo para ações de indenização por danos morais e materiais",
    },
    {
      name: "Recurso Especial - STJ",
      area: "Recursos",
      downloads: "1.923",
      rating: 4.8,
      description:
        "Template para recursos especiais com fundamentação completa",
    },
    {
      name: "Contrato de Compra e Venda",
      area: "Contratos",
      downloads: "1.654",
      rating: 4.7,
      description: "Modelo de contrato com cláusulas protetivas",
    },
    {
      name: "Reclamação Trabalhista",
      area: "Trabalhista",
      downloads: "1.432",
      rating: 4.9,
      description:
        "Template para reclamações trabalhistas com cálculos automáticos",
    },
  ];

  const benefits = [
    {
      icon: Clock,
      title: "Economia de Tempo",
      description: "Reduza 80% do tempo de criação",
      color: "text-green-600",
    },
    {
      icon: CheckCircle,
      title: "Qualidade Garantida",
      description: "Templates revisados por especialistas",
      color: "text-blue-600",
    },
    {
      icon: TrendingUp,
      title: "Atualização Constante",
      description: "Sempre com a legislação vigente",
      color: "text-purple-600",
    },
    {
      icon: Sparkles,
      title: "Personalização IA",
      description: "Adaptação automática ao seu caso",
      color: "text-amber-600",
    },
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-emerald-50 to-teal-50">
      {/* Header */}
      <header className="bg-white shadow-sm border-b">
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
                <FileText className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl font-bold text-gray-900">JurisAI</span>
            </div>
            <Button variant="outline" className="hidden md:flex">
              Ver Templates
            </Button>
          </div>
        </div>
      </header>

      {/* Hero Section */}
      <section className="py-20">
        <div className="container mx-auto px-4 text-center">
          <div className="max-w-4xl mx-auto">
            <div className="inline-flex items-center bg-emerald-100 text-emerald-700 px-4 py-2 rounded-full text-sm font-semibold mb-6">
              <FileText className="w-4 h-4 mr-2" />
              Templates Profissionais
            </div>

            <h1 className="text-5xl md:text-7xl font-bold mb-8 bg-gradient-to-r from-emerald-700 to-teal-600 bg-clip-text text-transparent">
              130+ Templates
              <br />
              <span className="text-gray-900">Prontos para Usar</span>
            </h1>

            <p className="text-xl md:text-2xl text-gray-600 mb-8 max-w-3xl mx-auto">
              A maior biblioteca de templates jurídicos do Brasil, com
              <span className="font-bold text-emerald-600"> 130+ modelos</span>
              especializados e{" "}
              <span className="font-bold text-teal-600">
                80% de economia de tempo
              </span>
            </p>

            <div className="flex flex-col sm:flex-row gap-4 justify-center mb-12">
              <Button
                size="lg"
                className="bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white px-8 py-4 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Ver Todos os Templates
              </Button>
              <Button size="lg" variant="outline" className="px-8 py-4 text-lg">
                Começar Gratuito
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-4xl mx-auto">
              {benefits.map((benefit, index) => (
                <div key={index} className="text-center">
                  <div className="w-16 h-16 bg-gradient-to-r from-emerald-100 to-teal-100 rounded-2xl flex items-center justify-center mx-auto mb-4">
                    <benefit.icon className={`w-8 h-8 ${benefit.color}`} />
                  </div>
                  <h3 className="text-xl font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </div>
              ))}
            </div>
          </div>
        </div>
      </section>

      {/* Template Categories */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Categorias de Templates
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Organizados por tipo e área do direito para facilitar sua busca
            </p>
          </div>

          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
            {templateCategories.map((category, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300 border-0 shadow-lg">
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 ${category.bgColor} rounded-2xl flex items-center justify-center mb-6`}>
                    <category.icon className={`w-8 h-8 ${category.color}`} />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-4">
                    {category.title}
                  </h3>
                  <p className="text-gray-600 mb-4">{category.description}</p>
                  <p className="text-sm font-semibold text-emerald-600 mb-6">
                    {category.count}
                  </p>

                  <div className="space-y-2 mb-6">
                    {category.examples.map((example, i) => (
                      <div key={i} className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-600" />
                        <span className="text-sm text-gray-700">{example}</span>
                      </div>
                    ))}
                  </div>

                  <Button variant="outline" className="w-full">
                    Ver Templates
                    <ArrowRight className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Popular Templates */}
      <section className="py-20">
        <div className="container mx-auto px-4">
          <div className="text-center mb-16">
            <h2 className="text-4xl md:text-5xl font-bold mb-6">
              Templates Mais Populares
            </h2>
            <p className="text-xl text-gray-600 max-w-3xl mx-auto">
              Os modelos mais baixados e melhor avaliados pelos advogados
            </p>
          </div>

          <div className="grid md:grid-cols-2 gap-8 max-w-6xl mx-auto">
            {popularTemplates.map((template, index) => (
              <Card
                key={index}
                className="hover:shadow-xl transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-start justify-between mb-4">
                    <div className="flex-1">
                      <h3 className="text-lg font-bold text-gray-900 mb-2">
                        {template.name}
                      </h3>
                      <p className="text-sm text-gray-600 mb-3">
                        {template.description}
                      </p>
                    </div>
                    <span className="text-xs bg-emerald-100 text-emerald-700 px-2 py-1 rounded-full ml-2">
                      {template.area}
                    </span>
                  </div>

                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-4">
                      <div className="flex items-center">
                        {[...Array(5)].map((_, i) => (
                          <Star
                            key={i}
                            className={`w-4 h-4 ${
                              i < Math.floor(template.rating)
                                ? "text-yellow-400 fill-current"
                                : "text-gray-300"
                            }`}
                          />
                        ))}
                        <span className="text-sm text-gray-600 ml-2">
                          {template.rating}
                        </span>
                      </div>
                      <span className="text-sm text-gray-500">
                        {template.downloads} downloads
                      </span>
                    </div>
                  </div>

                  <Button className="w-full bg-gradient-to-r from-emerald-600 to-teal-600 hover:from-emerald-700 hover:to-teal-700 text-white">
                    Usar Template
                    <Copy className="w-4 h-4 ml-2" />
                  </Button>
                </CardContent>
              </Card>
            ))}
          </div>
        </div>
      </section>

      {/* Template Demo */}
      <section className="py-20 bg-white">
        <div className="container mx-auto px-4">
          <div className="max-w-6xl mx-auto">
            <Card className="shadow-2xl border-0 overflow-hidden">
              <div className="bg-gradient-to-r from-emerald-600 to-teal-600 p-6">
                <div className="flex items-center justify-between text-white">
                  <div className="flex items-center space-x-4">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-6 h-6" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold">
                        Demonstração de Template
                      </h3>
                      <p className="text-emerald-100">
                        Petição Inicial - Ação de Indenização
                      </p>
                    </div>
                  </div>
                  <div className="flex items-center space-x-2">
                    <Zap className="w-5 h-5 text-yellow-300" />
                    <span className="text-sm">Template Ativo</span>
                  </div>
                </div>
              </div>

              <CardContent className="p-8">
                <div className="grid md:grid-cols-2 gap-8">
                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">
                      Informações do Template
                    </h4>
                    <div className="space-y-3">
                      <div className="bg-emerald-50 p-3 rounded-lg border-l-4 border-emerald-400">
                        <p className="text-sm font-semibold text-emerald-700">
                          Estrutura:
                        </p>
                        <p className="text-xs text-emerald-600">
                          • Qualificação das partes
                        </p>
                        <p className="text-xs text-emerald-600">
                          • Fatos e fundamentos
                        </p>
                        <p className="text-xs text-emerald-600">• Pedidos</p>
                      </div>
                      <div className="bg-blue-50 p-3 rounded-lg border-l-4 border-blue-400">
                        <p className="text-sm font-semibold text-blue-700">
                          Recursos:
                        </p>
                        <p className="text-xs text-blue-600">
                          • Cálculos automáticos
                        </p>
                        <p className="text-xs text-blue-600">
                          • Jurisprudência integrada
                        </p>
                      </div>
                    </div>
                  </div>

                  <div>
                    <h4 className="font-bold text-gray-700 mb-4">
                      Prévia do Template
                    </h4>
                    <div className="bg-gray-50 p-4 rounded-lg border-2 border-dashed border-gray-200 min-h-[200px]">
                      <div className="space-y-2 text-sm text-gray-600">
                        <p className="font-semibold">
                          EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO...
                        </p>
                        <p>
                          <strong>LUCAS SILVA</strong>, brasileiro, solteiro...
                        </p>
                        <p className="bg-emerald-100 p-2 rounded border-l-4 border-emerald-400">
                          <strong>Template:</strong> Campos preenchíveis
                          automaticamente
                        </p>
                        <p>
                          <strong>DOS FATOS</strong>
                        </p>
                        <p>Em [DATA], o requerente sofreu...</p>
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
      <section className="py-20 bg-gradient-to-r from-emerald-600 to-teal-600">
        <div className="container mx-auto px-4 text-center">
          <h2 className="text-4xl md:text-5xl font-bold text-white mb-6">
            Acesse 130+ Templates
          </h2>
          <p className="text-xl text-emerald-100 mb-8 max-w-3xl mx-auto">
            Comece a usar templates profissionais e economize horas de trabalho
          </p>

          <div className="flex flex-col sm:flex-row gap-4 justify-center mb-8">
            <Button
              size="lg"
              className="bg-white text-emerald-600 hover:bg-gray-100 px-8 py-4 text-lg">
              Ver Todos os Templates
              <ArrowRight className="w-5 h-5 ml-2" />
            </Button>
            <Button
              size="lg"
              variant="outline"
              className="border-white text-white hover:bg-white hover:text-emerald-600 px-8 py-4 text-lg">
              Falar com Especialista
            </Button>
          </div>

          <div className="flex items-center justify-center space-x-6 text-emerald-100">
            <div className="flex items-center space-x-2">
              <Award className="w-5 h-5" />
              <span>130+ Templates</span>
            </div>
            <div className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>80% Economia</span>
            </div>
            <div className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5" />
              <span>Qualidade Garantida</span>
            </div>
          </div>
        </div>
      </section>

      {/* Footer */}
      <footer className="bg-gray-900 text-white py-12">
        <div className="container mx-auto px-4 text-center">
          <div className="flex items-center justify-center space-x-2 mb-4">
            <div className="w-8 h-8 bg-gradient-to-r from-emerald-600 to-teal-600 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 text-white" />
            </div>
            <span className="text-xl font-bold">JurisAI</span>
          </div>
          <p className="text-gray-400">
            A maior biblioteca de templates jurídicos do Brasil
          </p>
        </div>
      </footer>
    </div>
  );
};

export default TemplatesLanding;
