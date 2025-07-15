import StatCard from "@/components/ui/StatCard";
import { Scale, FileText, CheckCircle, Clock } from "lucide-react";
import { COMMON_CLASSES } from "@/lib/theme-constants";

// Mapeamento de ícones
const iconMap: { [key: string]: any } = {
  Scale,
  FileText,
  CheckCircle,
  Clock,
};

// Array de stats padrão como fallback
const defaultStats = [
  {
    number: "15+",
    label: "Áreas do Direito",
    description: "Cobertura completa",
    icon: "Scale",
  },
  {
    number: "200+",
    label: "Tipos de Peças",
    description: "Templates especializados",
    icon: "FileText",
  },
  {
    number: "100%",
    label: "Atualizado",
    description: "Legislação vigente",
    icon: "CheckCircle",
  },
  {
    number: "24/7",
    label: "Disponível",
    description: "Acesso ilimitado",
    icon: "Clock",
  },
];

const StatsSection = ({ stats: statsProp }: { stats?: any[] }) => {
  const statsToShow = statsProp || defaultStats;

  return (
    <section className="py-20 bg-white">
      <div className="container mx-auto px-4">
        <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-8 max-w-6xl mx-auto">
          {statsToShow.map((stat, index) => {
            const IconComponent = iconMap[stat.icon] || CheckCircle;
            return (
              <StatCard
                key={index}
                icon={IconComponent}
                number={stat.number}
                label={stat.label}
                description={stat.description}
                color="blue"
                size="md"
              />
            );
          })}
        </div>
      </div>
    </section>
  );
};

export default StatsSection;
