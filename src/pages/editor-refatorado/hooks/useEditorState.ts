import { useState, useCallback } from "react";
import { EditorState, Cliente, ParteAdversa, PecaJuridica } from "../types";
import { INITIAL_EDITOR_STATE } from "../constants";

export const useEditorState = () => {
  const [state, setState] = useState<EditorState>(INITIAL_EDITOR_STATE);

  // Navegação
  const setEtapa = useCallback((etapa: number) => {
    setState((prev) => ({ ...prev, etapa }));
  }, []);

  const nextEtapa = useCallback(() => {
    setState((prev) => ({ ...prev, etapa: prev.etapa + 1 }));
  }, []);

  const prevEtapa = useCallback(() => {
    setState((prev) => ({ ...prev, etapa: Math.max(0, prev.etapa - 1) }));
  }, []);

  const setVoltarParaRevisao = useCallback((voltar: boolean) => {
    setState((prev) => ({ ...prev, voltarParaRevisao: voltar }));
  }, []);

  // Clientes
  const setClientes = useCallback((clientes: Cliente[]) => {
    setState((prev) => ({ ...prev, clientes }));
  }, []);

  const setClientesDisponiveis = useCallback(
    (clientesDisponiveis: Cliente[]) => {
      setState((prev) => ({ ...prev, clientesDisponiveis }));
    },
    []
  );

  const setPoloClientes = useCallback(
    (poloClientes: { [id: number]: "autor" | "reu" }) => {
      setState((prev) => ({ ...prev, poloClientes }));
    },
    []
  );

  const setSugestoesClientes = useCallback((sugestoesClientes: Cliente[]) => {
    setState((prev) => ({ ...prev, sugestoesClientes }));
  }, []);

  // Partes Adversas
  const setPartesRe = useCallback((partesRe: ParteAdversa[]) => {
    setState((prev) => ({ ...prev, partesRe }));
  }, []);

  // Área e Peça
  const setAreaSelecionada = useCallback((areaSelecionada: string | null) => {
    setState((prev) => ({ ...prev, areaSelecionada }));
  }, []);

  const setPecaSelecionada = useCallback(
    (pecaSelecionada: PecaJuridica | null) => {
      setState((prev) => ({ ...prev, pecaSelecionada }));
    },
    []
  );

  // Conteúdo
  const setFatos = useCallback((fatos: string) => {
    setState((prev) => ({ ...prev, fatos }));
  }, []);

  const setPedidosEspecificos = useCallback((pedidosEspecificos: string) => {
    setState((prev) => ({ ...prev, pedidosEspecificos }));
  }, []);

  const setTopicos = useCallback((topicos: string[]) => {
    setState((prev) => ({ ...prev, topicos }));
  }, []);

  const setTeses = useCallback((teses: string[]) => {
    setState((prev) => ({ ...prev, teses }));
  }, []);

  const setJuris = useCallback((juris: string[]) => {
    setState((prev) => ({ ...prev, juris }));
  }, []);

  // Processo
  const setNumeroProcesso = useCallback((numeroProcesso: string) => {
    setState((prev) => ({ ...prev, numeroProcesso }));
  }, []);

  const setVaraJuizo = useCallback((varaJuizo: string) => {
    setState((prev) => ({ ...prev, varaJuizo }));
  }, []);

  const setComarca = useCallback((comarca: string) => {
    setState((prev) => ({ ...prev, comarca }));
  }, []);

  const setValorCausa = useCallback((valorCausa: string) => {
    setState((prev) => ({ ...prev, valorCausa }));
  }, []);

  // Geração
  const setTextoFinal = useCallback((textoFinal: string) => {
    setState((prev) => ({ ...prev, textoFinal }));
  }, []);

  const setGerando = useCallback((gerando: boolean) => {
    setState((prev) => ({ ...prev, gerando }));
  }, []);

  const setProgresso = useCallback((progresso: number) => {
    setState((prev) => ({ ...prev, progresso }));
  }, []);

  const setLogs = useCallback(
    (logs: string[] | ((prev: string[]) => string[])) => {
      setState((prev) => ({
        ...prev,
        logs: typeof logs === "function" ? logs(prev.logs) : logs,
      }));
    },
    []
  );

  const setAnalisandoTeses = useCallback((analisandoTeses: boolean) => {
    setState((prev) => ({ ...prev, analisandoTeses }));
  }, []);

  const setSugestoesTesesIA = useCallback((sugestoesTesesIA: string[]) => {
    setState((prev) => ({ ...prev, sugestoesTesesIA }));
  }, []);

  const setSugestoesJurisIA = useCallback((sugestoesJurisIA: string[]) => {
    setState((prev) => ({ ...prev, sugestoesJurisIA }));
  }, []);

  // Configurações
  const setModeloIA = useCallback((modeloIA: "gemini" | "deepseek") => {
    setState((prev) => ({ ...prev, modeloIA }));
  }, []);

  const setLogoUrl = useCallback((logoUrl: string) => {
    setState((prev) => ({ ...prev, logoUrl }));
  }, []);

  const setTituloDocumento = useCallback((tituloDocumento: string) => {
    setState((prev) => ({ ...prev, tituloDocumento }));
  }, []);

  const setHtmlPreview = useCallback((htmlPreview: string) => {
    setState((prev) => ({ ...prev, htmlPreview }));
  }, []);

  // UI State
  const setShowAddClient = useCallback((showAddClient: boolean) => {
    setState((prev) => ({ ...prev, showAddClient }));
  }, []);

  const setNovoCliente = useCallback(
    (novoCliente: {
      name: string;
      email: string;
      cpf: string;
      address: string;
    }) => {
      setState((prev) => ({ ...prev, novoCliente }));
    },
    []
  );

  const setShowAddParteRe = useCallback((showAddParteRe: boolean) => {
    setState((prev) => ({ ...prev, showAddParteRe }));
  }, []);

  const setNovaParteRe = useCallback((novaParteRe: ParteAdversa) => {
    setState((prev) => ({ ...prev, novaParteRe }));
  }, []);

  const setBuscaTopico = useCallback((buscaTopico: string) => {
    setState((prev) => ({ ...prev, buscaTopico }));
  }, []);

  const setOpenClientesPopover = useCallback((openClientesPopover: boolean) => {
    setState((prev) => ({ ...prev, openClientesPopover }));
  }, []);

  const setOpenPartesAccordion = useCallback(
    (openPartesAccordion: string[]) => {
      setState((prev) => ({ ...prev, openPartesAccordion }));
    },
    []
  );

  const setNovaTese = useCallback((novaTese: string) => {
    setState((prev) => ({ ...prev, novaTese }));
  }, []);

  const setNovaJurisprudencia = useCallback((novaJurisprudencia: string) => {
    setState((prev) => ({ ...prev, novaJurisprudencia }));
  }, []);

  // Reset do estado
  const resetState = useCallback(() => {
    setState(INITIAL_EDITOR_STATE);
  }, []);

  // Update parcial do estado
  const updateState = useCallback((updates: Partial<EditorState>) => {
    setState((prev) => ({ ...prev, ...updates }));
  }, []);

  return {
    state,

    // Navegação
    setEtapa,
    nextEtapa,
    prevEtapa,
    setVoltarParaRevisao,

    // Clientes
    setClientes,
    setClientesDisponiveis,
    setPoloClientes,
    setSugestoesClientes,

    // Partes Adversas
    setPartesRe,

    // Área e Peça
    setAreaSelecionada,
    setPecaSelecionada,

    // Conteúdo
    setFatos,
    setPedidosEspecificos,
    setTopicos,
    setTeses,
    setJuris,

    // Processo
    setNumeroProcesso,
    setVaraJuizo,
    setComarca,
    setValorCausa,

    // Geração
    setTextoFinal,
    setGerando,
    setProgresso,
    setLogs,
    setAnalisandoTeses,
    setSugestoesTesesIA,
    setSugestoesJurisIA,

    // Configurações
    setModeloIA,
    setLogoUrl,
    setTituloDocumento,
    setHtmlPreview,

    // UI State
    setShowAddClient,
    setNovoCliente,
    setShowAddParteRe,
    setNovaParteRe,
    setBuscaTopico,
    setOpenClientesPopover,
    setOpenPartesAccordion,
    setNovaTese,
    setNovaJurisprudencia,

    // Utilidades
    resetState,
    updateState,
  };
};
