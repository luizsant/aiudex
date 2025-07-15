import React, { useState } from "react";
import {
  Brain,
  FileText,
  AlertTriangle,
  Lock,
  Unlock,
  DollarSign,
  CheckCircle,
  Clock,
  Eye,
  Download,
  RefreshCw,
  TrendingUp,
  Hash,
  PieChart,
  LineChart,
  Target,
  Gauge,
  Timer,
  Cpu,
  Settings,
  Bell,
  Shield,
} from "lucide-react";
import { Card, CardHeader, CardTitle, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Separator } from "@/components/ui/separator";
import { Switch } from "@/components/ui/switch";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";

// Mock de dados iniciais
const mockMetrics = {
  totalPecas: 1243,
  totalPrompts: 3872,
  totalErros: 17,
  custoMedio: 89.5,
  bloqueado: false,
  plano: "Pro",
  limiteTokens: 1000000,
  tokensUsados: 785000,
};

// Mock de histórico de prompts
const mockPromptHistory = [
  {
    id: "1",
    timestamp: "2024-01-15 14:30:22",
    user: "advogado@exemplo.com",
    prompt:
      "Gere uma petição inicial para ação de indenização por danos morais",
    tokens: 2450,
    status: "success",
    responseTime: 2.3,
    cost: 0.12,
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:25:15",
    user: "estagiario@exemplo.com",
    prompt: "Analise este contrato e identifique cláusulas abusivas",
    tokens: 1890,
    status: "success",
    responseTime: 1.8,
    cost: 0.09,
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:20:08",
    user: "admin@legalai.com",
    prompt: "Crie um modelo de procuração para empresa",
    tokens: 3200,
    status: "error",
    responseTime: 0,
    cost: 0,
    error: "Timeout na resposta da API",
  },
  {
    id: "4",
    timestamp: "2024-01-15 14:15:45",
    user: "advogado@exemplo.com",
    prompt: "Gere um parecer jurídico sobre direito trabalhista",
    tokens: 4100,
    status: "success",
    responseTime: 3.1,
    cost: 0.21,
  },
];

// Mock de histórico de peças geradas
const mockPecasHistory = [
  {
    id: "1",
    timestamp: "2024-01-15 14:30:22",
    user: "advogado@exemplo.com",
    tipo: "Petição Inicial",
    titulo: "Ação de Indenização por Danos Morais",
    tokens: 2450,
    tamanho: "2.3 KB",
    status: "completed",
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:25:15",
    user: "estagiario@exemplo.com",
    tipo: "Análise de Contrato",
    titulo: "Análise de Cláusulas Abusivas",
    tokens: 1890,
    tamanho: "1.8 KB",
    status: "completed",
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:20:08",
    user: "admin@legalai.com",
    tipo: "Modelo de Procuração",
    titulo: "Procuração Empresarial",
    tokens: 3200,
    tamanho: "3.1 KB",
    status: "failed",
  },
  {
    id: "4",
    timestamp: "2024-01-15 14:15:45",
    user: "advogado@exemplo.com",
    tipo: "Parecer Jurídico",
    titulo: "Parecer sobre Direito Trabalhista",
    tokens: 4100,
    tamanho: "4.2 KB",
    status: "completed",
  },
];

// Mock de dados para gráficos
const mockChartData = {
  custosPorMes: [
    { mes: "Jan", custo: 1250.5 },
    { mes: "Fev", custo: 1380.75 },
    { mes: "Mar", custo: 1120.3 },
    { mes: "Abr", custo: 1450.9 },
    { mes: "Mai", custo: 1320.45 },
    { mes: "Jun", custo: 1580.2 },
  ],
  pecasPorTipo: [
    { tipo: "Petições", quantidade: 450, percentual: 36.2 },
    { tipo: "Contratos", quantidade: 320, percentual: 25.7 },
    { tipo: "Pareceres", quantidade: 280, percentual: 22.5 },
    { tipo: "Recursos", quantidade: 120, percentual: 9.7 },
    { tipo: "Outros", quantidade: 73, percentual: 5.9 },
  ],
  performanceIA: {
    tempoMedioResposta: 2.3,
    taxaSucesso: 94.2,
    tokensPorPrompt: 2150,
    custoPorToken: 0.00012,
  },
  tendencias: [
    { dia: "01/01", prompts: 45, pecas: 12, erros: 2 },
    { dia: "02/01", prompts: 52, pecas: 18, erros: 1 },
    { dia: "03/01", prompts: 38, pecas: 15, erros: 3 },
    { dia: "04/01", prompts: 67, pecas: 22, erros: 1 },
    { dia: "05/01", prompts: 73, pecas: 25, erros: 2 },
    { dia: "06/01", prompts: 58, pecas: 19, erros: 1 },
    { dia: "07/01", prompts: 82, pecas: 28, erros: 0 },
  ],
};

// Mock de configurações e alertas
const mockConfiguracoes = {
  limites: {
    tokensDiarios: 100000,
    tokensMensais: 1000000,
    custoDiario: 50.0,
    custoMensal: 500.0,
    promptsPorHora: 100,
    pecasPorDia: 50,
  },
  alertas: {
    ativo: true,
    email: "admin@legalai.com",
    percentualLimite: 80,
    notificacoes: {
      limiteTokens: true,
      limiteCusto: true,
      errosIA: true,
      performanceBaixa: true,
    },
  },
  bloqueioAutomatico: {
    ativo: true,
    percentualLimite: 95,
    acao: "bloquear",
    mensagem: "Limite de tokens atingido. Entre em contato com o suporte.",
  },
};

const mockAlertas = [
  {
    id: "1",
    tipo: "limite_tokens",
    severidade: "warning",
    titulo: "Limite de Tokens Aproximando",
    mensagem: "80% do limite mensal de tokens foi atingido",
    timestamp: "2024-01-15 14:30:00",
    status: "ativo",
  },
  {
    id: "2",
    tipo: "erro_ia",
    severidade: "error",
    titulo: "Erro na API de IA",
    mensagem: "Falha na comunicação com o serviço de IA",
    timestamp: "2024-01-15 14:25:00",
    status: "resolvido",
  },
  {
    id: "3",
    tipo: "performance",
    severidade: "info",
    titulo: "Performance Otimizada",
    mensagem: "Tempo de resposta da IA melhorou 15%",
    timestamp: "2024-01-15 14:20:00",
    status: "ativo",
  },
];

const AIMonitoring = () => {
  const [metrics] = useState(mockMetrics);
  const [promptHistory] = useState(mockPromptHistory);
  const [pecasHistory] = useState(mockPecasHistory);
  const [chartData] = useState(mockChartData);
  const [configuracoes, setConfiguracoes] = useState(mockConfiguracoes);
  const [alertas] = useState(mockAlertas);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [isConfigModalOpen, setIsConfigModalOpen] = useState(false);

  const getStatusColor = (status: string) => {
    switch (status) {
      case "success":
      case "completed":
        return "bg-green-100 text-green-800";
      case "error":
      case "failed":
        return "bg-red-100 text-red-800";
      case "pending":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSeveridadeColor = (severidade: string) => {
    switch (severidade) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "critical":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const filteredPrompts = promptHistory.filter((prompt) => {
    const matchesSearch =
      prompt.prompt.toLowerCase().includes(searchTerm.toLowerCase()) ||
      prompt.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || prompt.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  const filteredPecas = pecasHistory.filter((peca) => {
    const matchesSearch =
      peca.titulo.toLowerCase().includes(searchTerm.toLowerCase()) ||
      peca.user.toLowerCase().includes(searchTerm.toLowerCase());
    const matchesStatus =
      statusFilter === "all" || peca.status === statusFilter;
    return matchesSearch && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Monitoramento de IA & Consumo
          </h2>
          <p className="text-gray-600">
            Acompanhe o uso, custos e status da IA na plataforma
          </p>
        </div>
        <Button variant="outline">
          <RefreshCw className="w-4 h-4 mr-2" />
          Atualizar
        </Button>
      </div>

      {/* Cards de Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Peças Geradas</CardTitle>
            <FileText className="h-4 w-4 text-blue-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPecas}</div>
            <p className="text-xs text-muted-foreground">
              Total de documentos criados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Prompts Processados
            </CardTitle>
            <Brain className="h-4 w-4 text-purple-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{metrics.totalPrompts}</div>
            <p className="text-xs text-muted-foreground">
              Total de prompts enviados
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">Erros de IA</CardTitle>
            <AlertTriangle className="h-4 w-4 text-red-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {metrics.totalErros}
            </div>
            <p className="text-xs text-muted-foreground">Falhas ou exceções</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Custo Médio Mensal
            </CardTitle>
            <DollarSign className="h-4 w-4 text-green-600" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              R$ {metrics.custoMedio.toFixed(2)}
            </div>
            <p className="text-xs text-muted-foreground">
              Por plano: {metrics.plano}
            </p>
          </CardContent>
        </Card>
      </div>

      {/* Status de Bloqueio */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between pb-2">
            <CardTitle className="text-sm font-medium">
              Status de Consumo
            </CardTitle>
            {metrics.bloqueado ? (
              <Lock className="h-4 w-4 text-red-600" />
            ) : (
              <Unlock className="h-4 w-4 text-green-600" />
            )}
          </CardHeader>
          <CardContent>
            <div className="flex items-center space-x-2">
              <span
                className={`font-bold text-lg ${
                  metrics.bloqueado ? "text-red-600" : "text-green-600"
                }`}>
                {metrics.bloqueado ? "Bloqueado" : "Ativo"}
              </span>
              <Badge variant={metrics.bloqueado ? "destructive" : "outline"}>
                {metrics.bloqueado ? "Limite Excedido" : "Dentro do Limite"}
              </Badge>
            </div>
            <div className="mt-2">
              <Progress
                value={(metrics.tokensUsados / metrics.limiteTokens) * 100}
              />
              <p className="text-xs text-muted-foreground mt-1">
                {metrics.tokensUsados.toLocaleString()} /{" "}
                {metrics.limiteTokens.toLocaleString()} tokens usados
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Histórico de Prompts e Peças */}
      <Tabs defaultValue="prompts" className="space-y-6">
        <TabsList className="grid w-full grid-cols-6">
          <TabsTrigger value="prompts">Histórico de Prompts</TabsTrigger>
          <TabsTrigger value="pecas">Peças Geradas</TabsTrigger>
          <TabsTrigger value="analises">Análises</TabsTrigger>
          <TabsTrigger value="performance">Performance</TabsTrigger>
          <TabsTrigger value="alertas">Alertas</TabsTrigger>
          <TabsTrigger value="configuracoes">Configurações</TabsTrigger>
        </TabsList>

        <TabsContent value="prompts" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Histórico de Prompts</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="success">Sucesso</SelectItem>
                      <SelectItem value="error">Erro</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Buscar prompts..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPrompts.map((prompt) => (
                  <div
                    key={prompt.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">
                          {prompt.prompt.substring(0, 60)}...
                        </h3>
                        <p className="text-sm text-gray-600">{prompt.user}</p>
                        <p className="text-xs text-gray-500">
                          {prompt.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(prompt.status)}>
                          {prompt.status === "success" ? "Sucesso" : "Erro"}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {prompt.tokens} tokens • {prompt.responseTime}s
                        </p>
                        <p className="text-xs text-gray-500">
                          R$ {prompt.cost.toFixed(2)}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="pecas" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Peças Geradas</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={statusFilter} onValueChange={setStatusFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todas</SelectItem>
                      <SelectItem value="completed">Concluídas</SelectItem>
                      <SelectItem value="failed">Falharam</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Buscar peças..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredPecas.map((peca) => (
                  <div
                    key={peca.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{peca.titulo}</h3>
                        <p className="text-sm text-gray-600">
                          {peca.user} • {peca.tipo}
                        </p>
                        <p className="text-xs text-gray-500">
                          {peca.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(peca.status)}>
                          {peca.status === "completed" ? "Concluída" : "Falhou"}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          {peca.tokens} tokens • {peca.tamanho}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="analises" className="space-y-6">
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Gráfico de Custos por Mês */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <TrendingUp className="h-5 w-5 text-green-600" />
                  <span>Custos por Mês</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  {chartData.custosPorMes.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between">
                      <span className="text-sm font-medium">{item.mes}</span>
                      <div className="flex items-center space-x-2">
                        <div className="w-32 bg-gray-200 rounded-full h-2">
                          <div
                            className="bg-green-600 h-2 rounded-full"
                            style={{
                              width: `${
                                (item.custo /
                                  Math.max(
                                    ...chartData.custosPorMes.map(
                                      (c) => c.custo
                                    )
                                  )) *
                                100
                              }%`,
                            }}
                          />
                        </div>
                        <span className="text-sm text-gray-600">
                          R$ {item.custo.toFixed(2)}
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>

            {/* Distribuição de Peças por Tipo */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <PieChart className="h-5 w-5 text-blue-600" />
                  <span>Peças por Tipo</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-3">
                  {chartData.pecasPorTipo.map((item, index) => (
                    <div
                      key={index}
                      className="flex items-center justify-between">
                      <div className="flex items-center space-x-2">
                        <div
                          className="w-3 h-3 rounded-full"
                          style={{
                            backgroundColor: [
                              "#3B82F6",
                              "#10B981",
                              "#F59E0B",
                              "#EF4444",
                              "#8B5CF6",
                            ][index % 5],
                          }}
                        />
                        <span className="text-sm font-medium">{item.tipo}</span>
                      </div>
                      <div className="flex items-center space-x-2">
                        <span className="text-sm text-gray-600">
                          {item.quantidade}
                        </span>
                        <span className="text-xs text-gray-500">
                          ({item.percentual}%)
                        </span>
                      </div>
                    </div>
                  ))}
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Tendências dos Últimos 7 Dias */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <LineChart className="h-5 w-5 text-purple-600" />
                <span>Tendências dos Últimos 7 Dias</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-7 gap-4">
                {chartData.tendencias.map((item, index) => (
                  <div key={index} className="text-center">
                    <p className="text-xs text-gray-500 mb-2">{item.dia}</p>
                    <div className="space-y-1">
                      <div className="flex items-center justify-between text-xs">
                        <span>Prompts:</span>
                        <span className="font-medium text-blue-600">
                          {item.prompts}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Peças:</span>
                        <span className="font-medium text-green-600">
                          {item.pecas}
                        </span>
                      </div>
                      <div className="flex items-center justify-between text-xs">
                        <span>Erros:</span>
                        <span className="font-medium text-red-600">
                          {item.erros}
                        </span>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="performance" className="space-y-6">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            {/* Tempo Médio de Resposta */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Tempo Médio
                </CardTitle>
                <Timer className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chartData.performanceIA.tempoMedioResposta}s
                </div>
                <p className="text-xs text-muted-foreground">
                  Tempo de resposta da IA
                </p>
                <Progress
                  value={chartData.performanceIA.tempoMedioResposta * 20}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Taxa de Sucesso */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Taxa de Sucesso
                </CardTitle>
                <Target className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chartData.performanceIA.taxaSucesso}%
                </div>
                <p className="text-xs text-muted-foreground">
                  Prompts processados com sucesso
                </p>
                <Progress
                  value={chartData.performanceIA.taxaSucesso}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Tokens por Prompt */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Tokens/Prompt
                </CardTitle>
                <Hash className="h-4 w-4 text-purple-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {chartData.performanceIA.tokensPorPrompt.toLocaleString()}
                </div>
                <p className="text-xs text-muted-foreground">
                  Média de tokens por prompt
                </p>
                <Progress
                  value={(chartData.performanceIA.tokensPorPrompt / 5000) * 100}
                  className="mt-2"
                />
              </CardContent>
            </Card>

            {/* Custo por Token */}
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Custo/Token
                </CardTitle>
                <DollarSign className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  R$ {chartData.performanceIA.custoPorToken.toFixed(5)}
                </div>
                <p className="text-xs text-muted-foreground">
                  Custo médio por token
                </p>
                <Progress value={50} className="mt-2" />
              </CardContent>
            </Card>
          </div>

          {/* Métricas Detalhadas de Performance */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Cpu className="h-5 w-5 text-blue-600" />
                  <span>Eficiência do Sistema</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Utilização de CPU</span>
                      <span>78%</span>
                    </div>
                    <Progress value={78} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Memória em Uso</span>
                      <span>65%</span>
                    </div>
                    <Progress value={65} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Armazenamento</span>
                      <span>42%</span>
                    </div>
                    <Progress value={42} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Gauge className="h-5 w-5 text-green-600" />
                  <span>Qualidade das Respostas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Precisão</span>
                      <span>96.5%</span>
                    </div>
                    <Progress value={96.5} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Relevância</span>
                      <span>94.2%</span>
                    </div>
                    <Progress value={94.2} className="h-2" />
                  </div>
                  <div>
                    <div className="flex justify-between text-sm mb-1">
                      <span>Satisfação do Usuário</span>
                      <span>91.8%</span>
                    </div>
                    <Progress value={91.8} className="h-2" />
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="alertas" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">Sistema de Alertas</h3>
              <p className="text-sm text-gray-600">
                Monitoramento automático e notificações
              </p>
            </div>
            <Button variant="outline">
              <Download className="w-4 h-4 mr-2" />
              Exportar Relatório
            </Button>
          </div>

          {/* Alertas Ativos */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <AlertTriangle className="h-5 w-5 text-orange-600" />
                <span>Alertas Ativos</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {alertas.map((alerta) => (
                  <div
                    key={alerta.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h4 className="font-semibold">{alerta.titulo}</h4>
                        <p className="text-sm text-gray-600">
                          {alerta.mensagem}
                        </p>
                        <p className="text-xs text-gray-500">
                          {alerta.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getSeveridadeColor(alerta.severidade)}>
                        {alerta.severidade}
                      </Badge>
                      <Badge
                        variant={
                          alerta.status === "ativo" ? "default" : "secondary"
                        }>
                        {alerta.status}
                      </Badge>
                      <Button variant="outline" size="sm">
                        <Eye className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Estatísticas de Alertas */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Alertas Hoje
                </CardTitle>
                <AlertTriangle className="h-4 w-4 text-orange-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alertas.filter((a) => a.status === "ativo").length}
                </div>
                <p className="text-xs text-muted-foreground">Alertas ativos</p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Resolvidos
                </CardTitle>
                <CheckCircle className="h-4 w-4 text-green-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">
                  {alertas.filter((a) => a.status === "resolvido").length}
                </div>
                <p className="text-xs text-muted-foreground">
                  Alertas resolvidos
                </p>
              </CardContent>
            </Card>
            <Card>
              <CardHeader className="flex flex-row items-center justify-between pb-2">
                <CardTitle className="text-sm font-medium">
                  Tempo Médio
                </CardTitle>
                <Clock className="h-4 w-4 text-blue-600" />
              </CardHeader>
              <CardContent>
                <div className="text-2xl font-bold">2.3h</div>
                <p className="text-xs text-muted-foreground">
                  Tempo para resolução
                </p>
              </CardContent>
            </Card>
          </div>
        </TabsContent>

        <TabsContent value="configuracoes" className="space-y-6">
          <div className="flex items-center justify-between">
            <div>
              <h3 className="text-lg font-semibold">
                Configurações de Monitoramento
              </h3>
              <p className="text-sm text-gray-600">
                Defina limites, alertas e comportamentos automáticos
              </p>
            </div>
            <Button onClick={() => setIsConfigModalOpen(true)}>
              <Settings className="w-4 h-4 mr-2" />
              Editar Configurações
            </Button>
          </div>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Limites de Uso */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Lock className="h-5 w-5 text-red-600" />
                  <span>Limites de Uso</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div>
                    <Label className="text-sm font-medium">
                      Tokens Diários
                    </Label>
                    <p className="text-2xl font-bold">
                      {configuracoes.limites.tokensDiarios.toLocaleString()}
                    </p>
                    <Progress value={75} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Tokens Mensais
                    </Label>
                    <p className="text-2xl font-bold">
                      {configuracoes.limites.tokensMensais.toLocaleString()}
                    </p>
                    <Progress value={78.5} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Custo Diário</Label>
                    <p className="text-2xl font-bold">
                      R$ {configuracoes.limites.custoDiario.toFixed(2)}
                    </p>
                    <Progress value={60} className="mt-2" />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">Custo Mensal</Label>
                    <p className="text-2xl font-bold">
                      R$ {configuracoes.limites.custoMensal.toFixed(2)}
                    </p>
                    <Progress value={45} className="mt-2" />
                  </div>
                </div>
              </CardContent>
            </Card>

            {/* Configurações de Alertas */}
            <Card>
              <CardHeader>
                <CardTitle className="flex items-center space-x-2">
                  <Bell className="h-5 w-5 text-orange-600" />
                  <span>Configurações de Alertas</span>
                </CardTitle>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex items-center justify-between">
                    <Label className="text-sm font-medium">
                      Alertas Ativos
                    </Label>
                    <Switch checked={configuracoes.alertas.ativo} />
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Email de Notificação
                    </Label>
                    <p className="text-sm text-gray-600">
                      {configuracoes.alertas.email}
                    </p>
                  </div>
                  <div>
                    <Label className="text-sm font-medium">
                      Percentual de Limite
                    </Label>
                    <p className="text-2xl font-bold">
                      {configuracoes.alertas.percentualLimite}%
                    </p>
                    <Progress
                      value={configuracoes.alertas.percentualLimite}
                      className="mt-2"
                    />
                  </div>
                  <Separator />
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Limite de Tokens</Label>
                      <Switch
                        checked={
                          configuracoes.alertas.notificacoes.limiteTokens
                        }
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Limite de Custo</Label>
                      <Switch
                        checked={configuracoes.alertas.notificacoes.limiteCusto}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Erros de IA</Label>
                      <Switch
                        checked={configuracoes.alertas.notificacoes.errosIA}
                      />
                    </div>
                    <div className="flex items-center justify-between">
                      <Label className="text-sm">Performance Baixa</Label>
                      <Switch
                        checked={
                          configuracoes.alertas.notificacoes.performanceBaixa
                        }
                      />
                    </div>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Bloqueio Automático */}
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center space-x-2">
                <Shield className="h-5 w-5 text-red-600" />
                <span>Bloqueio Automático</span>
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                <div className="flex items-center justify-between">
                  <Label className="text-sm font-medium">
                    Bloqueio Automático Ativo
                  </Label>
                  <Switch checked={configuracoes.bloqueioAutomatico.ativo} />
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Percentual para Bloqueio
                  </Label>
                  <p className="text-2xl font-bold">
                    {configuracoes.bloqueioAutomatico.percentualLimite}%
                  </p>
                  <Progress
                    value={configuracoes.bloqueioAutomatico.percentualLimite}
                    className="mt-2"
                  />
                </div>
                <div>
                  <Label className="text-sm font-medium">Ação</Label>
                  <Badge variant="destructive">
                    {configuracoes.bloqueioAutomatico.acao}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium">
                    Mensagem de Bloqueio
                  </Label>
                  <p className="text-sm text-gray-600 mt-1">
                    {configuracoes.bloqueioAutomatico.mensagem}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Configurações */}
      <Dialog open={isConfigModalOpen} onOpenChange={setIsConfigModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Editar Configurações de Monitoramento</DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Limites de Tokens</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">Diários</Label>
                  <Input
                    type="number"
                    value={configuracoes.limites.tokensDiarios}
                    onChange={(e) =>
                      setConfiguracoes({
                        ...configuracoes,
                        limites: {
                          ...configuracoes.limites,
                          tokensDiarios: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Mensais</Label>
                  <Input
                    type="number"
                    value={configuracoes.limites.tokensMensais}
                    onChange={(e) =>
                      setConfiguracoes({
                        ...configuracoes,
                        limites: {
                          ...configuracoes.limites,
                          tokensMensais: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Limites de Custo</Label>
              <div className="grid grid-cols-2 gap-4 mt-2">
                <div>
                  <Label className="text-xs">Diário (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={configuracoes.limites.custoDiario}
                    onChange={(e) =>
                      setConfiguracoes({
                        ...configuracoes,
                        limites: {
                          ...configuracoes.limites,
                          custoDiario: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
                <div>
                  <Label className="text-xs">Mensal (R$)</Label>
                  <Input
                    type="number"
                    step="0.01"
                    value={configuracoes.limites.custoMensal}
                    onChange={(e) =>
                      setConfiguracoes({
                        ...configuracoes,
                        limites: {
                          ...configuracoes.limites,
                          custoMensal: Number(e.target.value),
                        },
                      })
                    }
                  />
                </div>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">
                Percentual para Alertas
              </Label>
              <Input
                type="number"
                value={configuracoes.alertas.percentualLimite}
                onChange={(e) =>
                  setConfiguracoes({
                    ...configuracoes,
                    alertas: {
                      ...configuracoes.alertas,
                      percentualLimite: Number(e.target.value),
                    },
                  })
                }
              />
            </div>
            <div>
              <Label className="text-sm font-medium">
                Mensagem de Bloqueio
              </Label>
              <Textarea
                value={configuracoes.bloqueioAutomatico.mensagem}
                onChange={(e) =>
                  setConfiguracoes({
                    ...configuracoes,
                    bloqueioAutomatico: {
                      ...configuracoes.bloqueioAutomatico,
                      mensagem: e.target.value,
                    },
                  })
                }
                rows={3}
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setIsConfigModalOpen(false)}>
                Cancelar
              </Button>
              <Button onClick={() => setIsConfigModalOpen(false)}>
                Salvar Configurações
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default AIMonitoring;
