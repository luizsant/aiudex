import React, { useState, useEffect } from "react";
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
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
  AlertDialogTrigger,
} from "@/components/ui/alert-dialog";
import {
  Database,
  Download,
  Upload,
  Trash2,
  RefreshCw,
  CheckCircle,
  AlertTriangle,
  Clock,
  HardDrive,
  Shield,
  Zap,
} from "lucide-react";
import { backupAuditService, BackupData } from "@/lib/backup-audit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface BackupManagerProps {
  className?: string;
}

const backupTypeLabels = {
  full: "Completo",
  incremental: "Incremental",
  differential: "Diferencial",
};

const backupTypeColors = {
  full: "bg-blue-100 text-blue-800",
  incremental: "bg-green-100 text-green-800",
  differential: "bg-orange-100 text-orange-800",
};

export const BackupManager: React.FC<BackupManagerProps> = ({ className }) => {
  const [backups, setBackups] = useState<BackupData[]>([]);
  const [isCreatingBackup, setIsCreatingBackup] = useState(false);
  const [isRestoringBackup, setIsRestoringBackup] = useState(false);
  const [backupProgress, setBackupProgress] = useState(0);
  const [newBackupDescription, setNewBackupDescription] = useState("");
  const [selectedBackupType, setSelectedBackupType] = useState<
    "full" | "incremental" | "differential"
  >("incremental");

  useEffect(() => {
    loadBackups();
  }, []);

  const loadBackups = () => {
    const allBackups = backupAuditService.getBackups();
    setBackups(allBackups);
  };

  const createBackup = async () => {
    if (!newBackupDescription.trim()) {
      toast.error("Descrição do backup é obrigatória");
      return;
    }

    setIsCreatingBackup(true);
    setBackupProgress(0);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setBackupProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const backup = await backupAuditService.createBackup(
        selectedBackupType,
        newBackupDescription
      );

      clearInterval(progressInterval);
      setBackupProgress(100);

      setTimeout(() => {
        loadBackups();
        setNewBackupDescription("");
        setBackupProgress(0);
        toast.success("Backup criado com sucesso!");
      }, 500);
    } catch (error) {
      toast.error("Erro ao criar backup");
      console.error(error);
    } finally {
      setIsCreatingBackup(false);
    }
  };

  const restoreBackup = async (backupId: string) => {
    setIsRestoringBackup(true);

    try {
      const success = await backupAuditService.restoreBackup(backupId);

      if (success) {
        toast.success("Backup restaurado com sucesso!");
        // Recarregar a página para refletir os dados restaurados
        setTimeout(() => {
          window.location.reload();
        }, 1000);
      } else {
        toast.error("Erro ao restaurar backup");
      }
    } catch (error) {
      toast.error("Erro ao restaurar backup");
      console.error(error);
    } finally {
      setIsRestoringBackup(false);
    }
  };

  const cleanupExpiredBackups = () => {
    const cleanedCount = backupAuditService.cleanupExpiredBackups();
    loadBackups();
    toast.success(`${cleanedCount} backup(s) expirado(s) removido(s)`);
  };

  const formatFileSize = (bytes: number): string => {
    const sizes = ["Bytes", "KB", "MB", "GB"];
    if (bytes === 0) return "0 Bytes";
    const i = Math.floor(Math.log(bytes) / Math.log(1024));
    return Math.round((bytes / Math.pow(1024, i)) * 100) / 100 + " " + sizes[i];
  };

  const formatDate = (date: Date): string => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    }).format(date);
  };

  const isBackupExpired = (backup: BackupData): boolean => {
    return backup.retention < new Date();
  };

  const getDaysUntilExpiration = (backup: BackupData): number => {
    const now = new Date();
    const diffTime = backup.retention.getTime() - now.getTime();
    return Math.ceil(diffTime / (1000 * 60 * 60 * 24));
  };

  const getTotalBackupSize = (): string => {
    const totalBytes = backups.reduce((sum, backup) => sum + backup.size, 0);
    return formatFileSize(totalBytes);
  };

  const getBackupStats = () => {
    const total = backups.length;
    const expired = backups.filter(isBackupExpired).length;
    const thisWeek = backups.filter((backup) => {
      const weekAgo = new Date(Date.now() - 7 * 24 * 60 * 60 * 1000);
      return backup.timestamp >= weekAgo;
    }).length;

    return { total, expired, thisWeek };
  };

  const stats = getBackupStats();

  return (
    <div className={cn("space-y-6", className)}>
      {/* Estatísticas */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Database className="h-4 w-4 text-blue-600" />
              <div>
                <p className="text-sm font-medium">Total de Backups</p>
                <p className="text-2xl font-bold">{stats.total}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <Clock className="h-4 w-4 text-green-600" />
              <div>
                <p className="text-sm font-medium">Esta Semana</p>
                <p className="text-2xl font-bold">{stats.thisWeek}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <AlertTriangle className="h-4 w-4 text-orange-600" />
              <div>
                <p className="text-sm font-medium">Expirados</p>
                <p className="text-2xl font-bold">{stats.expired}</p>
              </div>
            </div>
          </CardContent>
        </Card>

        <Card>
          <CardContent className="p-4">
            <div className="flex items-center gap-2">
              <HardDrive className="h-4 w-4 text-purple-600" />
              <div>
                <p className="text-sm font-medium">Tamanho Total</p>
                <p className="text-2xl font-bold">{getTotalBackupSize()}</p>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Criar Backup */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Database className="h-4 w-4 text-blue-600" />
            Criar Novo Backup
          </CardTitle>
          <CardDescription>
            Crie um backup dos dados do sistema com diferentes tipos de
            cobertura
          </CardDescription>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label htmlFor="backup-description">Descrição</Label>
              <Input
                id="backup-description"
                placeholder="Ex: Backup antes da atualização"
                value={newBackupDescription}
                onChange={(e) => setNewBackupDescription(e.target.value)}
                disabled={isCreatingBackup}
              />
            </div>

            <div className="space-y-2">
              <Label htmlFor="backup-type">Tipo de Backup</Label>
              <Select
                value={selectedBackupType}
                onValueChange={(value) => setSelectedBackupType(value as any)}
                disabled={isCreatingBackup}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="full">
                    Completo - Todos os dados
                  </SelectItem>
                  <SelectItem value="incremental">
                    Incremental - Apenas mudanças
                  </SelectItem>
                  <SelectItem value="differential">
                    Diferencial - Mudanças desde o último completo
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>

          {isCreatingBackup && (
            <div className="space-y-2">
              <div className="flex items-center justify-between">
                <Label>Progresso do Backup</Label>
                <span className="text-sm text-gray-600">{backupProgress}%</span>
              </div>
              <Progress value={backupProgress} className="w-full" />
            </div>
          )}

          <div className="flex items-center gap-2">
            <Button
              onClick={createBackup}
              disabled={isCreatingBackup || !newBackupDescription.trim()}
              className="gap-2">
              {isCreatingBackup ? (
                <RefreshCw className="h-4 w-4 animate-spin" />
              ) : (
                <Download className="h-4 w-4" />
              )}
              {isCreatingBackup ? "Criando..." : "Criar Backup"}
            </Button>

            <Button
              variant="outline"
              onClick={cleanupExpiredBackups}
              disabled={isCreatingBackup}
              className="gap-2">
              <Trash2 className="h-4 w-4" />
              Limpar Expirados
            </Button>

            <Button
              variant="outline"
              onClick={loadBackups}
              disabled={isCreatingBackup}
              className="gap-2">
              <RefreshCw className="h-4 w-4" />
              Atualizar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Backups */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <HardDrive className="h-4 w-4 text-blue-600" />
            Backups Disponíveis
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="overflow-x-auto">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Data/Hora</TableHead>
                  <TableHead>Tipo</TableHead>
                  <TableHead>Descrição</TableHead>
                  <TableHead>Tamanho</TableHead>
                  <TableHead>Registros</TableHead>
                  <TableHead>Expiração</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {backups.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-500 py-8">
                      Nenhum backup encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  backups.map((backup) => {
                    const expired = isBackupExpired(backup);
                    const daysUntilExpiration = getDaysUntilExpiration(backup);

                    return (
                      <TableRow key={backup.id}>
                        <TableCell className="font-mono text-sm">
                          {formatDate(backup.timestamp)}
                        </TableCell>

                        <TableCell>
                          <Badge className={backupTypeColors[backup.type]}>
                            {backupTypeLabels[backup.type]}
                          </Badge>
                        </TableCell>

                        <TableCell>
                          <div>
                            <div className="font-medium text-sm">
                              {backup.metadata.description || "Sem descrição"}
                            </div>
                            <div className="text-xs text-gray-500">
                              v{backup.metadata.version}
                            </div>
                          </div>
                        </TableCell>

                        <TableCell>{formatFileSize(backup.size)}</TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {backup.metadata.recordCount.toLocaleString(
                              "pt-BR"
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="text-sm">
                            {formatDate(backup.retention)}
                            {!expired && (
                              <div className="text-xs text-gray-500">
                                {daysUntilExpiration > 0
                                  ? `${daysUntilExpiration} dias`
                                  : "Hoje"}
                              </div>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-2">
                            {expired ? (
                              <Badge variant="destructive" className="text-xs">
                                <AlertTriangle className="h-3 w-3 mr-1" />
                                Expirado
                              </Badge>
                            ) : (
                              <Badge variant="secondary" className="text-xs">
                                <CheckCircle className="h-3 w-3 mr-1" />
                                Válido
                              </Badge>
                            )}

                            {backup.compressed && (
                              <Badge variant="outline" className="text-xs">
                                <Zap className="h-3 w-3 mr-1" />
                                Comprimido
                              </Badge>
                            )}

                            {backup.encrypted && (
                              <Badge variant="outline" className="text-xs">
                                <Shield className="h-3 w-3 mr-1" />
                                Criptografado
                              </Badge>
                            )}
                          </div>
                        </TableCell>

                        <TableCell>
                          <div className="flex items-center gap-1">
                            <AlertDialog>
                              <AlertDialogTrigger asChild>
                                <Button
                                  variant="outline"
                                  size="sm"
                                  disabled={expired || isRestoringBackup}>
                                  <Upload className="h-4 w-4" />
                                </Button>
                              </AlertDialogTrigger>
                              <AlertDialogContent>
                                <AlertDialogHeader>
                                  <AlertDialogTitle>
                                    Restaurar Backup
                                  </AlertDialogTitle>
                                  <AlertDialogDescription>
                                    Esta ação irá sobrescrever todos os dados
                                    atuais com os dados do backup. Esta operação
                                    não pode ser desfeita.
                                  </AlertDialogDescription>
                                </AlertDialogHeader>
                                <AlertDialogFooter>
                                  <AlertDialogCancel>
                                    Cancelar
                                  </AlertDialogCancel>
                                  <AlertDialogAction
                                    onClick={() => restoreBackup(backup.id)}
                                    className="bg-red-600 hover:bg-red-700">
                                    Restaurar
                                  </AlertDialogAction>
                                </AlertDialogFooter>
                              </AlertDialogContent>
                            </AlertDialog>
                          </div>
                        </TableCell>
                      </TableRow>
                    );
                  })
                )}
              </TableBody>
            </Table>
          </div>
        </CardContent>
      </Card>

      {/* Informações Adicionais */}
      <Card>
        <CardHeader>
          <CardTitle className="text-lg">
            Informações do Sistema de Backup
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4 text-sm">
            <div>
              <h4 className="font-medium mb-2">Tipos de Backup:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>
                  <strong>Completo:</strong> Backup de todos os dados
                </li>
                <li>
                  <strong>Incremental:</strong> Apenas dados modificados desde o
                  último backup
                </li>
                <li>
                  <strong>Diferencial:</strong> Dados modificados desde o último
                  backup completo
                </li>
              </ul>
            </div>

            <div>
              <h4 className="font-medium mb-2">Retenção:</h4>
              <ul className="space-y-1 text-gray-600">
                <li>
                  <strong>Padrão:</strong> 90 dias
                </li>
                <li>
                  <strong>Limpeza:</strong> Automática de backups expirados
                </li>
                <li>
                  <strong>Compressão:</strong> Ativa por padrão
                </li>
              </ul>
            </div>
          </div>

          <div className="p-3 bg-blue-50 rounded-lg">
            <p className="text-sm text-blue-800">
              <strong>Dica:</strong> Backups são criados automaticamente todos
              os dias às 2:00 AM. Recomenda-se criar backups manuais antes de
              mudanças importantes no sistema.
            </p>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
