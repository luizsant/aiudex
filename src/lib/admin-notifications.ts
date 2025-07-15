import React from "react";
import { toast } from "sonner";
import {
  adminNotificationsAPI,
  AdminNotification,
  CreateAdminNotificationData,
  NotificationStats,
} from "./admin-notifications-api";

interface AdminNotificationLocal {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  read: boolean;
  timestamp: Date;
  metadata?: Record<string, any>;
}

interface NotificationStatsLocal {
  total: number;
  unread: number;
  byCategory: Record<string, number>;
  byPriority: Record<string, number>;
}

class AdminNotificationService {
  private notifications: AdminNotificationLocal[] = [];
  private listeners: Array<(notifications: AdminNotificationLocal[]) => void> =
    [];
  private statsListeners: Array<(stats: NotificationStatsLocal) => void> = [];
  private intervalId: NodeJS.Timeout | null = null;
  private readonly STORAGE_KEY = "admin_notifications";
  private readonly MAX_NOTIFICATIONS = 100;
  private apiAvailable = true;

  constructor() {
    this.loadNotifications();
    this.checkAPIHealth();
  }

  private async checkAPIHealth() {
    try {
      this.apiAvailable = await adminNotificationsAPI.checkAPIHealth();
      if (this.apiAvailable) {
        await this.syncWithAPI();
      }
    } catch (error) {
      this.apiAvailable = false;
      console.log(
        "API de notificações administrativas não disponível, usando localStorage"
      );
    }
  }

  private async syncWithAPI() {
    try {
      const apiResult = await adminNotificationsAPI.getNotifications({
        limit: 100,
      });
      const apiNotifications = apiResult.data;

      // Converter formato da API para formato local
      const convertedNotifications: AdminNotificationLocal[] =
        apiNotifications.map((apiNotif) => ({
          id: apiNotif.id,
          title: apiNotif.title,
          message: apiNotif.message,
          type: apiNotif.type.toLowerCase() as AdminNotificationLocal["type"],
          category: apiNotif.category,
          priority: apiNotif.priority as AdminNotificationLocal["priority"],
          read: apiNotif.read,
          timestamp: new Date(apiNotif.createdAt),
          metadata: apiNotif.metadata,
        }));

      this.notifications = convertedNotifications;
      this.saveNotifications();
      this.notifyListeners();
      this.notifyStatsListeners();
    } catch (error) {
      console.error("Erro ao sincronizar com API:", error);
    }
  }

  // Adicionar notificação
  async addNotification(
    notification: Omit<AdminNotificationLocal, "id" | "timestamp" | "read">
  ) {
    const newNotification: AdminNotificationLocal = {
      ...notification,
      id: `notification_${Date.now()}_${Math.random()
        .toString(36)
        .substr(2, 9)}`,
      timestamp: new Date(),
      read: false,
    };

    // Tentar salvar na API primeiro
    if (this.apiAvailable) {
      try {
        const apiData: CreateAdminNotificationData = {
          title: newNotification.title,
          message: newNotification.message,
          type: newNotification.type.toUpperCase(),
          category: newNotification.category,
          priority: newNotification.priority,
          metadata: newNotification.metadata,
        };

        await adminNotificationsAPI.createNotification(apiData);
        await this.syncWithAPI();
        return newNotification.id;
      } catch (error) {
        console.error("Erro ao salvar na API, usando localStorage:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    this.notifications.unshift(newNotification);

    // Limitar o número de notificações
    if (this.notifications.length > this.MAX_NOTIFICATIONS) {
      this.notifications = this.notifications.slice(0, this.MAX_NOTIFICATIONS);
    }

    this.saveNotifications();
    this.notifyListeners();
    this.notifyStatsListeners();

    // Mostrar toast para notificações críticas
    if (notification.priority === "critical") {
      toast.error(notification.title, {
        description: notification.message,
        duration: 5000,
      });
    } else if (notification.priority === "high") {
      toast.warning(notification.title, {
        description: notification.message,
        duration: 4000,
      });
    }

    return newNotification.id;
  }

  // Marcar como lida
  async markAsRead(id: string) {
    if (this.apiAvailable) {
      try {
        await adminNotificationsAPI.markAsRead(id);
        await this.syncWithAPI();
        return;
      } catch (error) {
        console.error("Erro ao marcar como lida na API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    const notification = this.notifications.find((n) => n.id === id);
    if (notification) {
      notification.read = true;
      this.saveNotifications();
      this.notifyListeners();
      this.notifyStatsListeners();
    }
  }

  // Marcar todas como lidas
  async markAllAsRead() {
    if (this.apiAvailable) {
      try {
        await adminNotificationsAPI.markAllAsRead();
        await this.syncWithAPI();
        return;
      } catch (error) {
        console.error("Erro ao marcar todas como lidas na API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    this.notifications.forEach((notification) => {
      notification.read = true;
    });
    this.saveNotifications();
    this.notifyListeners();
    this.notifyStatsListeners();
  }

  // Remover notificação
  async removeNotification(id: string) {
    if (this.apiAvailable) {
      try {
        await adminNotificationsAPI.deleteNotification(id);
        await this.syncWithAPI();
        return;
      } catch (error) {
        console.error("Erro ao remover notificação na API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    this.notifications = this.notifications.filter((n) => n.id !== id);
    this.saveNotifications();
    this.notifyListeners();
    this.notifyStatsListeners();
  }

  // Limpar todas
  async clearAll() {
    if (this.apiAvailable) {
      try {
        // Deletar todas as notificações via API
        const apiResult = await adminNotificationsAPI.getNotifications({
          limit: 1000,
        });
        await Promise.all(
          apiResult.data.map((notif) =>
            adminNotificationsAPI.deleteNotification(notif.id)
          )
        );
        await this.syncWithAPI();
        return;
      } catch (error) {
        console.error("Erro ao limpar notificações na API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    this.notifications = [];
    this.saveNotifications();
    this.notifyListeners();
    this.notifyStatsListeners();
  }

  // Obter notificações
  getNotifications(): AdminNotificationLocal[] {
    return [...this.notifications];
  }

  // Obter estatísticas
  async getStats(): Promise<NotificationStatsLocal> {
    if (this.apiAvailable) {
      try {
        const apiStats = await adminNotificationsAPI.getStats();
        return {
          total: apiStats.total,
          unread: apiStats.unread,
          byCategory: Object.fromEntries(
            apiStats.byCategory.map((item) => [item.category, item._count.id])
          ),
          byPriority: Object.fromEntries(
            apiStats.byPriority.map((item) => [item.priority, item._count.id])
          ),
        };
      } catch (error) {
        console.error("Erro ao obter estatísticas da API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    const total = this.notifications.length;
    const unread = this.notifications.filter((n) => !n.read).length;
    const byCategory: Record<string, number> = {};
    const byPriority: Record<string, number> = {};

    this.notifications.forEach((notification) => {
      byCategory[notification.category] =
        (byCategory[notification.category] || 0) + 1;
      byPriority[notification.priority] =
        (byPriority[notification.priority] || 0) + 1;
    });

    return { total, unread, byCategory, byPriority };
  }

  // Adicionar listener
  addListener(callback: (notifications: AdminNotificationLocal[]) => void) {
    this.listeners.push(callback);
    return () => {
      this.listeners = this.listeners.filter((cb) => cb !== callback);
    };
  }

  // Adicionar listener de estatísticas
  addStatsListener(callback: (stats: NotificationStatsLocal) => void) {
    this.statsListeners.push(callback);
    return () => {
      this.statsListeners = this.statsListeners.filter((cb) => cb !== callback);
    };
  }

  // Notificar listeners
  private notifyListeners() {
    this.listeners.forEach((callback) => callback([...this.notifications]));
  }

  // Notificar listeners de estatísticas
  private async notifyStatsListeners() {
    const stats = await this.getStats();
    this.statsListeners.forEach((callback) => callback(stats));
  }

  // Carregar notificações do localStorage
  private loadNotifications() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        this.notifications = JSON.parse(saved).map((n: any) => ({
          ...n,
          timestamp: new Date(n.timestamp),
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      this.notifications = [];
    }
  }

  // Salvar notificações no localStorage
  private saveNotifications() {
    try {
      localStorage.setItem(
        this.STORAGE_KEY,
        JSON.stringify(this.notifications)
      );
    } catch (error) {
      console.error("Erro ao salvar notificações:", error);
    }
  }

  // Simular notificações para teste
  simulateNotifications() {
    const notifications = [
      {
        title: "Sistema Online",
        message: "Todos os serviços estão funcionando normalmente",
        type: "success" as const,
        category: "system",
        priority: "low" as const,
      },
      {
        title: "Atualização Disponível",
        message: "Nova versão do sistema está disponível",
        type: "info" as const,
        category: "update",
        priority: "medium" as const,
      },
      {
        title: "Alerta de Segurança",
        message: "Tentativa de login suspeita detectada",
        type: "warning" as const,
        category: "security",
        priority: "high" as const,
      },
      {
        title: "Erro Crítico",
        message: "Falha no sistema de pagamentos",
        type: "error" as const,
        category: "payment",
        priority: "critical" as const,
      },
    ];

    notifications.forEach((notification) => {
      this.addNotification(notification);
    });
  }

  // Iniciar monitoramento
  startMonitoring() {
    if (this.intervalId) return;

    this.intervalId = setInterval(() => {
      // Verificar se há novas notificações da API
      if (this.apiAvailable) {
        this.syncWithAPI();
      }
    }, 30000); // Verificar a cada 30 segundos
  }

  // Parar monitoramento
  stopMonitoring() {
    if (this.intervalId) {
      clearInterval(this.intervalId);
      this.intervalId = null;
    }
  }
}

// Instância singleton
export const adminNotificationService = new AdminNotificationService();

// Hook para usar notificações
export const useAdminNotifications = () => {
  const [notifications, setNotifications] = React.useState<
    AdminNotificationLocal[]
  >(() => adminNotificationService.getNotifications());
  const [stats, setStats] = React.useState<NotificationStatsLocal>({
    total: 0,
    unread: 0,
    byCategory: {},
    byPriority: {},
  });

  React.useEffect(() => {
    // Adicionar listeners
    const unsubscribeNotifications =
      adminNotificationService.addListener(setNotifications);
    const unsubscribeStats =
      adminNotificationService.addStatsListener(setStats);

    return () => {
      unsubscribeNotifications();
      unsubscribeStats();
    };
  }, []);

  // Usar useMemo para evitar re-criação desnecessária das funções
  const actions = React.useMemo(
    () => ({
      markAsRead: (id: string) => adminNotificationService.markAsRead(id),
      markAllAsRead: () => adminNotificationService.markAllAsRead(),
      removeNotification: (id: string) =>
        adminNotificationService.removeNotification(id),
      clearAll: () => adminNotificationService.clearAll(),
      addNotification: (
        notification: Omit<AdminNotificationLocal, "id" | "timestamp" | "read">
      ) => adminNotificationService.addNotification(notification),
      simulateNotifications: () =>
        adminNotificationService.simulateNotifications(),
    }),
    []
  );

  return {
    notifications,
    stats,
    ...actions,
  };
};
