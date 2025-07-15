import { AchievementsService } from "@/lib/achievements-service";

export const SimpleTrophy = () => {
  const progress = AchievementsService.getUserProgress();
  const unlockedCount =
    progress?.achievements.filter((a) => a.unlocked).length || 0;

  console.log(
    "SimpleTrophy: Renderizando, conquistas desbloqueadas:",
    unlockedCount
  );

  return (
    <div className="bg-purple-200 border-2 border-purple-500 p-2 rounded">
      <div className="text-xs font-bold text-purple-800">
        🏆 Conquistas: {unlockedCount}
      </div>
      {progress?.achievements
        .filter((a) => a.unlocked)
        .slice(0, 2)
        .map((achievement) => (
          <div key={achievement.id} className="text-xs text-purple-700 mt-1">
            {achievement.icon} {achievement.title}
          </div>
        ))}
    </div>
  );
};
