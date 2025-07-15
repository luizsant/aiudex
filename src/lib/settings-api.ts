import { API_CONFIG } from "./config";

export interface SystemSetting {
  id: string;
  userId?: string;
  key: string;
  value: any;
  description?: string;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateSettingData {
  key: string;
  value: any;
  description?: string;
  isPublic?: boolean;
}

export interface UpdateSettingData {
  value?: any;
  description?: string;
  isPublic?: boolean;
}

export class SettingsAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  // Buscar todas as configurações
  async getSettings(): Promise<SystemSetting[]> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/settings`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result.data;
  }

  // Buscar configuração específica
  async getSetting(key: string): Promise<SystemSetting> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/settings/${key}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result.data;
  }

  // Criar configuração
  async createSetting(data: CreateSettingData): Promise<SystemSetting> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/settings`, {
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
    return result.data;
  }

  // Atualizar configuração
  async updateSetting(
    key: string,
    data: UpdateSettingData
  ): Promise<SystemSetting> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/settings/${key}`, {
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

    const result = await response.json();
    return result.data;
  }

  // Excluir configuração
  async deleteSetting(key: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/settings/${key}`, {
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
  }

  // Buscar configurações públicas
  async getPublicSettings(): Promise<SystemSetting[]> {
    const response = await fetch(`${this.baseURL}/api/settings/public`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result.data;
  }

  // Buscar configuração pública específica
  async getPublicSetting(key: string): Promise<SystemSetting> {
    const response = await fetch(`${this.baseURL}/api/settings/public/${key}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result.data;
  }

  // Buscar configurações do header
  async getHeaderSettings(): Promise<SystemSetting[]> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/settings/header`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result.data;
  }

  // Buscar configurações do footer
  async getFooterSettings(): Promise<SystemSetting[]> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/settings/footer`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result.data;
  }

  // Buscar configurações do logo
  async getLogoSettings(): Promise<SystemSetting[]> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/settings/logo`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result.data;
  }

  // Buscar configurações do tema
  async getThemeSettings(): Promise<SystemSetting[]> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/settings/theme`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result.data;
  }

  // Buscar configurações do escritório
  async getOfficeSettings(): Promise<SystemSetting[]> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/settings/office`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result.data;
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
      return false;
    }
  }
}

export const settingsAPI = new SettingsAPI();
