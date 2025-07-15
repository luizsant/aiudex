import { useState, useEffect, useCallback } from "react";
import {
  advancedReportsService,
  ReportConfig,
  ReportData,
  ComparisonReport,
} from "@/lib/advanced-reports";

export const useAdvancedReports = () => {
  const [reports, setReports] = useState<ReportData[]>([]);
  const [templates, setTemplates] = useState<ReportConfig[]>([]);
  const [isGenerating, setIsGenerating] = useState(false);
  const [isComparing, setIsComparing] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadReports();
    loadTemplates();
  }, []);

  // Carregar relatórios
  const loadReports = useCallback(() => {
    setReports(advancedReportsService.getReports());
  }, []);

  // Carregar templates
  const loadTemplates = useCallback(() => {
    setTemplates(advancedReportsService.getTemplates());
  }, []);

  // Gerar relatório
  const generateReport = useCallback(
    async (config: ReportConfig): Promise<ReportData | null> => {
      setIsGenerating(true);
      try {
        const report = await advancedReportsService.generateReport(config);
        loadReports();
        return report;
      } catch (error) {
        console.error("Erro ao gerar relatório:", error);
        return null;
      } finally {
        setIsGenerating(false);
      }
    },
    [loadReports]
  );

  // Comparar relatórios
  const compareReports = useCallback(
    async (
      config: ReportConfig,
      period: "previous" | "lastMonth" | "lastQuarter" | "lastYear"
    ): Promise<ComparisonReport | null> => {
      setIsComparing(true);
      try {
        const comparison = await advancedReportsService.compareReports(
          config,
          period
        );
        return comparison;
      } catch (error) {
        console.error("Erro ao comparar relatórios:", error);
        return null;
      } finally {
        setIsComparing(false);
      }
    },
    []
  );

  // Exportar relatório
  const exportReport = useCallback(
    async (
      report: ReportData,
      format: "csv" | "excel" | "pdf" | "json"
    ): Promise<boolean> => {
      try {
        await advancedReportsService.exportReport(report, format);
        return true;
      } catch (error) {
        console.error("Erro ao exportar relatório:", error);
        return false;
      }
    },
    []
  );

  // Salvar template
  const saveTemplate = useCallback(
    (template: ReportConfig) => {
      advancedReportsService.saveTemplate(template);
      loadTemplates();
    },
    [loadTemplates]
  );

  // Remover relatório
  const removeReport = useCallback(
    (id: string) => {
      advancedReportsService.removeReport(id);
      loadReports();
    },
    [loadReports]
  );

  // Limpar relatórios antigos
  const cleanupOldReports = useCallback(
    (daysOld: number = 30) => {
      advancedReportsService.cleanupOldReports(daysOld);
      loadReports();
    },
    [loadReports]
  );

  // Obter estatísticas dos relatórios
  const getReportStats = useCallback(() => {
    const totalReports = reports.length;
    const reportsByType = reports.reduce((acc, report) => {
      acc[report.config.type] = (acc[report.config.type] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const recentReports = reports.filter((report) => {
      const daysDiff =
        (Date.now() - report.summary.dateGenerated.getTime()) /
        (1000 * 60 * 60 * 24);
      return daysDiff <= 7;
    }).length;

    const totalRecords = reports.reduce(
      (sum, report) => sum + report.summary.totalRecords,
      0
    );

    return {
      totalReports,
      reportsByType,
      recentReports,
      totalRecords,
      templates: templates.length,
    };
  }, [reports, templates]);

  // Obter relatórios por período
  const getReportsByPeriod = useCallback(
    (days: number) => {
      const cutoffDate = new Date(Date.now() - days * 24 * 60 * 60 * 1000);
      return reports.filter(
        (report) => report.summary.dateGenerated >= cutoffDate
      );
    },
    [reports]
  );

  // Buscar relatórios
  const searchReports = useCallback(
    (query: string) => {
      const lowercaseQuery = query.toLowerCase();
      return reports.filter(
        (report) =>
          report.config.name.toLowerCase().includes(lowercaseQuery) ||
          report.config.description.toLowerCase().includes(lowercaseQuery) ||
          report.config.type.toLowerCase().includes(lowercaseQuery)
      );
    },
    [reports]
  );

  // Filtrar relatórios por tipo
  const getReportsByType = useCallback(
    (type: string) => {
      if (type === "all") return reports;
      return reports.filter((report) => report.config.type === type);
    },
    [reports]
  );

  // Obter template por ID
  const getTemplate = useCallback(
    (id: string) => {
      return templates.find((template) => template.id === id);
    },
    [templates]
  );

  // Duplicar relatório
  const duplicateReport = useCallback(
    async (reportId: string): Promise<ReportData | null> => {
      const report = reports.find((r) => r.id === reportId);
      if (!report) return null;

      const newConfig: ReportConfig = {
        ...report.config,
        id: `duplicate_${Date.now()}`,
        name: `${report.config.name} (Cópia)`,
      };

      return generateReport(newConfig);
    },
    [reports, generateReport]
  );

  // Agendar relatório (simulado)
  const scheduleReport = useCallback(
    (
      config: ReportConfig,
      schedule: {
        frequency: "daily" | "weekly" | "monthly";
        recipients: string[];
      }
    ) => {
      // Em uma implementação real, isso seria enviado para o backend
      console.log("Relatório agendado:", { config, schedule });

      // Simular agendamento salvando no localStorage
      const scheduledReports = JSON.parse(
        localStorage.getItem("scheduled_reports") || "[]"
      );
      scheduledReports.push({
        config,
        schedule,
        createdAt: new Date().toISOString(),
      });
      localStorage.setItem(
        "scheduled_reports",
        JSON.stringify(scheduledReports)
      );

      return true;
    },
    []
  );

  // Obter relatórios agendados
  const getScheduledReports = useCallback(() => {
    return JSON.parse(localStorage.getItem("scheduled_reports") || "[]");
  }, []);

  return {
    // Estado
    reports,
    templates,
    isGenerating,
    isComparing,

    // Ações principais
    generateReport,
    compareReports,
    exportReport,

    // Gerenciamento de templates
    saveTemplate,
    getTemplate,

    // Gerenciamento de relatórios
    removeReport,
    duplicateReport,
    cleanupOldReports,

    // Busca e filtros
    searchReports,
    getReportsByType,
    getReportsByPeriod,

    // Estatísticas
    getReportStats,

    // Agendamento
    scheduleReport,
    getScheduledReports,

    // Atualização
    loadReports,
    loadTemplates,
  };
};
