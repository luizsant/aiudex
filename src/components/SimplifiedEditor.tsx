"use client";

import React, { useState, useEffect, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { useToast } from "@/hooks/use-toast";
import { AIProgressIndicator } from "@/components/ProgressIndicators";
import {
  FileText,
  Wand2,
  Save,
  Download,
  Search,
  Users,
  PenTool,
  Eye,
  Loader2,
  Keyboard,
  Copy,
  Crown,
  Star,
  Zap,
} from "lucide-react";
import { legalAI } from "@/lib/ai-service";
import { paymentService } from "@/lib/payment-service";
import { documentService } from "@/lib/document-service";
import JuridicalDocumentPreview from "@/components/JuridicalDocumentPreview";

interface SimplifiedEditorProps {
  onSave?: (document: any) => void;
  onClose?: () => void;
}

export const SimplifiedEditor = ({
  onSave,
  onClose,
}: SimplifiedEditorProps) => {
  const { toast } = useToast();
  const [activeTab, setActiveTab] = useState("template");
  const [selectedTemplate, setSelectedTemplate] = useState("");
  const [documentContent, setDocumentContent] = useState("");
  const [templateSearch, setTemplateSearch] = useState("");
  const [isGenerating, setIsGenerating] = useState(false);
  const [aiProgress, setAiProgress] = useState(0);
  const [aiStage, setAiStage] = useState("");
  const [isMobile, setIsMobile] = useState(false);
  const [documentTitle, setDocumentTitle] = useState("");

  const [formData, setFormData] = useState({
    clientName: "",
    clientCpf: "",
    factsDescription: "",
    causeValue: "",
  });

  // Detectar dispositivo móvel
  useEffect(() => {
    const checkMobile = () => {
      setIsMobile(window.innerWidth < 768);
    };
    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Auto-save
  useEffect(() => {
    const autoSave = () => {
      if (documentContent && documentTitle) {
        localStorage.setItem(
          "legalai_autosave",
          JSON.stringify({
            content: documentContent,
            title: documentTitle,
            timestamp: Date.now(),
          })
        );
      }
    };

    const interval = setInterval(autoSave, 30000);
    return () => clearInterval(interval);
  }, [documentContent, documentTitle]);

  // Atalhos de teclado
  useEffect(() => {
    const handleKeyDown = (e: KeyboardEvent) => {
      if ((e.ctrlKey || e.metaKey) && e.key === "s") {
        e.preventDefault();
        handleSaveDocument();
      }

      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        e.preventDefault();
        generateWithAI();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, []);

  const templates = [
    {
      id: "indenizacao",
      name: "Petição Inicial - Indenização",
      category: "Cível",
      popular: true,
    },
    {
      id: "cobranca",
      name: "Petição Inicial - Cobrança",
      category: "Cível",
      popular: true,
    },
    {
      id: "contestacao",
      name: "Contestação Cível",
      category: "Cível",
      popular: true,
    },
    {
      id: "trabalhista",
      name: "Reclamatória Trabalhista",
      category: "Trabalhista",
      popular: true,
    },
    {
      id: "familia",
      name: "Divórcio Consensual",
      category: "Família",
      popular: true,
    },
  ];

  const filteredTemplates = templates.filter(
    (template) =>
      template.name.toLowerCase().includes(templateSearch.toLowerCase()) ||
      template.category.toLowerCase().includes(templateSearch.toLowerCase())
  );

  const generateWithAI = async () => {
    if (
      !selectedTemplate ||
      !formData.clientName ||
      !formData.factsDescription
    ) {
      toast({
        title: "Dados incompletos",
        description:
          "Preencha o template, nome do cliente e fatos antes de gerar.",
        variant: "destructive",
      });
      return;
    }

    setIsGenerating(true);
    setAiProgress(0);
    setAiStage("Inicializando IA...");

    try {
      const progressStages = [
        "Analisando dados do cliente...",
        "Processando fatos...",
        "Aplicando fundamentação jurídica...",
        "Gerando texto da petição...",
        "Revisando conteúdo...",
        "Finalizando documento...",
      ];

      for (let i = 0; i < progressStages.length; i++) {
        setAiStage(progressStages[i]);
        setAiProgress((i + 1) * (100 / progressStages.length));
        await new Promise((resolve) => setTimeout(resolve, 800));
      }

      const response = await legalAI.generatePetition({
        template: selectedTemplate,
        clientData: {
          name: formData.clientName,
          cpf: formData.clientCpf,
          address: "",
          role: "autor",
        },
        facts: formData.factsDescription,
        theses: [],
        blocks: [],
        causeValue: formData.causeValue,
        jurisdiction: "1ª VARA CÍVEL DA COMARCA DE SÃO PAULO/SP",
      });

      setDocumentContent(response.content);
      setDocumentTitle(`${selectedTemplate} - ${formData.clientName}`);

      toast({
        title: "Petição gerada com sucesso!",
        description: "O documento foi criado automaticamente.",
        action: (
          <Button
            variant="outline"
            size="sm"
            onClick={() => setActiveTab("preview")}>
            Visualizar
          </Button>
        ),
      });
    } catch (error) {
      toast({
        title: "Erro ao gerar petição",
        description: "Tente novamente ou entre em contato com o suporte.",
        variant: "destructive",
      });
    } finally {
      setIsGenerating(false);
      setAiProgress(0);
      setAiStage("");
    }
  };

  const handleSaveDocument = async () => {
    if (!documentTitle.trim()) {
      toast({
        title: "Título obrigatório",
        description: "Por favor, insira um título para o documento.",
        variant: "destructive",
      });
      return;
    }

    try {
      const document = await documentService.createDocument({
        title: documentTitle,
        type: selectedTemplate,
        content: documentContent,
        clientId: "new",
        clientName: formData.clientName,
        template: selectedTemplate,
        metadata: {
          causeValue: formData.causeValue,
          aiGenerated: true,
        },
      });

      toast({
        title: "Documento salvo!",
        description: `"${document.title}" foi salvo com sucesso.`,
      });

      onSave?.(document);
    } catch (error) {
      toast({
        title: "Erro ao salvar",
        description: "Não foi possível salvar o documento.",
        variant: "destructive",
      });
    }
  };

  const currentSubscription = paymentService.getCurrentSubscription();

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      {/* Header Responsivo */}
      <div className="bg-gradient-to-r from-blue-600 to-green-600 p-4 md:p-6">
        <div className="flex flex-col md:flex-row md:items-center md:justify-between text-white max-w-7xl mx-auto space-y-4 md:space-y-0">
          <div className="flex items-center space-x-4">
            <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center">
              <FileText className="w-5 h-5 md:w-6 md:h-6" />
            </div>
            <div>
              <h1 className="text-xl md:text-2xl font-bold">
                Editor Simplificado
              </h1>
              <p className="text-sm md:text-base text-blue-100">
                Crie petições de forma rápida e eficiente
              </p>
            </div>
          </div>
          <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-4">
            {currentSubscription && (
              <Badge
                variant="secondary"
                className="bg-white/20 text-white self-start md:self-auto">
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
            <div className="flex space-x-2">
              <Button
                onClick={generateWithAI}
                disabled={isGenerating}
                className="bg-white/20 hover:bg-white/30 text-white border-white/30 flex-1 md:flex-none">
                {isGenerating ? (
                  <>
                    <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                    {isMobile ? "Gerando..." : "Gerando com IA..."}
                  </>
                ) : (
                  <>
                    <Wand2 className="w-4 h-4 mr-2" />
                    {isMobile ? "Peças Jurídicas" : "Peças Jurídicas"}
                  </>
                )}
              </Button>
              <Button
                onClick={handleSaveDocument}
                variant="outline"
                className="bg-white/10 hover:bg-white/20 text-white border-white/30">
                <Save className="w-4 h-4" />
                {!isMobile && <span className="ml-2">Salvar</span>}
              </Button>
            </div>
          </div>
        </div>
      </div>

      {/* Progress Bar da IA */}
      {isGenerating && (
        <div className="max-w-7xl mx-auto p-4">
          <AIProgressIndicator
            stage={aiStage}
            progress={aiProgress}
            estimatedTime={30}
          />
        </div>
      )}

      <div className="max-w-7xl mx-auto p-4 md:p-6">
        <Card className="shadow-2xl border-0 overflow-hidden">
          <CardContent className="p-4 md:p-8">
            {/* Navegação por Abas */}
            <Tabs
              value={activeTab}
              onValueChange={setActiveTab}
              className="w-full">
              <TabsList className="grid w-full grid-cols-4 mb-6">
                <TabsTrigger
                  value="template"
                  className="flex items-center space-x-2">
                  <FileText className="w-4 h-4" />
                  {!isMobile && <span>Template</span>}
                </TabsTrigger>
                <TabsTrigger
                  value="client"
                  className="flex items-center space-x-2">
                  <Users className="w-4 h-4" />
                  {!isMobile && <span>Cliente</span>}
                </TabsTrigger>
                <TabsTrigger
                  value="content"
                  className="flex items-center space-x-2">
                  <PenTool className="w-4 h-4" />
                  {!isMobile && <span>Conteúdo</span>}
                </TabsTrigger>
                <TabsTrigger
                  value="preview"
                  className="flex items-center space-x-2">
                  <Eye className="w-4 h-4" />
                  {!isMobile && <span>Preview</span>}
                </TabsTrigger>
              </TabsList>

              {/* Aba: Seleção de Template */}
              <TabsContent value="template" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Escolha o Template
                  </h3>
                  <div className="relative mb-4">
                    <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
                    <Input
                      value={templateSearch}
                      onChange={(e) => setTemplateSearch(e.target.value)}
                      placeholder="Buscar templates..."
                      className="pl-10"
                    />
                  </div>

                  <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
                    {filteredTemplates.map((template) => (
                      <Card
                        key={template.id}
                        className={`cursor-pointer transition-all hover:shadow-lg ${
                          selectedTemplate === template.id
                            ? "ring-2 ring-blue-500 bg-blue-50"
                            : ""
                        }`}
                        onClick={() => setSelectedTemplate(template.id)}>
                        <CardContent className="p-4">
                          <div className="flex items-center space-x-3">
                            <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                              <FileText className="w-5 h-5 text-blue-600" />
                            </div>
                            <div className="flex-1">
                              <h4 className="font-medium">{template.name}</h4>
                              <p className="text-sm text-gray-500">
                                {template.category}
                              </p>
                            </div>
                            {template.popular && (
                              <Badge
                                variant="secondary"
                                className="bg-orange-100 text-orange-700">
                                Popular
                              </Badge>
                            )}
                          </div>
                        </CardContent>
                      </Card>
                    ))}
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Dados do Cliente */}
              <TabsContent value="client" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Dados do Cliente
                  </h3>

                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div>
                      <Label
                        htmlFor="clientName"
                        className="text-sm font-medium">
                        Nome Completo *
                      </Label>
                      <Input
                        id="clientName"
                        value={formData.clientName}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            clientName: e.target.value,
                          }))
                        }
                        placeholder="Nome completo do cliente"
                        className="mt-1"
                      />
                    </div>
                    <div>
                      <Label
                        htmlFor="clientCpf"
                        className="text-sm font-medium">
                        CPF
                      </Label>
                      <Input
                        id="clientCpf"
                        value={formData.clientCpf}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            clientCpf: e.target.value,
                          }))
                        }
                        placeholder="000.000.000-00"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Conteúdo */}
              <TabsContent value="content" className="space-y-6">
                <div>
                  <h3 className="text-lg font-semibold mb-4">
                    Conteúdo da Petição
                  </h3>

                  <div className="space-y-4">
                    <div>
                      <Label
                        htmlFor="factsDescription"
                        className="text-sm font-medium">
                        Descrição dos Fatos *
                      </Label>
                      <Textarea
                        id="factsDescription"
                        value={formData.factsDescription}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            factsDescription: e.target.value,
                          }))
                        }
                        placeholder="Descreva os fatos que fundamentam a ação..."
                        className="mt-1 min-h-[120px]"
                      />
                    </div>

                    <div>
                      <Label
                        htmlFor="causeValue"
                        className="text-sm font-medium">
                        Valor da Causa
                      </Label>
                      <Input
                        id="causeValue"
                        value={formData.causeValue}
                        onChange={(e) =>
                          setFormData((prev) => ({
                            ...prev,
                            causeValue: e.target.value,
                          }))
                        }
                        placeholder="R$ 0,00"
                        className="mt-1"
                      />
                    </div>
                  </div>
                </div>
              </TabsContent>

              {/* Aba: Preview */}
              <TabsContent value="preview" className="space-y-6">
                <div>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold">
                      Preview do Documento
                    </h3>
                    <div className="flex space-x-2">
                      <Button variant="outline" size="sm">
                        <Download className="w-4 h-4 mr-2" />
                        Exportar
                      </Button>
                      <Button variant="outline" size="sm">
                        <Copy className="w-4 h-4 mr-2" />
                        Copiar
                      </Button>
                    </div>
                  </div>

                  <div className="min-h-[400px]">
                    {documentContent ? (
                      <JuridicalDocumentPreview
                        content={documentContent}
                        title={documentTitle}
                        clientName={formData.clientName}
                        showHeader={true}
                        showQualityIndicators={true}
                        className="w-full"
                      />
                    ) : (
                      <div className="bg-white border rounded-lg p-6 min-h-[400px] text-center text-gray-500 py-12">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhum conteúdo gerado ainda.</p>
                        <p className="text-sm">
                          Use a IA para gerar o documento ou edite manualmente.
                        </p>
                      </div>
                    )}
                  </div>
                </div>
              </TabsContent>
            </Tabs>

            {/* Atalhos de Teclado */}
            <div className="mt-6 p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <Keyboard className="w-4 h-4 text-gray-600" />
                <span className="text-sm font-medium text-gray-700">
                  Atalhos de Teclado
                </span>
              </div>
              <div className="grid grid-cols-1 md:grid-cols-3 gap-2 text-xs text-gray-600">
                <div>
                  <kbd className="px-2 py-1 bg-white rounded border">
                    Ctrl + S
                  </kbd>{" "}
                  Salvar
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-white rounded border">
                    Ctrl + Enter
                  </kbd>{" "}
                  Gerar com IA
                </div>
                <div>
                  <kbd className="px-2 py-1 bg-white rounded border">Tab</kbd>{" "}
                  Próxima aba
                </div>
              </div>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};
