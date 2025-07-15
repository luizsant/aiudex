import { useState, useEffect } from "react";
import {
  templateSettingsAPI,
  TemplateSettings as APITemplateSettings,
} from "../lib/template-settings-api";

export interface TemplateSettings {
  defaultFont: string;
  fontSize: string;
  lineSpacing: string;
  paragraphSpacing: string;
  margins: string;
  jurisprudenceIndent: string;
  jurisprudenceFontSize: string;
  includeWatermark: boolean;
  firstLineIndent: string;
  numberedParagraphs: boolean;
  chapterNumbering: "none" | "integer" | "unit";
  // Configurações de Análise de Documentos
  defaultAnalysisType?: string;
  defaultDepth?: string;
  defaultOutputFormat?: string;
  defaultAIModel?: string;
  defaultAreas?: string[];
  // Dados do processo
  numero_processo?: string;
  vara?: string;
  comarca?: string;
  valor?: string;
  grau?: string;
  uf?: string;
  orgao_julgador?: string;
  classe?: string;
  assunto?: string;
  data_distribuicao?: string;
  polo_ativo?: string;
  polo_passivo?: string;
}

const defaultSettings: TemplateSettings = {
  defaultFont: "Times New Roman",
  fontSize: "12",
  lineSpacing: "1.5",
  paragraphSpacing: "1.0",
  margins: "2.5cm",
  jurisprudenceIndent: "4.0cm",
  jurisprudenceFontSize: "10",
  includeWatermark: false,
  firstLineIndent: "1.25cm",
  numberedParagraphs: false,
  chapterNumbering: "none",
  // Configurações de Análise de Documentos
  defaultAnalysisType: "completa",
  defaultDepth: "intermediaria",
  defaultOutputFormat: "estruturado",
  defaultAIModel: "gemini",
  defaultAreas: ["Civil", "Trabalhista"],
  // Dados do processo
  numero_processo: "",
  vara: "",
  comarca: "",
  valor: "",
  grau: "",
  uf: "",
  orgao_julgador: "",
  classe: "",
  assunto: "",
  data_distribuicao: "",
  polo_ativo: "",
  polo_passivo: "",
};

// Converter configurações da API para o formato local
const convertAPIToSettings = (
  apiSettings: APITemplateSettings
): Partial<TemplateSettings> => {
  return {
    defaultFont: apiSettings.defaultFont,
    fontSize: apiSettings.fontSize,
    lineSpacing: apiSettings.lineSpacing,
    margins: apiSettings.margins,
    paragraphSpacing: apiSettings.paragraphSpacing || "1.0",
    jurisprudenceIndent: apiSettings.jurisprudenceIndent || "4.0cm",
    jurisprudenceFontSize: apiSettings.jurisprudenceFontSize || "10",
    includeWatermark: apiSettings.includeWatermark,
    firstLineIndent: apiSettings.firstLineIndent || "1.25cm",
  };
};

// Converter configurações locais para o formato da API
const convertSettingsToAPI = (settings: TemplateSettings) => {
  return {
    defaultFont: settings.defaultFont,
    fontSize: settings.fontSize,
    lineSpacing: settings.lineSpacing,
    margins: settings.margins,
    paragraphSpacing: settings.paragraphSpacing,
    jurisprudenceIndent: settings.jurisprudenceIndent,
    jurisprudenceFontSize: settings.jurisprudenceFontSize,
    includeWatermark: settings.includeWatermark,
    firstLineIndent: settings.firstLineIndent,
  };
};

export const useTemplateSettings = () => {
  const [settings, setSettings] = useState<TemplateSettings>(defaultSettings);
  const [isLoaded, setIsLoaded] = useState(false);
  const [useAPI, setUseAPI] = useState(false);

  // Função para carregar configurações da API com fallback para localStorage
  const loadSettings = async () => {
    try {
      // Tentar carregar da API primeiro
      const apiSettings = await templateSettingsAPI.getSettings();
      const convertedSettings = convertAPIToSettings(apiSettings);
      setSettings({ ...defaultSettings, ...convertedSettings });
      setUseAPI(true);
      console.log("✅ Configurações carregadas da API");
    } catch (error) {
      console.log("⚠️ API não disponível, usando localStorage");
      // Fallback para localStorage
      const savedSettings = localStorage.getItem("legalai_template_settings");
      if (savedSettings) {
        try {
          const parsed = JSON.parse(savedSettings);
          setSettings({ ...defaultSettings, ...parsed });
        } catch (error) {
          console.error("Erro ao carregar configurações de template:", error);
        }
      }
      setUseAPI(false);
    }
  };

  // Carregar configurações na inicialização
  useEffect(() => {
    loadSettings().finally(() => setIsLoaded(true));
  }, []);

  // Escutar mudanças no localStorage e eventos customizados
  useEffect(() => {
    const handleStorageChange = (e: StorageEvent) => {
      if (e.key === "legalai_template_settings" && !useAPI) {
        loadSettings();
      }
    };

    const handleCustomEvent = () => {
      if (!useAPI) {
        loadSettings();
      }
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("templateSettingsChanged", handleCustomEvent);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("templateSettingsChanged", handleCustomEvent);
    };
  }, [useAPI]);

  // Salvar configurações (API com fallback para localStorage)
  const saveSettings = async (newSettings: TemplateSettings) => {
    try {
      if (useAPI) {
        // Salvar na API
        const apiData = convertSettingsToAPI(newSettings);
        await templateSettingsAPI.updateSettings(apiData);
        console.log("✅ Configurações salvas na API");
      } else {
        // Fallback para localStorage
        localStorage.setItem(
          "legalai_template_settings",
          JSON.stringify(newSettings)
        );
        console.log("✅ Configurações salvas no localStorage");
      }

      setSettings(newSettings);

      // Disparar evento customizado para sincronizar outros componentes
      window.dispatchEvent(new CustomEvent("templateSettingsChanged"));

      return true;
    } catch (error) {
      console.error("Erro ao salvar configurações de template:", error);

      // Se falhou na API, tentar localStorage como fallback
      if (useAPI) {
        try {
          localStorage.setItem(
            "legalai_template_settings",
            JSON.stringify(newSettings)
          );
          setUseAPI(false);
          console.log("⚠️ Fallback para localStorage após erro na API");
          return true;
        } catch (localError) {
          console.error("Erro no fallback localStorage:", localError);
        }
      }

      return false;
    }
  };

  // Atualizar uma configuração específica
  const updateSetting = async (
    key: keyof TemplateSettings,
    value: string | boolean | string[]
  ) => {
    const newSettings = { ...settings, [key]: value };
    setSettings(newSettings);

    try {
      if (useAPI) {
        // Atualizar na API
        const apiData = convertSettingsToAPI(newSettings);
        await templateSettingsAPI.updateSettings(apiData);
        console.log("✅ Configuração atualizada na API");
      } else {
        // Fallback para localStorage
        localStorage.setItem(
          "legalai_template_settings",
          JSON.stringify(newSettings)
        );
        console.log("✅ Configuração atualizada no localStorage");
      }

      // Disparar evento customizado para sincronizar outros componentes
      window.dispatchEvent(new CustomEvent("templateSettingsChanged"));
    } catch (error) {
      console.error("Erro ao atualizar configuração:", error);

      // Se falhou na API, tentar localStorage como fallback
      if (useAPI) {
        try {
          localStorage.setItem(
            "legalai_template_settings",
            JSON.stringify(newSettings)
          );
          setUseAPI(false);
          console.log("⚠️ Fallback para localStorage após erro na API");
        } catch (localError) {
          console.error("Erro no fallback localStorage:", localError);
        }
      }
    }
  };

  // Obter estilos CSS para aplicar nas configurações
  const getDocumentStyles = () => {
    return {
      fontFamily: settings.defaultFont,
      fontSize: `${settings.fontSize}pt`,
      lineHeight: settings.lineSpacing,
      margin: settings.margins,
      paragraphSpacing: settings.paragraphSpacing,
      jurisprudenceIndent: settings.jurisprudenceIndent,
      jurisprudenceFontSize: settings.jurisprudenceFontSize,
      firstLineIndent: settings.firstLineIndent,
    };
  };

  // Obter configurações para exportação DOCX
  const getDocxConfig = () => {
    return {
      font: settings.defaultFont,
      fontSize: parseInt(settings.fontSize),
      lineSpacing: parseFloat(settings.lineSpacing),
      margins: {
        top: parseFloat(settings.margins.replace("cm", "")),
        bottom: parseFloat(settings.margins.replace("cm", "")),
        left: parseFloat(settings.margins.replace("cm", "")),
        right: parseFloat(settings.margins.replace("cm", "")),
      },
      includeWatermark: settings.includeWatermark,
    };
  };

  return {
    settings,
    isLoaded,
    saveSettings,
    updateSetting,
    getDocumentStyles,
    getDocxConfig,
    useAPI, // Expor se está usando API ou localStorage
  };
};
