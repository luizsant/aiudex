import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  TrendingUp,
  TrendingDown,
  Users,
  Eye,
  MousePointer,
  UserCheck,
  CreditCard,
  Target,
  ArrowRight,
  Calendar,
  Filter,
  Download,
  RefreshCw,
  AlertTriangle,
  CheckCircle,
  Clock,
  DollarSign,
  BarChart3,
} from "lucide-react";
import {
  Funnel,
  FunnelChart,
  PieChart,
  Pie,
  Cell,
  ResponsiveContainer,
  Tooltip,
  Legend,
} from "recharts";
import { Label } from "@/components/ui/label";

interface FunnelStage {
  name: string;
  value: number;
  color: string;
  conversionRate: number;
  dropoff: number;
  revenue: number;
}

interface ConversionSource {
  source: string;
  visits: number;
  trials: number;
  activations: number;
  conversions: number;
  conversionRate: number;
  revenue: number;
}

const SalesFunnel = () => {
  const [funnelData, setFunnelData] = useState<FunnelStage[]>([]);
  const [conversionSources, setConversionSources] = useState<
    ConversionSource[]
  >([]);
  const [selectedPeriod, setSelectedPeriod] = useState("30");
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    loadFunnelData();
  }, [selectedPeriod]);

  const loadFunnelData = () => {
    setIsLoading(true);

    // Dados do funil
    const funnelStages: FunnelStage[] = [
      {
        name: "Visitas",
        value: 15420,
        color: "#3B82F6",
        conversionRate: 100,
        dropoff: 0,
        revenue: 0,
      },
      {
        name: "Testes",
        value: 1234,
        color: "#10B981",
        conversionRate: 8.0,
        dropoff: 92.0,
        revenue: 0,
      },
      {
        name: "Ativações",
        value: 567,
        color: "#F59E0B",
        conversionRate: 45.9,
        dropoff: 54.1,
        revenue: 0,
      },
      {
        name: "Conversões",
        value: 89,
        color: "#EF4444",
        conversionRate: 15.7,
        dropoff: 84.3,
        revenue: 8900,
      },
    ];

    // Dados por fonte de conversão
    const sourcesData: ConversionSource[] = [
      {
        source: "Google Ads",
        visits: 6540,
        trials: 567,
        activations: 234,
        conversions: 45,
        conversionRate: 0.69,
        revenue: 4500,
      },
      {
        source: "Meta Ads",
        visits: 4320,
        trials: 345,
        activations: 156,
        conversions: 23,
        conversionRate: 0.53,
        revenue: 2300,
      },
      {
        source: "Orgânico",
        visits: 2890,
        trials: 189,
        activations: 98,
        conversions: 12,
        conversionRate: 0.42,
        revenue: 1200,
      },
      {
        source: "Email",
        visits: 1670,
        trials: 133,
        activations: 79,
        conversions: 9,
        conversionRate: 0.54,
        revenue: 900,
      },
    ];

    setFunnelData(funnelStages);
    setConversionSources(sourcesData);
    setIsLoading(false);
  };

  const formatNumber = (value: number) => {
    return new Intl.NumberFormat("pt-BR").format(value);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: "BRL",
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  // Cálculos de métricas
  const totalVisits = funnelData.reduce((sum, stage) => sum + stage.value, 0);
  const totalConversions = funnelData[funnelData.length - 1]?.value || 0;
  const overallConversionRate =
    totalVisits > 0 ? (totalConversions / totalVisits) * 100 : 0;
  const totalRevenue = funnelData.reduce(
    (sum, stage) => sum + stage.revenue,
    0
  );
  const avgRevenuePerConversion =
    totalConversions > 0 ? totalRevenue / totalConversions : 0;

  // Dados para gráfico de pizza por fonte
  const sourcePieData = conversionSources.map((source) => ({
    name: source.source,
    value: source.conversions,
    color:
      source.source === "Google Ads"
        ? "#3B82F6"
        : source.source === "Meta Ads"
        ? "#8B5CF6"
        : source.source === "Orgânico"
        ? "#10B981"
        : "#F59E0B",
  }));

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          Carregando funil de vendas...
        </span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-r from-blue-50 to-blue-100 border-blue-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-blue-600 font-medium">
                  Total de Visitas
                </p>
                <p className="text-2xl font-bold text-blue-800">
                  {formatNumber(totalVisits)}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+15.2%</span>
                </div>
              </div>
              <Eye className="w-8 h-8 text-blue-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-green-50 to-green-100 border-green-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-green-600 font-medium">Conversões</p>
                <p className="text-2xl font-bold text-green-800">
                  {totalConversions}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+8.7%</span>
                </div>
              </div>
              <UserCheck className="w-8 h-8 text-green-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-purple-50 to-purple-100 border-purple-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-purple-600 font-medium">
                  Taxa de Conversão
                </p>
                <p className="text-2xl font-bold text-purple-800">
                  {formatPercentage(overallConversionRate)}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+0.3%</span>
                </div>
              </div>
              <Target className="w-8 h-8 text-purple-600" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-r from-orange-50 to-orange-100 border-orange-200">
          <CardContent className="p-4">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-orange-600 font-medium">
                  Receita Total
                </p>
                <p className="text-2xl font-bold text-orange-800">
                  {formatCurrency(totalRevenue)}
                </p>
                <div className="flex items-center text-sm">
                  <TrendingUp className="w-4 h-4 text-green-500 mr-1" />
                  <span className="text-green-600">+12.1%</span>
                </div>
              </div>
              <DollarSign className="w-8 h-8 text-orange-600" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Filtros */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <Filter className="w-5 h-5 text-blue-600" />
            <span>Filtros</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div>
              <Label>Período</Label>
              <Select value={selectedPeriod} onValueChange={setSelectedPeriod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="7">Últimos 7 dias</SelectItem>
                  <SelectItem value="30">Últimos 30 dias</SelectItem>
                  <SelectItem value="90">Últimos 90 dias</SelectItem>
                  <SelectItem value="365">Último ano</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div>
              <Label>Fonte</Label>
              <Select>
                <SelectTrigger>
                  <SelectValue placeholder="Todas as fontes" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas as fontes</SelectItem>
                  <SelectItem value="google_ads">Google Ads</SelectItem>
                  <SelectItem value="meta_ads">Meta Ads</SelectItem>
                  <SelectItem value="organic">Orgânico</SelectItem>
                  <SelectItem value="email">Email</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="flex items-end">
              <Button
                onClick={loadFunnelData}
                variant="outline"
                className="w-full">
                <RefreshCw className="w-4 h-4 mr-2" />
                Atualizar
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Funil de Vendas */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <BarChart3 className="w-5 h-5 text-blue-600" />
              <span>Funil de Vendas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              {funnelData.map((stage, index) => (
                <div key={stage.name} className="relative">
                  <div className="flex items-center justify-between mb-2">
                    <div className="flex items-center space-x-3">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-8 h-8 rounded-full flex items-center justify-center text-white font-bold text-sm"
                          style={{ backgroundColor: stage.color }}>
                          {index + 1}
                        </div>
                        <div>
                          <div className="font-semibold">{stage.name}</div>
                          <div className="text-sm text-gray-500">
                            {formatNumber(stage.value)} usuários
                          </div>
                        </div>
                      </div>
                    </div>
                    <div className="text-right">
                      <div className="font-semibold">
                        {formatPercentage(stage.conversionRate)}
                      </div>
                      <div className="text-sm text-gray-500">
                        taxa de conversão
                      </div>
                    </div>
                  </div>

                  <div className="relative">
                    <Progress value={stage.conversionRate} className="h-3" />
                    <div className="absolute inset-0 flex items-center justify-center">
                      <span className="text-xs font-medium text-white">
                        {formatNumber(stage.value)}
                      </span>
                    </div>
                  </div>

                  {index < funnelData.length - 1 && (
                    <div className="flex items-center justify-center mt-2">
                      <ArrowRight className="w-4 h-4 text-gray-400" />
                      <span className="text-xs text-gray-500 ml-1">
                        {formatPercentage(stage.dropoff)} de perda
                      </span>
                    </div>
                  )}

                  {stage.revenue > 0 && (
                    <div className="mt-2 p-2 bg-green-50 rounded-lg">
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-green-800">
                          Receita gerada:
                        </span>
                        <span className="text-sm font-bold text-green-800">
                          {formatCurrency(stage.revenue)}
                        </span>
                      </div>
                    </div>
                  )}
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <PieChart className="w-5 h-5 text-green-600" />
              <span>Conversões por Fonte</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <PieChart>
                <Pie
                  data={sourcePieData}
                  cx="50%"
                  cy="50%"
                  innerRadius={60}
                  outerRadius={100}
                  paddingAngle={5}
                  dataKey="value">
                  {sourcePieData.map((entry, index) => (
                    <Cell key={`cell-${index}`} fill={entry.color} />
                  ))}
                </Pie>
                <Tooltip
                  contentStyle={{
                    backgroundColor: "rgba(255, 255, 255, 0.95)",
                    border: "none",
                    borderRadius: "12px",
                    boxShadow: "0 10px 25px rgba(0,0,0,0.1)",
                  }}
                />
                <Legend />
              </PieChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>
      </div>

      {/* Tabela de Performance por Fonte */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <Target className="w-5 h-5 text-blue-600" />
              <span>Performance por Fonte de Tráfego</span>
            </CardTitle>
            <Button variant="outline" size="sm">
              <Download className="w-4 h-4 mr-2" />
              Exportar
            </Button>
          </div>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow className="bg-gray-50/50">
                <TableHead>Fonte</TableHead>
                <TableHead>Visitas</TableHead>
                <TableHead>Testes</TableHead>
                <TableHead>Ativações</TableHead>
                <TableHead>Conversões</TableHead>
                <TableHead>Taxa de Conversão</TableHead>
                <TableHead>Receita</TableHead>
                <TableHead>Status</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {conversionSources.map((source) => (
                <TableRow key={source.source} className="hover:bg-gray-50/50">
                  <TableCell>
                    <div className="font-medium">{source.source}</div>
                  </TableCell>
                  <TableCell>{formatNumber(source.visits)}</TableCell>
                  <TableCell>{formatNumber(source.trials)}</TableCell>
                  <TableCell>{formatNumber(source.activations)}</TableCell>
                  <TableCell>{formatNumber(source.conversions)}</TableCell>
                  <TableCell>
                    <div className="flex items-center space-x-2">
                      <span className="font-medium">
                        {formatPercentage(source.conversionRate)}
                      </span>
                      {source.conversionRate > 0.6 ? (
                        <TrendingUp className="w-4 h-4 text-green-600" />
                      ) : (
                        <TrendingDown className="w-4 h-4 text-red-600" />
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="font-medium text-green-600">
                      {formatCurrency(source.revenue)}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge
                      className={
                        source.conversionRate > 0.6
                          ? "bg-green-100 text-green-800"
                          : source.conversionRate > 0.4
                          ? "bg-yellow-100 text-yellow-800"
                          : "bg-red-100 text-red-800"
                      }>
                      {source.conversionRate > 0.6
                        ? "Excelente"
                        : source.conversionRate > 0.4
                        ? "Bom"
                        : "Precisa Melhorar"}
                    </Badge>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Insights e Recomendações */}
      <Card className="bg-white/80 backdrop-blur-sm border-0 shadow-xl">
        <CardHeader>
          <CardTitle className="flex items-center space-x-2">
            <AlertTriangle className="w-5 h-5 text-orange-600" />
            <span>Insights e Recomendações</span>
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            <div className="space-y-4">
              <div className="p-4 bg-red-50 border border-red-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <AlertTriangle className="w-5 h-5 text-red-600" />
                  <h4 className="font-semibold text-red-800">
                    Ponto de Atenção
                  </h4>
                </div>
                <p className="text-sm text-red-700">
                  Taxa de conversão de testes para ativações está em 45.9%.
                  Considere melhorar o onboarding e reduzir fricção no processo.
                </p>
              </div>

              <div className="p-4 bg-yellow-50 border border-yellow-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Clock className="w-5 h-5 text-yellow-600" />
                  <h4 className="font-semibold text-yellow-800">
                    Oportunidade
                  </h4>
                </div>
                <p className="text-sm text-yellow-700">
                  Tráfego orgânico tem menor conversão (0.42%). Otimize SEO e
                  conteúdo para melhorar qualificação.
                </p>
              </div>
            </div>

            <div className="space-y-4">
              <div className="p-4 bg-green-50 border border-green-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <h4 className="font-semibold text-green-800">
                    Destaque Positivo
                  </h4>
                </div>
                <p className="text-sm text-green-700">
                  Google Ads lidera em conversões (0.69%). Considere aumentar
                  investimento nesta fonte.
                </p>
              </div>

              <div className="p-4 bg-blue-50 border border-blue-200 rounded-lg">
                <div className="flex items-center space-x-2 mb-2">
                  <Target className="w-5 h-5 text-blue-600" />
                  <h4 className="font-semibold text-blue-800">Meta Sugerida</h4>
                </div>
                <p className="text-sm text-blue-700">
                  Aumentar taxa de conversão geral para 1.0% pode gerar +45
                  conversões/mês.
                </p>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default SalesFunnel;
