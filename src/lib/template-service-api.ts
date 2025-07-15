import { API_CONFIG } from "./config";

export interface Template {
  id: string;
  userId: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  isCustom: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateTemplateData {
  name: string;
  category?: string;
  content: string;
  variables?: string[];
  isCustom?: boolean;
}

export interface UpdateTemplateData {
  name?: string;
  category?: string;
  content?: string;
  variables?: string[];
  isCustom?: boolean;
}

export class TemplateServiceAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // ======================
  // MÉTODOS PRINCIPAIS
  // ======================

  // Buscar todos os templates do usuário
  async getTemplates(): Promise<Template[]> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/templates`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const templates = await response.json();
      console.log("✅ Templates carregados da API:", templates.length);
      return templates;
    } catch (error) {
      console.error("❌ Erro ao carregar templates da API:", error);
      throw error;
    }
  }

  // Buscar template específico
  async getTemplate(id: string): Promise<Template> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/templates/${id}`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const template = await response.json();
      console.log("✅ Template carregado da API:", template.name);
      return template;
    } catch (error) {
      console.error("❌ Erro ao carregar template da API:", error);
      throw error;
    }
  }

  // Criar novo template
  async createTemplate(data: CreateTemplateData): Promise<Template> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/templates`, {
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

      const template = await response.json();
      console.log("✅ Template criado na API:", template.name);
      return template;
    } catch (error) {
      console.error("❌ Erro ao criar template na API:", error);
      throw error;
    }
  }

  // Atualizar template
  async updateTemplate(
    id: string,
    data: UpdateTemplateData
  ): Promise<Template> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/templates/${id}`, {
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

      const template = await response.json();
      console.log("✅ Template atualizado na API:", template.name);
      return template;
    } catch (error) {
      console.error("❌ Erro ao atualizar template na API:", error);
      throw error;
    }
  }

  // Excluir template
  async deleteTemplate(id: string): Promise<void> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/templates/${id}`, {
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

      console.log("✅ Template excluído da API:", id);
    } catch (error) {
      console.error("❌ Erro ao excluir template da API:", error);
      throw error;
    }
  }

  // Contar templates do usuário
  async getTemplatesCount(): Promise<number> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/templates/count`, {
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
      console.error("❌ Erro ao contar templates da API:", error);
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

      const response = await fetch(`${this.baseURL}/api/templates/count`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      const isConnected = response.ok;
      console.log(
        "🔗 Teste de conexão com API:",
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
export const templateServiceAPI = new TemplateServiceAPI();
