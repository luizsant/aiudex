"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";
import {
  CustomError,
  ErrorCodes,
  handleError,
  showErrorToast,
} from "@/lib/error-handler";
import { creditsService } from "@/lib/credits-service";
import { buildApiUrl } from "@/lib/config";

interface User {
  id: string;
  name: string;
  email: string;
  cpf?: string;
  phone?: string;
  address?: string;
  oabNumber?: string;
  firm?: string;
  role: string;
  planId: string;
  status: string;
  createdAt: string;
  updatedAt: string;
  lastLogin?: string;
  plan?: {
    id: string;
    name: string;
    price: number;
    credits: number;
    features: string[];
  };
  subscription?: {
    id: string;
    status: string;
    startDate: string;
    endDate: string;
    stripeSubscriptionId?: string;
  };
}

interface RegisterData {
  name: string;
  email: string;
  password: string;
  cpf?: string;
  phone?: string;
  address?: string;
}

interface AuthContextType {
  user: User | null;
  login: (email: string, password: string) => Promise<void>;
  register: (userData: RegisterData) => Promise<void>;
  logout: () => void;
  refreshToken: () => Promise<boolean>;
  ensureValidToken: () => Promise<string | null>;
  isAuthenticated: boolean;
  isLoading: boolean;
  isInitialized: boolean;
  error: string | null;
  errorType:
    | "user_not_found"
    | "invalid_credentials"
    | "network"
    | "validation"
    | null;
}

const AuthContext = createContext<AuthContextType | undefined>(undefined);

export const useAuth = () => {
  const context = useContext(AuthContext);
  if (context === undefined) {
    throw new Error("useAuth must be used within an AuthProvider");
  }
  return context;
};

const validateEmail = (email: string): boolean => {
  if (!email || typeof email !== "string") {
    return false;
  }
  const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
  return emailRegex.test(email);
};

const validatePassword = (password: string): boolean => {
  return password.length >= 6;
};

// Função para decodificar JWT (sem verificar assinatura)
const decodeJWT = (token: string): any => {
  try {
    // Verificar se o token tem o formato correto (3 partes separadas por ponto)
    if (!token || typeof token !== "string" || !token.includes(".")) {
      console.error("❌ [FRONTEND] Token inválido ou malformado");
      return null;
    }

    const parts = token.split(".");
    if (parts.length !== 3) {
      console.error("❌ [FRONTEND] Token não tem formato JWT válido");
      return null;
    }

    const base64Url = parts[1];
    const base64 = base64Url.replace(/-/g, "+").replace(/_/g, "/");
    const jsonPayload = decodeURIComponent(
      atob(base64)
        .split("")
        .map(function (c) {
          return "%" + ("00" + c.charCodeAt(0).toString(16)).slice(-2);
        })
        .join("")
    );
    return JSON.parse(jsonPayload);
  } catch (error) {
    console.error("❌ [FRONTEND] Erro ao decodificar JWT:", error);
    return null;
  }
};

// Função para verificar se o token está próximo de expirar (5 minutos antes)
const isTokenExpiringSoon = (token: string): boolean => {
  if (!token || typeof token !== "string") {
    console.error("❌ [FRONTEND] Token inválido para verificação de expiração");
    return true;
  }

  const decoded = decodeJWT(token);
  if (!decoded || !decoded.exp) return true;

  const expirationTime = decoded.exp * 1000; // Converter para milissegundos
  const currentTime = Date.now();
  const fiveMinutes = 5 * 60 * 1000; // 5 minutos em milissegundos

  return expirationTime - currentTime < fiveMinutes;
};

// Função para fazer refresh do token
const refreshAuthToken = async (
  refreshToken: string
): Promise<{ success: boolean; token?: string; user?: User }> => {
  console.log("🔄 [FRONTEND] Iniciando refresh do token...");
  try {
    const response = await fetch(buildApiUrl("/api/auth/refresh"), {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify({ refreshToken }),
    });

    console.log(
      "🔄 [FRONTEND] Resposta do refresh:",
      response.status,
      response.statusText
    );

    if (response.ok) {
      const data = await response.json();
      console.log("✅ [FRONTEND] Refresh bem-sucedido:", data);
      return {
        success: true,
        token: data.token,
        user: data.user,
      };
    } else {
      const errorData = await response.json().catch(() => ({}));
      console.error(
        "❌ [FRONTEND] Refresh falhou:",
        response.status,
        errorData
      );
      return { success: false };
    }
  } catch (error) {
    console.error("❌ [FRONTEND] Erro ao fazer refresh do token:", error);
    return { success: false };
  }
};

export const AuthProvider = ({ children }: { children: ReactNode }) => {
  const [user, setUser] = useState<User | null>(null);
  const [isLoading, setIsLoading] = useState(false);
  const [isInitialized, setIsInitialized] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [errorType, setErrorType] = useState<
    "user_not_found" | "invalid_credentials" | "network" | "validation" | null
  >(null);

  // Função para verificar e renovar token automaticamente
  const ensureValidToken = async (): Promise<string | null> => {
    // Verificar se estamos no cliente
    if (typeof window === "undefined") {
      console.log(
        "🔍 [FRONTEND] Executando no servidor, pulando verificação de token"
      );
      return null;
    }

    const token = localStorage.getItem("legalai_token");
    const refreshToken = localStorage.getItem("legalai_refresh_token");

    if (!token) {
      console.log("❌ [FRONTEND] Nenhum token encontrado");
      return null;
    }

    // Verificar se o token está próximo de expirar
    if (isTokenExpiringSoon(token)) {
      console.log("⚠️ [FRONTEND] Token expirando em breve, renovando...");

      if (refreshToken) {
        const refreshResult = await refreshAuthToken(refreshToken);
        if (refreshResult.success && refreshResult.token) {
          console.log("✅ [FRONTEND] Token renovado automaticamente");
          return refreshResult.token;
        } else {
          console.log("❌ [FRONTEND] Falha ao renovar token, fazendo logout");
          logout();
          return null;
        }
      } else {
        console.log("❌ [FRONTEND] Sem refresh token, fazendo logout");
        logout();
        return null;
      }
    }

    return token;
  };

  // Verificar se há token válido no localStorage
  const checkStoredAuth = async (): Promise<User | null> => {
    // Verificar se estamos no cliente
    if (typeof window === "undefined") {
      console.log(
        "🔍 [FRONTEND] Executando no servidor, pulando verificação de localStorage"
      );
      return null;
    }

    const token = localStorage.getItem("legalai_token");
    const refreshToken = localStorage.getItem("legalai_refresh_token");
    const storedUser = localStorage.getItem("legalai_user");

    console.log("🔍 [FRONTEND] Verificando autenticação armazenada...");
    console.log("🔍 [FRONTEND] Token existe:", !!token);
    console.log("🔍 [FRONTEND] Refresh token existe:", !!refreshToken);
    console.log("🔍 [FRONTEND] Usuário armazenado existe:", !!storedUser);

    if (!token || !storedUser) {
      console.log(
        "❌ [FRONTEND] Token ou usuário não encontrado no localStorage"
      );
      return null;
    }

    try {
      console.log("🔍 [FRONTEND] Verificando token na API...");
      // Verificar se o token ainda é válido fazendo uma chamada para a API
      const response = await fetch(buildApiUrl("/api/auth/me"), {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log(
        "🔍 [FRONTEND] Resposta da verificação:",
        response.status,
        response.statusText
      );

      if (response.ok) {
        const userData = await response.json();
        console.log(
          "✅ [FRONTEND] Token válido, usuário autenticado:",
          userData?.user?.email || "Email não disponível"
        );
        return userData?.user || null;
      } else if (response.status === 403 && refreshToken) {
        // Token expirado, tentar refresh
        console.log("🔄 [FRONTEND] Token expirado, tentando refresh...");
        const refreshResult = await refreshAuthToken(refreshToken);

        if (
          refreshResult.success &&
          refreshResult.token &&
          refreshResult.user
        ) {
          // Salvar novos tokens
          localStorage.setItem("legalai_token", refreshResult.token);
          localStorage.setItem(
            "legalai_user",
            JSON.stringify(refreshResult.user)
          );
          setUser(refreshResult.user);
          console.log(
            "✅ [FRONTEND] Refresh token bem-sucedido, sessão mantida"
          );
          return refreshResult.user;
        } else {
          // Só deslogar se o refresh realmente falhar
          console.warn("❌ [FRONTEND] Refresh token falhou, removendo sessão");
          localStorage.removeItem("legalai_token");
          localStorage.removeItem("legalai_refresh_token");
          localStorage.removeItem("legalai_user");
          setUser(null);
          return null;
        }
      }

      // Token inválido, limpar localStorage
      console.log("❌ [FRONTEND] Token inválido, limpando localStorage");
      localStorage.removeItem("legalai_token");
      localStorage.removeItem("legalai_refresh_token");
      localStorage.removeItem("legalai_user");
      setUser(null);
      return null;
    } catch (error) {
      console.error("❌ [FRONTEND] Erro ao verificar token:", error);
      // Em caso de erro de rede, limpar sessão para garantir segurança
      console.log("❌ [FRONTEND] Erro de rede, limpando sessão por segurança");
      localStorage.removeItem("legalai_token");
      localStorage.removeItem("legalai_refresh_token");
      localStorage.removeItem("legalai_user");
      setUser(null);
      return null;
    }
  };

  useEffect(() => {
    const initializeAuth = async () => {
      try {
        setIsLoading(true);
        console.log("🔄 Inicializando autenticação...");

        const storedUser = await checkStoredAuth();

        if (storedUser) {
          console.log(
            "✅ Usuário encontrado na sessão:",
            storedUser?.email || "Email não disponível"
          );
          setUser(storedUser);
          // Inicializar créditos se necessário
          const existingCredits = creditsService.getUserCredits();
          if (!existingCredits && storedUser.plan) {
            creditsService.initializeUserCredits(
              storedUser.id,
              storedUser.plan.name.toLowerCase()
            );
          }
        } else {
          console.log("❌ Nenhum usuário encontrado na sessão");
        }
      } catch (err) {
        console.error("❌ Erro ao inicializar autenticação:", err);
      } finally {
        setIsLoading(false);
        setIsInitialized(true);
        console.log("✅ Inicialização da autenticação concluída");
      }
    };

    initializeAuth();
  }, []);

  const login = async (email: string, password: string): Promise<void> => {
    console.log("🔐 [FRONTEND] Iniciando login...");
    setIsLoading(true);
    setError(null);
    setErrorType(null);

    try {
      // Validação básica
      if (!email.trim() || !password.trim()) {
        throw new CustomError(
          ErrorCodes.VALIDATION_ERROR,
          "Email e senha são obrigatórios"
        );
      }

      if (!validateEmail(email)) {
        throw new CustomError(ErrorCodes.VALIDATION_ERROR, "Email inválido");
      }

      console.log("🔐 [FRONTEND] Fazendo requisição de login...");
      // Fazer chamada para a API
      const response = await fetch(buildApiUrl("/api/auth/login"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify({ email, password }),
      });

      console.log(
        "🔐 [FRONTEND] Resposta do login:",
        response.status,
        response.statusText
      );

      if (!response.ok) {
        const errorData = await response.json();
        console.error("❌ [FRONTEND] Login falhou:", errorData);
        console.log("❌ [FRONTEND] Status da resposta:", response.status);
        console.log("❌ [FRONTEND] Limpando usuário e storage...");
        // Limpar usuário e storage em caso de erro
        setUser(null);
        if (typeof window !== "undefined") {
          localStorage.removeItem("legalai_token");
          localStorage.removeItem("legalai_refresh_token");
          localStorage.removeItem("legalai_user");
          console.log("❌ [FRONTEND] Storage limpo");
        }
        throw new CustomError(
          ErrorCodes.AUTH_INVALID_CREDENTIALS,
          errorData.error || errorData.message || "Credenciais inválidas"
        );
      }

      const data = await response.json();
      console.log(
        "✅ [FRONTEND] Login bem-sucedido:",
        data?.user?.email || "Email não disponível"
      );

      if (!data.user || !data.token) {
        throw new CustomError(
          ErrorCodes.VALIDATION_ERROR,
          "Resposta inválida do servidor"
        );
      }

      // Salvar token, refresh token e usuário apenas no cliente
      if (typeof window !== "undefined") {
        localStorage.setItem("legalai_token", data.token);
        if (data.refreshToken) {
          localStorage.setItem("legalai_refresh_token", data.refreshToken);
          console.log("✅ [FRONTEND] Refresh token salvo");
        }
        localStorage.setItem("legalai_user", JSON.stringify(data.user));
        console.log("✅ [FRONTEND] Dados salvos no localStorage");
      }

      setUser(data.user);

      // Sempre inicializar créditos após login - CORREÇÃO CRÍTICA
      const planId = data.user.plan?.name?.toLowerCase() || "basic";
      creditsService.initializeUserCredits(data.user.id, planId);
      console.log(
        `✅ [FRONTEND] Créditos inicializados para usuário ${data.user.id} com plano ${planId}`
      );
    } catch (err) {
      const appError = handleError(err);

      // Garantir que o usuário seja limpo em caso de erro
      setUser(null);
      if (typeof window !== "undefined") {
        localStorage.removeItem("legalai_token");
        localStorage.removeItem("legalai_refresh_token");
        localStorage.removeItem("legalai_user");
      }

      // Determinar o tipo de erro baseado no erro capturado
      if (
        appError.code === "AUTH_USER_NOT_FOUND" ||
        appError.message?.includes("não encontrado")
      ) {
        setErrorType("user_not_found");
      } else if (
        appError.code === "AUTH_INVALID_CREDENTIALS" ||
        appError.message?.includes("credenciais")
      ) {
        setErrorType("invalid_credentials");
      } else if (
        appError.message?.includes("Network") ||
        appError.message?.includes("fetch")
      ) {
        setErrorType("network");
      } else {
        setErrorType("validation");
      }

      setError(appError.message);
      setIsLoading(false);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const register = async (userData: RegisterData): Promise<void> => {
    setIsLoading(true);
    setError(null);

    try {
      if (
        !userData.name.trim() ||
        !userData.email.trim() ||
        !userData.password.trim()
      ) {
        throw new CustomError(
          ErrorCodes.VALIDATION_ERROR,
          "Todos os campos obrigatórios devem ser preenchidos"
        );
      }

      if (!validateEmail(userData.email)) {
        throw new CustomError(ErrorCodes.VALIDATION_ERROR, "Email inválido");
      }

      if (!validatePassword(userData.password)) {
        throw new CustomError(
          ErrorCodes.VALIDATION_ERROR,
          "Senha deve ter pelo menos 6 caracteres"
        );
      }

      // Fazer chamada para a API de registro
      const response = await fetch(buildApiUrl("/api/auth/register"), {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
        },
        body: JSON.stringify(userData),
      });

      if (!response.ok) {
        const errorData = await response.json();
        throw new CustomError(
          ErrorCodes.VALIDATION_ERROR,
          errorData.error || "Erro ao criar conta"
        );
      }

      const data = await response.json();

      if (!data.user || !data.token) {
        throw new CustomError(
          ErrorCodes.VALIDATION_ERROR,
          "Resposta inválida do servidor"
        );
      }

      // Salvar token, refresh token e usuário apenas no cliente
      if (typeof window !== "undefined") {
        localStorage.setItem("legalai_token", data.token);
        if (data.refreshToken) {
          localStorage.setItem("legalai_refresh_token", data.refreshToken);
        }
        localStorage.setItem("legalai_user", JSON.stringify(data.user));
      }

      setUser(data.user);

      // Sempre inicializar créditos após registro - CORREÇÃO CRÍTICA
      const planId = "basic"; // Plano padrão para novos usuários
      creditsService.initializeUserCredits(data.user.id, planId);
      console.log(
        `✅ Créditos inicializados para novo usuário ${data.user.id} com plano ${planId}`
      );
    } catch (err) {
      const appError = handleError(err);
      setError(appError.message);
      return;
    } finally {
      setIsLoading(false);
    }
  };

  const logout = (): void => {
    setUser(null);
    setError(null);

    // Limpar localStorage apenas no cliente
    if (typeof window !== "undefined") {
      localStorage.removeItem("legalai_token");
      localStorage.removeItem("legalai_refresh_token");
      localStorage.removeItem("legalai_user");
      localStorage.removeItem("legalai_current_user");
      localStorage.removeItem("legalai_registered_users");
      // Redirecionar para a landing page
      window.location.href = "/";
    }
  };

  const refreshToken = async (): Promise<boolean> => {
    // Verificar se estamos no cliente
    if (typeof window === "undefined") {
      return false;
    }

    const refreshToken = localStorage.getItem("legalai_refresh_token");

    if (!refreshToken) {
      return false;
    }

    try {
      const result = await refreshAuthToken(refreshToken);

      if (result.success && result.token && result.user) {
        localStorage.setItem("legalai_token", result.token);
        localStorage.setItem("legalai_user", JSON.stringify(result.user));
        setUser(result.user);
        return true;
      }

      return false;
    } catch (error) {
      console.error("Erro ao fazer refresh do token:", error);
      return false;
    }
  };

  const value: AuthContextType = {
    user,
    login,
    register,
    logout,
    refreshToken,
    ensureValidToken,
    isAuthenticated: !!user,
    isLoading,
    isInitialized,
    error,
    errorType,
  };

  return <AuthContext.Provider value={value}>{children}</AuthContext.Provider>;
};
