import {
  settingsAPI,
  SystemSetting,
  CreateSettingData,
  UpdateSettingData,
} from "./settings-api";

export interface HeaderSettings {
  title: string;
  subtitle?: string;
  logo?: string;
  showCredits: boolean;
  showNotifications: boolean;
  showUserMenu: boolean;
  backgroundColor?: string;
  textColor?: string;
}

export interface FooterSettings {
  text: string;
  links?: Array<{
    label: string;
    url: string;
  }>;
  showSocialMedia: boolean;
  socialMedia?: Array<{
    platform: string;
    url: string;
    icon: string;
  }>;
  backgroundColor?: string;
  textColor?: string;
}

export interface LogoSettings {
  url: string;
  alt: string;
  width?: number;
  height?: number;
  darkModeUrl?: string;
  lightModeUrl?: string;
}

export interface ThemeSettings {
  primaryColor: string;
  secondaryColor: string;
  accentColor: string;
  backgroundColor: string;
  textColor: string;
  borderRadius: string;
  fontFamily: string;
  fontSize: string;
}

export interface OfficeSettings {
  name: string;
  lawyerName: string;
  oabNumber: string;
  oabState: string;
  phone: string;
  email: string;
  website?: string;
  address: string;
  cnpj?: string;
}

class SystemSettingsService {
  private settings: Map<string, SystemSetting> = new Map();
  private readonly STORAGE_KEY = "system_settings";
  private apiAvailable = true;

  constructor() {
    this.loadSettings();
    this.checkAPIHealth();
  }

  private async checkAPIHealth() {
    try {
      this.apiAvailable = await settingsAPI.checkAPIHealth();
      if (this.apiAvailable) {
        await this.syncWithAPI();
      }
    } catch (error) {
      this.apiAvailable = false;
      console.log("API de configurações não disponível, usando localStorage");
    }
  }

  private async syncWithAPI() {
    try {
      const apiSettings = await settingsAPI.getSettings();

      // Converter para Map
      this.settings.clear();
      apiSettings.forEach((setting) => {
        this.settings.set(setting.key, setting);
      });

      this.saveSettings();
    } catch (error) {
      console.error("Erro ao sincronizar com API:", error);
    }
  }

  // Carregar configurações do localStorage
  private loadSettings() {
    try {
      const saved = localStorage.getItem(this.STORAGE_KEY);
      if (saved) {
        const parsed = JSON.parse(saved);
        this.settings = new Map(Object.entries(parsed));
      }
    } catch (error) {
      console.error("Erro ao carregar configurações:", error);
    }
  }

  // Salvar configurações no localStorage
  private saveSettings() {
    try {
      const settingsObj = Object.fromEntries(this.settings);
      localStorage.setItem(this.STORAGE_KEY, JSON.stringify(settingsObj));
    } catch (error) {
      console.error("Erro ao salvar configurações:", error);
    }
  }

  // Obter configuração
  async getSetting(key: string): Promise<any> {
    // Tentar buscar da API primeiro
    if (this.apiAvailable) {
      try {
        const setting = await settingsAPI.getSetting(key);
        this.settings.set(key, setting);
        this.saveSettings();
        return setting.value;
      } catch (error) {
        console.error("Erro ao buscar configuração da API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    const setting = this.settings.get(key);
    return setting ? setting.value : null;
  }

  // Definir configuração
  async setSetting(
    key: string,
    value: any,
    description?: string,
    isPublic: boolean = false
  ): Promise<void> {
    // Tentar salvar na API primeiro
    if (this.apiAvailable) {
      try {
        const data: CreateSettingData = {
          key,
          value,
          description,
          isPublic,
        };

        await settingsAPI.createSetting(data);
        await this.syncWithAPI();
        return;
      } catch (error) {
        console.error("Erro ao salvar configuração na API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    const setting: SystemSetting = {
      id: `local_${Date.now()}`,
      key,
      value,
      description,
      isPublic,
      createdAt: new Date().toISOString(),
      updatedAt: new Date().toISOString(),
    };

    this.settings.set(key, setting);
    this.saveSettings();
  }

  // Atualizar configuração
  async updateSetting(
    key: string,
    value: any,
    description?: string,
    isPublic?: boolean
  ): Promise<void> {
    // Tentar atualizar na API primeiro
    if (this.apiAvailable) {
      try {
        const data: UpdateSettingData = {
          value,
          description,
          isPublic,
        };

        await settingsAPI.updateSetting(key, data);
        await this.syncWithAPI();
        return;
      } catch (error) {
        console.error("Erro ao atualizar configuração na API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    const existingSetting = this.settings.get(key);
    if (existingSetting) {
      existingSetting.value = value;
      if (description !== undefined) existingSetting.description = description;
      if (isPublic !== undefined) existingSetting.isPublic = isPublic;
      existingSetting.updatedAt = new Date().toISOString();
      this.saveSettings();
    }
  }

  // Excluir configuração
  async deleteSetting(key: string): Promise<void> {
    // Tentar excluir da API primeiro
    if (this.apiAvailable) {
      try {
        await settingsAPI.deleteSetting(key);
        await this.syncWithAPI();
        return;
      } catch (error) {
        console.error("Erro ao excluir configuração da API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    this.settings.delete(key);
    this.saveSettings();
  }

  // Obter configurações do header
  async getHeaderSettings(): Promise<HeaderSettings> {
    const defaultSettings: HeaderSettings = {
      title: "AIudex",
      subtitle: "Assistente Jurídico Inteligente",
      showCredits: true,
      showNotifications: true,
      showUserMenu: true,
    };

    try {
      const headerSettings = await settingsAPI.getHeaderSettings();
      const settings: HeaderSettings = { ...defaultSettings };

      headerSettings.forEach((setting) => {
        const key = setting.key.replace("header_", "");
        (settings as any)[key] = setting.value;
      });

      return settings;
    } catch (error) {
      console.error("Erro ao carregar configurações do header:", error);
      return defaultSettings;
    }
  }

  // Obter configurações do footer
  async getFooterSettings(): Promise<FooterSettings> {
    const defaultSettings: FooterSettings = {
      text: "© 2024 AIudex. Todos os direitos reservados.",
      showSocialMedia: false,
    };

    try {
      const footerSettings = await settingsAPI.getFooterSettings();
      const settings: FooterSettings = { ...defaultSettings };

      footerSettings.forEach((setting) => {
        const key = setting.key.replace("footer_", "");
        (settings as any)[key] = setting.value;
      });

      return settings;
    } catch (error) {
      console.error("Erro ao carregar configurações do footer:", error);
      return defaultSettings;
    }
  }

  // Obter configurações do logo
  async getLogoSettings(): Promise<LogoSettings> {
    const defaultSettings: LogoSettings = {
      url: "/logo.svg",
      alt: "AIudex Logo",
      width: 120,
      height: 40,
    };

    try {
      const logoSettings = await settingsAPI.getLogoSettings();
      const settings: LogoSettings = { ...defaultSettings };

      logoSettings.forEach((setting) => {
        const key = setting.key.replace("logo_", "");
        (settings as any)[key] = setting.value;
      });

      return settings;
    } catch (error) {
      console.error("Erro ao carregar configurações do logo:", error);
      return defaultSettings;
    }
  }

  // Obter configurações do tema
  async getThemeSettings(): Promise<ThemeSettings> {
    const defaultSettings: ThemeSettings = {
      primaryColor: "#3b82f6",
      secondaryColor: "#1e40af",
      accentColor: "#f59e0b",
      backgroundColor: "#ffffff",
      textColor: "#1f2937",
      borderRadius: "0.5rem",
      fontFamily: "Inter, sans-serif",
      fontSize: "14px",
    };

    try {
      const themeSettings = await settingsAPI.getThemeSettings();
      const settings: ThemeSettings = { ...defaultSettings };

      themeSettings.forEach((setting) => {
        const key = setting.key.replace("theme_", "");
        (settings as any)[key] = setting.value;
      });

      return settings;
    } catch (error) {
      console.error("Erro ao carregar configurações do tema:", error);
      return defaultSettings;
    }
  }

  // Obter configurações do escritório
  async getOfficeSettings(): Promise<OfficeSettings> {
    const defaultSettings: OfficeSettings = {
      name: "Escritório de Advocacia",
      lawyerName: "Dr. João Silva",
      oabNumber: "123456",
      oabState: "SP",
      phone: "(11) 99999-9999",
      email: "contato@escritorio.com",
      address: "Rua das Flores, 123 - Centro, São Paulo/SP",
    };

    try {
      const officeSettings = await settingsAPI.getOfficeSettings();
      const settings: OfficeSettings = { ...defaultSettings };

      officeSettings.forEach((setting) => {
        const key = setting.key.replace("office_", "");
        (settings as any)[key] = setting.value;
      });

      return settings;
    } catch (error) {
      console.error("Erro ao carregar configurações do escritório:", error);
      return defaultSettings;
    }
  }

  // Salvar configurações do header
  async saveHeaderSettings(settings: Partial<HeaderSettings>): Promise<void> {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.setSetting(
        `header_${key}`,
        value,
        `Configuração do header: ${key}`,
        true
      )
    );

    await Promise.all(promises);
  }

  // Salvar configurações do footer
  async saveFooterSettings(settings: Partial<FooterSettings>): Promise<void> {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.setSetting(
        `footer_${key}`,
        value,
        `Configuração do footer: ${key}`,
        true
      )
    );

    await Promise.all(promises);
  }

  // Salvar configurações do logo
  async saveLogoSettings(settings: Partial<LogoSettings>): Promise<void> {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.setSetting(
        `logo_${key}`,
        value,
        `Configuração do logo: ${key}`,
        true
      )
    );

    await Promise.all(promises);
  }

  // Salvar configurações do tema
  async saveThemeSettings(settings: Partial<ThemeSettings>): Promise<void> {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.setSetting(
        `theme_${key}`,
        value,
        `Configuração do tema: ${key}`,
        true
      )
    );

    await Promise.all(promises);
  }

  // Salvar configurações do escritório
  async saveOfficeSettings(settings: Partial<OfficeSettings>): Promise<void> {
    const promises = Object.entries(settings).map(([key, value]) =>
      this.setSetting(
        `office_${key}`,
        value,
        `Configuração do escritório: ${key}`,
        true
      )
    );

    await Promise.all(promises);
  }

  // Obter todas as configurações
  async getAllSettings(): Promise<SystemSetting[]> {
    if (this.apiAvailable) {
      try {
        const settings = await settingsAPI.getSettings();
        return settings;
      } catch (error) {
        console.error("Erro ao buscar configurações da API:", error);
        this.apiAvailable = false;
      }
    }

    // Fallback para localStorage
    return Array.from(this.settings.values());
  }

  // Limpar configurações antigas
  cleanupOldSettings(daysOld: number = 30) {
    const cutoffDate = new Date();
    cutoffDate.setDate(cutoffDate.getDate() - daysOld);

    const oldSettings = Array.from(this.settings.entries()).filter(
      ([_, setting]) => {
        const settingDate = new Date(setting.createdAt);
        return settingDate < cutoffDate;
      }
    );

    oldSettings.forEach(([key, _]) => {
      this.settings.delete(key);
    });

    this.saveSettings();
  }
}

// Instância singleton
export const systemSettingsService = new SystemSettingsService();
