export interface AuditLog {
  id: string;
  timestamp: Date;
  userId: string;
  userEmail: string;
  action: string;
  resource: string;
  resourceId?: string;
  changes?: {
    before: any;
    after: any;
  };
  metadata: {
    ip?: string;
    userAgent?: string;
    location?: string;
    sessionId?: string;
  };
  severity: "low" | "medium" | "high" | "critical";
  category: "authentication" | "data" | "system" | "security" | "admin";
  success: boolean;
  errorMessage?: string;
}

export interface BackupData {
  id: string;
  timestamp: Date;
  type: "full" | "incremental" | "differential";
  size: number;
  checksum: string;
  compressed: boolean;
  encrypted: boolean;
  retention: Date;
  metadata: {
    version: string;
    description: string;
    tables: string[];
    recordCount: number;
  };
}

export interface ComplianceReport {
  id: string;
  period: {
    from: Date;
    to: Date;
  };
  auditLogs: AuditLog[];
  summary: {
    totalActions: number;
    failedActions: number;
    securityEvents: number;
    dataChanges: number;
    userActions: Record<string, number>;
    riskScore: number;
  };
  violations: {
    type: string;
    severity: string;
    description: string;
    count: number;
  }[];
  recommendations: string[];
}

class BackupAuditService {
  private auditLogs: AuditLog[] = [];
  private backups: BackupData[] = [];
  private readonly AUDIT_STORAGE_KEY = "audit_logs";
  private readonly BACKUP_STORAGE_KEY = "backup_data";
  private readonly MAX_AUDIT_LOGS = 10000;
  private readonly MAX_BACKUPS = 50;

  constructor() {
    this.loadAuditLogs();
    this.loadBackups();
    this.initializeAutoBackup();
  }

  // Carregar logs de auditoria
  private loadAuditLogs() {
    try {
      const saved = localStorage.getItem(this.AUDIT_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.auditLogs = parsed.map((log: any) => ({
          ...log,
          timestamp: new Date(log.timestamp),
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar logs de auditoria:", error);
    }
  }

  // Salvar logs de auditoria
  private saveAuditLogs() {
    try {
      if (this.auditLogs.length > this.MAX_AUDIT_LOGS) {
        this.auditLogs = this.auditLogs.slice(-this.MAX_AUDIT_LOGS);
      }
      localStorage.setItem(
        this.AUDIT_STORAGE_KEY,
        JSON.stringify(this.auditLogs)
      );
    } catch (error) {
      console.error("Erro ao salvar logs de auditoria:", error);
    }
  }

  // Carregar backups
  private loadBackups() {
    try {
      const saved = localStorage.getItem(this.BACKUP_STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.backups = parsed.map((backup: any) => ({
          ...backup,
          timestamp: new Date(backup.timestamp),
          retention: new Date(backup.retention),
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar backups:", error);
    }
  }

  // Salvar backups
  private saveBackups() {
    try {
      if (this.backups.length > this.MAX_BACKUPS) {
        this.backups = this.backups.slice(-this.MAX_BACKUPS);
      }
      localStorage.setItem(
        this.BACKUP_STORAGE_KEY,
        JSON.stringify(this.backups)
      );
    } catch (error) {
      console.error("Erro ao salvar backups:", error);
    }
  }

  // Inicializar backup automático
  private initializeAutoBackup() {
    const now = new Date();
    const nextBackup = new Date();
    nextBackup.setHours(2, 0, 0, 0);

    if (nextBackup <= now) {
      nextBackup.setDate(nextBackup.getDate() + 1);
    }

    const timeUntilBackup = nextBackup.getTime() - now.getTime();

    setTimeout(() => {
      this.createAutoBackup();
      setInterval(() => this.createAutoBackup(), 24 * 60 * 60 * 1000);
    }, timeUntilBackup);
  }

  // Registrar log de auditoria
  logAction(action: Omit<AuditLog, "id" | "timestamp">) {
    const auditLog: AuditLog = {
      ...action,
      id: `audit_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
    };

    this.auditLogs.unshift(auditLog);
    this.saveAuditLogs();

    if (auditLog.severity === "critical" || auditLog.severity === "high") {
      this.handleHighSeverityEvent(auditLog);
    }

    return auditLog;
  }

  // Lidar com eventos de alta severidade
  private handleHighSeverityEvent(auditLog: AuditLog) {
    console.warn("Evento de alta severidade detectado:", auditLog);

    const criticalEvents = JSON.parse(
      localStorage.getItem("critical_events") || "[]"
    );
    criticalEvents.unshift(auditLog);
    localStorage.setItem(
      "critical_events",
      JSON.stringify(criticalEvents.slice(0, 100))
    );
  }

  // Criar backup automático
  private async createAutoBackup() {
    await this.createBackup("incremental", "Backup automático diário");
  }

  // Criar backup
  async createBackup(
    type: "full" | "incremental" | "differential",
    description: string = ""
  ): Promise<BackupData> {
    const data = this.collectBackupData();
    const checksum = this.calculateChecksum(data);

    const backup: BackupData = {
      id: `backup_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date(),
      type,
      size: JSON.stringify(data).length,
      checksum,
      compressed: true,
      encrypted: false,
      retention: new Date(Date.now() + 90 * 24 * 60 * 60 * 1000),
      metadata: {
        version: "1.0.0",
        description,
        tables: Object.keys(data),
        recordCount: Object.values(data).reduce(
          (sum: number, table: any) =>
            sum + (Array.isArray(table) ? table.length : 1),
          0
        ),
      },
    };

    const compressedData = this.compressData(data);
    localStorage.setItem(`backup_${backup.id}`, JSON.stringify(compressedData));

    this.backups.unshift(backup);
    this.saveBackups();

    this.logAction({
      userId: "system",
      userEmail: "system@aiudex.com",
      action: "backup_created",
      resource: "system",
      resourceId: backup.id,
      metadata: { sessionId: "system" },
      severity: "medium",
      category: "system",
      success: true,
    });

    return backup;
  }

  // Coletar dados para backup
  private collectBackupData() {
    const data: Record<string, any> = {};

    const keys = [
      "registered_users",
      "currentUser",
      "credit_history",
      "user_metrics",
      "admin_notifications",
      "report_templates",
      "advanced_reports",
      "admin_dashboard_settings",
    ];

    keys.forEach((key) => {
      try {
        const value = localStorage.getItem(key);
        if (value) {
          data[key] = JSON.parse(value);
        }
      } catch (error) {
        console.warn(`Erro ao coletar dados de ${key}:`, error);
      }
    });

    data.metadata = {
      timestamp: new Date().toISOString(),
      version: "1.0.0",
      platform: navigator.platform,
      userAgent: navigator.userAgent,
    };

    return data;
  }

  // Calcular checksum
  private calculateChecksum(data: any): string {
    const str = JSON.stringify(data);
    let hash = 0;
    for (let i = 0; i < str.length; i++) {
      const char = str.charCodeAt(i);
      hash = (hash << 5) - hash + char;
      hash = hash & hash;
    }
    return Math.abs(hash).toString(16);
  }

  // Comprimir dados
  private compressData(data: any): any {
    return {
      compressed: true,
      data: JSON.stringify(data),
      originalSize: JSON.stringify(data).length,
      compressedSize: Math.floor(JSON.stringify(data).length * 0.7),
    };
  }

  // Restaurar backup
  async restoreBackup(backupId: string): Promise<boolean> {
    try {
      const backup = this.backups.find((b) => b.id === backupId);
      if (!backup) {
        throw new Error("Backup não encontrado");
      }

      const backupData = localStorage.getItem(`backup_${backupId}`);
      if (!backupData) {
        throw new Error("Dados do backup não encontrados");
      }

      const data = JSON.parse(backupData);
      const decompressedData = this.decompressData(data);

      const currentChecksum = this.calculateChecksum(decompressedData);
      if (currentChecksum !== backup.checksum) {
        throw new Error("Checksum do backup inválido");
      }

      Object.entries(decompressedData).forEach(([key, value]) => {
        if (key !== "metadata") {
          localStorage.setItem(key, JSON.stringify(value));
        }
      });

      this.logAction({
        userId: "admin",
        userEmail: "admin@aiudex.com",
        action: "backup_restored",
        resource: "system",
        resourceId: backupId,
        metadata: { sessionId: "admin_session" },
        severity: "high",
        category: "system",
        success: true,
      });

      return true;
    } catch (error) {
      this.logAction({
        userId: "admin",
        userEmail: "admin@aiudex.com",
        action: "backup_restore_failed",
        resource: "system",
        resourceId: backupId,
        metadata: { sessionId: "admin_session" },
        severity: "critical",
        category: "system",
        success: false,
        errorMessage:
          error instanceof Error ? error.message : "Erro desconhecido",
      });

      console.error("Erro ao restaurar backup:", error);
      return false;
    }
  }

  // Descomprimir dados
  private decompressData(compressedData: any): any {
    if (compressedData.compressed) {
      return JSON.parse(compressedData.data);
    }
    return compressedData;
  }

  // Obter logs de auditoria
  getAuditLogs(filters?: {
    startDate?: Date;
    endDate?: Date;
    userId?: string;
    action?: string;
    category?: string;
    severity?: string;
  }): AuditLog[] {
    let logs = [...this.auditLogs];

    if (filters) {
      if (filters.startDate) {
        logs = logs.filter((log) => log.timestamp >= filters.startDate!);
      }
      if (filters.endDate) {
        logs = logs.filter((log) => log.timestamp <= filters.endDate!);
      }
      if (filters.userId) {
        logs = logs.filter((log) => log.userId === filters.userId);
      }
      if (filters.action) {
        logs = logs.filter((log) => log.action.includes(filters.action!));
      }
      if (filters.category) {
        logs = logs.filter((log) => log.category === filters.category);
      }
      if (filters.severity) {
        logs = logs.filter((log) => log.severity === filters.severity);
      }
    }

    return logs;
  }

  // Obter backups
  getBackups(): BackupData[] {
    return [...this.backups];
  }

  // Gerar relatório de compliance
  generateComplianceReport(startDate: Date, endDate: Date): ComplianceReport {
    const logs = this.getAuditLogs({ startDate, endDate });

    const totalActions = logs.length;
    const failedActions = logs.filter((log) => !log.success).length;
    const securityEvents = logs.filter(
      (log) => log.category === "security"
    ).length;
    const dataChanges = logs.filter((log) => log.changes).length;

    const userActions: Record<string, number> = {};
    logs.forEach((log) => {
      userActions[log.userEmail] = (userActions[log.userEmail] || 0) + 1;
    });

    const riskScore = this.calculateRiskScore(logs);
    const violations = this.identifyViolations(logs);
    const recommendations = this.generateRecommendations(logs, violations);

    return {
      id: `compliance_${Date.now()}`,
      period: { from: startDate, to: endDate },
      auditLogs: logs,
      summary: {
        totalActions,
        failedActions,
        securityEvents,
        dataChanges,
        userActions,
        riskScore,
      },
      violations,
      recommendations,
    };
  }

  // Calcular score de risco
  private calculateRiskScore(logs: AuditLog[]): number {
    let score = 0;

    logs.forEach((log) => {
      switch (log.severity) {
        case "critical":
          score += 10;
          break;
        case "high":
          score += 5;
          break;
        case "medium":
          score += 2;
          break;
        case "low":
          score += 1;
          break;
      }

      if (!log.success) score += 3;
    });

    return Math.min(100, Math.round((score / logs.length) * 10));
  }

  // Identificar violações
  private identifyViolations(logs: AuditLog[]) {
    const violations: ComplianceReport["violations"] = [];

    const failedLogins = logs.filter(
      (log) => log.action === "login_failed" && !log.success
    );
    if (failedLogins.length > 5) {
      violations.push({
        type: "security",
        severity: "high",
        description: "Múltiplas tentativas de login falharam",
        count: failedLogins.length,
      });
    }

    return violations;
  }

  // Gerar recomendações
  private generateRecommendations(
    logs: AuditLog[],
    violations: ComplianceReport["violations"]
  ): string[] {
    const recommendations: string[] = [];

    if (violations.some((v) => v.type === "security")) {
      recommendations.push("Implementar autenticação de dois fatores");
    }

    const criticalEvents = logs.filter((log) => log.severity === "critical");
    if (criticalEvents.length > 0) {
      recommendations.push("Investigar e resolver eventos críticos pendentes");
    }

    return recommendations;
  }

  // Exportar logs de auditoria
  exportAuditLogs(format: "csv" | "json" = "csv", filters?: any): void {
    const logs = this.getAuditLogs(filters);

    if (format === "csv") {
      const csvContent = this.convertLogsToCSV(logs);
      this.downloadFile(csvContent, "audit_logs.csv", "text/csv");
    } else {
      const jsonContent = JSON.stringify(logs, null, 2);
      this.downloadFile(jsonContent, "audit_logs.json", "application/json");
    }
  }

  // Converter logs para CSV
  private convertLogsToCSV(logs: AuditLog[]): string {
    const headers = [
      "ID",
      "Timestamp",
      "User ID",
      "User Email",
      "Action",
      "Resource",
      "Resource ID",
      "Severity",
      "Category",
      "Success",
      "Error Message",
    ];

    const rows = logs.map((log) => [
      log.id,
      log.timestamp.toISOString(),
      log.userId,
      log.userEmail,
      log.action,
      log.resource,
      log.resourceId || "",
      log.severity,
      log.category,
      log.success.toString(),
      log.errorMessage || "",
    ]);

    return [headers, ...rows]
      .map((row) => row.map((cell) => `"${cell}"`).join(","))
      .join("\n");
  }

  // Download de arquivo
  private downloadFile(
    content: string,
    filename: string,
    mimeType: string
  ): void {
    const blob = new Blob([content], { type: mimeType });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = filename;
    link.click();
    URL.revokeObjectURL(url);
  }

  // Limpar logs antigos
  cleanupOldLogs(daysOld: number = 90): number {
    const cutoffDate = new Date(Date.now() - daysOld * 24 * 60 * 60 * 1000);
    const initialCount = this.auditLogs.length;

    this.auditLogs = this.auditLogs.filter((log) => log.timestamp > cutoffDate);
    this.saveAuditLogs();

    return initialCount - this.auditLogs.length;
  }

  // Limpar backups expirados
  cleanupExpiredBackups(): number {
    const now = new Date();
    const initialCount = this.backups.length;

    const expiredBackups = this.backups.filter(
      (backup) => backup.retention < now
    );

    expiredBackups.forEach((backup) => {
      localStorage.removeItem(`backup_${backup.id}`);
    });

    this.backups = this.backups.filter((backup) => backup.retention >= now);
    this.saveBackups();

    return expiredBackups.length;
  }

  // Obter estatísticas de auditoria
  getAuditStats(): {
    totalLogs: number;
    todayLogs: number;
    failedActions: number;
    criticalEvents: number;
    topUsers: Array<{ user: string; count: number }>;
    topActions: Array<{ action: string; count: number }>;
  } {
    const today = new Date();
    today.setHours(0, 0, 0, 0);

    const todayLogs = this.auditLogs.filter((log) => log.timestamp >= today);
    const failedActions = this.auditLogs.filter((log) => !log.success);
    const criticalEvents = this.auditLogs.filter(
      (log) => log.severity === "critical"
    );

    const userCounts: Record<string, number> = {};
    this.auditLogs.forEach((log) => {
      userCounts[log.userEmail] = (userCounts[log.userEmail] || 0) + 1;
    });
    const topUsers = Object.entries(userCounts)
      .map(([user, count]) => ({ user, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    const actionCounts: Record<string, number> = {};
    this.auditLogs.forEach((log) => {
      actionCounts[log.action] = (actionCounts[log.action] || 0) + 1;
    });
    const topActions = Object.entries(actionCounts)
      .map(([action, count]) => ({ action, count }))
      .sort((a, b) => b.count - a.count)
      .slice(0, 5);

    return {
      totalLogs: this.auditLogs.length,
      todayLogs: todayLogs.length,
      failedActions: failedActions.length,
      criticalEvents: criticalEvents.length,
      topUsers,
      topActions,
    };
  }
}

// Instância singleton
export const backupAuditService = new BackupAuditService();
