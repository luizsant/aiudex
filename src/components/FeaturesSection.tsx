import { Card, CardContent } from "@/components/ui/card";
import {
  Bot,
  Brain,
  Zap,
  Cpu,
  CircuitBoard,
  Shield,
  BarChart3,
  Bell,
  Target,
  Database,
  Lock,
  Globe,
  FileText,
  Users,
  MessageSquare,
  RefreshCw,
  Wrench,
  Calendar,
  CheckCircle,
  Settings,
  BarChart,
  Scissors,
  FileArchive,
  FileInput,
  Mic,
  Play,
  BookOpen,
  Sparkles,
} from "lucide-react";
import { COMMON_CLASSES, GRADIENTS } from "@/lib/theme-constants";

// Mapeamento de ícones
const iconMap: { [key: string]: any } = {
  Brain,
  FileText,
  Users,
  BarChart3,
  Zap,
  CheckCircle,
  Sparkles,
  BookOpen,
  Bot,
  Cpu,
  CircuitBoard,
  Shield,
  Bell,
  Target,
  Database,
  Lock,
  Globe,
  MessageSquare,
  RefreshCw,
  Wrench,
  Calendar,
  Settings,
  BarChart,
  Scissors,
  FileArchive,
  FileInput,
  Mic,
  Play,
};

// Array de features padrão como fallback
const defaultFeatures = [
  {
    icon: "Brain",
    title: "IA Jurídica Especializada",
    description:
      "Geração automática de peças processuais com inteligência artificial treinada em direito brasileiro e jurisprudência atualizada.",
    color: "blue",
    capabilities: ["Petições", "Recursos", "Contratos", "Pareceres"],
  },
  {
    icon: "FileText",
    title: "Editor Markdown Avançado",
    description:
      "Editor com preview em tempo real, formatação automática ABNT e templates jurídicos personalizáveis.",
    color: "green",
    capabilities: [
      "Preview em tempo real",
      "Formatação ABNT",
      "Templates",
      "Exportação PDF",
    ],
  },
  {
    icon: "Users",
    title: "Gestão de Clientes",
    description:
      "CRM completo para cadastro, histórico de processos e acompanhamento de prazos e documentos.",
    color: "purple",
    capabilities: ["Cadastro completo", "Histórico", "Prazos", "Documentos"],
  },
  {
    icon: "BarChart3",
    title: "Analytics Jurídico",
    description:
      "Relatórios e métricas para acompanhar produtividade, performance e insights do escritório.",
    color: "amber",
    capabilities: ["Produtividade", "Performance", "Insights", "Relatórios"],
  },
];

// Permitir passar features por props, mas manter fallback para o array antigo
const FeaturesSection = ({ features: featuresProp }: { features?: any[] }) => {
  const featuresToShow = featuresProp || defaultFeatures;

  return (
    <section className="py-12 sm:py-16 lg:py-20 bg-white">
      <div className="container mx-auto px-4 sm:px-6 lg:px-8">
        <div className="text-center mb-12 sm:mb-16">
          <h2 className="text-3xl sm:text-4xl lg:text-5xl font-bold mb-4 sm:mb-6 bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
            Funcionalidades Principais
          </h2>
          <p className="text-lg sm:text-xl text-gray-600 max-w-3xl mx-auto leading-relaxed">
            Tudo que você precisa para otimizar sua prática jurídica
          </p>
        </div>

        <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-6 sm:gap-8 max-w-7xl mx-auto">
          {featuresToShow.map((feature, index) => {
            const IconComponent = iconMap[feature.icon] || FileText;
            return (
              <Card 
                key={index} 
                className={`${COMMON_CLASSES.CARD_BASE} h-full hover:shadow-xl transition-all duration-300 transform hover:scale-105 bg-white/80 backdrop-blur-sm border-0 shadow-lg`}
              >
                <CardContent className="p-6 sm:p-8 h-full flex flex-col">
                  <div
                    className={`w-14 h-14 sm:w-16 sm:h-16 ${GRADIENTS.ICON_PRIMARY} rounded-2xl flex items-center justify-center mb-4 sm:mb-6 shadow-lg`}>
                    <IconComponent className="w-7 h-7 sm:w-8 sm:h-8 text-blue-600" />
                  </div>
                  <h3 className="text-lg sm:text-xl font-bold text-gray-900 mb-3 sm:mb-4 leading-tight">
                    {feature.title}
                  </h3>
                  <p className="text-sm sm:text-base text-gray-600 mb-4 sm:mb-6 leading-relaxed flex-grow">
                    {feature.description}
                  </p>

                  {feature.capabilities && (
                    <div className="space-y-2 sm:space-y-3">
                      {feature.capabilities.map(
                        (capability: string, i: number) => (
                          <div key={i} className="flex items-center space-x-2 sm:space-x-3">
                            <CheckCircle className="w-4 h-4 text-green-600 flex-shrink-0" />
                            <span className="text-xs sm:text-sm text-gray-700 font-medium">
                              {capability}
                            </span>
                          </div>
                        )
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default FeaturesSection;
