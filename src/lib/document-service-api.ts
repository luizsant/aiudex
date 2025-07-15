// Serviço de Gestão de Documentos Jurídicos - Versão API
import { buildApiUrl } from "./config";

// Interfaces (mantidas as mesmas)
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

// Função para obter token de autenticação
const getAuthToken = (): string | null => {
  return localStorage.getItem("legalai_token");
};

// Função para fazer requisições autenticadas
const apiRequest = async (
  endpoint: string,
  options: RequestInit = {}
): Promise<any> => {
  const token = getAuthToken();

  if (!token) {
    throw new Error("Token de autenticação não encontrado");
  }

  const response = await fetch(buildApiUrl(endpoint), {
    ...options,
    headers: {
      "Content-Type": "application/json",
      Authorization: `Bearer ${token}`,
      ...options.headers,
    },
  });

  if (!response.ok) {
    const errorData = await response.json().catch(() => ({}));
    throw new Error(
      errorData.message || `Erro na requisição: ${response.status}`
    );
  }

  return response.json();
};

export class DocumentServiceAPI {
  private static instance: DocumentServiceAPI;
  private documents: LegalDocument[] = [];
  private templates: DocumentTemplate[] = [];
  private isLoading: boolean = false;

  static getInstance(): DocumentServiceAPI {
    if (!DocumentServiceAPI.instance) {
      DocumentServiceAPI.instance = new DocumentServiceAPI();
    }
    return DocumentServiceAPI.instance;
  }

  constructor() {
    this.loadDocuments();
    this.loadTemplates();
  }

  // ======================
  // DOCUMENTOS
  // ======================

  // Carregar documentos da API
  async loadDocuments(): Promise<void> {
    try {
      this.isLoading = true;
      const response = await apiRequest("/api/documents");

      if (response.success) {
        this.documents = response.documents.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        }));
        console.log(`✅ ${this.documents.length} documentos carregados da API`);
      }
    } catch (error) {
      console.error("❌ Erro ao carregar documentos:", error);
      // Fallback para localStorage se API falhar
      this.loadFromLocalStorage();
    } finally {
      this.isLoading = false;
    }
  }

  // Criar documento via API
  async createDocument(data: {
    title: string;
    type: string;
    content: string;
    clientId: string;
    clientName: string;
    template: string;
    metadata: any;
  }): Promise<LegalDocument> {
    try {
      const response = await apiRequest("/api/documents", {
        method: "POST",
        body: JSON.stringify({
          title: data.title,
          content: data.content,
          type: data.type,
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

      if (response.success) {
        const document = {
          ...response.document,
          createdAt: new Date(response.document.createdAt),
          updatedAt: new Date(response.document.updatedAt),
        };

        this.documents.unshift(document);
        console.log("✅ Documento criado via API:", document.id);
        return document;
      } else {
        throw new Error(response.message || "Erro ao criar documento");
      }
    } catch (error) {
      console.error("❌ Erro ao criar documento via API:", error);
      // Fallback para localStorage
      return this.createDocumentLocal(data);
    }
  }

  // Atualizar documento via API
  async updateDocument(
    id: string,
    updates: Partial<LegalDocument>
  ): Promise<LegalDocument | null> {
    try {
      const response = await apiRequest(`/api/documents/${id}`, {
        method: "PUT",
        body: JSON.stringify({
          title: updates.title,
          content: updates.content,
          type: updates.type,
          area: updates.metadata?.jurisdiction || "",
          status: updates.status,
          metadata: updates.metadata,
        }),
      });

      if (response.success) {
        const updatedDocument = {
          ...response.document,
          createdAt: new Date(response.document.createdAt),
          updatedAt: new Date(response.document.updatedAt),
        };

        const index = this.documents.findIndex((doc) => doc.id === id);
        if (index !== -1) {
          this.documents[index] = updatedDocument;
        }

        console.log("✅ Documento atualizado via API:", id);
        return updatedDocument;
      } else {
        throw new Error(response.message || "Erro ao atualizar documento");
      }
    } catch (error) {
      console.error("❌ Erro ao atualizar documento via API:", error);
      // Fallback para localStorage
      return this.updateDocumentLocal(id, updates);
    }
  }

  // Deletar documento via API
  async deleteDocument(id: string): Promise<boolean> {
    try {
      const response = await apiRequest(`/api/documents/${id}`, {
        method: "DELETE",
      });

      if (response.success) {
        this.documents = this.documents.filter((doc) => doc.id !== id);
        console.log("✅ Documento deletado via API:", id);
        return true;
      } else {
        throw new Error(response.message || "Erro ao deletar documento");
      }
    } catch (error) {
      console.error("❌ Erro ao deletar documento via API:", error);
      // Fallback para localStorage
      return this.deleteDocumentLocal(id);
    }
  }

  // Buscar documento específico
  async getDocument(id: string): Promise<LegalDocument | null> {
    try {
      const response = await apiRequest(`/api/documents/${id}`);

      if (response.success) {
        return {
          ...response.document,
          createdAt: new Date(response.document.createdAt),
          updatedAt: new Date(response.document.updatedAt),
        };
      }
      return null;
    } catch (error) {
      console.error("❌ Erro ao buscar documento via API:", error);
      return this.getDocumentLocal(id);
    }
  }

  // Listar documentos com filtros
  async getDocuments(filters?: {
    status?: string;
    type?: string;
    clientId?: string;
    search?: string;
  }): Promise<LegalDocument[]> {
    try {
      const queryParams = new URLSearchParams();
      if (filters?.status) queryParams.append("status", filters.status);
      if (filters?.type) queryParams.append("type", filters.type);
      if (filters?.search) queryParams.append("search", filters.search);

      const response = await apiRequest(`/api/documents?${queryParams}`);

      if (response.success) {
        return response.documents.map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        }));
      }
      return [];
    } catch (error) {
      console.error("❌ Erro ao listar documentos via API:", error);
      return this.getDocumentsLocal(filters);
    }
  }

  // ======================
  // TEMPLATES (ainda localStorage)
  // ======================

  // Carregar templates do localStorage (temporário)
  private loadTemplates(): void {
    try {
      const savedTemplates = localStorage.getItem("legalai_templates");
      if (savedTemplates) {
        this.templates = JSON.parse(savedTemplates);
      }
    } catch (error) {
      console.error("Erro ao carregar templates:", error);
    }
  }

  getTemplates(): DocumentTemplate[] {
    return this.templates;
  }

  createTemplate(template: Omit<DocumentTemplate, "id">): DocumentTemplate {
    const newTemplate: DocumentTemplate = {
      ...template,
      id: `TEMPLATE_${Date.now()}_${Math.random().toString(36).substr(2, 9)}`,
    };

    this.templates.push(newTemplate);
    this.saveTemplatesToStorage();
    return newTemplate;
  }

  updateTemplate(
    id: string,
    updates: Partial<DocumentTemplate>
  ): DocumentTemplate | null {
    const index = this.templates.findIndex((tpl) => tpl.id === id);
    if (index === -1) return null;

    this.templates[index] = {
      ...this.templates[index],
      ...updates,
    };

    this.saveTemplatesToStorage();
    return this.templates[index];
  }

  deleteTemplate(id: string): boolean {
    const index = this.templates.findIndex((tpl) => tpl.id === id);
    if (index === -1) return false;

    this.templates.splice(index, 1);
    this.saveTemplatesToStorage();
    return true;
  }

  private saveTemplatesToStorage(): void {
    try {
      localStorage.setItem("legalai_templates", JSON.stringify(this.templates));
    } catch (error) {
      console.error("Erro ao salvar templates:", error);
    }
  }

  // ======================
  // FALLBACK LOCALSTORAGE
  // ======================

  private loadFromLocalStorage(): void {
    try {
      const savedDocs = localStorage.getItem("legalai_documents");
      if (savedDocs) {
        this.documents = JSON.parse(savedDocs).map((doc: any) => ({
          ...doc,
          createdAt: new Date(doc.createdAt),
          updatedAt: new Date(doc.updatedAt),
        }));
      }
    } catch (error) {
      console.error("Erro ao carregar documentos do localStorage:", error);
    }
  }

  private createDocumentLocal(data: any): LegalDocument {
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
    this.saveToLocalStorage();
    return document;
  }

  private updateDocumentLocal(
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

    this.saveToLocalStorage();
    return this.documents[index];
  }

  private deleteDocumentLocal(id: string): boolean {
    const index = this.documents.findIndex((doc) => doc.id === id);
    if (index === -1) return false;

    this.documents.splice(index, 1);
    this.saveToLocalStorage();
    return true;
  }

  private getDocumentLocal(id: string): LegalDocument | null {
    return this.documents.find((doc) => doc.id === id) || null;
  }

  private getDocumentsLocal(filters?: any): LegalDocument[] {
    let filtered = [...this.documents];

    if (filters?.status) {
      filtered = filtered.filter((doc) => doc.status === filters.status);
    }

    if (filters?.type) {
      filtered = filtered.filter((doc) => doc.type === filters.type);
    }

    if (filters?.search) {
      const search = filters.search.toLowerCase();
      filtered = filtered.filter(
        (doc) =>
          doc.title.toLowerCase().includes(search) ||
          doc.content.toLowerCase().includes(search)
      );
    }

    return filtered.sort(
      (a, b) => b.updatedAt.getTime() - a.updatedAt.getTime()
    );
  }

  private saveToLocalStorage(): void {
    try {
      const documentsJson = JSON.stringify(this.documents);
      localStorage.setItem("legalai_documents", documentsJson);
    } catch (error) {
      console.error("Erro ao salvar documentos no localStorage:", error);
    }
  }

  // ======================
  // ESTATÍSTICAS
  // ======================

  getStatistics(): {
    totalDocuments: number;
    documentsByStatus: Record<string, number>;
    documentsByType: Record<string, number>;
    recentActivity: number;
  } {
    const totalDocuments = this.documents.length;
    const documentsByStatus: Record<string, number> = {};
    const documentsByType: Record<string, number> = {};
    const now = new Date();
    const oneWeekAgo = new Date(now.getTime() - 7 * 24 * 60 * 60 * 1000);

    this.documents.forEach((doc) => {
      documentsByStatus[doc.status] = (documentsByStatus[doc.status] || 0) + 1;
      documentsByType[doc.type] = (documentsByType[doc.type] || 0) + 1;
    });

    const recentActivity = this.documents.filter(
      (doc) => doc.updatedAt >= oneWeekAgo
    ).length;

    return {
      totalDocuments,
      documentsByStatus,
      documentsByType,
      recentActivity,
    };
  }

  // ======================
  // EXPORT/IMPORT
  // ======================

  exportBackup(): string {
    return JSON.stringify({
      documents: this.documents,
      templates: this.templates,
      timestamp: new Date().toISOString(),
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
      this.saveToLocalStorage();
      this.saveTemplatesToStorage();
      return true;
    } catch (error) {
      console.error("Erro ao importar backup:", error);
      return false;
    }
  }
}

// Instância singleton
export const documentServiceAPI = DocumentServiceAPI.getInstance();

// Funções auxiliares (mantidas para compatibilidade)
export const getOfficeConfig = (): OfficeConfig => {
  try {
    const saved = localStorage.getItem("legalai_office_config");
    return saved
      ? JSON.parse(saved)
      : {
          lawyerName: "",
          oabNumber: "",
          oabState: "",
          officeAddress: "",
          officePhone: "",
          officeEmail: "",
        };
  } catch (error) {
    console.error("Erro ao carregar configurações do escritório:", error);
    return {
      lawyerName: "",
      oabNumber: "",
      oabState: "",
      officeAddress: "",
      officePhone: "",
      officeEmail: "",
    };
  }
};

export const saveOfficeConfig = (config: OfficeConfig): boolean => {
  try {
    localStorage.setItem("legalai_office_config", JSON.stringify(config));
    return true;
  } catch (error) {
    console.error("Erro ao salvar configurações do escritório:", error);
    return false;
  }
};

export const getTemplateSettings = (): TemplateSettings => {
  try {
    const saved = localStorage.getItem("legalai_template_settings");
    return saved
      ? JSON.parse(saved)
      : {
          defaultFont: "Times New Roman",
          fontSize: "12pt",
          lineSpacing: "1.5",
          margins: "2.5cm",
          includeWatermark: false,
        };
  } catch (error) {
    console.error("Erro ao carregar configurações de template:", error);
    return {
      defaultFont: "Times New Roman",
      fontSize: "12pt",
      lineSpacing: "1.5",
      margins: "2.5cm",
      includeWatermark: false,
    };
  }
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
