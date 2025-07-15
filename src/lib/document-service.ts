// Serviço de Gestão de Documentos Jurídicos
import { getTestUser } from "./test-data";
import {
  officeConfigAPI,
  OfficeConfig as APIOfficeConfig,
} from "./office-config-api";

// Função para determinar o título (Dr./Dra.) baseado no nome
const getLawyerTitle = (name: string): string => {
  // Se o nome já começa com Dr. ou Dra., retorna como está
  if (name.startsWith("Dr. ") || name.startsWith("Dra. ")) {
    return name;
  }

  // Lista de nomes femininos comuns para determinar Dra.
  const femaleNames = [
    "ana",
    "maria",
    "juliana",
    "camila",
    "fernanda",
    "patricia",
    "sandra",
    "lucia",
    "carla",
    "adriana",
    "vanessa",
    "daniela",
    "gabriela",
    "amanda",
    "carolina",
    "beatriz",
    "leticia",
    "mariana",
    "isabela",
    "sofia",
    "valentina",
    "laura",
    "clara",
    "alice",
    "helena",
    "luisa",
    "manuela",
    "cecilia",
    "agatha",
    "elisa",
    "lorena",
    "mirella",
    "melissa",
    "yasmin",
    "isabella",
    "rafaela",
    "giovanna",
    "sarah",
    "julia",
    "nicole",
    "victoria",
    "barbara",
    "debora",
    "elaine",
    "fatima",
    "gisele",
    "hilda",
    "irene",
    "josefa",
    "karen",
    "lilian",
    "marcia",
    "nadia",
    "olga",
    "paula",
    "quenia",
    "rosa",
    "silvia",
    "tatiana",
    "ursula",
    "vera",
    "wanda",
    "xenia",
    "yara",
    "zenaida",
  ];

  // Extrair o primeiro nome (antes do espaço)
  const firstName = name.toLowerCase().split(" ")[0];

  // Verificar se é um nome feminino
  if (femaleNames.includes(firstName)) {
    return `Dra. ${name}`;
  }

  // Padrão: usar Dr. para nomes masculinos ou não identificados
  return `Dr. ${name}`;
};
export interface LegalDocument {
  id: string;
  title: string;
  type: string;
  content: string;
  clientId: string;
  clientName: string;
  createdAt: Date;
  updatedAt: Date;
  status: "draft" | "finalized" | "archived";
  template: string;
  metadata: {
    causeValue: string;
    jurisdiction: string;
    theses: string[];
    blocks: string[];
    aiGenerated: boolean;
    confidence?: number;
    suggestions?: string[];
  };
  tags: string[];
  version: number;
}

export interface DocumentTemplate {
  id: string;
  name: string;
  category: string;
  content: string;
  variables: string[];
  isCustom: boolean;
  createdBy?: string;
  isNative?: boolean;
  fields?: string[];
}

// Interface para configurações do escritório
export interface OfficeConfig {
  lawyerName: string;
  oabNumber: string;
  oabState: string;
  officeAddress: string;
  officePhone: string;
  officeEmail: string;
  officeWebsite?: string;
  officeCnpj?: string;
  // Novos campos para templates
  officeName?: string;
  officeCity?: string;
  officeCep?: string;
  officeComplement?: string;
  officeNeighborhood?: string;
  officeNumber?: string;
  officeStreet?: string;
}

// Interface para configurações de template
export interface TemplateSettings {
  defaultFont: string;
  fontSize: string;
  lineSpacing: string;
  margins: string;
  includeWatermark: boolean;
}

export class DocumentService {
  private static instance: DocumentService;
  private documents: LegalDocument[] = [];
  private templates: DocumentTemplate[] = [];

  // Flag para controle de migração futura
  private useDatabase: boolean = true; // Ativado por padrão
  private databaseConfig: any = null;

  static getInstance(): DocumentService {
    if (!DocumentService.instance) {
      DocumentService.instance = new DocumentService();
    }
    return DocumentService.instance;
  }

  constructor() {
    this.loadFromStorage();
    this.initializeDefaultTemplates();
  }

  // Método para configurar migração para banco de dados (futuro)
  setDatabaseConfig(config: any): void {
    this.databaseConfig = config;
    this.useDatabase = true;
  }

  // Método para forçar recarregamento dos dados do localStorage
  forceReloadFromStorage(): void {
    console.log("=== DEBUG: forceReloadFromStorage ===");
    this.loadFromStorage();
    console.log("✅ Dados recarregados do localStorage");
    console.log("Documentos carregados:", this.documents.length);
    console.log("Templates carregados:", this.templates.length);
    console.log("=== FIM DEBUG: forceReloadFromStorage ===");
  }

  // Método para verificar sincronização com localStorage
  checkStorageSync(): boolean {
    try {
      const savedDocs = localStorage.getItem("legalai_documents");
      const savedTemplates = localStorage.getItem("legalai_templates");

      const docsFromStorage = savedDocs ? JSON.parse(savedDocs) : [];
      const templatesFromStorage = savedTemplates
        ? JSON.parse(savedTemplates)
        : [];

      const docsMatch =
        JSON.stringify(this.documents) === JSON.stringify(docsFromStorage);
      const templatesMatch =
        JSON.stringify(this.templates) === JSON.stringify(templatesFromStorage);

      console.log("=== DEBUG: checkStorageSync ===");
      console.log("Documentos sincronizados:", docsMatch);
      console.log("Templates sincronizados:", templatesMatch);
      console.log("=== FIM DEBUG: checkStorageSync ===");

      return docsMatch && templatesMatch;
    } catch (error) {
      console.error("❌ Erro ao verificar sincronização:", error);
      return false;
    }
  }

  // Método para mapear tipos de documento para o formato do banco
  private mapDocumentType(type: string): string {
    const typeMapping: { [key: string]: string } = {
      "Petição Inicial": "PETICAO",
      Contestação: "PETICAO",
      Recurso: "RECURSO",
      Defesa: "DEFESA",
      Parecer: "PARECER",
      "Contrato de Honorários": "CONTRATO",
      Contrato: "CONTRATO",
      Procuração: "PETICAO",
      "Procuração Ad Judicia": "PETICAO",
      Template: "TEMPLATE",
    };

    // Se o tipo exato não for encontrado, tentar encontrar por substring
    for (const [key, value] of Object.entries(typeMapping)) {
      if (type.toLowerCase().includes(key.toLowerCase())) {
        return value;
      }
    }

    // Padrão: PETICAO para tipos não mapeados
    return "PETICAO";
  }

  private loadFromStorage(): void {
    try {
      if (typeof window === "undefined") {
        console.log("⚠️ Executando no servidor, localStorage não disponível");
        return;
      }

      const savedDocs = localStorage.getItem("legalai_documents");
      if (savedDocs) {
        this.documents = JSON.parse(savedDocs).map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        }));
      }

      const savedTemplates = localStorage.getItem("legalai_templates");
      if (savedTemplates) {
        this.templates = JSON.parse(savedTemplates);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar documentos:", error);
    }
  }

  private saveToStorage(): void {
    try {
      if (typeof window === "undefined") {
        console.log("⚠️ Executando no servidor, localStorage não disponível");
        return;
      }

      const documentsJson = JSON.stringify(this.documents);
      const templatesJson = JSON.stringify(this.templates);

      console.log("=== DEBUG: saveToStorage ===");
      console.log("Documentos a salvar:", this.documents.length);
      console.log("Templates a salvar:", this.templates.length);
      console.log(
        "JSON dos documentos gerado:",
        documentsJson.length,
        "caracteres"
      );
      console.log(
        "JSON dos templates gerado:",
        templatesJson.length,
        "caracteres"
      );

      localStorage.setItem("legalai_documents", documentsJson);
      localStorage.setItem("legalai_templates", templatesJson);

      console.log("✅ Dados salvos no localStorage com sucesso");
      console.log("=== FIM DEBUG: saveToStorage ===");
    } catch (error) {
      console.error("❌ Erro ao salvar documentos:", error);
    }
  }

  private initializeDefaultTemplates(): void {
    if (this.templates.length === 0) {
      this.templates = [
        {
          id: "inicial-indenizacao",
          name: "Petição Inicial - Indenização",
          category: "Cível",
          content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA {{JURISDICTION}}

{{CLIENT_NAME}}, {{CLIENT_QUALIFICATION}}, por meio de seu advogado que esta subscreve, vem respeitosamente à presença de Vossa Excelência, propor a presente

PETIÇÃO INICIAL - AÇÃO DE INDENIZAÇÃO

em face de {{DEFENDANT_NAME}}, pelos fatos e fundamentos jurídicos a seguir expostos:

DOS FATOS

{{FACTS_DESCRIPTION}}

DO DIREITO

{{LEGAL_FUNDAMENTATION}}

DOS PEDIDOS

Diante do exposto, requer-se:

a) A citação da parte requerida para responder aos termos da presente ação;
b) A procedência total dos pedidos;
c) A condenação da requerida ao pagamento das custas processuais e honorários advocatícios.

Protesta provar o alegado por todos os meios de prova em direito admitidos.

Dá-se à causa o valor de {{CAUSE_VALUE}}.

Nestes termos, pede deferimento.

{{CITY}}, {{DATE}}.

{{LAWYER_NAME}}
OAB/{{STATE}} nº {{OAB_NUMBER}}`,
          variables: [
            "JURISDICTION",
            "CLIENT_NAME",
            "CLIENT_QUALIFICATION",
            "DEFENDANT_NAME",
            "FACTS_DESCRIPTION",
            "LEGAL_FUNDAMENTATION",
            "CAUSE_VALUE",
            "CITY",
            "DATE",
            "LAWYER_NAME",
            "STATE",
            "OAB_NUMBER",
          ],
          isCustom: false,
        },
        {
          id: "contestacao-civel",
          name: "Contestação Cível",
          category: "Cível",
          content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO DA {{JURISDICTION}}

{{CLIENT_NAME}}, {{CLIENT_QUALIFICATION}}, por meio de seu advogado que esta subscreve, vem respeitosamente à presença de Vossa Excelência, apresentar

CONTESTAÇÃO

nos autos da ação de {{ACTION_TYPE}} proposta por {{PLAINTIFF_NAME}}, pelos fundamentos a seguir expostos:

DOS FATOS

{{FACTS_DESCRIPTION}}

DO DIREITO

{{LEGAL_FUNDAMENTATION}}

DOS PEDIDOS

Diante do exposto, requer-se:

a) A improcedência total dos pedidos;
b) A condenação da parte autora ao pagamento das custas processuais e honorários advocatícios.

Protesta provar o alegado por todos os meios de prova em direito admitidos.

Nestes termos, pede deferimento.

{{CITY}}, {{DATE}}.

{{LAWYER_NAME}}
OAB/{{STATE}} nº {{OAB_NUMBER}}`,
          variables: [
            "JURISDICTION",
            "CLIENT_NAME",
            "CLIENT_QUALIFICATION",
            "ACTION_TYPE",
            "PLAINTIFF_NAME",
            "FACTS_DESCRIPTION",
            "LEGAL_FUNDAMENTATION",
            "CITY",
            "DATE",
            "LAWYER_NAME",
            "STATE",
            "OAB_NUMBER",
          ],
          isCustom: false,
        },
        {
          id: "contrato-honorarios",
          name: "Contrato de Honorários",
          category: "Contratos",
          content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS

Pelo presente instrumento particular, as partes abaixo qualificadas resolvem celebrar o presente contrato de prestação de serviços advocatícios, que se regerá pelas seguintes cláusulas e condições:

1. CONTRATANTE: {{cliente_nome}}, {{cliente_nacionalidade}}, portador do CPF nº {{cliente_cpf}}, residente e domiciliado na {{cliente_endereco}}.

2. CONTRATADO: {{advogado}}, inscrito na OAB/{{estado}} sob o nº {{oab}}, com escritório na {{endereco_escritorio}}.

3. OBJETO: O contratado se obriga a prestar serviços advocatícios relacionados a {{caso_tipo}}.

4. HONORÁRIOS: Os honorários advocatícios ficam fixados em R$ {{caso_valor}}, a serem pagos conforme acordado entre as partes.

5. PRAZO: Este contrato vigorará até o término do serviço contratado.

6. FORO: As partes elegem o foro da comarca de {{cliente_cidade}} para dirimir quaisquer dúvidas oriundas do presente contrato.

{{data_extenso}}.

{{cliente_nome}}                                    {{assinatura_completa}}
CPF: {{cliente_cpf}}                               {{escritorio}}
                                                    {{telefone}}
                                                    {{email}}`,
          variables: [
            "cliente_nome",
            "cliente_nacionalidade",
            "cliente_cpf",
            "cliente_endereco",
            "advogado",
            "estado",
            "oab",
            "endereco_escritorio",
            "caso_tipo",
            "caso_valor",
            "cliente_cidade",
            "data_extenso",
            "assinatura_completa",
            "escritorio",
            "telefone",
            "email",
          ],
          isCustom: false,
        },
        {
          id: "procuração-ad-judicia",
          name: "Procuração Ad Judicia",
          category: "Procurações",
          content: `PROCURAÇÃO

OUTORGANTE: {{cliente_nome}}, {{cliente_nacionalidade}}, {{cliente_estado_civil}}, {{cliente_profissao}}, inscrito no RG nº {{cliente_rg}}, inscrita no CPF sob o nº {{cliente_cpf}}, residente e domiciliada à {{cliente_endereco}}, constitui e nomeia seu bastante procurador:

OUTORGADO: {{advogado}}, inscrito na OAB/{{estado}} sob o n. {{oab}}, sócio do escritório de advocacia {{escritorio}}, pessoa jurídica de direito privado, inscrita no CNPJ n. {{cnpj}}, endereço eletrônico: {{email}}, localizada na {{endereco_escritorio}}.

OBJETO: representar o (s) Outorgante (s), promovendo a defesa dos seus direitos e interesses, podendo, para tanto, propor quaisquer ações, medidas incidentais, acompanhar os processos administrativos e/ou judiciais em qualquer Juízo, Instância, Tribunal, ou Repartição Pública.

PODERES: Por este instrumento particular de procuração, constituo meus bastantes procuradores os outorgados, concedendo-lhe os poderes inerentes da cláusula ad juditia et extra, para o foro em geral, judicial, administrativo e arbitral, , podendo, portanto, promover quaisquer medidas judiciais ou administrativas, assinar termo, oferecer defesa, direta ou indireta, interpor recursos, ajuizar ações e conduzir os respectivos processos, solicitar, providenciar e ter acesso a documentos de qualquer natureza, sendo o presente instrumento de mandato oneroso e contratual podendo substabelecer este a outrem, com ou sem reserva de poderes, dando tudo por bom e valioso, a fim de praticar todos os demais atos necessários ao fiel desempenho deste mandato.

PODERES ESPECÍFICOS: A presente procuração outorga aos Advogados acima descritos, os poderes especiais para receber citação, confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre que se funda a ação, firmar compromissos ou acordos, receber valores, dar e receber quitação, receber e dar quitação, levantar ou receber RPV e ALVARÁS, requerer a justiça gratuita e assinar declaração de hipossuficiência econômica, em conformidade com a norma do art. 105 da Lei 13.105/2015.

{{cliente_cidade}}/{{cliente_estado}}, {{data_extenso}}

Outorgante:

____________________________________
{{cliente_nome}}`,
          variables: [
            "cliente_nome",
            "cliente_nacionalidade",
            "cliente_estado_civil",
            "cliente_profissao",
            "cliente_rg",
            "cliente_cpf",
            "cliente_endereco",
            "advogado",
            "estado",
            "oab",
            "escritorio",
            "cnpj",
            "email",
            "endereco_escritorio",
            "cliente_cidade",
            "cliente_estado",
            "data_extenso",
          ],
          isCustom: false,
        },
      ];
      this.saveToStorage();
    }
  }

  // Criar novo documento
  async createDocument(data: {
    title: string;
    type: string;
    content: string;
    clientId: string;
    clientName: string;
    template: string;
    metadata: any;
  }): Promise<LegalDocument> {
    // Se useDatabase está ativado, usar API
    if (this.useDatabase) {
      try {
        // Obter token diretamente do localStorage
        if (typeof window === "undefined") {
          throw new Error("Executando no servidor");
        }

        const token = localStorage.getItem("legalai_token");
        if (!token) {
          throw new Error("Token de autenticação não encontrado");
        }

        const response = await fetch("/api/documents", {
          method: "POST",
          headers: {
            "Content-Type": "application/json",
            Authorization: `Bearer ${token}`,
          },
          body: JSON.stringify({
            title: data.title,
            content: data.content,
            type: this.mapDocumentType(data.type),
            area: data.metadata?.jurisdiction || "",
            status: "DRAFT",
            metadata: {
              causeValue: data.metadata.causeValue || "",
              jurisdiction: data.metadata.jurisdiction || "",
              theses: data.metadata.theses || [],
              blocks: data.metadata.blocks || [],
              aiGenerated: data.metadata.aiGenerated || false,
              confidence: data.metadata.confidence,
              suggestions: data.metadata.suggestions || [],
              clientId: data.clientId,
              clientName: data.clientName,
              template: data.template,
            },
          }),
        });

        if (!response.ok) {
          const errorText = await response.text();
          console.error("❌ Erro na API:", response.status, errorText);
          throw new Error(`Erro na API: ${response.status} - ${errorText}`);
        }

        const result = await response.json();

        if (result.success) {
          const document = {
            ...result.document,
            createdAt: new Date(result.document.createdAt),
            updatedAt: new Date(result.document.updatedAt),
          };

          this.documents.unshift(document);
          console.log("✅ Documento criado via API:", document.id);
          return document;
        } else {
          throw new Error(result.message || "Erro ao criar documento");
        }
      } catch (error) {
        console.error("❌ Erro ao criar documento via API:", error);
        // Fallback para localStorage
        console.log("🔄 Usando fallback localStorage");
      }
    }

    // Fallback para localStorage
    const document: LegalDocument = {
      id: `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: data.title,
      type: data.type,
      content: data.content,
      clientId: data.clientId,
      clientName: data.clientName,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "draft",
      template: data.template,
      metadata: {
        causeValue: data.metadata.causeValue || "",
        jurisdiction: data.metadata.jurisdiction || "",
        theses: data.metadata.theses || [],
        blocks: data.metadata.blocks || [],
        aiGenerated: data.metadata.aiGenerated || false,
        confidence: data.metadata.confidence,
        suggestions: data.metadata.suggestions || [],
      },
      tags: [],
      version: 1,
    };

    this.documents.push(document);
    this.saveToStorage();

    return document;
  }

  // Atualizar documento
  updateDocument(
    id: string,
    updates: Partial<LegalDocument>
  ): LegalDocument | null {
    const index = this.documents.findIndex((doc) => doc.id === id);
    if (index === -1) return null;

    this.documents[index] = {
      ...this.documents[index],
      ...updates,
      updatedAt: new Date(),
      version: this.documents[index].version + 1,
    };

    this.saveToStorage();
    return this.documents[index];
  }

  // Obter documento por ID
  getDocument(id: string): LegalDocument | null {
    return this.documents.find((doc) => doc.id === id) || null;
  }

  // Listar documentos
  getDocuments(filters?: {
    status?: string;
    type?: string;
    clientId?: string;
    search?: string;
  }): LegalDocument[] {
    let filtered = [...this.documents];

    if (filters?.status) {
      filtered = filtered.filter((doc) => doc.status === filters.status);
    }

    if (filters?.type) {
      filtered = filtered.filter((doc) => doc.type === filters.type);
    }

    if (filters?.clientId) {
      filtered = filtered.filter((doc) => doc.clientId === filters.clientId);
    }

    if (filters?.search) {
      const searchLower = filters.search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(searchLower) ||
          doc.content.toLowerCase().includes(searchLower) ||
          doc.clientName.toLowerCase().includes(searchLower)
      );
    }

    return filtered.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  // Excluir documento
  deleteDocument(id: string): boolean {
    const index = this.documents.findIndex((doc) => doc.id === id);
    if (index === -1) return false;

    this.documents.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Duplicar documento
  duplicateDocument(id: string): LegalDocument | null {
    const original = this.getDocument(id);
    if (!original) return null;

    const duplicated: LegalDocument = {
      ...original,
      id: `DOC_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      title: `${original.title} (Cópia)`,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "draft",
      version: 1,
    };

    this.documents.push(duplicated);
    this.saveToStorage();
    return duplicated;
  }

  // Exportar documento
  exportDocument(id: string, format: "pdf" | "docx" | "txt"): string {
    const document = this.getDocument(id);
    if (!document) throw new Error("Documento não encontrado");

    switch (format) {
      case "pdf":
        return this.generatePDF(document);
      case "docx":
        return this.generateDOCX(document);
      case "txt":
        return this.generateTXT(document);
      default:
        throw new Error("Formato não suportado");
    }
  }

  private generatePDF(document: LegalDocument): string {
    // Simulação de geração de PDF
    return `PDF gerado para: ${document.title}`;
  }

  private generateDOCX(document: LegalDocument): string {
    // Simulação de geração de DOCX
    return `DOCX gerado para: ${document.title}`;
  }

  private generateTXT(document: LegalDocument): string {
    return document.content;
  }

  // Gerenciar templates
  getTemplates(): DocumentTemplate[] {
    // Forçar sincronização com localStorage para garantir dados atualizados
    if (!this.useDatabase) {
      this.forceReloadFromStorage();
    }
    return this.templates;
  }

  // Método preparado para banco de dados (futuro)
  async getTemplatesFromDatabase(): Promise<DocumentTemplate[]> {
    if (!this.useDatabase || !this.databaseConfig) {
      throw new Error("Configuração de banco de dados não encontrada");
    }
    // TODO: Implementar consulta ao banco de dados
    return this.templates;
  }

  createTemplate(template: Omit<DocumentTemplate, "id">): DocumentTemplate {
    if (
      !template.content ||
      typeof template.content !== "string" ||
      template.content.trim() === ""
    ) {
      throw new Error("Conteúdo do template não pode ser vazio.");
    }
    const newTemplate: DocumentTemplate = {
      ...template,
      id: `TEMPLATE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
      isCustom: true,
    };
    this.templates.push(newTemplate);
    this.saveToStorage();
    return newTemplate;
  }

  updateTemplate(
    id: string,
    updates: Partial<DocumentTemplate>
  ): DocumentTemplate | null {
    console.log("=== DEBUG: updateTemplate ===");
    console.log("ID do template:", id);
    console.log("Updates:", updates);

    const index = this.templates.findIndex((t) => t.id === id);
    if (index === -1) {
      console.log("❌ Template não encontrado");
      return null;
    }

    // Preservar o ID e isCustom, mas atualizar o resto
    const updatedTemplate = {
      ...this.templates[index],
      ...updates,
      id: this.templates[index].id, // Garantir que o ID não seja alterado
      isCustom: true, // Sempre marcar como custom após edição
    };

    this.templates[index] = updatedTemplate;
    console.log("✅ Template atualizado no array local");

    this.saveToStorage();

    // Verificar se foi salvo corretamente
    const syncOk = this.checkStorageSync();
    console.log(
      "Sincronização após salvamento:",
      syncOk ? "✅ OK" : "❌ FALHOU"
    );

    console.log("=== FIM DEBUG: updateTemplate ===");
    return updatedTemplate;
  }

  // Método preparado para banco de dados (futuro)
  async updateTemplateInDatabase(
    id: string,
    updates: Partial<DocumentTemplate>
  ): Promise<DocumentTemplate | null> {
    if (!this.useDatabase || !this.databaseConfig) {
      throw new Error("Configuração de banco de dados não encontrada");
    }
    // TODO: Implementar atualização no banco de dados
    return this.updateTemplate(id, updates);
  }

  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex((t) => t.id === id);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    this.saveToStorage();
    return true;
  }

  // Estatísticas
  getStatistics(): {
    totalDocuments: number;
    documentsByStatus: Record<string, number>;
    documentsByType: Record<string, number>;
    recentActivity: number;
  } {
    const now = new Date();
    const thirtyDaysAgo = new Date(now.getTime() - 30 * 24 * 60 * 60 * 1000);

    const documentsByStatus: Record<string, number> = {};
    const documentsByType: Record<string, number> = {};
    let recentActivity = 0;

    this.documents.forEach((doc) => {
      // Por status
      documentsByStatus[doc.status] = (documentsByStatus[doc.status] || 0) + 1;

      // Por tipo
      documentsByType[doc.type] = (documentsByType[doc.type] || 0) + 1;

      // Atividade recente
      if (doc.updatedAt > thirtyDaysAgo) {
        recentActivity++;
      }
    });

    return {
      totalDocuments: this.documents.length,
      documentsByStatus,
      documentsByType,
      recentActivity,
    };
  }

  // Backup e restauração
  exportBackup(): string {
    return JSON.stringify({
      documents: this.documents,
      templates: this.templates,
      exportDate: new Date().toISOString(),
    });
  }

  importBackup(backupData: string): boolean {
    try {
      const data = JSON.parse(backupData);
      this.documents = data.documents.map((doc: any) => ({
        ...doc,
        createdAt: new Date(doc.createdAt),
        updatedAt: new Date(doc.updatedAt),
      }));
      this.templates = data.templates;
      this.saveToStorage();
      return true;
    } catch (error) {
      console.error("Erro ao importar backup:", error);
      return false;
    }
  }
}

export const documentService = DocumentService.getInstance();

// Funções auxiliares para migração futura para banco de dados
export const migrateToDatabase = async (
  databaseConfig: any
): Promise<boolean> => {
  try {
    console.log("=== INICIANDO MIGRAÇÃO PARA BANCO DE DADOS ===");

    // Configurar o serviço para usar banco de dados
    documentService.setDatabaseConfig(databaseConfig);

    // TODO: Implementar migração dos dados do localStorage para o banco
    // 1. Ler todos os documentos e templates do localStorage
    // 2. Inserir no banco de dados
    // 3. Verificar integridade dos dados
    // 4. Limpar localStorage após confirmação

    console.log("✅ Migração configurada com sucesso");
    return true;
  } catch (error) {
    console.error("❌ Erro na migração:", error);
    return false;
  }
};

export const exportForMigration = (): {
  documents: LegalDocument[];
  templates: DocumentTemplate[];
} => {
  return {
    documents: documentService.getDocuments(),
    templates: documentService.getTemplates(),
  };
};

// Funções para gerenciar configurações do escritório
export const getOfficeConfig = async (): Promise<OfficeConfig> => {
  try {
    // Tentar carregar da API primeiro
    const apiConfig = await officeConfigAPI.getConfig();
    console.log("✅ Configurações do escritório carregadas da API");

    // Converter formato da API para o formato local
    const localConfig: OfficeConfig = {
      lawyerName: apiConfig.lawyerName,
      oabNumber: apiConfig.oabNumber,
      oabState: apiConfig.oabState,
      officeAddress: apiConfig.officeAddress,
      officePhone: apiConfig.officePhone,
      officeEmail: apiConfig.officeEmail,
      officeWebsite: apiConfig.officeWebsite,
      officeCnpj: apiConfig.officeCnpj,
      officeName: apiConfig.officeName,
      officeCity: apiConfig.officeCity,
      officeCep: apiConfig.officeCep,
      officeComplement: apiConfig.officeComplement,
      officeNeighborhood: apiConfig.officeNeighborhood,
      officeNumber: apiConfig.officeNumber,
      officeStreet: apiConfig.officeStreet,
    };

    return localConfig;
  } catch (error) {
    console.log("⚠️ API não disponível, usando localStorage");

    // Fallback para localStorage
    const saved = localStorage.getItem("legalai_office_config");

    // Obter usuário logado
    const currentUser = localStorage.getItem("legalai_user");
    let loggedInUser = null;

    if (currentUser) {
      try {
        const userData = JSON.parse(currentUser);
        loggedInUser = getTestUser(userData.email);
      } catch (error) {
        console.error("Erro ao obter usuário logado:", error);
      }
    }

    if (saved) {
      try {
        const config = JSON.parse(saved);

        // Usar nome do usuário logado se disponível, senão usar o configurado
        const lawyerName = loggedInUser
          ? getLawyerTitle(loggedInUser.name)
          : config.lawyerName || "Dr. João Silva";

        // Garantir que todos os campos obrigatórios estejam presentes
        const result = {
          lawyerName: lawyerName,
          oabNumber: config.oabNumber || "123456",
          oabState: config.oabState || "SP",
          officeAddress:
            config.officeAddress ||
            "Rua das Flores, 123 - Centro, São Paulo/SP",
          officePhone: config.officePhone || "(11) 99999-9999",
          officeEmail: config.officeEmail || "contato@escritorio.com",
          officeWebsite: config.officeWebsite || "www.escritorio.com",
          officeCnpj: config.officeCnpj || "12.345.678/0001-90",
          officeName:
            config.officeName || "Escritório de Advocacia Silva & Associados",
          officeCity: config.officeCity || "São Paulo",
          officeCep: config.officeCep || "01234-567",
          officeComplement: config.officeComplement || "",
          officeNeighborhood: config.officeNeighborhood || "Centro",
          officeNumber: config.officeNumber || "123",
          officeStreet: config.officeStreet || "Rua das Flores",
        };

        return result;
      } catch (error) {
        console.error(
          "❌ Erro ao carregar configurações do escritório:",
          error
        );
      }
    }

    // Configuração padrão usando nome do usuário logado se disponível
    const defaultLawyerName = loggedInUser
      ? getLawyerTitle(loggedInUser.name)
      : "Dr. João Silva";

    const defaultConfig = {
      lawyerName: defaultLawyerName,
      oabNumber: "123456",
      oabState: "SP",
      officeAddress: "Rua das Flores, 123 - Centro, São Paulo/SP",
      officePhone: "(11) 99999-9999",
      officeEmail: "contato@escritorio.com",
      officeWebsite: "www.escritorio.com",
      officeCnpj: "12.345.678/0001-90",
      officeName: "Escritório de Advocacia Silva & Associados",
      officeCity: "São Paulo",
      officeCep: "01234-567",
      officeComplement: "",
      officeNeighborhood: "Centro",
      officeNumber: "123",
      officeStreet: "Rua das Flores",
    };

    return defaultConfig;
  }
};

export const saveOfficeConfig = async (
  config: OfficeConfig
): Promise<boolean> => {
  try {
    // Tentar salvar na API primeiro
    const apiData = {
      lawyerName: config.lawyerName,
      oabNumber: config.oabNumber,
      oabState: config.oabState,
      officeAddress: config.officeAddress,
      officePhone: config.officePhone,
      officeEmail: config.officeEmail,
      officeWebsite: config.officeWebsite,
      officeCnpj: config.officeCnpj,
      officeName: config.officeName,
      officeCity: config.officeCity,
      officeCep: config.officeCep,
      officeComplement: config.officeComplement,
      officeNeighborhood: config.officeNeighborhood,
      officeNumber: config.officeNumber,
      officeStreet: config.officeStreet,
    };

    await officeConfigAPI.updateConfig(apiData);
    console.log("✅ Configurações do escritório salvas na API");
    return true;
  } catch (error) {
    console.log("⚠️ API não disponível, salvando no localStorage");

    // Fallback para localStorage
    try {
      localStorage.setItem("legalai_office_config", JSON.stringify(config));
      console.log("✅ Configurações do escritório salvas no localStorage");
      return true;
    } catch (localError) {
      console.error("Erro ao salvar configurações do escritório:", localError);
      return false;
    }
  }
};

// Função para substituir variáveis do escritório em templates
export const replaceOfficeVariables = async (
  content: string
): Promise<string> => {
  const config = await getOfficeConfig();

  let result = content;

  // Testar cada substituição individualmente
  const replacements = [
    { pattern: /\{\{nome\}\}/gi, value: config.lawyerName, name: "nome" },
    {
      pattern: /\{\{advogado\}\}/gi,
      value: config.lawyerName,
      name: "advogado",
    },
    { pattern: /\{\{oab\}\}/gi, value: config.oabNumber, name: "oab" },
    { pattern: /\{\{estado\}\}/gi, value: config.oabState, name: "estado" },
    {
      pattern: /\{\{escritorio\}\}/gi,
      value: config.officeName || config.officeAddress,
      name: "escritorio",
    },
    {
      pattern: /\{\{endereco_escritorio\}\}/gi,
      value: config.officeAddress,
      name: "endereco_escritorio",
    },
    {
      pattern: /\{\{telefone\}\}/gi,
      value: config.officePhone,
      name: "telefone",
    },
    { pattern: /\{\{email\}\}/gi, value: config.officeEmail, name: "email" },
    {
      pattern: /\{\{website\}\}/gi,
      value: config.officeWebsite || "",
      name: "website",
    },
    { pattern: /\{\{cnpj\}\}/gi, value: config.officeCnpj || "", name: "cnpj" },
    {
      pattern: /\{\{cidade\}\}/gi,
      value: config.officeCity || "",
      name: "cidade",
    },
    { pattern: /\{\{cep\}\}/gi, value: config.officeCep || "", name: "cep" },
    {
      pattern: /\{\{assinatura_completa\}\}/gi,
      value: `${config.lawyerName}\nOAB/${config.oabState} nº ${config.oabNumber}`,
      name: "assinatura_completa",
    },
    {
      pattern: /\{\{oab_completa\}\}/gi,
      value: `OAB/${config.oabState} nº ${config.oabNumber}`,
      name: "oab_completa",
    },
  ];

  replacements.forEach(({ pattern, value, name }) => {
    const before = result;
    result = result.replace(pattern, value);
  });

  return result;
};

// Função para substituir variáveis do cliente em templates
export const replaceClientVariables = (
  content: string,
  client: any
): string => {
  if (!client) return content;

  return (
    content
      // Dados pessoais do cliente
      .replace(/\{\{cliente_nome\}\}/gi, client.name || "")
      .replace(/\{\{cliente_cpf\}\}/gi, client.cpf || "")
      .replace(/\{\{cliente_rg\}\}/gi, client.rg || "")
      .replace(/\{\{cliente_email\}\}/gi, client.email || "")
      .replace(/\{\{cliente_telefone\}\}/gi, client.phone || "")
      .replace(/\{\{cliente_nascimento\}\}/gi, client.birthDate || "")
      .replace(/\{\{cliente_estado_civil\}\}/gi, client.maritalStatus || "")
      .replace(/\{\{cliente_profissao\}\}/gi, client.profession || "")
      .replace(/\{\{cliente_nacionalidade\}\}/gi, client.nationality || "")

      // Endereço do cliente
      .replace(/\{\{cliente_endereco\}\}/gi, client.address || "")
      .replace(/\{\{cliente_cep\}\}/gi, client.cep || "")
      .replace(/\{\{cliente_rua\}\}/gi, client.street || "")
      .replace(/\{\{cliente_numero\}\}/gi, client.number || "")
      .replace(/\{\{cliente_complemento\}\}/gi, client.complement || "")
      .replace(/\{\{cliente_bairro\}\}/gi, client.neighborhood || "")
      .replace(/\{\{cliente_cidade\}\}/gi, client.city || "")
      .replace(/\{\{cliente_estado\}\}/gi, client.state || "")

      // Dados do caso
      .replace(/\{\{caso_tipo\}\}/gi, client.caseType || "")
      .replace(/\{\{caso_vara\}\}/gi, client.court || "")
      .replace(/\{\{caso_comarca\}\}/gi, client.judicialSection || "")
      .replace(/\{\{caso_processo\}\}/gi, client.processNumber || "")
      .replace(/\{\{caso_valor\}\}/gi, client.causeValue || "")
      .replace(/\{\{caso_urgencia\}\}/gi, client.urgency ? "URGENTE" : "")
      .replace(/\{\{caso_status\}\}/gi, client.caseStatus || "")

      // Parte contrária
      .replace(/\{\{parte_contraria_nome\}\}/gi, client.adversePartyName || "")
      .replace(/\{\{parte_contraria_cpf\}\}/gi, client.adversePartyCpf || "")
      .replace(
        /\{\{parte_contraria_endereco\}\}/gi,
        client.adversePartyAddress || ""
      )
      .replace(/\{\{parte_contraria_cep\}\}/gi, client.adversePartyCep || "")
      .replace(/\{\{parte_contraria_rua\}\}/gi, client.adversePartyStreet || "")
      .replace(
        /\{\{parte_contraria_numero\}\}/gi,
        client.adversePartyNumber || ""
      )
      .replace(
        /\{\{parte_contraria_complemento\}\}/gi,
        client.adversePartyComplement || ""
      )
      .replace(
        /\{\{parte_contraria_bairro\}\}/gi,
        client.adversePartyNeighborhood || ""
      )
      .replace(
        /\{\{parte_contraria_cidade\}\}/gi,
        client.adversePartyCity || ""
      )
      .replace(
        /\{\{parte_contraria_estado\}\}/gi,
        client.adversePartyState || ""
      )

      // Advogado da parte contrária
      .replace(
        /\{\{advogado_contrario_nome\}\}/gi,
        client.adverseLawyerName || ""
      )
      .replace(
        /\{\{advogado_contrario_oab\}\}/gi,
        client.adverseLawyerOAB || ""
      )
      .replace(
        /\{\{advogado_contrario_escritorio\}\}/gi,
        client.adverseLawyerOffice || ""
      )

      // Observações
      .replace(/\{\{observacoes\}\}/gi, client.observations || "")

      // Data atual
      .replace(/\{\{data\}\}/gi, new Date().toLocaleDateString("pt-BR"))
      .replace(
        /\{\{data_extenso\}\}/gi,
        new Date().toLocaleDateString("pt-BR", {
          day: "numeric",
          month: "long",
          year: "numeric",
        })
      )
  );
};

// Função para substituir todas as variáveis (escritório + cliente)
export const replaceAllVariables = async (
  content: string,
  client?: any
): Promise<string> => {
  let result = await replaceOfficeVariables(content);
  if (client) {
    result = replaceClientVariables(result, client);
  }
  return result;
};

// Funções para gerenciar configurações de template
export const getTemplateSettings = (): TemplateSettings => {
  const saved = localStorage.getItem("legalai_template_settings");
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (error) {
      console.error("Erro ao carregar configurações de template:", error);
    }
  }

  // Configuração padrão
  return {
    defaultFont: "Times New Roman",
    fontSize: "12",
    lineSpacing: "1.5",
    margins: "2.5cm",
    includeWatermark: false,
  };
};

export const saveTemplateSettings = (settings: TemplateSettings): boolean => {
  try {
    localStorage.setItem("legalai_template_settings", JSON.stringify(settings));
    return true;
  } catch (error) {
    console.error("Erro ao salvar configurações de template:", error);
    return false;
  }
};

// Função para aplicar formatação CSS baseada nas configurações
export const applyTemplateFormatting = (content: string): string => {
  // Esta função agora apenas retorna o conteúdo limpo
  // A formatação será aplicada apenas na visualização/exportação
  return content;
};

// Função para obter CSS de formatação (usada apenas na visualização)
export const getTemplateFormattingCSS = (): string => {
  const settings = getTemplateSettings();

  // Converter margens de cm para px (aproximadamente)
  const marginPx =
    settings.margins === "2.0cm"
      ? "75"
      : settings.margins === "2.5cm"
      ? "94"
      : settings.margins === "3.0cm"
      ? "113"
      : "94";

  return `
    body {
      font-family: "${settings.defaultFont}", serif;
      font-size: ${settings.fontSize}pt;
      line-height: ${settings.lineSpacing};
      margin: ${marginPx}px;
      text-align: justify;
    }
    .watermark {
      position: fixed;
      top: 50%;
      left: 50%;
      transform: translate(-50%, -50%) rotate(-45deg);
      opacity: 0.1;
      font-size: 48px;
      color: #ccc;
      pointer-events: none;
      z-index: -1;
    }
  `;
};
