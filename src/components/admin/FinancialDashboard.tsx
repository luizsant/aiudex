import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  DollarSign,
  TrendingUp,
  TrendingDown,
  Users,
  Activity,
  Target,
  BarChart3,
  RefreshCw,
  Settings,
  Edit,
  Save,
  Loader2,
} from "lucide-react";
import {
  ResponsiveContainer,
  LineChart,
  Line,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  Legend,
  BarChart,
  Bar,
} from "recharts";
import { adminDataService } from "@/lib/admin-data-service";
import { toast } from "sonner";

interface FinancialData {
  revenue: Array<{
    month: string;
    revenue: number;
    mrr: number;
    growth: number;
  }>;
  subscriptions: Array<{
    plan: string;
    users: number;
    revenue: number;
    percentage: number;
  }>;
  churn: Array<{
    month: string;
    churnRate: number;
    lostRevenue: number;
  }>;
  totalRevenue: number;
  mrr: number;
  arr: number;
  churnRate: number;
  ltv: number;
  cac: number;
}

interface PlanPricesData {
  free: number;
  basic: number;
  pro: number;
  enterprise: number;
  [key: string]: number; // Permitir indexação por string
}

interface FinancialSettingsData {
  currency: string;
  taxRate: number;
  invoicePrefix: string;
  paymentMethods: string[];
  billingCycle: string;
}

const COLORS = ["#3B82F6", "#10B981", "#F59E0B", "#EF4444", "#8B5CF6"];

const FinancialDashboard = () => {
  const [data, setData] = useState<FinancialData | null>(null);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  // Estados para modais
  const [isPricesModalOpen, setIsPricesModalOpen] = useState(false);
  const [isSettingsModalOpen, setIsSettingsModalOpen] = useState(false);
  const [isSubmitting, setIsSubmitting] = useState(false);

  // Estados para formulários
  const [planPrices, setPlanPrices] = useState<PlanPricesData>({
    free: 0,
    basic: 29,
    pro: 79,
    enterprise: 199,
  });

  const [financialSettings, setFinancialSettings] =
    useState<FinancialSettingsData>({
      currency: "BRL",
      taxRate: 0,
      invoicePrefix: "INV",
      paymentMethods: ["credit_card", "pix", "boleto"],
      billingCycle: "monthly",
    });

  useEffect(() => {
    setLoading(true);
    fetch("/api/financeiro/dashboard")
      .then((res) => {
        if (!res.ok) throw new Error("Erro ao buscar dados financeiros");
        return res.json();
      })
      .then((json) => {
        setData(json);
        setError(null);
      })
      .catch((err) => {
        setError(err.message);
        setData(null);
      })
      .finally(() => setLoading(false));
  }, []);

  // Auto-refresh a cada 30 segundos
  useEffect(() => {
    const interval = setInterval(() => {
      setLoading(true);
      fetch("/api/financeiro/dashboard")
        .then((res) => {
          if (!res.ok) throw new Error("Erro ao buscar dados financeiros");
          return res.json();
        })
        .then((json) => {
          setData(json);
          setError(null);
        })
        .catch((err) => {
          setError(err.message);
          setData(null);
        })
        .finally(() => setLoading(false));
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, []);

  const loadPlanPrices = () => {
    try {
      const prices = adminDataService.getPlanPrices();
      setPlanPrices(prices as PlanPricesData);
    } catch (error) {
      console.error("Erro ao carregar preços dos planos:", error);
    }
  };

  const loadFinancialSettings = () => {
    try {
      const settings = adminDataService.getFinancialSettings();
      setFinancialSettings(settings as FinancialSettingsData);
    } catch (error) {
      console.error("Erro ao carregar configurações financeiras:", error);
    }
  };

  const handleUpdatePlanPrices = async () => {
    setIsSubmitting(true);
    try {
      await adminDataService.updatePlanPrices(planPrices);
      setIsPricesModalOpen(false);
      loadPlanPrices(); // Recarregar dados
      toast.success("Preços dos planos atualizados com sucesso!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar preços";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleUpdateFinancialSettings = async () => {
    setIsSubmitting(true);
    try {
      await adminDataService.updateFinancialSettings(financialSettings);
      setIsSettingsModalOpen(false);
      toast.success("Configurações financeiras atualizadas com sucesso!");
    } catch (error) {
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Erro ao atualizar configurações";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const openPricesModal = () => {
    loadPlanPrices();
    setIsPricesModalOpen(true);
  };

  const openSettingsModal = () => {
    loadFinancialSettings();
    setIsSettingsModalOpen(true);
  };

  const formatCurrency = (value: number) => {
    return new Intl.NumberFormat("pt-BR", {
      style: "currency",
      currency: financialSettings.currency,
    }).format(value);
  };

  const formatPercentage = (value: number) => {
    return `${value.toFixed(1)}%`;
  };

  if (loading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">
          Carregando dados financeiros...
        </span>
      </div>
    );
  }

  if (error) {
    return <div className="p-8 text-center text-red-500">Erro: {error}</div>;
  }

  if (!data) {
    return (
      <div className="p-8 text-center text-gray-500">
        Nenhum dado encontrado.
      </div>
    );
  }

  // Substitua os valores mockados pelos dados reais:
  // data.totalRevenue, data.mrr, data.arr, data.growth, etc.

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-green-600 to-blue-600 bg-clip-text text-transparent">
            Dashboard Financeiro
          </h2>
          <p className="text-gray-600 mt-1">
            Métricas e análises financeiras da plataforma
          </p>
        </div>

        <div className="flex items-center gap-3">
          <Button
            variant="outline"
            size="sm"
            onClick={openPricesModal}
            className="gap-2">
            <Edit className="h-4 w-4" />
            Preços
          </Button>

          <Button
            variant="outline"
            size="sm"
            onClick={openSettingsModal}
            className="gap-2">
            <Settings className="h-4 w-4" />
            Configurações
          </Button>

          <Select
            value={financialSettings.billingCycle}
            onValueChange={(value) =>
              setFinancialSettings({
                ...financialSettings,
                billingCycle: value,
              })
            }>
            <SelectTrigger className="w-32">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="monthly">Mensal</SelectItem>
              <SelectItem value="quarterly">Trimestral</SelectItem>
              <SelectItem value="yearly">Anual</SelectItem>
            </SelectContent>
          </Select>

          {/* Remover o botão de refresh manual que chama loadFinancialData */}
        </div>
      </div>

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-green-100 text-sm">Receita Total</p>
                <p className="text-2xl font-bold">
                  {formatCurrency(data.totalRevenue)}
                </p>
                <p className="text-green-200 text-sm flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +7% este mês
                </p>
              </div>
              <DollarSign className="h-8 w-8 text-green-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-blue-100 text-sm">MRR</p>
                <p className="text-2xl font-bold">{formatCurrency(data.mrr)}</p>
                <p className="text-blue-200 text-sm flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +8% este mês
                </p>
              </div>
              <Activity className="h-8 w-8 text-blue-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-purple-100 text-sm">ARR</p>
                <p className="text-2xl font-bold">{formatCurrency(data.arr)}</p>
                <p className="text-purple-200 text-sm flex items-center gap-1">
                  <TrendingUp className="h-4 w-4" />
                  +8% este mês
                </p>
              </div>
              <Target className="h-8 w-8 text-purple-200" />
            </div>
          </CardContent>
        </Card>

        <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-orange-100 text-sm">Taxa de Churn</p>
                <p className="text-2xl font-bold">
                  {formatPercentage(data.churnRate)}
                </p>
                <p className="text-orange-200 text-sm flex items-center gap-1">
                  <TrendingDown className="h-4 w-4" />
                  -0.3% este mês
                </p>
              </div>
              <Users className="h-8 w-8 text-orange-200" />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Gráficos */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Evolução da Receita */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingUp className="h-5 w-5 text-green-600" />
              Evolução da Receita
            </CardTitle>
            <CardDescription>
              Receita mensal e MRR ao longo do tempo
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.revenue}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10B981"
                  strokeWidth={2}
                  name="Receita"
                />
                <Line
                  type="monotone"
                  dataKey="mrr"
                  stroke="#3B82F6"
                  strokeWidth={2}
                  name="MRR"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Distribuição por Plano */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <BarChart3 className="h-5 w-5 text-blue-600" />
              Distribuição por Plano
            </CardTitle>
            <CardDescription>
              Receita e usuários por tipo de plano
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <BarChart data={data.subscriptions}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="plan" />
                <YAxis />
                <Tooltip formatter={(value) => formatCurrency(Number(value))} />
                <Legend />
                <Bar dataKey="revenue" fill="#3B82F6" name="Receita" />
                <Bar dataKey="users" fill="#10B981" name="Usuários" />
              </BarChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Taxa de Churn */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <TrendingDown className="h-5 w-5 text-red-600" />
              Taxa de Churn
            </CardTitle>
            <CardDescription>
              Taxa de cancelamento e receita perdida
            </CardDescription>
          </CardHeader>
          <CardContent>
            <ResponsiveContainer width="100%" height={300}>
              <LineChart data={data.churn}>
                <CartesianGrid strokeDasharray="3 3" />
                <XAxis dataKey="month" />
                <YAxis />
                <Tooltip />
                <Legend />
                <Line
                  type="monotone"
                  dataKey="churnRate"
                  stroke="#EF4444"
                  strokeWidth={2}
                  name="Taxa de Churn (%)"
                />
              </LineChart>
            </ResponsiveContainer>
          </CardContent>
        </Card>

        {/* Métricas Avançadas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas Avançadas</CardTitle>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="text-center p-4 bg-blue-50 rounded-lg">
                <p className="text-sm text-gray-600">LTV</p>
                <p className="text-xl font-bold text-blue-600">
                  {formatCurrency(data.ltv)}
                </p>
              </div>
              <div className="text-center p-4 bg-green-50 rounded-lg">
                <p className="text-sm text-gray-600">CAC</p>
                <p className="text-xl font-bold text-green-600">
                  {formatCurrency(data.cac)}
                </p>
              </div>
            </div>
            <div className="text-center p-4 bg-purple-50 rounded-lg">
              <p className="text-sm text-gray-600">LTV/CAC Ratio</p>
              <p className="text-xl font-bold text-purple-600">
                {(data.ltv / data.cac).toFixed(1)}
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Modal de Preços dos Planos */}
      <Dialog open={isPricesModalOpen} onOpenChange={setIsPricesModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurar Preços dos Planos</DialogTitle>
            <DialogDescription>
              Defina os preços mensais para cada plano de assinatura
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price-free">Gratuito (R$)</Label>
                <Input
                  id="price-free"
                  type="number"
                  value={planPrices.free}
                  onChange={(e) =>
                    setPlanPrices({
                      ...planPrices,
                      free: parseFloat(e.target.value) || 0,
                    })
                  }
                  disabled
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-basic">Básico (R$)</Label>
                <Input
                  id="price-basic"
                  type="number"
                  value={planPrices.basic}
                  onChange={(e) =>
                    setPlanPrices({
                      ...planPrices,
                      basic: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="price-pro">Profissional (R$)</Label>
                <Input
                  id="price-pro"
                  type="number"
                  value={planPrices.pro}
                  onChange={(e) =>
                    setPlanPrices({
                      ...planPrices,
                      pro: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="price-enterprise">Empresarial (R$)</Label>
                <Input
                  id="price-enterprise"
                  type="number"
                  value={planPrices.enterprise}
                  onChange={(e) =>
                    setPlanPrices({
                      ...planPrices,
                      enterprise: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsPricesModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleUpdatePlanPrices} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              Salvar Preços
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Configurações Financeiras */}
      <Dialog open={isSettingsModalOpen} onOpenChange={setIsSettingsModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Configurações Financeiras</DialogTitle>
            <DialogDescription>
              Configure as opções gerais do sistema financeiro
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="currency">Moeda</Label>
                <Select
                  value={financialSettings.currency}
                  onValueChange={(value) =>
                    setFinancialSettings({
                      ...financialSettings,
                      currency: value,
                    })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="BRL">Real (BRL)</SelectItem>
                    <SelectItem value="USD">Dólar (USD)</SelectItem>
                    <SelectItem value="EUR">Euro (EUR)</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="tax-rate">Taxa de Imposto (%)</Label>
                <Input
                  id="tax-rate"
                  type="number"
                  value={financialSettings.taxRate}
                  onChange={(e) =>
                    setFinancialSettings({
                      ...financialSettings,
                      taxRate: parseFloat(e.target.value) || 0,
                    })
                  }
                />
              </div>
            </div>
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="invoice-prefix">Prefixo da Fatura</Label>
                <Input
                  id="invoice-prefix"
                  value={financialSettings.invoicePrefix}
                  onChange={(e) =>
                    setFinancialSettings({
                      ...financialSettings,
                      invoicePrefix: e.target.value,
                    })
                  }
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="billing-cycle">Ciclo de Cobrança</Label>
                <Select
                  value={financialSettings.billingCycle}
                  onValueChange={(value) =>
                    setFinancialSettings({
                      ...financialSettings,
                      billingCycle: value,
                    })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="monthly">Mensal</SelectItem>
                    <SelectItem value="quarterly">Trimestral</SelectItem>
                    <SelectItem value="yearly">Anual</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsSettingsModalOpen(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleUpdateFinancialSettings}
              disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              <Save className="mr-2 h-4 w-4" />
              Salvar Configurações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default FinancialDashboard;
