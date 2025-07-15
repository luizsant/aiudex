import { useState, useCallback } from "react";
import { toast } from "sonner";

interface Notification {
  id: string;
  type: "success" | "error" | "warning" | "info";
  title: string;
  message?: string;
  duration?: number;
}

export const useNotifications = () => {
  const [notifications, setNotifications] = useState<Notification[]>([]);

  const showNotification = useCallback(
    (
      type: Notification["type"],
      title: string,
      message?: string,
      duration?: number
    ) => {
      const id = Date.now().toString();
      const notification: Notification = {
        id,
        type,
        title,
        message,
        duration,
      };

      setNotifications((prev) => [...prev, notification]);

      // Auto-remove notification after duration
      if (duration) {
        setTimeout(() => {
          removeNotification(id);
        }, duration);
      }

      return id;
    },
    []
  );

  const removeNotification = useCallback((id: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== id));
  }, []);

  const clearAllNotifications = useCallback(() => {
    setNotifications([]);
  }, []);

  // Convenience methods
  const success = useCallback(
    (title: string, message?: string) => {
      toast.success(title, { description: message });
      return showNotification("success", title, message, 5000);
    },
    [showNotification]
  );

  const error = useCallback(
    (title: string, message?: string) => {
      toast.error(title, { description: message });
      return showNotification("error", title, message, 7000);
    },
    [showNotification]
  );

  const warning = useCallback(
    (title: string, message?: string) => {
      toast.warning(title, { description: message });
      return showNotification("warning", title, message, 6000);
    },
    [showNotification]
  );

  const info = useCallback(
    (title: string, message?: string) => {
      toast.info(title, { description: message });
      return showNotification("info", title, message, 5000);
    },
    [showNotification]
  );

  return {
    notifications,
    showNotification,
    removeNotification,
    clearAllNotifications,
    success,
    error,
    warning,
    info,
  };
};
