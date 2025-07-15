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
import { ScrollArea } from "@/components/ui/scroll-area";
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
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Separator } from "@/components/ui/separator";
import {
  Shield,
  Calendar as CalendarIcon,
  Download,
  Search,
  Filter,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Eye,
  RefreshCw,
  FileText,
  Users,
  Activity,
  Database,
  Settings,
} from "lucide-react";
import { backupAuditService, AuditLog } from "@/lib/backup-audit";
import { toast } from "sonner";
import { cn } from "@/lib/utils";

interface AuditLogsProps {
  className?: string;
}

const severityColors = {
  low: "bg-gray-100 text-gray-800",
  medium: "bg-blue-100 text-blue-800",
  high: "bg-orange-100 text-orange-800",
  critical: "bg-red-100 text-red-800",
};

const categoryIcons = {
  authentication: Users,
  data: Database,
  system: Settings,
  security: Shield,
  admin: Activity,
};

export const AuditLogs: React.FC<AuditLogsProps> = ({ className }) => {
  const [logs, setLogs] = useState<AuditLog[]>([]);
  const [filteredLogs, setFilteredLogs] = useState<AuditLog[]>([]);
  const [filters, setFilters] = useState({
    startDate: new Date(Date.now() - 7 * 24 * 60 * 60 * 1000), // 7 dias atrás
    endDate: new Date(),
    userId: "",
    action: "",
    category: "all",
    severity: "all",
    success: "all",
  });
  const [searchTerm, setSearchTerm] = useState("");
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);
  const [stats, setStats] = useState<any>(null);

  // Carregar dados
  useEffect(() => {
    loadLogs();
    loadStats();
  }, []);

  // Aplicar filtros
  useEffect(() => {
    applyFilters();
  }, [logs, filters, searchTerm]);

  const loadLogs = () => {
    const allLogs = backupAuditService.getAuditLogs();
    setLogs(allLogs);
  };

  const loadStats = () => {
    const auditStats = backupAuditService.getAuditStats();
    setStats(auditStats);
  };

  const applyFilters = () => {
    let filtered = backupAuditService.getAuditLogs({
      startDate: filters.startDate,
      endDate: filters.endDate,
      userId: filters.userId || undefined,
      action: filters.action || undefined,
      category: filters.category !== "all" ? filters.category : undefined,
      severity: filters.severity !== "all" ? filters.severity : undefined,
    });

    // Filtrar por sucesso
    if (filters.success !== "all") {
      filtered = filtered.filter((log) =>
        filters.success === "success" ? log.success : !log.success
      );
    }

    // Filtrar por termo de busca
    if (searchTerm) {
      const term = searchTerm.toLowerCase();
      filtered = filtered.filter(
        (log) =>
          log.userEmail.toLowerCase().includes(term) ||
          log.action.toLowerCase().includes(term) ||
          log.resource.toLowerCase().includes(term) ||
          (log.errorMessage && log.errorMessage.toLowerCase().includes(term))
      );
    }

    setFilteredLogs(filtered);
  };

  const updateFilter = (key: string, value: any) => {
    setFilters((prev) => ({ ...prev, [key]: value }));
  };

  const exportLogs = (format: "csv" | "json") => {
    try {
      backupAuditService.exportAuditLogs(format, {
        startDate: filters.startDate,
        endDate: filters.endDate,
      });
      toast.success(`Logs exportados como ${format.toUpperCase()}`);
    } catch (error) {
      toast.error("Erro ao exportar logs");
    }
  };

  const getSeverityIcon = (severity: string) => {
    switch (severity) {
      case "critical":
        return <XCircle className="h-4 w-4 text-red-600" />;
      case "high":
        return <AlertTriangle className="h-4 w-4 text-orange-600" />;
      case "medium":
        return <AlertTriangle className="h-4 w-4 text-blue-600" />;
      default:
        return <CheckCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  const getCategoryIcon = (category: string) => {
    const IconComponent =
      categoryIcons[category as keyof typeof categoryIcons] || Activity;
    return <IconComponent className="h-4 w-4" />;
  };

  const formatTimestamp = (timestamp: Date) => {
    return new Intl.DateTimeFormat("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
      second: "2-digit",
    }).format(timestamp);
  };

  return (
    <div className={cn("space-y-6", className)}>
      {/* Estatísticas */}
      {stats && (
        <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <FileText className="h-4 w-4 text-blue-600" />
                <div>
                  <p className="text-sm font-medium">Total de Logs</p>
                  <p className="text-2xl font-bold">{stats.totalLogs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <Activity className="h-4 w-4 text-green-600" />
                <div>
                  <p className="text-sm font-medium">Hoje</p>
                  <p className="text-2xl font-bold">{stats.todayLogs}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <XCircle className="h-4 w-4 text-red-600" />
                <div>
                  <p className="text-sm font-medium">Falhas</p>
                  <p className="text-2xl font-bold">{stats.failedActions}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardContent className="p-4">
              <div className="flex items-center gap-2">
                <AlertTriangle className="h-4 w-4 text-orange-600" />
                <div>
                  <p className="text-sm font-medium">Críticos</p>
                  <p className="text-2xl font-bold">{stats.criticalEvents}</p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2">
              <Filter className="h-4 w-4 text-blue-600" />
              <CardTitle className="text-lg">Filtros de Auditoria</CardTitle>
            </div>
            <div className="flex items-center gap-2">
              <Button variant="outline" size="sm" onClick={loadLogs}>
                <RefreshCw className="h-4 w-4" />
              </Button>
              <Select onValueChange={(format) => exportLogs(format as any)}>
                <SelectTrigger className="w-24">
                  <Download className="h-4 w-4" />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="csv">CSV</SelectItem>
                  <SelectItem value="json">JSON</SelectItem>
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Busca */}
          <div className="space-y-2">
            <Label>Buscar</Label>
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar por usuário, ação, recurso..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>
          </div>

          {/* Período */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-2">
              <Label>Data Inicial</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button variant="outline" className="w-full justify-start">
                    <CalendarIcon className="mr-2 h-4 w-4" />
                    {filters.startDate.toLocaleDateString("pt-BR")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.startDate}
                    onSelect={(date) => date && updateFilter("startDate", date)}
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
                    {filters.endDate.toLocaleDateString("pt-BR")}
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-auto p-0" align="start">
                  <Calendar
                    mode="single"
                    selected={filters.endDate}
                    onSelect={(date) => date && updateFilter("endDate", date)}
                  />
                </PopoverContent>
              </Popover>
            </div>
          </div>

          {/* Filtros específicos */}
          <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
            <div className="space-y-2">
              <Label>Categoria</Label>
              <Select
                value={filters.category}
                onValueChange={(value) => updateFilter("category", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="authentication">Autenticação</SelectItem>
                  <SelectItem value="data">Dados</SelectItem>
                  <SelectItem value="system">Sistema</SelectItem>
                  <SelectItem value="security">Segurança</SelectItem>
                  <SelectItem value="admin">Admin</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Severidade</Label>
              <Select
                value={filters.severity}
                onValueChange={(value) => updateFilter("severity", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todas</SelectItem>
                  <SelectItem value="low">Baixa</SelectItem>
                  <SelectItem value="medium">Média</SelectItem>
                  <SelectItem value="high">Alta</SelectItem>
                  <SelectItem value="critical">Crítica</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Status</Label>
              <Select
                value={filters.success}
                onValueChange={(value) => updateFilter("success", value)}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="all">Todos</SelectItem>
                  <SelectItem value="success">Sucesso</SelectItem>
                  <SelectItem value="failed">Falha</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2">
              <Label>Usuário</Label>
              <Input
                placeholder="ID do usuário"
                value={filters.userId}
                onChange={(e) => updateFilter("userId", e.target.value)}
              />
            </div>
          </div>

          <div className="flex items-center gap-2">
            <Badge variant="secondary">
              {filteredLogs.length} de {logs.length} logs
            </Badge>
          </div>
        </CardContent>
      </Card>

      {/* Lista de Logs */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Shield className="h-4 w-4 text-blue-600" />
            Logs de Auditoria
          </CardTitle>
        </CardHeader>
        <CardContent>
          <ScrollArea className="h-96">
            <Table>
              <TableHeader>
                <TableRow>
                  <TableHead>Timestamp</TableHead>
                  <TableHead>Usuário</TableHead>
                  <TableHead>Ação</TableHead>
                  <TableHead>Recurso</TableHead>
                  <TableHead>Categoria</TableHead>
                  <TableHead>Severidade</TableHead>
                  <TableHead>Status</TableHead>
                  <TableHead>Ações</TableHead>
                </TableRow>
              </TableHeader>
              <TableBody>
                {filteredLogs.length === 0 ? (
                  <TableRow>
                    <TableCell
                      colSpan={8}
                      className="text-center text-gray-500 py-8">
                      Nenhum log encontrado
                    </TableCell>
                  </TableRow>
                ) : (
                  filteredLogs.map((log) => (
                    <TableRow key={log.id}>
                      <TableCell className="font-mono text-xs">
                        {formatTimestamp(log.timestamp)}
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {log.userEmail}
                          </div>
                          <div className="text-xs text-gray-500">
                            {log.userId}
                          </div>
                        </div>
                      </TableCell>
                      <TableCell>
                        <code className="text-xs bg-gray-100 px-2 py-1 rounded">
                          {log.action}
                        </code>
                      </TableCell>
                      <TableCell>
                        <div>
                          <div className="font-medium text-sm">
                            {log.resource}
                          </div>
                          {log.resourceId && (
                            <div className="text-xs text-gray-500">
                              {log.resourceId}
                            </div>
                          )}
                        </div>
                      </TableCell>
                      <TableCell>
                        <div className="flex items-center gap-2">
                          {getCategoryIcon(log.category)}
                          <span className="capitalize text-sm">
                            {log.category}
                          </span>
                        </div>
                      </TableCell>
                      <TableCell>
                        <Badge className={severityColors[log.severity]}>
                          {getSeverityIcon(log.severity)}
                          <span className="ml-1 capitalize">
                            {log.severity}
                          </span>
                        </Badge>
                      </TableCell>
                      <TableCell>
                        {log.success ? (
                          <CheckCircle className="h-4 w-4 text-green-600" />
                        ) : (
                          <XCircle className="h-4 w-4 text-red-600" />
                        )}
                      </TableCell>
                      <TableCell>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => setSelectedLog(log)}>
                          <Eye className="h-4 w-4" />
                        </Button>
                      </TableCell>
                    </TableRow>
                  ))
                )}
              </TableBody>
            </Table>
          </ScrollArea>
        </CardContent>
      </Card>

      {/* Modal de Detalhes */}
      {selectedLog && (
        <div className="fixed inset-0 bg-black/50 z-50 flex items-center justify-center p-4">
          <Card className="w-full max-w-2xl max-h-[90vh] overflow-y-auto">
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Detalhes do Log</CardTitle>
                <Button variant="outline" onClick={() => setSelectedLog(null)}>
                  Fechar
                </Button>
              </div>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="font-medium">ID</Label>
                  <p className="text-sm font-mono">{selectedLog.id}</p>
                </div>
                <div>
                  <Label className="font-medium">Timestamp</Label>
                  <p className="text-sm">
                    {formatTimestamp(selectedLog.timestamp)}
                  </p>
                </div>
                <div>
                  <Label className="font-medium">Usuário</Label>
                  <p className="text-sm">{selectedLog.userEmail}</p>
                </div>
                <div>
                  <Label className="font-medium">Ação</Label>
                  <p className="text-sm font-mono">{selectedLog.action}</p>
                </div>
                <div>
                  <Label className="font-medium">Recurso</Label>
                  <p className="text-sm">{selectedLog.resource}</p>
                </div>
                <div>
                  <Label className="font-medium">Categoria</Label>
                  <p className="text-sm capitalize">{selectedLog.category}</p>
                </div>
              </div>

              {selectedLog.changes && (
                <div>
                  <Label className="font-medium">Mudanças</Label>
                  <div className="grid grid-cols-2 gap-4 mt-2">
                    <div>
                      <Label className="text-xs">Antes</Label>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(selectedLog.changes.before, null, 2)}
                      </pre>
                    </div>
                    <div>
                      <Label className="text-xs">Depois</Label>
                      <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                        {JSON.stringify(selectedLog.changes.after, null, 2)}
                      </pre>
                    </div>
                  </div>
                </div>
              )}

              {selectedLog.metadata && (
                <div>
                  <Label className="font-medium">Metadados</Label>
                  <pre className="text-xs bg-gray-100 p-2 rounded overflow-x-auto">
                    {JSON.stringify(selectedLog.metadata, null, 2)}
                  </pre>
                </div>
              )}

              {selectedLog.errorMessage && (
                <div>
                  <Label className="font-medium">Mensagem de Erro</Label>
                  <p className="text-sm text-red-600 bg-red-50 p-2 rounded">
                    {selectedLog.errorMessage}
                  </p>
                </div>
              )}
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};
