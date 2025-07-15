"use client";

import { useCallback } from "react";
import { EditorState, Cliente, ParteAdversa, PecaJuridica } from "../types";
import { askGemini, askDeepSeek } from "@/lib/ai-service";
import { getOfficeConfig, documentService } from "@/lib/document-service";
import { useCredits } from "@/hooks/useCredits";
import { toast } from "@/components/ui/use-toast";

interface UseEditorActionsProps {
  state: EditorState;
  setState: (updates: Partial<EditorState>) => void;
  setClientes: (clientes: Cliente[]) => void;
  setPoloClientes: (poloClientes: { [id: number]: "autor" | "reu" }) => void;
  setClientesDisponiveis: (clientesDisponiveis: Cliente[]) => void;
  setPartesRe: (partesRe: ParteAdversa[]) => void;
  setTopicos: (topicos: string[]) => void;
  setTeses: (teses: string[]) => void;
  setJuris: (juris: string[]) => void;
  setLogs: (logs: string[] | ((prev: string[]) => string[])) => void;
  setProgresso: (progresso: number) => void;
  setTextoFinal: (textoFinal: string) => void;
  setGerando: (gerando: boolean) => void;
  setAnalisandoTeses: (analisandoTeses: boolean) => void;
  setSugestoesTesesIA: (sugestoesTesesIA: string[]) => void;
  setSugestoesJurisIA: (sugestoesJurisIA: string[]) => void;
}

export const useEditorActions = ({
  state,
  setState,
  setClientes,
  setPoloClientes,
  setClientesDisponiveis,
  setPartesRe,
  setTopicos,
  setTeses,
  setJuris,
  setLogs,
  setProgresso,
  setTextoFinal,
  setGerando,
  setAnalisandoTeses,
  setSugestoesTesesIA,
  setSugestoesJurisIA,
}: UseEditorActionsProps) => {
  const { consumePetitionCredit, canGeneratePetition } = useCredits();

  // Utilitários
  const getPoloOposto = useCallback(
    (polo: "autor" | "reu"): "autor" | "reu" => {
      return polo === "autor" ? "reu" : "autor";
    },
    []
  );

  const filtrarTopicos = useCallback(
    (topicos: string[], busca: string = state.buscaTopico) => {
      return topicos.filter((t) =>
        t.toLowerCase().includes(busca.toLowerCase())
      );
    },
    [state.buscaTopico]
  );

  // Ações de Clientes
  const toggleCliente = useCallback(
    (cliente: Cliente) => {
      setClientes(
        state.clientes.some((c) => c.id === cliente.id)
          ? state.clientes.filter((c) => c.id !== cliente.id)
          : [
              ...state.clientes,
              {
                ...cliente,
                name: cliente.name || cliente.nome || "",
                nome: cliente.nome || cliente.name || "",
              },
            ]
      );

      // Atualizar polos - SEMPRE "autor" por padrão
      if (!state.clientes.some((c) => c.id === cliente.id)) {
        const novos = [...state.clientes, cliente];
        if (novos.length === 1) {
          // Primeiro cliente sempre como autor
          setPoloClientes({ [cliente.id]: "autor" });
        } else if (novos.length > 1) {
          // Manter polos existentes e adicionar novo como autor
          const novosPolos: { [id: number]: "autor" | "reu" } = {
            ...state.poloClientes,
          };
          novosPolos[cliente.id] = "autor"; // Novo cliente sempre como autor
          setPoloClientes(novosPolos);
        }
      }
    },
    [state.clientes, state.poloClientes, setClientes, setPoloClientes]
  );

  const excluirCliente = useCallback(
    (cliente: Cliente) => {
      setClientesDisponiveis(
        state.clientesDisponiveis.filter((c) => c.id !== cliente.id)
      );
      setClientes(state.clientes.filter((c) => c.id !== cliente.id));
    },
    [
      state.clientesDisponiveis,
      state.clientes,
      setClientesDisponiveis,
      setClientes,
    ]
  );

  const removerClienteDaPeca = useCallback(
    (cliente: Cliente) => {
      setClientes(state.clientes.filter((c) => c.id !== cliente.id));
    },
    [state.clientes, setClientes]
  );

  const setPoloCliente = useCallback(
    (id: number, polo: "autor" | "reu") => {
      // Definir polo individual para o cliente específico
      const novosPolos: { [id: number]: "autor" | "reu" } = {
        ...state.poloClientes,
      };
      novosPolos[id] = polo;
      setPoloClientes(novosPolos);
    },
    [state.poloClientes, setPoloClientes]
  );

  const adicionarClienteManual = useCallback(
    (clienteData: Omit<Cliente, "id">) => {
      const novoCliente: Cliente = {
        ...clienteData,
        id: Date.now(),
        manual: true,
      };
      setClientesDisponiveis([...state.clientesDisponiveis, novoCliente]);
    },
    [state.clientesDisponiveis, setClientesDisponiveis]
  );

  const setClientesDisponiveisAction = useCallback(
    (clientes: Cliente[]) => {
      setClientesDisponiveis(clientes);
    },
    [setClientesDisponiveis]
  );

  // Ações de Partes Adversas
  const adicionarParteAdversa = useCallback(() => {
    setPartesRe([
      ...state.partesRe,
      {
        nome: "",
        tipo: "Pessoa Física",
        cpfCnpj: "",
        rg: "",
        endereco: "",
        cep: "",
        street: "",
        number: "",
        complement: "",
        neighborhood: "",
        city: "",
        state: "",
        email: "",
        phone: "",
        profissao: "",
        birthDate: "",
        maritalStatus: "",
        nationality: "Brasileira",
        observations: "",
      },
    ]);
  }, [state.partesRe, setPartesRe]);

  const removerParteAdversa = useCallback(
    (index: number) => {
      setPartesRe(state.partesRe.filter((_, i) => i !== index));
    },
    [state.partesRe, setPartesRe]
  );

  const atualizarParteAdversa = useCallback(
    (index: number, parteUpdate: Partial<ParteAdversa>) => {
      const novasPartes = [...state.partesRe];
      novasPartes[index] = { ...novasPartes[index], ...parteUpdate };
      setPartesRe(novasPartes);
    },
    [state.partesRe, setPartesRe]
  );

  // Ações de Conteúdo
  const toggleTopico = useCallback(
    (topico: string) => {
      setTopicos(
        state.topicos.includes(topico)
          ? state.topicos.filter((t) => t !== topico)
          : [...state.topicos, topico]
      );
    },
    [state.topicos, setTopicos]
  );

  const toggleTese = useCallback(
    (tese: string) => {
      setTeses(
        state.teses.includes(tese)
          ? state.teses.filter((t) => t !== tese)
          : [...state.teses, tese]
      );
    },
    [state.teses, setTeses]
  );

  const toggleJurisprudencia = useCallback(
    (juris: string) => {
      setJuris(
        state.juris.includes(juris)
          ? state.juris.filter((j) => j !== juris)
          : [...state.juris, juris]
      );
    },
    [state.juris, setJuris]
  );

  // Função para montar prompt da IA
  const montarPromptIA = useCallback(() => {
    const clientesInfo = state.clientes
      .map((c) => `${c.name} (${state.poloClientes[c.id] || "autor"})`)
      .join(", ");

    const partesReInfo = state.partesRe
      .map((p) => `${p.nome} (${p.tipo})`)
      .join(", ");

    const topicosInfo = state.topicos.join(", ");
    const tesesInfo = state.teses.join(", ");
    const jurisInfo = state.juris.join(", ");

    return `Gere uma peça jurídica completa com os seguintes dados:

ÁREA DO DIREITO: ${state.areaSelecionada}
TIPO DE PEÇA: ${state.pecaSelecionada?.nome}

CLIENTES:
${state.clientes
  .map((c) => `${c.name} (${state.poloClientes[c.id] || "autor"})`)
  .join("\n")}

FATOS DO CASO:
${state.fatos}

PEDIDOS ESPECÍFICOS:
${state.pedidosEspecificos}

DADOS DO PROCESSO:
- Comarca: ${state.comarca}
- Valor da Causa: ${state.valorCausa}
- Número do Processo: ${state.numeroProcesso || "Não informado"}
- Vara/Juízo: ${state.varaJuizo || "Não informado"}

TÓPICOS PRELIMINARES:
${state.topicos.join("\n")}

TESES JURÍDICAS:
${state.teses.join("\n")}

JURISPRUDÊNCIAS:
${state.juris.join("\n")}

PARTES ADVERSAS:
${state.partesRe.map((p) => p.nome).join("\n")}

Gere uma peça jurídica completa, bem estruturada e fundamentada, seguindo o formato padrão de peças jurídicas brasileiras.`;
  }, [state]);

  // Função para analisar fatos e gerar teses
  const analisarFatosParaTeses = useCallback(async () => {
    if (!state.fatos.trim()) {
      toast({
        title: "Fatos necessários",
        description: "Descreva os fatos para gerar teses jurídicas.",
        variant: "destructive",
      });
      return;
    }

    setAnalisandoTeses(true);
    setLogs((prev) => [...prev, "🔍 Analisando fatos para gerar teses..."]);
    setProgresso(10);

    try {
      const prompt = `Analise os seguintes fatos jurídicos e sugira 3-5 teses jurídicas relevantes:

FATOS:
${state.fatos}

ÁREA DO DIREITO: ${state.areaSelecionada}
TIPO DE PEÇA: ${state.pecaSelecionada?.nome}

Gere teses jurídicas objetivas e concisas, focando nos pontos mais relevantes para o caso.`;

      const response = await askGemini(prompt);

      if (response) {
        const teses = response
          .split("\n")
          .filter((t) => t.trim())
          .map((t) => t.replace(/^\d+\.\s*/, "").trim());

        setSugestoesTesesIA(teses);
        setLogs((prev) => [...prev, "✅ Teses jurídicas geradas com sucesso!"]);
        setProgresso(100);
      }
    } catch (error) {
      console.error("Erro ao analisar fatos:", error);
      toast({
        title: "Erro na análise",
        description: "Não foi possível analisar os fatos. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setAnalisandoTeses(false);
    }
  }, [
    state.fatos,
    state.areaSelecionada,
    state.pecaSelecionada,
    setAnalisandoTeses,
    setLogs,
    setProgresso,
    setSugestoesTesesIA,
  ]);

  // Função para gerar peça com IA
  const gerarPecaIA = useCallback(async () => {
    if (state.gerando) return;

    // Verificar se o usuário tem créditos configurados
    if (!canGeneratePetition()) {
      // Tentar inicializar créditos automaticamente
      const userCredits = localStorage.getItem("legalai_user_credits");
      if (!userCredits) {
        // Se não há créditos configurados, inicializar com plano gratuito
        const userId = localStorage.getItem("legalai_user_id") || "local_user";
        const creditsService = (await import("@/lib/credits-service"))
          .creditsService;
        creditsService.initializeUserCredits(userId, "free");

        // Verificar novamente se pode gerar
        if (!canGeneratePetition()) {
          toast({
            title: "Créditos insuficientes",
            description:
              "Você não tem créditos suficientes para gerar uma peça.",
            variant: "destructive",
          });
          return;
        }
      } else {
        toast({
          title: "Créditos insuficientes",
          description: "Você não tem créditos suficientes para gerar uma peça.",
          variant: "destructive",
        });
        return;
      }
    }

    setGerando(true);
    setProgresso(0);
    setLogs((prev) => [...prev, "🚀 Iniciando geração da peça..."]);
    setProgresso(10);

    try {
      consumePetitionCredit();
      setLogs((prev) => [...prev, "💳 Crédito consumido com sucesso"]);
      setProgresso(20);

      const prompt = montarPromptIA();
      setLogs((prev) => [...prev, "📝 Montando prompt para IA..."]);
      setProgresso(40);

      const response = await askGemini(prompt);
      setProgresso(80);

      if (response) {
        setTextoFinal(response);
        setLogs((prev) => [...prev, "✅ Peça gerada com sucesso!"]);
        setProgresso(100);

        // Salvar documento automaticamente (simplificado)
        try {
          const docData = {
            title: state.tituloDocumento || "Peça Jurídica",
            content: response,
            type: "petition",
            clientId: state.clientes[0]?.id?.toString() || "",
            clientName: state.clientes[0]?.name || "",
            template: "default",
            metadata: {
              causeValue: state.valorCausa,
              jurisdiction: state.comarca,
              theses: state.teses,
              jurisprudences: state.juris,
              blocks: [],
              aiGenerated: true,
            },
          };

          await documentService.createDocument(docData);
          setLogs((prev) => [...prev, "💾 Documento salvo automaticamente"]);
        } catch (saveError) {
          console.error("Erro ao salvar documento:", saveError);
          setLogs((prev) => [
            ...prev,
            "⚠️ Erro ao salvar documento automaticamente",
          ]);

          toast({
            title: "Erro ao salvar",
            description: "Não foi possível salvar o documento automaticamente.",
            variant: "destructive",
          });
        }
      }
    } catch (error) {
      console.error("Erro ao gerar peça:", error);
      setLogs((prev) => [...prev, "❌ Erro ao gerar peça com IA."]);
      setProgresso(0);
    } finally {
      setGerando(false);
    }
  }, [
    state.gerando,
    state.modeloIA,
    state.areaSelecionada,
    state.pecaSelecionada,
    state.clientes,
    state.fatos,
    state.teses,
    state.juris,
    state.pedidosEspecificos,
    state.numeroProcesso,
    state.varaJuizo,
    state.comarca,
    state.valorCausa,
    state.partesRe,
    state.topicos,
    state.poloClientes,
    setGerando,
    setProgresso,
    setLogs,
    setTextoFinal,
    consumePetitionCredit,
    canGeneratePetition,
    montarPromptIA,
  ]);

  // Função para gerar HTML formatado
  const gerarHtmlFormatado = useCallback((texto: string) => {
    if (!texto) return "";

    // Pós-processamento para remover markdown
    let textoLimpo = texto
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>")
      .replace(/\*(.*?)\*/g, "<em>$1</em>")
      .replace(/__(.*?)__/g, "<u>$1</u>")
      .replace(/^#+\s?(.*)$/gm, "$1")
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1")
      .replace(/`([^`]+)`/g, "$1")
      .replace(/^-\s+/gm, "")
      .replace(/\s+$/gm, "")
      .replace(/\n{3,}/g, "\n\n");

    const lines = textoLimpo.split("\n");
    let html = [];
    let chapterCount = 0;
    let subChapterCount = 0;
    const enderecamentoIndex = lines.findIndex((l) =>
      l.trim().match(/^EXCELENT[ÍI]SSIMO/i)
    );
    const dosFatosIndex = lines.findIndex(
      (l) =>
        l.trim().match(/^DOS?\s+FATOS/i) ||
        l.trim().match(/^FATOS$/i) ||
        l.trim().includes("DOS FATOS")
    );

    for (let i = 0; i < lines.length; i++) {
      let line = lines[i].trim();
      if (!line) continue;

      // Endereçamento
      if (line.match(/^EXCELENT[ÍI]SSIMO/i)) {
        html.push(
          `<p style='text-align:center;margin:0 0 2em 0;font-weight:bold;text-indent:0;'>${line}</p>`
        );
        continue;
      }

      // Nome da ação
      if (
        line.match(/^[A-ZÇÃÕÁÉÍÓÚÂÊÎÔÛ ]{8,}$/) &&
        i > enderecamentoIndex &&
        (dosFatosIndex === -1 || i < dosFatosIndex)
      ) {
        html.push(
          `<p style='text-align:center;margin:0.5em 0;font-weight:bold;text-indent:0;'>${line}</p>`
        );
        continue;
      }

      // Títulos de seção
      const isTitleSection =
        line.match(/^[IVX]+\s*–\s*[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/i) ||
        line.match(/^DOS?\s+[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/i) ||
        (line.match(/^[A-ZÁÉÍÓÚÂÊÎÔÛÃÕÇ\s]+$/i) &&
          line.length > 3 &&
          line.length < 50);

      if (isTitleSection) {
        chapterCount++;
        subChapterCount = 0;
        const cleanLine = line.replace(/^[IVX]+\s*–\s*/, "");
        html.push(
          `<p style='margin:0;font-weight:bold;text-indent:0;'>${cleanLine}</p>`
        );
        continue;
      }

      // Citações
      if (line.startsWith(">")) {
        html.push(
          `<p style='margin:0.5em 0;text-align:justify;padding-left:4cm;font-size:10pt;'>${line
            .substring(1)
            .trim()}</p>`
        );
        continue;
      }

      // Qualificação
      if (
        enderecamentoIndex !== -1 &&
        dosFatosIndex !== -1 &&
        i > enderecamentoIndex &&
        i < dosFatosIndex
      ) {
        html.push(
          `<p style='margin:0;text-align:justify;text-indent:0;'>${line}</p>`
        );
        continue;
      }

      // Parágrafos normais
      html.push(
        `<p style='margin:0.5em 0;text-align:justify;text-indent:1.25cm;'>${line}</p>`
      );
    }

    return html.join("\n");
  }, []);

  return {
    // Navegação
    setEtapa: (etapa: number) => setState({ etapa }),
    nextEtapa: () => setState({ etapa: state.etapa + 1 }),
    prevEtapa: () => setState({ etapa: Math.max(0, state.etapa - 1) }),

    // Utilitários
    getPoloOposto,
    filtrarTopicos,

    // Clientes
    setClientes,
    toggleCliente,
    excluirCliente,
    removerClienteDaPeca,
    setPoloCliente,
    adicionarClienteManual,
    setClientesDisponiveis: setClientesDisponiveisAction,

    // Partes Adversas
    adicionarParteAdversa,
    removerParteAdversa,
    atualizarParteAdversa,

    // Conteúdo
    setFatos: (fatos: string) => setState({ fatos }),
    setPedidosEspecificos: (pedidos: string) =>
      setState({ pedidosEspecificos: pedidos }),
    toggleTopico,
    toggleTese,
    toggleJurisprudencia,

    // Área e Peça
    setAreaSelecionada: (area: string) => setState({ areaSelecionada: area }),
    setPecaSelecionada: (peca: PecaJuridica) =>
      setState({ pecaSelecionada: peca }),

    // Processo
    setNumeroProcesso: (numeroProcesso: string) => setState({ numeroProcesso }),
    setVaraJuizo: (varaJuizo: string) => setState({ varaJuizo }),
    setComarca: (comarca: string) => setState({ comarca }),
    setValorCausa: (valorCausa: string) => setState({ valorCausa }),

    // Configurações
    setTituloDocumento: (titulo: string) =>
      setState({ tituloDocumento: titulo }),

    // IA
    analisarFatosParaTeses,
    gerarPecaIA,
    montarPromptIA,
    setTextoFinal: (texto: string) => setTextoFinal(texto),

    // Funções de sugestões IA
    setSugestoesTesesIA: (sugestoes: string[]) =>
      setSugestoesTesesIA(sugestoes),
    setSugestoesJurisIA: (sugestoes: string[]) =>
      setSugestoesJurisIA(sugestoes),

    // Gerar HTML formatado
    gerarHtmlFormatado,
  };
};
