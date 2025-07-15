import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Download,
  Eye,
  Trash2,
  Calendar,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Minus,
  RefreshCw,
  Filter,
} from "lucide-react";
import {
  advancedReportsService,
  ReportData,
  ComparisonReport,
} from "@/lib/advanced-reports";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface ReportViewerProps {
  className?: string;
}

export const ReportViewer: React.FC<ReportViewerProps> = ({ className }) => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [selectedReport, setSelectedReport] = useState<ReportData | null>(null);
  const [comparisonReport, setComparisonReport] =
    useState<ComparisonReport | null>(null);
  const [viewMode, setViewMode] = useState<"list" | "details" | "comparison">(
    "list"
  );
  const [filterType, setFilterType] = useState<string>("all");
  const [isLoading, setIsLoading] = useState(false);

  // Carregar relatórios
  useEffect(() => {
    loadReports();
  }, []);

  const loadReports = () => {
    setReports(advancedReportsService.getReports());
  };

  // Filtrar relatórios
  const filteredReports = reports.filter((report) => {
    if (filterType === "all") return true;
    return report.config.type === filterType;
  });

  // Visualizar relatório
  const viewReport = (report: ReportData) => {
    setSelectedReport(report);
    setViewMode("details");
  };

  // Comparar relatório
  const compareReport = async (report: ReportData) => {
    setIsLoading(true);
    try {
      const comparison = await advancedReportsService.compareReports(
        report.config,
        "previous"
      );
      setComparisonReport(comparison);
      setViewMode("comparison");
      toast.success("Comparação gerada com sucesso!");
    } catch (error) {
      toast.error("Erro ao gerar comparação");
      console.error(error);
    } finally {
      setIsLoading(false);
    }
  };

  // Exportar relatório
  const exportReport = async (
    report: ReportData,
    format: "csv" | "excel" | "pdf" | "json"
  ) => {
    try {
      await advancedReportsService.exportReport(report, format);
      toast.success(`Relatório exportado como ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Erro ao exportar relatório");
      console.error(error);
    }
  };

  // Remover relatório
  const removeReport = (reportId: string) => {
    advancedReportsService.removeReport(reportId);
    loadReports();
    if (selectedReport?.id === reportId) {
      setSelectedReport(null);
      setViewMode("list");
    }
    toast.success("Relatório removido com sucesso!");
  };

  // Limpar relatórios antigos
  const cleanupOldReports = () => {
    advancedReportsService.cleanupOldReports(30);
    loadReports();
    toast.success("Relatórios antigos removidos!");
  };

  // Obter ícone de tendência
  const getTrendIcon = (trend: "up" | "down" | "stable") => {
    switch (trend) {
      case "up":
        return <TrendingUp className="h-4 w-4 text-green-600" />;
      case "down":
        return <TrendingDown className="h-4 w-4 text-red-600" />;
      default:
        return <Minus className="h-4 w-4 text-gray-600" />;
    }
  };

  // Renderizar lista de relatórios
  const renderReportList = () => (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2">
          <FileText className="h-5 w-5 text-blue-600" />
          <h3 className="text-lg font-semibold">Relatórios Gerados</h3>
          <Badge variant="secondary">{filteredReports.length}</Badge>
        </div>

        <div className="flex items-center gap-2">
          <Select value={filterType} onValueChange={setFilterType}>
            <SelectTrigger className="w-40">
              <SelectValue />
            </SelectTrigger>
            <SelectContent>
              <SelectItem value="all">Todos</SelectItem>
              <SelectItem value="users">Usuários</SelectItem>
              <SelectItem value="financial">Financeiro</SelectItem>
              <SelectItem value="activity">Atividades</SelectItem>
              <SelectItem value="analytics">Analytics</SelectItem>
            </SelectContent>
          </Select>

          <Button variant="outline" size="sm" onClick={loadReports}>
            <RefreshCw className="h-4 w-4" />
          </Button>

          <Button variant="outline" size="sm" onClick={cleanupOldReports}>
            <Trash2 className="h-4 w-4" />
          </Button>
        </div>
      </div>

      <div className="grid gap-4">
        {filteredReports.length === 0 ? (
          <Card>
            <CardContent className="p-8 text-center text-gray-500">
              <FileText className="h-12 w-12 mx-auto mb-4 text-gray-300" />
              <p>Nenhum relatório encontrado</p>
            </CardContent>
          </Card>
        ) : (
          filteredReports.map((report) => (
            <Card key={report.id} className="hover:shadow-md transition-shadow">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex-1">
                    <div className="flex items-center gap-2 mb-2">
                      <h4 className="font-medium">{report.config.name}</h4>
                      <Badge variant="outline" className="text-xs">
                        {report.config.type}
                      </Badge>
                    </div>

                    <p className="text-sm text-gray-600 mb-2">
                      {report.config.description}
                    </p>

                    <div className="flex items-center gap-4 text-xs text-gray-500">
                      <div className="flex items-center gap-1">
                        <Calendar className="h-3 w-3" />
                        {report.summary.dateGenerated.toLocaleDateString(
                          "pt-BR"
                        )}
                      </div>
                      <div className="flex items-center gap-1">
                        <BarChart3 className="h-3 w-3" />
                        {report.summary.totalRecords} registros
                      </div>
                    </div>
                  </div>

                  <div className="flex items-center gap-2">
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => viewReport(report)}>
                      <Eye className="h-4 w-4" />
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => compareReport(report)}
                      disabled={isLoading}>
                      <TrendingUp className="h-4 w-4" />
                    </Button>

                    <Select
                      onValueChange={(format) =>
                        exportReport(report, format as any)
                      }>
                      <SelectTrigger className="w-20">
                        <Download className="h-4 w-4" />
                      </SelectTrigger>
                      <SelectContent>
                        {report.config.exportFormats.map((format) => (
                          <SelectItem key={format} value={format}>
                            {format.toUpperCase()}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>

                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => removeReport(report.id)}
                      className="text-red-600 hover:text-red-700">
                      <Trash2 className="h-4 w-4" />
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          ))
        )}
      </div>
    </div>
  );

  // Renderizar detalhes do relatório
  const renderReportDetails = () => {
    if (!selectedReport) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">
              {selectedReport.config.name}
            </h3>
            <p className="text-sm text-gray-600">
              {selectedReport.config.description}
            </p>
          </div>

          <Button variant="outline" onClick={() => setViewMode("list")}>
            Voltar
          </Button>
        </div>

        {/* Resumo */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Resumo</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
              <div className="text-center">
                <div className="text-2xl font-bold text-blue-600">
                  {selectedReport.summary.totalRecords}
                </div>
                <div className="text-sm text-gray-600">Total de Registros</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-green-600">
                  {selectedReport.summary.timeRange}
                </div>
                <div className="text-sm text-gray-600">Período</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-purple-600">
                  {selectedReport.config.format}
                </div>
                <div className="text-sm text-gray-600">Formato</div>
              </div>

              <div className="text-center">
                <div className="text-2xl font-bold text-orange-600">
                  {selectedReport.summary.dateGenerated.toLocaleDateString(
                    "pt-BR"
                  )}
                </div>
                <div className="text-sm text-gray-600">Data de Geração</div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Métricas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Métricas Principais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-2 md:grid-cols-3 gap-4">
              {Object.entries(selectedReport.summary.keyMetrics).map(
                ([key, value]) => (
                  <div key={key} className="p-3 bg-gray-50 rounded-lg">
                    <div className="text-lg font-semibold">{value}</div>
                    <div className="text-sm text-gray-600 capitalize">
                      {key}
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>

        {/* Dados */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Dados</CardTitle>
          </CardHeader>
          <CardContent>
            <ScrollArea className="h-96">
              <Table>
                <TableHeader>
                  <TableRow>
                    {selectedReport.data.length > 0 &&
                      Object.keys(selectedReport.data[0]).map((key) => (
                        <TableHead key={key} className="capitalize">
                          {key}
                        </TableHead>
                      ))}
                  </TableRow>
                </TableHeader>
                <TableBody>
                  {selectedReport.data.map((row, index) => (
                    <TableRow key={index}>
                      {Object.values(row).map((value, cellIndex) => (
                        <TableCell key={cellIndex}>
                          {typeof value === "object"
                            ? JSON.stringify(value)
                            : String(value)}
                        </TableCell>
                      ))}
                    </TableRow>
                  ))}
                </TableBody>
              </Table>
            </ScrollArea>
          </CardContent>
        </Card>
      </div>
    );
  };

  // Renderizar comparação
  const renderComparison = () => {
    if (!comparisonReport) return null;

    return (
      <div className="space-y-6">
        <div className="flex items-center justify-between">
          <div>
            <h3 className="text-lg font-semibold">Comparação de Relatórios</h3>
            <p className="text-sm text-gray-600">
              Comparação entre períodos: atual vs anterior
            </p>
          </div>

          <Button variant="outline" onClick={() => setViewMode("list")}>
            Voltar
          </Button>
        </div>

        {/* Resumo da Comparação */}
        <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-blue-600">
                Período Atual
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Registros:</span>
                  <span className="font-medium">
                    {comparisonReport.current.summary.totalRecords}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Período:</span>
                  <span className="font-medium">
                    {comparisonReport.current.summary.timeRange}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="text-lg text-gray-600">
                Período Anterior
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                <div className="flex justify-between">
                  <span>Registros:</span>
                  <span className="font-medium">
                    {comparisonReport.previous.summary.totalRecords}
                  </span>
                </div>
                <div className="flex justify-between">
                  <span>Período:</span>
                  <span className="font-medium">
                    {comparisonReport.previous.summary.timeRange}
                  </span>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Métricas Comparativas */}
        <Card>
          <CardHeader>
            <CardTitle className="text-lg">Comparação de Métricas</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              {Object.entries(comparisonReport.comparison.percentageChange).map(
                ([key, change]) => (
                  <div
                    key={key}
                    className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
                    <div className="flex items-center gap-2">
                      {getTrendIcon(comparisonReport.comparison.trends[key])}
                      <span className="capitalize font-medium">{key}</span>
                    </div>

                    <div className="flex items-center gap-4">
                      <div className="text-right">
                        <div className="text-sm text-gray-600">Mudança</div>
                        <div className="font-medium">
                          {comparisonReport.comparison.absoluteChange[key] > 0
                            ? "+"
                            : ""}
                          {comparisonReport.comparison.absoluteChange[key]}
                        </div>
                      </div>

                      <div className="text-right">
                        <div className="text-sm text-gray-600">Percentual</div>
                        <div
                          className={cn(
                            "font-medium",
                            change > 0
                              ? "text-green-600"
                              : change < 0
                              ? "text-red-600"
                              : "text-gray-600"
                          )}>
                          {change > 0 ? "+" : ""}
                          {change.toFixed(1)}%
                        </div>
                      </div>
                    </div>
                  </div>
                )
              )}
            </div>
          </CardContent>
        </Card>
      </div>
    );
  };

  return (
    <div className={cn("space-y-6", className)}>
      {viewMode === "list" && renderReportList()}
      {viewMode === "details" && renderReportDetails()}
      {viewMode === "comparison" && renderComparison()}
    </div>
  );
};
