import { useState, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Button } from "@/components/ui/button";
import { Trophy, Star, Zap, Crown, Gem } from "lucide-react";
import { AchievementsService, Achievement } from "@/lib/achievements-service";

export default function Achievements() {
  const [stats, setStats] = useState<any>(null);
  const [achievements, setAchievements] = useState<Achievement[]>([]);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = () => {
    try {
      setIsLoading(true);
      setError(null);

      console.log("Iniciando carregamento de dados...");

      // Inicializar progresso se não existir
      const progress = AchievementsService.getUserProgress();
      console.log("Progresso obtido:", progress);

      if (!progress) {
        console.log("Nenhum progresso encontrado, inicializando...");
        const newProgress = AchievementsService.initializeUserProgress();
        console.log("Novo progresso criado:", newProgress);
        setAchievements(newProgress.achievements);
        setStats(AchievementsService.getGamificationStats());
      } else {
        console.log("Progresso existente encontrado");
        setAchievements(progress.achievements);
        const gamificationStats = AchievementsService.getGamificationStats();
        console.log("Estatísticas de gamificação:", gamificationStats);
        setStats(gamificationStats);
      }
    } catch (error) {
      console.error("Erro ao carregar dados:", error);
      setError(error instanceof Error ? error.message : "Erro desconhecido");
    } finally {
      setIsLoading(false);
    }
  };

  const simulateAchievement = () => {
    try {
      console.log("Simulando conquista...");
      const newAchievements =
        AchievementsService.registerActivity("piece_generated");
      loadData();
    } catch (error) {
      console.error("Erro ao simular conquista:", error);
      setError(
        error instanceof Error ? error.message : "Erro ao simular conquista"
      );
    }
  };

  const clearData = () => {
    try {
      console.log("Limpando dados...");
      AchievementsService.clearData();
      loadData();
    } catch (error) {
      console.error("Erro ao limpar dados:", error);
      setError(error instanceof Error ? error.message : "Erro ao limpar dados");
    }
  };

  // Estado de loading
  if (isLoading) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <PageHeader
          title="Conquistas"
          subtitle="Desbloqueie conquistas e acompanhe seu progresso"
          icon={<Trophy className="w-5 h-5 md:w-6 md:h-6" />}
        />
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex">
            <CardContent className="p-12 text-center">
              <div className="animate-spin w-16 h-16 border-4 border-blue-500 border-t-transparent rounded-full mx-auto mb-6 shadow-aiudex"></div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                🎯 Carregando Conquistas...
              </h3>
              <p className="text-lg text-gray-600">
                Inicializando sistema de gamificação...
              </p>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Estado de erro
  if (error) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <PageHeader
          title="Conquistas"
          subtitle="Desbloqueie conquistas e acompanhe seu progresso"
          icon={<Trophy className="w-5 h-5 md:w-6 md:h-6" />}
        />
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <Card className="bg-white/80 backdrop-blur-sm border-red-200/50 shadow-aiudex">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-red-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-aiudex">
                <span className="text-red-600 text-3xl">⚠️</span>
              </div>
              <h3 className="text-2xl font-bold text-red-600 mb-3">
                Erro ao Carregar Conquistas
              </h3>
              <p className="text-lg text-gray-600 mb-6">{error}</p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={loadData}
                  className="bg-gradient-aiudex hover:shadow-aiudex-lg text-white font-bold px-8 py-3 rounded-xl shadow-aiudex transition-all duration-300">
                  <Trophy className="w-5 h-5 mr-2" />
                  Tentar Novamente
                </Button>
                <Button
                  variant="outline"
                  onClick={clearData}
                  className="bg-white/80 backdrop-blur-sm border-red-200/50 hover:bg-red-50 text-red-700 font-bold px-8 py-3 rounded-xl shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                  <Zap className="w-5 h-5 mr-2" />
                  Limpar Dados
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Estado sem dados
  if (!stats || !achievements.length) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <PageHeader
          title="Conquistas"
          subtitle="Desbloqueie conquistas e acompanhe seu progresso"
          icon={<Trophy className="w-5 h-5 md:w-6 md:h-6" />}
        />
        <div className="max-w-7xl mx-auto p-4 md:p-6">
          <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex">
            <CardContent className="p-12 text-center">
              <div className="w-20 h-20 bg-gradient-aiudex rounded-full flex items-center justify-center mx-auto mb-6 shadow-aiudex">
                <Trophy className="w-10 h-10 text-white" />
              </div>
              <h3 className="text-2xl font-bold text-gray-900 mb-3">
                🎯 Nenhum Progresso Encontrado
              </h3>
              <p className="text-lg text-gray-600 mb-6">
                Comece a usar o sistema para desbloquear conquistas incríveis!
              </p>
              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  onClick={simulateAchievement}
                  className="bg-gradient-aiudex hover:shadow-aiudex-lg text-white font-bold px-8 py-3 rounded-xl shadow-aiudex transition-all duration-300 transform hover:scale-105">
                  <Zap className="w-5 h-5 mr-2" />
                  Simular Conquista (Teste)
                </Button>
                <Button
                  variant="outline"
                  onClick={clearData}
                  className="bg-white/80 backdrop-blur-sm border-blue-200/50 hover:bg-blue-50 text-blue-700 font-bold px-8 py-3 rounded-xl shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                  <Trophy className="w-5 h-5 mr-2" />
                  Limpar e Reinicializar
                </Button>
              </div>
            </CardContent>
          </Card>
        </div>
      </div>
    );
  }

  // Renderização principal
  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Conquistas"
        subtitle="Desbloqueie conquistas e acompanhe seu progresso"
        icon={<Trophy className="w-5 h-5 md:w-6 md:h-6" />}
      />

      <div className="max-w-7xl mx-auto p-4 md:p-6 space-y-8">
        {/* Cards de Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-yellow-500 to-orange-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <Trophy className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Nível</p>
                  <p className="text-2xl font-bold text-white">{stats.level}</p>
                  <div className="mt-2">
                    <Progress
                      value={stats.nextLevel?.progress * 100 || 0}
                      className="h-2 [&>div]:bg-white/30 [&>div]:shadow-aiudex"
                    />
                    <p className="text-xs text-white/80 mt-1">
                      {stats.nextLevel?.pointsNeeded || 0} pts para o próximo
                      nível
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <Star className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Pontos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.totalPoints}
                  </p>
                  <p className="text-xs text-white/80 mt-1">Total acumulado</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <Crown className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Conquistas</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.unlockedCount}/{stats.totalCount}
                  </p>
                  <div className="mt-2">
                    <Progress
                      value={stats.completionRate || 0}
                      className="h-2 [&>div]:bg-white/30 [&>div]:shadow-aiudex"
                    />
                    <p className="text-xs text-white/80 mt-1">
                      {stats.completionRate || 0}% completo
                    </p>
                  </div>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <Zap className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Streak</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.streak}
                  </p>
                  <p className="text-xs text-white/80 mt-1">
                    Dias consecutivos
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Lista de Conquistas */}
        <Card className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
          <CardHeader className="bg-gradient-aiudex text-white border-b-0">
            <CardTitle className="flex items-center space-x-3 text-white">
              <div className="w-8 h-8 bg-white/20 rounded-lg flex items-center justify-center">
                <Trophy className="w-4 h-4 text-white" />
              </div>
              <span>🎯 Todas as Conquistas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="p-6">
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {achievements.map((achievement) => (
                <Card
                  key={achievement.id}
                  className={`transition-all duration-300 hover:shadow-aiudex-lg ${
                    achievement.unlocked
                      ? "bg-white/90 backdrop-blur-sm border-green-200/50 shadow-aiudex"
                      : "bg-gray-50/80 backdrop-blur-sm border-gray-200/50 opacity-75"
                  }`}>
                  <CardContent className="p-6">
                    <div className="flex items-center space-x-4 mb-4">
                      <div
                        className={`w-16 h-16 rounded-xl flex items-center justify-center text-3xl shadow-aiudex ${
                          achievement.unlocked
                            ? achievement.rarity === "common"
                              ? "bg-gradient-to-br from-gray-400 to-gray-600"
                              : achievement.rarity === "rare"
                              ? "bg-gradient-to-br from-blue-400 to-blue-600"
                              : achievement.rarity === "epic"
                              ? "bg-gradient-to-br from-purple-400 to-purple-600"
                              : "bg-gradient-to-br from-yellow-400 to-yellow-600"
                            : "bg-gradient-to-br from-gray-300 to-gray-500"
                        }`}>
                        <span className="text-white drop-shadow-lg">
                          {achievement.icon}
                        </span>
                      </div>
                      <div className="flex-1">
                        <h4
                          className={`font-bold text-lg mb-1 ${
                            achievement.unlocked
                              ? "text-gray-900"
                              : "text-gray-600"
                          }`}>
                          {achievement.title}
                        </h4>
                        <p
                          className={`text-sm ${
                            achievement.unlocked
                              ? "text-gray-600"
                              : "text-gray-500"
                          }`}>
                          {achievement.description}
                        </p>
                      </div>
                    </div>

                    <div className="flex items-center justify-between mb-3">
                      <Badge
                        className={`text-xs font-semibold ${
                          achievement.rarity === "common"
                            ? "bg-gray-100 text-gray-800 border-gray-300"
                            : achievement.rarity === "rare"
                            ? "bg-blue-100 text-blue-800 border-blue-300"
                            : achievement.rarity === "epic"
                            ? "bg-purple-100 text-purple-800 border-purple-300"
                            : "bg-yellow-100 text-yellow-800 border-yellow-300"
                        }`}>
                        {achievement.rarity === "common"
                          ? "Comum"
                          : achievement.rarity === "rare"
                          ? "Raro"
                          : achievement.rarity === "epic"
                          ? "Épico"
                          : "Lendário"}
                      </Badge>
                      <span className="text-xs text-gray-500 font-medium">
                        {achievement.progress}/{achievement.maxProgress}
                      </span>
                    </div>

                    {achievement.unlocked && (
                      <div className="flex items-center space-x-2">
                        <Badge className="bg-gradient-to-r from-green-500 to-emerald-500 text-white text-xs font-bold">
                          +{achievement.points} pts
                        </Badge>
                        <span className="text-xs text-green-600 font-medium">
                          ✓ Desbloqueado
                        </span>
                      </div>
                    )}

                    {!achievement.unlocked && achievement.maxProgress > 1 && (
                      <div className="mt-3">
                        <Progress
                          value={
                            (achievement.progress / achievement.maxProgress) *
                            100
                          }
                          className="h-2 [&>div]:bg-gradient-aiudex [&>div]:shadow-aiudex"
                        />
                        <p className="text-xs text-gray-500 mt-1">
                          Progresso: {achievement.progress}/
                          {achievement.maxProgress}
                        </p>
                      </div>
                    )}
                  </CardContent>
                </Card>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Seção de Ações */}
        <div className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-xl p-8 border border-gray-200 shadow-aiudex">
          <div className="text-center mb-6">
            <h3 className="text-2xl font-bold text-gray-900 mb-2">
              🎮 Gerenciar Conquistas
            </h3>
            <p className="text-lg text-gray-600">
              Teste o sistema de gamificação e gerencie seus dados
            </p>
          </div>

          <div className="flex flex-col sm:flex-row gap-4 justify-center">
            <Button
              onClick={simulateAchievement}
              className="bg-gradient-aiudex hover:shadow-aiudex-lg text-white font-bold px-8 py-3 rounded-xl shadow-aiudex transition-all duration-300 transform hover:scale-105">
              <Zap className="w-5 h-5 mr-2" />
              Simular Conquista
            </Button>
            <Button
              variant="outline"
              onClick={clearData}
              className="bg-white/80 backdrop-blur-sm border-blue-200/50 hover:bg-blue-50 text-blue-700 font-bold px-8 py-3 rounded-xl shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
              <Trophy className="w-5 h-5 mr-2" />
              Limpar Dados
            </Button>
          </div>
        </div>
      </div>
    </div>
  );
}
