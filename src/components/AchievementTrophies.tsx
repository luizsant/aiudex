"use client";

import { useState, useEffect } from "react";
import { Badge } from "@/components/ui/badge";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import { Star, Zap, Gem, Crown } from "lucide-react";
import { AchievementsService, Achievement } from "@/lib/achievements-service";

interface AchievementTrophiesProps {
  maxDisplay?: number;
}

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case "common":
      return <Star className="w-3 h-3" />;
    case "rare":
      return <Zap className="w-3 h-3" />;
    case "epic":
      return <Gem className="w-3 h-3" />;
    case "legendary":
      return <Crown className="w-3 h-3" />;
    default:
      return <Star className="w-3 h-3" />;
  }
};

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "bg-gray-100 text-gray-600 border-gray-200";
    case "rare":
      return "bg-blue-100 text-blue-600 border-blue-200";
    case "epic":
      return "bg-purple-100 text-purple-600 border-purple-200";
    case "legendary":
      return "bg-yellow-100 text-yellow-600 border-yellow-200";
    default:
      return "bg-gray-100 text-gray-600 border-gray-200";
  }
};

export const AchievementTrophies = ({
  maxDisplay = 3,
}: AchievementTrophiesProps) => {
  const [unlockedAchievements, setUnlockedAchievements] = useState<
    Achievement[]
  >([]);

  useEffect(() => {
    const loadAchievements = () => {
      // Forçar inicialização se não existir progresso
      let progress = AchievementsService.getUserProgress();
      if (!progress) {
        progress = AchievementsService.initializeUserProgress();
      }

      if (progress) {
        const unlocked = progress.achievements
          .filter((achievement) => achievement.unlocked)
          .sort((a, b) => {
            // Ordenar por data de desbloqueio (mais recentes primeiro)
            if (a.unlockedAt && b.unlockedAt) {
              return (
                new Date(b.unlockedAt).getTime() -
                new Date(a.unlockedAt).getTime()
              );
            }
            // Se não tem data, ordenar por raridade (legendary primeiro)
            const rarityOrder = { legendary: 4, epic: 3, rare: 2, common: 1 };
            return rarityOrder[b.rarity] - rarityOrder[a.rarity];
          })
          .slice(0, maxDisplay);

        setUnlockedAchievements(unlocked);
      }
    };

    loadAchievements();

    // Atualizar quando houver mudanças no localStorage
    const handleStorageChange = () => {
      loadAchievements();
    };

    window.addEventListener("storage", handleStorageChange);
    window.addEventListener("achievement-unlocked", handleStorageChange);

    return () => {
      window.removeEventListener("storage", handleStorageChange);
      window.removeEventListener("achievement-unlocked", handleStorageChange);
    };
  }, [maxDisplay]);

  if (unlockedAchievements.length === 0) {
    return (
      <div className="flex items-center space-x-1">
        <div className="text-xs text-red-600 bg-red-100 px-2 py-1 rounded-md border border-red-300">
          🏆 Sem conquistas ainda
        </div>
      </div>
    );
  }

  return (
    <div className="flex items-center space-x-1 bg-yellow-200 border-2 border-red-500 p-2">
      <span className="text-xs font-bold text-red-600">TROFÉUS:</span>
      {unlockedAchievements.map((achievement) => (
        <div
          key={achievement.id}
          className="bg-blue-100 text-blue-800 px-2 py-1 rounded text-xs border border-blue-300">
          {achievement.icon} {achievement.title}
        </div>
      ))}
    </div>
  );
};
