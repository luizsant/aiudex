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
import InputMask from "react-input-mask";

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
        } else {
          // Fallback para localStorage se não há clientes no banco
          const clientesStorage = localStorage.getItem("clientes");
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
              } else {
                actionsRef.current.setClientesDisponiveis([]);
              }
            } catch (error) {
              console.error(
                "❌ Erro ao carregar clientes do localStorage:",
                error
              );
              actionsRef.current.setClientesDisponiveis([]);
            }
          } else {
            actionsRef.current.setClientesDisponiveis([]);
          }
        }
      } catch (error) {
        console.error("❌ Erro ao carregar clientes do banco:", error);

        // Fallback para localStorage em caso de erro na API
        const clientesStorage = localStorage.getItem("clientes");
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
            } else {
              actionsRef.current.setClientesDisponiveis([]);
            }
          } catch (error) {
            console.error(
              "❌ Erro ao carregar clientes do localStorage:",
              error
            );
            actionsRef.current.setClientesDisponiveis([]);
          }
        } else {
          actionsRef.current.setClientesDisponiveis([]);
        }
      }
    };

    loadClients();
  }, []); // Removida dependência actions para evitar loop

  // Efeito para seleção automática de clientes manuais (igual ao editor antigo)
  useEffect(() => {
    const currentState = stateRef.current;
    const currentActions = actionsRef.current;

    const clientesManuais = currentState.clientesDisponiveis.filter(
      (c) => c.manual && (c.name || c.nome || "").trim()
    );

    clientesManuais.forEach((cliente) => {
      if (!currentState.clientes.some((c) => c.id === cliente.id)) {
        // Adicionar cliente manual automaticamente se não estiver selecionado
        const clienteComNomeCorreto = {
          ...cliente,
          name: cliente.name || cliente.nome || "",
          nome: cliente.nome || cliente.name || "",
        };

        // Adicionar diretamente ao array de clientes selecionados
        const novosClientes = [...currentState.clientes, clienteComNomeCorreto];
        currentActions.setClientes(novosClientes);

        // Definir polo como autor se for o primeiro, ou manter o mesmo dos outros
        if (currentState.clientes.length === 0) {
          currentActions.setPoloCliente(cliente.id, "autor");
        } else {
          const poloAtual =
            currentState.poloClientes[currentState.clientes[0]?.id] || "autor";
          currentActions.setPoloCliente(cliente.id, poloAtual);
        }
      }
    });
  }, [state.clientesDisponiveis]); // Mantida apenas a dependência necessária

  const handleAdicionarCliente = () => {
    if (!novoCliente.name.trim()) return;

    const cliente: Cliente = {
      ...novoCliente,
      id: Date.now(),
      manual: true,
    };

    const novosClientes = [...state.clientesDisponiveis, cliente];
    actions.setClientesDisponiveis(novosClientes);

    // Salvar no localStorage "clientes" para compatibilidade com a página Clients
    const clientesParaSalvar = novosClientes.map((cliente) => ({
      id: cliente.id,
      name: cliente.name,
      email: cliente.email,
      phone: cliente.phone || "",
      cpf: cliente.cpf,
      address: cliente.address,
      profession: cliente.profissao,
      maritalStatus: cliente.estadoCivil,
      status: "Ativo",
      createdAt: cliente.createdAt || new Date(),
      processes: cliente.processes || 0,
      // Campos detalhados
      cep: cliente.cep || "",
      street: cliente.street || "",
      number: cliente.number || "",
      complement: cliente.complement || "",
      neighborhood: cliente.neighborhood || "",
      city: cliente.city || "",
      state: cliente.state || "",
      rg: cliente.rg || "",
      birthDate: cliente.birthDate || "",
      nationality: cliente.nationality || "Brasileira",
      observations: cliente.observations || "",
    }));
    localStorage.setItem("clientes", JSON.stringify(clientesParaSalvar));

    // Selecionar automaticamente o cliente recém-adicionado
    const clienteComNomeCorreto = {
      ...cliente,
      name: cliente.name || cliente.nome || "",
      nome: cliente.nome || cliente.name || "",
    };

    // Adicionar diretamente ao array de clientes selecionados
    const novosClientesSelecionados = [
      ...state.clientes,
      clienteComNomeCorreto,
    ];
    actions.setClientes(novosClientesSelecionados);

    // Definir polo como autor se for o primeiro cliente
    if (state.clientes.length === 0) {
      actions.setPoloCliente(cliente.id, "autor");
    }

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

    // Configurar polo automaticamente
    if (!state.clientes.some((c) => c.id === cliente.id)) {
      // Adicionando cliente
      const novosClientes = [...state.clientes, cliente];
      if (novosClientes.length === 1) {
        actions.setPoloCliente(cliente.id, "autor");
      }
    }

    // Fechar o popover automaticamente após selecionar
    setOpenClientesPopover(false);
  };

  const handleExcluirCliente = (cliente: Cliente) => {
    actions.excluirCliente(cliente);

    // Atualizar localStorage "clientes"
    const novosClientes = state.clientesDisponiveis.filter(
      (c) => c.id !== cliente.id
    );

    // Converter para o formato da página Clients
    const clientesParaSalvar = novosClientes.map((cliente) => ({
      id: cliente.id,
      name: cliente.name,
      email: cliente.email,
      phone: cliente.phone || "",
      cpf: cliente.cpf,
      address: cliente.address,
      profession: cliente.profissao,
      maritalStatus: cliente.estadoCivil,
      status: cliente.status || "Ativo",
      createdAt: cliente.createdAt || new Date(),
      processes: cliente.processes || 0,
      // Campos detalhados
      cep: cliente.cep || "",
      street: cliente.street || "",
      number: cliente.number || "",
      complement: cliente.complement || "",
      neighborhood: cliente.neighborhood || "",
      city: cliente.city || "",
      state: cliente.state || "",
      rg: cliente.rg || "",
      birthDate: cliente.birthDate || "",
      nationality: cliente.nationality || "Brasileira",
      observations: cliente.observations || "",
    }));
    localStorage.setItem("clientes", JSON.stringify(clientesParaSalvar));
  };

  const handleRemoverClienteDaPeca = (cliente: Cliente) => {
    actions.removerClienteDaPeca(cliente);
  };

  const handleSetPoloCliente = (id: number, polo: "autor" | "reu") => {
    actions.setPoloCliente(id, polo);
  };

  const handleAdicionarParteAdversa = () => {
    actions.adicionarParteAdversa();
    const novoIndex = state.partesRe.length;
    setOpenPartesAccordion([...openPartesAccordion, `parte-${novoIndex}`]);
  };

  const handleRemoverParteAdversa = (index: number) => {
    actions.removerParteAdversa(index);
    setOpenPartesAccordion(
      openPartesAccordion.filter((acc) => acc !== `parte-${index}`)
    );
  };

  const handleAtualizarParteAdversa = (
    index: number,
    campo: string,
    valor: string
  ) => {
    actions.atualizarParteAdversa(index, { [campo]: valor });
  };

  // Filtrar clientes baseado na busca
  const clientesFiltrados = state.clientesDisponiveis.filter(
    (cliente) =>
      cliente.name.toLowerCase().includes(buscaClientes.toLowerCase()) ||
      cliente.email?.toLowerCase().includes(buscaClientes.toLowerCase()) ||
      cliente.cpf?.includes(buscaClientes)
  );

  // Limpar busca quando popover for fechado
  const handlePopoverChange = (open: boolean) => {
    setOpenClientesPopover(open);
    if (!open) {
      setBuscaClientes("");
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-blue-200/30 hover:border-blue-400 transition-all duration-300 group mb-8">
      <CardHeader className="flex items-center gap-4 pb-4">
        <div className="w-14 h-14 bg-gradient-to-r from-blue-600 to-purple-600 rounded-2xl flex items-center justify-center shadow-lg">
          <Users className="w-7 h-7 text-white" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
            Cliente e Partes
          </CardTitle>
          <p className="text-blue-700 text-sm font-medium">
            Selecione o cliente e adicione partes adversas
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Seleção de Clientes */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Selecionar Cliente
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={() => setShowAddClient(!showAddClient)}
              className="text-blue-600 border-blue-300 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" />
              Novo Cliente
            </Button>
          </div>

          {/* Formulário de Novo Cliente */}
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
                    <InputMask
                      mask="999.999.999-99"
                      value={novoCliente.cpf}
                      onChange={(e) =>
                        setNovoCliente({ ...novoCliente, cpf: e.target.value })
                      }>
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          placeholder="CPF"
                          className="bg-white/80"
                        />
                      )}
                    </InputMask>
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
                    <InputMask
                      mask="99999-999"
                      value={novoCliente.cep}
                      onChange={(e) => {
                        const value = e.target.value;
                        setNovoCliente({ ...novoCliente, cep: value });
                        buscarCEP(value);
                      }}>
                      {(inputProps: any) => (
                        <Input
                          {...inputProps}
                          placeholder="CEP"
                          className="bg-white/80"
                        />
                      )}
                    </InputMask>
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

          {/* Popover de Seleção de Clientes */}
          <Popover
            open={openClientesPopover}
            onOpenChange={handlePopoverChange}>
            <PopoverTrigger asChild>
              <Button
                variant="outline"
                className="w-full justify-between h-12 bg-blue-50/50 border border-blue-200/50 hover:bg-white hover:border-blue-400 transition-all duration-300 rounded-xl">
                <span className="flex items-center gap-2">
                  <User className="w-4 h-4" />
                  {state.clientes.length > 0
                    ? `${state.clientes.length} cliente(s) selecionado(s)`
                    : "Selecionar clientes"}
                </span>
                <ChevronDown className="w-4 h-4" />
              </Button>
            </PopoverTrigger>
            <PopoverContent className="w-[500px] p-0">
              {/* Campo de busca */}
              <div className="p-3 border-b border-gray-200">
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-gray-400" />
                  <Input
                    placeholder="Buscar por nome, email ou CPF..."
                    value={buscaClientes}
                    onChange={(e) => setBuscaClientes(e.target.value)}
                    className="pl-10 bg-gray-50 border-gray-200 focus:bg-white focus:border-blue-400"
                  />
                </div>
                {buscaClientes && (
                  <p className="text-xs text-gray-500 mt-1">
                    {clientesFiltrados.length} de{" "}
                    {state.clientesDisponiveis.length} cliente(s) encontrado(s)
                  </p>
                )}
              </div>

              <div className="max-h-64 overflow-y-auto">
                {clientesFiltrados.length > 0 ? (
                  clientesFiltrados.map((cliente) => (
                    <div
                      key={cliente.id}
                      className="flex items-center justify-between p-3 hover:bg-blue-50 border-b last:border-b-0 cursor-pointer transition-colors duration-200"
                      onClick={() => handleToggleCliente(cliente)}>
                      <div className="flex items-center gap-3">
                        <div className="w-8 h-8 bg-blue-100 rounded-full flex items-center justify-center">
                          <User className="w-4 h-4 text-blue-600" />
                        </div>
                        <div>
                          <p className="font-medium text-sm text-gray-900">
                            {cliente.name}
                          </p>
                          {cliente.email && (
                            <p className="text-xs text-gray-500">
                              {cliente.email}
                            </p>
                          )}
                        </div>
                      </div>
                      <div className="flex items-center gap-2">
                        {state.clientes.some((c) => c.id === cliente.id) ? (
                          <div className="flex items-center gap-1 text-green-600">
                            <Check className="w-4 h-4" />
                            <span className="text-xs font-medium">
                              Selecionado
                            </span>
                          </div>
                        ) : (
                          <div className="text-xs text-gray-400">
                            Clique para selecionar
                          </div>
                        )}
                        {cliente.manual && (
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={(e) => {
                              e.stopPropagation();
                              handleExcluirCliente(cliente);
                            }}
                            className="text-red-500 hover:text-red-700">
                            <X className="w-4 h-4" />
                          </Button>
                        )}
                      </div>
                    </div>
                  ))
                ) : (
                  <div className="p-6 text-center text-gray-500">
                    {buscaClientes
                      ? "Nenhum cliente encontrado"
                      : "Nenhum cliente cadastrado"}
                  </div>
                )}
              </div>
            </PopoverContent>
          </Popover>

          {/* Clientes Selecionados */}
          {state.clientes.length > 0 && (
            <div className="space-y-3">
              <h4 className="font-medium text-gray-700">
                Clientes Selecionados:
              </h4>
              {state.clientes.map((cliente) => (
                <div
                  key={cliente.id}
                  className="flex items-center justify-between p-3 bg-green-50 border border-green-200 rounded-xl">
                  <div className="flex items-center gap-3">
                    <div className="w-8 h-8 bg-green-100 rounded-full flex items-center justify-center">
                      <User className="w-4 h-4 text-green-600" />
                    </div>
                    <div>
                      <p className="font-medium text-sm">{cliente.name}</p>
                      <p className="text-xs text-gray-600">{cliente.email}</p>
                    </div>
                  </div>
                  <div className="flex items-center gap-2">
                    <div className="flex gap-1">
                      <Button
                        variant={
                          state.poloClientes[cliente.id] === "autor"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() =>
                          handleSetPoloCliente(cliente.id, "autor")
                        }
                        className="text-xs">
                        Autor
                      </Button>
                      <Button
                        variant={
                          state.poloClientes[cliente.id] === "reu"
                            ? "default"
                            : "outline"
                        }
                        size="sm"
                        onClick={() => handleSetPoloCliente(cliente.id, "reu")}
                        className="text-xs">
                        Réu
                      </Button>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => handleRemoverClienteDaPeca(cliente)}
                      className="text-red-500 hover:text-red-700">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* Partes Adversas */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Partes Adversas
            </h3>
            <Button
              variant="outline"
              size="sm"
              onClick={handleAdicionarParteAdversa}
              className="text-blue-600 border-blue-300 hover:bg-blue-50">
              <Plus className="w-4 h-4 mr-2" />
              Adicionar Parte
            </Button>
          </div>

          <Accordion
            type="multiple"
            value={openPartesAccordion}
            onValueChange={setOpenPartesAccordion}>
            {state.partesRe.map((parte, index) => (
              <AccordionItem
                key={index}
                value={`parte-${index}`}
                className="border border-blue-200/50 rounded-xl mb-2 shadow-sm">
                <AccordionTrigger className="flex items-center gap-2 px-4 py-3">
                  <span className="font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                    Parte Adversa {index + 1}
                  </span>
                  <span className="text-blue-600 ml-2 font-medium">
                    {parte.nome || "Sem nome"}
                  </span>
                  {parte.nome.trim() && (
                    <Badge variant="secondary" className="ml-auto mr-2">
                      Preenchida
                    </Badge>
                  )}
                </AccordionTrigger>
                <AccordionContent className="px-4 pb-4">
                  <div className="space-y-4">
                    {/* Dados Básicos */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">
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
                          className="bg-white/80"
                        />
                        <div className="flex gap-2">
                          <Select
                            value={parte.tipo}
                            onValueChange={(value) =>
                              handleAtualizarParteAdversa(index, "tipo", value)
                            }>
                            <SelectTrigger className="bg-white/80">
                              <SelectValue placeholder="Tipo" />
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
                        </div>
                        <InputMask
                          mask={
                            parte.tipo === "Pessoa Jurídica"
                              ? "99.999.999/9999-99"
                              : "999.999.999-99"
                          }
                          value={parte.cpfCnpj}
                          onChange={(e) =>
                            handleAtualizarParteAdversa(
                              index,
                              "cpfCnpj",
                              e.target.value
                            )
                          }>
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder={
                                parte.tipo === "Pessoa Jurídica"
                                  ? "CNPJ"
                                  : "CPF"
                              }
                              className="bg-white/80"
                            />
                          )}
                        </InputMask>
                        {parte.tipo === "Pessoa Física" && (
                          <Input
                            placeholder="RG"
                            value={parte.rg || ""}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "rg",
                                e.target.value
                              )
                            }
                            className="bg-white/80"
                          />
                        )}
                        <Input
                          placeholder="E-mail"
                          type="email"
                          value={parte.email}
                          onChange={(e) =>
                            handleAtualizarParteAdversa(
                              index,
                              "email",
                              e.target.value
                            )
                          }
                          className="bg-white/80"
                        />
                        <Input
                          placeholder="Telefone"
                          value={parte.phone || ""}
                          onChange={(e) =>
                            handleAtualizarParteAdversa(
                              index,
                              "phone",
                              e.target.value
                            )
                          }
                          className="bg-white/80"
                        />
                      </div>
                    </div>

                    {/* Documentos (apenas para Pessoa Física) */}
                    {parte.tipo === "Pessoa Física" && (
                      <div className="space-y-3">
                        <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">
                          Documentos
                        </h4>
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-3">
                          <Input
                            placeholder="Data de Nascimento"
                            type="date"
                            value={parte.birthDate || ""}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "birthDate",
                                e.target.value
                              )
                            }
                            className="bg-white/80"
                          />
                          <Input
                            placeholder="Estado Civil"
                            value={parte.maritalStatus || ""}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "maritalStatus",
                                e.target.value
                              )
                            }
                            className="bg-white/80"
                          />
                          <Input
                            placeholder="Nacionalidade"
                            value={parte.nationality || ""}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "nationality",
                                e.target.value
                              )
                            }
                            className="bg-white/80"
                          />
                          <Input
                            placeholder="Profissão"
                            value={parte.profissao || ""}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "profissao",
                                e.target.value
                              )
                            }
                            className="bg-white/80"
                          />
                        </div>
                      </div>
                    )}

                    {/* Endereço */}
                    <div className="space-y-3">
                      <h4 className="text-sm font-semibold text-gray-800 border-b pb-1">
                        Endereço
                      </h4>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <InputMask
                          mask="99999-999"
                          value={parte.cep || ""}
                          onChange={(e) => {
                            const value = e.target.value;
                            handleAtualizarParteAdversa(index, "cep", value);
                            buscarCEP(value, true, index);
                          }}>
                          {(inputProps: any) => (
                            <Input
                              {...inputProps}
                              placeholder="CEP"
                              className="bg-white/80"
                            />
                          )}
                        </InputMask>
                        <Input
                          placeholder="Logradouro"
                          value={parte.street || ""}
                          onChange={(e) =>
                            handleAtualizarParteAdversa(
                              index,
                              "street",
                              e.target.value
                            )
                          }
                          className="bg-white/80"
                        />
                        <Input
                          placeholder="Número"
                          value={parte.number || ""}
                          onChange={(e) =>
                            handleAtualizarParteAdversa(
                              index,
                              "number",
                              e.target.value
                            )
                          }
                          className="bg-white/80"
                        />
                      </div>
                      <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                        <Input
                          placeholder="Complemento"
                          value={parte.complement || ""}
                          onChange={(e) =>
                            handleAtualizarParteAdversa(
                              index,
                              "complement",
                              e.target.value
                            )
                          }
                          className="bg-white/80"
                        />
                        <Input
                          placeholder="Bairro"
                          value={parte.neighborhood || ""}
                          onChange={(e) =>
                            handleAtualizarParteAdversa(
                              index,
                              "neighborhood",
                              e.target.value
                            )
                          }
                          className="bg-white/80"
                        />
                        <div className="grid grid-cols-2 gap-2">
                          <Input
                            placeholder="Cidade"
                            value={parte.city || ""}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "city",
                                e.target.value
                              )
                            }
                            className="bg-white/80"
                          />
                          <Input
                            placeholder="UF"
                            value={parte.state || ""}
                            onChange={(e) =>
                              handleAtualizarParteAdversa(
                                index,
                                "state",
                                e.target.value
                              )
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
                        placeholder="Informações adicionais sobre a parte adversa..."
                        value={parte.observations || ""}
                        onChange={(e) =>
                          handleAtualizarParteAdversa(
                            index,
                            "observations",
                            e.target.value
                          )
                        }
                        className="w-full p-3 border border-gray-300 rounded-lg bg-white/80 resize-none"
                        rows={3}
                      />
                    </div>
                  </div>
                  {state.partesRe.length > 1 && (
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() => handleRemoverParteAdversa(index)}
                      className="mt-3 text-red-600 border-red-300 hover:bg-red-50">
                      <X className="w-4 h-4 mr-2" />
                      Remover Parte
                    </Button>
                  )}
                </AccordionContent>
              </AccordionItem>
            ))}
          </Accordion>
        </div>

        {/* Botão Próximo */}
        <Button
          className="mt-6 w-full h-12 bg-gradient-to-r from-blue-600 to-purple-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all transform"
          disabled={state.clientes.length === 0}
          onClick={onNext}>
          Próximo
        </Button>
      </CardContent>
    </Card>
  );
};
