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
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  FileText,
  Calendar as CalendarIcon,
  Settings,
  Download,
  Play,
  Save,
  Layout,
  Filter,
  BarChart3,
  TrendingUp,
  Users,
  DollarSign,
  Activity,
  Brain,
} from "lucide-react";
import {
  advancedReportsService,
  ReportConfig,
  ReportData,
} from "@/lib/advanced-reports";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportGeneratorProps {
  className?: string;
}

const reportTypes = [
  { value: "users", label: "Usuários", icon: Users },
  { value: "financial", label: "Financeiro", icon: DollarSign },
  { value: "activity", label: "Atividades", icon: Activity },
  { value: "analytics", label: "Analytics", icon: Brain },
];

const groupByOptions = [
  { value: "none", label: "Sem agrupamento" },
  { value: "day", label: "Por dia" },
  { value: "week", label: "Por semana" },
  { value: "month", label: "Por mês" },
  { value: "quarter", label: "Por trimestre" },
  { value: "year", label: "Por ano" },
];

const formatOptions = [
  { value: "table", label: "Tabela" },
  { value: "chart", label: "Gráfico" },
  { value: "summary", label: "Resumo" },
  { value: "detailed", label: "Detalhado" },
];

const exportFormats = [
  { value: "csv", label: "CSV" },
  { value: "excel", label: "Excel" },
  { value: "pdf", label: "PDF" },
  { value: "json", label: "JSON" },
];

export const ReportGenerator: React.FC<ReportGeneratorProps> = ({
  className,
}) => {
  const [config, setConfig] = useState<Partial<ReportConfig>>({
    name: "",
    description: "",
    type: "users",
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
    filters: {},
    groupBy: "day",
    metrics: [],
    format: "table",
    exportFormats: ["csv"],
  });

  const [isGenerating, setIsGenerating] = useState(false);
  const [generatedReport, setGeneratedReport] = useState<ReportData | null>(
    null
  );
  const [templates, setTemplates] = useState<ReportConfig[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState<string>("");

  // Carregar templates
  useEffect(() => {
    setTemplates(advancedReportsService.getTemplates());
  }, []);

  // Aplicar template
  const applyTemplate = (templateId: string) => {
    const template = templates.find((t) => t.id === templateId);
    if (template) {
      setConfig(template);
      setSelectedTemplate(templateId);
      toast.success("Template aplicado com sucesso!");
    }
  };

  // Salvar como template
  const saveAsTemplate = () => {
    if (!config.name) {
      toast.error("Nome do relatório é obrigatório");
      return;
    }

    const template: ReportConfig = {
      ...config,
      id: `template_${Date.now()}`,
    } as ReportConfig;

    advancedReportsService.saveTemplate(template);
    setTemplates(advancedReportsService.getTemplates());
    toast.success("Template salvo com sucesso!");
  };

  // Gerar relatório
  const generateReport = async () => {
    if (!config.name || !config.type) {
      toast.error("Nome e tipo do relatório são obrigatórios");
      return;
    }

    setIsGenerating(true);
    try {
      const report = await advancedReportsService.generateReport(
        config as ReportConfig
      );
      setGeneratedReport(report);
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório");
      console.error(error);
    } finally {
      setIsGenerating(false);
    }
  };

  // Exportar relatório
  const exportReport = async (format: "csv" | "excel" | "pdf" | "json") => {
    if (!generatedReport) {
      toast.error("Nenhum relatório gerado");
      return;
    }

    try {
      await advancedReportsService.exportReport(generatedReport, format);
      toast.success(`Relatório exportado como ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Erro ao exportar relatório");
      console.error(error);
    }
  };

  // Atualizar configuração
  const updateConfig = <K extends keyof ReportConfig>(
    key: K,
    value: ReportConfig[K]
  ) => {
    setConfig((prev) => ({ ...prev, [key]: value }));
  };

  // Atualizar filtros
  const updateFilters = (filterKey: string, value: any) => {
    setConfig((prev) => ({
      ...prev,
      filters: {
        ...prev.filters,
        [filterKey]: value,
      },
    }));
  };

  // Toggle métrica
  const toggleMetric = (metric: string) => {
    const currentMetrics = config.metrics || [];
    const newMetrics = currentMetrics.includes(metric)
      ? currentMetrics.filter((m) => m !== metric)
      : [...currentMetrics, metric];
    updateConfig("metrics", newMetrics);
  };

  // Métricas disponíveis baseadas no tipo
  const getAvailableMetrics = () => {
    switch (config.type) {
      case "users":
        return [
          "totalUsers",
          "newUsers",
          "activeUsers",
          "churned",
          "averageCredits",
        ];
      case "financial":
        return ["revenue", "mrr", "conversion", "churn", "averageRevenue"];
      case "activity":
        return [
          "totalActivities",
          "documentGenerated",
          "creditsUsed",
          "loginCount",
        ];
      case "analytics":
        return ["kpis", "growth", "engagement", "performance", "retention"];
      default:
        return [];
    }
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Cabeçalho */}
      <Card>
        <CardHeader>
          <div className="flex items-center gap-2">
            <FileText className="h-5 w-5 text-blue-600" />
            <CardTitle>Gerador de Relatórios Avançados</CardTitle>
          </div>
          <CardDescription>
            Crie relatórios customizados com filtros avançados e múltiplos
            formatos de exportação
          </CardDescription>
        </CardHeader>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Configuração do Relatório */}
        <div className="lg:col-span-2 space-y-6">
          {/* Informações Básicas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Informações Básicas</CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label htmlFor="report-name">Nome do Relatório</Label>
                  <Input
                    id="report-name"
                    placeholder="Ex: Relatório Mensal de Usuários"
                    value={config.name || ""}
                    onChange={(e) => updateConfig("name", e.target.value)}
                  />
                </div>

                <div className="space-y-2">
                  <Label htmlFor="report-type">Tipo de Relatório</Label>
                  <Select
                    value={config.type}
                    onValueChange={(value) =>
                      updateConfig("type", value as any)
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {reportTypes.map((type) => (
                        <SelectItem key={type.value} value={type.value}>
                          <div className="flex items-center gap-2">
                            <type.icon className="h-4 w-4" />
                            {type.label}
                          </div>
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="description">Descrição</Label>
                <Textarea
                  id="description"
                  placeholder="Descreva o objetivo e conteúdo do relatório"
                  value={config.description || ""}
                  onChange={(e) => updateConfig("description", e.target.value)}
                />
              </div>
            </CardContent>
          </Card>

          {/* Período */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <CalendarIcon className="h-4 w-4" />
                Período
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Data Inicial</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {config.dateRange?.from?.toLocaleDateString("pt-BR") ||
                          "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={config.dateRange?.from}
                        onSelect={(date) =>
                          updateConfig("dateRange", {
                            ...config.dateRange!,
                            from: date || new Date(),
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>

                <div className="space-y-2">
                  <Label>Data Final</Label>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        variant="outline"
                        className="w-full justify-start">
                        <CalendarIcon className="mr-2 h-4 w-4" />
                        {config.dateRange?.to?.toLocaleDateString("pt-BR") ||
                          "Selecionar"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent className="w-auto p-0" align="start">
                      <Calendar
                        mode="single"
                        selected={config.dateRange?.to}
                        onSelect={(date) =>
                          updateConfig("dateRange", {
                            ...config.dateRange!,
                            to: date || new Date(),
                          })
                        }
                      />
                    </PopoverContent>
                  </Popover>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Filtros */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Filter className="h-4 w-4" />
                Filtros
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              {config.type === "users" && (
                <>
                  <div className="space-y-2">
                    <Label>Status dos Usuários</Label>
                    <div className="flex flex-wrap gap-2">
                      {["ativo", "inativo", "suspenso"].map((status) => (
                        <div
                          key={status}
                          className="flex items-center space-x-2">
                          <Checkbox
                            id={`status-${status}`}
                            checked={config.filters?.userStatus?.includes(
                              status
                            )}
                            onCheckedChange={(checked) => {
                              const current = config.filters?.userStatus || [];
                              const updated = checked
                                ? [...current, status]
                                : current.filter((s) => s !== status);
                              updateFilters("userStatus", updated);
                            }}
                          />
                          <Label
                            htmlFor={`status-${status}`}
                            className="text-sm capitalize">
                            {status}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>

                  <div className="space-y-2">
                    <Label>Planos</Label>
                    <div className="flex flex-wrap gap-2">
                      {["free", "basic", "pro", "enterprise"].map((plan) => (
                        <div key={plan} className="flex items-center space-x-2">
                          <Checkbox
                            id={`plan-${plan}`}
                            checked={config.filters?.userPlans?.includes(plan)}
                            onCheckedChange={(checked) => {
                              const current = config.filters?.userPlans || [];
                              const updated = checked
                                ? [...current, plan]
                                : current.filter((p) => p !== plan);
                              updateFilters("userPlans", updated);
                            }}
                          />
                          <Label
                            htmlFor={`plan-${plan}`}
                            className="text-sm capitalize">
                            {plan}
                          </Label>
                        </div>
                      ))}
                    </div>
                  </div>
                </>
              )}

              {config.type === "financial" && (
                <div className="grid grid-cols-2 gap-4">
                  <div className="space-y-2">
                    <Label>Receita Mínima (R$)</Label>
                    <Input
                      type="number"
                      placeholder="0"
                      value={config.filters?.minRevenue || ""}
                      onChange={(e) =>
                        updateFilters(
                          "minRevenue",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                  <div className="space-y-2">
                    <Label>Receita Máxima (R$)</Label>
                    <Input
                      type="number"
                      placeholder="10000"
                      value={config.filters?.maxRevenue || ""}
                      onChange={(e) =>
                        updateFilters(
                          "maxRevenue",
                          parseInt(e.target.value) || 0
                        )
                      }
                    />
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Métricas */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <BarChart3 className="h-4 w-4" />
                Métricas
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-2 gap-2">
                {getAvailableMetrics().map((metric) => (
                  <div key={metric} className="flex items-center space-x-2">
                    <Checkbox
                      id={`metric-${metric}`}
                      checked={config.metrics?.includes(metric)}
                      onCheckedChange={() => toggleMetric(metric)}
                    />
                    <Label htmlFor={`metric-${metric}`} className="text-sm">
                      {metric}
                    </Label>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          {/* Configurações de Formato */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Settings className="h-4 w-4" />
                Formato e Exportação
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div className="space-y-2">
                  <Label>Agrupamento</Label>
                  <Select
                    value={config.groupBy}
                    onValueChange={(value) =>
                      updateConfig("groupBy", value as any)
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {groupByOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>

                <div className="space-y-2">
                  <Label>Formato</Label>
                  <Select
                    value={config.format}
                    onValueChange={(value) =>
                      updateConfig("format", value as any)
                    }>
                    <SelectTrigger>
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      {formatOptions.map((option) => (
                        <SelectItem key={option.value} value={option.value}>
                          {option.label}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                </div>
              </div>

              <div className="space-y-2">
                <Label>Formatos de Exportação</Label>
                <div className="flex flex-wrap gap-2">
                  {exportFormats.map((format) => (
                    <div
                      key={format.value}
                      className="flex items-center space-x-2">
                      <Checkbox
                        id={`export-${format.value}`}
                        checked={config.exportFormats?.includes(
                          format.value as any
                        )}
                        onCheckedChange={(checked) => {
                          const current = config.exportFormats || [];
                          const updated = checked
                            ? [...current, format.value as any]
                            : current.filter((f) => f !== format.value);
                          updateConfig("exportFormats", updated);
                        }}
                      />
                      <Label
                        htmlFor={`export-${format.value}`}
                        className="text-sm">
                        {format.label}
                      </Label>
                    </div>
                  ))}
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Painel Lateral */}
        <div className="space-y-6">
          {/* Templates */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg flex items-center gap-2">
                <Layout className="h-4 w-4" />
                Templates
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="space-y-2">
                <Label>Aplicar Template</Label>
                <Select value={selectedTemplate} onValueChange={applyTemplate}>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecionar template" />
                  </SelectTrigger>
                  <SelectContent>
                    {templates.map((template) => (
                      <SelectItem key={template.id} value={template.id}>
                        {template.name}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              </div>

              <Button
                variant="outline"
                onClick={saveAsTemplate}
                className="w-full gap-2">
                <Save className="h-4 w-4" />
                Salvar como Template
              </Button>
            </CardContent>
          </Card>

          {/* Ações */}
          <Card>
            <CardHeader>
              <CardTitle className="text-lg">Ações</CardTitle>
            </CardHeader>
            <CardContent className="space-y-3">
              <Button
                onClick={generateReport}
                disabled={isGenerating}
                className="w-full gap-2">
                <Play className="h-4 w-4" />
                {isGenerating ? "Gerando..." : "Gerar Relatório"}
              </Button>

              {generatedReport && (
                <div className="space-y-2">
                  <Separator />
                  <Label className="text-sm font-medium">Exportar como:</Label>
                  <div className="grid grid-cols-2 gap-2">
                    {(generatedReport.config.exportFormats || []).map(
                      (format) => (
                        <Button
                          key={format}
                          variant="outline"
                          size="sm"
                          onClick={() => exportReport(format)}
                          className="gap-1">
                          <Download className="h-3 w-3" />
                          {format.toUpperCase()}
                        </Button>
                      )
                    )}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>

          {/* Resumo do Relatório */}
          {generatedReport && (
            <Card>
              <CardHeader>
                <CardTitle className="text-lg flex items-center gap-2">
                  <TrendingUp className="h-4 w-4" />
                  Resumo
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3 text-sm">
                  <div>
                    <span className="font-medium">Registros:</span>
                    <br />
                    {generatedReport.summary.totalRecords}
                  </div>
                  <div>
                    <span className="font-medium">Período:</span>
                    <br />
                    {generatedReport.summary.timeRange}
                  </div>
                </div>

                <Separator />

                <div className="space-y-2">
                  <Label className="text-sm font-medium">
                    Métricas Principais:
                  </Label>
                  <div className="space-y-1">
                    {Object.entries(generatedReport.summary.keyMetrics).map(
                      ([key, value]) => (
                        <div key={key} className="flex justify-between text-sm">
                          <span className="capitalize">{key}:</span>
                          <Badge variant="secondary">{value}</Badge>
                        </div>
                      )
                    )}
                  </div>
                </div>
              </CardContent>
            </Card>
          )}
        </div>
      </div>
    </div>
  );
};
