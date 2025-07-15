// Configuração da API - usando URLs relativas
function getApiBaseUrl(): string {
  // Em desenvolvimento, usar URL relativa
  if (process.env.NODE_ENV === "development") {
    return "";
  }
  // Em produção, usar a URL da API
  if (!process.env.NEXT_PUBLIC_API_URL) {
    throw new Error(
      "NEXT_PUBLIC_API_URL não definida! Configure a variável de ambiente no Vercel."
    );
  }
  return process.env.NEXT_PUBLIC_API_URL;
}

// Configuração do Toolkit Server
function getToolkitBaseUrl(): string {
  // Em desenvolvimento, usar o servidor local do toolkit
  if (process.env.NODE_ENV === "development") {
    return "http://localhost:3003";
  }
  // Em produção, usar a API consolidada através do nginx
  return getApiBaseUrl();
}

export const API_CONFIG = {
  // URL base da API - será diferente em desenvolvimento e produção
  BASE_URL: getApiBaseUrl(),

  // Endpoints específicos - todos agora usam a API consolidada
  ENDPOINTS: {
    TOOLKIT: "/api/toolkit",
  },
};

// Configuração do Toolkit
export const TOOLKIT_CONFIG = {
  BASE_URL: getToolkitBaseUrl(),
  ENDPOINTS: {
    UPLOAD: "/api/toolkit/upload",
  },
};

// Helper para construir URLs completas da API
export function buildApiUrl(endpoint: string): string {
  return `${API_CONFIG.BASE_URL}${endpoint}`;
}

// Helper para construir URLs do toolkit
export function buildToolkitUrl(endpoint: string): string {
  return `${TOOLKIT_CONFIG.BASE_URL}${endpoint}`;
}
