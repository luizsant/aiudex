// Sistema de Créditos para AIudex
export interface UserCredits {
  userId: string;
  planId: string;
  currentCredits: number;
  maxCredits: number;
  resetDate: Date;
  lastReset: Date;
  usageHistory: CreditUsage[];
}

export interface CreditUsage {
  id: string;
  date: Date;
  type: "petition_generation" | "ai_analysis" | "jurisprudence_search";
  description: string;
  creditsUsed: number;
}

export class CreditsService {
  private static instance: CreditsService;
  private currentUserCredits: UserCredits | null = null;

  static getInstance(): CreditsService {
    if (!CreditsService.instance) {
      CreditsService.instance = new CreditsService();
    }
    return CreditsService.instance;
  }

  // Obter créditos do usuário atual
  getUserCredits(): UserCredits | null {
    if (this.currentUserCredits) {
      return this.currentUserCredits;
    }

    // Verificar se está no browser
    if (typeof window === "undefined") {
      return null;
    }

    const saved = localStorage.getItem("legalai_user_credits");
    if (saved) {
      try {
        const credits = JSON.parse(saved);

        // Verificar se os créditos correspondem ao usuário atual
        const currentUser = localStorage.getItem("legalai_user");
        if (currentUser) {
          const user = JSON.parse(currentUser);
          if (credits.userId !== user.id) {
            console.log(
              "Usuário dos créditos não corresponde ao usuário atual:",
              {
                creditsUserId: credits.userId,
                currentUserId: user.id,
              }
            );
            return null;
          }
        }

        // Converter strings de data de volta para objetos Date
        credits.resetDate = new Date(credits.resetDate);
        credits.lastReset = new Date(credits.lastReset);
        credits.usageHistory = credits.usageHistory.map((usage: any) => ({
          ...usage,
          date: new Date(usage.date),
        }));
        this.currentUserCredits = credits;
        return credits;
      } catch {
        return null;
      }
    }
    return null;
  }

  // Inicializar créditos para um usuário (chamado após login/registro)
  initializeUserCredits(userId: string, planId: string): UserCredits {
    const plan = this.getPlanCredits(planId);
    const now = new Date();
    const resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1); // Primeiro dia do próximo mês

    const userCredits: UserCredits = {
      userId,
      planId,
      currentCredits: plan.monthlyCredits,
      maxCredits: plan.monthlyCredits,
      resetDate,
      lastReset: now,
      usageHistory: [],
    };

    this.currentUserCredits = userCredits;
    this.saveUserCredits(userCredits);
    return userCredits;
  }

  // Verificar se o usuário pode gerar uma peça
  canGeneratePetition(): boolean {
    const credits = this.getUserCredits();
    if (!credits) return false;

    // Verificar se precisa resetar os créditos
    this.checkAndResetCredits(credits);

    // Planos ilimitados sempre podem gerar
    if (credits.maxCredits === -1) return true;

    return credits.currentCredits > 0;
  }

  // Consumir crédito para geração de peça
  consumePetitionCredit(
    description: string = "Geração de peça jurídica"
  ): boolean {
    console.log("🔍 [CREDITS] Iniciando consumo de crédito:", description);

    const credits = this.getUserCredits();
    console.log("🔍 [CREDITS] Créditos atuais:", credits);

    if (!credits) {
      console.log("❌ [CREDITS] Nenhum crédito encontrado");
      return false;
    }

    // Verificar se precisa resetar os créditos
    this.checkAndResetCredits(credits);

    // Planos ilimitados não consomem créditos
    if (credits.maxCredits === -1) {
      console.log("♾️ [CREDITS] Plano ilimitado - não consome créditos");
      this.recordUsage(credits, "petition_generation", description, 0);
      return true;
    }

    if (credits.currentCredits <= 0) {
      console.log("❌ [CREDITS] Sem créditos disponíveis");
      return false;
    }

    console.log(
      "💰 [CREDITS] Consumindo crédito. Antes:",
      credits.currentCredits
    );
    credits.currentCredits -= 1;
    console.log(
      "💰 [CREDITS] Consumindo crédito. Depois:",
      credits.currentCredits
    );

    this.recordUsage(credits, "petition_generation", description, 1);
    this.saveUserCredits(credits);

    console.log("✅ [CREDITS] Crédito consumido com sucesso");
    return true;
  }

  // Verificar e resetar créditos se necessário
  private checkAndResetCredits(credits: UserCredits): void {
    const now = new Date();
    if (now >= credits.resetDate) {
      // Resetar créditos
      credits.currentCredits = credits.maxCredits;
      credits.lastReset = now;
      credits.resetDate = new Date(now.getFullYear(), now.getMonth() + 1, 1);
      this.saveUserCredits(credits);
    }
  }

  // Registrar uso de créditos
  private recordUsage(
    credits: UserCredits,
    type: CreditUsage["type"],
    description: string,
    creditsUsed: number
  ): void {
    const usage: CreditUsage = {
      id: `usage_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      date: new Date(),
      type,
      description,
      creditsUsed,
    };

    credits.usageHistory.push(usage);

    // Manter apenas os últimos 100 usos
    if (credits.usageHistory.length > 100) {
      credits.usageHistory = credits.usageHistory.slice(-100);
    }
  }

  // Salvar créditos no localStorage
  private saveUserCredits(credits: UserCredits): void {
    // Verificar se está no browser
    if (typeof window === "undefined") {
      return;
    }

    console.log("💾 [CREDITS] Salvando créditos:", credits);
    localStorage.setItem("legalai_user_credits", JSON.stringify(credits));
    console.log("💾 [CREDITS] Créditos salvos no localStorage");

    // Disparar evento customizado para notificar mudanças
    window.dispatchEvent(
      new CustomEvent("creditsUpdated", { detail: credits })
    );
  }

  // Obter créditos por plano
  private getPlanCredits(planId: string): { monthlyCredits: number } {
    switch (planId) {
      case "free":
        return { monthlyCredits: 3 };
      case "basic":
        return { monthlyCredits: 20 };
      case "pro":
        return { monthlyCredits: -1 }; // Ilimitado
      case "enterprise":
        return { monthlyCredits: -1 }; // Ilimitado
      default:
        return { monthlyCredits: 3 }; // Padrão gratuito
    }
  }

  // Atualizar plano do usuário
  updateUserPlan(planId: string): void {
    const credits = this.getUserCredits();
    if (!credits) return;

    const plan = this.getPlanCredits(planId);
    credits.planId = planId;
    credits.maxCredits = plan.monthlyCredits;

    // Se mudou para plano ilimitado, resetar créditos
    if (plan.monthlyCredits === -1) {
      credits.currentCredits = -1;
    } else {
      // Se mudou de ilimitado para limitado, definir créditos atuais
      if (credits.currentCredits === -1) {
        credits.currentCredits = plan.monthlyCredits;
      }
    }

    this.saveUserCredits(credits);
  }

  // Obter estatísticas de uso
  getUsageStats(): {
    totalUsed: number;
    remaining: number;
    resetDate: Date | null;
    usageThisMonth: number;
  } {
    // Verificar se está no browser
    if (typeof window === "undefined") {
      return {
        totalUsed: 0,
        remaining: 0,
        resetDate: null,
        usageThisMonth: 0,
      };
    }

    const credits = this.getUserCredits();
    if (!credits) {
      return {
        totalUsed: 0,
        remaining: 0,
        resetDate: null,
        usageThisMonth: 0,
      };
    }

    const now = new Date();
    const thisMonth = new Date(now.getFullYear(), now.getMonth(), 1);

    const usageThisMonth = credits.usageHistory
      .filter((usage) => usage.date >= thisMonth && usage.creditsUsed > 0)
      .reduce((sum, usage) => sum + usage.creditsUsed, 0);

    return {
      totalUsed:
        credits.maxCredits === -1
          ? 0
          : credits.maxCredits - credits.currentCredits,
      remaining: credits.currentCredits,
      resetDate: credits.resetDate,
      usageThisMonth,
    };
  }

  // Limpar dados (para testes)
  clearData(): void {
    // Verificar se está no browser
    if (typeof window === "undefined") {
      return;
    }

    localStorage.removeItem("legalai_user_credits");
    this.currentUserCredits = null;
  }

  // Simular dados para demonstração
  simulateData(): void {
    // Verificar se está no browser
    if (typeof window === "undefined") {
      return;
    }

    // Obter usuário atual do localStorage
    const currentUser = localStorage.getItem("legalai_user");
    if (!currentUser) {
      console.error("Nenhum usuário logado encontrado");
      return;
    }

    try {
      const user = JSON.parse(currentUser);
      const userId = user.id;
      const planId = "basic";
      const credits = this.initializeUserCredits(userId, planId);

      // Simular alguns usos
      for (let i = 0; i < 5; i++) {
        this.consumePetitionCredit(`Peça simulada ${i + 1}`);
      }

      console.log("Dados simulados criados para usuário:", userId);
    } catch (error) {
      console.error("Erro ao simular dados:", error);
    }
  }
}

export const creditsService = CreditsService.getInstance();
