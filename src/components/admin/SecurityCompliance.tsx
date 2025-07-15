import React, { useState } from "react";
import {
  Shield,
  Lock,
  Unlock,
  Eye,
  EyeOff,
  AlertTriangle,
  CheckCircle,
  XCircle,
  Clock,
  RefreshCw,
  Download,
  Upload,
  Settings,
  Users,
  Key,
  Fingerprint,
  Database,
  Network,
  Globe,
  FileText,
  BarChart3,
  TrendingUp,
  TrendingDown,
  Filter,
  Search,
  MoreHorizontal,
  Info,
  AlertCircle,
  UserCheck,
  UserX,
  Activity,
  Calendar,
  Bell,
  Zap,
  Target,
  ShieldCheck,
  ShieldX,
  LockKeyhole,
  FileLock,
  Server,
  Monitor,
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

interface SecurityEvent {
  id: string;
  timestamp: string;
  type:
    | "login"
    | "logout"
    | "failed_login"
    | "permission_change"
    | "data_access"
    | "system_change";
  severity: "low" | "medium" | "high" | "critical";
  user: string;
  ip: string;
  location: string;
  description: string;
  status: "investigating" | "resolved" | "false_positive";
}

interface CompliancePolicy {
  id: string;
  name: string;
  category:
    | "authentication"
    | "data_protection"
    | "access_control"
    | "audit"
    | "privacy";
  status: "active" | "inactive" | "draft";
  lastReview: string;
  nextReview: string;
  compliance: number;
  description: string;
  requirements: string[];
}

interface SecurityThreat {
  id: string;
  name: string;
  type: "malware" | "phishing" | "ddos" | "data_breach" | "insider_threat";
  severity: "low" | "medium" | "high" | "critical";
  status: "detected" | "investigating" | "mitigated" | "resolved";
  detectedAt: string;
  description: string;
  affectedSystems: string[];
  mitigationSteps: string[];
}

interface AccessControl {
  id: string;
  user: string;
  role: string;
  permissions: string[];
  lastAccess: string;
  status: "active" | "suspended" | "expired";
  ipWhitelist: string[];
  mfaEnabled: boolean;
  lastPasswordChange: string;
}

const mockSecurityEvents: SecurityEvent[] = [
  {
    id: "1",
    timestamp: "2024-01-15 14:32:15",
    type: "failed_login",
    severity: "medium",
    user: "admin@legalai.com",
    ip: "192.168.1.100",
    location: "São Paulo, BR",
    description: "Múltiplas tentativas de login falharam",
    status: "investigating",
  },
  {
    id: "2",
    timestamp: "2024-01-15 14:30:22",
    type: "permission_change",
    severity: "high",
    user: "admin@legalai.com",
    ip: "192.168.1.100",
    location: "São Paulo, BR",
    description: "Permissões de usuário modificadas",
    status: "resolved",
  },
  {
    id: "3",
    timestamp: "2024-01-15 14:28:45",
    type: "data_access",
    severity: "low",
    user: "user@example.com",
    ip: "10.0.0.50",
    location: "Rio de Janeiro, BR",
    description: "Acesso a dados sensíveis",
    status: "investigating",
  },
  {
    id: "4",
    timestamp: "2024-01-15 14:25:10",
    type: "system_change",
    severity: "critical",
    user: "system",
    ip: "127.0.0.1",
    location: "Local",
    description: "Configuração de firewall alterada",
    status: "investigating",
  },
];

const mockCompliancePolicies: CompliancePolicy[] = [
  {
    id: "1",
    name: "Política de Senhas",
    category: "authentication",
    status: "active",
    lastReview: "2024-01-01",
    nextReview: "2024-04-01",
    compliance: 95,
    description: "Política de senhas fortes e renovação periódica",
    requirements: [
      "Mínimo 8 caracteres",
      "Incluir maiúsculas e minúsculas",
      "Incluir números e símbolos",
      "Renovação a cada 90 dias",
    ],
  },
  {
    id: "2",
    name: "Proteção de Dados Pessoais",
    category: "data_protection",
    status: "active",
    lastReview: "2024-01-01",
    nextReview: "2024-07-01",
    compliance: 88,
    description: "Conformidade com LGPD e proteção de dados pessoais",
    requirements: [
      "Criptografia de dados sensíveis",
      "Consentimento explícito",
      "Direito ao esquecimento",
      "Relatório de violações",
    ],
  },
  {
    id: "3",
    name: "Controle de Acesso",
    category: "access_control",
    status: "active",
    lastReview: "2024-01-01",
    nextReview: "2024-03-01",
    compliance: 92,
    description: "Controle de acesso baseado em roles",
    requirements: [
      "Princípio do menor privilégio",
      "Revisão trimestral de permissões",
      "Log de todas as atividades",
      "Autenticação multifator",
    ],
  },
];

const mockSecurityThreats: SecurityThreat[] = [
  {
    id: "1",
    name: "Tentativa de Ataque DDoS",
    type: "ddos",
    severity: "high",
    status: "mitigated",
    detectedAt: "2024-01-15 13:45:00",
    description: "Detectado aumento anormal no tráfego de rede",
    affectedSystems: ["Web Server", "Load Balancer"],
    mitigationSteps: [
      "Ativado proteção DDoS",
      "Bloqueado IPs suspeitos",
      "Monitoramento intensificado",
    ],
  },
  {
    id: "2",
    name: "Email de Phishing Detectado",
    type: "phishing",
    severity: "medium",
    status: "resolved",
    detectedAt: "2024-01-15 12:30:00",
    description: "Email suspeito direcionado a usuários",
    affectedSystems: ["Email System"],
    mitigationSteps: [
      "Email bloqueado automaticamente",
      "Usuários notificados",
      "Treinamento de segurança agendado",
    ],
  },
];

const mockAccessControls: AccessControl[] = [
  {
    id: "1",
    user: "admin@legalai.com",
    role: "Administrador",
    permissions: ["read", "write", "delete", "admin"],
    lastAccess: "2024-01-15 14:30:00",
    status: "active",
    ipWhitelist: ["192.168.1.0/24", "10.0.0.0/8"],
    mfaEnabled: true,
    lastPasswordChange: "2024-01-01",
  },
  {
    id: "2",
    user: "user@example.com",
    role: "Usuário",
    permissions: ["read", "write"],
    lastAccess: "2024-01-15 14:25:00",
    status: "active",
    ipWhitelist: ["*"],
    mfaEnabled: false,
    lastPasswordChange: "2023-12-15",
  },
];

const SecurityCompliance = () => {
  const [securityEvents, setSecurityEvents] =
    useState<SecurityEvent[]>(mockSecurityEvents);
  const [compliancePolicies, setCompliancePolicies] = useState<
    CompliancePolicy[]
  >(mockCompliancePolicies);
  const [securityThreats, setSecurityThreats] =
    useState<SecurityThreat[]>(mockSecurityThreats);
  const [accessControls, setAccessControls] =
    useState<AccessControl[]>(mockAccessControls);
  const [selectedEvent, setSelectedEvent] = useState<SecurityEvent | null>(
    null
  );
  const [isEventModalOpen, setIsEventModalOpen] = useState(false);
  const [eventFilter, setEventFilter] = useState<string>("all");
  const [severityFilter, setSeverityFilter] = useState<string>("all");
  const [searchTerm, setSearchTerm] = useState("");

  const getSeverityColor = (severity: string) => {
    switch (severity) {
      case "low":
        return "bg-blue-100 text-blue-800";
      case "medium":
        return "bg-yellow-100 text-yellow-800";
      case "high":
        return "bg-orange-100 text-orange-800";
      case "critical":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "active":
        return "bg-green-100 text-green-800";
      case "inactive":
        return "bg-gray-100 text-gray-800";
      case "draft":
        return "bg-blue-100 text-blue-800";
      case "investigating":
        return "bg-yellow-100 text-yellow-800";
      case "resolved":
        return "bg-green-100 text-green-800";
      case "false_positive":
        return "bg-gray-100 text-gray-600";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getTypeIcon = (type: string) => {
    switch (type) {
      case "login":
        return <UserCheck className="w-4 h-4" />;
      case "logout":
        return <UserX className="w-4 h-4" />;
      case "failed_login":
        return <AlertTriangle className="w-4 h-4" />;
      case "permission_change":
        return <Key className="w-4 h-4" />;
      case "data_access":
        return <Database className="w-4 h-4" />;
      case "system_change":
        return <Settings className="w-4 h-4" />;
      default:
        return <Activity className="w-4 h-4" />;
    }
  };

  const filteredEvents = securityEvents.filter((event) => {
    const matchesType = eventFilter === "all" || event.type === eventFilter;
    const matchesSeverity =
      severityFilter === "all" || event.severity === severityFilter;
    const matchesSearch =
      event.description.toLowerCase().includes(searchTerm.toLowerCase()) ||
      event.user.toLowerCase().includes(searchTerm.toLowerCase());
    return matchesType && matchesSeverity && matchesSearch;
  });

  const criticalEvents = securityEvents.filter(
    (e) => e.severity === "critical"
  ).length;
  const activeThreats = securityThreats.filter(
    (t) => t.status === "detected" || t.status === "investigating"
  ).length;
  const complianceScore = Math.round(
    compliancePolicies.reduce((sum, policy) => sum + policy.compliance, 0) /
      compliancePolicies.length
  );
  const mfaEnabledUsers = accessControls.filter((ac) => ac.mfaEnabled).length;

  const handleEventStatusChange = (eventId: string, newStatus: string) => {
    const updatedEvents = securityEvents.map((event) =>
      event.id === eventId ? { ...event, status: newStatus as any } : event
    );
    setSecurityEvents(updatedEvents);
  };

  const handleThreatStatusChange = (threatId: string, newStatus: string) => {
    const updatedThreats = securityThreats.map((threat) =>
      threat.id === threatId ? { ...threat, status: newStatus as any } : threat
    );
    setSecurityThreats(updatedThreats);
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h2 className="text-2xl font-bold text-gray-900">
            Segurança e Conformidade
          </h2>
          <p className="text-gray-600">
            Monitoramento de segurança e gestão de conformidade
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
      {criticalEvents > 0 && (
        <Alert className="border-red-200 bg-red-50">
          <AlertCircle className="h-4 w-4 text-red-600" />
          <AlertDescription className="text-red-800">
            {criticalEvents} evento(s) crítico(s) detectado(s). Requer atenção
            imediata.
          </AlertDescription>
        </Alert>
      )}

      {/* Métricas de Segurança */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Score de Conformidade
            </CardTitle>
            <ShieldCheck className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{complianceScore}%</div>
            <p className="text-xs text-muted-foreground">Conformidade geral</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              Ameaças Ativas
            </CardTitle>
            <ShieldX className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold text-red-600">
              {activeThreats}
            </div>
            <p className="text-xs text-muted-foreground">Requerem atenção</p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">
              MFA Habilitado
            </CardTitle>
            <LockKeyhole className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{mfaEnabledUsers}</div>
            <p className="text-xs text-muted-foreground">
              de {accessControls.length} usuários
            </p>
          </CardContent>
        </Card>
        <Card>
          <CardHeader className="flex flex-row items-center justify-between space-y-0 pb-2">
            <CardTitle className="text-sm font-medium">Eventos Hoje</CardTitle>
            <Activity className="h-4 w-4 text-muted-foreground" />
          </CardHeader>
          <CardContent>
            <div className="text-2xl font-bold">{securityEvents.length}</div>
            <p className="text-xs text-muted-foreground">
              Eventos de segurança
            </p>
          </CardContent>
        </Card>
      </div>

      <Tabs defaultValue="events" className="space-y-6">
        <TabsList className="grid w-full grid-cols-4">
          <TabsTrigger value="events">Eventos de Segurança</TabsTrigger>
          <TabsTrigger value="compliance">Conformidade</TabsTrigger>
          <TabsTrigger value="threats">Ameaças</TabsTrigger>
          <TabsTrigger value="access">Controle de Acesso</TabsTrigger>
        </TabsList>

        <TabsContent value="events" className="space-y-6">
          <Card>
            <CardHeader>
              <div className="flex items-center justify-between">
                <CardTitle>Eventos de Segurança</CardTitle>
                <div className="flex items-center space-x-2">
                  <Select value={eventFilter} onValueChange={setEventFilter}>
                    <SelectTrigger className="w-32">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent>
                      <SelectItem value="all">Todos</SelectItem>
                      <SelectItem value="login">Login</SelectItem>
                      <SelectItem value="logout">Logout</SelectItem>
                      <SelectItem value="failed_login">Login Falhou</SelectItem>
                      <SelectItem value="permission_change">
                        Permissões
                      </SelectItem>
                      <SelectItem value="data_access">
                        Acesso a Dados
                      </SelectItem>
                      <SelectItem value="system_change">Sistema</SelectItem>
                    </SelectContent>
                  </Select>
                  <Select
                    value={severityFilter}
                    onValueChange={setSeverityFilter}>
                    <SelectTrigger className="w-32">
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
                  <Input
                    placeholder="Buscar eventos..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="w-64"
                  />
                </div>
              </div>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {filteredEvents.map((event) => (
                  <div
                    key={event.id}
                    className="flex items-center justify-between p-4 border rounded-lg hover:bg-gray-50">
                    <div className="flex items-center space-x-4">
                      {getTypeIcon(event.type)}
                      <div>
                        <h3 className="font-semibold">{event.description}</h3>
                        <p className="text-sm text-gray-600">
                          {event.user} • {event.ip} • {event.location}
                        </p>
                        <p className="text-xs text-gray-500">
                          {event.timestamp}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <Badge className={getSeverityColor(event.severity)}>
                        {event.severity}
                      </Badge>
                      <Badge className={getStatusColor(event.status)}>
                        {event.status}
                      </Badge>
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={() => {
                          setSelectedEvent(event);
                          setIsEventModalOpen(true);
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

        <TabsContent value="compliance" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Políticas de Conformidade</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-6">
                {compliancePolicies.map((policy) => (
                  <div key={policy.id} className="border rounded-lg p-6">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="text-lg font-semibold">{policy.name}</h3>
                        <p className="text-gray-600">{policy.description}</p>
                      </div>
                      <div className="text-right">
                        <Badge className={getStatusColor(policy.status)}>
                          {policy.status}
                        </Badge>
                        <div className="text-2xl font-bold text-green-600 mt-1">
                          {policy.compliance}%
                        </div>
                      </div>
                    </div>

                    <div className="mb-4">
                      <div className="flex justify-between text-sm mb-1">
                        <span>Conformidade</span>
                        <span>{policy.compliance}%</span>
                      </div>
                      <Progress value={policy.compliance} className="h-2" />
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Última Revisão</p>
                        <p className="font-medium">{policy.lastReview}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Próxima Revisão</p>
                        <p className="font-medium">{policy.nextReview}</p>
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">Requisitos:</p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {policy.requirements.map((req, index) => (
                          <li key={index}>{req}</li>
                        ))}
                      </ul>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="threats" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Ameaças de Segurança</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {securityThreats.map((threat) => (
                  <div key={threat.id} className="border rounded-lg p-4">
                    <div className="flex items-center justify-between mb-4">
                      <div>
                        <h3 className="font-semibold">{threat.name}</h3>
                        <p className="text-sm text-gray-600">
                          {threat.description}
                        </p>
                      </div>
                      <div className="text-right">
                        <Badge className={getSeverityColor(threat.severity)}>
                          {threat.severity}
                        </Badge>
                        <Badge className={getStatusColor(threat.status)}>
                          {threat.status}
                        </Badge>
                      </div>
                    </div>

                    <div className="grid grid-cols-2 gap-4 mb-4">
                      <div>
                        <p className="text-sm text-gray-600">Detectado em</p>
                        <p className="font-medium">{threat.detectedAt}</p>
                      </div>
                      <div>
                        <p className="text-sm text-gray-600">Tipo</p>
                        <p className="font-medium">{threat.type}</p>
                      </div>
                    </div>

                    <div className="mb-4">
                      <p className="text-sm font-medium mb-2">
                        Sistemas Afetados:
                      </p>
                      <div className="flex flex-wrap gap-2">
                        {threat.affectedSystems.map((system, index) => (
                          <Badge key={index} variant="outline">
                            {system}
                          </Badge>
                        ))}
                      </div>
                    </div>

                    <div>
                      <p className="text-sm font-medium mb-2">
                        Passos de Mitigação:
                      </p>
                      <ul className="list-disc list-inside text-sm text-gray-600 space-y-1">
                        {threat.mitigationSteps.map((step, index) => (
                          <li key={index}>{step}</li>
                        ))}
                      </ul>
                    </div>

                    <div className="mt-4 flex space-x-2">
                      {threat.status === "detected" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleThreatStatusChange(threat.id, "investigating")
                          }>
                          Investigar
                        </Button>
                      )}
                      {threat.status === "investigating" && (
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() =>
                            handleThreatStatusChange(threat.id, "mitigated")
                          }>
                          Mitigar
                        </Button>
                      )}
                      <Button variant="outline" size="sm">
                        <MoreHorizontal className="w-4 h-4" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </TabsContent>

        <TabsContent value="access" className="space-y-6">
          <Card>
            <CardHeader>
              <CardTitle>Controle de Acesso</CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-4">
                {accessControls.map((access) => (
                  <div
                    key={access.id}
                    className="flex items-center justify-between p-4 border rounded-lg">
                    <div className="flex items-center space-x-4">
                      <div>
                        <h3 className="font-semibold">{access.user}</h3>
                        <p className="text-sm text-gray-600">
                          Role: {access.role}
                        </p>
                        <p className="text-xs text-gray-500">
                          Último acesso: {access.lastAccess}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center space-x-4">
                      <div className="text-right">
                        <Badge className={getStatusColor(access.status)}>
                          {access.status}
                        </Badge>
                        <div className="flex items-center space-x-2 mt-1">
                          {access.mfaEnabled ? (
                            <Badge className="bg-green-100 text-green-800">
                              <Lock className="w-3 h-3 mr-1" />
                              MFA
                            </Badge>
                          ) : (
                            <Badge className="bg-red-100 text-red-800">
                              <Unlock className="w-3 h-3 mr-1" />
                              Sem MFA
                            </Badge>
                          )}
                        </div>
                      </div>
                      <div className="flex space-x-2">
                        <Button variant="outline" size="sm">
                          <Eye className="w-4 h-4 mr-1" />
                          Ver
                        </Button>
                        <Button variant="outline" size="sm">
                          <Settings className="w-4 h-4 mr-1" />
                          Editar
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

      {/* Modal de Detalhes do Evento */}
      <Dialog open={isEventModalOpen} onOpenChange={setIsEventModalOpen}>
        <DialogContent className="max-w-2xl">
          <DialogHeader>
            <DialogTitle>Detalhes do Evento de Segurança</DialogTitle>
          </DialogHeader>
          {selectedEvent && (
            <div className="space-y-6">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Usuário</Label>
                  <p className="font-medium">{selectedEvent.user}</p>
                </div>
                <div>
                  <Label>IP</Label>
                  <p className="font-medium">{selectedEvent.ip}</p>
                </div>
                <div>
                  <Label>Localização</Label>
                  <p className="font-medium">{selectedEvent.location}</p>
                </div>
                <div>
                  <Label>Timestamp</Label>
                  <p className="font-medium">{selectedEvent.timestamp}</p>
                </div>
              </div>

              <Separator />

              <div>
                <Label>Descrição</Label>
                <p className="mt-1">{selectedEvent.description}</p>
              </div>

              <Separator />

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label>Severidade</Label>
                  <Badge className={getSeverityColor(selectedEvent.severity)}>
                    {selectedEvent.severity}
                  </Badge>
                </div>
                <div>
                  <Label>Status</Label>
                  <Badge className={getStatusColor(selectedEvent.status)}>
                    {selectedEvent.status}
                  </Badge>
                </div>
              </div>

              <div className="flex justify-end space-x-2">
                <Button variant="outline">Marcar como Falso Positivo</Button>
                <Button>Investigar</Button>
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SecurityCompliance;
