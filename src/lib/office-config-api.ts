import { API_CONFIG } from "./config";

export interface OfficeConfig {
  id: string;
  userId: string;
  lawyerName: string;
  oabNumber: string;
  oabState: string;
  officeName?: string;
  officeCnpj?: string;
  officePhone: string;
  officeEmail: string;
  officeWebsite?: string;
  officeStreet?: string;
  officeNumber?: string;
  officeComplement?: string;
  officeNeighborhood?: string;
  officeCity?: string;
  officeCep?: string;
  officeAddress: string;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateOfficeConfigData {
  lawyerName?: string;
  oabNumber?: string;
  oabState?: string;
  officeName?: string;
  officeCnpj?: string;
  officePhone?: string;
  officeEmail?: string;
  officeWebsite?: string;
  officeStreet?: string;
  officeNumber?: string;
  officeComplement?: string;
  officeNeighborhood?: string;
  officeCity?: string;
  officeCep?: string;
  officeAddress?: string;
}

export class OfficeConfigAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Buscar configurações do escritório do usuário
  async getConfig(): Promise<OfficeConfig> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/office-config`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const config = await response.json();
      console.log("✅ Configurações do escritório carregadas da API");
      return config;
    } catch (error) {
      console.error(
        "❌ Erro ao carregar configurações do escritório da API:",
        error
      );
      throw error;
    }
  }

  // Atualizar configurações do escritório do usuário
  async updateConfig(data: UpdateOfficeConfigData): Promise<OfficeConfig> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/office-config`, {
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

      const config = await response.json();
      console.log("✅ Configurações do escritório atualizadas na API");
      return config;
    } catch (error) {
      console.error(
        "❌ Erro ao atualizar configurações do escritório na API:",
        error
      );
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

      const response = await fetch(`${this.baseURL}/api/office-config`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const isConnected = response.ok;
      console.log(
        "🔗 Teste de conexão com API de configurações do escritório:",
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
export const officeConfigAPI = new OfficeConfigAPI();
