// Serviço de IA Jurídica para geração de petições
export interface AIPrompt {
  template: string;
  clientData: {
    name: string;
    cpf: string;
    address: string;
    role: string; // "autora" ou "ré"
  };
  // Suporte para múltiplos autores
  authors?: Array<{
    name: string;
    cpf: string;
    address: string;
    phone?: string;
    email?: string;
  }>;
  // Suporte para múltiplas partes adversas
  adverseParties?: Array<{
    name: string;
    cpf: string;
    address: string;
    phone: string;
    email: string;
  }>;
  adverseLawyer?: {
    name: string;
    oab: string;
    office: string;
  };
  facts: string;
  theses: string[];
  blocks: string[];
  causeValue: string;
  jurisdiction: string;
}

export interface AIResponse {
  content: string;
  suggestions: string[];
  confidence: number;
  estimatedTime: number;
}

// Simulação de IA jurídica avançada
export class LegalAIService {
  private static instance: LegalAIService;
  private apiKey: string | null = null;
  private isPremium: boolean = false;

  static getInstance(): LegalAIService {
    if (!LegalAIService.instance) {
      LegalAIService.instance = new LegalAIService();
    }
    return LegalAIService.instance;
  }

  setApiKey(key: string): void {
    this.apiKey = key;
  }

  setPremiumStatus(premium: boolean): void {
    this.isPremium = premium;
  }

  async generatePetition(prompt: AIPrompt): Promise<AIResponse> {
    // Simulação de processamento de IA
    await new Promise((resolve) =>
      setTimeout(resolve, 2000 + Math.random() * 3000)
    );

    const baseContent = this.generateBaseContent(prompt);
    const enhancedContent = this.isPremium
      ? this.enhanceWithPremiumFeatures(baseContent, prompt)
      : baseContent;

    return {
      content: enhancedContent,
      suggestions: this.generateSuggestions(prompt),
      confidence: this.isPremium ? 0.95 : 0.85,
      estimatedTime: this.isPremium ? 30 : 60,
    };
  }

  private generateBaseContent(prompt: AIPrompt): string {
    const {
      template,
      clientData,
      authors,
      adverseParties,
      adverseLawyer,
      facts,
      theses,
      blocks,
      causeValue,
      jurisdiction,
    } = prompt;

    const thesisContent = theses
      .map((thesis) => {
        const thesisMap: Record<string, string> = {
          "responsabilidade-objetiva":
            "A responsabilidade civil objetiva encontra fundamento no art. 927, parágrafo único do Código Civil, aplicável quando a atividade normalmente desenvolvida pelo autor do dano implicar, por sua natureza, risco para os direitos de outrem.",
          "dano-moral-presumido":
            "O dano moral experimentado pelo requerente é evidente e dispensa prova, tratando-se de dano in re ipsa, conforme entendimento consolidado do Superior Tribunal de Justiça.",
          "inversao-onus":
            "A inversão do ônus da prova é aplicável nos termos do art. 6º, VIII do Código de Defesa do Consumidor, considerando a hipossuficiência técnica do consumidor.",
          "prescricao-decenal":
            "A prescrição decenal prevista no art. 205 do Código Civil não se aplica ao caso em questão, considerando a natureza do direito pleiteado.",
          "juros-capitalizacao":
            "A capitalização de juros é vedada pela Súmula 121 do STF, aplicando-se juros simples de 1% ao mês.",
        };
        return thesisMap[thesis] || thesis;
      })
      .join("\n\n");

    const blockContent = blocks
      .map((block) => {
        const blockMap: Record<string, string> = {
          "tutela-antecipada": `DOS PEDIDOS DE TUTELA ANTECIPADA

Requer-se a concessão de tutela antecipada, com fundamento no art. 300 do Código de Processo Civil, considerando a presença dos requisitos legais:

a) Probabilidade do direito (fumus boni iuris): Os fatos narrados e a documentação apresentada demonstram a verossimilhança das alegações;
b) Perigo de dano (periculum in mora): A demora na prestação jurisdicional pode causar dano irreparável ou de difícil reparação.

Diante do exposto, requer-se a concessão da tutela antecipada.`,
          "dano-moral": `DOS DANOS MORAIS

O dano moral experimentado pelo requerente é evidente e dispensa prova, tratando-se de dano in re ipsa, conforme entendimento consolidado do Superior Tribunal de Justiça.

A conduta da requerida causou abalo psíquico, constrangimento e violação à dignidade da pessoa humana, ensejando o dever de indenizar, nos termos do art. 5º, inciso X, da Constituição Federal e art. 186 do Código Civil.

Para a fixação do quantum indenizatório, deve-se observar o caráter punitivo-pedagógico da indenização, bem como a capacidade econômica das partes e a extensão do dano.

Diante do exposto, requer-se a condenação da requerida ao pagamento de indenização por danos morais no valor de R$ ${this.calculateMoralDamage(
            causeValue
          )}.`,
          liminar: `DO PEDIDO LIMINAR

Requer-se a concessão de liminar, inaudita altera pars, pelos seguintes fundamentos:

1. URGÊNCIA: A situação apresentada demanda providência imediata do Poder Judiciário, sob pena de dano irreparável ou de difícil reparação.

2. VEROSSIMILHANÇA: Os fatos narrados e a documentação apresentada demonstram a verossimilhança das alegações.

3. FUNDAMENTO LEGAL: Art. 300 do Código de Processo Civil.`,
        };
        return blockMap[block] || block;
      })
      .join("\n\n");

    // Determinar se o cliente é autora ou ré
    const isAuthor = clientData.role === "autora";
    const authorNames = authors?.map((author) => author.name) || [];
    const authorCpfs = authors?.map((author) => author.cpf) || [];
    const authorAddresses = authors?.map((author) => author.address) || [];
    const defendantNames = adverseParties?.map((party) => party.name) || [];

    // Informações dos autores
    const authorInfo = authors
      ? `
AUTORAS: ${authorNames.map((name) => name.toUpperCase()).join(", ")}, ${
          authorCpfs.length > 0
            ? `portadoras do CPF nº ${authorCpfs.join(", ")}`
            : "qualificações nos autos"
        }, ${
          authorAddresses.length > 0
            ? `residentes e domiciliadas nos endereços: ${authorAddresses.join(
                ", "
              )}`
            : "endereços nos autos"
        }.`
      : "";

    // Informações das partes adversas
    const adversePartyInfos = adverseParties
      ? `
PARTE ADVVERSA: ${defendantNames
          .map((name) => name.toUpperCase())
          .join(", ")}, ${
          defendantNames.length > 0
            ? `portadoras do CPF/CNPJ nº ${defendantNames.join(", ")}`
            : "qualificações nos autos"
        }, ${
          defendantNames.length > 0
            ? `residentes e domiciliadas nos endereços: ${defendantNames
                .map((name) => name.toUpperCase())
                .join(", ")}`
            : "endereços nos autos"
        }.`
      : "";

    // Informações do advogado adverso
    const adverseLawyerInfo = adverseLawyer
      ? `
ADVOGADO DA PARTE ADVVERSA: Dr. ${adverseLawyer.name}, inscrito na ${adverseLawyer.oab}, com escritório na ${adverseLawyer.office}.`
      : "";

    return `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA ${jurisdiction}

${clientData.name.toUpperCase()}, ${
      clientData.cpf
        ? `portador do CPF nº ${clientData.cpf}`
        : "qualificação nos autos"
    }, ${
      clientData.address
        ? `residente e domiciliado no endereço: ${clientData.address}`
        : "endereço nos autos"
    }${authorInfo}${adversePartyInfos}${adverseLawyerInfo}

${
  isAuthor ? "AUTORA" : "RÉU"
}, por meio de seu advogado que esta subscreve, vem respeitosamente à presença de Vossa Excelência, propor a presente

${template.toUpperCase()}

em face de ${
      defendantNames.length > 0 ? defendantNames.join(", ") : "PARTE ADVVERSA"
    }, pelos fatos e fundamentos jurídicos a seguir expostos:

DOS FATOS

${facts}

DO DIREITO

${thesisContent}

${blockContent}

DOS PEDIDOS

Diante do exposto, requer-se:

a) A citação da parte requerida para responder aos termos da presente ação;
b) A procedência total dos pedidos;
c) A condenação da requerida ao pagamento das custas processuais e honorários advocatícios.

Protesta provar o alegado por todos os meios de prova em direito admitidos.

Dá-se à causa o valor de ${causeValue}.

Nestes termos, pede deferimento.

${jurisdiction}, ${new Date().toLocaleDateString("pt-BR")}.

ADVOGADO
OAB/SP nº 123456`;
  }

  private enhanceWithPremiumFeatures(
    content: string,
    prompt: AIPrompt
  ): string {
    // Adicionar recursos premium como jurisprudência específica
    const enhancedContent =
      content +
      `

JURISPRUDÊNCIA APLICÁVEL:

STJ - REsp 1.000.000/SP - Rel. Min. Ricardo Villas Bôas Cueva
"O dano moral deve ser fixado considerando a capacidade econômica das partes e a extensão do dano."

STF - RE 1.000.000/SP - Rel. Min. Alexandre de Moraes
"A responsabilidade civil objetiva é aplicável quando a atividade desenvolvida implica risco para terceiros."`;

    return enhancedContent;
  }

  private generateSuggestions(prompt: AIPrompt): string[] {
    return [
      "Considere adicionar mais jurisprudência específica",
      "Inclua fundamentação legal mais detalhada",
      "Adicione protesto de provas mais específico",
      "Considere incluir pedido de tutela antecipada",
    ];
  }

  private calculateMoralDamage(causeValue: string): string {
    const value = parseFloat(
      causeValue.replace(/[^\d,]/g, "").replace(",", ".")
    );
    return (value * 0.1).toFixed(2);
  }

  async analyzeJurisprudence(query: string): Promise<any[]> {
    // Simulação de análise de jurisprudência
    await new Promise((resolve) => setTimeout(resolve, 1000));

    return [
      {
        tribunal: "STJ",
        processo: "REsp 1.000.000/SP",
        relator: "Min. Ricardo Villas Bôas Cueva",
        ementa: "Dano moral - Fixação - Critérios",
        resultado: "Provido",
      },
    ];
  }

  async validatePetition(content: string): Promise<{
    isValid: boolean;
    errors: string[];
    warnings: string[];
    suggestions: string[];
  }> {
    const errors: string[] = [];
    const warnings: string[] = [];
    const suggestions: string[] = [];

    // Validações básicas
    if (!content.includes("DOS FATOS")) {
      errors.push('Seção "DOS FATOS" não encontrada');
    }

    if (!content.includes("DO DIREITO")) {
      errors.push('Seção "DO DIREITO" não encontrada');
    }

    if (!content.includes("DOS PEDIDOS")) {
      errors.push('Seção "DOS PEDIDOS" não encontrada');
    }

    // Sugestões de melhoria
    if (content.length < 1000) {
      warnings.push("Petição muito curta - considere adicionar mais detalhes");
    }

    if (!content.includes("Protesta provar")) {
      suggestions.push("Considere adicionar protesto de provas");
    }

    return {
      isValid: errors.length === 0,
      errors,
      warnings,
      suggestions,
    };
  }
}

export const legalAI = LegalAIService.getInstance();

const SYSTEM_PROMPT = `
Você é um assistente jurídico brasileiro. 
Responda sempre como um advogado, gerando peças jurídicas, petições, contratos, pareceres, análises e respostas jurídicas detalhadas em português. 
Nunca gere código de programação, apenas textos jurídicos.
`;

export async function askDeepSeek(prompt: string): Promise<string> {
  console.log("🔍 [DEBUG] askDeepSeek - Iniciando chamada");

  try {
    const response = await fetch("http://localhost:11434/api/generate", {
      method: "POST",
      headers: { "Content-Type": "application/json" },
      body: JSON.stringify({
        model: "llama3.1:8b",
        prompt: SYSTEM_PROMPT + "\n" + prompt,
        stream: false,
        options: {
          temperature: 0.7,
          top_p: 0.9,
          max_tokens: 4000,
        },
      }),
    });

    console.log(
      "🔍 [DEBUG] askDeepSeek - Status da resposta:",
      response.status
    );

    if (!response.ok) {
      const errorText = await response.text();
      console.error("🔍 [DEBUG] askDeepSeek - Erro na resposta:", errorText);
      throw new Error(
        `Erro ao chamar Ollama: ${response.statusText} - ${errorText}`
      );
    }

    const data = await response.json();
    console.log("🔍 [DEBUG] askDeepSeek - Dados da resposta:", data);

    const result = data.response || data.message || "Sem resposta da IA.";
    console.log("🔍 [DEBUG] askDeepSeek - Resultado extraído:", result);

    return result;
  } catch (error) {
    console.error("🔍 [DEBUG] Erro na função askDeepSeek:", error);
    throw error;
  }
}

export async function askGemini(prompt: string): Promise<string> {
  // API Key do Gemini - pode precisar ser atualizada
  const apiKey = "AIzaSyDdA3LSU_tgx23NO0PU_5JWpCuzw3DIc5s";
  const endpoint =
    "https://generativelanguage.googleapis.com/v1beta/models/gemini-2.0-flash:generateContent";

  const body = {
    contents: [
      {
        parts: [{ text: prompt }],
      },
    ],
  };

  console.log("🔍 [DEBUG] askGemini - Iniciando chamada");
  console.log(
    "🔍 [DEBUG] askGemini - API Key:",
    apiKey ? "Presente" : "Ausente"
  );
  console.log("🔍 [DEBUG] askGemini - Endpoint:", endpoint);

  try {
    console.log("🔍 [DEBUG] askGemini - Fazendo requisição...");
    const res = await fetch(`${endpoint}?key=${apiKey}`, {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
      },
      body: JSON.stringify(body),
    });

    console.log("🔍 [DEBUG] askGemini - Status da resposta:", res.status);
    console.log(
      "🔍 [DEBUG] askGemini - Headers da resposta:",
      Object.fromEntries(res.headers.entries())
    );

    if (!res.ok) {
      const errorText = await res.text();
      console.error("🔍 [DEBUG] Erro na resposta:", errorText);

      // Se o Gemini falhar, tentar com DeepSeek como fallback
      console.log("🔍 [DEBUG] askGemini - Tentando fallback com DeepSeek...");
      try {
        const fallbackResponse = await askDeepSeek(prompt);
        console.log(
          "🔍 [DEBUG] askGemini - Fallback DeepSeek funcionou:",
          fallbackResponse
        );
        return fallbackResponse;
      } catch (fallbackError: any) {
        console.error(
          "🔍 [DEBUG] askGemini - Fallback também falhou:",
          fallbackError
        );
        throw new Error(
          "Erro ao chamar Gemini API: " +
            res.statusText +
            " - " +
            errorText +
            " | Fallback também falhou: " +
            (fallbackError?.message ||
              fallbackError?.toString() ||
              "Erro desconhecido")
        );
      }
    }

    const data = await res.json();
    console.log("🔍 [DEBUG] askGemini - Dados da resposta:", data);

    // A resposta vem em data.candidates[0].content.parts[0].text
    const result =
      data?.candidates?.[0]?.content?.parts?.[0]?.text ||
      data?.candidates?.[0]?.content?.parts?.[0] ||
      JSON.stringify(data);

    console.log("🔍 [DEBUG] askGemini - Resultado extraído:", result);

    if (!result || result.trim() === "") {
      console.log(
        "🔍 [DEBUG] askGemini - Resposta vazia, tentando fallback..."
      );
      const fallbackResponse = await askDeepSeek(prompt);
      return fallbackResponse;
    }

    return result;
  } catch (error) {
    console.error("🔍 [DEBUG] Erro na função askGemini:", error);

    // Se houver erro de rede ou outro problema, tentar DeepSeek
    console.log(
      "🔍 [DEBUG] askGemini - Erro geral, tentando fallback com DeepSeek..."
    );
    try {
      const fallbackResponse = await askDeepSeek(prompt);
      console.log(
        "🔍 [DEBUG] askGemini - Fallback DeepSeek funcionou após erro:",
        fallbackResponse
      );
      return fallbackResponse;
    } catch (fallbackError: any) {
      console.error(
        "🔍 [DEBUG] askGemini - Fallback também falhou após erro:",
        fallbackError
      );
      throw error; // Re-throw o erro original
    }
  }
}
