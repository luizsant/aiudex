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
      const novasTeses = state.teses.includes(tese)
        ? state.teses.filter((t) => t !== tese)
        : [...state.teses, tese];

      setTeses(novasTeses);
    },
    [state.teses, setTeses]
  );

  const toggleJurisprudencia = useCallback(
    (juris: string) => {
      const novasJuris = state.juris.includes(juris)
        ? state.juris.filter((j) => j !== juris)
        : [...state.juris, juris];

      setJuris(novasJuris);
    },
    [state.juris, setJuris]
  );

  // Análise de IA para Teses
  const analisarFatosParaTeses = useCallback(async () => {
    if (!state.fatos.trim() && !state.pedidosEspecificos.trim()) {
      setSugestoesTesesIA([]);
      setSugestoesJurisIA([]);
      return;
    }

    setAnalisandoTeses(true);
    setSugestoesTesesIA([]);
    setSugestoesJurisIA([]);

    try {
      const prompt = `Analise os seguintes fatos e pedidos de um processo jurídico e sugira 5-8 tópicos jurídicos objetivos e 3-5 jurisprudências importantes.

IMPORTANTE: 
- Os tópicos devem ser objetivos e concisos (ex: "Responsabilidade objetiva do fornecedor", "Dano moral", "Inversão do ônus da prova")
- As jurisprudências devem ser específicas e fundamentadas, fornecendo a extensão e fundamentação dos tópicos
- Cada tópico deve ser um tema jurídico claro que pode ser desenvolvido com a jurisprudência correspondente

FATOS DO CASO:
${state.fatos}

PEDIDOS ESPECÍFICOS:
${state.pedidosEspecificos}

ÁREA DO DIREITO: ${state.areaSelecionada}
TIPO DE PEÇA: ${state.pecaSelecionada?.nome || "Não especificado"}

INSTRUÇÕES PARA OS TÓPICOS:
- Seja objetivo e conciso
- Foque em temas jurídicos claros
- Evite tópicos muito extensos ou detalhados
- Priorize tópicos que possam ser fundamentados com jurisprudência
- Inclua tópicos de preliminares se aplicável

INSTRUÇÕES PARA JURISPRUDÊNCIAS:
- Inclua referência completa (tribunal, processo, relator, data)
- Seja específico sobre o tema abordado
- Priorize jurisprudências recentes e relevantes
- Forneça fundamentação jurídica detalhada
- Relacione com os tópicos sugeridos

Por favor, retorne apenas um JSON válido com a seguinte estrutura:
{
  "teses": [
    "Responsabilidade objetiva do fornecedor",
    "Dano moral em relações de consumo",
    "Inversão do ônus da prova",
    "Vício do produto",
    "Publicidade enganosa"
  ],
  "jurisprudencias": [
    "STJ, REsp 1234567/DF, Rel. Min. João Silva, 3ª Turma, DJe 15/03/2024: Responsabilidade objetiva do fornecedor - CDC art. 14. O fornecedor responde independentemente da existência de culpa pela reparação dos danos causados aos consumidores por defeitos relativos à prestação dos serviços.",
    "STJ, REsp 9876543/SP, Rel. Min. Maria Santos, 2ª Turma, DJe 20/02/2024: Dano moral em relações de consumo - CDC art. 6º, VI. A violação de direitos do consumidor gera dano moral in re ipsa, dispensando prova específica de dor ou sofrimento.",
    "TJSP, Apelação 123456-32.2023.8.26.0000, Rel. Des. José Oliveira, 15ª Câmara, DJ 10/01/2024: Inversão do ônus da prova - CDC art. 6º, VIII. Nos casos de vício do produto, cabe ao fornecedor provar que o defeito inexiste ou que não houve relação de causalidade."
  ]
}

Seja objetivo nos tópicos e detalhado nas jurisprudências.`;

      const resposta =
        state.modeloIA === "gemini"
          ? await askGemini(prompt)
          : await askDeepSeek(prompt);

      // Tentar extrair JSON da resposta
      try {
        const jsonMatch = resposta.match(/\{[\s\S]*\}/);
        if (jsonMatch) {
          const parsed = JSON.parse(jsonMatch[0]);
          setSugestoesTesesIA(parsed.teses || []);
          setSugestoesJurisIA(parsed.jurisprudencias || []);
        } else {
          // Fallback: extrair tópicos e jurisprudências do texto
          const lines = resposta.split("\n").filter((line) => line.trim());

          // Extrair tópicos objetivos (mais curtos e focados)
          const teses = lines
            .filter(
              (line) =>
                (line.includes("Responsabilidade") && line.length < 50) ||
                (line.includes("Dano") && line.length < 50) ||
                (line.includes("Vício") && line.length < 50) ||
                (line.includes("Inversão") && line.length < 50) ||
                (line.includes("Publicidade") && line.length < 50) ||
                (line.includes("art.") && line.length < 50) ||
                (line.includes("CDC") && line.length < 50) ||
                (line.includes("CC") && line.length < 50) ||
                (line.includes("CPC") && line.length < 50) ||
                (line.includes("Direito") && line.length < 50) ||
                (line.includes("Princípio") && line.length < 50)
            )
            .map((line) => line.trim().replace(/^[-•*]\s*/, "")) // Remove marcadores
            .slice(0, 8);

          // Extrair jurisprudências (mais detalhadas)
          const juris = lines
            .filter(
              (line) =>
                line.includes("STJ") ||
                line.includes("STF") ||
                line.includes("TJ") ||
                line.includes("REsp") ||
                line.includes("RE") ||
                line.includes("Apelação") ||
                line.includes("Agravo") ||
                line.includes("Rel.") ||
                line.includes("Min.") ||
                line.includes("Des.")
            )
            .slice(0, 5);

          setSugestoesTesesIA(teses);
          setSugestoesJurisIA(juris);
        }
      } catch (parseError) {
        console.error("Erro ao analisar resposta da IA:", parseError);
        setSugestoesTesesIA([]);
        setSugestoesJurisIA([]);
      }
    } catch (error) {
      console.error("Erro ao analisar fatos:", error);
      setSugestoesTesesIA(["Erro ao gerar sugestões. Tente novamente."]);
      setSugestoesJurisIA([]);
    } finally {
      setAnalisandoTeses(false);
    }
  }, [
    state.fatos,
    state.pedidosEspecificos,
    state.analisandoTeses,
    state.areaSelecionada,
    state.pecaSelecionada,
    state.modeloIA,
    setAnalisandoTeses,
    setSugestoesTesesIA,
    setSugestoesJurisIA,
  ]);

  // Montar prompt para IA
  const montarPromptIA = useCallback(async () => {
    const officeConfig = await getOfficeConfig();

    const parteAdversaCampos = state.partesRe
      .filter((p) => p.nome.trim())
      .map(
        (p, i) => `Parte Adversa ${i + 1}:
Nome: ${p.nome}
Tipo: ${p.tipo}
CPF/CNPJ: ${p.cpfCnpj}
RG: ${p.rg || ""}
Data de Nascimento: ${p.birthDate || ""}
Estado Civil: ${p.maritalStatus || ""}
Nacionalidade: ${p.nationality || "Brasileira"}
Profissão: ${p.profissao || ""}
Telefone: ${p.phone || ""}
E-mail: ${p.email || ""}
CEP: ${p.cep || ""}
Endereço Completo: ${p.street || ""}, ${p.number || ""} - ${p.complement || ""}
Bairro: ${p.neighborhood || ""}
Cidade: ${p.city || ""}
Estado: ${p.state || ""}
Observações: ${p.observations || ""}`
      )
      .join("\n---\n");

    const prompt = `# PROMPT NIVELADOR - GERADOR DE PETIÇÕES JURÍDICAS

## INSTRUÇÃO PRINCIPAL
Você é um advogado especialista em redação de petições jurídicas. Sua função é gerar petições completas, tecnicamente corretas e bem fundamentadas, utilizando storytelling persuasivo e linguagem formal moderada como um advogado especialista.

## VALIDAÇÃO OBRIGATÓRIA
ANTES de gerar a petição, verifique se recebeu TODOS os dados necessários:
- Área do Direito: ${state.areaSelecionada || "❌ NÃO INFORMADA"}
- Tipo de Peça: ${state.pecaSelecionada?.nome || "❌ NÃO INFORMADA"}
- Clientes: ${state.clientes.length > 0 ? "✅ Informados" : "❌ NÃO INFORMADOS"}
- Fatos do Caso: ${state.fatos ? "✅ Informados" : "❌ NÃO INFORMADOS"}

Se algum dado estiver faltando, NÃO gere uma petição genérica. Informe quais dados estão faltando.

## DADOS DO ADVOGADO (OBRIGATÓRIO - USE NA ASSINATURA)
Nome do Advogado: ${officeConfig.lawyerName}
Número OAB: ${officeConfig.oabNumber}
Estado OAB: ${officeConfig.oabState}
Endereço do Escritório: ${officeConfig.officeAddress}
Telefone do Escritório: ${officeConfig.officePhone}
E-mail do Escritório: ${officeConfig.officeEmail}
Nome do Escritório: ${officeConfig.officeName || officeConfig.officeAddress}

**IMPORTANTE:** Na assinatura da petição, use APENAS:
- Nome do Advogado: ${officeConfig.lawyerName}
- Número OAB: ${officeConfig.oabNumber}
- Estado OAB: ${officeConfig.oabState}
- NÃO inclua dados do escritório (endereço, telefone, e-mail, nome do escritório)

## DADOS DO CASO (USE OBRIGATORIAMENTE TODOS PARA QUALIFICAR AS PARTES)

Área do Direito: ${state.areaSelecionada || "(não informada)"}
Tipo de Peça: ${state.pecaSelecionada?.nome || "(não informada)"}
Descrição da Peça: ${state.pecaSelecionada?.desc || "(não informada)"}

Partes do processo:
${state.clientes
  .map(
    (c, i) => `Parte ${i + 1}:
Nome: ${c.name}
CPF: ${c.cpf || ""}
RG: ${c.rg || ""}
Data de Nascimento: ${c.birthDate || ""}
Estado Civil: ${c.estadoCivil || c.maritalStatus || ""}
Nacionalidade: ${c.nationality || "Brasileira"}
Profissão: ${c.profissao || ""}
Telefone: ${c.phone || ""}
E-mail: ${c.email || ""}
CEP: ${c.cep || ""}
Endereço Completo: ${c.street || ""}, ${c.number || ""} - ${c.complement || ""}
Bairro: ${c.neighborhood || ""}
Cidade: ${c.city || ""}
Estado: ${c.state || ""}
Observações: ${c.observations || ""}
Polo: ${state.poloClientes[c.id] === "reu" ? "Réu" : "Autor"}`
  )
  .join("\n---\n")}

Parte adversa:
${parteAdversaCampos}

Tópicos Preliminares Selecionados: ${
      state.topicos && state.topicos.length
        ? state.topicos.join(", ")
        : "(nenhum)"
    }

Fatos do caso (cronológicos e objetivos):
${state.fatos || "(não informado)"}

Teses jurídicas selecionadas:
${state.teses.join(", ")}

Jurisprudências selecionadas:
${state.juris.join(", ")}

**ATENÇÃO: As teses e jurisprudências acima DEVEM ser usadas obrigatoriamente na fundamentação da petição. NÃO ignore estas informações.**

**INSTRUÇÕES ESPECÍFICAS PARA TESES E JURISPRUDÊNCIAS:**
- Use EXATAMENTE as teses jurídicas listadas acima para fundamentar a petição
- Use EXATAMENTE as jurisprudências listadas acima para fortalecer os argumentos
- **INTEGRE as jurisprudências naturalmente dentro das teses e fundamentação**
- **NÃO crie um tópico separado para jurisprudências**
- **Para cada tese, crie um subtítulo numerado e desenvolva com pelo menos 5 parágrafos**
- **Dentro de cada tese, incorpore as jurisprudências relevantes de forma lógica e natural**
- **Cite as jurisprudências completas quando aplicável ao argumento da tese**
- **Após cada citação de jurisprudência, explique sua aplicação ao caso concreto**
- **NÃO ignore ou substitua as teses e jurisprudências fornecidas**
- **Se não houver teses ou jurisprudências selecionadas, informe claramente que é necessário selecionar pelo menos uma tese ou jurisprudência**
- **OBRIGATORIAMENTE use TODAS as teses e jurisprudências fornecidas na fundamentação**
- **NÃO deixe a seção "DO DIREITO" vazia ou com observações**

Pedidos Específicos:
${state.pedidosEspecificos || "(nenhum)"}

Dados do Processo:
Número: ${state.numeroProcesso || ""}
Vara/Juízo: ${state.varaJuizo || ""}
Comarca: ${state.comarca || ""}
Valor da Causa: ${state.valorCausa || ""}

## INSTRUÇÕES DE FORMATAÇÃO
1. Use formatação markdown adequada
2. Mantenha linguagem formal jurídica
3. Inclua TODOS os dados fornecidos acima
4. Estruture conforme o tipo de peça selecionado
5. Assine APENAS com os dados do advogado (nome, OAB, estado)
6. NÃO use dados genéricos ou placeholders

### DETERMINAÇÃO DO NOME DA AÇÃO
**CRÍTICO:** O nome da ação deve ser determinado baseado nos fatos, teses e pedidos, NÃO no tipo da peça.

**EXEMPLOS DE DETERMINAÇÃO:**
- **Fatos:** Cancelamento de voo + perda de evento → "AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS E MATERIAIS"
- **Teses:** Responsabilidade civil + danos morais → "AÇÃO DE REPARAÇÃO DE DANOS"
- **Pedidos:** Anulação de contrato → "AÇÃO DE ANULAÇÃO DE CONTRATO"
- **Fatos:** Cobrança indevida → "AÇÃO DE COBRANÇA"
- **Teses:** Responsabilidade do fornecedor → "AÇÃO DE RESPONSABILIDADE CIVIL"

**REGRAS:**
1. **Analise os fatos:** O que aconteceu? (ex: cancelamento, cobrança, danos)
2. **Analise as teses:** Quais direitos foram violados? (ex: responsabilidade civil, danos morais)
3. **Analise os pedidos:** O que está sendo pedido? (ex: indenização, anulação, cobrança)
4. **Combine os elementos:** "AÇÃO DE [PRINCIPAL PEDIDO] POR [PRINCIPAL FUNDAMENTO]"
5. **Posicione após a qualificação:** O nome da ação deve aparecer APÓS a qualificação do autor, entre o autor e o réu
6. **Centralize o resultado:** "**AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS E MATERIAIS**"

### FORMATAÇÃO ESPECÍFICA
**REGRAS OBRIGATÓRIAS:**
1. **Número do Processo:** 
   - Se informado: "Processo nº [NÚMERO]" (linha separada)
   - Se não informado: NÃO incluir linha do número do processo
2. **Nome da Ação:** 
   - **DETERMINE o nome da ação baseado nos fatos, teses e pedidos**
   - **NÃO use simplesmente o tipo da peça (ex: "Petição Inicial")**
   - **Exemplos corretos:** "AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS E MATERIAIS", "AÇÃO DE ANULAÇÃO DE CONTRATO", "AÇÃO DE COBRANÇA", "AÇÃO DE REPARAÇÃO DE DANOS", etc.
   - **Posicione APÓS a qualificação do autor:** O nome da ação deve aparecer entre a qualificação do autor e a qualificação do réu
   - **CENTRALIZE OBRIGATORIAMENTE:** O nome da ação deve estar centralizado na página, sem recuo, igual ao endereçamento
   - **Formato correto:** "**AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS E MATERIAIS**" (centralizado)
   - **Baseie-se nos fatos:** Se envolve danos morais → "AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS"
   - **Baseie-se nas teses:** Se tem responsabilidade civil → "AÇÃO DE REPARAÇÃO DE DANOS"
   - **Baseie-se nos pedidos:** Se pede anulação → "AÇÃO DE ANULAÇÃO"
3. **Qualificação do Autor:**
   - **Recuo de 4 espaços** antes da qualificação
   - **Tudo em um parágrafo só:** "    **João José Jota**, brasileiro, solteiro, comerciante, portador do RG nº 4361070, inscrito no CPF sob o nº 843.336.342-53, nascido em 08 de julho de 2025, residente e domiciliado na Rua Antônio Barreto, 600, Bairro Fátima, CEP 66060-021, Belém/PA, telefone (91) 91981-3972, e-mail jotajota@gmail.com, por seu advogado que esta subscreve, vem, respeitosamente, à presença de Vossa Excelência, propor a presente:"
   - **NOME DO AUTOR EM NEGRITO:** "**João José Jota**"
   - **NÃO quebre a linha** após o nome do autor
   - **TERMINE COM:** "propor a presente:"
4. **Nome da Ação:**
   - **CENTRALIZE OBRIGATORIAMENTE** usando a tag <center>**NOME DA AÇÃO**</center>
   - **Formato:** "<center>**AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS E MATERIAIS**</center>"
   - **POSICIONE** após "propor a presente:"
5. **Parte Adversa:**
   - **INCLUA** "em face de **[Nome da Parte Adversa]**" após o nome da ação
   - **Use o nome real** da parte adversa (autor ou réu) em negrito
   - **POSICIONE** após o nome da ação centralizado
5. **Data da Peça:**
   - **Use a data atual** no formato: "[Cidade], [dia] de [mês] de [ano]."
   - **Exemplo:** "Belém/PA, 12 de julho de 2025."
   - **NÃO use colchetes** na data
6. **Assinatura:** Inclua APENAS:
   - Nome do advogado
   - Número OAB
   - Estado OAB
   - NÃO inclua dados do escritório (endereço, telefone, e-mail, nome do escritório)

### ESTRUTURAÇÃO DE TESES E PRELIMINARES
**REGRAS OBRIGATÓRIAS:**
1. **Para cada tese jurídica ou preliminar, crie um subtítulo específico**
2. **Cada subtítulo deve ter pelo menos 5 parágrafos de desenvolvimento**
3. **Estrutura de cada tese/preliminar:**
   - **1º parágrafo:** Introdução da tese e sua relevância
   - **2º parágrafo:** Fundamentação legal (artigos, leis)
   - **3º parágrafo:** Aplicação dos fatos à norma
   - **4º parágrafo:** Jurisprudência aplicável (se houver) - **INTEGRE NATURALMENTE**
   - **5º parágrafo:** Conclusão da tese e sua importância para o caso

4. **INTEGRAÇÃO DE JURISPRUDÊNCIAS:**
   - **NÃO crie tópico separado para jurisprudências**
   - **Incorpore as jurisprudências naturalmente dentro das teses relevantes**
   - **Cite a jurisprudência completa quando aplicável ao argumento**
   - **Após cada citação, explique como ela se aplica ao caso concreto**
   - **Use transições naturais para conectar jurisprudência e argumento**

### FORMATAÇÃO DE JURISPRUDÊNCIA E CITAÇÕES
- **Toda citação de jurisprudência ou citação doutrinária deve ser iniciada por > (sinal de maior) SEM espaço, diretamente seguido do texto.**
- **Exemplo de jurisprudência:**
  '>STJ, REsp 1234567/DF, Rel. Min. João Silva, 3ª Turma, DJe 15/03/2024: "Texto da jurisprudência aqui."'
- **Exemplo de citação doutrinária:**
  '>Maria Helena Diniz, Curso de Direito Civil Brasileiro, 2020, p. 123: "A responsabilidade civil é..."'
- **Sempre inclua tribunal, número do processo, relator, turma/câmara e data nas jurisprudências.**
- **Use aspas duplas para destacar o texto citado.**
- **Todas as linhas iniciadas por > serão formatadas com recuo e tamanho de fonte próprios para citações/jurisprudências no documento final.**
- **OBRIGATORIAMENTE, após cada jurisprudência, inclua um parágrafo de fechamento explicando sua aplicação ao caso.**

### INTEGRAÇÃO NATURAL DE JURISPRUDÊNCIAS
- **NÃO crie seção separada para jurisprudências**
- **Incorpore as jurisprudências naturalmente dentro das teses relevantes**
- **Use transições como: "Nesse sentido, o Superior Tribunal de Justiça já decidiu que..."**
- **Após citar a jurisprudência, explique como ela se aplica ao caso concreto**
- **Conecte a jurisprudência com os fatos do caso de forma lógica**

### ESTRUTURA DA PETIÇÃO
**LAYOUT OBRIGATÓRIO:**
\`\`\`
**EXCELENTÍSSIMO(A) SENHOR(A) DOUTOR(A) JUIZ(A) DE DIREITO DA VARA CÍVEL DA COMARCA DE [COMARCA]**

[Processo nº 1234567-89.2024.8.14.0000] (só se informado)

&nbsp;
&nbsp;
&nbsp;
&nbsp;

    **João José Jota**, brasileiro, solteiro, comerciante, portador do RG nº 4361070, inscrito no CPF sob o nº 843.336.342-53, nascido em 08 de julho de 2025, residente e domiciliado na Rua Antônio Barreto, 600, Bairro Fátima, CEP 66060-021, Belém/PA, telefone (91) 91981-3972, e-mail jotajota@gmail.com, por seu advogado que esta subscreve, vem, respeitosamente, à presença de Vossa Excelência, propor a presente:

<center>**AÇÃO DE INDENIZAÇÃO POR DANOS MORAIS E MATERIAIS**</center>

em face de **[Nome da Parte Adversa]**

[CONTEÚDO DA PETIÇÃO]

Belém/PA, 12 de julho de 2025.

<center>[Nome do Advogado]</center>
<center>OAB nº [123456]/[SP]</center>
\`\`\`

**IMPORTANTE SOBRE CENTRALIZAÇÃO:**
- **Endereçamento:** Centralizado (como no exemplo acima)
- **Espaçamento:** Use &nbsp; &nbsp; &nbsp; &nbsp; entre o endereçamento e a qualificação do autor
- **Nome da Ação:** DEVE usar a tag <center>**NOME DA AÇÃO**</center> para centralizar
- **Parte Adversa:** Use o nome real da parte adversa (autor ou réu) em negrito
- **Assinatura:** Use <center>[Nome do Advogado]</center> e <center>OAB nº [123456]/[SP]</center>
- **CRÍTICO:** O nome da ação deve estar em uma linha separada, centralizada com a tag <center>

### USO DOS DADOS DO PROCESSO
- **Número do Processo:** Use o número fornecido no cabeçalho da petição
- **Vara/Juízo:** Use no endereçamento da petição (ex: "VARA CÍVEL DA COMARCA DE [COMARCA]")
- **Comarca:** Use no endereçamento da petição
- **Valor da Causa:** Use na seção "DO VALOR DA CAUSA" (ex: "Dá-se à causa o valor de R$ [VALOR]")
- **Se algum dado estiver "(não informado)", deixe em branco ou use um valor razoável**

### REGRAS PARA EVITAR OBSERVAÇÕES
- **NÃO inicie a petição com comentários ou observações**
- **NÃO termine a petição com comentários ou observações**
- **A petição deve começar diretamente com: "EXCELENTÍSSIMO(A) SENHOR(A)..."**
- **A petição deve terminar diretamente com a assinatura do advogado**
- **NÃO inclua frases como "EXCELENTE! Todos os dados necessários foram fornecidos"**
- **NÃO inclua frases como "OBSERVAÇÃO IMPORTANTE" ou "Por favor, forneça..."**
- **A resposta deve ser APENAS a petição jurídica, sem qualquer texto adicional**

### EXEMPLO DE INTEGRAÇÃO NATURAL
**TESE: RESPONSABILIDADE OBJETIVA DO FORNECEDOR**

1º parágrafo: Introdução da tese
2º parágrafo: Fundamentação legal (CDC art. 14)
3º parágrafo: Aplicação dos fatos à norma
4º parágrafo: **"Nesse sentido, o Superior Tribunal de Justiça já decidiu que:**
   >STJ, REsp 1234567/DF, Rel. Min. João Silva, 3ª Turma, DJe 15/03/2024: "A responsabilidade do fornecedor é objetiva, independente de culpa."

   **Esta jurisprudência se aplica perfeitamente ao caso em análise, pois demonstra que o fornecedor responde pelos danos causados aos consumidores independentemente de culpa, o que fortalece o direito do autor ao ressarcimento."**
5º parágrafo: Conclusão da tese

## INSTRUÇÃO FINAL
Gere a petição completa agora, utilizando EXCLUSIVAMENTE os dados fornecidos acima. Se algum dado estiver faltando, informe claramente quais dados precisam ser preenchidos.

**IMPORTANTE:**
- **OBRIGATORIAMENTE use as teses jurídicas selecionadas acima para fundamentar a petição**
- **OBRIGATORIAMENTE use as jurisprudências selecionadas acima para fortalecer os argumentos**
- **INTEGRE as jurisprudências naturalmente dentro das teses - NÃO crie tópico separado**
- **Para cada tese selecionada, crie um subtítulo numerado e desenvolva com pelo menos 5 parágrafos**
- **Dentro de cada tese, incorpore as jurisprudências relevantes de forma lógica e natural**
- **Cite as jurisprudências completas quando aplicável ao argumento da tese**
- **Após cada citação de jurisprudência, explique sua aplicação ao caso concreto**
- **Use transições naturais para conectar jurisprudência e argumento**
- **NÃO ignore as teses e jurisprudências fornecidas - elas são fundamentais para a petição**
- **Se não houver teses ou jurisprudências selecionadas, informe claramente que é necessário selecionar pelo menos uma tese ou jurisprudência**
- **LEMBRE-SE: As jurisprudências devem ser integradas naturalmente dentro das teses, não em seção separada**
- **NÃO deixe observações, comentários ou notas no início ou final da petição**
- **A petição deve começar diretamente com o endereçamento e terminar com a assinatura**
- **Use TODOS os dados do processo fornecidos (número, vara, comarca, valor da causa)**
- **Se algum dado estiver marcado como "(não informado)", use um valor razoável ou deixe em branco**
- **A resposta deve ser APENAS a petição pronta para protocolo, sem qualquer texto adicional**
- **CRÍTICO: Se houver teses e jurisprudências fornecidas, USE-AS OBRIGATORIAMENTE na seção "DO DIREITO"**
- **CRÍTICO: NÃO deixe a seção "DO DIREITO" vazia ou com observações sobre falta de teses**
- **CRÍTICO: O NOME DA AÇÃO DEVE ESTAR CENTRALIZADO USANDO A TAG <center>**NOME DA AÇÃO**</center>**
- **FORMATAÇÃO ESPECÍFICA:**
  - **Endereçamento:** Centralizado e em negrito
  - **Espaçamento:** Use &nbsp; &nbsp; &nbsp; &nbsp; entre o endereçamento e a qualificação do autor
  - **Número do Processo:** Só inclua se informado, senão omita completamente
  - **Qualificação do Autor:** Recuo de 4 espaços, tudo em um parágrafo só, NOME EM NEGRITO, termine com "propor a presente:"
  - **Nome da Ação:** DETERMINE baseado nos fatos/teses/pedidos, CENTRALIZE OBRIGATORIAMENTE usando <center>**NOME DA AÇÃO**</center>
  - **Parte Adversa:** "em face de **[Nome da Parte Adversa]**" após o nome da ação (use o nome real)
  - **Data da Peça:** Use data atual no formato "[Cidade], [dia] de [mês] de [ano]." (sem colchetes)
  - **Assinatura:** Use <center>[Nome do Advogado]</center> e <center>OAB nº [123456]/[SP]</center>`;

    return prompt;
  }, [
    state.areaSelecionada,
    state.pecaSelecionada,
    state.clientes,
    state.partesRe,
    state.topicos,
    state.fatos,
    state.teses,
    state.juris,
    state.pedidosEspecificos,
    state.numeroProcesso,
    state.varaJuizo,
    state.comarca,
    state.valorCausa,
    state.poloClientes,
  ]);

  // Geração da Peça com IA
  const gerarPecaIA = useCallback(async () => {
    if (state.gerando) {
      return;
    }

    // Verificação de créditos
    if (!canGeneratePetition()) {
      setLogs((prev) => [
        ...prev,
        "❌ Créditos insuficientes para gerar peça. Faça upgrade do seu plano.",
      ]);
      return;
    }

    // Validação dos dados obrigatórios
    const dadosFaltando = [];
    if (!state.areaSelecionada) dadosFaltando.push("Área do Direito");
    if (!state.pecaSelecionada) dadosFaltando.push("Tipo de Peça");
    if (state.clientes.length === 0) dadosFaltando.push("Clientes");
    if (!state.fatos) dadosFaltando.push("Fatos do Caso");

    if (dadosFaltando.length > 0) {
      setLogs((prev) => [
        ...prev,
        `❌ Dados obrigatórios não preenchidos: ${dadosFaltando.join(", ")}`,
      ]);
      return;
    }

    setGerando(true);
    setProgresso(0);
    setLogs([]);
    setTextoFinal("");

    const updateProgress = (target: number, duration: number = 1000) => {
      const start = Date.now();
      const animate = () => {
        const elapsed = Date.now() - start;
        const progress = Math.min((elapsed / duration) * target, target);
        setProgresso(Math.round(progress));
        if (progress < target) {
          requestAnimationFrame(animate);
        }
      };
      requestAnimationFrame(animate);
    };

    try {
      // Etapa 1: Preparação
      setLogs((prev) => [...prev, "🔄 Iniciando geração da peça jurídica..."]);
      updateProgress(15);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Etapa 2: Coleta de dados
      setLogs((prev) => [...prev, "📋 Coletando dados do processo..."]);
      updateProgress(30);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Etapa 3: Análise jurídica
      setLogs((prev) => [...prev, "⚖️ Analisando fundamentos jurídicos..."]);
      updateProgress(50);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Etapa 4: Geração do texto
      setLogs((prev) => [...prev, "✍️ Gerando texto da petição..."]);
      updateProgress(70);

      const prompt = await montarPromptIA();

      const resultado =
        state.modeloIA === "gemini"
          ? await askGemini(prompt)
          : await askDeepSeek(prompt);

      // Consumir crédito após geração bem-sucedida
      const creditConsumed = consumePetitionCredit(
        `Geração de ${state.pecaSelecionada?.nome || "peça jurídica"}`
      );

      if (creditConsumed) {
        setLogs((prev) => [...prev, "✅ Crédito consumido com sucesso"]);
      } else {
        setLogs((prev) => [...prev, "⚠️ Erro ao consumir crédito"]);
      }

      // Etapa 5: Formatação
      setLogs((prev) => [...prev, "🎨 Formatando documento..."]);
      updateProgress(90);
      await new Promise((resolve) => setTimeout(resolve, 500));

      // Etapa 6: Finalização
      setLogs((prev) => [...prev, "✅ Peça jurídica gerada com sucesso!"]);
      updateProgress(100);

      setTextoFinal(resultado);

      // SALVAMENTO AUTOMÁTICO NO BANCO
      try {
        const doc = {
          id: Date.now().toString(),
          title:
            state.tituloDocumento ||
            `${state.pecaSelecionada?.nome || "Peça Jurídica"} - ${
              state.clientes[0]?.name || "Cliente"
            }`,
          type: "petition",
          content: resultado
            .replace(/\n{2,}/g, "\n")
            .replace(/[ \t]+\n/g, "\n")
            .replace(/\n[ \t]+/g, "\n")
            .replace(
              /(EXCELENT[ÍI]SSIMO\(A\)[^\n]+\n)([^\n]+)/i,
              "$1\n\n\n\n$2"
            )
            .trim(),
          clientId: state.clientes[0]?.id?.toString() || "",
          clientName: state.clientes.map((c) => c.name).join(", "),
          createdAt: new Date(),
          updatedAt: new Date(),
          status: "finalized" as const,
          template: "",
          metadata: {
            causeValue: state.valorCausa || "",
            jurisdiction: state.varaJuizo || "",
            theses: state.teses,
            jurisprudences: state.juris,
            blocks: [],
            aiGenerated: true,
          },
          tags: [],
          version: 1,
        };

        console.log("Salvando documento automaticamente:", doc);
        await documentService.createDocument(doc);
        console.log("Documento salvo com sucesso no banco!");

        setLogs((prev) => [
          ...prev,
          "💾 Documento salvo automaticamente em 'Meus Documentos'",
        ]);

        toast({
          title: "Documento salvo!",
          description: "A peça foi salva automaticamente em 'Meus Documentos'.",
        });
      } catch (error) {
        console.error("Erro ao salvar documento automaticamente:", error);
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

  // Função para gerar HTML formatado (EXATAMENTE igual ao editor antigo, incluindo pós-processamento de markdown)
  const gerarHtmlFormatado = useCallback((texto: string) => {
    if (!texto) return "";
    // Pós-processamento para remover markdown (igual ao editor antigo)
    let textoLimpo = texto
      .replace(/\*\*(.*?)\*\*/g, "<strong>$1</strong>") // converte **negrito** para <strong>negrito</strong>
      .replace(/\*(.*?)\*/g, "<em>$1</em>") // converte *itálico* para <em>itálico</em>
      .replace(/__(.*?)__/g, "<u>$1</u>") // converte __sublinhado__ para <u>sublinhado</u>
      .replace(/^#+\s?(.*)$/gm, "$1") // remove # títulos
      .replace(/\[(.*?)\]\((.*?)\)/g, "$1") // remove links markdown
      .replace(/`([^`]+)`/g, "$1") // remove `código`
      .replace(/^-\s+/gm, "") // remove bullets
      .replace(/\s+$/gm, "") // remove espaços à direita
      .replace(/\n{3,}/g, "\n\n"); // normaliza múltiplas quebras de linha

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
      // Nome da ação (após qualificação, geralmente em maiúsculas, centralizado e em negrito)
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
      // Qualificação (entre endereçamento e DOS FATOS) - AGORA JUSTIFICADA
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

    // Funções de sugestões IA - CRÍTICO: estavam faltando!
    setSugestoesTesesIA: (sugestoes: string[]) =>
      setSugestoesTesesIA(sugestoes),
    setSugestoesJurisIA: (sugestoes: string[]) =>
      setSugestoesJurisIA(sugestoes),

    // Gerar HTML formatado
    gerarHtmlFormatado,
  };
};
