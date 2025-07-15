import { PageHeader } from "@/components/PageHeader";
import {
  Bot,
  MessageSquare,
  Zap,
  Shield,
  Users,
  Gavel,
  Scale,
  BookOpen,
} from "lucide-react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { useRouter } from "next/navigation";

// Ícones para cada área do direito
const areaIcons: Record<string, React.ReactElement> = {
  "Direito do Consumidor": <Shield className="w-6 h-6" />,
  "Direito Previdenciário": <Users className="w-6 h-6" />,
  "Direito Trabalhista": <Gavel className="w-6 h-6" />,
  "Direito Administrativo": <Scale className="w-6 h-6" />,
  "Direito Tributário": <BookOpen className="w-6 h-6" />,
  "Direito Empresarial": <Zap className="w-6 h-6" />,
  "Direito Civil": <MessageSquare className="w-6 h-6" />,
  "Direito Constitucional": <Bot className="w-6 h-6" />,
};

// Cores para cada área do direito
const areaColors: Record<string, string> = {
  "Direito do Consumidor": "from-blue-500 to-cyan-500",
  "Direito Previdenciário": "from-green-500 to-emerald-500",
  "Direito Trabalhista": "from-orange-500 to-amber-500",
  "Direito Administrativo": "from-indigo-500 to-purple-500",
  "Direito Tributário": "from-red-500 to-pink-500",
  "Direito Empresarial": "from-violet-500 to-purple-500",
  "Direito Civil": "from-teal-500 to-cyan-500",
  "Direito Constitucional": "from-pink-500 to-rose-500",
};

const bots = [
  {
    id: "direito-do-consumidor",
    area: "Direito do Consumidor",
    desc: "Especialista em relações de consumo, defesa do consumidor e práticas abusivas.",
    features: ["CDC", "Práticas Abusivas", "Defesa do Consumidor"],
  },
  {
    id: "direito-previdenciario",
    area: "Direito Previdenciário",
    desc: "Apoio em benefícios, aposentadorias, revisões e cálculos previdenciários.",
    features: ["Aposentadoria", "Benefícios", "Revisões"],
  },
  {
    id: "direito-trabalhista",
    area: "Direito Trabalhista",
    desc: "Consultas sobre CLT, rescisão, verbas, estabilidade e processos trabalhistas.",
    features: ["CLT", "Rescisão", "Verbas"],
  },
  {
    id: "direito-administrativo",
    area: "Direito Administrativo",
    desc: "Especialista em licitações, servidores públicos, contratos e atos administrativos.",
    features: ["Licitações", "Servidores", "Contratos"],
  },
  {
    id: "direito-tributario",
    area: "Direito Tributário",
    desc: "Consultas sobre impostos, execuções fiscais, planejamento e defesas tributárias.",
    features: ["Impostos", "Execuções", "Planejamento"],
  },
  {
    id: "direito-empresarial",
    area: "Direito Empresarial",
    desc: "Apoio em contratos, sociedades, falências, recuperações e compliance.",
    features: ["Contratos", "Sociedades", "Falências"],
  },
  {
    id: "direito-civil",
    area: "Direito Civil",
    desc: "Especialista em contratos, família, sucessões, responsabilidade civil e obrigações.",
    features: ["Contratos", "Família", "Sucessões"],
  },
  {
    id: "direito-constitucional",
    area: "Direito Constitucional",
    desc: "Consultas sobre direitos fundamentais, controle de constitucionalidade e ações constitucionais.",
    features: ["Direitos Fundamentais", "Controle", "Ações"],
  },
];

export default function AgentesJuridicos() {
  const router = useRouter();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Agentes Jurídicos"
        subtitle="Assistentes virtuais especializados em diversas áreas do Direito. Converse com especialistas e obtenha orientações jurídicas precisas."
        icon={<Bot className="w-7 h-7 text-white" />}
      />

      <div className="max-w-7xl mx-auto p-6">
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
          {bots.map((bot) => (
            <Card
              key={bot.id}
              className="group relative overflow-hidden bg-white/90 backdrop-blur-sm border border-gray-200/50 rounded-2xl shadow-lg hover:shadow-2xl transition-all duration-300 hover:scale-105 hover:border-blue-300/50">
              {/* Header do Card */}
              <CardHeader className="pb-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div
                      className={`w-12 h-12 bg-gradient-to-r ${
                        areaColors[bot.area]
                      } rounded-xl flex items-center justify-center shadow-lg`}>
                      {areaIcons[bot.area]}
                    </div>
                    <div>
                      <CardTitle className="text-lg font-bold text-gray-800 group-hover:text-blue-700 transition-colors">
                        {bot.area}
                      </CardTitle>
                      <Badge
                        variant="secondary"
                        className="mt-1 bg-blue-100 text-blue-700 border-blue-200 text-xs">
                        Especialista
                      </Badge>
                    </div>
                  </div>
                </div>
              </CardHeader>

              {/* Conteúdo do Card */}
              <CardContent className="space-y-4">
                {/* Descrição */}
                <p className="text-sm text-gray-600 leading-relaxed">
                  {bot.desc}
                </p>

                {/* Features */}
                <div className="space-y-2">
                  <p className="text-xs font-semibold text-gray-500 uppercase tracking-wide">
                    Especialidades:
                  </p>
                  <div className="flex flex-wrap gap-1">
                    {bot.features.map((feature, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs bg-gray-50 text-gray-600 border-gray-200 hover:bg-blue-50 hover:text-blue-700 hover:border-blue-200 transition-colors">
                        {feature}
                      </Badge>
                    ))}
                  </div>
                </div>

                {/* Status do Bot */}
                <div className="flex items-center justify-between pt-2">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full animate-pulse"></div>
                    <span className="text-xs text-green-600 font-medium">
                      Online
                    </span>
                  </div>
                  <div className="text-xs text-gray-500">IA Avançada</div>
                </div>

                {/* Botão de Ação */}
                <Button
                  className="w-full mt-4 bg-gradient-to-r from-blue-500 to-green-500 hover:from-blue-600 hover:to-green-600 text-white font-semibold shadow-lg hover:shadow-xl transform hover:scale-105 transition-all duration-300 rounded-xl py-3"
                  onClick={() =>
                    router.push(`/agentes-juridicos/bot/${bot.id}`)
                  }>
                  <MessageSquare className="w-4 h-4 mr-2" />
                  Iniciar Conversa
                </Button>
              </CardContent>

              {/* Overlay de Hover */}
              <div className="absolute inset-0 bg-gradient-to-r from-blue-500/5 to-green-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300 pointer-events-none"></div>
            </Card>
          ))}
        </div>

        {/* Seção de Informações */}
        <div className="mt-12">
          <Card className="bg-gradient-to-r from-blue-50 to-green-50 border-blue-200 rounded-2xl">
            <CardContent className="p-6">
              <div className="text-center space-y-4">
                <h3 className="text-xl font-bold text-blue-800">
                  🤖 Como Funcionam os Agentes Jurídicos?
                </h3>
                <p className="text-gray-600 max-w-3xl mx-auto leading-relaxed">
                  Nossos agentes são assistentes virtuais especializados em
                  diferentes áreas do Direito. Cada um possui conhecimento
                  profundo em sua especialidade e pode ajudar com consultas,
                  análises de casos, sugestões de estratégias e orientações
                  jurídicas precisas.
                </p>
                <div className="flex items-center justify-center space-x-6 text-sm text-gray-500">
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-green-500 rounded-full"></div>
                    <span>Disponível 24/7</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full"></div>
                    <span>IA Especializada</span>
                  </div>
                  <div className="flex items-center space-x-2">
                    <div className="w-2 h-2 bg-purple-500 rounded-full"></div>
                    <span>Respostas Precisas</span>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    </div>
  );
}
