import { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  BarChart3,
  TrendingUp,
  Users,
  FileText,
  Calendar,
  Download,
  Clock,
  Award,
  Target,
  Bot,
  Zap,
  CheckCircle,
  Star,
  Activity,
  Lightbulb,
  Gauge,
  Plus,
  Settings,
  RefreshCw,
} from "lucide-react";
import {
  BarChart,
  Bar,
  XAxis,
  YAxis,
  CartesianGrid,
  Tooltip,
  ResponsiveContainer,
  PieChart,
  Pie,
  Cell,
  LineChart,
  Line,
} from "recharts";
import { PageHeader } from "@/components/PageHeader";
import {
  advancedReportsService,
  ReportConfig,
  ReportData,
} from "@/lib/advanced-reports";
import { toast } from "sonner";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Switch } from "@/components/ui/switch";

const mockData = {
  documentsByMonth: [
    { month: "Jan", gerados: 45, finalizados: 38 },
    { month: "Fev", gerados: 52, finalizados: 47 },
    { month: "Mar", gerados: 48, finalizados: 42 },
    { month: "Abr", gerados: 61, finalizados: 55 },
    { month: "Mai", gerados: 58, finalizados: 52 },
    { month: "Jun", gerados: 67, finalizados: 61 },
  ],
  documentTypes: [
    { name: "Petições Iniciais", value: 40, color: "#3b82f6" },
    { name: "Recursos", value: 25, color: "#10b981" },
    { name: "Contestações", value: 20, color: "#f59e0b" },
    { name: "Pareceres", value: 15, color: "#ef4444" },
  ],
  aiUsage: [
    { month: "Jan", usage: 85 },
    { month: "Fev", usage: 92 },
    { month: "Mar", usage: 88 },
    { month: "Abr", usage: 95 },
    { month: "Mai", usage: 91 },
    { month: "Jun", usage: 97 },
  ],
  productivity: [
    { day: "Seg", documents: 12, time: 4.5 },
    { day: "Ter", documents: 15, time: 5.2 },
    { day: "Qua", documents: 18, time: 6.1 },
    { day: "Qui", documents: 14, time: 4.8 },
    { day: "Sex", documents: 11, time: 3.9 },
  ],
};

const Analytics = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [templates, setTemplates] = useState<ReportConfig[]>([]);
  const [loading, setLoading] = useState(false);
  const [isReportDialogOpen, setIsReportDialogOpen] = useState(false);
  const [selectedTemplate, setSelectedTemplate] = useState<ReportConfig | null>(
    null
  );
  const [reportConfig, setReportConfig] = useState<Partial<ReportConfig>>({
    name: "",
    description: "",
    type: "analytics",
    dateRange: {
      from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
      to: new Date(),
    },
    filters: {},
    groupBy: "day",
    metrics: ["totalDocuments", "aiUsage", "productivity"],
    format: "summary",
    exportFormats: ["csv", "excel"],
  });

  useEffect(() => {
    loadReports();
    loadTemplates();
  }, []);

  const loadReports = async () => {
    try {
      const reportsData = advancedReportsService.getReports();
      setReports(reportsData);
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
  };

  const loadTemplates = async () => {
    try {
      const templatesData = advancedReportsService.getTemplates();
      setTemplates(templatesData);
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
    }
  };

  const handleGenerateReport = async () => {
    if (!reportConfig.name || !reportConfig.type) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    setLoading(true);
    try {
      const config: ReportConfig = {
        id: `config_${Date.now()}`,
        name: reportConfig.name,
        description: reportConfig.description || "",
        type: reportConfig.type as ReportConfig["type"],
        dateRange: reportConfig.dateRange!,
        filters: reportConfig.filters || {},
        groupBy: reportConfig.groupBy || "day",
        metrics: reportConfig.metrics || [],
        format: reportConfig.format || "summary",
        exportFormats: reportConfig.exportFormats || ["csv"],
        scheduled: reportConfig.scheduled,
      };

      const newReport = await advancedReportsService.generateReport(config);
      setReports((prev) => [newReport, ...prev]);
      setIsReportDialogOpen(false);
      setReportConfig({
        name: "",
        description: "",
        type: "analytics",
        dateRange: {
          from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
          to: new Date(),
        },
        filters: {},
        groupBy: "day",
        metrics: ["totalDocuments", "aiUsage", "productivity"],
        format: "summary",
        exportFormats: ["csv", "excel"],
      });
      toast.success("Relatório gerado com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar relatório!");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  const handleExportReport = async (report: ReportData, format: string) => {
    try {
      await advancedReportsService.exportReport(report, format as any);
      toast.success(`Relatório exportado em ${format.toUpperCase()}!`);
    } catch (error) {
      toast.error("Erro ao exportar relatório!");
    }
  };

  const handleUseTemplate = (template: ReportConfig) => {
    setSelectedTemplate(template);
    setReportConfig({
      name: `${template.name} - ${new Date().toLocaleDateString()}`,
      description: template.description,
      type: template.type,
      dateRange: template.dateRange,
      filters: template.filters,
      groupBy: template.groupBy,
      metrics: template.metrics,
      format: template.format,
      exportFormats: template.exportFormats,
      scheduled: template.scheduled,
    });
    setIsReportDialogOpen(true);
  };

  const handleSaveTemplate = async () => {
    if (!reportConfig.name || !reportConfig.type) {
      toast.error("Preencha todos os campos obrigatórios!");
      return;
    }

    try {
      const config: ReportConfig = {
        id: `template_${Date.now()}`,
        name: reportConfig.name,
        description: reportConfig.description || "",
        type: reportConfig.type as ReportConfig["type"],
        dateRange: reportConfig.dateRange!,
        filters: reportConfig.filters || {},
        groupBy: reportConfig.groupBy || "day",
        metrics: reportConfig.metrics || [],
        format: reportConfig.format || "summary",
        exportFormats: reportConfig.exportFormats || ["csv"],
        scheduled: reportConfig.scheduled,
      };

      await advancedReportsService.saveTemplate(config);
      await loadTemplates();
      toast.success("Template salvo com sucesso!");
    } catch (error) {
      toast.error("Erro ao salvar template!");
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Relatórios de Produtividade"
        subtitle="Métricas de eficiência e uso da IA jurídica"
        icon={<BarChart3 className="w-5 h-5 md:w-6 md:h-6" />}
        actions={
          <div className="flex space-x-2">
            <Select defaultValue="6months">
              <SelectTrigger className="w-40 bg-white/20 text-white border-white/30">
                <SelectValue />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="1month">1 Mês</SelectItem>
                <SelectItem value="3months">3 Meses</SelectItem>
                <SelectItem value="6months">6 Meses</SelectItem>
                <SelectItem value="1year">1 Ano</SelectItem>
              </SelectContent>
            </Select>
            <Button
              onClick={() => setIsReportDialogOpen(true)}
              className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Novo Relatório
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        {/* Relatórios Recentes */}
        {reports.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex">
            <CardHeader className="bg-gradient-aiudex text-white border-b-0">
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-4 h-4 text-white" />
                  </div>
                  <span>Relatórios Recentes</span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  {reports.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {reports.slice(0, 6).map((report) => (
                  <div
                    key={report.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200">
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 min-w-0">
                        {report.config.name}
                      </h4>
                      <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs flex-shrink-0 ml-2">
                        {report.config.type}
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {report.config.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {report.summary.dateGenerated.toLocaleDateString()}
                      </span>
                      <div className="flex space-x-1">
                        {report.config.exportFormats?.map((format) => (
                          <Button
                            key={format}
                            size="sm"
                            variant="outline"
                            onClick={() => handleExportReport(report, format)}
                            className="h-6 px-2 text-xs">
                            {format.toUpperCase()}
                          </Button>
                        ))}
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Templates de Relatórios */}
        {templates.length > 0 && (
          <Card className="bg-white/80 backdrop-blur-sm border-green-200/50 shadow-aiudex">
            <CardHeader className="bg-gradient-to-br from-green-500 to-blue-500 text-white border-b-0">
              <CardTitle className="flex items-center justify-between text-white">
                <div className="flex items-center space-x-3">
                  <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                    <Settings className="w-4 h-4 text-white" />
                  </div>
                  <span>Templates de Relatórios</span>
                </div>
                <Badge className="bg-white/20 text-white border-white/30">
                  {templates.length}
                </Badge>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                {templates.slice(0, 6).map((template) => (
                  <div
                    key={template.id}
                    className="p-4 border border-gray-200 rounded-lg bg-white/50 hover:bg-white/80 transition-all duration-200 cursor-pointer"
                    onClick={() => handleUseTemplate(template)}>
                    <div className="flex items-start justify-between mb-2">
                      <h4 className="font-semibold text-gray-900 text-sm line-clamp-2 flex-1 min-w-0">
                        {template.name}
                      </h4>
                      <Badge className="bg-green-100 text-green-800 border-green-200 text-xs flex-shrink-0 ml-2">
                        Template
                      </Badge>
                    </div>
                    <p className="text-xs text-gray-600 mb-3 line-clamp-2">
                      {template.description}
                    </p>
                    <div className="flex items-center justify-between">
                      <span className="text-xs text-gray-500">
                        {template.type}
                      </span>
                      <Button
                        size="sm"
                        variant="outline"
                        className="h-6 px-2 text-xs">
                        Usar
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Documentos Gerados</p>
                  <p className="text-2xl font-bold text-white">342</p>
                  <p className="text-xs text-white/80 mt-1">
                    <TrendingUp className="h-3 w-3 inline mr-1" />
                    +15% este mês
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-aiudex-secondary text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Uso da IA</p>
                  <p className="text-2xl font-bold text-white">97%</p>
                  <p className="text-xs text-white/80 mt-1">
                    <Zap className="h-3 w-3 inline mr-1" />
                    Documentos com IA
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Tempo Economizado</p>
                  <p className="text-2xl font-bold text-white">127h</p>
                  <p className="text-xs text-white/80 mt-1">
                    <Activity className="h-3 w-3 inline mr-1" />
                    Este mês
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Qualidade Média</p>
                  <p className="text-2xl font-bold text-white">4.8/5</p>
                  <p className="text-xs text-white/80 mt-1">
                    <CheckCircle className="h-3 w-3 inline mr-1" />
                    Avaliação dos documentos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Principais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardHeader className="bg-gradient-aiudex text-white border-b-0">
              <CardTitle className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span>Documentos por Mês</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.documentsByMonth}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    dataKey="gerados"
                    fill="#3b82f6"
                    name="Gerados"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    dataKey="finalizados"
                    fill="#10b981"
                    name="Finalizados"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardHeader className="bg-gradient-aiudex-secondary text-white border-b-0">
              <CardTitle className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <BarChart3 className="w-4 h-4 text-white" />
                </div>
                <span>Tipos de Documentos</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <PieChart>
                  <Pie
                    data={mockData.documentTypes}
                    cx="50%"
                    cy="50%"
                    labelLine={false}
                    label={({ name, percent }) =>
                      `${name} ${((percent || 0) * 100).toFixed(0)}%`
                    }
                    outerRadius={80}
                    fill="#8884d8"
                    dataKey="value">
                    {mockData.documentTypes.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                </PieChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Gráficos Adicionais */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-br from-purple-500 to-pink-500 text-white border-b-0">
              <CardTitle className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <span>Uso da IA ao Longo do Tempo</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <LineChart data={mockData.aiUsage}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="month" stroke="#6b7280" />
                  <YAxis stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Line
                    type="monotone"
                    dataKey="usage"
                    stroke="#8b5cf6"
                    strokeWidth={3}
                    name="Uso da IA (%)"
                    dot={{ fill: "#8b5cf6", strokeWidth: 2, r: 4 }}
                    activeDot={{ r: 6, stroke: "#8b5cf6", strokeWidth: 2 }}
                  />
                </LineChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>

          <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardHeader className="bg-gradient-to-br from-green-500 to-blue-500 text-white border-b-0">
              <CardTitle className="flex items-center space-x-3 text-white">
                <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                  <Activity className="w-4 h-4 text-white" />
                </div>
                <span>Produtividade Semanal</span>
              </CardTitle>
            </CardHeader>
            <CardContent className="p-6">
              <ResponsiveContainer width="100%" height={300}>
                <BarChart data={mockData.productivity}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                  <XAxis dataKey="day" stroke="#6b7280" />
                  <YAxis yAxisId="left" stroke="#6b7280" />
                  <YAxis yAxisId="right" orientation="right" stroke="#6b7280" />
                  <Tooltip
                    contentStyle={{
                      backgroundColor: "rgba(255, 255, 255, 0.95)",
                      border: "1px solid #e5e7eb",
                      borderRadius: "8px",
                      boxShadow: "0 4px 6px -1px rgba(0, 0, 0, 0.1)",
                    }}
                  />
                  <Bar
                    yAxisId="left"
                    dataKey="documents"
                    fill="#3b82f6"
                    name="Documentos"
                    radius={[4, 4, 0, 0]}
                  />
                  <Bar
                    yAxisId="right"
                    dataKey="time"
                    fill="#10b981"
                    name="Horas"
                    radius={[4, 4, 0, 0]}
                  />
                </BarChart>
              </ResponsiveContainer>
            </CardContent>
          </Card>
        </div>

        {/* Seção de Insights */}
        <div className="bg-gradient-aiudex rounded-xl p-8 text-white shadow-aiudex">
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold mb-4">
              💡 Insights de Produtividade
            </h2>
            <p className="text-xl opacity-90">
              Descobertas valiosas sobre sua eficiência e uso da IA
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-aiudex">
                  <Target className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-3 text-lg">
                  Melhor Dia da Semana
                </h3>
                <p className="text-3xl font-bold text-white mb-2">
                  Quarta-feira
                </p>
                <p className="text-sm text-white/80">
                  18 documentos em 6.1 horas
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-aiudex">
                  <Award className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-3 text-lg">
                  Tipo Mais Eficiente
                </h3>
                <p className="text-3xl font-bold text-white mb-2">
                  Petições Iniciais
                </p>
                <p className="text-sm text-white/80">
                  40% dos documentos gerados
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-16 h-16 bg-white/20 rounded-full flex items-center justify-center mx-auto mb-4 shadow-aiudex">
                  <Gauge className="w-8 h-8 text-white" />
                </div>
                <h3 className="font-semibold text-white mb-3 text-lg">
                  Eficiência da IA
                </h3>
                <p className="text-3xl font-bold text-white mb-2">97%</p>
                <p className="text-sm text-white/80">
                  Documentos com assistência da IA
                </p>
              </CardContent>
            </Card>
          </div>
        </div>

        {/* Seção de Ações */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-200 shadow-aiudex">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              📊 Ações Baseadas nos Dados
            </h3>
            <p className="text-lg text-gray-600">
              Recomendações para otimizar ainda mais sua produtividade
            </p>
          </div>

          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-aiudex rounded-lg flex items-center justify-center mx-auto mb-4 shadow-aiudex">
                  <Target className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Foque na Quarta-feira
                </h4>
                <p className="text-sm text-gray-600">
                  Seu dia mais produtivo. Agende tarefas importantes neste dia.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-green-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-green-500 to-blue-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-aiudex">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Petições Iniciais
                </h4>
                <p className="text-sm text-gray-600">
                  Seu tipo mais eficiente. Considere especializar-se nesta área.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-purple-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-purple-500 to-pink-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-aiudex">
                  <Bot className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Maximize a IA
                </h4>
                <p className="text-sm text-gray-600">
                  97% de eficiência. Continue usando a IA para todos os
                  documentos.
                </p>
              </CardContent>
            </Card>

            <Card className="bg-white/80 backdrop-blur-sm border-orange-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardContent className="p-6 text-center">
                <div className="w-12 h-12 bg-gradient-to-br from-orange-500 to-yellow-500 rounded-lg flex items-center justify-center mx-auto mb-4 shadow-aiudex">
                  <TrendingUp className="w-6 h-6 text-white" />
                </div>
                <h4 className="font-semibold text-gray-900 mb-2">
                  Mantenha o Crescimento
                </h4>
                <p className="text-sm text-gray-600">
                  +15% este mês. Continue no mesmo ritmo para superar metas.
                </p>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>

      {/* Modal de Novo Relatório */}
      <Dialog open={isReportDialogOpen} onOpenChange={setIsReportDialogOpen}>
        <DialogContent className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg">
          <DialogHeader className="bg-gradient-aiudex text-white rounded-t-lg -m-6 mb-6 p-6">
            <DialogTitle className="flex items-center space-x-3 text-white">
              <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                <Plus className="w-5 h-5 text-white" />
              </div>
              <span className="text-xl">Novo Relatório</span>
            </DialogTitle>
          </DialogHeader>
          <div className="space-y-6">
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="name"
                  className="text-sm font-medium text-gray-700">
                  Nome do Relatório *
                </Label>
                <Input
                  id="name"
                  value={reportConfig.name}
                  onChange={(e) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      name: e.target.value,
                    }))
                  }
                  placeholder="Digite o nome do relatório"
                  className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
                />
              </div>
              <div>
                <Label
                  htmlFor="type"
                  className="text-sm font-medium text-gray-700">
                  Tipo *
                </Label>
                <Select
                  value={reportConfig.type}
                  onValueChange={(value) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      type: value as ReportConfig["type"],
                    }))
                  }>
                  <SelectTrigger className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200">
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="users">Usuários</SelectItem>
                    <SelectItem value="financial">Financeiro</SelectItem>
                    <SelectItem value="activity">Atividades</SelectItem>
                    <SelectItem value="analytics">Analytics</SelectItem>
                    <SelectItem value="custom">Personalizado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div>
              <Label
                htmlFor="description"
                className="text-sm font-medium text-gray-700">
                Descrição
              </Label>
              <Textarea
                id="description"
                value={reportConfig.description}
                onChange={(e) =>
                  setReportConfig((prev) => ({
                    ...prev,
                    description: e.target.value,
                  }))
                }
                placeholder="Descrição do relatório"
                rows={3}
                className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200 focus:border-blue-500"
              />
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
              <div>
                <Label
                  htmlFor="format"
                  className="text-sm font-medium text-gray-700">
                  Formato
                </Label>
                <Select
                  value={reportConfig.format}
                  onValueChange={(value) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      format: value as any,
                    }))
                  }>
                  <SelectTrigger className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200">
                    <SelectValue placeholder="Selecione o formato" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="table">Tabela</SelectItem>
                    <SelectItem value="chart">Gráfico</SelectItem>
                    <SelectItem value="summary">Resumo</SelectItem>
                    <SelectItem value="detailed">Detalhado</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div>
                <Label
                  htmlFor="groupBy"
                  className="text-sm font-medium text-gray-700">
                  Agrupar Por
                </Label>
                <Select
                  value={reportConfig.groupBy}
                  onValueChange={(value) =>
                    setReportConfig((prev) => ({
                      ...prev,
                      groupBy: value as any,
                    }))
                  }>
                  <SelectTrigger className="mt-1 bg-white/50 backdrop-blur-sm border-gray-200">
                    <SelectValue placeholder="Selecione o agrupamento" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="day">Dia</SelectItem>
                    <SelectItem value="week">Semana</SelectItem>
                    <SelectItem value="month">Mês</SelectItem>
                    <SelectItem value="quarter">Trimestre</SelectItem>
                    <SelectItem value="year">Ano</SelectItem>
                    <SelectItem value="none">Sem agrupamento</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="bg-gradient-to-br from-blue-50 to-indigo-50 p-4 rounded-lg border border-blue-100">
              <div className="flex items-center space-x-3 mb-4">
                <Switch
                  id="saveTemplate"
                  checked={false}
                  onCheckedChange={() => {}}
                />
                <Label
                  htmlFor="saveTemplate"
                  className="text-sm font-medium text-gray-700">
                  Salvar como Template
                </Label>
              </div>
            </div>

            <div className="flex justify-end space-x-3 pt-4 border-t border-gray-200">
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsReportDialogOpen(false)}
                className="bg-white/50 backdrop-blur-sm border-gray-200 hover:bg-gray-50 hover:border-gray-300 transition-all duration-200">
                Cancelar
              </Button>
              <Button
                type="button"
                variant="outline"
                onClick={handleSaveTemplate}
                className="bg-green-50 border-green-200 text-green-700 hover:bg-green-100 hover:border-green-300 transition-all duration-200">
                Salvar Template
              </Button>
              <Button
                type="button"
                onClick={handleGenerateReport}
                disabled={loading}
                className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                {loading ? (
                  <>
                    <RefreshCw className="w-4 h-4 mr-2 animate-spin" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <Plus className="w-4 h-4 mr-2" />
                    Gerar Relatório
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default Analytics;
