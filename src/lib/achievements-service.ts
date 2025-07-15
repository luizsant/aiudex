// Sistema de Conquistas para LegalAI
export interface Achievement {
  id: string;
  title: string;
  description: string;
  icon: string;
  category: "productivity" | "quality" | "exploration" | "mastery" | "social";
  rarity: "common" | "rare" | "epic" | "legendary";
  progress: number;
  maxProgress: number;
  unlocked: boolean;
  unlockedAt?: string;
  points: number;
}

export interface UserProgress {
  totalPoints: number;
  level: number;
  achievements: Achievement[];
  streak: number;
  lastActivity: string;
  weeklyGoal: number;
  weeklyProgress: number;
}

export class AchievementsService {
  private static STORAGE_KEY = "jurisai_achievements";
  private static PROGRESS_KEY = "jurisai_user_progress";

  // Conquistas disponíveis
  private static ACHIEVEMENTS: Omit<
    Achievement,
    "progress" | "unlocked" | "unlockedAt"
  >[] = [
    // Produtividade
    {
      id: "first_piece",
      title: "Primeira Peça",
      description: "Gerou sua primeira peça jurídica",
      icon: "📝",
      category: "productivity",
      rarity: "common",
      maxProgress: 1,
      points: 10,
    },
    {
      id: "speed_writer",
      title: "Escritor Rápido",
      description: "Gerou 5 peças em um dia",
      icon: "⚡",
      category: "productivity",
      rarity: "rare",
      maxProgress: 5,
      points: 50,
    },
    {
      id: "productive_week",
      title: "Semana Produtiva",
      description: "Gerou 20 peças em uma semana",
      icon: "📈",
      category: "productivity",
      rarity: "epic",
      maxProgress: 20,
      points: 200,
    },
    {
      id: "time_saver",
      title: "Economizador de Tempo",
      description: "Economizou 10 horas usando IA",
      icon: "⏰",
      category: "productivity",
      rarity: "rare",
      maxProgress: 600, // 10 horas em minutos
      points: 100,
    },

    // Qualidade
    {
      id: "quality_master",
      title: "Mestre da Qualidade",
      description: "Gerou 10 peças sem retrabalho",
      icon: "✨",
      category: "quality",
      rarity: "epic",
      maxProgress: 10,
      points: 150,
    },
    {
      id: "perfectionist",
      title: "Perfeccionista",
      description: "Revisou e editou 50 peças",
      icon: "🔍",
      category: "quality",
      rarity: "legendary",
      maxProgress: 50,
      points: 500,
    },

    // Exploração
    {
      id: "explorer",
      title: "Explorador",
      description: "Usou todos os tipos de peças",
      icon: "🗺️",
      category: "exploration",
      rarity: "rare",
      maxProgress: 8,
      points: 75,
    },
    {
      id: "area_master",
      title: "Mestre das Áreas",
      description: "Trabalhou em 5 áreas do direito",
      icon: "⚖️",
      category: "exploration",
      rarity: "epic",
      maxProgress: 5,
      points: 200,
    },
    {
      id: "template_creator",
      title: "Criador de Templates",
      description: "Criou 3 templates personalizados",
      icon: "📋",
      category: "exploration",
      rarity: "rare",
      maxProgress: 3,
      points: 100,
    },

    // Maestria
    {
      id: "ai_master",
      title: "Mestre da IA",
      description: "Usou IA 100 vezes",
      icon: "🤖",
      category: "mastery",
      rarity: "epic",
      maxProgress: 100,
      points: 300,
    },
    {
      id: "efficiency_expert",
      title: "Especialista em Eficiência",
      description: "Reduziu tempo médio para 30 min/peça",
      icon: "🎯",
      category: "mastery",
      rarity: "legendary",
      maxProgress: 30,
      points: 400,
    },
    {
      id: "streak_master",
      title: "Mestre da Sequência",
      description: "Manteve atividade por 30 dias seguidos",
      icon: "🔥",
      category: "mastery",
      rarity: "legendary",
      maxProgress: 30,
      points: 600,
    },

    // Social (futuro)
    {
      id: "team_player",
      title: "Jogador de Equipe",
      description: "Compartilhou 5 templates",
      icon: "🤝",
      category: "social",
      rarity: "rare",
      maxProgress: 5,
      points: 75,
    },
  ];

  // Inicializar progresso do usuário
  static initializeUserProgress(): UserProgress {
    console.log("Inicializando progresso do usuário...");
    const existing = this.getUserProgress();
    if (existing) {
      console.log("Progresso existente encontrado:", existing);
      return existing;
    }

    console.log("Criando novo progresso...");
    const initialProgress: UserProgress = {
      totalPoints: 0,
      level: 1,
      achievements: this.ACHIEVEMENTS.map((achievement) => ({
        ...achievement,
        progress: 0,
        unlocked: false,
      })),
      streak: 0,
      lastActivity: new Date().toISOString(),
      weeklyGoal: 10,
      weeklyProgress: 0,
    };

    console.log("Progresso inicial criado:", initialProgress);
    this.saveUserProgress(initialProgress);
    return initialProgress;
  }

  // Obter progresso do usuário
  static getUserProgress(): UserProgress | null {
    try {
      console.log(
        "Tentando obter progresso do localStorage com chave:",
        this.PROGRESS_KEY
      );
      const stored = localStorage.getItem(this.PROGRESS_KEY);
      console.log("Dados armazenados:", stored);

      if (stored) {
        const parsed = JSON.parse(stored);
        console.log("Progresso parseado:", parsed);
        return parsed;
      } else {
        console.log("Nenhum dado encontrado no localStorage");
        return null;
      }
    } catch (error) {
      console.error("Erro ao carregar progresso:", error);
      return null;
    }
  }

  // Salvar progresso do usuário
  private static saveUserProgress(progress: UserProgress): void {
    try {
      localStorage.setItem(this.PROGRESS_KEY, JSON.stringify(progress));
    } catch (error) {
      console.error("Erro ao salvar progresso:", error);
    }
  }

  // Método público para salvar progresso (para testes)
  static saveProgress(progress: UserProgress): void {
    this.saveUserProgress(progress);
  }

  // Registrar atividade (chamado quando usuário gera peça)
  static registerActivity(activityType: string, data?: any): Achievement[] {
    const progress = this.getUserProgress() || this.initializeUserProgress();
    const newlyUnlocked: Achievement[] = [];

    // Atualizar streak
    const today = new Date().toDateString();
    const lastActivity = new Date(progress.lastActivity).toDateString();

    if (today === lastActivity) {
      // Mesmo dia, manter streak
    } else if (
      new Date(progress.lastActivity).getTime() + 24 * 60 * 60 * 1000 >=
      new Date().getTime()
    ) {
      // Dia consecutivo
      progress.streak++;
    } else {
      // Quebrou streak
      progress.streak = 1;
    }

    progress.lastActivity = new Date().toISOString();

    // Atualizar conquistas baseado na atividade
    progress.achievements = progress.achievements.map((achievement) => {
      let shouldUpdate = false;
      let newProgress = achievement.progress;

      switch (achievement.id) {
        case "first_piece":
          if (activityType === "piece_generated" && !achievement.unlocked) {
            newProgress = 1;
            shouldUpdate = true;
          }
          break;

        case "speed_writer":
          if (activityType === "piece_generated") {
            const todayPieces = this.getPiecesToday();
            newProgress = Math.min(todayPieces, achievement.maxProgress);
            shouldUpdate = true;
          }
          break;

        case "productive_week":
          if (activityType === "piece_generated") {
            const weekPieces = this.getPiecesThisWeek();
            newProgress = Math.min(weekPieces, achievement.maxProgress);
            shouldUpdate = true;
          }
          break;

        case "time_saver":
          if (activityType === "time_saved" && data?.minutes) {
            newProgress = Math.min(
              progress.achievements.find((a) => a.id === "time_saver")
                ?.progress || 0 + data.minutes,
              achievement.maxProgress
            );
            shouldUpdate = true;
          }
          break;

        case "streak_master":
          newProgress = Math.min(progress.streak, achievement.maxProgress);
          shouldUpdate = true;
          break;

        // Adicionar mais casos conforme necessário
      }

      if (shouldUpdate && newProgress !== achievement.progress) {
        const updatedAchievement = {
          ...achievement,
          progress: newProgress,
          unlocked:
            newProgress >= achievement.maxProgress && !achievement.unlocked,
        };

        if (updatedAchievement.unlocked && !achievement.unlocked) {
          updatedAchievement.unlockedAt = new Date().toISOString();
          progress.totalPoints += achievement.points;
          newlyUnlocked.push(updatedAchievement);

          // Disparar evento personalizado para notificar sobre nova conquista
          window.dispatchEvent(
            new CustomEvent("achievement-unlocked", {
              detail: { achievement: updatedAchievement },
            })
          );
        }

        return updatedAchievement;
      }

      return achievement;
    });

    // Calcular nível baseado nos pontos
    progress.level = Math.floor(progress.totalPoints / 100) + 1;

    this.saveUserProgress(progress);
    return newlyUnlocked;
  }

  // Obter peças geradas hoje
  private static getPiecesToday(): number {
    const metrics = JSON.parse(
      localStorage.getItem("jurisai_user_metrics") || "{}"
    );
    const today = new Date().toDateString();

    return (
      metrics.pecasGeradas?.filter(
        (peca: any) => new Date(peca.data).toDateString() === today
      ).length || 0
    );
  }

  // Obter peças geradas esta semana
  private static getPiecesThisWeek(): number {
    const metrics = JSON.parse(
      localStorage.getItem("jurisai_user_metrics") || "{}"
    );
    const weekAgo = new Date();
    weekAgo.setDate(weekAgo.getDate() - 7);

    return (
      metrics.pecasGeradas?.filter(
        (peca: any) => new Date(peca.data) >= weekAgo
      ).length || 0
    );
  }

  // Obter conquistas por categoria
  static getAchievementsByCategory(category: string): Achievement[] {
    const progress = this.getUserProgress();
    if (!progress) return [];

    return progress.achievements.filter((a) => a.category === category);
  }

  // Obter estatísticas de gamificação
  static getGamificationStats() {
    const progress = this.getUserProgress();
    if (!progress) return null;

    const totalAchievements = progress.achievements.length;
    const unlockedAchievements = progress.achievements.filter(
      (a) => a.unlocked
    ).length;
    const completionRate = Math.round(
      (unlockedAchievements / totalAchievements) * 100
    );
    const currentXP = progress.totalPoints % 100;
    const xpForNextLevel = 100;
    const nextMilestone = Math.ceil(progress.totalPoints / 100) * 100;
    const pointsForNextLevel = xpForNextLevel - currentXP;
    const nextLevelProgress = currentXP / xpForNextLevel;

    // Calcular ranking simulado (baseado nos pontos)
    const rank = Math.max(1, Math.floor(Math.random() * 1000) + 1);
    const rankTitle = this.getRankTitle(progress.totalPoints);

    return {
      level: progress.level,
      totalPoints: progress.totalPoints,
      streak: progress.streak,
      currentXP,
      xpForNextLevel,
      nextMilestone,
      rank,
      rankTitle,
      unlockedCount: unlockedAchievements,
      totalCount: totalAchievements,
      completionRate,
      // Adicionar campos compatíveis com a página de conquistas
      nextLevel: {
        progress: nextLevelProgress,
        pointsNeeded: pointsForNextLevel,
      },
    };
  }

  // Obter próximas conquistas (não desbloqueadas)
  static getNextAchievements(): Achievement[] {
    const progress = this.getUserProgress();
    if (!progress) return [];

    return progress.achievements
      .filter((a) => !a.unlocked)
      .sort((a, b) => {
        // Priorizar por raridade e depois por progresso
        const rarityOrder = { common: 1, rare: 2, epic: 3, legendary: 4 };
        const aRarity = rarityOrder[a.rarity];
        const bRarity = rarityOrder[b.rarity];

        if (aRarity !== bRarity) {
          return aRarity - bRarity;
        }

        // Se mesma raridade, priorizar as mais próximas de serem desbloqueadas
        const aProgress = a.progress / a.maxProgress;
        const bProgress = b.progress / b.maxProgress;
        return bProgress - aProgress;
      });
  }

  // Obter título do ranking baseado nos pontos
  private static getRankTitle(points: number): string {
    if (points >= 1000) return "Mestre Supremo";
    if (points >= 500) return "Mestre";
    if (points >= 200) return "Veterano";
    if (points >= 100) return "Experiente";
    if (points >= 50) return "Iniciante";
    return "Novato";
  }

  // Limpar dados (para testes)
  static clearData() {
    localStorage.removeItem(this.PROGRESS_KEY);
  }
}
