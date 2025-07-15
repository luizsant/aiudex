import React, { useState, useEffect } from "react";
import {
  Server,
  Database,
  HardDrive,
  Cpu,
  AlertTriangle,
  CheckCircle,
  Clock,
  RefreshCw,
  Settings,
  Download,
  Upload,
  Play,
  Pause,
  StopCircle,
  Wrench,
  Shield,
  Zap,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Monitor,
  Network,
  Globe,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  Filter,
  Search,
  MoreHorizontal,
  Info,
  AlertCircle,
  XCircle,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Textarea } from "@/components/ui/textarea";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Alert, AlertDescription } from "@/components/ui/alert";

interface ServerStatus {
  id: string;
  name: string;
  status: "online" | "offline" | "warning" | "maintenance";
  cpu: number;
  memory: number;
  disk: number;
  network: number;
  uptime: string;
  lastCheck: string;
  location: string;
  type: "web" | "database" | "cache" | "storage";
}

interface SystemLog {
  id: string;
  timestamp: string;
  level: "info" | "warning" | "error" | "critical";
  service: string;
  message: string;
  details?: string;
}

interface BackupStatus {
  id: string;
  name: string;
  type: "database" | "files" | "system";
  status: "completed" | "running" | "failed" | "scheduled";
  size: string;
  duration: string;
  lastRun: string;
  nextRun: string;
  retention: string;
}

interface MaintenanceTask {
  id: string;
  name: string;
  type: "update" | "backup" | "cleanup" | "security";
  status: "pending" | "running" | "completed" | "failed";
  priority: "low" | "medium" | "high" | "critical";
  scheduledFor: string;
  estimatedDuration: string;
  description: string;
}

const mockServers: ServerStatus[] = [
  {
    id: "1",
    name: "Web Server 01",
    status: "online",
    cpu: 45,
    memory: 67,
    disk: 23,
    network: 89,
    uptime: "15d 8h 32m",
    lastCheck: "2 min ago",
    location: "São Paulo",
    type: "web",
  },
  {
    id: "2",
    name: "Database Server",
    status: "online",
    cpu: 78,
    memory: 82,
    disk: 45,
    network: 34,
    uptime: "8d 12h 15m",
    lastCheck: "1 min ago",
    location: "São Paulo",
    type: "database",
  },
  {
    id: "3",
    name: "Cache Server",
    status: "warning",
    cpu: 92,
    memory: 95,
    disk: 12,
    network: 67,
    uptime: "3d 6h 45m",
    lastCheck: "30 sec ago",
    location: "Rio de Janeiro",
    type: "cache",
  },
  {
    id: "4",
    name: "Storage Server",
    status: "maintenance",
    cpu: 15,
    memory: 28,
    disk: 89,
    network: 12,
    uptime: "0d 2h 10m",
    lastCheck: "5 min ago",
    location: "São Paulo",
    type: "storage",
  },
];

const mockLogs: SystemLog[] = [
  {
    id: "1",
    timestamp: "2024-01-15 14:32:15",
    level: "info",
    service: "Web Server",
    message: "Server started successfully",
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:30:22",
    level: "warning",
    service: "Database",
    message: "High memory usage detected",
    details: "Memory usage at 85% for more than 5 minutes",
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:28:45",
    level: "error",
    service: "Cache Server",
    message: "Connection timeout to Redis",
    details: "Failed to connect to Redis instance after 3 attempts",
  },
  {
    id: "4",
    timestamp: "2024-01-15 14:25:10",
    level: "critical",
    service: "Storage Server",
    message: "Disk space critical",
    details: "Available disk space below 5% threshold",
  },
];

const mockBackups: BackupStatus[] = [
  {
    id: "1",
    name: "Database Daily Backup",
    type: "database",
    status: "completed",
    size: "2.3 GB",
    duration: "15m 32s",
    lastRun: "2024-01-15 02:00:00",
    nextRun: "2024-01-16 02:00:00",
    retention: "30 days",
  },
  {
    id: "2",
    name: "File System Backup",
    type: "files",
    status: "running",
    size: "8.7 GB",
    duration: "45m 12s",
    lastRun: "2024-01-15 03:00:00",
    nextRun: "2024-01-16 03:00:00",
    retention: "7 days",
  },
  {
    id: "3",
    name: "System Configuration",
    type: "system",
    status: "scheduled",
    size: "156 MB",
    duration: "2m 15s",
    lastRun: "2024-01-14 04:00:00",
    nextRun: "2024-01-15 04:00:00",
    retention: "90 days",
  },
];

const mockMaintenanceTasks: MaintenanceTask[] = [
  {
    id: "1",
    name: "Security Updates",
    type: "security",
    status: "pending",
    priority: "high",
    scheduledFor: "2024-01-16 02:00:00",
    estimatedDuration: "30 minutes",
    description: "Apply critical security patches to all servers",
  },
  {
    id: "2",
    name: "Database Optimization",
    type: "update",
    status: "running",
    priority: "medium",
    scheduledFor: "2024-01-15 15:00:00",
    estimatedDuration: "2 hours",
    description: "Optimize database indexes and clean up old data",
  },
  {
    id: "3",
    name: "Log Cleanup",
    type: "cleanup",
    status: "completed",
    priority: "low",
    scheduledFor: "2024-01-15 01:00:00",
    estimatedDuration: "15 minutes",
    description: "Remove old log files older than 30 days",
  },
];

const TechnicalOperations = () => {
  const [servers, setServers] = useState<ServerStatus[]>(mockServers);
  const [logs, setLogs] = useState<SystemLog[]>(mockLogs);
  const [backups, setBackups] = useState<BackupStatus[]>(mockBackups);
  const [maintenanceTasks, setMaintenanceTasks] =
    useState<MaintenanceTask[]>(mockMaintenanceTasks);
  const [selectedServer, setSelectedServer] = useState<ServerStatus | null>(
    null
  );
  const [isServerModalOpen, setIsServerModalOpen] = useState(false);
  const [logFilter, setLogFilter] = useState<string>("all");
  const [serviceFilter, setServiceFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getStatusColor = (status: string) => {
    switch (status) {
      case "online":
        return "bg-green-100 text-green-800";
      case "offline":
        return "bg-red-100 text-red-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "maintenance":
        return "bg-blue-100 text-blue-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getLevelColor = (level: string) => {
    switch (level) {
      case "info":
        return "bg-blue-100 text-blue-800";
      case "warning":
        return "bg-yellow-100 text-yellow-800";
      case "error":
        return "bg-red-100 text-red-800";
      case "critical":
        return "bg-red-200 text-red-900";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPriorityColor = (priority: string) => {
    switch (priority) {
      case "low":
        return "bg-gray-100 text-gray-800";
      case "medium":
        return "bg-blue-100 text-blue-800";
      case "high":
        return "bg-yellow-100 text-yellow-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getServerIcon = (type: string) => {
    switch (type) {
      case "web":
        return <Globe className="w-4 h-4" />;
      case "database":
        return <Database className="w-4 h-4" />;
      case "cache":
        return <Zap className="w-4 h-4" />;
      case "storage":
        return <HardDrive className="w-4 h-4" />;
      default:
        return <Server className="w-4 h-4" />;
    }
  };

  const filteredLogs = logs.filter((log) => {
    const matchesLevel = logFilter === "all" || log.level === logFilter;
    const matchesService =
      serviceFilter === "all" ||
      log.service.toLowerCase().includes(serviceFilter.toLowerCase());
    const matchesSearch = log.message
      .toLowerCase()
      .includes(searchTerm.toLowerCase());
    return matchesLevel && matchesService && matchesSearch;
  });

  const onlineServers = servers.filter((s) => s.status === "online").length;
  const totalServers = servers.length;
  const criticalAlerts = logs.filter((l) => l.level === "critical").length;
  const runningBackups = backups.filter((b) => b.status === "running").length;

  const handleServerAction = (serverId: string, action: string) => {
    const updatedServers = servers.map((server) =>
      server.id === serverId ? { ...server, status: action as any } : server
    );
    setServers(updatedServers);
  };

  const handleMaintenanceAction = (taskId: string, action: string) => {
    const updatedTasks = maintenanceTasks.map((task) =>
      task.id === taskId ? { ...task, status: action as any } : task
    );
    setMaintenanceTasks(updatedTasks);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Operações Técnicas
          </h2>
          <p className="text-gray-600">
            Monitoramento e gestão da infraestrutura técnica
          </p>
        </div>
        <div className="flex items-center space-x-2">
          <Button variant="outline" onClick={() => window.location.reload()}>
            <RefreshCw className="w-4 h-4 mr-2" />
            Atualizar
          </Button>
          <Button>
            <Settings className="w-4 h-4 mr-2" />
            Configurações
          </Button>
        </div>
      </div>

      {/* Alertas Críticos */}
      {criticalAlerts > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {criticalAlerts} alerta(s) crítico(s) detectado(s). Verifique os
            logs do sistema.
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas Principais */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Servidores Online
            </CardTitle>
            <Server className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {onlineServers}/{totalServers}
            </div>
            <p className="text-xs text-muted-foreground">
              {((onlineServers / totalServers) * 100).toFixed(1)}%
              disponibilidade
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Alertas Críticos
            </CardTitle>
            <AlertTriangle className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {criticalAlerts}
            </div>
            <p className="text-xs text-muted-foreground">
              Requerem atenção imediata
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Backups em Execução
            </CardTitle>
            <Download className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{runningBackups}</div>
            <p className="text-xs text-muted-foreground">Backups ativos</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Tarefas Pendentes
            </CardTitle>
            <Clock className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">
              {maintenanceTasks.filter((t) => t.status === "pending").length}
            </div>
            <p className="text-xs text-muted-foreground">Manutenção agendada</p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="servers" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="servers">Servidores</TabsTrigger>
          <TabsTrigger value="logs">Logs do Sistema</TabsTrigger>
          <TabsTrigger value="backups">Backups</TabsTrigger>
          <TabsTrigger value="maintenance">Manutenção</TabsTrigger>
        </TabsList>

        <TabsContent value="servers" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Servidores</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
                {servers.map((server) => (
                  <div
                    key={server.id}
                    className="border rounded-lg p-4 hover:bg-gray-50 transition-colors">
                    <div className="flex items-center justify-between mb-4">
                      <div className="flex items-center space-x-2">
                        {getServerIcon(server.type)}
                        <div>
                          <h3 className="font-semibold">{server.name}</h3>
                          <p className="text-sm text-gray-600">
                            {server.location}
                          </p>
                        </div>
                      </div>
                      <Badge className={getStatusColor(server.status)}>
                        {server.status === "online" && (
                          <CheckCircle className="w-3 h-3 mr-1" />
                        )}
                        {server.status === "warning" && (
                          <AlertTriangle className="w-3 h-3 mr-1" />
                        )}
                        {server.status === "maintenance" && (
                          <Wrench className="w-3 h-3 mr-1" />
                        )}
                        {server.status}
                      </Badge>
                    </div>

                    <div className="space-y-3">
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>CPU</span>
                          <span>{server.cpu}%</span>
                        </div>
                        <Progress value={server.cpu} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Memória</span>
                          <span>{server.memory}%</span>
                        </div>
                        <Progress value={server.memory} className="h-2" />
                      </div>
                      <div>
                        <div className="flex justify-between text-sm mb-1">
                          <span>Disco</span>
                          <span>{server.disk}%</span>
                        </div>
                        <Progress value={server.disk} className="h-2" />
                      </div>
                    </div>

                    <div className="mt-4 pt-4 border-t">
                      <div className="flex justify-between text-sm text-gray-600">
                        <span>Uptime: {server.uptime}</span>
                        <span>Última verificação: {server.lastCheck}</span>
                      </div>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      {server.status === "online" && (
                        <>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleServerAction(server.id, "maintenance")
                            }>
                            <Wrench className="w-4 h-4 mr-1" />
                            Manutenção
                          </Button>
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleServerAction(server.id, "offline")
                            }>
                            <StopCircle className="w-4 h-4 mr-1" />
                            Desligar
                          </Button>
                        </>
                      )}
                      {server.status === "maintenance" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleServerAction(server.id, "online")
                          }>
                          <Play className="w-4 h-4 mr-1" />
                          Ativar
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedServer(server);
                          setIsServerModalOpen(true);
                        }}>
                        <Eye className="w-4 h-4 mr-1" />
                        Detalhes
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="logs" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Logs do Sistema</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={logFilter} onValueChange={setLogFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="info">Info</SelectItem>
                      <SelectItem value="warning">Warning</SelectItem>
                      <SelectItem value="error">Error</SelectItem>
                      <SelectItem value="critical">Critical</SelectItem>
                    </SelectContent>
                  </Select>
                  <Input
                    placeholder="Buscar logs..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-2">
                {filteredLogs.map((log) => (
                  <div
                    key={log.id}
                    className="flex items-start space-x-3 p-3 border rounded-lg hover:bg-gray-50">
                    <Badge className={getLevelColor(log.level)}>
                      {log.level.toUpperCase()}
                    </Badge>
                    <div className="flex-1 min-w-0">
                      <div className="flex items-center justify-between">
                        <span className="font-medium">{log.service}</span>
                        <span className="text-sm text-gray-500">
                          {log.timestamp}
                        </span>
                      </div>
                      <p className="text-sm text-gray-700 mt-1">
                        {log.message}
                      </p>
                      {log.details && (
                        <p className="text-xs text-gray-500 mt-1">
                          {log.details}
                        </p>
                      )}
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="backups" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Status dos Backups</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {backups.map((backup) => (
                  <div
                    key={backup.id}
                    className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{backup.name}</h3>
                        <p className="text-sm text-gray-600">
                          Tipo: {backup.type} | Tamanho: {backup.size}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(backup.status)}>
                          {backup.status === "completed" && (
                            <CheckCircle className="w-3 h-3 mr-1" />
                          )}
                          {backup.status === "running" && (
                            <RefreshCw className="w-3 h-3 mr-1 animate-spin" />
                          )}
                          {backup.status}
                        </Badge>
                        <p className="text-sm text-gray-600 mt-1">
                          Próximo: {backup.nextRun}
                        </p>
                      </div>
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-1" />
                        Download
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="maintenance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Tarefas de Manutenção</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {maintenanceTasks.map((task) => (
                  <div
                    key={task.id}
                    className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{task.name}</h3>
                        <p className="text-sm text-gray-600">
                          {task.description}
                        </p>
                        <p className="text-xs text-gray-500 mt-1">
                          Agendado para: {task.scheduledFor} | Duração:{" "}
                          {task.estimatedDuration}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getPriorityColor(task.priority)}>
                          {task.priority}
                        </Badge>
                        <Badge className={getStatusColor(task.status)}>
                          {task.status}
                        </Badge>
                      </div>
                      <div className="flex space-x-2">
                        {task.status === "pending" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleMaintenanceAction(task.id, "running")
                            }>
                            <Play className="w-4 h-4 mr-1" />
                            Executar
                          </Button>
                        )}
                        {task.status === "running" && (
                          <Button
                            variant="outline"
                            size="sm"
                            onClick={() =>
                              handleMaintenanceAction(task.id, "completed")
                            }>
                            <CheckCircle className="w-4 h-4 mr-1" />
                            Concluir
                          </Button>
                        )}
                        <Button variant="outline" size="sm">
                          <MoreHorizontal className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>
      </Tabs>

      {/* Modal de Detalhes do Servidor */}
      <Dialog open={isServerModalOpen} onOpenChange={setIsServerModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Servidor</DialogTitle>
          </DialogHeader>
          {selectedServer && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Nome</Label>
                  <p className="font-medium">{selectedServer.name}</p>
                </div>
                <div>
                  <Label>Tipo</Label>
                  <p className="font-medium">{selectedServer.type}</p>
                </div>
                <div>
                  <Label>Localização</Label>
                  <p className="font-medium">{selectedServer.location}</p>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedServer.status)}>
                    {selectedServer.status}
                  </Badge>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Métricas de Recursos</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">CPU</p>
                    <p className="font-medium">{selectedServer.cpu}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Memória</p>
                    <p className="font-medium">{selectedServer.memory}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Disco</p>
                    <p className="font-medium">{selectedServer.disk}%</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Rede</p>
                    <p className="font-medium">{selectedServer.network}%</p>
                  </div>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Informações do Sistema</Label>
                <div className="grid grid-cols-2 gap-4 mt-2">
                  <div>
                    <p className="text-sm text-gray-600">Uptime</p>
                    <p className="font-medium">{selectedServer.uptime}</p>
                  </div>
                  <div>
                    <p className="text-sm text-gray-600">Última Verificação</p>
                    <p className="font-medium">{selectedServer.lastCheck}</p>
                  </div>
                </div>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default TechnicalOperations;
