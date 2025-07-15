import { API_CONFIG } from "./config";

export interface UserMetrics {
  id: string;
  userId: string;
  totalPecas: number;
  totalTempo: number; // em minutos
  pecasGeradas: Array<{
    id: string;
    tipo: string;
    tempoCriacao: number; // em minutos
    data: string;
    area: string;
  }>;
  primeiraPeca: string | null;
  ultimaAtualizacao: string;
}

export interface CreatePecaData {
  tipo: string;
  tempoCriacao: number; // em minutos
  area: string;
}

export interface UpdateMetricsData {
  totalPecas?: number;
  totalTempo?: number;
  primeiraPeca?: string;
  ultimaAtualizacao?: string;
}

export interface OptimizationMetric {
  id: number;
  metric: string;
  before: string;
  after: string;
  improvement: string;
  icon: string;
  isDynamic: boolean;
}

export interface GeneralStats {
  pecasGeradas: number;
  tempoEconomizado: number;
  eficienciaIA: number;
  produtividade: number;
}

export class MetricsServiceAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // ======================
  // MÉTODOS PRINCIPAIS
  // ======================

  // Buscar métricas do usuário
  async getMetrics(): Promise<UserMetrics> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/metrics`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const metrics = await response.json();
      console.log("✅ Métricas carregadas da API:", {
        totalPecas: metrics.totalPecas,
        totalTempo: metrics.totalTempo,
        pecasGeradas: metrics.pecasGeradas.length,
      });
      return metrics;
    } catch (error) {
      console.error("❌ Erro ao carregar métricas da API:", error);
      throw error;
    }
  }

  // Registrar nova peça gerada
  async registerPeca(data: CreatePecaData): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/metrics/peca`, {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Peça registrada na API:", result.message);
    } catch (error) {
      console.error("❌ Erro ao registrar peça na API:", error);
      throw error;
    }
  }

  // Atualizar métricas do usuário
  async updateMetrics(data: UpdateMetricsData): Promise<UserMetrics> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/metrics`, {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const metrics = await response.json();
      console.log("✅ Métricas atualizadas na API");
      return metrics;
    } catch (error) {
      console.error("❌ Erro ao atualizar métricas na API:", error);
      throw error;
    }
  }

  // Limpar métricas do usuário
  async clearMetrics(): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/metrics`, {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      console.log("✅ Métricas limpas na API");
    } catch (error) {
      console.error("❌ Erro ao limpar métricas na API:", error);
      throw error;
    }
  }

  // Obter estatísticas gerais
  async getStats(): Promise<GeneralStats> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/metrics/stats`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const stats = await response.json();
      console.log("✅ Estatísticas carregadas da API:", stats);
      return stats;
    } catch (error) {
      console.error("❌ Erro ao carregar estatísticas da API:", error);
      throw error;
    }
  }

  // Contar métricas do usuário
  async getMetricsCount(): Promise<number> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/metrics/count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const data = await response.json();
      return data.count;
    } catch (error) {
      console.error("❌ Erro ao contar métricas da API:", error);
      throw error;
    }
  }

  // ======================
  // MÉTODOS AUXILIARES
  // ======================

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  // Verificar se a API está disponível
  async checkAPIHealth(): Promise<boolean> {
    try {
      const response = await fetch(`${this.baseURL}/api/health`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
        },
      });
      return response.ok;
    } catch (error) {
      console.error("❌ API não disponível:", error);
      return false;
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

      const response = await fetch(`${this.baseURL}/api/metrics/count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const isConnected = response.ok;
      console.log(
        "🔗 Teste de conexão com API de métricas:",
        isConnected ? "✅ OK" : "❌ FALHOU"
      );
      return isConnected;
    } catch (error) {
      console.error("❌ Erro no teste de conexão:", error);
      return false;
    }
  }
}

// Instância singleton
export const metricsServiceAPI = new MetricsServiceAPI();
