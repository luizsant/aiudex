"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Coins,
  Calendar,
  TrendingUp,
  AlertTriangle,
  Crown,
  Zap,
  Star,
  RefreshCw,
  Info,
} from "lucide-react";
import { creditsService, UserCredits } from "@/lib/credits-service";
import { paymentService } from "@/lib/payment-service";

interface CreditsDisplayProps {
  className?: string;
  showUpgradeButton?: boolean;
  compact?: boolean;
}

export const CreditsDisplay: React.FC<CreditsDisplayProps> = ({
  className = "",
  showUpgradeButton = true,
  compact = false,
}) => {
  const [credits, setCredits] = useState<UserCredits | null>(null);
  const [stats, setStats] = useState(creditsService.getUsageStats());
  const [isUpgradeModalOpen, setIsUpgradeModalOpen] = useState(false);

  useEffect(() => {
    loadCredits();
  }, []);

  const loadCredits = () => {
    const userCredits = creditsService.getUserCredits();
    setCredits(userCredits);
    setStats(creditsService.getUsageStats());
  };

  const formatDate = (date: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    }).format(date);
  };

  const getPlanIcon = (planId: string) => {
    switch (planId) {
      case "free":
        return <Star className="w-4 h-4" />;
      case "basic":
        return <Zap className="w-4 h-4" />;
      case "pro":
      case "enterprise":
        return <Crown className="w-4 h-4" />;
      default:
        return <Star className="w-4 h-4" />;
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

  const getPlanName = (planId: string) => {
    switch (planId) {
      case "free":
        return "Gratuito";
      case "basic":
        return "Básico";
      case "pro":
        return "Profissional";
      case "enterprise":
        return "Empresarial";
      default:
        return "Gratuito";
    }
  };

  const isUnlimited = credits?.maxCredits === -1;
  const percentage = isUnlimited
    ? 100
    : (stats.remaining / credits?.maxCredits!) * 100;
  const isLowCredits = !isUnlimited && stats.remaining <= 3;

  if (compact) {
    return (
      <Card
        className={`bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ${className}`}>
        <CardContent className="p-4">
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              <Coins className="w-4 h-4 text-blue-600" />
              <span className="text-sm font-medium">Créditos</span>
            </div>
            <div className="flex items-center space-x-2">
              {isUnlimited ? (
                <Badge
                  variant="secondary"
                  className="bg-green-100 text-green-800">
                  Ilimitado
                </Badge>
              ) : (
                <Badge
                  variant="secondary"
                  className={
                    isLowCredits
                      ? "bg-red-100 text-red-800"
                      : "bg-blue-100 text-blue-800"
                  }>
                  {stats.remaining}/{credits?.maxCredits}
                </Badge>
              )}
            </div>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <>
      <Card
        className={`bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ${className}`}>
        <CardHeader className="pb-3">
          <CardTitle className="flex items-center justify-between text-lg">
            <div className="flex items-center space-x-2">
              <Coins className="w-5 h-5 text-blue-600" />
              <span>Créditos de Geração</span>
            </div>
            <Button
              variant="ghost"
              size="sm"
              onClick={loadCredits}
              className="h-8 w-8 p-0">
              <RefreshCw className="w-4 h-4" />
            </Button>
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Plano atual */}
          <div className="flex items-center justify-between">
            <div className="flex items-center space-x-2">
              {getPlanIcon(credits?.planId || "free")}
              <span className="font-medium">
                Plano {getPlanName(credits?.planId || "free")}
              </span>
            </div>
            <Badge className={getPlanColor(credits?.planId || "free")}>
              {getPlanName(credits?.planId || "free")}
            </Badge>
          </div>

          {/* Status dos créditos */}
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Créditos disponíveis</span>
              <span className="font-medium">
                {isUnlimited
                  ? "Ilimitado"
                  : `${stats.remaining}/${credits?.maxCredits}`}
              </span>
            </div>

            {!isUnlimited && (
              <Progress
                value={percentage}
                className={`h-2 ${isLowCredits ? "bg-red-100" : ""}`}
              />
            )}
          </div>

          {/* Estatísticas */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <div className="font-semibold text-blue-600">
                {stats.usageThisMonth}
              </div>
              <div className="text-gray-600">Usados este mês</div>
            </div>
            <div className="text-center p-2 bg-white/50 rounded-lg">
              <div className="font-semibold text-green-600">
                {stats.resetDate ? formatDate(stats.resetDate) : "-"}
              </div>
              <div className="text-gray-600">Próximo reset</div>
            </div>
          </div>

          {/* Aviso de créditos baixos */}
          {isLowCredits && !isUnlimited && (
            <div className="flex items-center space-x-2 p-3 bg-red-50 border border-red-200 rounded-lg">
              <AlertTriangle className="w-4 h-4 text-red-600" />
              <span className="text-sm text-red-700">
                Créditos baixos! Considere fazer upgrade do seu plano.
              </span>
            </div>
          )}

          {/* Botão de upgrade */}
          {showUpgradeButton && !isUnlimited && (
            <Dialog
              open={isUpgradeModalOpen}
              onOpenChange={setIsUpgradeModalOpen}>
              <DialogTrigger asChild>
                <Button className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 text-white">
                  <TrendingUp className="w-4 h-4 mr-2" />
                  Fazer Upgrade
                </Button>
              </DialogTrigger>
              <DialogContent className="max-w-md">
                <DialogHeader>
                  <DialogTitle className="flex items-center space-x-2">
                    <Crown className="w-5 h-5 text-purple-600" />
                    <span>Upgrade de Plano</span>
                  </DialogTitle>
                  <DialogDescription>
                    Escolha um plano que atenda às suas necessidades e tenha
                    mais créditos para geração de peças.
                  </DialogDescription>
                </DialogHeader>
                <div className="space-y-4">
                  {paymentService.getPlans().map((plan) => (
                    <Card
                      key={plan.id}
                      className="cursor-pointer hover:shadow-md transition-shadow"
                      onClick={() => {
                        // Aqui você pode implementar a lógica de upgrade
                        console.log("Upgrade para plano:", plan.id);
                        setIsUpgradeModalOpen(false);
                      }}>
                      <CardContent className="p-4">
                        <div className="flex items-center justify-between">
                          <div>
                            <h4 className="font-semibold">{plan.name}</h4>
                            <p className="text-sm text-gray-600">
                              {plan.maxPetitions === -1
                                ? "Petições ilimitadas"
                                : `${plan.maxPetitions} petições/mês`}
                            </p>
                          </div>
                          <div className="text-right">
                            <div className="font-bold">
                              R$ {plan.price.toFixed(2).replace(".", ",")}
                            </div>
                            <div className="text-sm text-gray-500">/mês</div>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              </DialogContent>
            </Dialog>
          )}

          {/* Informações adicionais */}
          <div className="flex items-center space-x-2 text-xs text-gray-500">
            <Info className="w-3 h-3" />
            <span>
              {isUnlimited
                ? "Plano ilimitado - gere quantas peças quiser"
                : "Créditos renovam mensalmente no dia 1º"}
            </span>
          </div>
        </CardContent>
      </Card>
    </>
  );
};
