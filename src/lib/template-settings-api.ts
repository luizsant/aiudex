import { API_CONFIG } from "./config";

export interface TemplateSettings {
  id: string;
  userId: string;
  defaultFont: string;
  fontSize: string;
  lineSpacing: string;
  margins: string;
  paragraphSpacing?: string;
  jurisprudenceIndent?: string;
  jurisprudenceFontSize?: string;
  firstLineIndent?: string;
  includeWatermark: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface UpdateTemplateSettingsData {
  defaultFont?: string;
  fontSize?: string;
  lineSpacing?: string;
  margins?: string;
  paragraphSpacing?: string;
  jurisprudenceIndent?: string;
  jurisprudenceFontSize?: string;
  firstLineIndent?: string;
  includeWatermark?: boolean;
}

export class TemplateSettingsAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Buscar configurações do usuário
  async getSettings(): Promise<TemplateSettings> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/template-settings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const settings = await response.json();
      console.log("✅ Configurações de template carregadas da API");
      return settings;
    } catch (error) {
      console.error("❌ Erro ao carregar configurações da API:", error);
      throw error;
    }
  }

  // Atualizar configurações do usuário
  async updateSettings(
    data: UpdateTemplateSettingsData
  ): Promise<TemplateSettings> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/template-settings`, {
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

      const settings = await response.json();
      console.log("✅ Configurações de template atualizadas na API");
      return settings;
    } catch (error) {
      console.error("❌ Erro ao atualizar configurações na API:", error);
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

      const response = await fetch(`${this.baseURL}/api/template-settings`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const isConnected = response.ok;
      console.log(
        "🔗 Teste de conexão com API de configurações:",
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
export const templateSettingsAPI = new TemplateSettingsAPI();
