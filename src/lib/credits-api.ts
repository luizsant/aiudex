import { API_CONFIG } from "./config";

export interface UserCredits {
  id: string;
  userId: string;
  planId: string;
  currentCredits: number;
  maxCredits: number;
  resetDate: string;
  lastReset: string;
  createdAt: string;
  updatedAt: string;
  plan: {
    id: string;
    name: string;
    credits: number;
  };
  usageHistory: CreditUsage[];
}

export interface CreditUsage {
  id: string;
  userCreditsId: string;
  date: string;
  type: string;
  description: string;
  creditsUsed: number;
  createdAt: string;
}

export interface ConsumeCreditsResponse {
  success: boolean;
  consumed: number;
  remaining: number;
  unlimited: boolean;
}

export class CreditsAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Buscar créditos do usuário
  async getUserCredits(): Promise<UserCredits> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/credits`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const credits = await response.json();
      console.log("✅ Créditos carregados da API");
      return credits;
    } catch (error) {
      console.error("❌ Erro ao carregar créditos da API:", error);
      throw error;
    }
  }

  // Consumir créditos
  async consumeCredits(
    type: string,
    description?: string,
    creditsUsed: number = 1
  ): Promise<ConsumeCreditsResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/credits/consume`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ type, description, creditsUsed }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Créditos consumidos na API:", result.consumed);
      return result;
    } catch (error) {
      console.error("❌ Erro ao consumir créditos na API:", error);
      throw error;
    }
  }

  // Buscar histórico de uso
  async getUsageHistory(
    limit: number = 50,
    offset: number = 0
  ): Promise<CreditUsage[]> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `${this.baseURL}/api/credits/usage?limit=${limit}&offset=${offset}`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const history = await response.json();
      console.log("✅ Histórico de uso carregado da API:", history.length);
      return history;
    } catch (error) {
      console.error("❌ Erro ao carregar histórico de uso da API:", error);
      throw error;
    }
  }

  // Atualizar plano do usuário
  async updatePlan(planId: string): Promise<UserCredits> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/credits/update-plan`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify({ planId }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const credits = await response.json();
      console.log("✅ Plano atualizado na API:", credits.plan.name);
      return credits;
    } catch (error) {
      console.error("❌ Erro ao atualizar plano na API:", error);
      throw error;
    }
  }

  // Testar conexão com autenticação
  async testConnection(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.log("⚠️ Sem token de autenticação");
        return false;
      }

      const response = await fetch(`${this.baseURL}/api/credits`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const isConnected = response.ok;
      console.log(
        "🔗 Teste de conexão com API de créditos:",
        isConnected ? "✅ OK" : "❌ FALHOU"
      );
      return isConnected;
    } catch (error) {
      console.error("❌ Erro no teste de conexão:", error);
      return false;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }
}

// Instância singleton
export const creditsAPI = new CreditsAPI();
