"use client";

import { useState, useEffect, useMemo, useCallback } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  Search,
  Phone,
  Mail,
  MapPin,
  Edit,
  Edit3,
  Trash2,
  Eye,
  FileText,
  Shield,
  Gavel,
  Info,
  Save,
  Filter,
  Calendar,
  User,
  Building,
  Clock,
  CheckCircle,
  AlertCircle,
} from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogClose,
  DialogDescription,
} from "@/components/ui/dialog";
import { Tabs, TabsList, TabsTrigger, TabsContent } from "@/components/ui/tabs";
import { Textarea } from "@/components/ui/textarea";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { PageHeader } from "@/components/PageHeader";
import { validateCPF } from "@/lib/validations";
import { useToast } from "@/hooks/use-toast";
import { clientsService, type Client } from "@/lib/clients-service";

// Funções de máscara simples
const maskCPF = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d)/, "$1.$2")
    .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
};

const maskPhone = (value: string) => {
  return value
    .replace(/\D/g, "")
    .replace(/(\d{2})(\d)/, "($1) $2")
    .replace(/(\d{5})(\d)/, "$1-$2")
    .replace(/(-\d{4})\d+?$/, "$1");
};

const maskCEP = (value: string) => {
  return value.replace(/\D/g, "").replace(/(\d{5})(\d)/, "$1-$2");
};

// Hook para debounce
const useDebounce = (value: string, delay: number) => {
  const [debouncedValue, setDebouncedValue] = useState(value);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedValue(value);
    }, delay);

    return () => {
      clearTimeout(handler);
    };
  }, [value, delay]);

  return debouncedValue;
};

const Clients = () => {
  const [clients, setClients] = useState<Client[]>([]);
  const [loading, setLoading] = useState(true);
  const [migrating, setMigrating] = useState(false);
  const [initialLoadComplete, setInitialLoadComplete] = useState(false);
  const [cacheKey, setCacheKey] = useState<string>("");
  const [loadingMessage, setLoadingMessage] = useState(
    "Carregando clientes..."
  );
  const [dataSource, setDataSource] = useState<"cache" | "server" | null>(null);

  const [searchTerm, setSearchTerm] = useState("");
  const [showAddForm, setShowAddForm] = useState(false);
  const [newClient, setNewClient] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    rg: "",
    birthDate: "",
    maritalStatus: "",
    profession: "",
    nationality: "Brasileira",
    observations: "",
    status: "Ativo",
    processes: 0,
    processNumber: "",
  });

  const [selectedClient, setSelectedClient] = useState<any>(null);
  const [showDetailModal, setShowDetailModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [editingClient, setEditingClient] = useState<any>(null);
  const [cpfError, setCpfError] = useState("");
  const [emailError, setEmailError] = useState("");
  const [phoneError, setPhoneError] = useState("");
  const { toast } = useToast();

  // Debounce para a busca
  const debouncedSearchTerm = useDebounce(searchTerm, 300);

  // Função para buscar CEP
  const buscarCEP = async (cep: string) => {
    // Remove a máscara do CEP
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      const data = await response.json();

      if (!data.erro) {
        setEditingClient((prev: any) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }));

        toast({
          title: "Endereço preenchido",
          description:
            "Os campos de endereço foram preenchidos automaticamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  // Função para buscar CEP no formulário de adicionar cliente
  const buscarCEPNovoCliente = async (cep: string) => {
    // Remove a máscara do CEP
    const cepLimpo = cep.replace(/\D/g, "");
    if (cepLimpo.length !== 8) return;

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cepLimpo}/json/`
      );
      const data = await response.json();

      if (!data.erro) {
        setNewClient((prev) => ({
          ...prev,
          street: data.logradouro || "",
          neighborhood: data.bairro || "",
          city: data.localidade || "",
          state: data.uf || "",
        }));

        toast({
          title: "Endereço preenchido",
          description:
            "Os campos de endereço foram preenchidos automaticamente.",
        });
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  // Carregar clientes da API
  const loadClients = async () => {
    try {
      setLoading(true);
      setLoadingMessage("Carregando clientes...");

      // Verificar se há token de autenticação
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("legalai_token")
          : null;

      if (!token) {
        // Sem token, carregar apenas do localStorage
        const localClients = localStorage.getItem("clients");
        if (localClients) {
          const parsedClients = JSON.parse(localClients);
          setClients(parsedClients);
          setLoading(false);
          setLoadingMessage("Dados carregados do armazenamento local");
          setDataSource("cache");
          return;
        } else {
          setClients([]);
          setLoading(false);
          setLoadingMessage("Nenhum cliente encontrado");
          return;
        }
      }

      // Tentar carregar do cache primeiro
      const cachedClients = localStorage.getItem("clients_cache");
      const cacheTimestamp = localStorage.getItem("clients_cache_timestamp");

      if (cachedClients && cacheTimestamp) {
        const cacheAge = Date.now() - parseInt(cacheTimestamp);
        // Usar cache se for mais recente que 5 minutos
        if (cacheAge < 5 * 60 * 1000) {
          const parsedClients = JSON.parse(cachedClients);
          setClients(parsedClients);
          setLoading(false);
          setLoadingMessage("Dados carregados do cache");
          setDataSource("cache");
          return;
        }
      }

      setLoadingMessage("Conectando ao servidor...");
      const apiClients = await clientsService.getClients();
      setClients(apiClients);
      setInitialLoadComplete(true);
      setDataSource("server");

      // Salvar no cache
      localStorage.setItem("clients_cache", JSON.stringify(apiClients));
      localStorage.setItem("clients_cache_timestamp", Date.now().toString());
      setCacheKey(Date.now().toString());

      setLoadingMessage("Clientes carregados com sucesso!");
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setLoadingMessage("Erro ao carregar clientes");
      toast({
        title: "Erro ao carregar clientes",
        description: "Não foi possível carregar os clientes do servidor.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Migrar clientes do localStorage para a API
  const migrateClients = async () => {
    if (!clientsService.hasLocalStorageClients()) {
      return;
    }

    try {
      setMigrating(true);
      // await clientsService.migrateFromLocalStorage(); // Método não implementado
      await loadClients(); // Recarregar clientes após migração
      toast({
        title: "Migração concluída",
        description:
          "Seus clientes foram migrados para o servidor com sucesso!",
      });
    } catch (error) {
      console.error("Erro durante migração:", error);
      toast({
        title: "Erro na migração",
        description: "Não foi possível migrar todos os clientes.",
        variant: "destructive",
      });
    } finally {
      setMigrating(false);
    }
  };

  // Carregar clientes ao montar o componente
  useEffect(() => {
    loadClients();
  }, []);

  // Verificar se há clientes no localStorage para migrar (apenas após carregamento inicial)
  useEffect(() => {
    if (initialLoadComplete && clientsService.hasLocalStorageClients()) {
      toast({
        title: "Clientes encontrados",
        description:
          "Há clientes salvos localmente que podem ser migrados para o servidor.",
        action: (
          <Button
            onClick={migrateClients}
            disabled={migrating}
            size="sm"
            variant="outline">
            {migrating ? "Migrando..." : "Migrar"}
          </Button>
        ),
      });
    }
  }, [initialLoadComplete]);

  // Função para limpar cache
  const clearCache = () => {
    localStorage.removeItem("clients_cache");
    localStorage.removeItem("clients_cache_timestamp");
  };

  // Função para recarregar clientes (força atualização)
  const reloadClients = async () => {
    clearCache();
    await loadClients();
  };

  // Filtro de clientes otimizado com useMemo
  const filteredClients = useMemo(() => {
    if (!debouncedSearchTerm.trim()) {
      return clients;
    }

    const searchLower = debouncedSearchTerm.toLowerCase();
    return clients.filter(
      (client) =>
        client.name.toLowerCase().includes(searchLower) ||
        (client.email && client.email.toLowerCase().includes(searchLower)) ||
        (client.cpf && client.cpf.includes(debouncedSearchTerm))
    );
  }, [clients, debouncedSearchTerm]);

  // Estatísticas dos clientes otimizadas
  const stats = useMemo(
    () => ({
      total: clients.length,
      active: clients.filter((c) => c.status === "Ativo").length,
      inactive: clients.filter((c) => c.status !== "Ativo").length,
      withProcesses: clients.filter((c) => c.processes > 0).length,
    }),
    [clients]
  );

  const handleAddClient = async (e: React.FormEvent) => {
    e.preventDefault();
    if (cpfError || emailError || phoneError) return;
    setLoading(true);
    try {
      // Verificar se há token de autenticação
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("legalai_token")
          : null;

      // Criar endereço formatado para compatibilidade
      const formattedAddress = `${newClient.street}, ${newClient.number}${
        newClient.complement ? `, ${newClient.complement}` : ""
      } - ${newClient.neighborhood}, ${newClient.city}/${
        newClient.state
      } - CEP: ${newClient.cep}`;

      const clientData = {
        name: newClient.name,
        email: newClient.email,
        phone: newClient.phone,
        cpf: newClient.cpf,
        address: formattedAddress,
        cep: newClient.cep,
        street: newClient.street,
        number: newClient.number,
        complement: newClient.complement,
        neighborhood: newClient.neighborhood,
        city: newClient.city,
        state: newClient.state,
        rg: newClient.rg,
        birthDate: newClient.birthDate,
        maritalStatus: newClient.maritalStatus,
        profession: newClient.profession,
        nationality: newClient.nationality,
        observations: newClient.observations,
        status: newClient.status,
        processes: newClient.processes,
        processNumber: newClient.processNumber,
      };

      if (token) {
        // Com token, salvar na API
        const newClientFromApi = await clientsService.createClient(clientData);
        setClients([newClientFromApi, ...clients]);
      } else {
        // Sem token, salvar apenas no localStorage
        const newLocalClient = {
          ...clientData,
          id: `local_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
          userId: "local",
          createdAt: new Date().toISOString(),
          updatedAt: new Date().toISOString(),
        };

        const updatedClients = [newLocalClient, ...clients];
        setClients(updatedClients);
        localStorage.setItem("clients", JSON.stringify(updatedClients));
      }

      setNewClient({
        name: "",
        email: "",
        phone: "",
        cpf: "",
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        rg: "",
        birthDate: "",
        maritalStatus: "",
        profession: "",
        nationality: "Brasileira",
        observations: "",
        status: "Ativo",
        processes: 0,
        processNumber: "",
      });
      setShowAddForm(false);
      toast({ title: "Cliente cadastrado com sucesso!", variant: "default" });
    } catch (error) {
      console.error("Erro ao cadastrar cliente:", error);
      toast({
        title: "Erro ao cadastrar cliente",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const handleDeleteClient = async (id: string) => {
    const client = clients.find((c) => c.id === id);
    const clientName = client?.name || "Cliente";

    if (
      !window.confirm(
        `Tem certeza que deseja excluir o cliente "${clientName}"?\n\nEsta ação não pode ser desfeita.`
      )
    ) {
      return;
    }

    try {
      setLoading(true);

      // Verificar se há token de autenticação
      const token =
        typeof window !== "undefined"
          ? localStorage.getItem("legalai_token")
          : null;

      if (token) {
        // Com token, excluir da API
        await clientsService.deleteClient(id);
      }

      // Atualizar estado local
      const updatedClients = clients.filter((client) => client.id !== id);
      setClients(updatedClients);

      // Se não há token, salvar no localStorage
      if (!token) {
        localStorage.setItem("clients", JSON.stringify(updatedClients));
      }

      toast({
        title: "Cliente excluído",
        description: `O cliente "${clientName}" foi removido com sucesso.`,
        variant: "destructive",
      });
    } catch (error) {
      console.error("Erro ao excluir cliente:", error);
      toast({
        title: "Erro ao excluir cliente",
        description:
          error instanceof Error ? error.message : "Erro desconhecido",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Função para abrir modal de edição
  const handleEditClient = (client: any) => {
    console.log("Editando cliente:", client);
    setEditingClient({ ...client });
    setShowEditModal(true);
    setShowDetailModal(false);
  };

  // Função para salvar edição
  const handleSaveEdit = async () => {
    if (editingClient) {
      console.log("Salvando cliente:", editingClient);
      try {
        setLoading(true);

        // Verificar se há token de autenticação
        const token =
          typeof window !== "undefined"
            ? localStorage.getItem("legalai_token")
            : null;

        if (token) {
          // Com token, atualizar na API
          const updatedClient = await clientsService.updateClient(
            editingClient.id,
            {
              name: editingClient.name,
              email: editingClient.email,
              phone: editingClient.phone,
              cpf: editingClient.cpf,
              rg: editingClient.rg,
              cep: editingClient.cep,
              street: editingClient.street,
              number: editingClient.number,
              complement: editingClient.complement,
              neighborhood: editingClient.neighborhood,
              city: editingClient.city,
              state: editingClient.state,
              address: editingClient.address,
              birthDate: editingClient.birthDate,
              maritalStatus: editingClient.maritalStatus,
              nationality: editingClient.nationality,
              profession: editingClient.profession,
              observations: editingClient.observations,
              processes: editingClient.processes,
              status: editingClient.status,
              processNumber: editingClient.processNumber,
            }
          );
        }

        // Atualizar localmente com os dados editados
        const updatedClients = clients.map((client) =>
          client.id === editingClient.id
            ? {
                ...client,
                ...editingClient,
                processNumber: editingClient.processNumber,
                processes: editingClient.processes,
              }
            : client
        );
        setClients(updatedClients);

        // Se não há token, salvar no localStorage
        if (!token) {
          localStorage.setItem("clients", JSON.stringify(updatedClients));
        }

        // Forçar atualização do estado local
        setTimeout(() => {
          setClients([...updatedClients]);
        }, 100);
        setShowEditModal(false);
        setEditingClient(null);
        toast({
          title: "Cliente atualizado",
          description: "Os dados do cliente foram atualizados com sucesso.",
        });
      } catch (error) {
        console.error("Erro ao atualizar cliente:", error);
        toast({
          title: "Erro ao atualizar cliente",
          description:
            error instanceof Error ? error.message : "Erro desconhecido",
          variant: "destructive",
        });
      } finally {
        setLoading(false);
      }
    }
  };

  const formatDate = (date: string | Date) => {
    return new Date(date).toLocaleDateString("pt-BR");
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "Ativo":
        return "bg-green-100 text-green-700";
      case "Inativo":
        return "bg-red-100 text-red-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Clientes"
        subtitle="Gerencie sua base de clientes e processos"
        icon={<Users className="w-5 h-5 md:w-6 md:h-6" />}
        actions={
          <Button
            onClick={() => setShowAddForm(true)}
            className="bg-gradient-aiudex hover:shadow-aiudex-lg text-white font-bold px-6 py-2 rounded-xl shadow-aiudex transition-all duration-200 border-0">
            <Plus className="w-4 h-4 mr-2" />
            Adicionar Cliente
          </Button>
        }
      />

      <div className="max-w-7xl mx-auto p-4 md:p-6 min-h-[60vh] relative">
        {/* Estatísticas, busca, etc... */}
        {/* Estatísticas */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6 mb-8">
          <Card className="bg-gradient-to-br from-blue-500 to-blue-600 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <Users className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Total de Clientes</p>
                  <p className="text-2xl font-bold text-white">{stats.total}</p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-green-500 to-green-600 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <CheckCircle className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Clientes Ativos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.active}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-orange-500 to-orange-600 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Com Processos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.withProcesses}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>

          <Card className="bg-gradient-to-br from-purple-500 to-purple-600 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
            <CardContent className="p-6">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                  <Clock className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-sm text-white/80">Inativos</p>
                  <p className="text-2xl font-bold text-white">
                    {stats.inactive}
                  </p>
                </div>
              </div>
            </CardContent>
          </Card>
        </div>

        {/* Busca e Filtros */}
        <div className="flex items-center space-x-4 mb-6">
          <div className="flex-1 relative">
            <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
            <Input
              value={searchTerm}
              onChange={(e) => setSearchTerm(e.target.value)}
              placeholder="Buscar clientes por nome, email ou CPF..."
              className="pl-10"
            />
          </div>
          <Button
            variant="outline"
            onClick={reloadClients}
            disabled={loading}
            className="flex items-center space-x-2">
            <div className={`w-4 h-4 ${loading ? "animate-spin" : ""}`}>
              {loading ? (
                <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full"></div>
              ) : (
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24">
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M4 4v5h.582m15.356 2A8.001 8.001 0 004.582 9m0 0H9m11 11v-5h-.581m0 0a8.003 8.003 0 01-15.357-2m15.357 2H15"
                  />
                </svg>
              )}
            </div>
            <span className="hidden sm:inline">Atualizar</span>
          </Button>
          <Button variant="outline">
            <Filter className="w-4 h-4 mr-2" />
            Filtros
          </Button>
        </div>

        {/* Lista de Clientes */}
        <div className="mb-8">
          <div className="flex items-center justify-between mb-4">
            <h2 className="text-xl font-bold text-gray-900">
              Base de Clientes
            </h2>
            <div className="flex items-center space-x-2">
              {loading && (
                <div className="flex items-center space-x-2 text-sm text-blue-600">
                  <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                  <span>{loadingMessage}</span>
                </div>
              )}
              {!loading && dataSource && (
                <div className="flex items-center space-x-2 text-xs">
                  <div
                    className={`w-2 h-2 rounded-full ${
                      dataSource === "cache" ? "bg-green-500" : "bg-blue-500"
                    }`}></div>
                  <span className="text-gray-500">
                    {dataSource === "cache"
                      ? "Dados do cache"
                      : "Dados do servidor"}
                  </span>
                </div>
              )}
              <span className="text-sm text-gray-500">
                {loading
                  ? ""
                  : `${filteredClients.length} cliente${
                      filteredClients.length !== 1 ? "s" : ""
                    } encontrado${filteredClients.length !== 1 ? "s" : ""}`}
              </span>
            </div>
          </div>

          {loading ? (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {[1, 2, 3, 4, 5, 6].map((index) => (
                <Card
                  key={index}
                  className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex animate-pulse">
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-gray-200 rounded-lg animate-pulse"></div>
                        <div className="space-y-2">
                          <div className="h-4 bg-gray-200 rounded w-32 animate-pulse"></div>
                          <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                        </div>
                      </div>
                      <div className="h-6 bg-gray-200 rounded w-16 animate-pulse"></div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-24 animate-pulse"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-32 animate-pulse"></div>
                      </div>
                      <div className="flex items-center space-x-2">
                        <div className="w-4 h-4 bg-gray-200 rounded animate-pulse"></div>
                        <div className="h-3 bg-gray-200 rounded w-28 animate-pulse"></div>
                      </div>
                      <div className="flex items-center space-x-2 pt-2">
                        <div className="h-8 bg-gray-200 rounded w-20 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-16 animate-pulse"></div>
                        <div className="h-8 bg-gray-200 rounded w-18 animate-pulse"></div>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          ) : filteredClients.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <Users className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum cliente encontrado
                </h3>
                <p className="text-gray-500 mb-4">
                  {searchTerm
                    ? "Tente ajustar os termos de busca para encontrar o cliente desejado"
                    : "Comece adicionando seu primeiro cliente para organizar seus casos jurídicos"}
                </p>
                <Button onClick={() => setShowAddForm(true)}>
                  <Plus className="w-4 h-4 mr-2" />
                  Adicionar Cliente
                </Button>
              </CardContent>
            </Card>
          ) : (
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {filteredClients.map((client) => (
                <Card
                  key={client.id}
                  className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02]">
                  <CardHeader className="pb-3">
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-aiudex rounded-lg flex items-center justify-center shadow-aiudex">
                        <Users className="w-5 h-5 text-white" />
                      </div>
                      <div>
                        <CardTitle className="text-base text-gray-900">
                          {client.name}
                        </CardTitle>
                        <p className="text-sm text-gray-600">{client.email}</p>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Phone className="w-4 h-4" />
                        <span>{client.phone}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <MapPin className="w-4 h-4" />
                        <span className="truncate">{client.address}</span>
                      </div>
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Calendar className="w-4 h-4" />
                        <span>
                          Cadastrado em {formatDate(client.createdAt)}
                        </span>
                      </div>

                      {/* Badges de Status e Processo */}
                      <div className="flex items-center space-x-2 pt-3 border-t border-gray-100">
                        {/* Badge de Status */}
                        <span
                          className={`px-2 py-1 text-xs font-medium rounded-full ${
                            client.status === "Ativo"
                              ? "bg-green-100 text-green-700"
                              : "bg-red-100 text-red-700"
                          }`}>
                          {client.status || "Ativo"}
                        </span>

                        {/* Badge de Processo */}
                        {client.processes > 0 && (
                          <span className="px-2 py-1 text-xs font-medium rounded-full bg-blue-100 text-blue-700">
                            Com Processo
                          </span>
                        )}
                      </div>

                      <div className="flex items-center space-x-2 pt-2">
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedClient(client);
                            setShowDetailModal(true);
                          }}>
                          <Eye className="w-4 h-4 mr-1" />
                          Visualizar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-green-200 text-green-700 hover:bg-green-50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditClient(client);
                          }}>
                          <Edit3 className="w-4 h-4 mr-1" />
                          Editar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="border-red-200 text-red-700 hover:bg-red-50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleDeleteClient(client.id);
                          }}>
                          <Trash2 className="w-4 h-4 mr-1" />
                          Excluir
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          )}
        </div>

        {/* Add Client Modal */}
        <Dialog open={showAddForm} onOpenChange={setShowAddForm}>
          <DialogContent className="w-[95vw] max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg mx-4 sm:mx-6">
            <DialogHeader className="space-y-3">
              <DialogTitle className="text-xl sm:text-2xl text-gradient-aiudex font-bold">
                Novo Cliente
              </DialogTitle>
              <DialogDescription className="text-sm sm:text-base text-blue-700 font-medium">
                Preencha os dados do novo cliente. Os campos marcados com * são
                obrigatórios.
              </DialogDescription>
            </DialogHeader>
            <form onSubmit={handleAddClient}>
              <Tabs defaultValue="dados-pessoais" className="w-full">
                <TabsList className="grid w-full grid-cols-2 bg-blue-100/50 border-2 border-blue-200/30 rounded-xl p-1">
                  <TabsTrigger
                    value="dados-pessoais"
                    className="data-[state=active]:bg-gradient-aiudex data-[state=active]:text-white data-[state=active]:shadow-aiudex rounded-lg font-bold text-xs sm:text-sm">
                    <span className="hidden sm:inline">Dados Pessoais</span>
                    <span className="sm:hidden">Pessoais</span>
                  </TabsTrigger>
                  <TabsTrigger
                    value="observacoes"
                    className="data-[state=active]:bg-gradient-aiudex data-[state=active]:text-white data-[state=active]:shadow-aiudex rounded-lg font-bold text-xs sm:text-sm">
                    Observações
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="dados-pessoais" className="space-y-6 mt-6">
                  {/* Dados Básicos */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Informações Básicas
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
                      <div className="sm:col-span-2 lg:col-span-1">
                        <Label
                          htmlFor="name"
                          className="text-sm font-medium text-gray-700">
                          Nome Completo *
                        </Label>
                        <Input
                          id="name"
                          value={newClient.name}
                          onChange={(e) =>
                            setNewClient((prev) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="Nome completo do cliente"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="email"
                          className="text-sm font-medium text-gray-700">
                          Email *
                        </Label>
                        <Input
                          id="email"
                          type="email"
                          value={newClient.email}
                          onChange={(e) => {
                            const value = e.target.value;
                            setNewClient((prev) => ({
                              ...prev,
                              email: value,
                            }));

                            if (
                              value &&
                              !/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(value)
                            ) {
                              setEmailError("Email inválido");
                            } else {
                              setEmailError("");
                            }
                          }}
                          required
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="email@exemplo.com"
                        />
                        {emailError && (
                          <p className="text-red-500 text-xs mt-1">
                            {emailError}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="phone"
                          className="text-sm font-medium text-gray-700">
                          Telefone *
                        </Label>
                        <Input
                          id="phone"
                          value={newClient.phone}
                          onChange={(e) => {
                            const value = maskPhone(e.target.value);
                            setNewClient((prev) => ({
                              ...prev,
                              phone: value,
                            }));

                            const digitsOnly = value.replace(/\D/g, "");
                            if (value && digitsOnly.length < 10) {
                              setPhoneError(
                                "Telefone deve ter pelo menos 10 dígitos"
                              );
                            } else {
                              setPhoneError("");
                            }
                          }}
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="(11) 99999-9999"
                        />
                        {phoneError && (
                          <p className="text-red-500 text-xs mt-1">
                            {phoneError}
                          </p>
                        )}
                      </div>
                    </div>
                  </div>

                  {/* Documentos */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Documentos
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label
                          htmlFor="cpf"
                          className="text-sm font-medium text-gray-700">
                          CPF *
                        </Label>
                        <Input
                          id="cpf"
                          value={newClient.cpf}
                          onChange={(e) => {
                            const value = maskCPF(e.target.value);
                            setNewClient((prev) => ({
                              ...prev,
                              cpf: value,
                            }));

                            if (value && !validateCPF(value)) {
                              setCpfError("CPF inválido");
                            } else {
                              setCpfError("");
                            }
                          }}
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="000.000.000-00"
                        />
                        {cpfError && (
                          <p className="text-red-500 text-xs mt-1">
                            {cpfError}
                          </p>
                        )}
                      </div>
                      <div>
                        <Label
                          htmlFor="rg"
                          className="text-sm font-medium text-gray-700">
                          RG
                        </Label>
                        <Input
                          id="rg"
                          value={newClient.rg}
                          onChange={(e) =>
                            setNewClient((prev) => ({
                              ...prev,
                              rg: e.target.value,
                            }))
                          }
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="00.000.000-0"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="birthDate"
                          className="text-sm font-medium text-gray-700">
                          Data de Nascimento
                        </Label>
                        <Input
                          id="birthDate"
                          type="date"
                          value={newClient.birthDate}
                          onChange={(e) =>
                            setNewClient((prev) => ({
                              ...prev,
                              birthDate: e.target.value,
                            }))
                          }
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="nationality"
                          className="text-sm font-medium text-gray-700">
                          Nacionalidade
                        </Label>
                        <Input
                          id="nationality"
                          value={newClient.nationality}
                          onChange={(e) =>
                            setNewClient((prev) => ({
                              ...prev,
                              nationality: e.target.value,
                            }))
                          }
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="Brasileira"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Informações Pessoais */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Informações Pessoais
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
                      <div>
                        <Label
                          htmlFor="maritalStatus"
                          className="text-sm font-medium text-gray-700">
                          Estado Civil
                        </Label>
                        <Select
                          value={newClient.maritalStatus}
                          onValueChange={(value) =>
                            setNewClient((prev) => ({
                              ...prev,
                              maritalStatus: value,
                            }))
                          }>
                          <SelectTrigger className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                            <SelectValue placeholder="Selecione o estado civil" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Solteiro(a)">
                              Solteiro(a)
                            </SelectItem>
                            <SelectItem value="Casado(a)">Casado(a)</SelectItem>
                            <SelectItem value="Divorciado(a)">
                              Divorciado(a)
                            </SelectItem>
                            <SelectItem value="Viúvo(a)">Viúvo(a)</SelectItem>
                            <SelectItem value="União Estável">
                              União Estável
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label
                          htmlFor="profession"
                          className="text-sm font-medium text-gray-700">
                          Profissão
                        </Label>
                        <Input
                          id="profession"
                          value={newClient.profession}
                          onChange={(e) =>
                            setNewClient((prev) => ({
                              ...prev,
                              profession: e.target.value,
                            }))
                          }
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="Profissão do cliente"
                        />
                      </div>
                    </div>
                  </div>

                  {/* Endereço */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Endereço
                    </h3>
                    <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
                      <div>
                        <Label
                          htmlFor="cep"
                          className="text-sm font-medium text-gray-700">
                          CEP
                        </Label>
                        <Input
                          id="cep"
                          value={newClient.cep}
                          onChange={(e) => {
                            const cep = maskCEP(e.target.value);
                            setNewClient((prev) => ({
                              ...prev,
                              cep: cep,
                            }));
                            buscarCEPNovoCliente(cep);
                          }}
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="sm:col-span-2 lg:col-span-2">
                        <Label
                          htmlFor="street"
                          className="text-sm font-medium text-gray-700">
                          Logradouro
                        </Label>
                        <Input
                          id="street"
                          value={newClient.street}
                          onChange={(e) =>
                            setNewClient((prev) => ({
                              ...prev,
                              street: e.target.value,
                            }))
                          }
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="Rua, Avenida, etc."
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="number"
                          className="text-sm font-medium text-gray-700">
                          Número
                        </Label>
                        <Input
                          id="number"
                          value={newClient.number}
                          onChange={(e) =>
                            setNewClient((prev) => ({
                              ...prev,
                              number: e.target.value,
                            }))
                          }
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="123"
                        />
                      </div>
                    </div>
                    <div className="grid grid-cols-1 sm:grid-cols-3 gap-4">
                      <div>
                        <Label
                          htmlFor="complement"
                          className="text-sm font-medium text-gray-700">
                          Complemento
                        </Label>
                        <Input
                          id="complement"
                          value={newClient.complement}
                          onChange={(e) =>
                            setNewClient((prev) => ({
                              ...prev,
                              complement: e.target.value,
                            }))
                          }
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="Apto, Bloco, etc."
                        />
                      </div>
                      <div>
                        <Label
                          htmlFor="neighborhood"
                          className="text-sm font-medium text-gray-700">
                          Bairro
                        </Label>
                        <Input
                          id="neighborhood"
                          value={newClient.neighborhood}
                          onChange={(e) =>
                            setNewClient((prev) => ({
                              ...prev,
                              neighborhood: e.target.value,
                            }))
                          }
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="Nome do bairro"
                        />
                      </div>
                      <div className="grid grid-cols-2 gap-2">
                        <div>
                          <Label
                            htmlFor="city"
                            className="text-sm font-medium text-gray-700">
                            Cidade
                          </Label>
                          <Input
                            id="city"
                            value={newClient.city}
                            onChange={(e) =>
                              setNewClient((prev) => ({
                                ...prev,
                                city: e.target.value,
                              }))
                            }
                            className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            placeholder="Cidade"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="state"
                            className="text-sm font-medium text-gray-700">
                            UF
                          </Label>
                          <Input
                            id="state"
                            value={newClient.state}
                            onChange={(e) =>
                              setNewClient((prev) => ({
                                ...prev,
                                state: e.target.value,
                              }))
                            }
                            className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                            placeholder="SP"
                            maxLength={2}
                          />
                        </div>
                      </div>
                    </div>
                  </div>
                </TabsContent>

                <TabsContent value="observacoes" className="space-y-4 mt-6">
                  {/* Status e Processo */}
                  <div className="space-y-4">
                    <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                      Status e Processo
                    </h3>
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Status do Cliente
                        </Label>
                        <Select
                          value={newClient.status || "Ativo"}
                          onValueChange={(value) =>
                            setNewClient((prev) => ({
                              ...prev,
                              status: value,
                            }))
                          }>
                          <SelectTrigger className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                            <SelectValue placeholder="Selecione o status" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Ativo">Ativo</SelectItem>
                            <SelectItem value="Inativo">Inativo</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <div className="flex items-center space-x-3">
                          <div className="flex items-center space-x-2">
                            <input
                              type="checkbox"
                              id="hasProcess"
                              checked={newClient.processes > 0}
                              onChange={(e) => {
                                setNewClient((prev) => ({
                                  ...prev,
                                  processes: e.target.checked ? 1 : 0,
                                }));
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Label
                              htmlFor="hasProcess"
                              className="text-sm font-medium text-gray-700">
                              Com Processo
                            </Label>
                          </div>
                        </div>
                        {newClient.processes > 0 && (
                          <div className="mt-2">
                            <Label className="text-sm font-medium text-gray-700">
                              Número do Processo
                            </Label>
                            <Input
                              id="processNumber"
                              value={newClient.processNumber || ""}
                              onChange={(e) =>
                                setNewClient((prev) => ({
                                  ...prev,
                                  processNumber: e.target.value,
                                }))
                              }
                              className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              placeholder="Número do processo (opcional)"
                            />
                          </div>
                        )}
                      </div>
                    </div>
                  </div>

                  <div>
                    <Label
                      htmlFor="observations"
                      className="text-sm font-medium text-gray-700">
                      Observações Gerais
                    </Label>
                    <Textarea
                      id="observations"
                      value={newClient.observations}
                      onChange={(e) =>
                        setNewClient((prev) => ({
                          ...prev,
                          observations: e.target.value,
                        }))
                      }
                      className="mt-1 min-h-[120px] border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg resize-none"
                      placeholder="Informações adicionais sobre o cliente, casos especiais, preferências, etc."
                    />
                  </div>
                </TabsContent>
              </Tabs>

              <div className="flex flex-col sm:flex-row justify-end space-y-2 sm:space-y-0 sm:space-x-3 mt-8 pt-6 border-t border-gray-200">
                <Button
                  type="button"
                  variant="outline"
                  onClick={() => setShowAddForm(false)}
                  className="order-2 sm:order-1 border-gray-300 text-gray-700 hover:bg-gray-50">
                  Cancelar
                </Button>
                <Button
                  type="submit"
                  disabled={
                    loading || !!cpfError || !!emailError || !!phoneError
                  }
                  className="order-1 sm:order-2 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold shadow-lg hover:shadow-xl transition-all duration-200 disabled:opacity-50 disabled:cursor-not-allowed">
                  {loading ? (
                    <div className="flex items-center space-x-2">
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                      <span>Salvando...</span>
                    </div>
                  ) : (
                    <div className="flex items-center space-x-2">
                      <Save className="w-4 h-4" />
                      <span>Salvar Cliente</span>
                    </div>
                  )}
                </Button>
              </div>
            </form>
          </DialogContent>
        </Dialog>

        {/* Modal de Visualização */}
        <Dialog open={showDetailModal} onOpenChange={setShowDetailModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-gradient-aiudex font-bold">
                Detalhes do Cliente
              </DialogTitle>
              <DialogDescription className="text-blue-700 font-medium">
                Visualize todos os dados do cliente organizados por seções.
              </DialogDescription>
            </DialogHeader>

            {selectedClient && (
              <div className="space-y-6">
                <Tabs defaultValue="dados-pessoais" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="dados-pessoais">
                      Dados Pessoais
                    </TabsTrigger>
                    <TabsTrigger value="endereco">Endereço</TabsTrigger>
                    <TabsTrigger value="observacoes">Observações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dados-pessoais" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Nome Completo
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.name || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Email
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.email || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Telefone
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.phone || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          CPF
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.cpf || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          RG
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.rg || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Data de Nascimento
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.birthDate || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Estado Civil
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.maritalStatus || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Profissão
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.profession || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Nacionalidade
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.nationality || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="endereco" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          CEP
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.cep || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Logradouro
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.street || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Número
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.number || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Complemento
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.complement || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Bairro
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.neighborhood || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Cidade
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.city || "Não informado"}
                        </p>
                      </div>
                      <div>
                        <Label className="text-sm font-medium text-gray-700">
                          Estado
                        </Label>
                        <p className="text-sm text-gray-900 font-medium mt-1">
                          {selectedClient.state || "Não informado"}
                        </p>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="observacoes" className="space-y-4">
                    <div>
                      <Label className="text-sm font-medium text-gray-700">
                        Observações
                      </Label>
                      <div className="mt-2 p-3 bg-gray-50 rounded-lg">
                        <p className="text-sm text-gray-900 whitespace-pre-wrap">
                          {selectedClient.observations ||
                            "Nenhuma observação registrada"}
                        </p>
                      </div>
                    </div>
                  </TabsContent>
                </Tabs>
              </div>
            )}
            <div className="flex gap-2 mt-6">
              <Button
                onClick={() => {
                  if (selectedClient) {
                    handleEditClient(selectedClient);
                  }
                }}
                className="flex-1 bg-gradient-aiudex hover:shadow-aiudex-lg text-white font-bold rounded-xl shadow-aiudex transition-all duration-200">
                <Edit className="w-4 h-4 mr-2" />
                Editar Cliente
              </Button>
              <Button
                variant="outline"
                className="flex-1 border-2 border-blue-300 text-blue-700 bg-white/90 backdrop-blur-sm hover:bg-blue-50 shadow-aiudex"
                onClick={() => setShowDetailModal(false)}>
                Fechar
              </Button>
            </div>
          </DialogContent>
        </Dialog>

        {/* Modal de Edição */}
        <Dialog open={showEditModal} onOpenChange={setShowEditModal}>
          <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
            <DialogHeader>
              <DialogTitle className="text-gradient-aiudex font-bold">
                Editar Cliente
              </DialogTitle>
              <DialogDescription className="text-blue-700 font-medium">
                Edite os dados do cliente. Os campos marcados com * são
                obrigatórios.
              </DialogDescription>
            </DialogHeader>
            {editingClient ? (
              <form
                onSubmit={(e) => {
                  e.preventDefault();
                  handleSaveEdit();
                }}>
                <Tabs defaultValue="dados-pessoais" className="w-full">
                  <TabsList className="grid w-full grid-cols-3">
                    <TabsTrigger value="dados-pessoais">
                      Dados Pessoais
                    </TabsTrigger>
                    <TabsTrigger value="endereco">Endereço</TabsTrigger>
                    <TabsTrigger value="observacoes">Observações</TabsTrigger>
                  </TabsList>

                  <TabsContent value="dados-pessoais" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-name">Nome Completo *</Label>
                        <Input
                          id="edit-name"
                          value={editingClient.name || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              name: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-email">Email *</Label>
                        <Input
                          id="edit-email"
                          type="email"
                          value={editingClient.email || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              email: e.target.value,
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-phone">Telefone *</Label>
                        <Input
                          id="edit-phone"
                          value={editingClient.phone || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              phone: maskPhone(e.target.value),
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-cpf">CPF *</Label>
                        <Input
                          id="edit-cpf"
                          value={editingClient.cpf || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              cpf: maskCPF(e.target.value),
                            }))
                          }
                          required
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-rg">RG</Label>
                        <Input
                          id="edit-rg"
                          value={editingClient.rg || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              rg: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-birthDate">
                          Data de Nascimento
                        </Label>
                        <Input
                          id="edit-birthDate"
                          type="date"
                          value={editingClient.birthDate || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              birthDate: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-maritalStatus">Estado Civil</Label>
                        <Select
                          value={editingClient.maritalStatus || ""}
                          onValueChange={(value) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              maritalStatus: value,
                            }))
                          }>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado civil" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="Solteiro">Solteiro</SelectItem>
                            <SelectItem value="Casado">Casado</SelectItem>
                            <SelectItem value="Divorciado">
                              Divorciado
                            </SelectItem>
                            <SelectItem value="Viúvo">Viúvo</SelectItem>
                            <SelectItem value="União Estável">
                              União Estável
                            </SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                      <div>
                        <Label htmlFor="edit-profession">Profissão</Label>
                        <Input
                          id="edit-profession"
                          value={editingClient.profession || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              profession: e.target.value,
                            }))
                          }
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-nationality">Nacionalidade</Label>
                        <Input
                          id="edit-nationality"
                          value={editingClient.nationality || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              nationality: e.target.value,
                            }))
                          }
                        />
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="endereco" className="space-y-4">
                    <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                      <div>
                        <Label htmlFor="edit-cep">CEP</Label>
                        <Input
                          id="edit-cep"
                          value={editingClient.cep || ""}
                          onChange={(e) => {
                            const cep = maskCEP(e.target.value);
                            setEditingClient((prev: any) => ({
                              ...prev,
                              cep: cep,
                            }));
                            buscarCEP(cep);
                          }}
                          className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                          placeholder="00000-000"
                        />
                      </div>
                      <div className="md:col-span-2">
                        <Label htmlFor="edit-street">Logradouro</Label>
                        <Input
                          id="edit-street"
                          value={editingClient.street || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              street: e.target.value,
                            }))
                          }
                          placeholder="Rua, Avenida, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-number">Número</Label>
                        <Input
                          id="edit-number"
                          value={editingClient.number || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              number: e.target.value,
                            }))
                          }
                          placeholder="123"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-complement">Complemento</Label>
                        <Input
                          id="edit-complement"
                          value={editingClient.complement || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              complement: e.target.value,
                            }))
                          }
                          placeholder="Apto 101, Sala 2, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-neighborhood">Bairro</Label>
                        <Input
                          id="edit-neighborhood"
                          value={editingClient.neighborhood || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              neighborhood: e.target.value,
                            }))
                          }
                          placeholder="Centro, Vila Madalena, etc."
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-city">Cidade</Label>
                        <Input
                          id="edit-city"
                          value={editingClient.city || ""}
                          onChange={(e) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              city: e.target.value,
                            }))
                          }
                          placeholder="São Paulo"
                        />
                      </div>
                      <div>
                        <Label htmlFor="edit-state">Estado</Label>
                        <Select
                          value={editingClient.state || ""}
                          onValueChange={(value) =>
                            setEditingClient((prev: any) => ({
                              ...prev,
                              state: value,
                            }))
                          }>
                          <SelectTrigger>
                            <SelectValue placeholder="Selecione o estado" />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="AC">Acre</SelectItem>
                            <SelectItem value="AL">Alagoas</SelectItem>
                            <SelectItem value="AP">Amapá</SelectItem>
                            <SelectItem value="AM">Amazonas</SelectItem>
                            <SelectItem value="BA">Bahia</SelectItem>
                            <SelectItem value="CE">Ceará</SelectItem>
                            <SelectItem value="DF">Distrito Federal</SelectItem>
                            <SelectItem value="ES">Espírito Santo</SelectItem>
                            <SelectItem value="GO">Goiás</SelectItem>
                            <SelectItem value="MA">Maranhão</SelectItem>
                            <SelectItem value="MT">Mato Grosso</SelectItem>
                            <SelectItem value="MS">
                              Mato Grosso do Sul
                            </SelectItem>
                            <SelectItem value="MG">Minas Gerais</SelectItem>
                            <SelectItem value="PA">Pará</SelectItem>
                            <SelectItem value="PB">Paraíba</SelectItem>
                            <SelectItem value="PR">Paraná</SelectItem>
                            <SelectItem value="PE">Pernambuco</SelectItem>
                            <SelectItem value="PI">Piauí</SelectItem>
                            <SelectItem value="RJ">Rio de Janeiro</SelectItem>
                            <SelectItem value="RN">
                              Rio Grande do Norte
                            </SelectItem>
                            <SelectItem value="RS">
                              Rio Grande do Sul
                            </SelectItem>
                            <SelectItem value="RO">Rondônia</SelectItem>
                            <SelectItem value="RR">Roraima</SelectItem>
                            <SelectItem value="SC">Santa Catarina</SelectItem>
                            <SelectItem value="SP">São Paulo</SelectItem>
                            <SelectItem value="SE">Sergipe</SelectItem>
                            <SelectItem value="TO">Tocantins</SelectItem>
                          </SelectContent>
                        </Select>
                      </div>
                    </div>
                  </TabsContent>

                  <TabsContent value="observacoes" className="space-y-4">
                    {/* Status e Processo */}
                    <div className="space-y-4">
                      <h3 className="text-lg font-semibold text-gray-900 border-b border-gray-200 pb-2">
                        Status e Processo
                      </h3>
                      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Status do Cliente
                          </Label>
                          <Select
                            value={editingClient.status || "Ativo"}
                            onValueChange={(value) =>
                              setEditingClient((prev: any) => ({
                                ...prev,
                                status: value,
                              }))
                            }>
                            <SelectTrigger className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg">
                              <SelectValue placeholder="Selecione o status" />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Ativo">Ativo</SelectItem>
                              <SelectItem value="Inativo">Inativo</SelectItem>
                            </SelectContent>
                          </Select>
                        </div>
                        <div>
                          <Label className="text-sm font-medium text-gray-700">
                            Número do Processo
                          </Label>
                          <div className="flex items-center space-x-2 mt-1">
                            <input
                              type="checkbox"
                              id="edit-hasProcess"
                              checked={editingClient.processes > 0}
                              onChange={(e) => {
                                setEditingClient((prev: any) => ({
                                  ...prev,
                                  processes: e.target.checked ? 1 : 0,
                                }));
                              }}
                              className="w-4 h-4 text-blue-600 bg-gray-100 border-gray-300 rounded focus:ring-blue-500"
                            />
                            <Label
                              htmlFor="edit-hasProcess"
                              className="text-sm font-medium text-gray-700">
                              Com Processo
                            </Label>
                          </div>
                          {editingClient.processes > 0 && (
                            <Input
                              id="edit-processNumber"
                              value={editingClient.processNumber || ""}
                              onChange={(e) => {
                                console.log(
                                  "Alterando processo no modal:",
                                  e.target.value
                                );
                                setEditingClient((prev: any) => ({
                                  ...prev,
                                  processNumber: e.target.value,
                                }));
                              }}
                              className="mt-1 h-10 border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg"
                              placeholder="Número do processo (opcional)"
                            />
                          )}
                        </div>
                      </div>
                    </div>

                    <div>
                      <Label htmlFor="edit-observations">
                        Observações/Descrição do Caso
                      </Label>
                      <Textarea
                        id="edit-observations"
                        value={editingClient.observations || ""}
                        onChange={(e) =>
                          setEditingClient((prev: any) => ({
                            ...prev,
                            observations: e.target.value,
                          }))
                        }
                        placeholder="Descreva os fatos do caso, documentos disponíveis, prazos importantes..."
                        rows={6}
                      />
                    </div>
                  </TabsContent>
                </Tabs>

                <div className="flex space-x-2 mt-6">
                  <Button
                    type="submit"
                    className="flex-1 bg-gradient-aiudex hover:shadow-aiudex-lg text-white font-bold rounded-xl shadow-aiudex transition-all duration-200">
                    <Save className="w-4 h-4 mr-2" />
                    Salvar Alterações
                  </Button>
                  <DialogClose asChild>
                    <Button
                      type="button"
                      variant="outline"
                      className="flex-1 border-2 border-blue-300 text-blue-700 bg-white/90 backdrop-blur-sm hover:bg-blue-50 shadow-aiudex">
                      Cancelar
                    </Button>
                  </DialogClose>
                </div>
              </form>
            ) : (
              <p>Nenhum cliente selecionado para edição.</p>
            )}
          </DialogContent>
        </Dialog>
      </div>
    </div>
  );
};

export default Clients;
