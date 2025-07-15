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
import { PageHeader } from "@/components/PageHeader";
import { Link } from "react-router-dom";
import { CreditsDisplay } from "@/components/CreditsDisplay";
import { useCredits } from "@/hooks/useCredits";
import { useRouter } from "next/navigation";

export default function Dashboard() {
  const router = useRouter();
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

      // Carregar métricas de forma assíncrona
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

      // Carregar dados de gamificação (síncrono)
      const stats = AchievementsService.getGamificationStats();
      setGamificationStats(stats);

      // Carregar conquistas recentes
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
      console.error("Erro ao carregar métricas:", error);
      // Fallback para dados padrão
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

      // Registrar atividades para conquistas
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
    } catch (error) {
      console.error("Erro ao simular uso:", error);
    }
  };

  const handleClearData = async () => {
    try {
      MetricsService.clearData();
      AchievementsService.clearData();
      await loadMetrics();
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
    }
  };

  const handleRegisterPeca = async () => {
    try {
      const tipos = ["Petição Inicial", "Recurso", "Contestação", "Parecer"];
      const areas = ["Civil", "Trabalhista", "Penal", "Administrativo"];

      const tipo = tipos[Math.floor(Math.random() * tipos.length)];
      const area = areas[Math.floor(Math.random() * areas.length)];
      const tempo = Math.floor(Math.random() * 30) + 30; // 30-60 minutos

      await MetricsService.registerPecaGerada(tipo, tempo, area);

      // Registrar atividade para conquistas
      AchievementsService.registerActivity("piece_generated", {
        tipo,
        area,
        tempo,
      });

      await loadMetrics();
    } catch (error) {
      console.error("Erro ao registrar peça:", error);
    }
  };

  const getIconComponent = (iconName: string) => {
    const icons: { [key: string]: React.ComponentType<any> } = {
      Clock,
      Target,
      TrendingUp,
      CheckCircle,
    };
    return icons[iconName] || Clock;
  };

  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 flex items-center justify-center">
        <div className="text-center">
          <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-blue-600 mx-auto mb-4"></div>
          <p className="text-slate-600">Carregando dashboard...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Dashboard de Produtividade"
        subtitle="Acompanhe sua eficiência e economia de tempo com IA"
        icon={<BarChart3 className="w-7 h-7 text-white" />}
        actions={
          <div className="flex gap-2">
            <Button
              onClick={() => router.push("/editor")}
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
              onClick={() => router.push("/achievements")}
              variant="outline"
              size="sm"
              className="bg-white/20 text-white border-white/30 hover:bg-white/30">
              <span className="mr-2">🏆</span>
              Conquistas
            </Button>
          </div>
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
                {MetricsService.formatTime(generalStats.tempoEconomizado)}
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
              <p className="text-white/80 text-sm mt-1">Taxa de acerto da IA</p>
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
            {optimizationMetrics.map((metric) => {
              const IconComponent = getIconComponent(metric.icon);
              return (
                <Card
                  key={metric.id}
                  className="bg-white/10 backdrop-blur-sm border-white/20 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <CardTitle className="text-white text-lg">
                        {metric.metric}
                      </CardTitle>
                      <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                        <IconComponent className="w-4 h-4 text-white" />
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-3">
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Antes:</span>
                      <span className="text-white font-semibold">
                        {metric.before}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Agora:</span>
                      <span className="text-white font-semibold">
                        {metric.after}
                      </span>
                    </div>
                    <div className="flex justify-between items-center">
                      <span className="text-white/70 text-sm">Melhoria:</span>
                      <Badge
                        variant="secondary"
                        className="bg-green-500 text-white">
                        {metric.improvement}
                      </Badge>
                    </div>
                    {metric.isDynamic && (
                      <div className="text-xs text-white/60 italic">
                        📊 Baseado em seus dados reais
                      </div>
                    )}
                  </CardContent>
                </Card>
              );
            })}
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
                      ? MetricsService.formatTime(generalStats.tempoMedioReal)
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
                    {MetricsService.formatTime(generalStats.tempoEconomizado)}
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

        {/* Seção de Gamificação */}
        {gamificationStats && (
          <div className="space-y-6">
            {/* Header da Gamificação */}
            <div className="text-center">
              <h2 className="text-3xl font-bold text-gradient-aiudex mb-2">
                🏆 Sistema de Conquistas
              </h2>
              <p className="text-lg text-slate-600">
                Acompanhe seu progresso e desbloqueie conquistas
              </p>
            </div>

            {/* Cards de Estatísticas de Gamificação */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
              <Card className="bg-gradient-to-br from-yellow-50 to-yellow-100 border-yellow-200 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-yellow-700 text-lg">
                      Nível Atual
                    </CardTitle>
                    <div className="w-8 h-8 bg-yellow-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {gamificationStats.level}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-yellow-900">
                    {gamificationStats.level}
                  </div>
                  <p className="text-yellow-600 text-sm mt-1">
                    Nível de experiência
                  </p>
                  <div className="mt-3">
                    <div className="flex justify-between text-sm text-yellow-700 mb-1">
                      <span>XP: {gamificationStats.currentXP}</span>
                      <span>{gamificationStats.xpForNextLevel} XP</span>
                    </div>
                    <Progress
                      value={
                        (gamificationStats.currentXP /
                          gamificationStats.xpForNextLevel) *
                        100
                      }
                      className="h-2 bg-yellow-200 [&>div]:bg-yellow-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-50 to-purple-100 border-purple-200 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-purple-700 text-lg">
                      Conquistas
                    </CardTitle>
                    <div className="w-8 h-8 bg-purple-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {gamificationStats.unlockedCount}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-purple-900">
                    {gamificationStats.unlockedCount}/
                    {gamificationStats.totalCount}
                  </div>
                  <p className="text-purple-600 text-sm mt-1">
                    Conquistas desbloqueadas
                  </p>
                  <div className="mt-3">
                    <Progress
                      value={
                        (gamificationStats.unlockedCount /
                          gamificationStats.totalCount) *
                        100
                      }
                      className="h-2 bg-purple-200 [&>div]:bg-purple-500"
                    />
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-green-50 to-green-100 border-green-200 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-green-700 text-lg">
                      Pontos Totais
                    </CardTitle>
                    <div className="w-8 h-8 bg-green-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {gamificationStats.totalPoints}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-green-900">
                    {gamificationStats.totalPoints}
                  </div>
                  <p className="text-green-600 text-sm mt-1">
                    Pontos acumulados
                  </p>
                  <div className="mt-3">
                    <div className="text-sm text-green-700">
                      <span>
                        Próximo objetivo: {gamificationStats.nextMilestone}{" "}
                        pontos
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-blue-50 to-blue-100 border-blue-200 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <CardTitle className="text-blue-700 text-lg">
                      Ranking
                    </CardTitle>
                    <div className="w-8 h-8 bg-blue-500 rounded-full flex items-center justify-center">
                      <span className="text-white font-bold text-sm">
                        {gamificationStats.rank}
                      </span>
                    </div>
                  </div>
                </CardHeader>
                <CardContent>
                  <div className="text-3xl font-bold text-blue-900">
                    #{gamificationStats.rank}
                  </div>
                  <p className="text-blue-600 text-sm mt-1">Posição global</p>
                  <div className="mt-3">
                    <div className="text-sm text-blue-700">
                      <span>{gamificationStats.rankTitle}</span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Conquistas Recentes */}
            {recentAchievements.length > 0 && (
              <Card className="bg-gradient-to-br from-indigo-50 to-purple-50 border-indigo-200 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardHeader>
                  <CardTitle className="flex items-center gap-2 text-indigo-700">
                    <div className="w-6 h-6 bg-indigo-500 rounded-full flex items-center justify-center">
                      <span className="text-white text-sm">🏆</span>
                    </div>
                    Conquistas Recentes
                  </CardTitle>
                  <CardDescription>
                    Suas últimas conquistas desbloqueadas
                  </CardDescription>
                </CardHeader>
                <CardContent>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                    {recentAchievements.map((achievement) => (
                      <div
                        key={achievement.id}
                        className="bg-white/60 rounded-xl p-4 border border-indigo-100 hover:shadow-md transition-all">
                        <div className="flex items-center gap-3 mb-3">
                          <div
                            className={`w-12 h-12 rounded-xl flex items-center justify-center text-2xl ${
                              achievement.rarity === "common"
                                ? "bg-gray-100"
                                : achievement.rarity === "rare"
                                ? "bg-blue-100"
                                : achievement.rarity === "epic"
                                ? "bg-purple-100"
                                : "bg-yellow-100"
                            }`}>
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-900 text-sm">
                              {achievement.title}
                            </h4>
                            <p className="text-xs text-gray-600">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className={`text-xs ${
                              achievement.rarity === "common"
                                ? "border-gray-300 text-gray-700"
                                : achievement.rarity === "rare"
                                ? "border-blue-300 text-blue-700"
                                : achievement.rarity === "epic"
                                ? "border-purple-300 text-purple-700"
                                : "border-yellow-300 text-yellow-700"
                            }`}>
                            {achievement.rarity === "common"
                              ? "Comum"
                              : achievement.rarity === "rare"
                              ? "Raro"
                              : achievement.rarity === "epic"
                              ? "Épico"
                              : "Lendário"}
                          </Badge>
                          <span className="text-xs text-gray-500">
                            +{achievement.points} pts
                          </span>
                        </div>
                      </div>
                    ))}
                  </div>
                  <div className="mt-4 text-center">
                    <Button
                      variant="outline"
                      onClick={() => router.push("/achievements")}
                      className="border-indigo-300 text-indigo-700 hover:bg-indigo-50">
                      Ver Todas as Conquistas
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Próximas Conquistas */}
            <Card className="bg-gradient-to-br from-orange-50 to-red-50 border-orange-200 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <CardHeader>
                <CardTitle className="flex items-center gap-2 text-orange-700">
                  <div className="w-6 h-6 bg-orange-500 rounded-full flex items-center justify-center">
                    <span className="text-white text-sm">🎯</span>
                  </div>
                  Próximas Conquistas
                </CardTitle>
                <CardDescription>
                  Conquistas que você pode desbloquear em seguida
                </CardDescription>
              </CardHeader>
              <CardContent>
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                  {AchievementsService.getNextAchievements()
                    .slice(0, 3)
                    .map((achievement) => (
                      <div
                        key={achievement.id}
                        className="bg-white/60 rounded-xl p-4 border border-orange-100 opacity-75">
                        <div className="flex items-center gap-3 mb-3">
                          <div className="w-12 h-12 bg-gray-200 rounded-xl flex items-center justify-center text-2xl text-gray-400">
                            {achievement.icon}
                          </div>
                          <div className="flex-1">
                            <h4 className="font-semibold text-gray-700 text-sm">
                              {achievement.title}
                            </h4>
                            <p className="text-xs text-gray-500">
                              {achievement.description}
                            </p>
                          </div>
                        </div>
                        <div className="flex items-center justify-between">
                          <Badge
                            variant="outline"
                            className="border-gray-300 text-gray-600 text-xs">
                            Bloqueada
                          </Badge>
                          <span className="text-xs text-gray-500">
                            +{achievement.points} pts
                          </span>
                        </div>
                      </div>
                    ))}
                </div>
              </CardContent>
            </Card>
          </div>
        )}

        {/* Call to Action */}
        <Card className="bg-gradient-aiudex text-white shadow-aiudex-lg">
          <CardContent className="p-8 text-center">
            <h3 className="text-2xl font-bold mb-4">
              Continue otimizando sua produtividade!
            </h3>
            <p className="text-lg opacity-90 mb-6">
              Cada peça gerada melhora ainda mais suas métricas e economiza
              tempo valioso.
            </p>
            <div className="flex gap-4 justify-center">
              <Button
                size="lg"
                variant="secondary"
                className="bg-white text-blue-600 hover:bg-gray-100"
                onClick={() => router.push("/editor")}>
                <FileText className="w-5 h-5 mr-2" />
                Criar Nova Peça
              </Button>
              <Button
                size="lg"
                variant="secondary"
                className="bg-white/20 backdrop-blur-sm text-white border-white/30 hover:bg-white/30"
                onClick={() => router.push("/dashboard")}>
                <BarChart3 className="w-5 h-5 mr-2" />
                Ver Relatórios
              </Button>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
}
