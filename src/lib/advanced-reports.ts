import { adminDataService } from "./admin-data-service";
import {
  reportsAPI,
  Report,
  ReportTemplate,
  CreateReportData,
  CreateTemplateData,
} from "./reports-api";

export interface ReportConfig {
  id: string;
  name: string;
  description: string;
  type: "users" | "financial" | "activity" | "analytics" | "custom";
  dateRange: {
    from: Date;
    to: Date;
  };
  filters: {
    userStatus?: string[];
    userPlans?: string[];
    activityTypes?: string[];
    minRevenue?: number;
    maxRevenue?: number;
  };
  groupBy: "day" | "week" | "month" | "quarter" | "year" | "none";
  metrics: string[];
  format: "table" | "chart" | "summary" | "detailed";
  exportFormats: ("csv" | "excel" | "pdf" | "json")[];
  scheduled?: {
    enabled: boolean;
    frequency: "daily" | "weekly" | "monthly";
    recipients: string[];
  };
}

export interface ReportData {
  id: string;
  config: ReportConfig;
  data: any[];
  summary: {
    totalRecords: number;
    dateGenerated: Date;
    timeRange: string;
    keyMetrics: Record<string, any>;
  };
  charts?: {
    type: "line" | "bar" | "pie" | "area";
    data: any[];
    config: any;
  }[];
}

export interface ComparisonReport {
  current: ReportData;
  previous: ReportData;
  comparison: {
    percentageChange: Record<string, number>;
    absoluteChange: Record<string, number>;
    trends: Record<string, "up" | "down" | "stable">;
  };
}

class AdvancedReportsService {
  private reports: ReportData[] = [];
  private templates: ReportConfig[] = [];
  private readonly STORAGE_KEY = "advanced_reports";
  private readonly TEMPLATES_KEY = "report_templates";
  private apiAvailable = true;

  constructor() {
    this.loadReports();
    this.loadTemplates();
    this.initializeDefaultTemplates();
    this.checkAPIHealth();
  }

  private async checkAPIHealth() {
    try {
      this.apiAvailable = await reportsAPI.checkAPIHealth();
      if (this.apiAvailable) {
        await this.syncWithAPI();
      }
    } catch (error) {
      this.apiAvailable = false;
      console.log("API de relatórios não disponível, usando localStorage");
    }
  }

  private async syncWithAPI() {
    try {
      const apiResult = await reportsAPI.getReports({ limit: 100 });
      const apiReports = apiResult.data;

      // Converter formato da API para formato local
      const convertedReports: ReportData[] = apiReports.map((apiReport) => ({
        id: apiReport.id,
        config: apiReport.config,
        data: apiReport.data,
        summary: {
          ...apiReport.summary,
          dateGenerated: new Date(apiReport.summary.dateGenerated),
        },
        charts: apiReport.charts,
      }));

      this.reports = convertedReports;
      this.saveReports();

      // Sincronizar templates
      const templatesResult = await reportsAPI.getTemplates({ limit: 100 });
      const apiTemplates = templatesResult.data;

      const convertedTemplates: ReportConfig[] = apiTemplates.map(
        (apiTemplate) => ({
          ...apiTemplate.config,
          id: apiTemplate.id,
        })
      );

      this.templates = convertedTemplates;
      this.saveTemplates();
    } catch (error) {
      console.error("Erro ao sincronizar com API:", error);
    }
  }

  // Carregar relatórios salvos
  private loadReports() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.reports = parsed.map((r: any) => ({
          ...r,
          config: {
            ...r.config,
            dateRange: {
              from: new Date(r.config.dateRange.from),
              to: new Date(r.config.dateRange.to),
            },
          },
          summary: {
            ...r.summary,
            dateGenerated: new Date(r.summary.dateGenerated),
          },
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar relatórios:", error);
    }
  }

  // Salvar relatórios
  private saveReports() {
    try {
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(this.reports));
    } catch (error) {
      console.error("Erro ao salvar relatórios:", error);
    }
  }

  // Carregar templates
  private loadTemplates() {
    try {
      const saved = localStorage.getItem(this.TEMPLATES_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.templates = parsed.map((t: any) => ({
          ...t,
          dateRange: {
            from: new Date(t.dateRange.from),
            to: new Date(t.dateRange.to),
          },
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
    }
  }

  // Salvar templates
  private saveTemplates() {
    try {
      localStorage.setItem(this.TEMPLATES_KEY, JSON.stringify(this.templates));
    } catch (error) {
      console.error("Erro ao salvar templates:", error);
    }
  }

  // Inicializar templates padrão
  private initializeDefaultTemplates() {
    if (this.templates.length === 0) {
      const defaultTemplates: ReportConfig[] = [
        {
          id: "users-monthly",
          name: "Relatório Mensal de Usuários",
          description: "Análise completa de usuários e atividades do mês",
          type: "users",
          dateRange: {
            from: new Date(new Date().getFullYear(), new Date().getMonth(), 1),
            to: new Date(),
          },
          filters: {},
          groupBy: "day",
          metrics: ["totalUsers", "newUsers", "activeUsers", "churned"],
          format: "detailed",
          exportFormats: ["csv", "excel", "pdf"],
        },
        {
          id: "financial-quarterly",
          name: "Relatório Financeiro Trimestral",
          description: "Análise financeira e de receita do trimestre",
          type: "financial",
          dateRange: {
            from: new Date(
              new Date().getFullYear(),
              Math.floor(new Date().getMonth() / 3) * 3,
              1
            ),
            to: new Date(),
          },
          filters: {},
          groupBy: "month",
          metrics: ["revenue", "mrr", "conversion", "churn"],
          format: "summary",
          exportFormats: ["excel", "pdf"],
        },
        {
          id: "activity-weekly",
          name: "Relatório Semanal de Atividades",
          description: "Logs e atividades dos usuários na semana",
          type: "activity",
          dateRange: {
            from: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000),
            to: new Date(),
          },
          filters: {},
          groupBy: "day",
          metrics: ["totalActivities", "documentGenerated", "creditsUsed"],
          format: "table",
          exportFormats: ["csv"],
        },
        {
          id: "analytics-dashboard",
          name: "Dashboard Analytics",
          description: "Métricas principais para dashboard executivo",
          type: "analytics",
          dateRange: {
            from: new Date(Date.now() - 30 * 24 * 60 * 60 * 1000),
            to: new Date(),
          },
          filters: {},
          groupBy: "week",
          metrics: ["kpis", "growth", "engagement", "performance"],
          format: "chart",
          exportFormats: ["pdf", "excel"],
        },
      ];

      this.templates = defaultTemplates;
      this.saveTemplates();
    }
  }

  // Gerar relatório
  async generateReport(config: ReportConfig): Promise<ReportData> {
    const reportData = await this.collectReportData(config);
    const processedData = this.processReportData(reportData, config);
    const summary = this.generateSummary(processedData, config);
    const charts = this.generateCharts(processedData, config);

    const report: ReportData = {
      id: `report_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      config,
      data: processedData,
      summary,
      charts,
    };

    // Tentar salvar na API primeiro
    if (this.apiAvailable) {
      try {
        const apiData: CreateReportData = {
          name: config.name,
          description: config.description,
          type: config.type,
          config: config,
          data: processedData,
          summary: summary,
          charts: charts,
          format: config.format,
          exportFormats: config.exportFormats,
          scheduled: config.scheduled,
        };

        await reportsAPI.createReport(apiData);
        await this.syncWithAPI();
        return report;
      } catch (error) {
        console.error("Erro ao salvar na API, usando localStorage:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    this.reports.unshift(report);
    this.saveReports();

    return report;
  }

  // Coletar dados para relatório
  private async collectReportData(config: ReportConfig): Promise<any[]> {
    switch (config.type) {
      case "users":
        return adminDataService.getRealUsers();
      case "financial":
        return [adminDataService.getRealFinancialData()];
      case "activity":
        return adminDataService.getRealActivityLogs();
      case "analytics":
        return [adminDataService.getRealAnalyticsData()];
      default:
        return [];
    }
  }

  // Processar dados do relatório
  private processReportData(data: any[], config: ReportConfig): any[] {
    let filteredData = this.applyFilters(data, config.filters);

    if (config.groupBy !== "none") {
      filteredData = this.groupData(
        filteredData,
        config.groupBy,
        config.dateRange
      );
    }

    return filteredData;
  }

  // Aplicar filtros
  private applyFilters(data: any[], filters: ReportConfig["filters"]): any[] {
    return data.filter((item) => {
      if (filters.userStatus && filters.userStatus.length > 0) {
        if (!filters.userStatus.includes(item.status)) return false;
      }
      if (filters.userPlans && filters.userPlans.length > 0) {
        if (!filters.userPlans.includes(item.plan)) return false;
      }
      if (filters.minRevenue && item.revenue < filters.minRevenue) {
        return false;
      }
      if (filters.maxRevenue && item.revenue > filters.maxRevenue) {
        return false;
      }
      return true;
    });
  }

  // Agrupar dados
  private groupData(
    data: any[],
    groupBy: string,
    dateRange: { from: Date; to: Date }
  ): any[] {
    const groups: Record<string, any[]> = {};

    data.forEach((item) => {
      let key = "";
      if (groupBy === "day") {
        key = new Date(item.date || item.createdAt).toDateString();
      } else if (groupBy === "week") {
        const date = new Date(item.date || item.createdAt);
        const weekStart = new Date(date);
        weekStart.setDate(date.getDate() - date.getDay());
        key = weekStart.toDateString();
      } else if (groupBy === "month") {
        const date = new Date(item.date || item.createdAt);
        key = `${date.getFullYear()}-${date.getMonth() + 1}`;
      } else if (groupBy === "quarter") {
        const date = new Date(item.date || item.createdAt);
        const quarter = Math.floor(date.getMonth() / 3) + 1;
        key = `${date.getFullYear()}-Q${quarter}`;
      } else if (groupBy === "year") {
        const date = new Date(item.date || item.createdAt);
        key = date.getFullYear().toString();
      }

      if (!groups[key]) {
        groups[key] = [];
      }
      groups[key].push(item);
    });

    return Object.entries(groups).map(([key, items]) => ({
      period: key,
      count: items.length,
      items: items,
    }));
  }

  // Calcular métricas
  private calculateMetrics(data: any[]): Record<string, any> {
    const metrics: Record<string, any> = {};

    if (data.length === 0) return metrics;

    // Métricas básicas
    metrics.totalRecords = data.length;

    // Métricas específicas baseadas no tipo de dados
    if (data[0].revenue !== undefined) {
      metrics.totalRevenue = data.reduce(
        (sum, item) => sum + (item.revenue || 0),
        0
      );
      metrics.averageRevenue = metrics.totalRevenue / data.length;
    }

    if (data[0].credits !== undefined) {
      metrics.totalCredits = data.reduce(
        (sum, item) => sum + (item.credits || 0),
        0
      );
      metrics.averageCredits = metrics.totalCredits / data.length;
    }

    return metrics;
  }

  // Gerar resumo
  private generateSummary(
    data: any[],
    config: ReportConfig
  ): ReportData["summary"] {
    const metrics = this.calculateMetrics(data);

    return {
      totalRecords: data.length,
      dateGenerated: new Date(),
      timeRange: `${config.dateRange.from.toLocaleDateString()} - ${config.dateRange.to.toLocaleDateString()}`,
      keyMetrics: metrics,
    };
  }

  // Gerar gráficos
  private generateCharts(
    data: any[],
    config: ReportConfig
  ): ReportData["charts"] {
    if (config.format !== "chart") return [];

    const charts = [];

    // Gráfico de linha para tendências temporais
    if (config.groupBy !== "none") {
      charts.push({
        type: "line" as const,
        data: data.map((item) => ({
          period: item.period,
          value: item.count,
        })),
        config: {
          title: "Tendência Temporal",
          xAxis: "Período",
          yAxis: "Quantidade",
        },
      });
    }

    // Gráfico de pizza para distribuição
    if (data.length > 0 && data[0].type) {
      const distribution = data.reduce((acc, item) => {
        acc[item.type] = (acc[item.type] || 0) + 1;
        return acc;
      }, {} as Record<string, number>);

      charts.push({
        type: "pie" as const,
        data: Object.entries(distribution).map(([key, value]) => ({
          name: key,
          value,
        })),
        config: {
          title: "Distribuição por Tipo",
        },
      });
    }

    return charts;
  }

  // Comparar relatórios
  async compareReports(
    currentConfig: ReportConfig,
    previousPeriod: "previous" | "lastMonth" | "lastQuarter" | "lastYear"
  ): Promise<ComparisonReport> {
    // Gerar relatório atual
    const currentReport = await this.generateReport(currentConfig);

    // Gerar relatório anterior
    const previousConfig = { ...currentConfig };
    const now = new Date();
    const currentRange =
      currentConfig.dateRange.to.getTime() -
      currentConfig.dateRange.from.getTime();

    switch (previousPeriod) {
      case "previous":
        previousConfig.dateRange = {
          from: new Date(currentConfig.dateRange.from.getTime() - currentRange),
          to: currentConfig.dateRange.from,
        };
        break;
      case "lastMonth":
        previousConfig.dateRange = {
          from: new Date(now.getFullYear(), now.getMonth() - 1, 1),
          to: new Date(now.getFullYear(), now.getMonth(), 0),
        };
        break;
      case "lastQuarter":
        const quarter = Math.floor(now.getMonth() / 3);
        previousConfig.dateRange = {
          from: new Date(now.getFullYear(), (quarter - 1) * 3, 1),
          to: new Date(now.getFullYear(), quarter * 3, 0),
        };
        break;
      case "lastYear":
        previousConfig.dateRange = {
          from: new Date(now.getFullYear() - 1, 0, 1),
          to: new Date(now.getFullYear() - 1, 11, 31),
        };
        break;
    }

    const previousReport = await this.generateReport(previousConfig);

    // Calcular comparação
    const comparison = this.calculateComparison(
      currentReport.summary.keyMetrics,
      previousReport.summary.keyMetrics
    );

    return {
      current: currentReport,
      previous: previousReport,
      comparison,
    };
  }

  // Calcular comparação
  private calculateComparison(
    current: Record<string, any>,
    previous: Record<string, any>
  ) {
    const percentageChange: Record<string, number> = {};
    const absoluteChange: Record<string, number> = {};
    const trends: Record<string, "up" | "down" | "stable"> = {};

    Object.keys(current).forEach((key) => {
      const currentValue = current[key] || 0;
      const previousValue = previous[key] || 0;

      absoluteChange[key] = currentValue - previousValue;
      percentageChange[key] =
        previousValue > 0
          ? ((currentValue - previousValue) / previousValue) * 100
          : 0;

      if (Math.abs(percentageChange[key]) < 5) {
        trends[key] = "stable";
      } else if (percentageChange[key] > 0) {
        trends[key] = "up";
      } else {
        trends[key] = "down";
      }
    });

    return { percentageChange, absoluteChange, trends };
  }

  // Exportar relatório
  async exportReport(
    report: ReportData,
    format: "csv" | "excel" | "pdf" | "json"
  ): Promise<void> {
    switch (format) {
      case "csv":
        this.exportToCSV(report);
        break;
      case "excel":
        this.exportToExcel(report);
        break;
      case "pdf":
        this.exportToPDF(report);
        break;
      case "json":
        this.exportToJSON(report);
        break;
    }
  }

  // Exportar para CSV
  private exportToCSV(report: ReportData) {
    const csv = this.convertToCSV(report.data);
    const blob = new Blob([csv], { type: "text/csv" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.config.name}.csv`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Exportar para Excel
  private exportToExcel(report: ReportData) {
    // Implementação básica - em produção usar uma biblioteca como xlsx
    const html = this.convertToHTML(report);
    const blob = new Blob([html], { type: "application/vnd.ms-excel" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.config.name}.xls`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Exportar para PDF
  private exportToPDF(report: ReportData) {
    const html = this.convertToHTML(report);
    const blob = new Blob([html], { type: "application/pdf" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.config.name}.pdf`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Exportar para JSON
  private exportToJSON(report: ReportData) {
    const json = JSON.stringify(report, null, 2);
    const blob = new Blob([json], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `${report.config.name}.json`;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Converter para CSV
  private convertToCSV(data: any[]): string {
    if (data.length === 0) return "";

    const headers = Object.keys(data[0]);
    const csvRows = [headers.join(",")];

    data.forEach((row) => {
      const values = headers.map((header) => {
        const value = row[header];
        return typeof value === "string" ? `"${value}"` : value;
      });
      csvRows.push(values.join(","));
    });

    return csvRows.join("\n");
  }

  // Converter para HTML
  private convertToHTML(report: ReportData): string {
    return `
      <html>
        <head>
          <title>${report.config.name}</title>
          <style>
            body { font-family: Arial, sans-serif; margin: 20px; }
            table { border-collapse: collapse; width: 100%; }
            th, td { border: 1px solid #ddd; padding: 8px; text-align: left; }
            th { background-color: #f2f2f2; }
            .summary { margin-bottom: 20px; }
          </style>
        </head>
        <body>
          <h1>${report.config.name}</h1>
          <div class="summary">
            <p><strong>Descrição:</strong> ${report.config.description}</p>
            <p><strong>Período:</strong> ${report.summary.timeRange}</p>
            <p><strong>Total de Registros:</strong> ${
              report.summary.totalRecords
            }</p>
          </div>
          <table>
            <thead>
              <tr>
                ${Object.keys(report.data[0] || {})
                  .map((key) => `<th>${key}</th>`)
                  .join("")}
              </tr>
            </thead>
            <tbody>
              ${report.data
                .map(
                  (row) =>
                    `<tr>${Object.values(row)
                      .map((value) => `<td>${value}</td>`)
                      .join("")}</tr>`
                )
                .join("")}
            </tbody>
          </table>
        </body>
      </html>
    `;
  }

  // Obter templates
  getTemplates(): ReportConfig[] {
    return [...this.templates];
  }

  // Salvar template
  async saveTemplate(template: ReportConfig) {
    // Tentar salvar na API primeiro
    if (this.apiAvailable) {
      try {
        const apiData: CreateTemplateData = {
          name: template.name,
          description: template.description,
          type: template.type,
          config: template,
          isDefault: false,
          isPublic: false,
        };

        await reportsAPI.createTemplate(apiData);
        await this.syncWithAPI();
        return;
      } catch (error) {
        console.error("Erro ao salvar template na API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    this.templates.push(template);
    this.saveTemplates();
  }

  // Obter relatórios
  getReports(): ReportData[] {
    return [...this.reports];
  }

  // Remover relatório
  async removeReport(id: string) {
    // Tentar remover da API primeiro
    if (this.apiAvailable) {
      try {
        await reportsAPI.deleteReport(id);
        await this.syncWithAPI();
        return;
      } catch (error) {
        console.error("Erro ao remover relatório da API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    this.reports = this.reports.filter((r) => r.id !== id);
    this.saveReports();
  }

  // Limpar relatórios antigos
  cleanupOldReports(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    this.reports = this.reports.filter((report) => {
      const reportDate = new Date(report.summary.dateGenerated);
      return reportDate > cutoffDate;
    });

    this.saveReports();
  }
}

// Instância singleton
export const advancedReportsService = new AdvancedReportsService();
