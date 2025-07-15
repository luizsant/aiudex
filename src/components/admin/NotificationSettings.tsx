import React from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import {
  Bell,
  BellRing,
  Volume2,
  VolumeX,
  Monitor,
  Smartphone,
  Shield,
  AlertTriangle,
  TestTube,
  CheckCircle,
  XCircle,
} from "lucide-react";
import { useRealTimeNotifications } from "@/hooks/useRealTimeNotifications";
import { toast } from "sonner";

interface NotificationSettingsProps {
  className?: string;
}

export const NotificationSettings: React.FC<NotificationSettingsProps> = ({
  className,
}) => {
  const {
    config,
    updateConfig,
    isPermissionGranted,
    requestNotificationPermission,
    testNotification,
    simulateRealTimeEvents,
    getConnectionStatus,
  } = useRealTimeNotifications();

  const connectionStatus = getConnectionStatus();

  const handlePermissionRequest = async () => {
    const granted = await requestNotificationPermission();
    if (granted) {
      toast.success("Permissão concedida para notificações desktop!");
    } else {
      toast.error("Permissão negada para notificações desktop");
    }
  };

  const handleTestNotification = () => {
    testNotification();
    toast.info("Notificação de teste enviada!");
  };

  const handleSimulateEvents = () => {
    simulateRealTimeEvents();
    toast.info("Eventos simulados adicionados!");
  };

  const categoryLabels = {
    user: "Usuários",
    financial: "Financeiro",
    system: "Sistema",
    security: "Segurança",
    performance: "Performance",
  };

  const priorityLabels = {
    low: "Baixa",
    medium: "Média",
    high: "Alta",
    critical: "Crítica",
  };

  return (
    <Card className={className}>
      <CardHeader>
        <div className="flex items-center gap-2">
          <Bell className="h-5 w-5 text-blue-600" />
          <CardTitle>Configurações de Notificação</CardTitle>
        </div>
        <CardDescription>
          Configure como e quando receber notificações do sistema
        </CardDescription>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Status da Conexão */}
        <div className="space-y-3">
          <Label className="text-sm font-medium">Status do Sistema</Label>
          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {connectionStatus.isOnline ? (
                <CheckCircle className="h-4 w-4 text-green-600" />
              ) : (
                <XCircle className="h-4 w-4 text-red-600" />
              )}
              <span className="text-sm">
                {connectionStatus.isOnline ? "Online" : "Offline"}
              </span>
            </div>

            <div className="flex items-center gap-2 p-3 bg-gray-50 rounded-lg">
              {connectionStatus.isEnabled ? (
                <BellRing className="h-4 w-4 text-blue-600" />
              ) : (
                <Bell className="h-4 w-4 text-gray-400" />
              )}
              <span className="text-sm">
                {connectionStatus.isEnabled ? "Ativo" : "Inativo"}
              </span>
            </div>
          </div>
        </div>

        <Separator />

        {/* Configurações Gerais */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Configurações Gerais</Label>

          <div className="space-y-3">
            <div className="flex items-center justify-between">
              <div className="space-y-1">
                <Label htmlFor="notifications-enabled">
                  Ativar Notificações
                </Label>
                <p className="text-sm text-gray-600">
                  Receber notificações em tempo real
                </p>
              </div>
              <Switch
                id="notifications-enabled"
                checked={config.enabled}
                onCheckedChange={(checked) =>
                  updateConfig({ enabled: checked })
                }
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="check-interval">Intervalo de Verificação</Label>
              <Select
                value={config.checkInterval.toString()}
                onValueChange={(value) =>
                  updateConfig({ checkInterval: parseInt(value) })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="10000">10 segundos</SelectItem>
                  <SelectItem value="30000">30 segundos</SelectItem>
                  <SelectItem value="60000">1 minuto</SelectItem>
                  <SelectItem value="300000">5 minutos</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label htmlFor="min-priority">Prioridade Mínima</Label>
              <Select
                value={config.minPriority}
                onValueChange={(value) =>
                  updateConfig({ minPriority: value as any })
                }>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </div>

        <Separator />

        {/* Tipos de Notificação */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Tipos de Notificação</Label>

          <div className="grid grid-cols-2 gap-3">
            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                <Monitor className="h-4 w-4 text-blue-600" />
                <span className="text-sm">Desktop</span>
              </div>
              <div className="flex items-center gap-2">
                <Switch
                  checked={config.enableDesktopNotifications}
                  onCheckedChange={(checked) =>
                    updateConfig({ enableDesktopNotifications: checked })
                  }
                />
                {isPermissionGranted ? (
                  <CheckCircle className="h-4 w-4 text-green-600" />
                ) : (
                  <XCircle className="h-4 w-4 text-red-600" />
                )}
              </div>
            </div>

            <div className="flex items-center justify-between p-3 bg-gray-50 rounded-lg">
              <div className="flex items-center gap-2">
                {config.enableSounds ? (
                  <Volume2 className="h-4 w-4 text-green-600" />
                ) : (
                  <VolumeX className="h-4 w-4 text-gray-400" />
                )}
                <span className="text-sm">Sons</span>
              </div>
              <Switch
                checked={config.enableSounds}
                onCheckedChange={(checked) =>
                  updateConfig({ enableSounds: checked })
                }
              />
            </div>
          </div>

          {!isPermissionGranted && config.enableDesktopNotifications && (
            <div className="p-3 bg-yellow-50 border border-yellow-200 rounded-lg">
              <div className="flex items-center gap-2 mb-2">
                <AlertTriangle className="h-4 w-4 text-yellow-600" />
                <span className="text-sm font-medium text-yellow-800">
                  Permissão Necessária
                </span>
              </div>
              <p className="text-sm text-yellow-700 mb-3">
                Para receber notificações desktop, é necessário conceder
                permissão.
              </p>
              <Button
                size="sm"
                onClick={handlePermissionRequest}
                className="bg-yellow-600 hover:bg-yellow-700">
                Solicitar Permissão
              </Button>
            </div>
          )}
        </div>

        <Separator />

        {/* Categorias */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Categorias Ativas</Label>

          <div className="grid grid-cols-2 gap-2">
            {Object.entries(categoryLabels).map(([key, label]) => (
              <div key={key} className="flex items-center space-x-2">
                <input
                  type="checkbox"
                  id={`category-${key}`}
                  checked={config.enabledCategories.includes(key)}
                  onChange={(e) => {
                    const newCategories = e.target.checked
                      ? [...config.enabledCategories, key]
                      : config.enabledCategories.filter((c) => c !== key);
                    updateConfig({ enabledCategories: newCategories });
                  }}
                  className="rounded border-gray-300"
                />
                <Label htmlFor={`category-${key}`} className="text-sm">
                  {label}
                </Label>
              </div>
            ))}
          </div>
        </div>

        <Separator />

        {/* Ações de Teste */}
        <div className="space-y-4">
          <Label className="text-sm font-medium">Testes e Simulação</Label>

          <div className="flex flex-wrap gap-2">
            <Button
              variant="outline"
              size="sm"
              onClick={handleTestNotification}
              className="gap-2">
              <TestTube className="h-4 w-4" />
              Testar Notificação
            </Button>

            <Button
              variant="outline"
              size="sm"
              onClick={handleSimulateEvents}
              className="gap-2">
              <Smartphone className="h-4 w-4" />
              Simular Eventos
            </Button>
          </div>
        </div>

        {/* Informações Adicionais */}
        <div className="space-y-2">
          <Label className="text-sm font-medium">Informações</Label>
          <div className="grid grid-cols-2 gap-3 text-xs text-gray-600">
            <div>
              <span className="font-medium">Última Verificação:</span>
              <br />
              {connectionStatus.lastCheck.toLocaleTimeString("pt-BR")}
            </div>
            <div>
              <span className="font-medium">Próxima Verificação:</span>
              <br />
              {connectionStatus.nextCheck.toLocaleTimeString("pt-BR")}
            </div>
          </div>
        </div>
      </CardContent>
    </Card>
  );
};
