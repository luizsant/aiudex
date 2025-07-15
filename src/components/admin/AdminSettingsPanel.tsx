import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Settings,
  Calendar as CalendarIcon,
  Download,
  Upload,
  RotateCcw,
  Clock,
  Eye,
  Palette,
  Grid,
  Save,
} from "lucide-react";
import { useAdminSettings } from "@/hooks/useAdminSettings";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AdminSettingsPanelProps {
  isOpen: boolean;
  onClose: () => void;
}

export const AdminSettingsPanel: React.FC<AdminSettingsPanelProps> = ({
  isOpen,
  onClose,
}) => {
  const {
    settings,
    updateSetting,
    resetSettings,
    exportSettings,
    importSettings,
    getFormattedInterval,
  } = useAdminSettings();

  const [importFile, setImportFile] = useState<File | null>(null);

  const handleImport = async () => {
    if (!importFile) {
      toast.error("Selecione um arquivo para importar");
      return;
    }

    try {
      await importSettings(importFile);
      toast.success("Configurações importadas com sucesso!");
      setImportFile(null);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      toast.error(`Erro ao importar: ${errorMessage}`);
    }
  };

  const handleReset = () => {
    resetSettings();
    toast.success("Configurações resetadas para o padrão");
  };

  const handleExport = () => {
    exportSettings();
    toast.success("Configurações exportadas com sucesso!");
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
      <Card className="w-full max-w-4xl max-h-[90vh] overflow-y-auto">
        <CardHeader className="border-b">
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Settings className="h-5 w-5 text-blue-600" />
              <CardTitle>Configurações do Dashboard Admin</CardTitle>
            </div>
            <Button variant="outline" onClick={onClose}>
              Fechar
            </Button>
          </div>
          <CardDescription>
            Personalize o comportamento e aparência do dashboard administrativo
          </CardDescription>
        </CardHeader>

        <CardContent className="p-6 space-y-8">
          {/* Auto-Refresh Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-blue-600" />
              <h3 className="text-lg font-semibold">Auto-Refresh</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="autoRefreshEnabled">Ativar Auto-Refresh</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="autoRefreshEnabled"
                    checked={settings.autoRefreshEnabled}
                    onCheckedChange={(checked) =>
                      updateSetting("autoRefreshEnabled", checked)
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {settings.autoRefreshEnabled ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="refreshInterval">
                  Intervalo de Atualização
                </Label>
                <Select
                  value={settings.autoRefreshInterval.toString()}
                  onValueChange={(value) =>
                    updateSetting("autoRefreshInterval", parseInt(value))
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10000">10 segundos</SelectItem>
                    <SelectItem value="30000">30 segundos</SelectItem>
                    <SelectItem value="60000">1 minuto</SelectItem>
                    <SelectItem value="300000">5 minutos</SelectItem>
                    <SelectItem value="600000">10 minutos</SelectItem>
                  </SelectContent>
                </Select>
                <Badge variant="outline" className="text-xs">
                  Atual: {getFormattedInterval()}
                </Badge>
              </div>
            </div>
          </div>

          <Separator />

          {/* Date Range Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <CalendarIcon className="h-4 w-4 text-green-600" />
              <h3 className="text-lg font-semibold">Período Padrão</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Data Inicial</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {settings.dateRange.from.toLocaleDateString("pt-BR")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={settings.dateRange.from}
                      onSelect={(date) =>
                        date &&
                        updateSetting("dateRange", {
                          ...settings.dateRange,
                          from: date,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>

              <div className="space-y-2">
                <Label>Data Final</Label>
                <Popover>
                  <PopoverTrigger asChild>
                    <Button variant="outline" className="w-full justify-start">
                      <CalendarIcon className="mr-2 h-4 w-4" />
                      {settings.dateRange.to.toLocaleDateString("pt-BR")}
                    </Button>
                  </PopoverTrigger>
                  <PopoverContent className="w-auto p-0" align="start">
                    <Calendar
                      mode="single"
                      selected={settings.dateRange.to}
                      onSelect={(date) =>
                        date &&
                        updateSetting("dateRange", {
                          ...settings.dateRange,
                          to: date,
                        })
                      }
                    />
                  </PopoverContent>
                </Popover>
              </div>
            </div>
          </div>

          <Separator />

          {/* Display Settings */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Eye className="h-4 w-4 text-purple-600" />
              <h3 className="text-lg font-semibold">Exibição</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="defaultView">Visualização Padrão</Label>
                <Select
                  value={settings.defaultView}
                  onValueChange={(value) =>
                    updateSetting("defaultView", value as any)
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="gestao">Gestão</SelectItem>
                    <SelectItem value="comercial">Comercial</SelectItem>
                    <SelectItem value="marketing">Marketing</SelectItem>
                    <SelectItem value="relatorios">Relatórios</SelectItem>
                    <SelectItem value="operacoes">Operações</SelectItem>
                    <SelectItem value="seguranca">Segurança</SelectItem>
                    <SelectItem value="ia">IA & Analytics</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="itemsPerPage">Items por Página</Label>
                <Select
                  value={settings.itemsPerPage.toString()}
                  onValueChange={(value) =>
                    updateSetting("itemsPerPage", parseInt(value) as any)
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="10">10 items</SelectItem>
                    <SelectItem value="25">25 items</SelectItem>
                    <SelectItem value="50">50 items</SelectItem>
                    <SelectItem value="100">100 items</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="exportFormat">Formato de Exportação</Label>
                <Select
                  value={settings.exportFormat}
                  onValueChange={(value) =>
                    updateSetting("exportFormat", value as any)
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="csv">CSV</SelectItem>
                    <SelectItem value="excel">Excel</SelectItem>
                    <SelectItem value="pdf">PDF</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="space-y-2">
                <Label htmlFor="compactMode">Modo Compacto</Label>
                <div className="flex items-center space-x-2">
                  <Switch
                    id="compactMode"
                    checked={settings.compactMode}
                    onCheckedChange={(checked) =>
                      updateSetting("compactMode", checked)
                    }
                  />
                  <span className="text-sm text-gray-600">
                    {settings.compactMode ? "Ativo" : "Inativo"}
                  </span>
                </div>
              </div>
            </div>
          </div>

          <Separator />

          {/* Notifications */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Grid className="h-4 w-4 text-orange-600" />
              <h3 className="text-lg font-semibold">Notificações</h3>
            </div>

            <div className="space-y-2">
              <Label htmlFor="showNotifications">Mostrar Notificações</Label>
              <div className="flex items-center space-x-2">
                <Switch
                  id="showNotifications"
                  checked={settings.showNotifications}
                  onCheckedChange={(checked) =>
                    updateSetting("showNotifications", checked)
                  }
                />
                <span className="text-sm text-gray-600">
                  {settings.showNotifications ? "Ativo" : "Inativo"}
                </span>
              </div>
            </div>
          </div>

          <Separator />

          {/* Import/Export */}
          <div className="space-y-4">
            <div className="flex items-center gap-2">
              <Save className="h-4 w-4 text-indigo-600" />
              <h3 className="text-lg font-semibold">Backup & Restauração</h3>
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Exportar Configurações</Label>
                <Button
                  onClick={handleExport}
                  variant="outline"
                  className="w-full gap-2">
                  <Download className="h-4 w-4" />
                  Baixar Configurações
                </Button>
              </div>

              <div className="space-y-2">
                <Label>Importar Configurações</Label>
                <div className="flex gap-2">
                  <Input
                    type="file"
                    accept=".json"
                    onChange={(e) => setImportFile(e.target.files?.[0] || null)}
                    className="flex-1"
                  />
                  <Button
                    onClick={handleImport}
                    disabled={!importFile}
                    variant="outline"
                    size="sm">
                    <Upload className="h-4 w-4" />
                  </Button>
                </div>
              </div>
            </div>

            <div className="pt-2">
              <Button
                onClick={handleReset}
                variant="destructive"
                className="gap-2">
                <RotateCcw className="h-4 w-4" />
                Resetar para Padrão
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
