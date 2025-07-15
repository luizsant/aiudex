"use client";

import { useState, useEffect, useCallback, useRef } from "react";
import { creditsService, UserCredits } from "@/lib/credits-service";

export const useCredits = () => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [stats, setStats] = useState(creditsService.getUsageStats());
  const [isLoading, setIsLoading] = useState(false);
  const [updateTrigger, setUpdateTrigger] = useState(0);
  const loadCreditsRef = useRef<() => void>(undefined);

  const loadCredits = useCallback(() => {
    const userCredits = creditsService.getUserCredits();
    setCredits(userCredits);
    setStats(creditsService.getUsageStats());
  }, []);

  // Armazenar a referência da função para usar nos event listeners
  loadCreditsRef.current = loadCredits;

  const canGeneratePetition = useCallback(() => {
    return creditsService.canGeneratePetition();
  }, []);

  const consumePetitionCredit = useCallback(
    (description?: string) => {
      console.log("🎯 [HOOK] Consumindo crédito via hook:", description);
      const success = creditsService.consumePetitionCredit(description);
      console.log("🎯 [HOOK] Resultado do consumo:", success);
      if (success) {
        console.log("🎯 [HOOK] Recarregando créditos...");
        loadCredits(); // Recarregar créditos após consumo
        setUpdateTrigger((prev) => prev + 1); // Forçar atualização do componente
      }
      return success;
    },
    [loadCredits]
  );

  const updateUserPlan = useCallback(
    (planId: string) => {
      creditsService.updateUserPlan(planId);
      loadCredits(); // Recarregar créditos após mudança de plano
    },
    [loadCredits]
  );

  const clearData = useCallback(() => {
    creditsService.clearData();
    setCredits(null);
    setStats(creditsService.getUsageStats());
  }, []);

  const simulateData = useCallback(() => {
    setIsLoading(true);
    try {
      creditsService.simulateData();
      loadCredits();
    } finally {
      setIsLoading(false);
    }
  }, [loadCredits]);

  // Carregar créditos apenas uma vez na montagem e quando updateTrigger mudar
  useEffect(() => {
    loadCredits();
  }, [updateTrigger]); // Removida dependência loadCredits para evitar loop

  // Listener para eventos de atualização de créditos
  useEffect(() => {
    const handleCreditsUpdate = () => {
      console.log("📡 [HOOK] Evento de créditos recebido, recarregando...");
      if (loadCreditsRef.current) {
        loadCreditsRef.current();
      }
    };

    window.addEventListener("creditsUpdated", handleCreditsUpdate);

    return () => {
      window.removeEventListener("creditsUpdated", handleCreditsUpdate);
    };
  }, []); // Removida dependência loadCredits

  return {
    credits,
    stats,
    isLoading,
    loadCredits,
    canGeneratePetition,
    consumePetitionCredit,
    updateUserPlan,
    clearData,
    simulateData,
  };
};
