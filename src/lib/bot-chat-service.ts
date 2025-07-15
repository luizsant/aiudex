import { askGemini, askDeepSeek } from "./ai-service";

export interface BotMessage {
  id: string;
  from: "user" | "bot";
  text: string;
  time: string;
  attachments?: Array<{
    name: string;
    type: string;
    content: string;
  }>;
}

export interface BotConversation {
  id: number;
  title: string;
  lastMsg: string;
  messages: BotMessage[];
}

export interface BotConfig {
  id: string;
  area: string;
  desc: string;
  features: string[];
  systemPrompt: string;
}

const botConfigs: Record<string, BotConfig> = {
  "direito-do-consumidor": {
    id: "direito-do-consumidor",
    area: "Direito do Consumidor",
    desc: "Especialista em relações de consumo, defesa do consumidor e práticas abusivas.",
    features: ["CDC", "Práticas Abusivas", "Defesa do Consumidor"],
    systemPrompt: `Você é um assistente jurídico especializado em Direito do Consumidor brasileiro. 
    
    Suas responsabilidades incluem:
    - Analisar casos de consumo e fornecer orientações jurídicas
    - Explicar direitos do consumidor conforme o Código de Defesa do Consumidor (CDC)
    - Identificar práticas abusivas e orientar sobre como proceder
    - Sugerir estratégias de defesa do consumidor
    - Explicar prazos, procedimentos e recursos disponíveis
    
    Sempre responda de forma clara, objetiva e fundamentada na legislação brasileira.
    Cite artigos relevantes quando apropriado.
    Seja prestativo e oriente sobre os próximos passos quando possível.`,
  },
  "direito-previdenciario": {
    id: "direito-previdenciario",
    area: "Direito Previdenciário",
    desc: "Apoio em benefícios, aposentadorias, revisões e cálculos previdenciários.",
    features: ["Aposentadoria", "Benefícios", "Revisões"],
    systemPrompt: `Você é um assistente jurídico especializado em Direito Previdenciário brasileiro.
    
    Suas responsabilidades incluem:
    - Orientar sobre tipos de aposentadoria e benefícios previdenciários
    - Explicar requisitos e prazos para benefícios
    - Analisar casos de revisão de benefícios
    - Orientar sobre cálculos previdenciários
    - Explicar procedimentos administrativos e judiciais
    
    Sempre responda de forma clara, objetiva e fundamentada na legislação previdenciária brasileira.
    Cite artigos relevantes quando apropriado.
    Seja prestativo e oriente sobre os próximos passos quando possível.`,
  },
  "direito-trabalhista": {
    id: "direito-trabalhista",
    area: "Direito Trabalhista",
    desc: "Consultas sobre CLT, rescisão, verbas, estabilidade e processos trabalhistas.",
    features: ["CLT", "Rescisão", "Verbas"],
    systemPrompt: `Você é um assistente jurídico especializado em Direito Trabalhista brasileiro.
    
    Suas responsabilidades incluem:
    - Orientar sobre direitos trabalhistas conforme a CLT
    - Explicar procedimentos de rescisão contratual
    - Calcular verbas rescisórias
    - Orientar sobre estabilidade e proteções trabalhistas
    - Explicar procedimentos de processos trabalhistas
    
    Sempre responda de forma clara, objetiva e fundamentada na legislação trabalhista brasileira.
    Cite artigos relevantes quando apropriado.
    Seja prestativo e oriente sobre os próximos passos quando possível.`,
  },
  "direito-administrativo": {
    id: "direito-administrativo",
    area: "Direito Administrativo",
    desc: "Especialista em licitações, servidores públicos, contratos e atos administrativos.",
    features: ["Licitações", "Servidores", "Contratos"],
    systemPrompt: `Você é um assistente jurídico especializado em Direito Administrativo brasileiro.
    
    Suas responsabilidades incluem:
    - Orientar sobre procedimentos licitatórios
    - Explicar direitos e deveres de servidores públicos
    - Analisar contratos administrativos
    - Orientar sobre atos administrativos e recursos
    - Explicar controle de constitucionalidade e legalidade
    
    Sempre responda de forma clara, objetiva e fundamentada na legislação administrativa brasileira.
    Cite artigos relevantes quando apropriado.
    Seja prestativo e oriente sobre os próximos passos quando possível.`,
  },
  "direito-tributario": {
    id: "direito-tributario",
    area: "Direito Tributário",
    desc: "Consultas sobre impostos, execuções fiscais, planejamento e defesas tributárias.",
    features: ["Impostos", "Execuções", "Planejamento"],
    systemPrompt: `Você é um assistente jurídico especializado em Direito Tributário brasileiro.
    
    Suas responsabilidades incluem:
    - Orientar sobre tipos de impostos e obrigações tributárias
    - Explicar procedimentos de execução fiscal
    - Orientar sobre planejamento tributário legal
    - Explicar defesas e recursos tributários
    - Analisar casos de tributação e isenções
    
    Sempre responda de forma clara, objetiva e fundamentada na legislação tributária brasileira.
    Cite artigos relevantes quando apropriado.
    Seja prestativo e oriente sobre os próximos passos quando possível.`,
  },
  "direito-empresarial": {
    id: "direito-empresarial",
    area: "Direito Empresarial",
    desc: "Apoio em contratos, sociedades, falências, recuperações e compliance.",
    features: ["Contratos", "Sociedades", "Falências"],
    systemPrompt: `Você é um assistente jurídico especializado em Direito Empresarial brasileiro.
    
    Suas responsabilidades incluem:
    - Orientar sobre tipos de sociedades empresariais
    - Analisar contratos empresariais
    - Explicar procedimentos de falência e recuperação judicial
    - Orientar sobre compliance e governança corporativa
    - Explicar direitos e obrigações empresariais
    
    Sempre responda de forma clara, objetiva e fundamentada na legislação empresarial brasileira.
    Cite artigos relevantes quando apropriado.
    Seja prestativo e oriente sobre os próximos passos quando possível.`,
  },
  "direito-civil": {
    id: "direito-civil",
    area: "Direito Civil",
    desc: "Especialista em contratos, família, sucessões, responsabilidade civil e obrigações.",
    features: ["Contratos", "Família", "Sucessões"],
    systemPrompt: `Você é um assistente jurídico especializado em Direito Civil brasileiro.
    
    Suas responsabilidades incluem:
    - Orientar sobre contratos civis e obrigações
    - Explicar direito de família e sucessões
    - Analisar casos de responsabilidade civil
    - Orientar sobre direitos reais e posse
    - Explicar procedimentos civis e prazos
    
    Sempre responda de forma clara, objetiva e fundamentada no Código Civil brasileiro.
    Cite artigos relevantes quando apropriado.
    Seja prestativo e oriente sobre os próximos passos quando possível.`,
  },
  "direito-constitucional": {
    id: "direito-constitucional",
    area: "Direito Constitucional",
    desc: "Consultas sobre direitos fundamentais, controle de constitucionalidade e ações constitucionais.",
    features: ["Direitos Fundamentais", "Controle", "Ações"],
    systemPrompt: `Você é um assistente jurídico especializado em Direito Constitucional brasileiro.
    
    Suas responsabilidades incluem:
    - Explicar direitos fundamentais e garantias constitucionais
    - Orientar sobre controle de constitucionalidade
    - Explicar ações constitucionais (ADPF, ADI, etc.)
    - Analisar casos de violação de direitos constitucionais
    - Orientar sobre princípios constitucionais
    
    Sempre responda de forma clara, objetiva e fundamentada na Constituição Federal brasileira.
    Cite artigos relevantes quando apropriado.
    Seja prestativo e oriente sobre os próximos passos quando possível.`,
  },
};

export class BotChatService {
  private static instance: BotChatService;

  static getInstance(): BotChatService {
    if (!BotChatService.instance) {
      BotChatService.instance = new BotChatService();
    }
    return BotChatService.instance;
  }

  getBotConfig(botId: string): BotConfig {
    return botConfigs[botId] || botConfigs["direito-civil"];
  }

  async sendMessage(
    botId: string,
    userMessage: string,
    conversationHistory: BotMessage[] = []
  ): Promise<string> {
    try {
      const botConfig = this.getBotConfig(botId);

      // Construir o prompt com contexto
      const context =
        conversationHistory.length > 0
          ? `\n\nHistórico da conversa:\n${conversationHistory
              .slice(-5) // Últimas 5 mensagens para contexto
              .map(
                (msg) =>
                  `${msg.from === "user" ? "Usuário" : "Assistente"}: ${
                    msg.text
                  }`
              )
              .join("\n")}`
          : "";

      const fullPrompt = `${botConfig.systemPrompt}

${context}

Usuário: ${userMessage}

Assistente:`;

      console.log("🤖 [BOT] Enviando mensagem para IA:", {
        botId,
        userMessage: userMessage.substring(0, 100) + "...",
        historyLength: conversationHistory.length,
      });

      // Tentar Gemini primeiro, com fallback para DeepSeek
      try {
        const response = await askGemini(fullPrompt);
        console.log("🤖 [BOT] Resposta do Gemini recebida");
        return response;
      } catch (geminiError) {
        console.log("🤖 [BOT] Gemini falhou, tentando DeepSeek:", geminiError);
        const fallbackResponse = await askDeepSeek(fullPrompt);
        console.log("🤖 [BOT] Resposta do DeepSeek recebida");
        return fallbackResponse;
      }
    } catch (error) {
      console.error("🤖 [BOT] Erro ao processar mensagem:", error);
      return "Desculpe, ocorreu um erro ao processar sua mensagem. Tente novamente em alguns instantes.";
    }
  }

  async processFile(
    botId: string,
    file: File,
    userMessage: string = "Analise este documento"
  ): Promise<string> {
    try {
      const botConfig = this.getBotConfig(botId);
      let fileContent = "";

      // Extrair conteúdo do arquivo baseado no tipo
      if (file.type === "application/pdf") {
        fileContent = await this.extractPdfContent(file);
      } else if (file.type.includes("image")) {
        fileContent = await this.extractImageContent(file);
      } else if (file.type.includes("word")) {
        fileContent = await this.extractWordContent(file);
      } else {
        fileContent = await this.extractTextContent(file);
      }

      const prompt = `${botConfig.systemPrompt}

O usuário enviou um documento para análise. Aqui está o conteúdo extraído:

${fileContent}

Usuário: ${userMessage}

Analise o documento e responda de acordo com sua especialização em ${botConfig.area}.

Assistente:`;

      console.log("🤖 [BOT] Processando arquivo:", {
        fileName: file.name,
        fileType: file.type,
        contentLength: fileContent.length,
      });

      try {
        const response = await askGemini(prompt);
        return response;
      } catch (geminiError) {
        console.log(
          "🤖 [BOT] Gemini falhou no processamento de arquivo, tentando DeepSeek"
        );
        const fallbackResponse = await askDeepSeek(prompt);
        return fallbackResponse;
      }
    } catch (error) {
      console.error("🤖 [BOT] Erro ao processar arquivo:", error);
      return "Desculpe, ocorreu um erro ao processar o arquivo. Verifique se o formato é suportado e tente novamente.";
    }
  }

  private async extractPdfContent(file: File): Promise<string> {
    // Implementação simplificada - em produção usar biblioteca PDF
    return `[Conteúdo do PDF: ${file.name}]`;
  }

  private async extractImageContent(file: File): Promise<string> {
    // Implementação simplificada - em produção usar OCR
    return `[Conteúdo da imagem: ${file.name}]`;
  }

  private async extractWordContent(file: File): Promise<string> {
    // Implementação simplificada - em produção usar biblioteca Word
    return `[Conteúdo do documento Word: ${file.name}]`;
  }

  private async extractTextContent(file: File): Promise<string> {
    return await file.text();
  }

  // Funções auxiliares para gerenciar conversas
  saveConversation(botId: string, conversation: BotConversation): void {
    if (typeof window !== "undefined") {
      try {
        const key = `bot_convs_${botId}`;
        const existing = this.loadConversations(botId);
        const updated = existing.map((c) =>
          c.id === conversation.id ? conversation : c
        );
        localStorage.setItem(key, JSON.stringify(updated));
        console.log("🤖 [BOT] Conversa salva:", {
          botId,
          conversationId: conversation.id,
        });
      } catch (error) {
        console.error("🤖 [BOT] Erro ao salvar conversa:", error);
      }
    }
  }

  loadConversations(botId: string): BotConversation[] {
    if (typeof window !== "undefined") {
      try {
        const saved = localStorage.getItem(`bot_convs_${botId}`);
        if (saved) {
          const parsed = JSON.parse(saved);
          console.log("🤖 [BOT] Conversas carregadas:", parsed);
          return Array.isArray(parsed) ? parsed : [];
        }
      } catch (error) {
        console.error("🤖 [BOT] Erro ao carregar conversas:", error);
      }
      return [];
    }
    return [];
  }

  deleteConversation(botId: string, conversationId: number): void {
    if (typeof window !== "undefined") {
      const conversations = this.loadConversations(botId);
      const filtered = conversations.filter((c) => c.id !== conversationId);
      localStorage.setItem(`bot_convs_${botId}`, JSON.stringify(filtered));
    }
  }
}

export const botChatService = BotChatService.getInstance();
