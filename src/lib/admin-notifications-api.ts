import { API_CONFIG } from "./config";

export interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: string;
  category: string;
  priority: string;
  read: boolean;
  metadata?: Record<string, any>;
  createdAt: string;
  readAt?: string;
}

export interface CreateAdminNotificationData {
  title: string;
  message: string;
  type?: string;
  category?: string;
  priority?: string;
  metadata?: Record<string, any>;
}

export interface NotificationStats {
  total: number;
  unread: number;
  byCategory: Array<{ category: string; _count: { id: number } }>;
  byPriority: Array<{ priority: string; _count: { id: number } }>;
}

export class AdminNotificationsAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }

  async getNotifications(
    options: {
      page?: number;
      limit?: number;
      unreadOnly?: boolean;
      category?: string;
      type?: string;
      priority?: string;
    } = {}
  ): Promise<{ data: AdminNotification[]; pagination: any }> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const params = new URLSearchParams();
    if (options.page) params.append("page", options.page.toString());
    if (options.limit) params.append("limit", options.limit.toString());
    if (options.unreadOnly) params.append("unreadOnly", "true");
    if (options.category) params.append("category", options.category);
    if (options.type) params.append("type", options.type);
    if (options.priority) params.append("priority", options.priority);

    const response = await fetch(
      `${this.baseURL}/api/admin-notifications?${params}`,
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

  async createNotification(
    data: CreateAdminNotificationData
  ): Promise<AdminNotification> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(`${this.baseURL}/api/admin-notifications`, {
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

  async markAsRead(id: string): Promise<AdminNotification> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(
      `${this.baseURL}/api/admin-notifications/${id}/read`,
      {
        method: "PUT",
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

    const result = await response.json();
    return result.data;
  }

  async markAllAsRead(): Promise<{ updatedCount: number }> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(
      `${this.baseURL}/api/admin-notifications/read-all`,
      {
        method: "PUT",
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

    const result = await response.json();
    return result.data;
  }

  async deleteNotification(id: string): Promise<void> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(
      `${this.baseURL}/api/admin-notifications/${id}`,
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

  async getStats(): Promise<NotificationStats> {
    const token = this.getAuthToken();
    if (!token) throw new Error("Token de autenticação não encontrado");

    const response = await fetch(
      `${this.baseURL}/api/admin-notifications/stats`,
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
    return result.data;
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

export const adminNotificationsAPI = new AdminNotificationsAPI();
