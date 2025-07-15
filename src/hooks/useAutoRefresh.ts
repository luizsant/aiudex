import { useEffect, useRef, useState } from "react";

interface UseAutoRefreshOptions {
  interval?: number; // Intervalo em milissegundos (padrão: 30000 = 30 segundos)
  enabled?: boolean; // Se o auto-refresh está ativo (padrão: true)
  onRefresh: () => void | Promise<void>; // Função a ser executada no refresh
}

export const useAutoRefresh = ({
  interval = 30000,
  enabled = true,
  onRefresh,
}: UseAutoRefreshOptions) => {
  const [isRefreshing, setIsRefreshing] = useState(false);
  const [lastRefresh, setLastRefresh] = useState<Date | null>(null);
  const intervalRef = useRef<NodeJS.Timeout | null>(null);
  const [isEnabled, setIsEnabled] = useState(enabled);

  // Função para executar refresh manualmente
  const refresh = async () => {
    if (isRefreshing) return;

    setIsRefreshing(true);
    try {
      await onRefresh();
      setLastRefresh(new Date());
    } catch (error) {
      console.error("Erro durante auto-refresh:", error);
    } finally {
      setIsRefreshing(false);
    }
  };

  // Função para ativar/desativar auto-refresh
  const toggleAutoRefresh = () => {
    setIsEnabled(!isEnabled);
  };

  // Função para parar auto-refresh
  const stopAutoRefresh = () => {
    setIsEnabled(false);
  };

  // Função para iniciar auto-refresh
  const startAutoRefresh = () => {
    setIsEnabled(true);
  };

  // Effect para gerenciar o intervalo
  useEffect(() => {
    if (isEnabled && interval > 0) {
      intervalRef.current = setInterval(refresh, interval);
    } else {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    }

    // Cleanup
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, [isEnabled, interval]);

  // Cleanup no unmount
  useEffect(() => {
    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
      }
    };
  }, []);

  return {
    isRefreshing,
    lastRefresh,
    isEnabled,
    refresh,
    toggleAutoRefresh,
    stopAutoRefresh,
    startAutoRefresh,
  };
};
