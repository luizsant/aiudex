// Sistema de Pagamento para AIudex
export interface PaymentPlan {
  id: string;
  name: string;
  price: number;
  currency: string;
  interval: "month" | "year";
  features: string[];
  maxPetitions: number;
  maxClients: number;
  aiFeatures: boolean;
  premiumSupport: boolean;
  jurisprudenceAnalysis: boolean;
  priority: "free" | "basic" | "pro" | "enterprise";
}

export interface PaymentMethod {
  id: string;
  type: "credit_card" | "pix" | "bank_transfer";
  name: string;
  icon: string;
}

export interface Subscription {
  id: string;
  planId: string;
  status: "active" | "cancelled" | "expired" | "pending";
  startDate: Date;
  endDate: Date;
  autoRenew: boolean;
  paymentMethod: string;
}

export class PaymentService {
  private static instance: PaymentService;
  private currentSubscription: Subscription | null = null;

  static getInstance(): PaymentService {
    if (!PaymentService.instance) {
      PaymentService.instance = new PaymentService();
    }
    return PaymentService.instance;
  }

  // Planos disponíveis
  getPlans(): PaymentPlan[] {
    return [
      {
        id: "free",
        name: "Gratuito",
        price: 0,
        currency: "BRL",
        interval: "month",
        features: [
          "3 petições por mês",
          "5 clientes",
          "Templates básicos",
          "Exportação PDF",
          "Suporte por email",
        ],
        maxPetitions: 3,
        maxClients: 5,
        aiFeatures: false,
        premiumSupport: false,
        jurisprudenceAnalysis: false,
        priority: "free",
      },
      {
        id: "basic",
        name: "Básico",
        price: 49.9,
        currency: "BRL",
        interval: "month",
        features: [
          "20 petições por mês",
          "50 clientes",
          "Templates avançados",
          "IA Jurídica básica",
          "Exportação PDF/DOCX",
          "Suporte prioritário",
          "Histórico de documentos",
        ],
        maxPetitions: 20,
        maxClients: 50,
        aiFeatures: true,
        premiumSupport: false,
        jurisprudenceAnalysis: false,
        priority: "basic",
      },
      {
        id: "pro",
        name: "Profissional",
        price: 99.9,
        currency: "BRL",
        interval: "month",
        features: [
          "Petições ilimitadas",
          "Clientes ilimitados",
          "IA Jurídica avançada",
          "Análise de jurisprudência",
          "Templates personalizados",
          "Exportação em múltiplos formatos",
          "Suporte premium 24/7",
          "Relatórios avançados",
          "Integração com sistemas",
        ],
        maxPetitions: -1, // Ilimitado
        maxClients: -1, // Ilimitado
        aiFeatures: true,
        premiumSupport: true,
        jurisprudenceAnalysis: true,
        priority: "pro",
      },
      {
        id: "enterprise",
        name: "Empresarial",
        price: 199.9,
        currency: "BRL",
        interval: "month",
        features: [
          "Tudo do plano Pro",
          "Múltiplos usuários",
          "API personalizada",
          "Treinamento dedicado",
          "Suporte telefônico",
          "SLA garantido",
          "Backup automático",
          "Compliance LGPD",
        ],
        maxPetitions: -1,
        maxClients: -1,
        aiFeatures: true,
        premiumSupport: true,
        jurisprudenceAnalysis: true,
        priority: "enterprise",
      },
    ];
  }

  // Métodos de pagamento
  getPaymentMethods(): PaymentMethod[] {
    return [
      {
        id: "credit_card",
        type: "credit_card",
        name: "Cartão de Crédito",
        icon: "💳",
      },
      {
        id: "pix",
        type: "pix",
        name: "PIX",
        icon: "📱",
      },
      {
        id: "bank_transfer",
        type: "bank_transfer",
        name: "Transferência Bancária",
        icon: "🏦",
      },
    ];
  }

  // Processar pagamento
  async processPayment(
    planId: string,
    paymentMethod: string,
    cardData?: any
  ): Promise<{
    success: boolean;
    transactionId?: string;
    error?: string;
    subscription?: Subscription;
  }> {
    try {
      // Simulação de processamento de pagamento
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const plan = this.getPlans().find((p) => p.id === planId);
      if (!plan) {
        throw new Error("Plano não encontrado");
      }

      // Simular validação de pagamento
      if (paymentMethod === "credit_card" && (!cardData || !cardData.number)) {
        throw new Error("Dados do cartão inválidos");
      }

      // Gerar ID de transação
      const transactionId = `TXN_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`;

      // Criar assinatura
      const subscription: Subscription = {
        id: `SUB_${Date.now()}`,
        planId,
        status: "active",
        startDate: new Date(),
        endDate: new Date(
          Date.now() +
            (plan.interval === "month" ? 30 : 365) * 24 * 60 * 60 * 1000
        ),
        autoRenew: true,
        paymentMethod,
      };

      this.currentSubscription = subscription;

      // Salvar no localStorage
      localStorage.setItem(
        "legalai_subscription",
        JSON.stringify(subscription)
      );

      return {
        success: true,
        transactionId,
        subscription,
      };
    } catch (error) {
      return {
        success: false,
        error: error instanceof Error ? error.message : "Erro desconhecido",
      };
    }
  }

  // Obter assinatura atual
  getCurrentSubscription(): Subscription | null {
    // TEMPORÁRIO: Sempre retornar assinatura Pro para testes
    const proSubscription: Subscription = {
      id: "SUB_PRO_TEST",
      planId: "pro",
      status: "active",
      startDate: new Date("2024-01-01"),
      endDate: new Date("2024-12-31"),
      autoRenew: true,
      paymentMethod: "credit_card",
    };
    return proSubscription;

    // Código original comentado:
    // if (this.currentSubscription) {
    //   return this.currentSubscription;
    // }
    // const saved = localStorage.getItem("legalai_subscription");
    // if (saved) {
    //   try {
    //     this.currentSubscription = JSON.parse(saved);
    //     return this.currentSubscription;
    //   } catch {
    //     return null;
    //   }
    // }
    // const currentUser = localStorage.getItem("legalai_current_user");
    // if (currentUser) {
    //   try {
    //     const user = JSON.parse(currentUser);
    //     if (user.email === "pro@teste.com") {
    //       const proSubscription: Subscription = {
    //         id: "SUB_PRO_TEST",
    //         planId: "pro",
    //         status: "active",
    //         startDate: new Date("2024-01-01"),
    //         endDate: new Date("2024-12-31"),
    //         autoRenew: true,
    //         paymentMethod: "credit_card",
    //       };
    //       this.currentSubscription = proSubscription;
    //       localStorage.setItem("legalai_subscription", JSON.stringify(proSubscription));
    //       return proSubscription;
    //     }
    //   } catch {
    //     // Ignorar erro de parsing
    //   }
    // }
    // return null;
  }

  // Verificar se tem acesso a recursos premium
  hasPremiumAccess(): boolean {
    // TEMPORÁRIO: Desabilitar pagamentos para testes
    return true;

    // Código original comentado:
    // const subscription = this.getCurrentSubscription();
    // if (!subscription) return false;
    // const plan = this.getPlans().find((p) => p.id === subscription.planId);
    // return plan?.priority === "pro" || plan?.priority === "enterprise";
  }

  // Verificar limite de petições
  canCreatePetition(): boolean {
    // TEMPORÁRIO: Desabilitar pagamentos para testes
    return true;

    // Código original comentado:
    // const subscription = this.getCurrentSubscription();
    // if (!subscription) return false;
    // const plan = this.getPlans().find((p) => p.id === subscription.planId);
    // if (!plan) return false;
    // if (plan.maxPetitions === -1) return true;
    // const currentUsage = parseInt(
    //   localStorage.getItem("petitions_used_this_month") || "0"
    // );
    // return currentUsage < plan.maxPetitions;
  }

  // Incrementar uso de petições
  incrementPetitionUsage(): void {
    const current = parseInt(
      localStorage.getItem("petitions_used_this_month") || "0"
    );
    localStorage.setItem("petitions_used_this_month", (current + 1).toString());
  }

  // Cancelar assinatura
  async cancelSubscription(): Promise<{ success: boolean; error?: string }> {
    try {
      const subscription = this.getCurrentSubscription();
      if (!subscription) {
        throw new Error("Nenhuma assinatura ativa encontrada");
      }

      // Simular cancelamento
      await new Promise((resolve) => setTimeout(resolve, 1000));

      subscription.status = "cancelled";
      subscription.autoRenew = false;

      localStorage.setItem(
        "legalai_subscription",
        JSON.stringify(subscription)
      );
      this.currentSubscription = subscription;

      return { success: true };
    } catch (error) {
      return {
        success: false,
        error:
          error instanceof Error
            ? error.message
            : "Erro ao cancelar assinatura",
      };
    }
  }

  // Gerar fatura
  generateInvoice(transactionId: string): string {
    return `FATURA AIUDEX
Data: ${new Date().toLocaleDateString("pt-BR")}
Transação: ${transactionId}
Valor: R$ 99,90
Status: Pago`;
  }

  // Calcular desconto anual
  calculateAnnualDiscount(monthlyPrice: number): number {
    return monthlyPrice * 12 * 0.2; // 20% de desconto no plano anual
  }
}

export const paymentService = PaymentService.getInstance();
