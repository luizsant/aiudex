import { AchievementTest } from "@/components/AchievementTest";
import { AchievementTrophies } from "@/components/AchievementTrophies";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";

export const AchievementDemo = () => {
  return (
    <div className="container mx-auto px-4 py-8 space-y-8">
      <div className="text-center">
        <h1 className="text-3xl font-bold mb-4">
          Demonstração dos Troféus de Conquistas
        </h1>
        <p className="text-gray-600 dark:text-gray-400">
          Teste o sistema de troféus que aparece no header de todas as páginas
        </p>
      </div>

      {/* Simulação do Header */}
      <Card>
        <CardHeader>
          <CardTitle>Simulação do Header</CardTitle>
        </CardHeader>
        <CardContent>
          <div className="flex items-center justify-between p-4 bg-white dark:bg-gray-900 border rounded-lg">
            <div className="flex items-center space-x-4">
              {/* Troféus de Conquistas */}
              <div className="hidden md:block">
                <AchievementTrophies maxDisplay={3} />
              </div>

              {/* Logo */}
              <div className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-10 h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 opacity-20 animate-pulse"></div>
                    <div className="w-6 h-6 text-white relative z-10">🤖</div>
                    <div className="absolute -top-1 -right-1 w-3 h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    AIudex
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 -mt-1">
                    AI Jurídica Avançada
                  </span>
                </div>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Componente de Teste */}
      <div className="grid md:grid-cols-2 gap-8">
        <Card>
          <CardHeader>
            <CardTitle>Teste de Conquistas</CardTitle>
          </CardHeader>
          <CardContent>
            <AchievementTest />
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle>Troféus Atuais</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-4">
              <p className="text-sm text-gray-600 dark:text-gray-400">
                Os troféus abaixo mostram suas conquistas mais recentes:
              </p>
              <AchievementTrophies maxDisplay={5} />
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Instruções */}
      <Card>
        <CardHeader>
          <CardTitle>Como Funciona</CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid md:grid-cols-2 gap-4">
            <div>
              <h3 className="font-semibold mb-2">🎯 Troféus no Header</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• Aparecem à esquerda do logo</li>
                <li>• Mostram as 3 conquistas mais recentes</li>
                <li>• Responsivo (oculto em mobile)</li>
                <li>• Tooltip com detalhes ao passar o mouse</li>
              </ul>
            </div>
            <div>
              <h3 className="font-semibold mb-2">🏆 Sistema de Conquistas</h3>
              <ul className="text-sm text-gray-600 dark:text-gray-400 space-y-1">
                <li>• 4 níveis de raridade</li>
                <li>• Atualização automática</li>
                <li>• Persistência no localStorage</li>
                <li>• Eventos personalizados</li>
              </ul>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
