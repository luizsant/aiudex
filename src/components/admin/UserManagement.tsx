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
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Users,
  UserPlus,
  Edit,
  Trash2,
  Search,
  Filter,
  Download,
  RefreshCw,
  Mail,
  Phone,
  Calendar,
  Shield,
  MoreHorizontal,
  Eye,
  Key,
  UserCheck,
  UserX,
  Ban,
  CheckCircle,
  XCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { adminDataService, RealUser, PlanType } from "@/lib/admin-data-service";
import { toast } from "sonner";
import { useAutoRefresh } from "@/hooks/useAutoRefresh";
import { AutoRefreshStatus } from "./AutoRefreshStatus";

interface UserFormData {
  name: string;
  email: string;
  role: "admin" | "advogado" | "estagiario";
  status: "ativo" | "inativo" | "suspenso";
  plan: PlanType;
  oabNumber?: string;
  firm?: string;
  totalCredits: number;
}

interface EmailModalData {
  subject: string;
  message: string;
}

const UserManagement = () => {
  const [users, setUsers] = useState<RealUser[]>([]);
  const [filteredUsers, setFilteredUsers] = useState<RealUser[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState("all");
  const [planFilter, setPlanFilter] = useState("all");
  const [isLoading, setIsLoading] = useState(true);
  const [userStats, setUserStats] = useState<any>(null);

  // Modais
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isEmailModalOpen, setIsEmailModalOpen] = useState(false);
  const [isViewModalOpen, setIsViewModalOpen] = useState(false);

  // Estados dos formulários
  const [formData, setFormData] = useState<UserFormData>({
    name: "",
    email: "",
    role: "advogado",
    status: "ativo",
    plan: "free",
    oabNumber: "",
    firm: "",
    totalCredits: 10,
  });

  const [emailData, setEmailData] = useState<EmailModalData>({
    subject: "",
    message: "",
  });

  const [selectedUser, setSelectedUser] = useState<RealUser | null>(null);
  const [isSubmitting, setIsSubmitting] = useState(false);

  useEffect(() => {
    loadUsers();
  }, []);

  useEffect(() => {
    filterUsers();
  }, [users, searchTerm, statusFilter, planFilter]);

  const loadUsers = async () => {
    setIsLoading(true);
    try {
      const realUsers = adminDataService.getRealUsers();
      setUsers(realUsers);

      // Carregar estatísticas
      const stats = adminDataService.getUserStats();
      setUserStats(stats);

      if (realUsers.length === 0) {
        toast.info(
          "Nenhum usuário encontrado. Registre usuários para visualizar dados."
        );
      }
    } catch (error) {
      console.error("Erro ao carregar usuários:", error);
      toast.error("Erro ao carregar usuários");
    } finally {
      setIsLoading(false);
    }
  };

  // Auto-refresh usando hook personalizado
  const autoRefresh = useAutoRefresh({
    interval: 30000, // 30 segundos
    onRefresh: loadUsers,
    enabled: true,
  });

  const filterUsers = () => {
    let filtered = users;

    if (searchTerm) {
      filtered = filtered.filter(
        (user) =>
          user.name.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.email.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.oabNumber?.toLowerCase().includes(searchTerm.toLowerCase()) ||
          user.firm?.toLowerCase().includes(searchTerm.toLowerCase())
      );
    }

    if (statusFilter !== "all") {
      filtered = filtered.filter((user) => user.status === statusFilter);
    }

    if (planFilter !== "all") {
      filtered = filtered.filter((user) => user.plan === planFilter);
    }

    setFilteredUsers(filtered);
  };

  // Handlers para CRUD
  const handleCreateUser = async () => {
    if (!formData.name || !formData.email) {
      toast.error("Nome e email são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      const newUser = await adminDataService.createUser({
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        plan: formData.plan,
        oabNumber: formData.oabNumber || undefined,
        firm: formData.firm || undefined,
        creditsUsed: 0,
        totalCredits: formData.totalCredits,
        usageThisMonth: 0,
        totalDocuments: 0,
      });

      setUsers([...users, newUser]);
      setIsCreateModalOpen(false);
      resetForm();
      toast.success("Usuário criado com sucesso!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao criar usuário";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleEditUser = async () => {
    if (!selectedUser || !formData.name || !formData.email) {
      toast.error("Nome e email são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      const updatedUser = await adminDataService.updateUser(selectedUser.id, {
        name: formData.name,
        email: formData.email,
        role: formData.role,
        status: formData.status,
        plan: formData.plan,
        oabNumber: formData.oabNumber || undefined,
        firm: formData.firm || undefined,
        totalCredits: formData.totalCredits,
      });

      setUsers(
        users.map((user) => (user.id === selectedUser.id ? updatedUser : user))
      );
      setIsEditModalOpen(false);
      setSelectedUser(null);
      resetForm();
      toast.success("Usuário atualizado com sucesso!");
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao atualizar usuário";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleDeleteUser = async () => {
    if (!selectedUser) return;

    setIsSubmitting(true);
    try {
      const success = await adminDataService.deleteUser(selectedUser.id);

      if (success) {
        setUsers(users.filter((user) => user.id !== selectedUser.id));
        setIsDeleteModalOpen(false);
        setSelectedUser(null);
        toast.success("Usuário excluído com sucesso!");
      } else {
        toast.error("Erro ao excluir usuário");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao excluir usuário";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleSendEmail = async () => {
    if (!selectedUser || !emailData.subject || !emailData.message) {
      toast.error("Assunto e mensagem são obrigatórios");
      return;
    }

    setIsSubmitting(true);
    try {
      const success = await adminDataService.sendEmailToUser(
        selectedUser.id,
        emailData.subject,
        emailData.message
      );

      if (success) {
        setIsEmailModalOpen(false);
        setSelectedUser(null);
        setEmailData({ subject: "", message: "" });
        toast.success("Email enviado com sucesso!");
      } else {
        toast.error("Erro ao enviar email");
      }
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao enviar email";
      toast.error(errorMessage);
    } finally {
      setIsSubmitting(false);
    }
  };

  const handleStatusChange = async (
    userId: string,
    newStatus: "ativo" | "inativo" | "suspenso"
  ) => {
    try {
      const updatedUser = await adminDataService.updateUserStatus(
        userId,
        newStatus
      );
      setUsers(users.map((user) => (user.id === userId ? updatedUser : user)));
      toast.success(`Status do usuário alterado para ${newStatus}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao alterar status";
      toast.error(errorMessage);
    }
  };

  const handleResetPassword = async (userId: string) => {
    try {
      const tempPassword = await adminDataService.resetUserPassword(userId);
      toast.success(`Senha temporária gerada: ${tempPassword}`);
    } catch (error) {
      const errorMessage =
        error instanceof Error ? error.message : "Erro ao resetar senha";
      toast.error(errorMessage);
    }
  };

  // Funções auxiliares
  const resetForm = () => {
    setFormData({
      name: "",
      email: "",
      role: "advogado",
      status: "ativo",
      plan: "free",
      oabNumber: "",
      firm: "",
      totalCredits: 10,
    });
  };

  const openEditModal = (user: RealUser) => {
    setSelectedUser(user);
    setFormData({
      name: user.name,
      email: user.email,
      role: user.role,
      status: user.status,
      plan: user.plan,
      oabNumber: user.oabNumber || "",
      firm: user.firm || "",
      totalCredits: user.totalCredits,
    });
    setIsEditModalOpen(true);
  };

  const openDeleteModal = (user: RealUser) => {
    setSelectedUser(user);
    setIsDeleteModalOpen(true);
  };

  const openEmailModal = (user: RealUser) => {
    setSelectedUser(user);
    setEmailData({
      subject: "",
      message: "",
    });
    setIsEmailModalOpen(true);
  };

  const openViewModal = (user: RealUser) => {
    setSelectedUser(user);
    setIsViewModalOpen(true);
  };

  // Funções de cores
  const getStatusColor = (status: string) => {
    switch (status) {
      case "ativo":
        return "bg-green-100 text-green-800";
      case "inativo":
        return "bg-gray-100 text-gray-800";
      case "suspenso":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getPlanColor = (plan: string) => {
    switch (plan) {
      case "enterprise":
        return "bg-purple-100 text-purple-800";
      case "pro":
        return "bg-blue-100 text-blue-800";
      case "basic":
        return "bg-green-100 text-green-800";
      case "free":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "advogado":
        return "bg-blue-100 text-blue-800";
      case "estagiario":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusIcon = (status: string) => {
    switch (status) {
      case "ativo":
        return <CheckCircle className="h-4 w-4 text-green-600" />;
      case "inativo":
        return <XCircle className="h-4 w-4 text-gray-600" />;
      case "suspenso":
        return <AlertCircle className="h-4 w-4 text-red-600" />;
      default:
        return <XCircle className="h-4 w-4 text-gray-600" />;
    }
  };

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-64">
        <RefreshCw className="w-6 h-6 animate-spin text-blue-600" />
        <span className="ml-2 text-gray-600">Carregando usuários...</span>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h2 className="text-2xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Gestão de Usuários
          </h2>
          <p className="text-gray-600 mt-1">
            Administre usuários, permissões e status da plataforma
          </p>
        </div>

        <div className="flex items-center gap-3">
          <AutoRefreshStatus
            isRefreshing={autoRefresh.isRefreshing}
            lastRefresh={autoRefresh.lastRefresh}
            isEnabled={autoRefresh.isEnabled}
            onToggle={autoRefresh.toggleAutoRefresh}
            onManualRefresh={autoRefresh.refresh}
          />

          <Button className="gap-2" onClick={() => setIsCreateModalOpen(true)}>
            <UserPlus className="h-4 w-4" />
            Novo Usuário
          </Button>
        </div>
      </div>

      {/* Estatísticas de Usuários */}
      {userStats && (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-blue-100 text-sm">Total de Usuários</p>
                  <p className="text-2xl font-bold">{userStats.total}</p>
                  <p className="text-blue-200 text-sm flex items-center gap-1">
                    <Users className="h-4 w-4" />
                    {userStats.newThisMonth} novos este mês
                  </p>
                </div>
                <Users className="h-8 w-8 text-blue-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-green-100 text-sm">Usuários Ativos</p>
                  <p className="text-2xl font-bold">{userStats.active}</p>
                  <p className="text-green-200 text-sm flex items-center gap-1">
                    <CheckCircle className="h-4 w-4" />
                    {userStats.total > 0
                      ? Math.round((userStats.active / userStats.total) * 100)
                      : 0}
                    % do total
                  </p>
                </div>
                <CheckCircle className="h-8 w-8 text-green-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-orange-100 text-sm">Inativos/Suspensos</p>
                  <p className="text-2xl font-bold">
                    {userStats.inactive + userStats.suspended}
                  </p>
                  <p className="text-orange-200 text-sm flex items-center gap-1">
                    <AlertCircle className="h-4 w-4" />
                    {userStats.suspended} suspensos
                  </p>
                </div>
                <AlertCircle className="h-8 w-8 text-orange-200" />
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div>
                  <p className="text-purple-100 text-sm">Novos esta Semana</p>
                  <p className="text-2xl font-bold">{userStats.newThisWeek}</p>
                  <p className="text-purple-200 text-sm flex items-center gap-1">
                    <Calendar className="h-4 w-4" />
                    Últimos 7 dias
                  </p>
                </div>
                <Calendar className="h-8 w-8 text-purple-200" />
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Distribuição por Planos e Funções */}
      {userStats && (
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Shield className="h-5 w-5 text-blue-600" />
                Distribuição por Planos
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(userStats.byPlan).map(([plan, count]) => (
                  <div key={plan} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getPlanColor(plan)}>
                        {plan === "free"
                          ? "Gratuito"
                          : plan === "basic"
                          ? "Básico"
                          : plan === "pro"
                          ? "Profissional"
                          : "Empresarial"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {count as number}
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-blue-600 h-2 rounded-full"
                          style={{
                            width: `${
                              userStats.total > 0
                                ? ((count as number) / userStats.total) * 100
                                : 0
                            }%`,
                          }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle className="flex items-center gap-2">
                <Users className="h-5 w-5 text-purple-600" />
                Distribuição por Função
              </CardTitle>
            </CardHeader>
            <CardContent>
              <div className="space-y-3">
                {Object.entries(userStats.byRole).map(([role, count]) => (
                  <div key={role} className="flex items-center justify-between">
                    <div className="flex items-center gap-2">
                      <Badge className={getRoleColor(role)}>
                        {role === "advogado"
                          ? "Advogado"
                          : role === "estagiario"
                          ? "Estagiário"
                          : "Admin"}
                      </Badge>
                    </div>
                    <div className="flex items-center gap-2">
                      <span className="text-sm font-medium">
                        {count as number}
                      </span>
                      <div className="w-20 bg-gray-200 rounded-full h-2">
                        <div
                          className="bg-purple-600 h-2 rounded-full"
                          style={{
                            width: `${
                              userStats.total > 0
                                ? ((count as number) / userStats.total) * 100
                                : 0
                            }%`,
                          }}></div>
                      </div>
                    </div>
                  </div>
                ))}
              </div>
            </CardContent>
          </Card>
        </div>
      )}

      {/* Filtros */}
      <Card>
        <CardContent className="p-4">
          <div className="grid grid-cols-1 md:grid-cols-4 gap-4">
            <div className="relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                placeholder="Buscar usuários..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                className="pl-10"
              />
            </div>

            <Select value={statusFilter} onValueChange={setStatusFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Status" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Status</SelectItem>
                <SelectItem value="ativo">Ativo</SelectItem>
                <SelectItem value="inativo">Inativo</SelectItem>
                <SelectItem value="suspenso">Suspenso</SelectItem>
              </SelectContent>
            </Select>

            <Select value={planFilter} onValueChange={setPlanFilter}>
              <SelectTrigger>
                <SelectValue placeholder="Plano" />
              </SelectTrigger>
              <SelectContent>
                <SelectItem value="all">Todos os Planos</SelectItem>
                <SelectItem value="free">Gratuito</SelectItem>
                <SelectItem value="basic">Básico</SelectItem>
                <SelectItem value="pro">Profissional</SelectItem>
                <SelectItem value="enterprise">Empresarial</SelectItem>
              </SelectContent>
            </Select>

            <Button
              variant="outline"
              className="gap-2"
              onClick={() => {
                const csvData = adminDataService.exportUsersToCSV();
                const blob = new Blob([csvData], { type: "text/csv" });
                const url = window.URL.createObjectURL(blob);
                const a = document.createElement("a");
                a.href = url;
                a.download = `usuarios_${
                  new Date().toISOString().split("T")[0]
                }.csv`;
                a.click();
                window.URL.revokeObjectURL(url);
                toast.success("Dados exportados com sucesso!");
              }}>
              <Download className="h-4 w-4" />
              Exportar
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Tabela de Usuários */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Users className="h-5 w-5" />
            Usuários ({filteredUsers.length})
          </CardTitle>
          <CardDescription>
            Lista completa de usuários da plataforma
          </CardDescription>
        </CardHeader>
        <CardContent>
          <Table>
            <TableHeader>
              <TableRow>
                <TableHead>Usuário</TableHead>
                <TableHead>Função</TableHead>
                <TableHead>Status</TableHead>
                <TableHead>Plano</TableHead>
                <TableHead>OAB</TableHead>
                <TableHead>Créditos</TableHead>
                <TableHead>Documentos</TableHead>
                <TableHead>Último Login</TableHead>
                <TableHead>Ações</TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {filteredUsers.map((user) => (
                <TableRow key={user.id}>
                  <TableCell>
                    <div>
                      <div className="font-medium">{user.name}</div>
                      <div className="text-sm text-gray-500">{user.email}</div>
                      {user.firm && (
                        <div className="text-xs text-gray-400">{user.firm}</div>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getRoleColor(user.role)}>
                      {user.role === "advogado"
                        ? "Advogado"
                        : user.role === "estagiario"
                        ? "Estagiário"
                        : "Admin"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    <div className="flex items-center gap-2">
                      {getStatusIcon(user.status)}
                      <Badge className={getStatusColor(user.status)}>
                        {user.status === "ativo"
                          ? "Ativo"
                          : user.status === "inativo"
                          ? "Inativo"
                          : "Suspenso"}
                      </Badge>
                    </div>
                  </TableCell>
                  <TableCell>
                    <Badge className={getPlanColor(user.plan)}>
                      {user.plan === "free"
                        ? "Gratuito"
                        : user.plan === "basic"
                        ? "Básico"
                        : user.plan === "pro"
                        ? "Profissional"
                        : "Empresarial"}
                    </Badge>
                  </TableCell>
                  <TableCell>
                    {user.oabNumber ? (
                      <span className="font-mono text-sm">
                        {user.oabNumber}
                      </span>
                    ) : (
                      <span className="text-gray-400">-</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      {user.totalCredits === -1 ? (
                        <span className="text-green-600 font-medium">
                          Ilimitado
                        </span>
                      ) : (
                        <span className="text-gray-600">
                          {user.totalCredits - user.creditsUsed}/
                          {user.totalCredits}
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    <div className="text-sm">
                      <span className="text-gray-600">
                        {user.totalDocuments}
                      </span>
                      {user.usageThisMonth > 0 && (
                        <span className="text-green-600 ml-1">
                          (+{user.usageThisMonth} este mês)
                        </span>
                      )}
                    </div>
                  </TableCell>
                  <TableCell>
                    {user.lastLogin ? (
                      <div className="flex items-center gap-1 text-sm text-gray-600">
                        <Calendar className="h-3 w-3" />
                        {new Date(user.lastLogin).toLocaleDateString()}
                      </div>
                    ) : (
                      <span className="text-gray-400">Nunca</span>
                    )}
                  </TableCell>
                  <TableCell>
                    <DropdownMenu>
                      <DropdownMenuTrigger asChild>
                        <Button variant="ghost" className="h-8 w-8 p-0">
                          <span className="sr-only">Abrir menu</span>
                          <MoreHorizontal className="h-4 w-4" />
                        </Button>
                      </DropdownMenuTrigger>
                      <DropdownMenuContent align="end">
                        <DropdownMenuLabel>Ações</DropdownMenuLabel>
                        <DropdownMenuItem onClick={() => openViewModal(user)}>
                          <Eye className="mr-2 h-4 w-4" />
                          Ver detalhes
                        </DropdownMenuItem>
                        <DropdownMenuItem onClick={() => openEditModal(user)}>
                          <Edit className="mr-2 h-4 w-4" />
                          Editar
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        <DropdownMenuItem onClick={() => openEmailModal(user)}>
                          <Mail className="mr-2 h-4 w-4" />
                          Enviar email
                        </DropdownMenuItem>
                        <DropdownMenuItem
                          onClick={() => handleResetPassword(user.id)}>
                          <Key className="mr-2 h-4 w-4" />
                          Resetar senha
                        </DropdownMenuItem>
                        <DropdownMenuSeparator />
                        {user.status === "ativo" && (
                          <>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(user.id, "inativo")
                              }>
                              <UserX className="mr-2 h-4 w-4" />
                              Desativar
                            </DropdownMenuItem>
                            <DropdownMenuItem
                              onClick={() =>
                                handleStatusChange(user.id, "suspenso")
                              }>
                              <Ban className="mr-2 h-4 w-4" />
                              Suspender
                            </DropdownMenuItem>
                          </>
                        )}
                        {user.status !== "ativo" && (
                          <DropdownMenuItem
                            onClick={() =>
                              handleStatusChange(user.id, "ativo")
                            }>
                            <UserCheck className="mr-2 h-4 w-4" />
                            Ativar
                          </DropdownMenuItem>
                        )}
                        <DropdownMenuSeparator />
                        <DropdownMenuItem
                          onClick={() => openDeleteModal(user)}
                          className="text-red-600">
                          <Trash2 className="mr-2 h-4 w-4" />
                          Excluir
                        </DropdownMenuItem>
                      </DropdownMenuContent>
                    </DropdownMenu>
                  </TableCell>
                </TableRow>
              ))}
            </TableBody>
          </Table>
        </CardContent>
      </Card>

      {/* Modal de Criação */}
      <Dialog open={isCreateModalOpen} onOpenChange={setIsCreateModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Adicionar Novo Usuário</DialogTitle>
            <DialogDescription>
              Preencha os dados do novo usuário
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-name">Nome *</Label>
                <Input
                  id="create-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-email">Email *</Label>
                <Input
                  id="create-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-role">Função</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, role: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advogado">Advogado</SelectItem>
                    <SelectItem value="estagiario">Estagiário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-plan">Plano</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, plan: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="pro">Profissional</SelectItem>
                    <SelectItem value="enterprise">Empresarial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-credits">Créditos</Label>
                <Input
                  id="create-credits"
                  type="number"
                  value={formData.totalCredits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalCredits: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="create-oab">OAB</Label>
                <Input
                  id="create-oab"
                  value={formData.oabNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, oabNumber: e.target.value })
                  }
                  placeholder="123456/SP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="create-firm">Escritório</Label>
                <Input
                  id="create-firm"
                  value={formData.firm}
                  onChange={(e) =>
                    setFormData({ ...formData, firm: e.target.value })
                  }
                  placeholder="Nome do escritório"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsCreateModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleCreateUser} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Criar Usuário
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição */}
      <Dialog open={isEditModalOpen} onOpenChange={setIsEditModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Editar Usuário</DialogTitle>
            <DialogDescription>Altere os dados do usuário</DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-name">Nome *</Label>
                <Input
                  id="edit-name"
                  value={formData.name}
                  onChange={(e) =>
                    setFormData({ ...formData, name: e.target.value })
                  }
                  placeholder="Nome completo"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-email">Email *</Label>
                <Input
                  id="edit-email"
                  type="email"
                  value={formData.email}
                  onChange={(e) =>
                    setFormData({ ...formData, email: e.target.value })
                  }
                  placeholder="email@exemplo.com"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-role">Função</Label>
                <Select
                  value={formData.role}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, role: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="advogado">Advogado</SelectItem>
                    <SelectItem value="estagiario">Estagiário</SelectItem>
                    <SelectItem value="admin">Administrador</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-status">Status</Label>
                <Select
                  value={formData.status}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, status: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="ativo">Ativo</SelectItem>
                    <SelectItem value="inativo">Inativo</SelectItem>
                    <SelectItem value="suspenso">Suspenso</SelectItem>
                  </SelectContent>
                </Select>
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-plan">Plano</Label>
                <Select
                  value={formData.plan}
                  onValueChange={(value: any) =>
                    setFormData({ ...formData, plan: value })
                  }>
                  <SelectTrigger>
                    <SelectValue />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="free">Gratuito</SelectItem>
                    <SelectItem value="basic">Básico</SelectItem>
                    <SelectItem value="pro">Profissional</SelectItem>
                    <SelectItem value="enterprise">Empresarial</SelectItem>
                  </SelectContent>
                </Select>
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-credits">Créditos</Label>
                <Input
                  id="edit-credits"
                  type="number"
                  value={formData.totalCredits}
                  onChange={(e) =>
                    setFormData({
                      ...formData,
                      totalCredits: parseInt(e.target.value) || 0,
                    })
                  }
                  placeholder="100"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="edit-oab">OAB</Label>
                <Input
                  id="edit-oab"
                  value={formData.oabNumber}
                  onChange={(e) =>
                    setFormData({ ...formData, oabNumber: e.target.value })
                  }
                  placeholder="123456/SP"
                />
              </div>
              <div className="space-y-2">
                <Label htmlFor="edit-firm">Escritório</Label>
                <Input
                  id="edit-firm"
                  value={formData.firm}
                  onChange={(e) =>
                    setFormData({ ...formData, firm: e.target.value })
                  }
                  placeholder="Nome do escritório"
                />
              </div>
            </div>
          </div>
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsEditModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleEditUser} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Salvar Alterações
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Exclusão */}
      <AlertDialog open={isDeleteModalOpen} onOpenChange={setIsDeleteModalOpen}>
        <AlertDialogContent>
          <AlertDialogHeader>
            <AlertDialogTitle>Confirmar Exclusão</AlertDialogTitle>
            <AlertDialogDescription>
              Tem certeza que deseja excluir o usuário{" "}
              <strong>{selectedUser?.name}</strong>? Esta ação não pode ser
              desfeita e todos os dados relacionados serão removidos.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel>Cancelar</AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteUser}
              className="bg-red-600 hover:bg-red-700"
              disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Excluir
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      {/* Modal de Email */}
      <Dialog open={isEmailModalOpen} onOpenChange={setIsEmailModalOpen}>
        <DialogContent className="sm:max-w-[500px]">
          <DialogHeader>
            <DialogTitle>Enviar Email</DialogTitle>
            <DialogDescription>
              Enviar email para {selectedUser?.name} ({selectedUser?.email})
            </DialogDescription>
          </DialogHeader>
          <div className="grid gap-4 py-4">
            <div className="space-y-2">
              <Label htmlFor="email-subject">Assunto *</Label>
              <Input
                id="email-subject"
                value={emailData.subject}
                onChange={(e) =>
                  setEmailData({ ...emailData, subject: e.target.value })
                }
                placeholder="Assunto do email"
              />
            </div>
            <div className="space-y-2">
              <Label htmlFor="email-message">Mensagem *</Label>
              <Textarea
                id="email-message"
                value={emailData.message}
                onChange={(e) =>
                  setEmailData({ ...emailData, message: e.target.value })
                }
                placeholder="Digite sua mensagem aqui..."
                rows={6}
              />
            </div>
          </div>
          <DialogFooter>
            <Button
              variant="outline"
              onClick={() => setIsEmailModalOpen(false)}>
              Cancelar
            </Button>
            <Button onClick={handleSendEmail} disabled={isSubmitting}>
              {isSubmitting && (
                <Loader2 className="mr-2 h-4 w-4 animate-spin" />
              )}
              Enviar Email
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização */}
      <Dialog open={isViewModalOpen} onOpenChange={setIsViewModalOpen}>
        <DialogContent className="sm:max-w-[600px]">
          <DialogHeader>
            <DialogTitle>Detalhes do Usuário</DialogTitle>
          </DialogHeader>
          {selectedUser && (
            <div className="grid gap-4 py-4">
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Nome
                  </Label>
                  <p className="text-sm">{selectedUser.name}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Email
                  </Label>
                  <p className="text-sm">{selectedUser.email}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Função
                  </Label>
                  <Badge className={getRoleColor(selectedUser.role)}>
                    {selectedUser.role === "advogado"
                      ? "Advogado"
                      : selectedUser.role === "estagiario"
                      ? "Estagiário"
                      : "Admin"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Status
                  </Label>
                  <Badge className={getStatusColor(selectedUser.status)}>
                    {selectedUser.status === "ativo"
                      ? "Ativo"
                      : selectedUser.status === "inativo"
                      ? "Inativo"
                      : "Suspenso"}
                  </Badge>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Plano
                  </Label>
                  <Badge className={getPlanColor(selectedUser.plan)}>
                    {selectedUser.plan === "free"
                      ? "Gratuito"
                      : selectedUser.plan === "basic"
                      ? "Básico"
                      : selectedUser.plan === "pro"
                      ? "Profissional"
                      : "Empresarial"}
                  </Badge>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    OAB
                  </Label>
                  <p className="text-sm">{selectedUser.oabNumber || "-"}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Escritório
                  </Label>
                  <p className="text-sm">{selectedUser.firm || "-"}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Créditos
                  </Label>
                  <p className="text-sm">
                    {selectedUser.totalCredits === -1
                      ? "Ilimitado"
                      : `${
                          selectedUser.totalCredits - selectedUser.creditsUsed
                        }/${selectedUser.totalCredits}`}
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Documentos
                  </Label>
                  <p className="text-sm">{selectedUser.totalDocuments}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Uso este mês
                  </Label>
                  <p className="text-sm">{selectedUser.usageThisMonth}</p>
                </div>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Criado em
                  </Label>
                  <p className="text-sm">
                    {new Date(selectedUser.createdAt).toLocaleDateString()}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium text-gray-500">
                    Último login
                  </Label>
                  <p className="text-sm">
                    {selectedUser.lastLogin
                      ? new Date(selectedUser.lastLogin).toLocaleDateString()
                      : "Nunca"}
                  </p>
                </div>
              </div>
            </div>
          )}
          <DialogFooter>
            <Button variant="outline" onClick={() => setIsViewModalOpen(false)}>
              Fechar
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default UserManagement;
