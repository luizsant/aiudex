"use client";

import React, { useRef } from "react";
import { Badge } from "@/components/ui/badge";
import { Coins, Crown, Zap, Star } from "lucide-react";
import { useCredits } from "@/hooks/useCredits";

export const HeaderCredits: React.FC = () => {
  const { credits, stats, loadCredits, consumePetitionCredit } = useCredits();
  const loadCreditsRef = useRef(loadCredits);

  // Atualizar a referência quando loadCredits mudar
  loadCreditsRef.current = loadCredits;

  // Forçar recarregamento dos créditos quando o componente montar
  React.useEffect(() => {
    loadCredits();
  }, []); // Removida dependência loadCredits para evitar loop

  // Listener para eventos de atualização de créditos
  React.useEffect(() => {
    const handleCreditsUpdate = () => {
      if (loadCreditsRef.current) {
        loadCreditsRef.current();
      }
    };

    window.addEventListener("creditsUpdated", handleCreditsUpdate);

    return () => {
      window.removeEventListener("creditsUpdated", handleCreditsUpdate);
    };
  }, []); // Removida dependência loadCredits

  // Se não há créditos, mostrar estado de carregamento
  if (!credits) {
    return (
      <div className="flex items-center space-x-2">
        <Coins className="w-4 h-4 text-gray-400" />
        <Badge
          variant="secondary"
          className="bg-gray-100 text-gray-600 text-xs">
          Carregando...
        </Badge>
      </div>
    );
  }

  const isUnlimited = credits.maxCredits === -1;
  const isLowCredits = !isUnlimited && stats.remaining <= 3;

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Star className="w-3 h-3" />;
      case "basic":
        return <Zap className="w-3 h-3" />;
      case "pro":
      case "enterprise":
        return <Crown className="w-3 h-3" />;
      default:
        return <Star className="w-3 h-3" />;
    }
  };

  const getPlanColor = (planId: string) => {
    switch (planId) {
      case "free":
        return "bg-gray-100 text-gray-800";
      case "basic":
        return "bg-blue-100 text-blue-800";
      case "pro":
        return "bg-purple-100 text-purple-800";
      case "enterprise":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  return (
    <div className="flex items-center space-x-2">
      <Coins className="w-4 h-4 text-blue-600" />
      {isUnlimited ? (
        <Badge
          variant="secondary"
          className="bg-green-100 text-green-800 text-xs">
          Ilimitado
        </Badge>
      ) : (
        <Badge
          variant="secondary"
          className={`text-xs ${
            isLowCredits
              ? "bg-red-100 text-red-800"
              : "bg-blue-100 text-blue-800"
          }`}>
          {stats.remaining}/{credits.maxCredits}
        </Badge>
      )}
    </div>
  );
};
