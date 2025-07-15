import { API_CONFIG } from "./config";

export interface Report {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: string;
  config: any;
  data: any;
  summary: any;
  charts?: any;
  format: string;
  exportFormats?: string[];
  scheduled?: any;
  createdAt: string;
  updatedAt: string;
}

export interface ReportTemplate {
  id: string;
  userId: string;
  name: string;
  description?: string;
  type: string;
  config: any;
  isDefault: boolean;
  isPublic: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface CreateReportData {
  name: string;
  description?: string;
  type: string;
  config: any;
  data?: any;
  summary?: any;
  charts?: any;
  format?: string;
  exportFormats?: string[];
  scheduled?: any;
}

export interface CreateTemplateData {
  name: string;
  description?: string;
  type: string;
  config: any;
  isDefault?: boolean;
  isPublic?: boolean;
}

export class ReportsAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  async getReports(
    options: {
      page?: number;
      limit?: number;
      type?: string;
      format?: string;
    } = {}
  ): Promise<{ data: Report[]; pagination: any }> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.type) params.append("type", options.type);
    if (options.format) params.append("format", options.format);

    const response = await fetch(`${this.baseURL}/api/reports?${params}`, {
      method: "GET",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result;
  }

  async createReport(data: CreateReportData): Promise<Report> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/reports`, {
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

  async getReport(id: string): Promise<Report> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/reports/${id}`, {
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

  async updateReport(
    id: string,
    data: Partial<CreateReportData>
  ): Promise<Report> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/reports/${id}`, {
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

  async deleteReport(id: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/reports/${id}`, {
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

  async generateReport(id: string): Promise<Report> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/reports/${id}/generate`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${token}`,
      },
    });

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  async getTemplates(
    options: {
      page?: number;
      limit?: number;
      type?: string;
      isPublic?: boolean;
    } = {}
  ): Promise<{ data: ReportTemplate[]; pagination: any }> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.type) params.append("type", options.type);
    if (options.isPublic !== undefined)
      params.append("isPublic", options.isPublic.toString());

    const response = await fetch(
      `${this.baseURL}/api/reports/templates?${params}`,
      {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) throw new Error(`Erro HTTP: ${response.status}`);
    const result = await response.json();
    return result;
  }

  async createTemplate(data: CreateTemplateData): Promise<ReportTemplate> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/reports/templates`, {
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

  async updateTemplate(
    id: string,
    data: Partial<CreateTemplateData>
  ): Promise<ReportTemplate> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(
      `${this.baseURL}/api/reports/templates/${id}`,
      {
        method: "PUT",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
        body: JSON.stringify(data),
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }

    const result = await response.json();
    return result.data;
  }

  async deleteTemplate(id: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(
      `${this.baseURL}/api/reports/templates/${id}`,
      {
        method: "DELETE",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      }
    );

    if (!response.ok) {
      const errorData = await response.json().catch(() => ({}));
      throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
    }
  }

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

export const reportsAPI = new ReportsAPI();
