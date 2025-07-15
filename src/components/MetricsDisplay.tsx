import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Clock, FileText, TrendingUp, Zap } from "lucide-react";
import { MetricsService } from "@/lib/metrics-service";

interface MetricsDisplayProps {
  className?: string;
}

export default function MetricsDisplay({
  className = "",
}: MetricsDisplayProps) {
  const [metrics, setMetrics] = useState({
    pecasGeradas: 0,
    tempoEconomizado: 0,
    tempoMedio: 0,
    produtividade: 0,
  });

  useEffect(() => {
    const loadMetrics = async () => {
      // Corrigido: aguardar as Promises
      const generalStats = await MetricsService.getGeneralStats();
      const tempoMedio = await MetricsService.getTempoMedioReal();

      setMetrics({
        pecasGeradas: generalStats.pecasGeradas,
        tempoEconomizado: generalStats.tempoEconomizado,
        tempoMedio: tempoMedio,
        produtividade: generalStats.produtividade,
      });
    };

    loadMetrics();

    // Atualizar a cada 5 segundos
    const interval = setInterval(loadMetrics, 5000);

    return () => clearInterval(interval);
  }, []);

  if (metrics.pecasGeradas === 0) {
    return null; // Não mostrar se não há dados
  }

  return (
    <Card
      className={`bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 ${className}`}>
      <CardHeader className="pb-3">
        <CardTitle className="text-lg text-blue-800 flex items-center gap-2">
          <TrendingUp className="w-5 h-5" />
          Suas Métricas
        </CardTitle>
      </CardHeader>
      <CardContent className="space-y-3">
        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-blue-600" />
            <span className="text-sm text-gray-600">Peças geradas:</span>
          </div>
          <Badge variant="secondary" className="bg-blue-100 text-blue-800">
            {metrics.pecasGeradas}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Clock className="w-4 h-4 text-green-600" />
            <span className="text-sm text-gray-600">Tempo economizado:</span>
          </div>
          <Badge variant="secondary" className="bg-green-100 text-green-800">
            {MetricsService.formatTime(metrics.tempoEconomizado)}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <Zap className="w-4 h-4 text-purple-600" />
            <span className="text-sm text-gray-600">Tempo médio:</span>
          </div>
          <Badge variant="secondary" className="bg-purple-100 text-purple-800">
            {MetricsService.formatTime(metrics.tempoMedio)}
          </Badge>
        </div>

        <div className="flex justify-between items-center">
          <div className="flex items-center gap-2">
            <TrendingUp className="w-4 h-4 text-orange-600" />
            <span className="text-sm text-gray-600">Produtividade:</span>
          </div>
          <Badge variant="secondary" className="bg-orange-100 text-orange-800">
            {metrics.produtividade}x
          </Badge>
        </div>
      </CardContent>
    </Card>
  );
}
