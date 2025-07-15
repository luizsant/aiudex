import { useState, useEffect, useCallback } from "react";
import {
  backupAuditService,
  AuditLog,
  BackupData,
  ComplianceReport,
} from "@/lib/backup-audit";

export const useBackupAudit = () => {
  const [auditLogs, setAuditLogs] = useState<AuditLog[]>([]);
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);

  // Carregar dados iniciais
  useEffect(() => {
    loadAuditLogs();
    loadBackups();
  }, []);

  // Carregar logs de auditoria
  const loadAuditLogs = useCallback(() => {
    setAuditLogs(backupAuditService.getAuditLogs());
  }, []);

  // Carregar backups
  const loadBackups = useCallback(() => {
    setBackups(backupAuditService.getBackups());
  }, []);

  // Registrar ação de auditoria
  const logAction = useCallback(
    (action: Omit<AuditLog, "id" | "timestamp">) => {
      const log = backupAuditService.logAction(action);
      loadAuditLogs();
      return log;
    },
    [loadAuditLogs]
  );

  // Criar backup
  const createBackup = useCallback(
    async (
      type: "full" | "incremental" | "differential",
      description: string = ""
    ): Promise<BackupData | null> => {
      setIsCreatingBackup(true);
      try {
        const backup = await backupAuditService.createBackup(type, description);
        loadBackups();
        return backup;
      } catch (error) {
        console.error("Erro ao criar backup:", error);
        return null;
      } finally {
        setIsCreatingBackup(false);
      }
    },
    [loadBackups]
  );

  // Restaurar backup
  const restoreBackup = useCallback(
    async (backupId: string): Promise<boolean> => {
      setIsRestoringBackup(true);
      try {
        const success = await backupAuditService.restoreBackup(backupId);
        if (success) {
          loadAuditLogs();
          loadBackups();
        }
        return success;
      } catch (error) {
        console.error("Erro ao restaurar backup:", error);
        return false;
      } finally {
        setIsRestoringBackup(false);
      }
    },
    [loadAuditLogs, loadBackups]
  );

  // Obter logs filtrados
  const getFilteredLogs = useCallback(
    (filters?: {
      startDate?: Date;
      endDate?: Date;
      userId?: string;
      action?: string;
      category?: string;
      severity?: string;
    }) => {
      return backupAuditService.getAuditLogs(filters);
    },
    []
  );

  // Gerar relatório de compliance
  const generateComplianceReport = useCallback(
    (startDate: Date, endDate: Date): ComplianceReport => {
      return backupAuditService.generateComplianceReport(startDate, endDate);
    },
    []
  );

  // Exportar logs
  const exportAuditLogs = useCallback(
    (format: "csv" | "json" = "csv", filters?: any) => {
      backupAuditService.exportAuditLogs(format, filters);
    },
    []
  );

  // Limpar logs antigos
  const cleanupOldLogs = useCallback(
    (daysOld: number = 90): number => {
      const cleaned = backupAuditService.cleanupOldLogs(daysOld);
      loadAuditLogs();
      return cleaned;
    },
    [loadAuditLogs]
  );

  // Limpar backups expirados
  const cleanupExpiredBackups = useCallback((): number => {
    const cleaned = backupAuditService.cleanupExpiredBackups();
    loadBackups();
    return cleaned;
  }, [loadBackups]);

  // Obter estatísticas de auditoria
  const getAuditStats = useCallback(() => {
    return backupAuditService.getAuditStats();
  }, []);

  // Obter estatísticas de backup
  const getBackupStats = useCallback(() => {
    const total = backups.length;
    const expired = backups.filter(
      (backup) => backup.retention < new Date()
    ).length;
    const thisWeek = backups.filter((backup) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return backup.timestamp >= weekAgo;
    }).length;
    const totalSize = backups.reduce((sum, backup) => sum + backup.size, 0);

    return { total, expired, thisWeek, totalSize };
  }, [backups]);

  // Verificar integridade do sistema
  const checkSystemIntegrity = useCallback(() => {
    const recentLogs = auditLogs.filter((log) => {
      const hourAgo = new Date(Date.now() - 60 * 60 * 1000);
      return log.timestamp >= hourAgo;
    });

    const criticalEvents = recentLogs.filter(
      (log) => log.severity === "critical"
    );
    const failedActions = recentLogs.filter((log) => !log.success);
    const securityEvents = recentLogs.filter(
      (log) => log.category === "security"
    );

    const riskScore =
      criticalEvents.length * 10 +
      failedActions.length * 5 +
      securityEvents.length * 3;
    const healthStatus =
      riskScore < 10 ? "healthy" : riskScore < 25 ? "warning" : "critical";

    return {
      healthStatus,
      riskScore,
      criticalEvents: criticalEvents.length,
      failedActions: failedActions.length,
      securityEvents: securityEvents.length,
      recommendations: generateHealthRecommendations(
        healthStatus,
        criticalEvents,
        failedActions
      ),
    };
  }, [auditLogs]);

  // Gerar recomendações de saúde
  const generateHealthRecommendations = (
    status: string,
    criticalEvents: AuditLog[],
    failedActions: AuditLog[]
  ): string[] => {
    const recommendations: string[] = [];

    if (status === "critical") {
      recommendations.push("Sistema em estado crítico - revisar imediatamente");
      recommendations.push("Verificar logs de eventos críticos");
    }

    if (criticalEvents.length > 0) {
      recommendations.push("Investigar eventos críticos recentes");
      recommendations.push("Considerar criar backup de emergência");
    }

    if (failedActions.length > 5) {
      recommendations.push("Alto número de ações falhadas - verificar sistema");
      recommendations.push("Revisar permissões e configurações");
    }

    if (status === "healthy") {
      recommendations.push("Sistema funcionando normalmente");
      recommendations.push("Manter monitoramento regular");
    }

    return recommendations;
  };

  // Simular ações para demonstração
  const simulateAuditActions = useCallback(() => {
    const actions = [
      {
        userId: "user_123",
        userEmail: "admin@aiudex.com",
        action: "user_login",
        resource: "authentication",
        severity: "low" as const,
        category: "authentication" as const,
        success: true,
        metadata: { ip: "192.168.1.100", sessionId: "session_123" },
      },
      {
        userId: "user_456",
        userEmail: "user@aiudex.com",
        action: "document_generated",
        resource: "documents",
        resourceId: "doc_789",
        severity: "medium" as const,
        category: "data" as const,
        success: true,
        metadata: { documentType: "contract", size: 1024 },
      },
      {
        userId: "system",
        userEmail: "system@aiudex.com",
        action: "backup_created",
        resource: "system",
        severity: "medium" as const,
        category: "system" as const,
        success: true,
        metadata: { backupType: "incremental", size: 2048 },
      },
    ];

    actions.forEach((action) => {
      setTimeout(() => {
        logAction(action);
      }, Math.random() * 2000);
    });
  }, [logAction]);

  return {
    // Estado
    auditLogs,
    backups,
    isCreatingBackup,
    isRestoringBackup,

    // Ações de auditoria
    logAction,
    getFilteredLogs,
    exportAuditLogs,
    cleanupOldLogs,
    getAuditStats,

    // Ações de backup
    createBackup,
    restoreBackup,
    cleanupExpiredBackups,
    getBackupStats,

    // Relatórios e compliance
    generateComplianceReport,

    // Monitoramento
    checkSystemIntegrity,

    // Utilitários
    loadAuditLogs,
    loadBackups,
    simulateAuditActions,
  };
};
