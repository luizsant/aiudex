import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Textarea } from "@/components/ui/textarea";
import {
  FileText,
  Search,
  Plus,
  Filter,
  Download,
  Eye,
  Edit3,
  Trash2,
  Calendar,
  User,
  Tag,
  Bot,
  Crown,
  Star,
  Zap,
  FileDown,
  Settings,
  Users,
  Building,
  FileCheck,
  Clock,
  CheckCircle,
  AlertCircle,
  Play,
  Copy,
  Share2,
  Save,
  X,
  FileEdit,
  Sparkles,
  PenTool,
  Bug,
  RotateCcw,
  ChevronUp,
  ChevronDown,
  BookOpen,
} from "lucide-react";
import { DocumentManager } from "@/components/DocumentManager";
// import { DigitalSignature } from "@/components/DigitalSignature";
import {
  documentService,
  LegalDocument,
  DocumentTemplate,
  getOfficeConfig,
  replaceOfficeVariables,
  applyTemplateFormatting,
} from "@/lib/document-service";
import { paymentService } from "@/lib/payment-service";
import { legalAI } from "@/lib/ai-service";
import { exportService } from "@/lib/export-service";
import { clientsService } from "@/lib/clients-service";
import { useRouter } from "next/navigation";
import { useToast } from "@/hooks/use-toast";
import {
  Command,
  CommandEmpty,
  CommandGroup,
  CommandInput,
  CommandItem,
  CommandList,
} from "@/components/ui/command";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import { Check, ChevronsUpDown } from "lucide-react";
import { cn } from "@/lib/utils";
import { testOfficeVariables } from "@/lib/test-variables";
import { PageHeader } from "@/components/PageHeader";

export default function Documents() {
  const router = useRouter();
  const { toast } = useToast();
  const [showDocumentManager, setShowDocumentManager] = useState(false);
  const [showAutomationModal, setShowAutomationModal] = useState(false);
  const [showTemplateEditor, setShowTemplateEditor] = useState(false);
  const [showDocumentPreview, setShowDocumentPreview] = useState(false);
  const [showDocumentEditor, setShowDocumentEditor] = useState(false);
  const [showAutomationTemplateEditor, setShowAutomationTemplateEditor] =
    useState(false);
  const [showTemplateModal, setShowTemplateModal] = useState(false);
  const [showManual, setShowManual] = useState(false);
  const [searchTerm, setSearchTerm] = useState("");
  const [recentDocuments, setRecentDocuments] = useState<LegalDocument[]>([]);
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [selectedClient, setSelectedClient] = useState<string>("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [templates, setTemplates] = useState<DocumentTemplate[]>([]);
  const [editingTemplate, setEditingTemplate] =
    useState<DocumentTemplate | null>(null);
  const [templateForm, setTemplateForm] = useState({
    name: "",
    category: "",
    content: "",
    variables: [] as string[],
  });
  const [editingDocument, setEditingDocument] = useState<LegalDocument | null>(
    null
  );
  const [documentEditForm, setDocumentEditForm] = useState({
    title: "",
    content: "",
  });
  const [shouldReturnToPreview, setShouldReturnToPreview] = useState(false);
  const [previewDocument, setPreviewDocument] = useState<LegalDocument | null>(
    null
  );
  const [activeTab, setActiveTab] = useState("documents");
  const [automationTemplates, setAutomationTemplates] = useState<any[]>([]);

  // Verificar assinatura atual
  const currentSubscription = paymentService.getCurrentSubscription();
  const hasPremiumAccess = paymentService.hasPremiumAccess();

  // Carregar dados iniciais
  useEffect(() => {
    loadDocuments();
    loadTemplates();
    loadAutomationTemplates();

    // Migrar documentos com status "draft" para "finalized"
    const migrateDraftDocuments = () => {
      const allDocs = documentService.getDocuments();
      const draftDocs = allDocs.filter((doc) => doc.status === "draft");

      if (draftDocs.length > 0) {
        console.log(
          `Migrando ${draftDocs.length} documentos de draft para finalized`
        );
        draftDocs.forEach((doc) => {
          documentService.updateDocument(doc.id, {
            status: "finalized",
            updatedAt: new Date(),
          });
        });
        loadDocuments(); // Recarregar após migração
      }
    };

    migrateDraftDocuments();
  }, []);

  // Carregar templates de automação
  const loadAutomationTemplates = () => {
    const templates = getAutomationTemplates();
    setAutomationTemplates(templates);
    console.log("✅ Templates de automação carregados:", templates.length);
  };

  const loadDocuments = () => {
    console.log("Carregando documentos...");
    const allDocs = documentService.getDocuments();
    console.log("Total de documentos encontrados:", allDocs.length);
    console.log(
      "Documentos:",
      allDocs.map((d) => ({ id: d.id, title: d.title, type: d.type }))
    );

    const docs = allDocs.slice(0, 6);
    setRecentDocuments(docs);
    console.log("Documentos recentes definidos:", docs.length);
  };

  const loadTemplates = () => {
    console.log("=== DEBUG: loadTemplates ===");
    try {
      console.log("Chamando documentService.getTemplates()...");

      // Forçar sincronização antes de carregar
      documentService.forceReloadFromStorage();

      const allTemplates = documentService.getTemplates();
      console.log("Templates carregados:", allTemplates.length);
      console.log(
        "Templates:",
        allTemplates.map((t) => ({
          id: t.id,
          name: t.name,
          isCustom: t.isCustom,
        }))
      );

      // Verificar sincronização após carregamento
      const syncOk = documentService.checkStorageSync();
      console.log(
        "Sincronização após carregamento:",
        syncOk ? "✅ OK" : "❌ FALHOU"
      );

      setTemplates(allTemplates);
      console.log("✅ Templates definidos no estado");
    } catch (error) {
      console.error("❌ Erro ao carregar templates:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "Sem stack trace"
      );
      setTemplates([]);
    }
  };

  // Função para salvar template (padrão ou personalizado)
  const handleSaveTemplate = () => {
    if (!templateForm.name || !templateForm.content) {
      toast({
        title: "Campos obrigatórios",
        description: "Nome e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }
    try {
      // Extrair variáveis automaticamente do conteúdo
      const variables =
        templateForm.content
          .match(/\{\{([^}]+)\}\}/g)
          ?.map((match) => match.replace(/\{\{|\}\}/g, ""))
          .filter((v, i, arr) => arr.indexOf(v) === i) || [];
      const templateData = {
        ...templateForm,
        variables,
        template: templateForm.content, // garantir campo template atualizado
        isCustom: editingTemplate ? editingTemplate.isCustom : true,
      };
      if (editingTemplate) {
        if (editingTemplate.isNative) {
          const overrides = JSON.parse(
            localStorage.getItem("legalai_template_overrides") || "{}"
          );
          const nativeTemplate = getAutomationTemplates().find(
            (tpl) => tpl.name === editingTemplate.name && tpl.isNative
          );
          if (nativeTemplate) {
            overrides[editingTemplate.name] = {
              ...nativeTemplate,
              ...templateData,
              icon: nativeTemplate.icon,
              color: nativeTemplate.color,
              bgColor: nativeTemplate.bgColor,
              estimatedTime: nativeTemplate.estimatedTime,
              isNative: true,
            };
          } else {
            overrides[editingTemplate.name] = {
              ...templateData,
              isNative: true,
            };
          }
          localStorage.setItem(
            "legalai_template_overrides",
            JSON.stringify(overrides)
          );
          toast({
            title: "✅ Template padrão sobrescrito!",
            description: "O template padrão foi atualizado.",
          });
        } else {
          documentService.updateTemplate(editingTemplate.id, templateData);
          toast({
            title: "✅ Template atualizado!",
            description: "O template foi atualizado com sucesso.",
          });
        }
      } else {
        documentService.createTemplate(templateData);
        toast({
          title: "✅ Template criado!",
          description: "O template foi criado com sucesso.",
        });
      }
      setShowTemplateEditor(false);
      setEditingTemplate(null);
      setTemplateForm({ name: "", category: "", content: "", variables: [] });
      loadTemplates(); // recarregar imediatamente
      loadAutomationTemplates(); // recarregar templates de automação
    } catch (error) {
      console.error("Erro ao salvar template:", error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar o template. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para salvar template padrão da automação (NÃO cria novo card)
  const handleSaveAutomationTemplate = () => {
    console.log("=== DEBUG: handleSaveAutomationTemplate ===");
    console.log("templateForm:", templateForm);
    console.log("editingTemplate:", editingTemplate);

    if (!templateForm.name || !templateForm.content) {
      console.log("❌ Campos obrigatórios não preenchidos");
      console.log("name:", templateForm.name);
      console.log("content:", templateForm.content);
      toast({
        title: "Campos obrigatórios",
        description: "Nome e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      console.log("✅ Campos obrigatórios preenchidos");

      // Verificar se o localStorage está disponível
      if (typeof localStorage === "undefined") {
        throw new Error("localStorage não está disponível");
      }

      const variables =
        templateForm.content
          .match(/\{\{([^}]+)\}\}/g)
          ?.map((match) => match.replace(/\{\{|\}\}/g, ""))
          .filter((v, i, arr) => arr.indexOf(v) === i) || [];

      console.log("Variáveis extraídas:", variables);

      const templateData = {
        name: templateForm.name,
        category: templateForm.category || templateForm.name,
        content: templateForm.content,
        template: templateForm.content, // garantir campo template atualizado
        variables: variables,
        fields: variables, // garantir compatibilidade
        isCustom: false,
      };

      console.log("Template data preparado:", templateData);

      // Verificar se conseguimos ler o localStorage
      let overrides: Record<string, any> = {};
      try {
        const savedOverrides = localStorage.getItem(
          "legalai_template_overrides"
        );
        console.log("Overrides salvos no localStorage:", savedOverrides);
        overrides = savedOverrides ? JSON.parse(savedOverrides) : {};
        console.log("Overrides parseados:", overrides);
      } catch (parseError) {
        console.error("❌ Erro ao parsear overrides:", parseError);
        overrides = {};
      }

      console.log("Overrides atuais:", overrides);

      // Buscar template nativo diretamente dos templates fixos
      const fixedTemplates = [
        {
          id: "procuração",
          name: "Procuração Ad Judicia",
          icon: FileCheck,
          color: "text-blue-600",
          bgColor: "bg-blue-100",
          estimatedTime: "2 min",
        },
        {
          id: "contrato_honorarios",
          name: "Contrato de Honorários",
          icon: FileText,
          color: "text-green-600",
          bgColor: "bg-green-100",
          estimatedTime: "3 min",
        },
        {
          id: "termo_compromisso",
          name: "Termo de Compromisso",
          icon: CheckCircle,
          color: "text-purple-600",
          bgColor: "bg-purple-100",
          estimatedTime: "2 min",
        },
        {
          id: "declaracao",
          name: "Declaração",
          icon: FileText,
          color: "text-orange-600",
          bgColor: "bg-orange-100",
          estimatedTime: "1 min",
        },
      ];

      const nativeTemplate = fixedTemplates.find(
        (tpl) => tpl.name === templateForm.name
      );

      console.log("Template nativo encontrado:", nativeTemplate);

      if (nativeTemplate) {
        overrides[templateForm.name] = {
          ...nativeTemplate,
          ...templateData,
          icon: nativeTemplate.icon,
          color: nativeTemplate.color,
          bgColor: nativeTemplate.bgColor,
          estimatedTime: nativeTemplate.estimatedTime,
          isNative: true,
        };
      } else {
        overrides[templateForm.name] = {
          ...templateData,
          isNative: true,
        };
      }

      console.log("Overrides atualizados:", overrides);

      // Verificar se conseguimos serializar os dados
      const overridesJson = JSON.stringify(overrides);
      console.log(
        "Overrides serializados:",
        overridesJson.length,
        "caracteres"
      );

      // Tentar salvar no localStorage
      try {
        localStorage.setItem("legalai_template_overrides", overridesJson);
        console.log("✅ Overrides salvos no localStorage com sucesso");

        // Verificar se foi salvo corretamente
        const savedData = localStorage.getItem("legalai_template_overrides");
        console.log("Dados salvos verificados:", savedData ? "OK" : "ERRO");
      } catch (saveError) {
        console.error("❌ Erro ao salvar no localStorage:", saveError);
        const errorMessage =
          saveError instanceof Error ? saveError.message : "Erro desconhecido";
        throw new Error(`Erro ao salvar no localStorage: ${errorMessage}`);
      }

      toast({
        title: "✅ Template padrão atualizado!",
        description: "O template foi salvo com sucesso.",
      });

      setShowAutomationTemplateEditor(false);
      setEditingTemplate(null);
      setTemplateForm({ name: "", category: "", content: "", variables: [] });
      loadTemplates();
      loadAutomationTemplates();
    } catch (error) {
      console.error("❌ Erro ao salvar template padrão:", error);
      const errorMessage =
        error instanceof Error ? error.message : "Erro desconhecido";
      console.error(
        "Stack trace:",
        error instanceof Error ? error.stack : "Sem stack trace"
      );
      toast({
        title: "❌ Erro ao salvar",
        description: `Não foi possível salvar o template: ${errorMessage}`,
        variant: "destructive",
      });
    }
  };

  // Ao carregar os templates, aplicar overrides dos padrões
  const getAutomationTemplates = () => {
    console.log("=== DEBUG: getAutomationTemplates ===");

    // Templates nativos (fixos)
    const fixed = [
      {
        id: "procuração",
        name: "Procuração Ad Judicia",
        description: "Procuração padrão para representação judicial",
        icon: FileCheck,
        color: "text-blue-600",
        bgColor: "bg-blue-100",
        fields: [
          "cliente_nome",
          "cliente_cpf",
          "cliente_rg",
          "cliente_endereco",
          "cliente_telefone",
        ],
        estimatedTime: "2 min",
        template: `PROCURAÇÃO

OUTORGANTE: {{cliente_nome}}, {{cliente_nacionalidade}}, {{cliente_estado_civil}}, {{cliente_profissao}}, inscrito no RG nº {{cliente_rg}}, inscrita no CPF sob o nº {{cliente_cpf}}, residente e domiciliada à {{cliente_endereco}}, constitui e nomeia seu bastante procurador:

OUTORGADO: {{advogado}}, inscrito na OAB/{{estado}} sob o n. {{oab}}, sócio do escritório de advocacia {{escritorio}}, pessoa jurídica de direito privado, inscrita no CNPJ n. {{cnpj}}, endereço eletrônico: {{email}}, localizada na {{endereco_escritorio}}.

OBJETO: representar o (s) Outorgante (s), promovendo a defesa dos seus direitos e interesses, podendo, para tanto, propor quaisquer ações, medidas incidentais, acompanhar os processos administrativos e/ou judiciais em qualquer Juízo, Instância, Tribunal, ou Repartição Pública.

PODERES: Por este instrumento particular de procuração, constituo meus bastantes procuradores os outorgados, concedendo-lhe os poderes inerentes da cláusula ad juditia et extra, para o foro em geral, judicial, administrativo e arbitral, , podendo, portanto, promover quaisquer medidas judiciais ou administrativas, assinar termo, oferecer defesa, direta ou indireta, interpor recursos, ajuizar ações e conduzir os respectivos processos, solicitar, providenciar e ter acesso a documentos de qualquer natureza, sendo o presente instrumento de mandato oneroso e contratual podendo substabelecer este a outrem, com ou sem reserva de poderes, dando tudo por bom e valioso, a fim de praticar todos os demais atos necessários ao fiel desempenho deste mandato.

PODERES ESPECÍFICOS: A presente procuração outorga aos Advogados acima descritos, os poderes especiais para receber citação, confessar, reconhecer a procedência do pedido, transigir, desistir, renunciar ao direito sobre que se funda a ação, firmar compromissos ou acordos, receber valores, dar e receber quitação, receber e dar quitação, levantar ou receber RPV e ALVARÁS, requerer a justiça gratuita e assinar declaração de hipossuficiência econômica, em conformidade com a norma do art. 105 da Lei 13.105/2015.

{{cliente_cidade}}/{{cliente_estado}}, {{data_extenso}}

Outorgante:

____________________________________
{{cliente_nome}}`,
        isNative: true,
      },
      {
        id: "contrato_honorarios",
        name: "Contrato de Honorários",
        description: "Contrato padrão de prestação de serviços advocatícios",
        icon: FileText,
        color: "text-green-600",
        bgColor: "bg-green-100",
        fields: ["nome", "cpf", "endereço", "valor", "objeto"],
        estimatedTime: "3 min",
        template: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS

Pelo presente instrumento particular, as partes abaixo qualificadas resolvem celebrar o presente contrato de prestação de serviços advocatícios, que se regerá pelas seguintes cláusulas e condições:

1. CONTRATANTE: {{nome}}, brasileiro, portador do CPF nº {{cpf}}, residente e domiciliado na {{endereço}}.

2. CONTRATADO: Dr. [NOME DO ADVOGADO], inscrito na OAB/SP sob o nº [NÚMERO], com escritório na [ENDEREÇO DO ESCRITÓRIO].

3. OBJETO: O contratado se obriga a prestar serviços advocatícios relacionados a {{objeto}}.

4. HONORÁRIOS: Os honorários advocatícios ficam fixados em R$ {{valor}}, a serem pagos conforme acordado entre as partes.

5. PRAZO: Este contrato vigorará até o término do serviço contratado.

6. FORO: As partes elegem o foro da comarca de São Paulo para dirimir quaisquer dúvidas oriundas do presente contrato.

São Paulo, ${new Date().toLocaleDateString("pt-BR")}.

{{nome}}                                    Dr. [NOME DO ADVOGADO]
CPF: {{cpf}}                               OAB/SP nº [NÚMERO]`,
        isNative: true,
      },
      {
        id: "termo_compromisso",
        name: "Termo de Compromisso",
        description: "Termo de compromisso para acordos extrajudiciais",
        icon: CheckCircle,
        color: "text-purple-600",
        bgColor: "bg-purple-100",
        fields: ["nome", "cpf", "objeto", "prazo", "valor"],
        estimatedTime: "2 min",
        template: `TERMO DE COMPROMISSO

Eu, {{nome}}, brasileiro, portador do CPF nº {{cpf}}, comprometo-me a:

{{objeto}}

Prazo para cumprimento: {{prazo}}
Valor envolvido: R$ {{valor}}

Declaro estar ciente das obrigações assumidas e comprometo-me a cumpri-las no prazo estabelecido.

São Paulo, ${new Date().toLocaleDateString("pt-BR")}.

{{nome}}
CPF: {{cpf}}`,
        isNative: true,
      },
      {
        id: "declaracao",
        name: "Declaração",
        description: "Modelo de declaração personalizada",
        icon: FileText,
        color: "text-orange-600",
        bgColor: "bg-orange-100",
        fields: ["nome", "cpf", "objeto", "data"],
        estimatedTime: "1 min",
        template: `DECLARAÇÃO

Eu, {{nome}}, brasileiro, portador do CPF nº {{cpf}}, declaro, sob as penas da lei, que:

{{objeto}}

Esta declaração é verdadeira e pode ser utilizada para os fins que se fizerem necessários.

São Paulo, {{data}}.

{{nome}}
CPF: {{cpf}}`,
        isNative: true,
      },
    ];

    console.log("Templates fixos:", fixed.length);

    // Personalizados: adicionar ícone e cor padrão
    const custom = templates.map((t) => ({
      ...t,
      description: t.category || "Template personalizado",
      icon: FileText,
      color: "text-blue-600",
      bgColor: "bg-blue-100",
      estimatedTime: "-",
      template: t.content, // garantir campo template atualizado
      fields: t.variables,
      isNative: false,
    }));

    console.log("Templates personalizados:", custom.length);

    // Aplicar overrides dos padrões
    const overrides = JSON.parse(
      localStorage.getItem("legalai_template_overrides") || "{}"
    );

    console.log("Overrides carregados:", Object.keys(overrides));

    const merged = fixed.map((native) => {
      if (overrides[native.name]) {
        console.log(`Aplicando override para: ${native.name}`);
        return {
          ...native,
          ...overrides[native.name],
          icon: native.icon,
          color: native.color,
          bgColor: native.bgColor,
          estimatedTime: native.estimatedTime,
          template:
            overrides[native.name].template ||
            overrides[native.name].content ||
            native.template,
          fields:
            overrides[native.name].fields ||
            overrides[native.name].variables ||
            native.fields,
          isNative: true,
        };
      }
      return native;
    });

    const result = [...merged, ...custom];
    console.log("Total de templates retornados:", result.length);
    console.log("=== FIM DEBUG: getAutomationTemplates ===");

    return result;
  };

  // Clientes carregados do banco de dados
  const [availableClients, setAvailableClients] = useState<any[]>([]);
  const [loadingClients, setLoadingClients] = useState(false);

  // Carregar clientes do localStorage
  const loadClients = async () => {
    try {
      setLoadingClients(true);
      console.log("=== DEBUG: CARREGANDO CLIENTES ===");

      // Buscar clientes do localStorage via clientsService
      const clients = await clientsService.getClients();

      // Se não há clientes, criar alguns de exemplo
      if (clients.length === 0) {
        console.log("📝 Criando clientes de exemplo...");
        await createSampleClients();
        const sampleClients = await clientsService.getClients();
        setAvailableClients(sampleClients);
        console.log("✅ Clientes de exemplo criados:", sampleClients.length);
      } else {
        setAvailableClients(clients);
        console.log("Clientes carregados:", clients);
      }
    } catch (error) {
      console.error("Erro ao carregar clientes:", error);
      setAvailableClients([]);
    } finally {
      setLoadingClients(false);
    }
  };

  // Criar clientes de exemplo
  const createSampleClients = async () => {
    try {
      const sampleClients = [
        {
          name: "João Silva",
          email: "joao.silva@email.com",
          phone: "(11) 99999-9999",
          cpf: "123.456.789-00",
          address:
            "Rua das Flores, 123 - Centro, São Paulo/SP - CEP: 01234-567",
        },
        {
          name: "Maria Santos",
          email: "maria.santos@email.com",
          phone: "(11) 88888-8888",
          cpf: "987.654.321-00",
          address:
            "Av. Paulista, 1000 - Bela Vista, São Paulo/SP - CEP: 01310-100",
        },
        {
          name: "Pedro Oliveira",
          email: "pedro.oliveira@email.com",
          phone: "(11) 77777-7777",
          cpf: "456.789.123-00",
          address:
            "Rua Augusta, 500 - Consolação, São Paulo/SP - CEP: 01412-000",
        },
      ];

      for (const clientData of sampleClients) {
        await clientsService.createClient(clientData);
      }
    } catch (error) {
      console.error("Erro ao criar clientes de exemplo:", error);
    }
  };

  // Carregar clientes ao montar o componente
  useEffect(() => {
    loadClients();
  }, []);

  const handleEditDocument = (document: LegalDocument) => {
    // Salvar documento no localStorage para passar para o editor
    if (typeof window !== "undefined") {
      localStorage.setItem("editor_document", JSON.stringify(document));
    }
    router.push("/editor");
  };

  const handleExportDocument = async (
    document: LegalDocument,
    format: "docx"
  ) => {
    try {
      setIsGenerating(true);

      await exportService.exportToDOCX(document);
      toast({
        title: "✅ Documento DOCX exportado!",
        description: `O arquivo "${document.title}.docx" foi baixado com sucesso.`,
      });
    } catch (error) {
      console.error("Erro ao exportar documento:", error);
      toast({
        title: "❌ Erro na exportação",
        description: "Não foi possível exportar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleAutomationGenerate = async () => {
    console.log("=== DEBUG: handleAutomationGenerate ===");
    console.log("selectedTemplate:", selectedTemplate);
    console.log("selectedClient:", selectedClient);

    if (!selectedTemplate || selectedClient === "") {
      console.log("❌ Template ou cliente não selecionado");
      toast({
        title: "Seleção obrigatória",
        description: "Selecione um template e um cliente.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);

    try {
      console.log("✅ Iniciando geração de documento");

      const template = automationTemplates.find(
        (t) => t.id === selectedTemplate
      );

      console.log("Template encontrado:", template);

      if (!template) {
        throw new Error("Template não encontrado");
      }

      const generatedDocuments: LegalDocument[] = [];

      // Gerar documento para o cliente selecionado
      const client = availableClients.find((c) => c.id === selectedClient);
      console.log("=== DEBUG: GERAÇÃO DE DOCUMENTO ===");
      console.log("selectedClient:", selectedClient);
      console.log(
        "availableClients:",
        availableClients.map((c) => ({ id: c.id, name: c.name }))
      );
      console.log("Cliente encontrado:", client);

      if (!client) {
        console.error("❌ Cliente não encontrado para o ID:", selectedClient);
        toast({
          title: "Cliente não encontrado",
          description:
            "O cliente selecionado não foi encontrado. Tente novamente.",
          variant: "destructive",
        });
        return;
      }

      console.log("✅ Cliente encontrado:", {
        id: client.id,
        name: client.name,
        email: client.email,
        cpf: client.cpf,
        phone: client.phone,
        address: client.address,
        city: client.city,
        state: client.state,
      });

      // Substituir variáveis do template de forma dinâmica
      let content = template.template;
      console.log("Conteúdo original do template:", content);

      // Extrair todas as variáveis do template
      const matches: string[] = content.match(/{{(.*?)}}/g) || [];
      matches.forEach((match: string) => {
        const varName = match.replace(/[{}]/g, "");
        let value = "";

        // Mapear variáveis do cliente de forma mais inteligente
        const clientFieldMap: Record<string, string> = {
          // Campos diretos do cliente
          cliente_nome: client.name,
          nome: client.name,
          cliente_email: client.email || "",
          email: client.email || "",
          cliente_telefone: client.phone || "",
          telefone: client.phone || "",
          cliente_cpf: client.cpf || "",
          cpf: client.cpf || "",
          cliente_rg: client.rg || "",
          rg: client.rg || "",
          cliente_endereco: client.address || "",
          endereco: client.address || "",
          cliente_cep: client.cep || "",
          cep: client.cep || "",
          cliente_rua: client.street || "",
          rua: client.street || "",
          cliente_numero: client.number || "",
          numero: client.number || "",
          cliente_complemento: client.complement || "",
          complemento: client.complement || "",
          cliente_bairro: client.neighborhood || "",
          bairro: client.neighborhood || "",
          cliente_cidade: client.city || "",
          cidade: client.city || "",
          cliente_estado: client.state || "",
          estado: client.state || "",
          cliente_data_nascimento: client.birthDate || "",
          data_nascimento: client.birthDate || "",
          cliente_estado_civil: client.maritalStatus || "",
          estado_civil: client.maritalStatus || "",
          cliente_nacionalidade: client.nationality || "",
          nacionalidade: client.nationality || "",
          cliente_profissao: client.profession || "",
          profissao: client.profession || "",
          cliente_observacoes: client.observations || "",
          observacoes: client.observations || "",
        };

        // Tentar buscar no mapeamento primeiro
        if (clientFieldMap[varName]) {
          value = clientFieldMap[varName];
        } else if (client && client[varName as keyof typeof client]) {
          // Fallback para busca direta no objeto client
          value = (client[varName as keyof typeof client] as string) || "";
        } else {
          // Valores padrão para variáveis conhecidas que não estão no cliente
          switch (varName) {
            case "data":
              value = new Date().toLocaleDateString("pt-BR");
              break;
            case "data_extenso":
              value = new Date().toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              break;
            case "data_por_extenso":
              value = new Date().toLocaleDateString("pt-BR", {
                day: "numeric",
                month: "long",
                year: "numeric",
              });
              break;
            default:
              value = "";
          }
        }

        console.log(`Substituindo {{${varName}}} por: "${value}"`);
        content = content.replaceAll(match, value);
      });

      // Substituir variáveis do escritório automaticamente
      content = await replaceOfficeVariables(content);
      console.log(
        "Conteúdo após substituição de variáveis do escritório:",
        content
      );

      // Aplicar formatação baseada nas configurações de template
      content = applyTemplateFormatting(content);
      console.log("Conteúdo final formatado:", content);

      // Criar documento real
      const documentData = {
        title: `${template.name} - ${client.name}`,
        content: content,
        type: template.name,
        clientId: client.id,
        clientName: client.name,
        template: template.id,
        metadata: {
          causeValue: "5.000,00", // Valor padrão
          jurisdiction: "1ª Vara Cível", // Valor padrão
          theses: [],
          blocks: [],
          aiGenerated: false,
          suggestions: [],
        },
      };

      // LOG DETALHADO
      console.log("documentData a ser criado:", documentData);
      // Validação básica dos campos obrigatórios
      if (
        !documentData.title ||
        !documentData.content ||
        !documentData.type ||
        !documentData.clientId ||
        !documentData.clientName ||
        !documentData.template
      ) {
        throw new Error(
          "Campos obrigatórios faltando em documentData: " +
            JSON.stringify(documentData)
        );
      }

      let document;
      try {
        document = await documentService.createDocument(documentData);
        console.log("Documento criado com sucesso:", document);
      } catch (err) {
        console.error("Erro ao criar documento:", err);
        throw err;
      }

      generatedDocuments.push(document);

      console.log("✅ Documento gerado com sucesso");

      // Definir o documento para preview
      setPreviewDocument(generatedDocuments[0]);

      toast({
        title: "Documento gerado!",
        description: `O documento "${generatedDocuments[0].title}" foi criado com sucesso.`,
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => {
              setShowAutomationModal(false);
              setSelectedTemplate("");
              setSelectedClient("");
              loadDocuments();
              setShowDocumentPreview(true);
            }}>
            <FileText className="w-4 h-4 mr-2" />
            Ver Documento
          </Button>
        ),
      });

      setShowAutomationModal(false);
      setSelectedTemplate("");
      setSelectedClient("");
      loadDocuments(); // Recarregar lista de documentos
    } catch (error) {
      console.error("❌ Erro na geração:", error);
      toast({
        title: "Erro na geração",
        description: "Ocorreu um erro ao gerar o documento.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
    }
  };

  const handleCreateTemplate = () => {
    setEditingTemplate(null);
    setTemplateForm({
      name: "",
      category: "",
      content: "",
      variables: [],
    });
    setShowTemplateEditor(true);
  };

  const handleEditTemplate = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      category: template.category,
      content: template.content,
      variables: template.variables,
    });
    setShowTemplateEditor(true);
  };

  // Nova função para editar template como documento
  const handleEditTemplateAsDocument = (
    template: DocumentTemplate,
    returnToPreview = false
  ) => {
    // Criar um documento temporário baseado no template
    const tempDocument: LegalDocument = {
      id: `temp-${Date.now()}`,
      title: template.name,
      content: template.content,
      type: template.category || "Template",
      clientId: "template-edit",
      clientName: "Template",
      template: template.id,
      status: "finalized",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      version: 1,
      metadata: {
        causeValue: "",
        jurisdiction: "",
        theses: [],
        blocks: [],
        aiGenerated: false,
        suggestions: [],
      },
    };

    setEditingDocument(tempDocument);
    setDocumentEditForm({
      title: tempDocument.title,
      content: tempDocument.content,
    });
    setShouldReturnToPreview(returnToPreview);
    setShowDocumentEditor(true);
  };

  const handleDeleteTemplate = (templateId: string) => {
    if (documentService.deleteTemplate(templateId)) {
      toast({
        title: "Template excluído!",
        description: "O template foi excluído com sucesso.",
      });
      loadTemplates();
    } else {
      toast({
        title: "Erro ao excluir",
        description: "Não foi possível excluir o template.",
        variant: "destructive",
      });
    }
  };

  const handleViewTemplate = (template: DocumentTemplate) => {
    setEditingTemplate(template);
    setTemplateForm({
      name: template.name,
      category: template.category,
      content: template.content,
      variables: template.variables,
    });
    setShowTemplateModal(true);
  };

  const handleUseTemplate = (template: DocumentTemplate) => {
    // Salvar template no localStorage para passar para o editor
    if (typeof window !== "undefined") {
      localStorage.setItem("editor_template", JSON.stringify(template));
      localStorage.setItem("editor_mode", "template");
    }
    router.push("/editor");
  };

  const downloadDocuments = () => {
    // Simular download dos documentos DOCX
    toast({
      title: "Download iniciado",
      description: "Os documentos estão sendo baixados...",
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finalized":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "finalized":
        return "Finalizado";
      case "archived":
        return "Arquivado";
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
    });
  };

  const stats = documentService.getStatistics();

  const handleEditDocumentDirectly = (
    document: LegalDocument,
    returnToPreview = false
  ) => {
    setEditingDocument(document);
    setDocumentEditForm({
      title: document.title,
      content: document.content,
    });
    setShouldReturnToPreview(returnToPreview);
    setShowDocumentEditor(true);
  };

  const handleSaveDocumentEdit = async () => {
    if (
      !editingDocument ||
      !documentEditForm.title ||
      !documentEditForm.content
    ) {
      toast({
        title: "Campos obrigatórios",
        description: "Título e conteúdo são obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    try {
      let updatedDocument = documentService.updateDocument(editingDocument.id, {
        title: documentEditForm.title,
        content: documentEditForm.content,
        updatedAt: new Date(),
      });

      // Se não encontrou, cria um novo documento
      if (!updatedDocument) {
        updatedDocument = await documentService.createDocument({
          title: documentEditForm.title,
          type: editingDocument.type || "documento",
          content: documentEditForm.content,
          clientId: editingDocument.clientId || "",
          clientName: editingDocument.clientName || "",
          template: editingDocument.template || "",
          metadata: editingDocument.metadata || {},
        });
      }

      toast({
        title: "✅ Documento salvo!",
        description: "As alterações foram salvas com sucesso.",
      });

      // Atualizar o documento no preview se for o mesmo
      if (previewDocument && previewDocument.id === updatedDocument.id) {
        setPreviewDocument(updatedDocument);
      }

      setShowDocumentEditor(false);
      loadDocuments();

      // Se deve voltar ao preview, abrir o modal de preview
      if (shouldReturnToPreview && updatedDocument) {
        setPreviewDocument(updatedDocument);
        setShowDocumentPreview(true);
      }

      setShouldReturnToPreview(false);
    } catch (error) {
      console.error("Erro ao salvar documento:", error);
      toast({
        title: "❌ Erro ao salvar",
        description: "Não foi possível salvar as alterações. Tente novamente.",
        variant: "destructive",
      });
    }
  };

  // Função para editar template de automação (nativo ou personalizado)
  const handleEditAutomationTemplate = (template: any) => {
    console.log("=== DEBUG: handleEditAutomationTemplate ===");
    console.log("Template recebido:", template);

    setEditingTemplate(template);

    // Garantir que todos os campos necessários estejam presentes
    const formData = {
      name: template.name || "",
      category: template.category || template.name || "",
      content: template.template || template.content || "",
      variables: template.fields || template.variables || [],
    };

    setTemplateForm(formData);

    console.log("Formulário configurado:", formData);

    setShowAutomationTemplateEditor(true);
  };

  // Função para visualizar template de automação
  const handleViewAutomationTemplate = (template: any) => {
    try {
      console.log("=== DEBUG: handleViewAutomationTemplate ===");
      console.log("Template recebido:", template);

      const templateData = {
        id: template.id,
        name: template.name,
        category: template.category || template.name,
        content: template.template || template.content,
        variables: template.fields || template.variables,
        isCustom: !template.isNative,
      };

      setEditingTemplate(templateData);
      setTemplateForm({
        name: template.name,
        category: template.category || template.name,
        content: template.template || template.content,
        variables: template.fields || template.variables,
      });
      setShowTemplateModal(true);

      console.log("Template configurado para visualização:", templateData);
    } catch (error) {
      console.error("❌ Erro ao visualizar template:", error, template);
      toast({
        title: "Erro ao visualizar template",
        description:
          "Ocorreu um erro ao tentar visualizar este template. Tente novamente ou edite o template.",
        variant: "destructive",
      });
    }
  };

  const handleDebugVariables = () => {
    const result = testOfficeVariables();
    console.log("Resultado do teste:", result);

    toast({
      title: "Debug de Variáveis",
      description:
        "Verifique o console para ver os resultados do teste de variáveis.",
    });
  };

  const handleResetOfficeConfig = () => {
    // Limpar configuração atual
    localStorage.removeItem("legalai_office_config");

    // Criar nova configuração com valores reais
    const newConfig = {
      lawyerName: "Dr. João Silva",
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

    // Salvar nova configuração
    localStorage.setItem("legalai_office_config", JSON.stringify(newConfig));

    toast({
      title: "Configuração Resetada",
      description:
        "As configurações do escritório foram resetadas com valores padrão.",
    });

    // Testar novamente
    setTimeout(() => {
      const result = testOfficeVariables();
      console.log("Resultado após reset:", result);
    }, 100);
  };

  // Função de teste para verificar localStorage
  const testLocalStorage = () => {
    console.log("=== TESTE LOCALSTORAGE ===");

    try {
      // Teste 1: Verificar se localStorage está disponível
      console.log(
        "1. localStorage disponível:",
        typeof localStorage !== "undefined"
      );

      // Teste 2: Verificar capacidade
      const testKey = "test_key";
      const testValue = "test_value";
      localStorage.setItem(testKey, testValue);
      const retrieved = localStorage.getItem(testKey);
      localStorage.removeItem(testKey);
      console.log("2. Capacidade de escrita/leitura:", retrieved === testValue);

      // Teste 3: Verificar dados atuais
      const currentOverrides = localStorage.getItem(
        "legalai_template_overrides"
      );
      console.log("3. Overrides atuais:", currentOverrides);

      // Teste 4: Tentar parsear
      if (currentOverrides) {
        try {
          const parsed = JSON.parse(currentOverrides);
          console.log("4. Parse bem-sucedido:", typeof parsed === "object");
          console.log("5. Chaves nos overrides:", Object.keys(parsed));
        } catch (parseError) {
          console.error("4. Erro no parse:", parseError);
        }
      }

      // Teste 5: Verificar outros dados
      const templates = localStorage.getItem("legalai_templates");
      const documents = localStorage.getItem("legalai_documents");
      console.log("6. Templates salvos:", templates ? "SIM" : "NÃO");
      console.log("7. Documentos salvos:", documents ? "SIM" : "NÃO");
    } catch (error) {
      console.error("❌ Erro no teste:", error);
    }

    console.log("=== FIM TESTE LOCALSTORAGE ===");
  };

  const handleDeleteDocument = (id: string) => {
    documentService.deleteDocument(id);
    setRecentDocuments((prev) => prev.filter((doc) => doc.id !== id));
    toast({
      title: "Documento excluído",
      description: "O documento foi removido com sucesso.",
    });
  };

  const handleExportTemplate = async (
    template: DocumentTemplate,
    format: "docx"
  ) => {
    await exportService.exportToDOCX({
      id: template.id,
      title: template.name,
      type: "template",
      content: template.content,
      clientId: "",
      clientName: "",
      template: template.id,
      status: "finalized",
      createdAt: new Date(),
      updatedAt: new Date(),
      tags: [],
      version: 1,
      metadata: {
        causeValue: "",
        jurisdiction: "",
        theses: [],
        blocks: [],
        aiGenerated: false,
      },
    });
    toast({
      title: "Exportação iniciada",
      description: "O template está sendo exportado para DOCX.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Documentos Jurídicos"
        subtitle="Gerencie e automatize suas peças processuais"
        icon={<FileText className="w-5 h-5 md:w-6 md:h-6" />}
        actions={
          <div className="flex items-center space-x-4">
            {currentSubscription && (
              <Badge
                variant="secondary"
                className="bg-white/20 text-white shadow-aiudex">
                {currentSubscription.planId === "pro" ? (
                  <Crown className="w-4 h-4 mr-1" />
                ) : currentSubscription.planId === "basic" ? (
                  <Zap className="w-4 h-4 mr-1" />
                ) : (
                  <Star className="w-4 h-4 mr-1" />
                )}
                {currentSubscription.planId.toUpperCase()}
              </Badge>
            )}
            <Button
              onClick={() => router.push("/editor")}
              className="bg-white text-blue-600 hover:bg-gray-100 shadow-aiudex hover:shadow-aiudex-lg transform hover:scale-105 transition-all duration-300">
              <Plus className="w-4 h-4 mr-2" />
              Peças Jurídicas IA
            </Button>
            <Button
              onClick={() => setShowAutomationModal(true)}
              className="bg-gradient-aiudex-secondary text-white shadow-aiudex hover:shadow-aiudex-lg transform hover:scale-105 transition-all duration-300">
              <FileDown className="w-4 h-4 mr-2" />
              Automação
            </Button>
            <Button
              onClick={() => setShowDocumentManager(true)}
              className="bg-white/20 hover:bg-white/30 text-white border-white/30 backdrop-blur-sm shadow-aiudex hover:shadow-aiudex-lg transform hover:scale-105 transition-all duration-300">
              <FileText className="w-4 h-4 mr-2" />
              Gerenciar
            </Button>
          </div>
        }
      />

      <div className="max-w-7xl mx-auto p-6">
        <Tabs
          value={activeTab}
          onValueChange={setActiveTab}
          defaultValue="documents"
          className="space-y-6">
          <TabsList className="grid w-full grid-cols-3">
            <TabsTrigger value="documents">Meus Documentos</TabsTrigger>
            <TabsTrigger value="automation">Automação</TabsTrigger>
            <TabsTrigger value="templates">Templates</TabsTrigger>
          </TabsList>

          {/* Aba: Meus Documentos */}
          <TabsContent value="documents" className="space-y-6">
            {/* Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-4 gap-6 mb-8">
              <Card className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">
                        Total de Documentos
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {stats.totalDocuments}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-aiudex-secondary text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">Finalizados</p>
                      <p className="text-2xl font-bold text-white">
                        {stats.documentsByStatus.finalized || 0}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                      <Bot className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">IA Gerados</p>
                      <p className="text-2xl font-bold text-white">
                        {
                          recentDocuments.filter((d) => d.metadata.aiGenerated)
                            .length
                        }
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
                  placeholder="Buscar documentos..."
                  className="pl-10"
                />
              </div>
              <Button variant="outline">
                <Filter className="w-4 h-4 mr-2" />
                Filtros
              </Button>
            </div>

            {/* Documentos Recentes */}
            <div className="mb-8">
              <div className="flex items-center justify-between mb-4">
                <h2 className="text-xl font-bold text-gray-900">
                  Documentos Recentes
                </h2>
                <Button
                  variant="outline"
                  onClick={() => setShowDocumentManager(true)}>
                  Ver Todos
                </Button>
              </div>

              {recentDocuments.length === 0 ? (
                <Card className="text-center py-12">
                  <CardContent>
                    <FileText className="w-16 h-16 text-gray-400 mx-auto mb-4" />
                    <h3 className="text-lg font-medium text-gray-900 mb-2">
                      Nenhum documento encontrado
                    </h3>
                    <p className="text-gray-500 mb-4">
                      Crie seu primeiro documento jurídico
                    </p>
                    <Button onClick={() => router.push("/editor")}>
                      <Plus className="w-4 h-4 mr-2" />
                      Peças Jurídicas IA
                    </Button>
                  </CardContent>
                </Card>
              ) : (
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
                  {recentDocuments.map((doc) => (
                    <Card
                      key={doc.id}
                      className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] relative">
                      {/* Botão de lixeira no canto superior direito */}
                      <button
                        onClick={(e) => {
                          e.stopPropagation();
                          handleDeleteDocument(doc.id);
                        }}
                        className="absolute top-3 right-3 p-1 rounded-full bg-white/80 hover:bg-red-100 text-red-500 hover:text-red-700 shadow transition-all z-10"
                        title="Excluir documento">
                        <Trash2 className="w-5 h-5" />
                      </button>
                      <CardHeader className="pb-3">
                        <div className="flex items-center justify-between">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-gradient-aiudex rounded-lg flex items-center justify-center shadow-aiudex">
                              <FileText className="w-5 h-5 text-white" />
                            </div>
                            <div>
                              <CardTitle className="text-base text-gray-900">
                                {doc.title}
                              </CardTitle>
                              <p className="text-sm text-gray-600">
                                {doc.type}
                              </p>
                            </div>
                          </div>
                          <Badge className={getStatusColor(doc.status)}>
                            {getStatusLabel(doc.status)}
                          </Badge>
                        </div>
                      </CardHeader>
                      <CardContent>
                        <div className="space-y-3">
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <User className="w-4 h-4" />
                            <span>{doc.clientName}</span>
                          </div>
                          <div className="flex items-center space-x-2 text-sm text-gray-500">
                            <Calendar className="w-4 h-4" />
                            <span>{formatDate(doc.updatedAt)}</span>
                          </div>

                          {doc.metadata.aiGenerated && (
                            <div className="flex items-center space-x-2">
                              <Badge
                                variant="secondary"
                                className="bg-purple-100 text-purple-700">
                                <Bot className="w-3 h-3 mr-1" />
                                IA Gerado
                              </Badge>
                              {doc.metadata.confidence && (
                                <span className="text-xs text-gray-500">
                                  {Math.round(doc.metadata.confidence * 100)}%
                                  confiança
                                </span>
                              )}
                            </div>
                          )}

                          <div className="flex items-center space-x-2 pt-2">
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleEditDocumentDirectly(doc, false);
                              }}>
                              <Edit3 className="w-4 h-4 mr-1" />
                              Editar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-green-200 text-green-700 hover:bg-green-50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                setPreviewDocument(doc);
                                setShowDocumentPreview(true);
                              }}>
                              <Eye className="w-4 h-4 mr-1" />
                              Visualizar
                            </Button>
                            <Button
                              variant="outline"
                              size="sm"
                              className="border-purple-200 text-purple-700 hover:bg-purple-50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300"
                              onClick={(e) => {
                                e.stopPropagation();
                                handleExportDocument(doc, "docx");
                              }}
                              disabled={isGenerating}>
                              <FileText className="w-4 h-4 mr-1" />
                              DOCX
                            </Button>
                          </div>
                        </div>
                      </CardContent>
                    </Card>
                  ))}
                </div>
              )}
            </div>
          </TabsContent>

          {/* Aba: Automação */}
          <TabsContent value="automation" className="space-y-6">
            {/* Header com título e descrição */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                ⚡ Automação de Documentos
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Gere documentos padrão automaticamente com os dados dos seus
                clientes
              </p>
            </div>

            {/* Estatísticas de Automação - MOVIDO PARA CIMA */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-to-br from-green-500 to-emerald-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                      <FileCheck className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">
                        Documentos Automatizados
                      </p>
                      <p className="text-2xl font-bold text-white">156</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                      <Clock className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">Tempo Economizado</p>
                      <p className="text-2xl font-bold text-white">42h</p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-aiudex-secondary text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                      <Users className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">
                        Clientes Atendidos
                      </p>
                      <p className="text-2xl font-bold text-white">89</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Cards de automação */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {automationTemplates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] relative">
                  {/* Botão de lixeira no canto superior direito, só se não for nativo */}
                  {!template.isNative && (
                    <button
                      onClick={(e) => {
                        e.stopPropagation();
                        handleDeleteTemplate(template.id);
                      }}
                      className="absolute top-3 right-3 p-1 rounded-full bg-white/80 hover:bg-red-100 text-red-500 hover:text-red-700 shadow transition-all z-10"
                      title="Excluir template">
                      <Trash2 className="w-5 h-5" />
                    </button>
                  )}
                  <CardHeader className="pb-3">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-10 h-10 ${template.bgColor} rounded-lg flex items-center justify-center shadow-aiudex`}>
                          {typeof template.icon === "function" ? (
                            <template.icon
                              className={`w-5 h-5 ${template.color}`}
                            />
                          ) : (
                            <FileText className={`w-5 h-5 ${template.color}`} />
                          )}
                        </div>
                        <div>
                          <CardTitle className="text-base text-gray-900">
                            {template.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {template.description}
                          </p>
                        </div>
                      </div>
                      {template.isNative && (
                        <Badge className="bg-blue-100 text-blue-800 border-blue-200 text-xs">
                          Nativo
                        </Badge>
                      )}
                    </div>
                  </CardHeader>
                  <CardContent>
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-sm text-gray-500">
                        <Clock className="w-4 h-4" />
                        <span>{template.estimatedTime}</span>
                      </div>

                      <div className="flex items-center space-x-2">
                        <Button
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 text-white shadow-aiudex hover:shadow-aiudex-lg transform hover:scale-105 transition-all duration-300"
                          size="sm"
                          onClick={(e) => {
                            e.stopPropagation();
                            setSelectedTemplate(template.id);
                            setShowAutomationModal(true);
                          }}>
                          <Play className="w-4 h-4 mr-2" />
                          Gerar
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/80 hover:bg-white border-blue-200 hover:border-blue-300 shadow-aiudex hover:shadow-aiudex-lg transform hover:scale-105 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleViewAutomationTemplate(template);
                          }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="sm"
                          className="bg-white/80 hover:bg-white border-blue-200 hover:border-blue-300 shadow-aiudex hover:shadow-aiudex-lg transform hover:scale-105 transition-all duration-300"
                          onClick={(e) => {
                            e.stopPropagation();
                            handleEditAutomationTemplate(template);
                          }}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>
          </TabsContent>

          {/* Aba: Templates */}
          <TabsContent value="templates" className="space-y-6">
            {/* Header com estatísticas */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-900 mb-4">
                🎯 Biblioteca de Templates
              </h2>
              <p className="text-xl text-gray-600 mb-8">
                Templates personalizáveis para diferentes tipos de documentos
                jurídicos
              </p>
            </div>

            {/* Cards de Estatísticas */}
            <div className="grid grid-cols-1 md:grid-cols-3 gap-6 mb-8">
              <Card className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                      <FileText className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">
                        Total de Templates
                      </p>
                      <p className="text-2xl font-bold text-white">
                        {templates.length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-aiudex-secondary text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                      <Sparkles className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">Templates Nativos</p>
                      <p className="text-2xl font-bold text-white">
                        {templates.filter((t) => !t.isCustom).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>

              <Card className="bg-gradient-to-br from-purple-500 to-pink-500 text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div className="flex items-center space-x-3">
                    <div className="w-12 h-12 bg-white/20 rounded-lg flex items-center justify-center shadow-aiudex">
                      <Edit3 className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <p className="text-sm text-white/80">Personalizados</p>
                      <p className="text-2xl font-bold text-white">
                        {templates.filter((t) => t.isCustom).length}
                      </p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Seção de Ações */}
            <div className="bg-gradient-aiudex rounded-xl p-8 text-white shadow-aiudex mb-8">
              <div className="text-center mb-6">
                <h3 className="text-2xl font-bold mb-2">
                  🚀 Crie Templates Personalizados
                </h3>
                <p className="text-lg opacity-90">
                  Desenvolva templates únicos para seu escritório
                </p>
              </div>

              <div className="flex flex-col sm:flex-row gap-4 justify-center">
                <Button
                  variant="outline"
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300"
                  onClick={() => {
                    // Criar template de exemplo aleatório
                    const nomes = [
                      "Contrato de Honorários",
                      "Procuração",
                      "Termo de Compromisso",
                      "Acordo Extrajudicial",
                      "Notificação",
                      "Petição Inicial",
                      "Contestação",
                      "Recurso",
                      "Memorial",
                      "Declaração",
                    ];
                    const categorias = [
                      "Contratos",
                      "Cível",
                      "Trabalhista",
                      "Família",
                      "Tributário",
                      "Empresarial",
                      "Penal",
                      "Imobiliário",
                    ];
                    const variaveisPossiveis = [
                      "nome",
                      "cpf",
                      "endereco",
                      "telefone",
                      "valor",
                      "prazo",
                      "objeto",
                      "advogado",
                      "oab",
                      "escritorio",
                      "cidade",
                      "data",
                    ];
                    function randomItem(arr: any[]) {
                      return arr[Math.floor(Math.random() * arr.length)];
                    }
                    function randomVars() {
                      const n = Math.floor(Math.random() * 5) + 3;
                      return Array.from({ length: n }, () =>
                        randomItem(variaveisPossiveis)
                      ).filter((v, i, a) => a.indexOf(v) === i);
                    }
                    const nome = randomItem(nomes) + " - Exemplo";
                    const categoria = randomItem(categorias);
                    const variaveis = randomVars();
                    const content =
                      `${nome.toUpperCase()}\n\n` +
                      variaveis.map((v) => `${v}: {{{${v}}}}`).join("\n") +
                      "\n\nEste é um exemplo gerado automaticamente.";
                    const exampleTemplate = {
                      name: nome,
                      category: categoria,
                      content: content,
                      variables: variaveis,
                      isCustom: true,
                    };
                    documentService.createTemplate(exampleTemplate);
                    loadTemplates();
                    toast({
                      title: "✅ Template de exemplo criado!",
                      description: `Um template aleatório foi criado para teste.`,
                    });
                  }}>
                  <Sparkles className="w-5 h-5 mr-2" />
                  Criar Exemplo
                </Button>
                <Button
                  onClick={handleCreateTemplate}
                  size="lg"
                  className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                  <Plus className="w-5 h-5 mr-2" />
                  Criar Template
                </Button>
              </div>
            </div>

            {/* Manual de Automação */}
            <div className="mb-8">
              <Card className="bg-gradient-to-br from-blue-50 to-indigo-50 border-blue-200 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="p-6">
                  <div
                    className="flex items-center justify-between cursor-pointer"
                    onClick={() => setShowManual(!showManual)}>
                    <div className="flex items-center space-x-3">
                      <div className="w-10 h-10 bg-gradient-aiudex rounded-lg flex items-center justify-center">
                        <BookOpen className="w-5 h-5 text-white" />
                      </div>
                      <h2 className="text-xl font-bold text-gray-900">
                        Manual de Automação de Documentos
                      </h2>
                    </div>
                    <Button
                      variant="ghost"
                      size="sm"
                      className="text-blue-600 hover:text-blue-800 hover:bg-blue-50">
                      {showManual ? (
                        <ChevronUp className="w-5 h-5" />
                      ) : (
                        <ChevronDown className="w-5 h-5" />
                      )}
                    </Button>
                  </div>

                  <div
                    className={`transition-all duration-300 ease-in-out overflow-hidden ${
                      showManual
                        ? "max-h-[2000px] opacity-100 mt-4"
                        : "max-h-0 opacity-0"
                    }`}>
                    <p className="text-gray-700 mb-4">
                      Utilize{" "}
                      <span className="font-mono bg-gray-100 px-1 rounded">
                        &#123;&#123;variavel&#125;&#125;
                      </span>{" "}
                      para inserir dados dinâmicos nos seus templates. As
                      variáveis serão substituídas automaticamente pelos dados
                      do cliente, do escritório ou do caso.
                    </p>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h3 className="font-semibold text-blue-800 mb-2">
                          Dados do Cliente
                        </h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li className="text-xs text-gray-500 mb-2">
                            Sempre utilize o prefixo{" "}
                            <span className="font-mono">cliente_</span> para
                            dados do cliente.
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_nome&#125;&#125;
                            </span>{" "}
                            – Nome completo do cliente
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_cpf&#125;&#125;
                            </span>{" "}
                            – CPF do cliente
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_rg&#125;&#125;
                            </span>{" "}
                            – RG do cliente
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_endereco&#125;&#125;
                            </span>{" "}
                            – Endereço completo
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_telefone&#125;&#125;
                            </span>{" "}
                            – Telefone do cliente
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_email&#125;&#125;
                            </span>{" "}
                            – Email do cliente
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_nacionalidade&#125;&#125;
                            </span>{" "}
                            – Nacionalidade
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_estado_civil&#125;&#125;
                            </span>{" "}
                            – Estado civil
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_profissao&#125;&#125;
                            </span>{" "}
                            – Profissão
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_data_nascimento&#125;&#125;
                            </span>{" "}
                            – Data de nascimento
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_cidade&#125;&#125;
                            </span>{" "}
                            – Cidade do cliente
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cliente_estado&#125;&#125;
                            </span>{" "}
                            – Estado do cliente
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-blue-800 mb-2">
                          Dados do Escritório
                        </h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>
                            <span className="font-mono">
                              &#123;&#123;advogado&#125;&#125;
                            </span>{" "}
                            – Nome do advogado responsável
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;oab&#125;&#125;
                            </span>{" "}
                            – Número da OAB
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;escritorio&#125;&#125;
                            </span>{" "}
                            – Nome do escritório
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;endereco_escritorio&#125;&#125;
                            </span>{" "}
                            – Endereço do escritório
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;telefone_escritorio&#125;&#125;
                            </span>{" "}
                            – Telefone do escritório
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;email_escritorio&#125;&#125;
                            </span>{" "}
                            – Email do escritório
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cnpj_escritorio&#125;&#125;
                            </span>{" "}
                            – CNPJ do escritório
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="grid grid-cols-1 md:grid-cols-2 gap-6 mb-4">
                      <div>
                        <h3 className="font-semibold text-blue-800 mb-2">
                          Dados do Caso/Contrato
                        </h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>
                            <span className="font-mono">
                              &#123;&#123;objeto&#125;&#125;
                            </span>{" "}
                            – Objeto do contrato/caso
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;valor&#125;&#125;
                            </span>{" "}
                            – Valor monetário
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;prazo&#125;&#125;
                            </span>{" "}
                            – Prazo em dias
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;numero_processo&#125;&#125;
                            </span>{" "}
                            – Número do processo
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;vara&#125;&#125;
                            </span>{" "}
                            – Vara judicial
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;comarca&#125;&#125;
                            </span>{" "}
                            – Comarca
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;honorarios&#125;&#125;
                            </span>{" "}
                            – Valor dos honorários
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;percentual_honorarios&#125;&#125;
                            </span>{" "}
                            – Percentual dos honorários
                          </li>
                        </ul>
                      </div>

                      <div>
                        <h3 className="font-semibold text-blue-800 mb-2">
                          Dados Gerais
                        </h3>
                        <ul className="space-y-1 text-sm text-gray-700">
                          <li>
                            <span className="font-mono">
                              &#123;&#123;data&#125;&#125;
                            </span>{" "}
                            – Data atual
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;data_por_extenso&#125;&#125;
                            </span>{" "}
                            – Data por extenso
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cidade&#125;&#125;
                            </span>{" "}
                            – Cidade
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;estado&#125;&#125;
                            </span>{" "}
                            – Estado
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;cep&#125;&#125;
                            </span>{" "}
                            – CEP
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;bairro&#125;&#125;
                            </span>{" "}
                            – Bairro
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;numero&#125;&#125;
                            </span>{" "}
                            – Número do endereço
                          </li>
                          <li>
                            <span className="font-mono">
                              &#123;&#123;complemento&#125;&#125;
                            </span>{" "}
                            – Complemento do endereço
                          </li>
                        </ul>
                      </div>
                    </div>

                    <div className="mb-4">
                      <h3 className="font-semibold text-blue-800 mb-2">
                        Formatação Especial
                      </h3>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>
                          <span className="font-mono">
                            &#123;&#123;valor_por_extenso&#125;&#125;
                          </span>{" "}
                          – Valor por extenso (ex: "cinco mil reais")
                        </li>
                        <li>
                          <span className="font-mono">
                            &#123;&#123;data_vencimento&#125;&#125;
                          </span>{" "}
                          – Data de vencimento
                        </li>
                        <li>
                          <span className="font-mono">
                            &#123;&#123;prazo_por_extenso&#125;&#125;
                          </span>{" "}
                          – Prazo por extenso (ex: "trinta dias")
                        </li>
                        <li>
                          <span className="font-mono">
                            &#123;&#123;valor_moeda&#125;&#125;
                          </span>{" "}
                          – Valor formatado como moeda (R$ 5.000,00)
                        </li>
                      </ul>
                    </div>

                    <div className="bg-yellow-50 border border-yellow-200 rounded-lg p-4 mb-4">
                      <h3 className="font-semibold text-yellow-800 mb-2">
                        Exemplo de Uso Completo
                      </h3>
                      <pre className="bg-white p-3 rounded text-sm whitespace-pre-wrap border">
                        CONTRATO DE HONORÁRIOS ADVOCATÍCIOS Pelo presente
                        instrumento particular, &#123;&#123;nome&#125;&#125;,
                        brasileiro(a), portador(a) da Cédula de Identidade RG nº
                        &#123;&#123;rg&#125;&#125; e inscrito(a) no CPF sob o nº
                        &#123;&#123;cpf&#125;&#125;, residente e domiciliado(a)
                        à &#123;&#123;endereco&#125;&#125;,
                        &#123;&#123;cidade&#125;&#125; -
                        &#123;&#123;estado&#125;&#125;, CEP
                        &#123;&#123;cep&#125;&#125;, doravante denominado(a)
                        CONTRATANTE, contrata os serviços advocatícios do Dr.
                        &#123;&#123;advogado&#125;&#125;,
                        OAB/&#123;&#123;estado&#125;&#125; nº
                        &#123;&#123;oab&#125;&#125;, do escritório
                        &#123;&#123;escritorio&#125;&#125;, situado à
                        &#123;&#123;endereco_escritorio&#125;&#125;,
                        &#123;&#123;cidade&#125;&#125; -
                        &#123;&#123;estado&#125;&#125;, para
                        &#123;&#123;objeto&#125;&#125;. Valor dos honorários:
                        &#123;&#123;valor_moeda&#125;&#125;
                        (&#123;&#123;valor_por_extenso&#125;&#125;) Prazo:
                        &#123;&#123;prazo&#125;&#125; dias
                        (&#123;&#123;prazo_por_extenso&#125;&#125;)
                        &#123;&#123;cidade&#125;&#125;,
                        &#123;&#123;data_por_extenso&#125;&#125;.
                        _________________________ &#123;&#123;nome&#125;&#125;
                        CONTRATANTE _________________________ Dr.
                        &#123;&#123;advogado&#125;&#125;
                        OAB/&#123;&#123;estado&#125;&#125; nº
                        &#123;&#123;oab&#125;&#125; CONTRATADO
                      </pre>
                    </div>

                    <div className="bg-green-50 border border-green-200 rounded-lg p-4">
                      <h3 className="font-semibold text-green-800 mb-2">
                        Dicas Importantes
                      </h3>
                      <ul className="space-y-1 text-sm text-gray-700">
                        <li>
                          • Você pode criar suas próprias variáveis
                          personalizadas
                        </li>
                        <li>
                          • As variáveis são substituídas automaticamente
                          durante a geração
                        </li>
                        <li>
                          • Use variáveis em maiúsculas para títulos e
                          cabeçalhos
                        </li>
                        <li>
                          • Combine múltiplas variáveis em um mesmo documento
                        </li>
                        <li>
                          • Teste sempre o template antes de usar em produção
                        </li>
                      </ul>
                    </div>
                  </div>
                </CardContent>
              </Card>
            </div>

            {/* Lista de Templates */}
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
              {templates.map((template) => (
                <Card
                  key={template.id}
                  className="bg-white/80 backdrop-blur-sm border-blue-200/50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300 cursor-pointer transform hover:scale-[1.02] relative">
                  {/* Botão de lixeira no canto superior direito */}
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleDeleteTemplate(template.id);
                    }}
                    className="absolute top-3 right-3 p-1 rounded-full bg-white/80 hover:bg-red-100 text-red-500 hover:text-red-700 shadow transition-all z-10"
                    title="Excluir template">
                    <Trash2 className="w-5 h-5" />
                  </button>
                  <CardHeader className="pb-4">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-12 h-12 rounded-lg flex items-center justify-center shadow-aiudex ${
                            template.isCustom
                              ? "bg-gradient-to-br from-purple-500 to-pink-500"
                              : "bg-gradient-aiudex"
                          }`}>
                          <FileText className="w-6 h-6 text-white" />
                        </div>
                        <div>
                          <CardTitle className="text-lg text-gray-900">
                            {template.name}
                          </CardTitle>
                          <p className="text-sm text-gray-600">
                            {template.category}
                          </p>
                        </div>
                      </div>
                      <div className="flex flex-col items-end space-y-2">
                        <span className="text-xs text-gray-500">
                          {template.variables.length} variáveis
                        </span>
                      </div>
                    </div>
                  </CardHeader>
                  <CardContent className="space-y-4">
                    <div>
                      <h4 className="font-medium text-sm mb-3 text-gray-700">
                        Variáveis disponíveis:
                      </h4>
                      <div className="flex flex-wrap gap-2">
                        {(template.fields || template.variables || [])
                          .slice(0, 4)
                          .map((field) => (
                            <Badge
                              key={field}
                              variant="outline"
                              className="text-xs bg-gray-50 border-gray-200 text-gray-700">
                              {field}
                            </Badge>
                          ))}
                        {template.variables.length > 4 && (
                          <Badge
                            variant="outline"
                            className="text-xs bg-blue-50 border-blue-200 text-blue-700">
                            +{template.variables.length - 4} mais
                          </Badge>
                        )}
                      </div>
                    </div>

                    <div className="text-xs text-gray-500 bg-gray-50 p-3 rounded-lg">
                      <p
                        className="overflow-hidden text-ellipsis"
                        style={{
                          display: "-webkit-box",
                          WebkitLineClamp: 2,
                          WebkitBoxOrient: "vertical",
                        }}>
                        {template.content.substring(0, 120)}...
                      </p>
                    </div>

                    <div className="flex space-x-2 pt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-blue-200 text-blue-700 hover:bg-blue-50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          setPreviewDocument({
                            id: template.id,
                            title: template.name,
                            content: template.content,
                            type: template.category || "Template",
                            clientId: "",
                            clientName: "",
                            template: template.id,
                            status: "finalized" as const,
                            createdAt: new Date(),
                            updatedAt: new Date(),
                            tags: [],
                            version: 1,
                            metadata: {
                              causeValue: "",
                              jurisdiction: "",
                              theses: [],
                              blocks: [],
                              aiGenerated: false,
                            },
                          });
                          setShowDocumentPreview(true);
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
                          handleEditAutomationTemplate(template);
                        }}>
                        <Edit3 className="w-4 h-4 mr-1" />
                        Editar
                      </Button>
                      <Button
                        variant="outline"
                        size="sm"
                        className="border-purple-200 text-purple-700 hover:bg-purple-50 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300"
                        onClick={(e) => {
                          e.stopPropagation();
                          handleExportTemplate(template, "docx");
                        }}>
                        <FileText className="w-4 h-4 mr-1" />
                        DOCX
                      </Button>
                    </div>
                  </CardContent>
                </Card>
              ))}
            </div>

            {templates.length === 0 && (
              <Card className="bg-gradient-to-br from-gray-50 to-blue-50 border-gray-200 shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                <CardContent className="text-center py-16">
                  <div className="w-20 h-20 bg-gradient-aiudex rounded-full flex items-center justify-center mx-auto mb-6 shadow-aiudex">
                    <FileText className="w-10 h-10 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold text-gray-900 mb-3">
                    Nenhum template encontrado
                  </h3>
                  <p className="text-lg text-gray-600 mb-8 max-w-md mx-auto">
                    Crie seu primeiro template personalizado para automatizar a
                    criação de documentos
                  </p>
                  <div className="flex flex-col sm:flex-row gap-4 justify-center">
                    <Button
                      onClick={handleCreateTemplate}
                      size="lg"
                      className="bg-gradient-aiudex text-white shadow-aiudex hover:shadow-aiudex-lg transition-all duration-300">
                      <Plus className="w-5 h-5 mr-2" />
                      Criar Template
                    </Button>
                    <Button
                      variant="outline"
                      size="lg"
                      className="border-blue-200 text-blue-700 hover:bg-blue-50 transition-all duration-300">
                      <BookOpen className="w-5 h-5 mr-2" />
                      Ver Manual
                    </Button>
                  </div>
                </CardContent>
              </Card>
            )}
          </TabsContent>
        </Tabs>

        {/* Recursos Premium */}
        {!hasPremiumAccess && (
          <Card className="bg-gradient-to-r from-purple-50 to-blue-50 border-purple-200 mt-8">
            <CardContent className="p-6">
              <div className="flex items-center justify-between">
                <div className="flex items-center space-x-4">
                  <div className="w-12 h-12 bg-purple-100 rounded-lg flex items-center justify-center">
                    <Crown className="w-6 h-6 text-purple-600" />
                  </div>
                  <div>
                    <h3 className="text-lg font-semibold text-gray-900">
                      Desbloqueie Automação Avançada
                    </h3>
                    <p className="text-gray-600">
                      Templates ilimitados, exportação DOCX e automação em lote
                    </p>
                  </div>
                </div>
                <Button
                  onClick={() => router.push("/pricing")}
                  className="bg-purple-600 hover:bg-purple-700">
                  <Crown className="w-4 h-4 mr-2" />
                  Upgrade
                </Button>
              </div>
            </CardContent>
          </Card>
        )}
      </div>

      {/* Modal do Gerenciador de Documentos */}
      <DocumentManager
        isOpen={showDocumentManager}
        onClose={() => setShowDocumentManager(false)}
        onEditDocument={handleEditDocument}
      />

      {/* Modal de Automação */}
      <Dialog open={showAutomationModal} onOpenChange={setShowAutomationModal}>
        <DialogContent className="max-w-2xl bg-white border border-gray-200 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Gerar Documentos Automatizados</DialogTitle>
            <DialogDescription>
              Selecione o template e o cliente para gerar um documento
              automaticamente.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            {/* Seleção de Template */}
            <div>
              <Label className="text-sm font-medium">Template</Label>
              <Select
                value={selectedTemplate}
                onValueChange={setSelectedTemplate}>
                <SelectTrigger className="mt-1">
                  <SelectValue placeholder="Selecione um template" />
                </SelectTrigger>
                <SelectContent>
                  {automationTemplates.map((template) => (
                    <SelectItem key={template.id} value={template.id}>
                      <div className="flex items-center space-x-2">
                        {typeof template.icon === "function" ? (
                          <template.icon className="w-4 h-4" />
                        ) : (
                          <FileText className="w-4 h-4" />
                        )}
                        <span>{template.name}</span>
                      </div>
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>

            {/* Seleção de Cliente */}
            <div>
              <Label className="text-sm font-medium">Cliente</Label>
              <Popover>
                <PopoverTrigger asChild>
                  <Button
                    variant="outline"
                    role="combobox"
                    className="w-full justify-between mt-1"
                    disabled={loadingClients}>
                    {loadingClients ? (
                      <div className="flex items-center gap-2">
                        <div className="w-4 h-4 border-2 border-blue-500 border-t-transparent rounded-full animate-spin"></div>
                        <span>Carregando clientes...</span>
                      </div>
                    ) : selectedClient ? (
                      availableClients.find(
                        (client) => client.id === selectedClient
                      )?.name || "Cliente não encontrado"
                    ) : (
                      "Selecione um cliente..."
                    )}
                    <ChevronsUpDown className="ml-2 h-4 w-4 shrink-0 opacity-50" />
                  </Button>
                </PopoverTrigger>
                <PopoverContent className="w-full p-0">
                  <Command>
                    <CommandInput placeholder="Buscar cliente..." />
                    <CommandList>
                      <CommandEmpty>
                        {loadingClients
                          ? "Carregando clientes..."
                          : "Nenhum cliente encontrado."}
                      </CommandEmpty>
                      <CommandGroup>
                        {availableClients.map((client) => (
                          <CommandItem
                            key={client.id}
                            value={`${client.name} ${client.cpf || ""}`}
                            onSelect={() => {
                              console.log("=== DEBUG: SELEÇÃO DE CLIENTE ===");
                              console.log("Cliente selecionado:", client);
                              console.log("ID do cliente:", client.id);
                              console.log(
                                "selectedClient atual:",
                                selectedClient
                              );
                              const newSelectedClient =
                                client.id === selectedClient ? "" : client.id;
                              console.log(
                                "Novo selectedClient:",
                                newSelectedClient
                              );
                              setSelectedClient(newSelectedClient);
                            }}>
                            <Check
                              className={cn(
                                "mr-2 h-4 w-4",
                                selectedClient === client.id
                                  ? "opacity-100"
                                  : "opacity-0"
                              )}
                            />
                            <div className="flex flex-col">
                              <span className="font-medium">{client.name}</span>
                              <span className="text-xs text-gray-500">
                                {client.cpf
                                  ? `CPF: ${client.cpf}`
                                  : client.email || "Sem CPF"}
                              </span>
                            </div>
                          </CommandItem>
                        ))}
                      </CommandGroup>
                    </CommandList>
                  </Command>
                </PopoverContent>
              </Popover>
              {loadingClients && (
                <p className="text-xs text-blue-600 mt-1">
                  Carregando clientes do banco de dados...
                </p>
              )}
              {selectedClient && !loadingClients && (
                <div className="mt-2 p-2 bg-blue-50 rounded-lg">
                  <p className="text-sm text-blue-700">
                    Cliente selecionado:{" "}
                    <strong>
                      {
                        availableClients.find((c) => c.id === selectedClient)
                          ?.name
                      }
                    </strong>
                  </p>
                </div>
              )}
            </div>

            {/* Ações */}
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAutomationModal(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleAutomationGenerate}
                disabled={
                  isGenerating || !selectedTemplate || selectedClient === ""
                }
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg border-0 transform hover:scale-105 transition-all duration-200">
                {isGenerating ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                    Gerando...
                  </>
                ) : (
                  <>
                    <FileDown className="w-4 h-4 mr-2" />
                    Gerar Documento
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Visualização de Template */}
      <Dialog open={showTemplateModal} onOpenChange={setShowTemplateModal}>
        <DialogContent className="max-w-4xl max-h-[80vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Visualizar Template</DialogTitle>
            <DialogDescription>
              Visualize o conteúdo do template selecionado.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Nome</Label>
              <p className="text-lg font-semibold">{editingTemplate?.name}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Categoria</Label>
              <p className="text-gray-600">{editingTemplate?.category}</p>
            </div>
            <div>
              <Label className="text-sm font-medium">Conteúdo</Label>
              <div className="mt-2 p-4 bg-gray-50 rounded-lg border">
                <pre className="whitespace-pre-wrap text-sm font-mono">
                  {editingTemplate?.content}
                </pre>
              </div>
            </div>
            <div>
              <Label className="text-sm font-medium">Variáveis</Label>
              <div className="flex flex-wrap gap-2 mt-2">
                {(
                  editingTemplate?.fields ||
                  editingTemplate?.variables ||
                  []
                ).map((variable) => (
                  <Badge key={variable} variant="outline" className="text-xs">
                    {variable}
                  </Badge>
                ))}
              </div>
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowTemplateModal(false)}>
                Fechar
              </Button>
              <Button
                onClick={() => {
                  setShowTemplateModal(false);
                  if (editingTemplate) {
                    handleEditTemplateAsDocument(editingTemplate, true);
                  }
                }}
                className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 transform hover:scale-105 transition-all duration-200">
                <Edit3 className="w-4 h-4 mr-2" />
                Editar
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Template */}
      <Dialog open={showTemplateEditor} onOpenChange={setShowTemplateEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>
              {editingTemplate ? "✏️ Editar Template" : "➕ Criar Template"}
            </DialogTitle>
            <DialogDescription>
              {editingTemplate
                ? "Edite o conteúdo do template selecionado."
                : "Crie um novo template personalizado para seus documentos."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">
                  Nome do Template *
                </Label>
                <Input
                  value={templateForm.name}
                  onChange={(e) =>
                    setTemplateForm({ ...templateForm, name: e.target.value })
                  }
                  placeholder="Ex: Contrato de Honorários"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">Categoria</Label>
                <Input
                  value={templateForm.category}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      category: e.target.value,
                    })
                  }
                  placeholder="Ex: Cível, Trabalhista, Contratos"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Conteúdo do Template *
                </Label>
                <Textarea
                  value={templateForm.content}
                  onChange={(e) =>
                    setTemplateForm({
                      ...templateForm,
                      content: e.target.value,
                    })
                  }
                  placeholder={`Digite o conteúdo do template. Use {{variavel}} para campos dinâmicos.

Exemplo:
CONTRATO DE HONORÁRIOS

Pelo presente instrumento, {{nome}}, CPF {{cpf}}, contrata os serviços advocatícios de {{advogado}} para {{objeto}}.

Valor: R$ {{valor}}
Prazo: {{prazo}} dias`}
                  className="min-h-[400px] font-mono text-sm mt-1"
                />
                <div className="mt-2 text-xs text-gray-500">
                  💡 <strong>Dica:</strong> Use {"{{nome}}"}, {"{{cpf}}"},{" "}
                  {"{{endereco}}"} etc. para campos dinâmicos
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Variáveis Detectadas
                </Label>
                <div className="flex flex-wrap gap-2 mt-2 p-3 bg-gray-50 rounded-lg">
                  {templateForm.content
                    .match(/\{\{([^}]+)\}\}/g)
                    ?.map((match, index) => {
                      const variable = match.replace(/\{\{|\}\}/g, "");
                      return (
                        <Badge
                          key={index}
                          variant="outline"
                          className="text-xs">
                          {variable}
                        </Badge>
                      );
                    }) || (
                    <p className="text-sm text-gray-500">
                      Nenhuma variável detectada ainda
                    </p>
                  )}
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">
                  Preview do Template
                </Label>
                <div className="mt-2 p-4 bg-white border rounded-lg min-h-[400px] max-h-[500px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-4">
                      {templateForm.name || "Nome do Template"}
                    </h3>
                    <div className="whitespace-pre-wrap text-sm">
                      {templateForm.content ||
                        "Digite o conteúdo do template para ver o preview..."}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Exemplo com Dados</Label>
                <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm">
                    <strong>Dados de exemplo:</strong>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• nome: João Silva</li>
                      <li>• cpf: 123.456.789-00</li>
                      <li>• endereco: Rua das Flores, 123</li>
                      <li>• telefone: (11) 99999-9999</li>
                      <li>• valor: 5.000,00</li>
                      <li>• prazo: 30</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setShowTemplateEditor(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveTemplate}
              disabled={!templateForm.name || !templateForm.content}
              className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg border-0 transform hover:scale-105 transition-all duration-200">
              <Save className="w-4 h-4 mr-2" />
              {editingTemplate ? "Atualizar Template" : "Criar Template"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Preview do Documento */}
      <Dialog open={showDocumentPreview} onOpenChange={setShowDocumentPreview}>
        <DialogContent className="max-w-4xl max-h-[80vh] flex flex-col bg-white border border-gray-200 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Visualizar Documento</DialogTitle>
            <DialogDescription>
              Documento gerado por automação
            </DialogDescription>
          </DialogHeader>
          {previewDocument && (
            <>
              <div className="flex-1 overflow-y-auto space-y-6 pr-2 max-h-[calc(80vh-70px)]">
                <div>
                  <Label className="text-sm font-medium">Título</Label>
                  <p className="text-lg font-semibold">
                    {previewDocument.title}
                  </p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Tipo</Label>
                  <p className="text-gray-600">{previewDocument.type}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Cliente</Label>
                  <p className="text-gray-600">{previewDocument.clientName}</p>
                </div>
                <div>
                  <Label className="text-sm font-medium">Conteúdo</Label>
                  <div className="mt-2 p-4 bg-gray-50 rounded-lg border max-h-96 overflow-y-auto">
                    <pre className="whitespace-pre-wrap text-sm font-mono">
                      {previewDocument.content}
                    </pre>
                  </div>
                </div>
              </div>
              <div className="flex justify-end space-x-2 pt-4 border-t bg-white">
                <Button
                  variant="outline"
                  onClick={() => setShowDocumentPreview(false)}>
                  Fechar
                </Button>
                <Button
                  onClick={() => handleExportDocument(previewDocument, "docx")}
                  className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg border-0 transform hover:scale-105 transition-all duration-200">
                  <FileText className="w-4 h-4 mr-2" />
                  Exportar DOCX
                </Button>
                <Button
                  variant="outline"
                  className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 transform hover:scale-105 transition-all duration-200"
                  onClick={() => {
                    setShowDocumentPreview(false);
                    handleEditDocumentDirectly(previewDocument, true);
                  }}>
                  <Edit3 className="w-4 h-4 mr-2" />
                  Editar
                </Button>
              </div>
            </>
          )}
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Documento */}
      <Dialog open={showDocumentEditor} onOpenChange={setShowDocumentEditor}>
        <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>
              {editingDocument ? "✏️ Editar Documento" : "➕ Criar Documento"}
            </DialogTitle>
            <DialogDescription>
              {editingDocument
                ? "Edite o conteúdo do documento selecionado."
                : "Crie um novo documento jurídico."}
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário */}
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">
                  Título do Documento *
                </Label>
                <Input
                  value={documentEditForm.title}
                  onChange={(e) =>
                    setDocumentEditForm({
                      ...documentEditForm,
                      title: e.target.value,
                    })
                  }
                  placeholder="Ex: Contrato de Honorários"
                  className="mt-1"
                />
              </div>

              <div>
                <Label className="text-sm font-medium">
                  Conteúdo do Documento *
                </Label>
                <Textarea
                  value={documentEditForm.content}
                  onChange={(e) =>
                    setDocumentEditForm({
                      ...documentEditForm,
                      content: e.target.value,
                    })
                  }
                  placeholder={`Digite o conteúdo do documento. Use {{variavel}} para campos dinâmicos.

Exemplo:
CONTRATO DE HONORÁRIOS

Pelo presente instrumento, {{nome}}, CPF {{cpf}}, contrata os serviços advocatícios de {{advogado}} para {{objeto}}.

Valor: R$ {{valor}}
Prazo: {{prazo}} dias`}
                  className="min-h-[400px] font-mono text-sm mt-1"
                />
                <div className="mt-2 text-xs text-gray-500">
                  💡 <strong>Dica:</strong> Use {"{{nome}}"}, {"{{cpf}}"},{" "}
                  {"{{endereco}}"} etc. para campos dinâmicos
                </div>
              </div>
            </div>

            {/* Preview */}
            <div className="space-y-6">
              <div>
                <Label className="text-sm font-medium">
                  Preview do Documento
                </Label>
                <div className="mt-2 p-4 bg-white border rounded-lg min-h-[400px] max-h-[500px] overflow-y-auto">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-4">
                      {documentEditForm.title || "Título do Documento"}
                    </h3>
                    <div className="whitespace-pre-wrap text-sm">
                      {documentEditForm.content ||
                        "Digite o conteúdo do documento para ver o preview..."}
                    </div>
                  </div>
                </div>
              </div>

              <div>
                <Label className="text-sm font-medium">Exemplo com Dados</Label>
                <div className="mt-2 p-4 bg-blue-50 border border-blue-200 rounded-lg">
                  <div className="text-sm">
                    <strong>Dados de exemplo:</strong>
                    <ul className="mt-2 space-y-1 text-xs">
                      <li>• nome: João Silva</li>
                      <li>• cpf: 123.456.789-00</li>
                      <li>• endereco: Rua das Flores, 123</li>
                      <li>• telefone: (11) 99999-9999</li>
                      <li>• valor: 5.000,00</li>
                      <li>• prazo: 30</li>
                    </ul>
                  </div>
                </div>
              </div>
            </div>
          </div>

          <div className="flex justify-end space-x-2 pt-6 border-t">
            <Button
              variant="outline"
              onClick={() => setShowDocumentEditor(false)}>
              Cancelar
            </Button>
            <Button
              onClick={handleSaveDocumentEdit}
              disabled={!documentEditForm.title || !documentEditForm.content}
              className="bg-gradient-to-r from-blue-500 to-blue-600 hover:from-blue-600 hover:to-blue-700 text-white shadow-lg border-0 transform hover:scale-105 transition-all duration-200">
              <Save className="w-4 h-4 mr-2" />
              {editingDocument ? "Atualizar Documento" : "Criar Documento"}
            </Button>
          </div>
        </DialogContent>
      </Dialog>

      {/* Modal de Edição de Template Padrão */}
      <Dialog
        open={showAutomationTemplateEditor}
        onOpenChange={setShowAutomationTemplateEditor}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>Editar Template Padrão</DialogTitle>
            <DialogDescription>
              Edite o conteúdo do template padrão. Ao salvar, o texto será
              sobrescrito.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-6">
            <div>
              <Label className="text-sm font-medium">Nome do Template *</Label>
              <Input value={templateForm.name} disabled className="mt-1" />
            </div>
            <div>
              <Label className="text-sm font-medium">
                Conteúdo do Template *
              </Label>
              <Textarea
                value={templateForm.content}
                onChange={(e) =>
                  setTemplateForm({ ...templateForm, content: e.target.value })
                }
                className="min-h-[400px] font-mono text-sm mt-1"
              />
            </div>
            <div className="flex justify-end space-x-2">
              <Button
                variant="outline"
                onClick={() => setShowAutomationTemplateEditor(false)}>
                Cancelar
              </Button>
              <Button
                onClick={handleSaveAutomationTemplate}
                className="bg-gradient-to-r from-green-500 to-green-600 hover:from-green-600 hover:to-green-700 text-white shadow-lg border-0 transform hover:scale-105 transition-all duration-200">
                <Save className="w-4 h-4 mr-2" />
                Salvar Template
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
}
