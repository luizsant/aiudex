"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import { X, Star, Zap, Crown, Gem } from "lucide-react";
import { Achievement } from "@/lib/achievements-service";

interface AchievementNotificationProps {
  achievement: Achievement;
  onClose: () => void;
}

const getRarityColor = (rarity: string) => {
  switch (rarity) {
    case "common":
      return "bg-gray-100 text-gray-800 border-gray-300";
    case "rare":
      return "bg-blue-100 text-blue-800 border-blue-300";
    case "epic":
      return "bg-purple-100 text-purple-800 border-purple-300";
    case "legendary":
      return "bg-yellow-100 text-yellow-800 border-yellow-300";
    default:
      return "bg-gray-100 text-gray-800 border-gray-300";
  }
};

const getRarityIcon = (rarity: string) => {
  switch (rarity) {
    case "common":
      return <Star className="w-4 h-4" />;
    case "rare":
      return <Zap className="w-4 h-4" />;
    case "epic":
      return <Gem className="w-4 h-4" />;
    case "legendary":
      return <Crown className="w-4 h-4" />;
    default:
      return <Star className="w-4 h-4" />;
  }
};

export const AchievementNotification = ({
  achievement,
  onClose,
}: AchievementNotificationProps) => {
  const [isVisible, setIsVisible] = useState(false);

  useEffect(() => {
    // Animação de entrada
    const timer = setTimeout(() => setIsVisible(true), 100);
    return () => clearTimeout(timer);
  }, []);

  const handleClose = () => {
    setIsVisible(false);
    setTimeout(onClose, 300); // Aguardar animação de saída
  };

  return (
    <div
      className={`fixed top-4 right-4 z-50 transition-all duration-300 transform ${
        isVisible
          ? "translate-x-0 opacity-100 scale-100"
          : "translate-x-full opacity-0 scale-95"
      }`}>
      <Card className="w-80 bg-gradient-to-r from-white to-gray-50 border-2 shadow-2xl">
        <CardContent className="p-4">
          <div className="flex items-start justify-between">
            <div className="flex items-center space-x-3 flex-1">
              {/* Ícone da conquista */}
              <div className="text-3xl">{achievement.icon}</div>

              <div className="flex-1">
                {/* Badge de raridade */}
                <div className="flex items-center space-x-2 mb-1">
                  <Badge
                    variant="outline"
                    className={`text-xs font-bold ${getRarityColor(
                      achievement.rarity
                    )}`}>
                    {getRarityIcon(achievement.rarity)}
                    <span className="ml-1 capitalize">
                      {achievement.rarity}
                    </span>
                  </Badge>
                  <Badge variant="secondary" className="text-xs">
                    +{achievement.points} pts
                  </Badge>
                </div>

                {/* Título e descrição */}
                <h3 className="font-bold text-gray-900 text-sm mb-1">
                  {achievement.title}
                </h3>
                <p className="text-gray-600 text-xs">
                  {achievement.description}
                </p>
              </div>
            </div>

            {/* Botão fechar */}
            <Button
              variant="ghost"
              size="sm"
              onClick={handleClose}
              className="text-gray-400 hover:text-gray-600 p-1">
              <X className="w-4 h-4" />
            </Button>
          </div>

          {/* Efeito de confete visual */}
          <div className="absolute inset-0 pointer-events-none">
            <div
              className="absolute top-0 left-1/4 w-1 h-1 bg-yellow-400 rounded-full animate-bounce"
              style={{ animationDelay: "0s" }}></div>
            <div
              className="absolute top-2 left-1/2 w-1 h-1 bg-blue-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.2s" }}></div>
            <div
              className="absolute top-1 right-1/4 w-1 h-1 bg-purple-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.4s" }}></div>
            <div
              className="absolute top-3 right-1/3 w-1 h-1 bg-green-400 rounded-full animate-bounce"
              style={{ animationDelay: "0.6s" }}></div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

// Hook para gerenciar notificações de conquistas
export const useAchievementNotifications = () => {
  const [notifications, setNotifications] = useState<Achievement[]>([]);

  const addNotification = (achievement: Achievement) => {
    setNotifications((prev) => [...prev, achievement]);
  };

  const removeNotification = (achievementId: string) => {
    setNotifications((prev) => prev.filter((n) => n.id !== achievementId));
  };

  return {
    notifications,
    addNotification,
    removeNotification,
  };
};
