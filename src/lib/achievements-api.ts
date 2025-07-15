import { API_CONFIG } from "./config";

export interface Achievement {
  id: string;
  userId: string;
  achievementId: string;
  title: string;
  description: string;
  icon: string;
  category: string;
  rarity: string;
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  points: number;
  createdAt: string;
  updatedAt: string;
}

export interface UserProgress {
  id: string;
  userId: string;
  totalPoints: number;
  level: number;
  streak: number;
  lastActivity: string;
  weeklyGoal: number;
  weeklyProgress: number;
  createdAt: string;
  updatedAt: string;
}

export interface RegisterActivityResponse {
  newAchievements: Achievement[];
  totalPointsEarned: number;
  totalPoints: number;
}

export class AchievementsAPI {
  private baseURL: string;

  constructor() {
    this.baseURL = API_CONFIG.BASE_URL;
  }

  // Buscar conquistas do usuário
  async getAchievements(): Promise<Achievement[]> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/achievements`, {
        method: "GET",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${token}`,
        },
      });

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const achievements = await response.json();
      console.log("✅ Conquistas carregadas da API:", achievements.length);
      return achievements;
    } catch (error) {
      console.error("❌ Erro ao carregar conquistas da API:", error);
      throw error;
    }
  }

  // Buscar progresso do usuário
  async getProgress(): Promise<UserProgress> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `${this.baseURL}/api/achievements/progress`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      if (!response.ok) {
        throw new Error(`Erro HTTP: ${response.status}`);
      }

      const progress = await response.json();
      console.log("✅ Progresso carregado da API");
      return progress;
    } catch (error) {
      console.error("❌ Erro ao carregar progresso da API:", error);
      throw error;
    }
  }

  // Registrar atividade e atualizar conquistas
  async registerActivity(
    activityType: string,
    data?: any
  ): Promise<RegisterActivityResponse> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(
        `${this.baseURL}/api/achievements/register`,
        {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({ activityType, data }),
        }
      );

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.error || `Erro HTTP: ${response.status}`);
      }

      const result = await response.json();
      console.log("✅ Atividade registrada na API:", activityType);
      return result;
    } catch (error) {
      console.error("❌ Erro ao registrar atividade na API:", error);
      throw error;
    }
  }

  // Atualizar conquista específica
  async updateAchievement(
    id: string,
    data: {
      progress?: number;
      unlocked?: boolean;
      unlockedAt?: string;
    }
  ): Promise<Achievement> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        throw new Error("Token de autenticação não encontrado");
      }

      const response = await fetch(`${this.baseURL}/api/achievements/${id}`, {
        method: "PUT",
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

      const achievement = await response.json();
      console.log("✅ Conquista atualizada na API:", achievement.title);
      return achievement;
    } catch (error) {
      console.error("❌ Erro ao atualizar conquista na API:", error);
      throw error;
    }
  }

  // Testar conexão com autenticação
  async testConnection(): Promise<boolean> {
    try {
      const token = this.getAuthToken();
      if (!token) {
        console.log("⚠️ Sem token de autenticação");
        return false;
      }

      const response = await fetch(
        `${this.baseURL}/api/achievements/progress`,
        {
          method: "GET",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
        }
      );

      const isConnected = response.ok;
      console.log(
        "🔗 Teste de conexão com API de conquistas:",
        isConnected ? "✅ OK" : "❌ FALHOU"
      );
      return isConnected;
    } catch (error) {
      console.error("❌ Erro no teste de conexão:", error);
      return false;
    }
  }

  private getAuthToken(): string | null {
    if (typeof window === "undefined") return null;
    return localStorage.getItem("auth_token");
  }
}

// Instância singleton
export const achievementsAPI = new AchievementsAPI();
