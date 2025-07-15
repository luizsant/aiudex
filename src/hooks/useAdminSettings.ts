import { useState, useEffect } from "react";

export interface AdminSettings {
  autoRefreshInterval: number; // em milissegundos
  autoRefreshEnabled: boolean;
  dateRange: {
    from: Date;
    to: Date;
  };
  defaultView:
    | "gestao"
    | "comercial"
    | "marketing"
    | "relatorios"
    | "operacoes"
    | "seguranca"
    | "ia";
  showNotifications: boolean;
  exportFormat: "csv" | "excel" | "pdf";
  theme: "light" | "dark" | "auto";
  itemsPerPage: 10 | 25 | 50 | 100;
  compactMode: boolean;
}

const DEFAULT_SETTINGS: AdminSettings = {
  autoRefreshInterval: 30000, // 30 segundos
  autoRefreshEnabled: true,
  dateRange: {
    from: new Date(new Date().getFullYear(), new Date().getMonth() - 1, 1),
    to: new Date(),
  },
  defaultView: "gestao",
  showNotifications: true,
  exportFormat: "csv",
  theme: "light",
  itemsPerPage: 25,
  compactMode: false,
};

const STORAGE_KEY = "admin_dashboard_settings";

export const useAdminSettings = () => {
  const [settings, setSettings] = useState<AdminSettings>(DEFAULT_SETTINGS);
  const [isLoading, setIsLoading] = useState(true);

  // Carregar configurações do localStorage
  useEffect(() => {
    try {
      const saved = localStorage.getItem(STORAGE_KEY);
      if (saved) {
        const parsedSettings = JSON.parse(saved);
        // Converter strings de data de volta para objetos Date
        if (parsedSettings.dateRange) {
          parsedSettings.dateRange.from = new Date(
            parsedSettings.dateRange.from
          );
          parsedSettings.dateRange.to = new Date(parsedSettings.dateRange.to);
        }
        setSettings({ ...DEFAULT_SETTINGS, ...parsedSettings });
      }
    } catch (error) {
      console.error("Erro ao carregar configurações do admin:", error);
    } finally {
      setIsLoading(false);
    }
  }, []);

  // Salvar configurações no localStorage
  const saveSettings = (newSettings: Partial<AdminSettings>) => {
    const updatedSettings = { ...settings, ...newSettings };
    setSettings(updatedSettings);

    try {
      localStorage.setItem(STORAGE_KEY, JSON.stringify(updatedSettings));
    } catch (error) {
      console.error("Erro ao salvar configurações do admin:", error);
    }
  };

  // Atualizar configuração específica
  const updateSetting = <K extends keyof AdminSettings>(
    key: K,
    value: AdminSettings[K]
  ) => {
    saveSettings({ [key]: value });
  };

  // Resetar para configurações padrão
  const resetSettings = () => {
    setSettings(DEFAULT_SETTINGS);
    localStorage.removeItem(STORAGE_KEY);
  };

  // Exportar configurações
  const exportSettings = () => {
    const dataStr = JSON.stringify(settings, null, 2);
    const blob = new Blob([dataStr], { type: "application/json" });
    const url = URL.createObjectURL(blob);
    const link = document.createElement("a");
    link.href = url;
    link.download = `admin_settings_${
      new Date().toISOString().split("T")[0]
    }.json`;
    link.click();
    URL.revokeObjectURL(url);
  };

  // Importar configurações
  const importSettings = (file: File): Promise<void> => {
    return new Promise((resolve, reject) => {
      const reader = new FileReader();
      reader.onload = (e) => {
        try {
          const imported = JSON.parse(e.target?.result as string);
          // Validar estrutura básica
          if (imported && typeof imported === "object") {
            // Converter strings de data
            if (imported.dateRange) {
              imported.dateRange.from = new Date(imported.dateRange.from);
              imported.dateRange.to = new Date(imported.dateRange.to);
            }
            saveSettings(imported);
            resolve();
          } else {
            reject(new Error("Formato de arquivo inválido"));
          }
        } catch (error) {
          reject(new Error("Erro ao processar arquivo"));
        }
      };
      reader.onerror = () => reject(new Error("Erro ao ler arquivo"));
      reader.readAsText(file);
    });
  };

  // Obter intervalo de auto-refresh formatado
  const getFormattedInterval = () => {
    const seconds = settings.autoRefreshInterval / 1000;
    if (seconds < 60) {
      return `${seconds}s`;
    } else {
      const minutes = Math.floor(seconds / 60);
      return `${minutes}m`;
    }
  };

  return {
    settings,
    isLoading,
    saveSettings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    getFormattedInterval,
  };
};
