"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import {
  Accordion,
  AccordionContent,
  AccordionItem,
  AccordionTrigger,
} from "@/components/ui/accordion";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";
import {
  Users,
  Plus,
  X,
  Check,
  ChevronDown,
  User,
  Search,
  Mail,
  Phone,
} from "lucide-react";
import { EtapaClienteProps, Cliente } from "../types";
import { clientsService } from "@/lib/clients-service";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

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

export const EtapaCliente: React.FC<EtapaClienteProps> = ({
  state,
  actions,
  onNext,
}) => {
  const [showAddClient, setShowAddClient] = useState(false);
  const [novoCliente, setNovoCliente] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    rg: "",
    cep: "",
    street: "",
    number: "",
    complement: "",
    neighborhood: "",
    city: "",
    state: "",
    address: "",
    birthDate: "",
    maritalStatus: "",
    nationality: "Brasileira",
    profession: "",
    observations: "",
  });
  const [openClientesPopover, setOpenClientesPopover] = useState(false);
  const [openPartesAccordion, setOpenPartesAccordion] = useState<string[]>([
    "parte-0",
  ]);
  const [buscaClientes, setBuscaClientes] = useState("");
  const actionsRef = useRef(actions);
  const stateRef = useRef(state);

  // Função para buscar CEP
  const buscarCEP = async (
    cep: string,
    isParteAdversa: boolean = false,
    index?: number
  ) => {
    if (cep.length !== 9) return; // CEP deve ter 9 caracteres (incluindo hífen)

    try {
      const response = await fetch(
        `https://viacep.com.br/ws/${cep.replace(/\D/g, "")}/json/`
      );
      const data = await response.json();

      if (!data.erro) {
        if (isParteAdversa && index !== undefined) {
          // Atualizar parte adversa
          handleAtualizarParteAdversa(index, "street", data.logradouro || "");
          handleAtualizarParteAdversa(index, "neighborhood", data.bairro || "");
          handleAtualizarParteAdversa(index, "city", data.localidade || "");
          handleAtualizarParteAdversa(index, "state", data.uf || "");
        } else {
          // Atualizar novo cliente
          setNovoCliente((prev) => ({
            ...prev,
            street: data.logradouro || "",
            neighborhood: data.bairro || "",
            city: data.localidade || "",
            state: data.uf || "",
          }));
        }
      }
    } catch (error) {
      console.error("Erro ao buscar CEP:", error);
    }
  };

  // Atualizar referências quando props mudarem
  actionsRef.current = actions;
  stateRef.current = state;

  // Carregar clientes disponíveis apenas uma vez na montagem
  useEffect(() => {
    const loadClients = async () => {
      try {
        // Verificar se há token de autenticação
        if (typeof window !== "undefined") {
          const token = localStorage.getItem("legalai_token");

          if (token) {
            // Tentar carregar clientes da API primeiro
            try {
              const apiClients = await clientsService.getClients();

              if (apiClients && apiClients.length > 0) {
                // Adaptar a estrutura dos clientes da API para o formato do editor
                const clientesAdaptados: Cliente[] = apiClients.map(
                  (cliente: any) => ({
                    id: cliente.id,
                    name: cliente.name,
                    nome: cliente.name, // compatibilidade
                    email: cliente.email,
                    cpf: cliente.cpf,
                    rg: cliente.rg,
                    address: cliente.address,
                    endereco: cliente.address, // compatibilidade
                    profissao: cliente.profession,
                    estadoCivil: cliente.maritalStatus,
                    maritalStatus: cliente.maritalStatus, // compatibilidade
                    manual: false, // clientes do banco não são manuais
                    // Campos adicionais da página Clients
                    phone: cliente.phone,
                    cep: cliente.cep,
                    street: cliente.street,
                    number: cliente.number,
                    complement: cliente.complement,
                    neighborhood: cliente.neighborhood,
                    city: cliente.city,
                    state: cliente.state,
                    birthDate: cliente.birthDate,
                    nationality: cliente.nationality,
                    observations: cliente.observations,
                    status: cliente.status,
                    processes: cliente.processes,
                    createdAt: cliente.createdAt,
                  })
                );

                actionsRef.current.setClientesDisponiveis(clientesAdaptados);
                return;
              }
            } catch (error) {
              console.log(
                "❌ Erro ao carregar clientes da API, usando localStorage:",
                error
              );
            }
          }
        }

        // Se não há token ou falhou na API, usar localStorage
        loadFromLocalStorage();
      } catch (error) {
        console.log(
          "❌ Erro geral ao carregar clientes, usando localStorage:",
          error
        );
        loadFromLocalStorage();
      }
    };

    const loadFromLocalStorage = () => {
      if (typeof window !== "undefined") {
        // Primeiro tentar buscar da chave "clients" (usada pela página de clientes)
        let clientesStorage = localStorage.getItem("clients");

        if (clientesStorage) {
          try {
            const clientesRaw = JSON.parse(clientesStorage);
            if (Array.isArray(clientesRaw) && clientesRaw.length > 0) {
              const clientesAdaptados: Cliente[] = clientesRaw.map(
                (cliente: any) => ({
                  id: cliente.id,
                  name: cliente.name,
                  nome: cliente.name, // compatibilidade
                  email: cliente.email,
                  cpf: cliente.cpf,
                  rg: cliente.rg,
                  address: cliente.address,
                  endereco: cliente.address, // compatibilidade
                  profissao: cliente.profession,
                  estadoCivil: cliente.maritalStatus,
                  maritalStatus: cliente.maritalStatus, // compatibilidade
                  manual: false, // clientes do localStorage não são manuais
                  // Campos adicionais da página Clients
                  phone: cliente.phone,
                  cep: cliente.cep,
                  street: cliente.street,
                  number: cliente.number,
                  complement: cliente.complement,
                  neighborhood: cliente.neighborhood,
                  city: cliente.city,
                  state: cliente.state,
                  birthDate: cliente.birthDate,
                  nationality: cliente.nationality,
                  observations: cliente.observations,
                  status: cliente.status,
                  processes: cliente.processes,
                  createdAt: cliente.createdAt,
                })
              );
              actionsRef.current.setClientesDisponiveis(clientesAdaptados);
              return;
            }
          } catch (error) {
            console.error(
              "❌ Erro ao carregar clientes do localStorage (clients):",
              error
            );
          }
        }

        // Se não encontrou em "clients", tentar "clientes" (compatibilidade)
        clientesStorage = localStorage.getItem("clientes");
        if (clientesStorage) {
          try {
            const clientesRaw = JSON.parse(clientesStorage);
            if (Array.isArray(clientesRaw) && clientesRaw.length > 0) {
              const clientesAdaptados: Cliente[] = clientesRaw.map(
                (cliente: any) => ({
                  id: cliente.id,
                  name: cliente.name,
                  nome: cliente.name, // compatibilidade
                  email: cliente.email,
                  cpf: cliente.cpf,
                  rg: cliente.rg,
                  address: cliente.address,
                  endereco: cliente.address, // compatibilidade
                  profissao: cliente.profession,
                  estadoCivil: cliente.maritalStatus,
                  maritalStatus: cliente.maritalStatus, // compatibilidade
                  manual: false, // clientes do localStorage não são manuais
                  // Campos adicionais da página Clients
                  phone: cliente.phone,
                  cep: cliente.cep,
                  street: cliente.street,
                  number: cliente.number,
                  complement: cliente.complement,
                  neighborhood: cliente.neighborhood,
                  city: cliente.city,
                  state: cliente.state,
                  birthDate: cliente.birthDate,
                  nationality: cliente.nationality,
                  observations: cliente.observations,
                  status: cliente.status,
                  processes: cliente.processes,
                  createdAt: cliente.createdAt,
                })
              );
              actionsRef.current.setClientesDisponiveis(clientesAdaptados);
              return;
            }
          } catch (error) {
            console.error(
              "❌ Erro ao carregar clientes do localStorage (clientes):",
              error
            );
          }
        }

        // Se não encontrou nenhum cliente
        actionsRef.current.setClientesDisponiveis([]);
      }
    };

    loadClients();
  }, []);

  const handleAdicionarCliente = async () => {
    if (!novoCliente.name.trim()) {
      alert("Nome do cliente é obrigatório");
      return;
    }

    const clienteCompleto: Cliente = {
      ...novoCliente,
      id: Date.now(),
      manual: true,
      address: `${novoCliente.street}, ${novoCliente.number} - ${novoCliente.neighborhood}, ${novoCliente.city} - ${novoCliente.state}`,
      endereco: `${novoCliente.street}, ${novoCliente.number} - ${novoCliente.neighborhood}, ${novoCliente.city} - ${novoCliente.state}`,
    };

    try {
      // Tentar salvar na API primeiro
      await clientsService.createClient(clienteCompleto);
      console.log("✅ Cliente salvo na API com sucesso");
    } catch (error) {
      console.log(
        "❌ Erro ao salvar cliente na API, salvando no localStorage:",
        error
      );
      // Se falhar na API, salvar no localStorage na chave "clients"
      if (typeof window !== "undefined") {
        const clientesStorage = localStorage.getItem("clients");
        const clientes = clientesStorage ? JSON.parse(clientesStorage) : [];
        clientes.push(clienteCompleto);
        localStorage.setItem("clients", JSON.stringify(clientes));
        console.log("✅ Cliente salvo no localStorage (chave: clients)");
      }
    }

    // Adicionar cliente ao editor independentemente de onde foi salvo
    actions.adicionarClienteManual(clienteCompleto);

    // Atualizar lista de clientes disponíveis
    actions.setClientesDisponiveis([
      ...state.clientesDisponiveis,
      clienteCompleto,
    ]);

    setNovoCliente({
      name: "",
      email: "",
      phone: "",
      cpf: "",
      rg: "",
      cep: "",
      street: "",
      number: "",
      complement: "",
      neighborhood: "",
      city: "",
      state: "",
      address: "",
      birthDate: "",
      maritalStatus: "",
      nationality: "Brasileira",
      profession: "",
      observations: "",
    });
    setShowAddClient(false);
  };

  const handleToggleCliente = (cliente: Cliente) => {
    actions.toggleCliente(cliente);
  };

  const handleExcluirCliente = (cliente: Cliente) => {
    if (confirm(`Deseja excluir o cliente "${cliente.name}"?`)) {
      actions.excluirCliente(cliente);
    }
  };

  const handleRemoverClienteDaPeca = (cliente: Cliente) => {
    actions.removerClienteDaPeca(cliente);
  };

  const handleSetPoloCliente = (id: number, polo: "autor" | "reu") => {
    actions.setPoloCliente(id, polo);
  };

  const handleAdicionarParteAdversa = () => {
    actions.adicionarParteAdversa();
  };

  const handleRemoverParteAdversa = (index: number) => {
    if (confirm("Deseja remover esta parte adversa?")) {
      actions.removerParteAdversa(index);
    }
  };

  const handleAtualizarParteAdversa = (
    index: number,
    campo: string,
    valor: string
  ) => {
    actions.atualizarParteAdversa(index, { [campo]: valor });
  };

  const handlePopoverChange = (open: boolean) => {
    setOpenClientesPopover(open);
    if (!open) {
      setBuscaClientes("");
    }
  };

  const clientesFiltrados = state.clientesDisponiveis.filter(
    (cliente) =>
      cliente.name.toLowerCase().includes(buscaClientes.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(buscaClientes.toLowerCase()) ||
      cliente.cpf?.includes(buscaClientes)
  );

  return (
    <div className="space-y-6">
      {/* Seção de Seleção de Cliente */}
      <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-blue-200/30 hover:border-blue-400 transition-all duration-300 group">
        <CardHeader className="flex items-center gap-4 pb-4">
          <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
            <Users className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
              Cliente e Partes
            </CardTitle>
            <p className="text-blue-700 text-sm font-medium">
              Selecione o cliente e adicione partes adversas
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Seleção de Cliente */}
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Selecionar Cliente
            </h3>

            <div className="flex items-center space-x-4">
              <Popover
                open={openClientesPopover}
                onOpenChange={handlePopoverChange}>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    className="flex-1 justify-start text-left font-normal bg-white/80 hover:bg-white">
                    <Users className="mr-2 h-4 w-4" />
                    {state.clientes.length > 0
                      ? `${state.clientes.length} cliente(s) selecionado(s)`
                      : "Selecionar clientes"}
                    <ChevronDown className="ml-auto h-4 w-4 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-[400px] p-0" align="start">
                  <div className="p-4 border-b">
                    <div className="relative">
                      <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
                      <Input
                        placeholder="Buscar clientes..."
                        value={buscaClientes}
                        onChange={(e) => setBuscaClientes(e.target.value)}
                        className="pl-10"
                      />
                    </div>
                  </div>
                  <div className="max-h-[300px] overflow-y-auto p-2">
                    {clientesFiltrados.length > 0 ? (
                      clientesFiltrados.map((cliente) => {
                        const isSelected = state.clientes.some(
                          (c) => c.id === cliente.id
                        );
                        const polo = state.poloClientes[cliente.id] || "autor";

                        return (
                          <div
                            key={cliente.id}
                            className="flex items-center justify-between p-3 rounded-lg hover:bg-gray-50 cursor-pointer"
                            onClick={() => handleToggleCliente(cliente)}>
                            <div className="flex items-center space-x-3">
                              <div className="w-8 h-8 bg-gradient-to-br from-blue-400 to-green-400 rounded-full flex items-center justify-center text-white font-semibold text-sm">
                                {cliente.name.charAt(0).toUpperCase()}
                              </div>
                              <div>
                                <p className="font-medium text-gray-900">
                                  {cliente.name}
                                </p>
                                <p className="text-sm text-gray-500">
                                  {cliente.email}
                                </p>
                              </div>
                            </div>
                            <div className="flex items-center space-x-2">
                              {isSelected && (
                                <Badge
                                  variant={
                                    polo === "autor" ? "default" : "secondary"
                                  }
                                  className="text-xs">
                                  {polo === "autor" ? "Autor" : "Réu"}
                                </Badge>
                              )}
                              {isSelected ? (
                                <Check className="w-4 h-4 text-green-600" />
                              ) : (
                                <Plus className="w-4 h-4 text-gray-400" />
                              )}
                            </div>
                          </div>
                        );
                      })
                    ) : (
                      <div className="p-4 text-center text-gray-500">
                        Nenhum cliente encontrado
                      </div>
                    )}
                  </div>
                </PopoverContent>
              </Popover>

              <Button
                onClick={() => setShowAddClient(true)}
                className="bg-gradient-to-r from-green-500 to-blue-500 text-white hover:from-green-600 hover:to-blue-600">
                <Plus className="w-4 h-4 mr-2" />
                Novo Cliente
              </Button>
            </div>

            {/* Clientes Selecionados */}
            {state.clientes.length > 0 && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">
                  Clientes Selecionados:
                </h4>
                <div className="flex flex-wrap gap-2">
                  {state.clientes.map((cliente) => {
                    const polo = state.poloClientes[cliente.id] || "autor";
                    return (
                      <Badge
                        key={cliente.id}
                        variant="secondary"
                        className="bg-green-100 text-green-800 border-green-300 cursor-pointer hover:bg-green-200 transition-colors">
                        <span className="mr-2">{cliente.name}</span>
                        <Select
                          value={polo}
                          onValueChange={(value) =>
                            handleSetPoloCliente(
                              cliente.id,
                              value as "autor" | "reu"
                            )
                          }>
                          <SelectTrigger className="w-20 h-6 text-xs border-none bg-transparent p-0">
                            <SelectValue />
                          </SelectTrigger>
                          <SelectContent>
                            <SelectItem value="autor">Autor</SelectItem>
                            <SelectItem value="reu">Réu</SelectItem>
                          </SelectContent>
                        </Select>
                        <X
                          className="w-3 h-3 ml-1 cursor-pointer"
                          onClick={() => handleRemoverClienteDaPeca(cliente)}
                        />
                      </Badge>
                    );
                  })}
                </div>
              </div>
            )}
          </div>

          {/* Modal de Adicionar Cliente */}
          {showAddClient && (
            <Card className="bg-blue-50/50 border-blue-200/50 rounded-xl">
              <CardContent className="p-4 space-y-4">
                <div className="text-sm font-medium text-gray-700 mb-3">
                  Dados do Cliente - Qualificação Completa
                </div>

                {/* Dados Básicos */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">
                    Informações Básicas
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Nome completo *"
                      value={novoCliente.name}
                      onChange={(e) =>
                        setNovoCliente({ ...novoCliente, name: e.target.value })
                      }
                      className="bg-white/80"
                    />
                    <Input
                      placeholder="E-mail"
                      type="email"
                      value={novoCliente.email}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          email: e.target.value,
                        })
                      }
                      className="bg-white/80"
                    />
                    <Input
                      placeholder="Telefone"
                      value={novoCliente.phone}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          phone: e.target.value,
                        })
                      }
                      className="bg-white/80"
                    />
                    <Input
                      placeholder="CPF"
                      value={novoCliente.cpf}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          cpf: maskCPF(e.target.value),
                        })
                      }
                      className="bg-white/80"
                    />
                  </div>
                </div>

                {/* Documentos */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">
                    Documentos
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="RG"
                      value={novoCliente.rg}
                      onChange={(e) =>
                        setNovoCliente({ ...novoCliente, rg: e.target.value })
                      }
                      className="bg-white/80"
                    />
                    <Input
                      placeholder="Data de Nascimento"
                      type="date"
                      value={novoCliente.birthDate}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          birthDate: e.target.value,
                        })
                      }
                      className="bg-white/80"
                    />
                    <Input
                      placeholder="Nacionalidade"
                      value={novoCliente.nationality}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          nationality: e.target.value,
                        })
                      }
                      className="bg-white/80"
                    />
                    <Input
                      placeholder="Estado Civil"
                      value={novoCliente.maritalStatus}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          maritalStatus: e.target.value,
                        })
                      }
                      className="bg-white/80"
                    />
                  </div>
                </div>

                {/* Informações Pessoais */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">
                    Informações Pessoais
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                    <Input
                      placeholder="Profissão"
                      value={novoCliente.profession}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          profession: e.target.value,
                        })
                      }
                      className="bg-white/80"
                    />
                  </div>
                </div>

                {/* Endereço */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">
                    Endereço
                  </h4>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="CEP"
                      value={novoCliente.cep}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNovoCliente({ ...novoCliente, cep: maskCEP(value) });
                        buscarCEP(value);
                      }}
                      className="bg-white/80"
                    />
                    <Input
                      placeholder="Logradouro"
                      value={novoCliente.street}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          street: e.target.value,
                        })
                      }
                      className="bg-white/80"
                    />
                    <Input
                      placeholder="Número"
                      value={novoCliente.number}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          number: e.target.value,
                        })
                      }
                      className="bg-white/80"
                    />
                  </div>
                  <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                    <Input
                      placeholder="Complemento"
                      value={novoCliente.complement}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          complement: e.target.value,
                        })
                      }
                      className="bg-white/80"
                    />
                    <Input
                      placeholder="Bairro"
                      value={novoCliente.neighborhood}
                      onChange={(e) =>
                        setNovoCliente({
                          ...novoCliente,
                          neighborhood: e.target.value,
                        })
                      }
                      className="bg-white/80"
                    />
                    <div className="grid grid-cols-2 gap-2">
                      <Input
                        placeholder="Cidade"
                        value={novoCliente.city}
                        onChange={(e) =>
                          setNovoCliente({
                            ...novoCliente,
                            city: e.target.value,
                          })
                        }
                        className="bg-white/80"
                      />
                      <Input
                        placeholder="UF"
                        value={novoCliente.state}
                        onChange={(e) =>
                          setNovoCliente({
                            ...novoCliente,
                            state: e.target.value,
                          })
                        }
                        className="bg-white/80"
                        maxLength={2}
                      />
                    </div>
                  </div>
                </div>

                {/* Observações */}
                <div className="space-y-3">
                  <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">
                    Observações
                  </h4>
                  <textarea
                    placeholder="Informações adicionais sobre o cliente..."
                    value={novoCliente.observations}
                    onChange={(e) =>
                      setNovoCliente({
                        ...novoCliente,
                        observations: e.target.value,
                      })
                    }
                    className="w-full p-3 border border-gray-300 rounded-lg bg-white/80 resize-none"
                    rows={3}
                  />
                </div>

                <div className="flex gap-2 pt-2">
                  <Button
                    onClick={handleAdicionarCliente}
                    disabled={!novoCliente.name.trim()}
                    className="bg-blue-600 hover:bg-blue-700 text-white">
                    <Plus className="w-4 h-4 mr-2" />
                    Adicionar Cliente
                  </Button>
                  <Button
                    variant="outline"
                    onClick={() => setShowAddClient(false)}>
                    Cancelar
                  </Button>
                </div>
              </CardContent>
            </Card>
          )}

          {/* Seção de Partes Adversas */}
          <div className="space-y-4">
            <div className="flex items-center justify-between">
              <h3 className="text-lg font-semibold text-gray-800">
                Partes Adversas
              </h3>
              <Button
                onClick={handleAdicionarParteAdversa}
                variant="outline"
                className="bg-gradient-to-r from-red-500 to-orange-500 text-white hover:from-red-600 hover:to-orange-600 border-transparent">
                <Plus className="w-4 h-4 mr-2" />
                Adicionar Parte
              </Button>
            </div>

            <Accordion
              type="multiple"
              value={openPartesAccordion}
              onValueChange={setOpenPartesAccordion}
              className="space-y-2">
              {state.partesRe.map((parte, index) => (
                <AccordionItem
                  key={index}
                  value={`parte-${index}`}
                  className="border border-gray-200 rounded-lg">
                  <AccordionTrigger className="px-4 py-3 hover:no-underline">
                    <div className="flex items-center justify-between w-full">
                      <span className="font-medium">
                        Parte Adversa {index + 1}
                      </span>
                      <span className="text-sm text-gray-500">
                        {parte.nome || "Sem nome"}
                      </span>
                    </div>
                  </AccordionTrigger>
                  <AccordionContent className="px-4 pb-4">
                    <div className="space-y-4">
                      {/* Informações Básicas */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">
                          Informações Básicas
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Nome completo *"
                            value={parte.nome}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "nome",
                                e.target.value
                              )
                            }
                          />
                          <Select
                            value={parte.tipo}
                            onValueChange={(value) =>
                              handleAtualizarParteAdversa(index, "tipo", value)
                            }>
                            <SelectTrigger>
                              <SelectValue />
                            </SelectTrigger>
                            <SelectContent>
                              <SelectItem value="Pessoa Física">
                                Pessoa Física
                              </SelectItem>
                              <SelectItem value="Pessoa Jurídica">
                                Pessoa Jurídica
                              </SelectItem>
                            </SelectContent>
                          </Select>
                          <Input
                            placeholder="CPF"
                            value={parte.cpfCnpj}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "cpfCnpj",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="RG"
                            value={parte.rg}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "rg",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="E-mail"
                            value={parte.email}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "email",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Telefone"
                            value={parte.phone}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "phone",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Documentos */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">
                          Documentos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                          <Input
                            placeholder="dd/mm/aaaa"
                            value={parte.birthDate}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "birthDate",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Estado Civil"
                            value={parte.maritalStatus}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "maritalStatus",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Brasileira"
                            value={parte.nationality}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "nationality",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Profissão"
                            value={parte.profissao}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "profissao",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      {/* Endereço */}
                      <div className="space-y-3">
                        <h4 className="font-medium text-gray-700">Endereço</h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="CEP"
                            value={parte.cep}
                            onChange={(e) => {
                              handleAtualizarParteAdversa(
                                index,
                                "cep",
                                e.target.value
                              );
                              buscarCEP(e.target.value, true, index);
                            }}
                          />
                          <Input
                            placeholder="Logradouro"
                            value={parte.street}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "street",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Número"
                            value={parte.number}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "number",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Complemento"
                            value={parte.complement}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "complement",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Bairro"
                            value={parte.neighborhood}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "neighborhood",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Cidade"
                            value={parte.city}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "city",
                                e.target.value
                              )
                            }
                          />
                          <Input
                            placeholder="Estado"
                            value={parte.state}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "state",
                                e.target.value
                              )
                            }
                          />
                        </div>
                      </div>

                      <Button
                        onClick={() => handleRemoverParteAdversa(index)}
                        variant="outline"
                        className="text-red-600 hover:text-red-700 hover:bg-red-50">
                        <X className="w-4 h-4 mr-2" />
                        Remover Parte
                      </Button>
                    </div>
                  </AccordionContent>
                </AccordionItem>
              ))}
            </Accordion>
          </div>
        </CardContent>
      </Card>

      {/* Botões de Navegação */}
      <div className="flex justify-end space-x-4">
        <Button
          onClick={onNext}
          disabled={state.clientes.length === 0}
          className="bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed">
          Próximo
        </Button>
      </div>
    </div>
  );
};
