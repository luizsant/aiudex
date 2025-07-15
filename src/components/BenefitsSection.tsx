import { Card, CardContent } from "@/components/ui/card";
import {
  Clock,
  TrendingUp,
  CheckCircle,
  Shield,
  Zap,
  Target,
  Users,
  Award,
} from "lucide-react";
import { COMMON_CLASSES, GRADIENTS } from "@/lib/theme-constants";

// Mapeamento de ícones
const iconMap: { [key: string]: any } = {
  Clock,
  TrendingUp,
  CheckCircle,
  Shield,
  Zap,
  Target,
  Users,
  Award,
};

// Array de benefits padrão como fallback
const defaultBenefits = [
  {
    icon: "Clock",
    title: "Economia de Tempo",
    description: "Reduza o tempo de criação de peças em 73%",
    value: "32 horas/mês",
    color: "blue",
  },
  {
    icon: "TrendingUp",
    title: "Aumento de Produtividade",
    description: "Aumente sua produtividade em 3.2x",
    value: "3.2x",
    color: "green",
  },
  {
    icon: "CheckCircle",
    title: "Qualidade Garantida",
    description: "87% de precisão comprovada em tribunais",
    value: "87%",
    color: "purple",
  },
  {
    icon: "Shield",
    title: "Segurança Total",
    description: "Dados protegidos com criptografia de ponta",
    value: "100%",
    color: "amber",
  },
];

const BenefitsSection = ({ benefits: benefitsProp }: { benefits?: any[] }) => {
  const benefitsToShow = benefitsProp || defaultBenefits;

  return (
    <section className="py-20 bg-gradient-to-br from-slate-50 to-blue-50">
      <div className="container mx-auto px-4">
        <div className="text-center mb-16">
          <h2 className="text-4xl md:text-5xl font-bold mb-6">
            Benefícios Principais
          </h2>
          <p className="text-xl text-gray-600 max-w-3xl mx-auto">
            Descubra como o JurisAI pode transformar sua prática jurídica
          </p>
        </div>

        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-7xl mx-auto">
          {benefitsToShow.map((benefit, index) => {
            const IconComponent = iconMap[benefit.icon] || CheckCircle;
            return (
              <Card
                key={index}
                className={`${COMMON_CLASSES.CARD_BASE} text-center`}>
                <CardContent className="p-8">
                  <div
                    className={`w-16 h-16 ${GRADIENTS.ICON_PRIMARY} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
                    <IconComponent className="w-8 h-8 text-blue-600" />
                  </div>
                  <div className="text-3xl font-bold text-blue-600 mb-2">
                    {benefit.value}
                  </div>
                  <h3 className="text-lg font-bold text-gray-900 mb-2">
                    {benefit.title}
                  </h3>
                  <p className="text-sm text-gray-600">{benefit.description}</p>
                </CardContent>
              </Card>
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default BenefitsSection;
