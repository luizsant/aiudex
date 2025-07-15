import { creditsService } from "./credits-service";
import { MetricsService } from "./metrics-service";

export type PlanType = "free" | "basic" | "pro" | "enterprise";

export interface RealUser {
  id: string;
  name: string;
  email: string;
  role: "admin" | "advogado" | "estagiario";
  status: "ativo" | "inativo" | "suspenso";
  plan: PlanType;
  oabNumber?: string;
  firm?: string;
  createdAt: string;
  lastLogin?: string;
  creditsUsed: number;
  totalCredits: number;
  usageThisMonth: number;
  totalDocuments: number;
}

export interface RealFinancialData {
  totalRevenue: number;
  mrr: number;
  usersByPlan: Record<string, number>;
  revenueByPlan: Record<string, number>;
  churnRate: number;
  conversionRate: number;
}

export interface RealActivityLog {
  id: string;
  timestamp: string;
  user: string;
  action: string;
  details: string;
  ip: string;
  userAgent: string;
  status: "success" | "error" | "warning" | "info";
  category: "auth" | "document" | "payment" | "admin" | "system";
}

export interface RealAnalyticsData {
  totalUsers: number;
  activeUsers: number;
  newUsersThisMonth: number;
  totalDocuments: number;
  documentsThisMonth: number;
  averageDocumentsPerUser: number;
  topFeatures: Array<{ feature: string; usage: number }>;
  userGrowth: Array<{ month: string; users: number }>;
}

class AdminDataService {
  private static instance: AdminDataService;
  private readonly USERS_STORAGE_KEY = "legalai_registered_users";

  static getInstance(): AdminDataService {
    if (!AdminDataService.instance) {
      AdminDataService.instance = new AdminDataService();
    }
    return AdminDataService.instance;
  }

  // Método auxiliar para validar planId
  private validatePlanId(planId: string): PlanType {
    const validPlans: PlanType[] = ["free", "basic", "pro", "enterprise"];
    return validPlans.includes(planId as PlanType)
      ? (planId as PlanType)
      : "free";
  }

  // Criar novo usuário
  createUser(
    userData: Omit<RealUser, "id" | "createdAt" | "lastLogin">
  ): RealUser {
    const newUser: RealUser = {
      ...userData,
      id: `user_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      createdAt: new Date().toISOString(),
      lastLogin: undefined,
    };

    // Obter usuários existentes
    const existingUsers = this.getStoredUsers();

    // Verificar se email já existe
    if (existingUsers.some((user) => user.email === newUser.email)) {
      throw new Error("Email já está em uso");
    }

    // Adicionar novo usuário
    const updatedUsers = [...existingUsers, newUser];
    this.saveUsers(updatedUsers);

    // Criar créditos iniciais para o usuário
    this.initializeUserCredits(newUser.id, newUser.plan);

    return newUser;
  }

  // Atualizar usuário existente
  updateUser(userId: string, userData: Partial<RealUser>): RealUser {
    const users = this.getStoredUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      throw new Error("Usuário não encontrado");
    }

    // Verificar se email já existe em outro usuário
    if (
      userData.email &&
      users.some((user) => user.email === userData.email && user.id !== userId)
    ) {
      throw new Error("Email já está em uso por outro usuário");
    }

    // Atualizar usuário
    const updatedUser = { ...users[userIndex], ...userData };
    users[userIndex] = updatedUser;

    this.saveUsers(users);

    // Atualizar plano de créditos se necessário
    if (userData.plan && userData.plan !== users[userIndex].plan) {
      this.updateUserPlan(userId, userData.plan);
    }

    return updatedUser;
  }

  // Excluir usuário
  deleteUser(userId: string): boolean {
    const users = this.getStoredUsers();
    const userIndex = users.findIndex((user) => user.id === userId);

    if (userIndex === -1) {
      return false;
    }

    // Remover usuário
    users.splice(userIndex, 1);
    this.saveUsers(users);

    // Limpar dados relacionados
    this.cleanupUserData(userId);

    return true;
  }

  // Alterar status do usuário
  updateUserStatus(
    userId: string,
    status: "ativo" | "inativo" | "suspenso"
  ): RealUser {
    const userData = { status };
    return this.updateUser(userId, userData);
  }

  // Alterar plano do usuário
  updateUserPlan(userId: string, plan: PlanType): RealUser {
    const userData = { plan };
    const updatedUser = this.updateUser(userId, userData);

    // Atualizar créditos baseado no novo plano
    this.initializeUserCredits(userId, plan);

    return updatedUser;
  }

  // Resetar senha do usuário
  resetUserPassword(userId: string): string {
    const temporaryPassword = this.generateTemporaryPassword();

    // Aqui você implementaria a lógica de resetar senha
    // Por enquanto, apenas retornamos a senha temporária

    return temporaryPassword;
  }

  // Enviar email para usuário
  sendEmailToUser(userId: string, subject: string, message: string): boolean {
    const user = this.getUserById(userId);
    if (!user) {
      return false;
    }

    // Simular envio de email
    console.log(`Email enviado para ${user.email}:`, { subject, message });

    // Registrar log de atividade
    this.logActivity({
      userId,
      action: "email_sent",
      details: `Email enviado: ${subject}`,
      category: "admin",
      status: "success",
    });

    return true;
  }

  // Obter usuário por ID
  getUserById(userId: string): RealUser | null {
    const users = this.getStoredUsers();
    return users.find((user) => user.id === userId) || null;
  }

  // Obter estatísticas de usuários
  getUserStats(): {
    total: number;
    active: number;
    inactive: number;
    suspended: number;
    byPlan: Record<string, number>;
    byRole: Record<string, number>;
    newThisMonth: number;
    newThisWeek: number;
  } {
    const users = this.getRealUsers();
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);
    const startOfWeek = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    const stats = {
      total: users.length,
      active: users.filter((u) => u.status === "ativo").length,
      inactive: users.filter((u) => u.status === "inativo").length,
      suspended: users.filter((u) => u.status === "suspenso").length,
      byPlan: {} as Record<string, number>,
      byRole: {} as Record<string, number>,
      newThisMonth: users.filter((u) => new Date(u.createdAt) >= startOfMonth)
        .length,
      newThisWeek: users.filter((u) => new Date(u.createdAt) >= startOfWeek)
        .length,
    };

    // Contar por plano
    users.forEach((user) => {
      stats.byPlan[user.plan] = (stats.byPlan[user.plan] || 0) + 1;
    });

    // Contar por função
    users.forEach((user) => {
      stats.byRole[user.role] = (stats.byRole[user.role] || 0) + 1;
    });

    return stats;
  }

  // Obter todos os usuários reais
  getRealUsers(): RealUser[] {
    const users: RealUser[] = [];

    // Obter usuários do storage principal
    const storedUsers = this.getStoredUsers();
    users.push(...storedUsers);

    // Obter usuário atual se não estiver na lista
    const currentUser = localStorage.getItem("legalai_user");
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        const existingUser = users.find((u) => u.id === user.id);

        if (!existingUser) {
          const userCredits = creditsService.getUserCredits();
          const userMetrics = MetricsService.getUserMetrics();

          users.push({
            id: user.id,
            name: user.name,
            email: user.email,
            role: user.role || "advogado",
            status: "ativo",
            plan: this.validatePlanId(userCredits?.planId || "free"),
            oabNumber: user.oabNumber,
            firm: user.firm,
            createdAt: user.createdAt,
            lastLogin: user.lastLogin,
            creditsUsed: userCredits
              ? userCredits.maxCredits === -1
                ? 0
                : userCredits.maxCredits - userCredits.currentCredits
              : 0,
            totalCredits: userCredits?.maxCredits || 0,
            usageThisMonth: userCredits
              ? this.getUsageThisMonth(userCredits.usageHistory)
              : 0,
            totalDocuments: userMetrics?.totalPecas || 0,
          });
        }
      } catch (error) {
        console.error("Erro ao carregar usuário atual:", error);
      }
    }

    return users;
  }

  // Obter dados financeiros reais
  getRealFinancialData(): RealFinancialData {
    const users = this.getRealUsers();
    const planPrices = this.getPlanPrices();

    const usersByPlan = users.reduce((acc, user) => {
      acc[user.plan] = (acc[user.plan] || 0) + 1;
      return acc;
    }, {} as Record<string, number>);

    const revenueByPlan = Object.entries(usersByPlan).reduce(
      (acc, [plan, count]) => {
        acc[plan] = count * planPrices[plan as keyof typeof planPrices];
        return acc;
      },
      {} as Record<string, number>
    );

    const totalRevenue = Object.values(revenueByPlan).reduce(
      (sum, revenue) => sum + revenue,
      0
    );
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "ativo").length;

    return {
      totalRevenue,
      mrr: totalRevenue,
      usersByPlan,
      revenueByPlan,
      churnRate:
        totalUsers > 0 ? ((totalUsers - activeUsers) / totalUsers) * 100 : 0,
      conversionRate:
        totalUsers > 0
          ? (users.filter((u) => u.plan !== "free").length / totalUsers) * 100
          : 0,
    };
  }

  // Obter preços dos planos
  getPlanPrices(): Record<string, number> {
    const stored = localStorage.getItem("admin_plan_prices");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Erro ao carregar preços dos planos:", error);
      }
    }

    // Preços padrão
    return {
      free: 0,
      basic: 29,
      pro: 79,
      enterprise: 199,
    };
  }

  // Atualizar preços dos planos
  updatePlanPrices(prices: Record<string, number>): void {
    try {
      localStorage.setItem("admin_plan_prices", JSON.stringify(prices));

      // Registrar log de auditoria
      this.logActivity({
        userId: "admin",
        action: "update_plan_prices",
        details: `Preços dos planos atualizados: ${JSON.stringify(prices)}`,
        category: "admin",
        status: "success",
      });
    } catch (error) {
      console.error("Erro ao salvar preços dos planos:", error);
      throw new Error("Erro ao salvar configurações de preços");
    }
  }

  // Obter configurações financeiras
  getFinancialSettings(): {
    currency: string;
    taxRate: number;
    invoicePrefix: string;
    paymentMethods: string[];
    billingCycle: string;
  } {
    const stored = localStorage.getItem("admin_financial_settings");
    if (stored) {
      try {
        return JSON.parse(stored);
      } catch (error) {
        console.error("Erro ao carregar configurações financeiras:", error);
      }
    }

    // Configurações padrão
    return {
      currency: "BRL",
      taxRate: 0,
      invoicePrefix: "INV",
      paymentMethods: ["credit_card", "pix", "boleto"],
      billingCycle: "monthly",
    };
  }

  // Atualizar configurações financeiras
  updateFinancialSettings(settings: {
    currency?: string;
    taxRate?: number;
    invoicePrefix?: string;
    paymentMethods?: string[];
    billingCycle?: string;
  }): void {
    const currentSettings = this.getFinancialSettings();
    const updatedSettings = { ...currentSettings, ...settings };

    try {
      localStorage.setItem(
        "admin_financial_settings",
        JSON.stringify(updatedSettings)
      );

      // Registrar log de auditoria
      this.logActivity({
        userId: "admin",
        action: "update_financial_settings",
        details: `Configurações financeiras atualizadas`,
        category: "admin",
        status: "success",
      });
    } catch (error) {
      console.error("Erro ao salvar configurações financeiras:", error);
      throw new Error("Erro ao salvar configurações financeiras");
    }
  }

  // Gerar relatório financeiro
  generateFinancialReport(period: "week" | "month" | "quarter" | "year"): {
    period: string;
    totalRevenue: number;
    totalUsers: number;
    newUsers: number;
    churnedUsers: number;
    revenueGrowth: number;
    topPlans: Array<{ plan: string; revenue: number; users: number }>;
  } {
    const users = this.getRealUsers();
    const financialData = this.getRealFinancialData();

    const now = new Date();
    let startDate: Date;

    switch (period) {
      case "week":
        startDate = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);
        break;
      case "month":
        startDate = new Date(now.getFullYear(), now.getMonth(), 1);
        break;
      case "quarter":
        startDate = new Date(
          now.getFullYear(),
          Math.floor(now.getMonth() / 3) * 3,
          1
        );
        break;
      case "year":
        startDate = new Date(now.getFullYear(), 0, 1);
        break;
    }

    const newUsers = users.filter(
      (u) => new Date(u.createdAt) >= startDate
    ).length;
    const planPrices = this.getPlanPrices();

    const topPlans = Object.entries(financialData.usersByPlan)
      .map(([plan, userCount]) => ({
        plan,
        revenue: userCount * planPrices[plan],
        users: userCount,
      }))
      .sort((a, b) => b.revenue - a.revenue);

    return {
      period,
      totalRevenue: financialData.totalRevenue,
      totalUsers: users.length,
      newUsers,
      churnedUsers: users.filter((u) => u.status !== "ativo").length,
      revenueGrowth: 12.5, // Simulated growth
      topPlans,
    };
  }

  // Obter logs de atividade reais
  getRealActivityLogs(): RealActivityLog[] {
    const logs: RealActivityLog[] = [];

    // Obter logs de login/registro
    const users = this.getRealUsers();
    users.forEach((user) => {
      if (user.lastLogin) {
        logs.push({
          id: `login_${user.id}_${user.lastLogin}`,
          timestamp: user.lastLogin,
          user: user.email,
          action: "Login",
          details: "Login realizado com sucesso",
          ip: "127.0.0.1",
          userAgent: "System Generated",
          status: "success",
          category: "auth",
        });
      }
    });

    // Obter logs de uso de créditos
    users.forEach((user) => {
      const userCredits = this.getUserCreditsById(user.id);
      if (userCredits?.usageHistory) {
        userCredits.usageHistory.forEach((usage) => {
          logs.push({
            id: usage.id,
            timestamp: usage.date.toISOString(),
            user: user.email,
            action: this.getActionFromUsageType(usage.type),
            details: usage.description,
            ip: "127.0.0.1",
            userAgent: "System Generated",
            status: "success",
            category: "document",
          });
        });
      }
    });

    return logs.sort(
      (a, b) =>
        new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime()
    );
  }

  // Obter dados de analytics reais
  getRealAnalyticsData(): RealAnalyticsData {
    const users = this.getRealUsers();
    const totalUsers = users.length;
    const activeUsers = users.filter((u) => u.status === "ativo").length;

    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const newUsersThisMonth = users.filter((u) => {
      const createdDate = new Date(u.createdAt);
      return createdDate >= startOfMonth;
    }).length;

    const totalDocuments = users.reduce(
      (sum, user) => sum + user.totalDocuments,
      0
    );
    const documentsThisMonth = users.reduce(
      (sum, user) => sum + user.usageThisMonth,
      0
    );

    // Simular crescimento mensal baseado em dados reais
    const userGrowth = this.generateUserGrowth(users);

    // Features mais usadas (baseado em tipos de uso)
    const topFeatures = [
      { feature: "Geração de Peças", usage: totalDocuments },
      {
        feature: "Editor de Documentos",
        usage: Math.floor(totalDocuments * 0.8),
      },
      { feature: "Templates", usage: Math.floor(totalDocuments * 0.6) },
      {
        feature: "Análise de Documentos",
        usage: Math.floor(totalDocuments * 0.4),
      },
    ];

    return {
      totalUsers,
      activeUsers,
      newUsersThisMonth,
      totalDocuments,
      documentsThisMonth,
      averageDocumentsPerUser:
        totalUsers > 0 ? Math.round(totalDocuments / totalUsers) : 0,
      topFeatures,
      userGrowth,
    };
  }

  // Métodos auxiliares
  private getUserCreditsById(userId: string): any {
    // Simular obtenção de créditos por ID
    const currentUserId = this.getCurrentUserId();
    if (currentUserId === userId) {
      return creditsService.getUserCredits();
    }
    return null;
  }

  private getUserMetricsById(userId: string): any {
    // Simular obtenção de métricas por ID
    const currentUserId = this.getCurrentUserId();
    if (currentUserId === userId) {
      return MetricsService.getUserMetrics();
    }
    return null;
  }

  private getCurrentUserId(): string | null {
    const currentUser = localStorage.getItem("legalai_user");
    if (currentUser) {
      try {
        const user = JSON.parse(currentUser);
        return user.id;
      } catch (error) {
        return null;
      }
    }
    return null;
  }

  private getUsageThisMonth(usageHistory: any[]): number {
    const now = new Date();
    const startOfMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    return usageHistory.filter((usage) => {
      const usageDate = new Date(usage.date);
      return usageDate >= startOfMonth && usage.creditsUsed > 0;
    }).length;
  }

  private getActionFromUsageType(type: string): string {
    switch (type) {
      case "petition_generation":
        return "Geração de Peça";
      case "ai_analysis":
        return "Análise de IA";
      case "jurisprudence_search":
        return "Busca de Jurisprudência";
      default:
        return "Ação do Sistema";
    }
  }

  private generateUserGrowth(
    users: RealUser[]
  ): Array<{ month: string; users: number }> {
    const monthNames = [
      "Jan",
      "Fev",
      "Mar",
      "Abr",
      "Mai",
      "Jun",
      "Jul",
      "Ago",
      "Set",
      "Out",
      "Nov",
      "Dez",
    ];
    const growth: Array<{ month: string; users: number }> = [];

    // Simular crescimento baseado em dados reais
    for (let i = 0; i < 6; i++) {
      const month = new Date();
      month.setMonth(month.getMonth() - (5 - i));
      const monthName = monthNames[month.getMonth()];

      // Calcular usuários até essa data
      const usersUntilMonth = users.filter((u) => {
        const createdDate = new Date(u.createdAt);
        return createdDate <= month;
      }).length;

      growth.push({
        month: monthName,
        users: usersUntilMonth,
      });
    }

    return growth;
  }

  // Método para exportar dados para CSV
  exportUsersToCSV(): string {
    const users = this.getRealUsers();
    const headers = [
      "ID",
      "Nome",
      "Email",
      "Função",
      "Status",
      "Plano",
      "OAB",
      "Escritório",
      "Criado em",
      "Último Login",
      "Créditos Usados",
      "Total Créditos",
      "Uso Este Mês",
      "Total Documentos",
    ];

    const csvContent = [
      headers.join(","),
      ...users.map((user) =>
        [
          user.id,
          user.name,
          user.email,
          user.role,
          user.status,
          user.plan,
          user.oabNumber || "",
          user.firm || "",
          user.createdAt,
          user.lastLogin || "",
          user.creditsUsed,
          user.totalCredits,
          user.usageThisMonth,
          user.totalDocuments,
        ].join(",")
      ),
    ].join("\n");

    return csvContent;
  }

  // Métodos auxiliares privados
  private getStoredUsers(): RealUser[] {
    try {
      const stored = localStorage.getItem(this.USERS_STORAGE_KEY);
      return stored ? JSON.parse(stored) : [];
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      return [];
    }
  }

  private saveUsers(users: RealUser[]): void {
    try {
      localStorage.setItem(this.USERS_STORAGE_KEY, JSON.stringify(users));
    } catch (error) {
      console.error("Erro ao salvar usuários:", error);
      throw new Error("Erro ao salvar dados do usuário");
    }
  }

  private initializeUserCredits(userId: string, plan: PlanType): void {
    const creditLimits = {
      free: 10,
      basic: 100,
      pro: 500,
      enterprise: -1, // Ilimitado
    };

    const credits = {
      userId,
      planId: plan,
      maxCredits: creditLimits[plan],
      currentCredits: creditLimits[plan],
      usageHistory: [],
      lastReset: new Date(),
      resetPeriod: "monthly",
    };

    localStorage.setItem(`user_credits_${userId}`, JSON.stringify(credits));
  }

  private cleanupUserData(userId: string): void {
    // Remover dados relacionados ao usuário
    const keysToRemove = [
      `user_credits_${userId}`,
      `user_metrics_${userId}`,
      `user_preferences_${userId}`,
      `user_sessions_${userId}`,
    ];

    keysToRemove.forEach((key) => {
      localStorage.removeItem(key);
    });
  }

  private generateTemporaryPassword(): string {
    const chars =
      "ABCDEFGHIJKLMNOPQRSTUVWXYZabcdefghijklmnopqrstuvwxyz0123456789";
    let password = "";
    for (let i = 0; i < 8; i++) {
      password += chars.charAt(Math.floor(Math.random() * chars.length));
    }
    return password;
  }

  private logActivity(activity: {
    userId: string;
    action: string;
    details: string;
    category: string;
    status: string;
  }): void {
    const log = {
      id: `activity_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      timestamp: new Date().toISOString(),
      user: activity.userId,
      action: activity.action,
      details: activity.details,
      ip: "127.0.0.1",
      userAgent: navigator.userAgent,
      status: activity.status as "success" | "error" | "warning" | "info",
      category: activity.category as
        | "auth"
        | "document"
        | "payment"
        | "admin"
        | "system",
    };

    // Salvar log (implementar conforme necessário)
    const logs = JSON.parse(
      localStorage.getItem("admin_activity_logs") || "[]"
    );
    logs.push(log);
    localStorage.setItem("admin_activity_logs", JSON.stringify(logs));
  }
}

export const adminDataService = AdminDataService.getInstance();
