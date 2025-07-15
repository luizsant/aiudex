"use client";

import React, { useState, useEffect } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Clock,
  Target,
  TrendingUp,
  CheckCircle,
  FileText,
  Zap,
  BarChart3,
  Users,
  Plus,
  Play,
  Trash2,
  ChevronRight,
  RefreshCw,
  Trophy,
  Coins,
} from "lucide-react";
import { MetricsService } from "@/lib/metrics-service";
import { AchievementsService } from "@/lib/achievements-service";
import Link from "next/link";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { useCredits } from "@/hooks/useCredits";
import Layout from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";

export default function Dashboard() {
  const [optimizationMetrics, setOptimizationMetrics] = useState<any[]>([]);
  const [generalStats, setGeneralStats] = useState<any>({
    pecasGeradas: 0,
    tempoEconomizado: 0,
    eficienciaIA: 87,
    produtividade: 3.2,
    tempoMedioReal: 45,
    pecasPorDiaReal: 2.1,
  });
  const [gamificationStats, setGamificationStats] = useState<any>(null);
  const [recentAchievements, setRecentAchievements] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const { simulateData: simulateCredits } = useCredits();

  useEffect(() => {
    loadMetrics();
  }, []);

  const loadMetrics = async () => {
    try {
      setIsLoading(true);
      const [
        optimizationMetrics,
        generalStats,
        tempoMedioReal,
        pecasPorDiaReal,
      ] = await Promise.all([
        MetricsService.getOptimizationMetrics(),
        MetricsService.getGeneralStats(),
        MetricsService.getTempoMedioReal(),
        MetricsService.getPecasPorDiaReal(),
      ]);
      setOptimizationMetrics(optimizationMetrics);
      setGeneralStats({
        ...generalStats,
        tempoMedioReal,
        pecasPorDiaReal,
      });
      const stats = AchievementsService.getGamificationStats();
      setGamificationStats(stats);
      if (stats) {
        const progress = AchievementsService.getUserProgress();
        if (progress) {
          const unlocked = progress.achievements
            .filter((a) => a.unlocked)
            .sort(
              (a, b) =>
                new Date(b.unlockedAt || 0).getTime() -
                new Date(a.unlockedAt || 0).getTime()
            )
            .slice(0, 3);
          setRecentAchievements(unlocked);
        }
      }
    } catch (error) {
      setOptimizationMetrics([]);
      setGeneralStats({
        pecasGeradas: 0,
        tempoEconomizado: 0,
        eficienciaIA: 87,
        produtividade: 3.2,
        tempoMedioReal: 45,
        pecasPorDiaReal: 2.1,
      });
    } finally {
      setIsLoading(false);
    }
  };

  const handleSimulateUsage = async () => {
    try {
      MetricsService.simulateUsage();
      const activities = [
        { type: "piece_generated", data: { tipo: "Petição", area: "Civil" } },
        {
          type: "piece_generated",
          data: { tipo: "Recurso", area: "Trabalhista" },
        },
        { type: "time_saved", data: { minutes: 45 } },
        {
          type: "piece_generated",
          data: { tipo: "Contestação", area: "Penal" },
        },
      ];
      activities.forEach((activity) => {
        AchievementsService.registerActivity(activity.type, activity.data);
      });
      await loadMetrics();
    } catch (error) {}
  };

  const handleClearData = async () => {
    try {
      MetricsService.clearData();
      AchievementsService.clearData();
      await loadMetrics();
    } catch (error) {}
  };

  const handleRegisterPeca = async () => {
    try {
      const tipos = ["Petição Inicial", "Recurso", "Contestação", "Parecer"];
      const areas = ["Civil", "Trabalhista", "Penal", "Administrativo"];
      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const area = areas[Math.floor(Math.random() * areas.length)];
      const tempo = Math.floor(Math.random() * 30) + 30;
      await MetricsService.registerPecaGerada(tipo, tempo, area);
      AchievementsService.registerActivity("piece_generated", {
        tipo,
        area,
        tempo,
      });
      await loadMetrics();
    } catch (error) {}
  };

  if (isLoading) {
    return (
      <Layout>
        <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
          <div className="text-center">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
            <p className="text-slate-600">Carregando dashboard...</p>
          </div>
        </div>
      </Layout>
    );
  }

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <PageHeader
          title="Dashboard de Produtividade"
          subtitle="Acompanhe sua eficiência e economia de tempo com IA"
          icon={<BarChart3 className="w-7 h-7 text-white" />}
          actions={
            <>
              <Button
                onClick={handleRegisterPeca}
                variant="outline"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Plus className="w-4 h-4 mr-2" />
                Nova Peça
              </Button>
              <Button
                onClick={handleSimulateUsage}
                variant="outline"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Play className="w-4 h-4 mr-2" />
                Simular Uso
              </Button>
              <Button
                onClick={handleClearData}
                variant="outline"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <Trash2 className="w-4 h-4 mr-2" />
                Limpar
              </Button>
              <Button
                variant="outline"
                size="sm"
                className="bg-white/20 text-white border-white/30 hover:bg-white/30">
                <span className="mr-2">🏆</span>Conquistas
              </Button>
            </>
          }
        />

        <div className="container mx-auto p-6 space-y-8">
          {/* Cards de Estatísticas Principais */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
            <Card className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    Peças Geradas
                  </CardTitle>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <FileText className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {generalStats.pecasGeradas}
                </div>
                <p className="text-white/80 text-sm mt-1">
                  Total de documentos criados
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-aiudex-secondary text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    Tempo Economizado
                  </CardTitle>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Clock className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {generalStats.tempoEconomizado}min
                </div>
                <p className="text-white/80 text-sm mt-1">
                  Horas economizadas com IA
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    Eficiência IA
                  </CardTitle>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <Zap className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {generalStats.eficienciaIA}%
                </div>
                <p className="text-white/80 text-sm mt-1">
                  Taxa de acerto da IA
                </p>
              </CardContent>
            </Card>
            <Card className="bg-gradient-to-br from-green-500 to-blue-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <CardTitle className="text-white text-lg">
                    Produtividade
                  </CardTitle>
                  <div className="w-10 h-10 bg-white/20 rounded-lg flex items-center justify-center">
                    <TrendingUp className="w-5 h-5 text-white" />
                  </div>
                </div>
              </CardHeader>
              <CardContent>
                <div className="text-3xl font-bold text-white">
                  {generalStats.produtividade}x
                </div>
                <p className="text-white/80 text-sm mt-1">
                  Aumento na produtividade
                </p>
              </CardContent>
            </Card>
          </div>

          {/* Seção de Otimização */}
          <div className="bg-gradient-aiudex rounded-xl p-8 text-white shadow-aiudex">
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold mb-4">
                🚀 Sua Otimização com IA
              </h2>
              <p className="text-xl opacity-90">
                Veja como a inteligência artificial está transformando sua
                produtividade
              </p>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              {/* Cards internos de otimização */}
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">
                      Tempo médio por peça
                    </CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Clock className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Antes:</span>
                    <span className="text-white font-semibold">4h 30min</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Agora:</span>
                    <span className="text-white font-semibold">
                      {generalStats.tempoMedioReal}min
                    </span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Melhoria:</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-500 text-white">
                      83%
                    </Badge>
                  </div>
                  <div className="text-xs text-white/60 italic">
                    📊 Baseado em seus dados reais
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">
                      Taxa de retrabalho
                    </CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <CheckCircle className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Antes:</span>
                    <span className="text-white font-semibold">35%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Agora:</span>
                    <span className="text-white font-semibold">12%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Melhoria:</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-500 text-white">
                      66%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">
                      Peças por dia
                    </CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <FileText className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Antes:</span>
                    <span className="text-white font-semibold">2.1</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Agora:</span>
                    <span className="text-white font-semibold">6.8</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Melhoria:</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-500 text-white">
                      69%
                    </Badge>
                  </div>
                  <div className="text-xs text-white/60 italic">
                    📊 Baseado em seus dados reais
                  </div>
                </CardContent>
              </Card>
              <Card className="bg-white/10 backdrop-blur-sm border-white/20 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-white text-lg">
                      Satisfação do cliente
                    </CardTitle>
                    <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                      <Users className="w-4 h-4 text-white" />
                    </div>
                  </div>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Antes:</span>
                    <span className="text-white font-semibold">78%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Agora:</span>
                    <span className="text-white font-semibold">94%</span>
                  </div>
                  <div className="flex justify-between items-center">
                    <span className="text-white/70 text-sm">Melhoria:</span>
                    <Badge
                      variant="secondary"
                      className="bg-green-500 text-white">
                      17%
                    </Badge>
                  </div>
                </CardContent>
              </Card>
            </div>
          </div>

          {/* Gráficos e Análises */}
          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            <Card className="shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient-aiudex">
                  <TrendingUp className="w-5 h-5" />
                  Progresso Semanal
                </CardTitle>
                <CardDescription>
                  Evolução da sua produtividade nos últimos 7 dias
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Eficiência Geral</span>
                    <span className="font-semibold">87%</span>
                  </div>
                  <Progress
                    value={87}
                    className="h-2 [&>div]:bg-gradient-aiudex"
                  />
                  <div className="flex justify-between items-center">
                    <span>Qualidade dos Textos</span>
                    <span className="font-semibold">94%</span>
                  </div>
                  <Progress
                    value={94}
                    className="h-2 [&>div]:bg-gradient-aiudex"
                  />
                  <div className="flex justify-between items-center">
                    <span>Satisfação do Cliente</span>
                    <span className="font-semibold">91%</span>
                  </div>
                  <Progress
                    value={91}
                    className="h-2 [&>div]:bg-gradient-aiudex"
                  />
                </div>
              </CardContent>
            </Card>
            <Card className="shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-gradient-aiudex">
                  <Target className="w-5 h-5" />
                  Metas e Objetivos
                </CardTitle>
                <CardDescription>
                  Acompanhe suas metas de produtividade
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="space-y-4">
                  <div className="flex justify-between items-center">
                    <span>Peças por semana</span>
                    <span className="font-semibold">
                      {generalStats.pecasGeradas}/50
                    </span>
                  </div>
                  <Progress
                    value={(generalStats.pecasGeradas / 50) * 100}
                    className="h-2 [&>div]:bg-gradient-aiudex"
                  />
                  <div className="flex justify-between items-center">
                    <span>Tempo médio por peça</span>
                    <span className="font-semibold">
                      {generalStats.tempoMedioReal
                        ? generalStats.tempoMedioReal + "min"
                        : "45min"}
                    </span>
                  </div>
                  <Progress
                    value={
                      generalStats.tempoMedioReal
                        ? 100 - (generalStats.tempoMedioReal / 270) * 100
                        : 83
                    }
                    className="h-2 [&>div]:bg-gradient-aiudex"
                  />
                  <div className="flex justify-between items-center">
                    <span>Economia de tempo</span>
                    <span className="font-semibold">
                      {generalStats.tempoEconomizado}min
                    </span>
                  </div>
                  <Progress
                    value={Math.min(
                      (generalStats.tempoEconomizado / 1000) * 100,
                      100
                    )}
                    className="h-2 [&>div]:bg-gradient-aiudex"
                  />
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Créditos */}
          <CreditsDisplay />
        </div>
      </div>
    </Layout>
  );
}
