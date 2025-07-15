import { useState, useEffect, useCallback } from "react";
import { adminNotificationService } from "@/lib/admin-notifications";

export interface RealTimeNotificationConfig {
  enabled: boolean;
  checkInterval: number; // em milissegundos
  enabledCategories: string[];
  minPriority: "low" | "medium" | "high" | "critical";
  enableSounds: boolean;
  enableDesktopNotifications: boolean;
}

const DEFAULT_CONFIG: RealTimeNotificationConfig = {
  enabled: true,
  checkInterval: 30000, // 30 segundos
  enabledCategories: ["user", "financial", "system", "security", "performance"],
  minPriority: "medium",
  enableSounds: true,
  enableDesktopNotifications: true,
};

export const useRealTimeNotifications = () => {
  const [config, setConfig] =
    useState<RealTimeNotificationConfig>(DEFAULT_CONFIG);
  const [isPermissionGranted, setIsPermissionGranted] = useState(false);
  const [lastCheck, setLastCheck] = useState<Date>(new Date());

  // Verificar permissão para notificações desktop
  useEffect(() => {
    if ("Notification" in window) {
      if (Notification.permission === "granted") {
        setIsPermissionGranted(true);
      } else if (Notification.permission === "default") {
        // Solicitar permissão automaticamente
        requestNotificationPermission();
      }
    }
  }, []);

  // Solicitar permissão para notificações
  const requestNotificationPermission = useCallback(async () => {
    if ("Notification" in window) {
      const permission = await Notification.requestPermission();
      setIsPermissionGranted(permission === "granted");
      return permission === "granted";
    }
    return false;
  }, []);

  // Reproduzir som de notificação
  const playNotificationSound = useCallback(() => {
    if (!config.enableSounds) return;

    try {
      // Criar um som simples usando Web Audio API
      const audioContext = new (window.AudioContext ||
        (window as any).webkitAudioContext)();
      const oscillator = audioContext.createOscillator();
      const gainNode = audioContext.createGain();

      oscillator.connect(gainNode);
      gainNode.connect(audioContext.destination);

      oscillator.frequency.value = 800;
      oscillator.type = "sine";

      gainNode.gain.setValueAtTime(0.1, audioContext.currentTime);
      gainNode.gain.exponentialRampToValueAtTime(
        0.01,
        audioContext.currentTime + 0.3
      );

      oscillator.start(audioContext.currentTime);
      oscillator.stop(audioContext.currentTime + 0.3);
    } catch (error) {
      console.warn("Erro ao reproduzir som de notificação:", error);
    }
  }, [config.enableSounds]);

  // Mostrar notificação desktop
  const showDesktopNotification = useCallback(
    (title: string, message: string, icon?: string) => {
      if (!config.enableDesktopNotifications || !isPermissionGranted) return;

      try {
        const notification = new Notification(title, {
          body: message,
          icon: icon || "/favicon.ico",
          badge: "/favicon.ico",
          tag: "admin-notification",
          requireInteraction: true,
        });

        notification.onclick = () => {
          window.focus();
          notification.close();
        };

        // Auto-close após 5 segundos
        setTimeout(() => {
          notification.close();
        }, 5000);
      } catch (error) {
        console.warn("Erro ao mostrar notificação desktop:", error);
      }
    },
    [config.enableDesktopNotifications, isPermissionGranted]
  );

  // Verificar se deve processar notificação baseado na configuração
  const shouldProcessNotification = useCallback(
    (category: string, priority: string) => {
      if (!config.enabled) return false;
      if (!config.enabledCategories.includes(category)) return false;

      const priorityLevels = ["low", "medium", "high", "critical"];
      const minPriorityIndex = priorityLevels.indexOf(config.minPriority);
      const notificationPriorityIndex = priorityLevels.indexOf(priority);

      return notificationPriorityIndex >= minPriorityIndex;
    },
    [config]
  );

  // Processar nova notificação
  const processNotification = useCallback(
    (notification: any) => {
      if (
        !shouldProcessNotification(notification.category, notification.priority)
      ) {
        return;
      }

      // Reproduzir som
      playNotificationSound();

      // Mostrar notificação desktop
      showDesktopNotification(notification.title, notification.message);

      // Atualizar timestamp da última verificação
      setLastCheck(new Date());
    },
    [shouldProcessNotification, playNotificationSound, showDesktopNotification]
  );

  // Simular eventos em tempo real
  const simulateRealTimeEvents = useCallback(() => {
    const events = [
      {
        type: "user_registered",
        category: "user",
        priority: "medium",
        title: "Novo Usuário",
        message: "Um novo usuário se registrou na plataforma",
      },
      {
        type: "high_credit_usage",
        category: "performance",
        priority: "high",
        title: "Alto Uso de Créditos",
        message: "Usuário excedeu limite de créditos por hora",
      },
      {
        type: "payment_received",
        category: "financial",
        priority: "medium",
        title: "Pagamento Recebido",
        message: "Novo pagamento de plano Pro processado",
      },
      {
        type: "security_alert",
        category: "security",
        priority: "critical",
        title: "Alerta de Segurança",
        message: "Múltiplas tentativas de login falharam",
      },
      {
        type: "system_error",
        category: "system",
        priority: "high",
        title: "Erro do Sistema",
        message: "Falha na geração de documentos",
      },
    ];

    // Simular evento aleatório
    const randomEvent = events[Math.floor(Math.random() * events.length)];

    adminNotificationService.addNotification({
      type:
        randomEvent.priority === "critical"
          ? "error"
          : randomEvent.priority === "high"
          ? "warning"
          : "info",
      category: randomEvent.category as any,
      title: randomEvent.title,
      message: randomEvent.message,
      priority: randomEvent.priority as any,
      actionUrl: "/admin",
      actionLabel: "Ver Dashboard",
    });
  }, []);

  // Iniciar monitoramento automático
  useEffect(() => {
    if (!config.enabled) return;

    const interval = setInterval(() => {
      // Verificar se há novas notificações
      const notifications = adminNotificationService.getNotifications();
      const newNotifications = notifications.filter(
        (n) => n.timestamp > lastCheck && !n.read
      );

      newNotifications.forEach(processNotification);

      // Simular eventos ocasionalmente (apenas em desenvolvimento)
      if (Math.random() < 0.1) {
        // 10% de chance
        simulateRealTimeEvents();
      }
    }, config.checkInterval);

    return () => clearInterval(interval);
  }, [config, lastCheck, processNotification, simulateRealTimeEvents]);

  // Atualizar configuração
  const updateConfig = useCallback(
    (newConfig: Partial<RealTimeNotificationConfig>) => {
      setConfig((prev) => ({ ...prev, ...newConfig }));
    },
    []
  );

  // Testar notificação
  const testNotification = useCallback(() => {
    const testNotif = {
      type: "info" as const,
      category: "system" as const,
      title: "Teste de Notificação",
      message: "Esta é uma notificação de teste do sistema",
      priority: "medium" as const,
    };

    adminNotificationService.addNotification(testNotif);
    processNotification(testNotif);
  }, [processNotification]);

  // Obter status da conectividade
  const getConnectionStatus = useCallback(() => {
    return {
      isOnline: navigator.onLine,
      lastCheck: lastCheck,
      nextCheck: new Date(lastCheck.getTime() + config.checkInterval),
      isEnabled: config.enabled,
      hasPermission: isPermissionGranted,
    };
  }, [lastCheck, config.checkInterval, config.enabled, isPermissionGranted]);

  return {
    config,
    updateConfig,
    isPermissionGranted,
    requestNotificationPermission,
    testNotification,
    simulateRealTimeEvents,
    getConnectionStatus,
    playNotificationSound,
    showDesktopNotification,
  };
};
