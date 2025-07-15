import { useState, useRef, useCallback, useEffect } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import {
  Popover,
  PopoverTrigger,
  PopoverContent,
} from "@/components/ui/popover";
import { Checkbox } from "@/components/ui/checkbox";
import {
  FileText,
  Upload,
  X,
  Copy,
  Download,
  Trash2,
  CheckCircle,
  ChevronsUpDown,
  Settings,
  Target,
  FileType,
  Sparkles,
  Bot,
  Loader2,
  AlertCircle,
  Check,
  Gavel,
} from "lucide-react";

import { askGemini, askDeepSeek } from "@/lib/ai-service";
import { cn } from "@/lib/utils";
import { useTemplateSettings } from "@/hooks/use-template-settings";
// Removido pdfjs-dist temporariamente - será reimplementado quando necessário
// import * as pdfjsLib from "pdfjs-dist/build/pdf";

// Configurar o worker do PDF.js - comentado temporariamente
// pdfjsLib.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjsLib.version}/pdf.worker.min.js`;

// Tipos de análise
const TIPOS_ANALISE = [
  {
    id: "resumo",
    label: "Resumo Executivo",
    desc: "Síntese dos pontos principais",
    icon: "📋",
  },
  {
    id: "pontos",
    label: "Pontos Críticos",
    desc: "Identificação de riscos e oportunidades",
    icon: "⚠️",
  },
  {
    id: "recomendacoes",
    label: "Recomendações",
    desc: "Sugestões de ações e estratégias",
    icon: "💡",
  },
  {
    id: "completa",
    label: "Análise Completa",
    desc: "Análise detalhada de todos os aspectos",
    icon: "🔍",
  },
];

// Níveis de profundidade
const PROFUNDIDADES = [
  { id: "basica", label: "Básica", desc: "Análise superficial e rápida" },
  { id: "intermediaria", label: "Intermediária", desc: "Análise equilibrada" },
  { id: "avancada", label: "Avançada", desc: "Análise profunda e detalhada" },
];

// Formatos de saída
const FORMATOS_SAIDA = [
  { id: "texto", label: "Texto Livre", desc: "Formato narrativo" },
  { id: "estruturado", label: "Estruturado", desc: "Com tópicos e seções" },
  { id: "bullet", label: "Tópicos", desc: "Lista de pontos principais" },
];

// Componente de upload premium
function DocumentUpload({
  onFileSelect,
  fileName,
  onRemove,
}: {
  onFileSelect: (file: File) => void;
  fileName: string;
  onRemove: () => void;
}) {
  const [dragActive, setDragActive] = useState(false);
  const [loading, setLoading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleDrag = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    if (e.type === "dragenter" || e.type === "dragover") {
      setDragActive(true);
    } else if (e.type === "dragleave") {
      setDragActive(false);
    }
  }, []);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setDragActive(false);

      if (e.dataTransfer.files && e.dataTransfer.files[0]) {
        const file = e.dataTransfer.files[0];
        if (file.type === "application/pdf" || file.type.startsWith("image/")) {
          onFileSelect(file);
        } else {
          toast({
            title: "Tipo de arquivo não suportado",
            description: "Apenas PDFs e imagens são aceitos.",
            variant: "destructive",
          });
        }
      }
    },
    [onFileSelect]
  );

  const handleFileInput = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      onFileSelect(file);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <Card className="bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 group">
      <CardContent className="p-8">
        {!fileName ? (
          <div
            className={`relative border-2 border-dashed rounded-xl p-8 text-center transition-all duration-300 cursor-pointer
              ${
                dragActive
                  ? "border-blue-400 bg-blue-50/50 scale-105"
                  : "border-blue-200/50 hover:border-blue-400 hover:bg-blue-50/30"
              }`}
            onDragEnter={handleDrag}
            onDragLeave={handleDrag}
            onDragOver={handleDrag}
            onDrop={handleDrop}
            onClick={handleClick}>
            <input
              ref={fileInputRef}
              type="file"
              accept=".pdf,image/*"
              onChange={handleFileInput}
              className="hidden"
            />

            <div className="space-y-4">
              <div className="w-20 h-20 mx-auto bg-gradient-aiudex rounded-2xl flex items-center justify-center shadow-aiudex transition-all duration-300 group-hover:scale-110">
                <Upload className="w-10 h-10 text-white" />
              </div>

              <div>
                <h3 className="text-xl font-bold text-gradient-aiudex mb-2">
                  {dragActive
                    ? "Solte o arquivo aqui"
                    : "Arraste e solte seu documento"}
                </h3>
                <p className="text-blue-700 font-medium mb-4">
                  ou clique para selecionar um arquivo
                </p>
                <p className="text-sm text-blue-600 font-medium">
                  Suporta PDFs e imagens (JPG, PNG, etc.)
                </p>
              </div>
            </div>
          </div>
        ) : (
          <div className="space-y-4">
            <div className="flex items-center justify-between p-4 bg-gradient-aiudex rounded-xl border-2 border-blue-200/30 shadow-aiudex">
              <div className="flex items-center space-x-3">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-white">{fileName}</h4>
                  <p className="text-sm text-white/90 font-medium">
                    Arquivo carregado com sucesso
                  </p>
                </div>
              </div>
              <Button
                variant="ghost"
                size="sm"
                onClick={onRemove}
                className="text-white hover:text-white/80 hover:bg-white/20">
                <X className="w-4 h-4" />
              </Button>
            </div>
          </div>
        )}
      </CardContent>
    </Card>
  );
}

// Componente de configuração
function ConfigCard({
  title,
  description,
  icon: Icon,
  children,
  className = "",
}: {
  title: string;
  description: string;
  icon: React.ComponentType<{ className?: string }>;
  children: React.ReactNode;
  className?: string;
}) {
  return (
    <Card
      className={cn(
        "bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 group",
        className
      )}>
      <CardHeader className="pb-4">
        <div className="flex items-center space-x-3">
          <div className="w-12 h-12 bg-gradient-aiudex rounded-2xl flex items-center justify-center shadow-aiudex group-hover:shadow-aiudex-lg transition-all duration-300">
            <Icon className="w-6 h-6 text-white" />
          </div>
          <div>
            <CardTitle className="text-lg font-bold text-gradient-aiudex">
              {title}
            </CardTitle>
            <p className="text-sm text-blue-700 font-medium">{description}</p>
          </div>
        </div>
      </CardHeader>
      <CardContent className="pt-0">{children}</CardContent>
    </Card>
  );
}

export default function AnaliseDocumentos() {
  const { settings } = useTemplateSettings();
  const [fileName, setFileName] = useState("");
  const [file, setFile] = useState<File | null>(null);
  const [tipoAnalise, setTipoAnalise] = useState(
    settings.defaultAnalysisType || "completa"
  );
  const [profundidade, setProfundidade] = useState(
    settings.defaultDepth || "intermediaria"
  );
  const [formatoSaida, setFormatoSaida] = useState(
    settings.defaultOutputFormat || "estruturado"
  );
  const [resultado, setResultado] = useState("");
  const [gerando, setGerando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  // Remover modeloIA e fixar para 'gemini'
  // const [modeloIA, setModeloIA] = useState(settings.defaultAIModel || "gemini");
  const [copying, setCopying] = useState(false);

  // Atualizar valores quando as configurações mudarem
  useEffect(() => {
    setTipoAnalise(settings.defaultAnalysisType || "completa");
    setProfundidade(settings.defaultDepth || "intermediaria");
    setFormatoSaida(settings.defaultOutputFormat || "estruturado");
    // setModeloIA(settings.defaultAIModel || "gemini");
  }, [settings]);

  const handleFileSelect = (selectedFile: File) => {
    setFile(selectedFile);
    setFileName(selectedFile.name);
  };

  const handleRemoveFile = () => {
    setFile(null);
    setFileName("");
  };

  const gerarAnalise = async () => {
    if (!file) {
      toast({
        title: "Nenhum arquivo selecionado",
        description: "Por favor, selecione um documento para análise.",
        variant: "destructive",
      });
      return;
    }

    setGerando(true);
    setProgresso(0);
    setResultado("");

    try {
      // Simular progresso
      const interval = setInterval(() => {
        setProgresso((prev) => {
          if (prev >= 90) {
            clearInterval(interval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      // Ler o conteúdo do arquivo
      let fileContent = "";

      if (file.type === "application/pdf") {
        // Ler PDF - implementação simplificada por enquanto
        fileContent = `[Conteúdo do PDF: ${file.name}]\n\nEste é um documento PDF que precisa ser analisado. Por favor, considere que este documento contém informações jurídicas para fins de análise.`;
      } else if (file.type.startsWith("image/")) {
        // Para imagens, simular conteúdo
        fileContent = `[Imagem: ${file.name}]\n\nEsta é uma imagem de documento que precisa ser analisada. Por favor, considere que esta imagem contém texto ou informações jurídicas para fins de análise.`;
      } else {
        // Para arquivos de texto
        fileContent = await file.text();
      }

      // Preparar prompt
      const prompt = `Analise o seguinte documento jurídico:

Tipo de Análise: ${TIPOS_ANALISE.find((t) => t.id === tipoAnalise)?.label}
Profundidade: ${PROFUNDIDADES.find((p) => p.id === profundidade)?.label}
Formato: ${FORMATOS_SAIDA.find((f) => f.id === formatoSaida)?.label}

CONTEÚDO DO DOCUMENTO:
${fileContent}

Por favor, forneça uma análise ${PROFUNDIDADES.find(
        (p) => p.id === profundidade
      )?.label.toLowerCase()} do documento, apresentando no formato ${FORMATOS_SAIDA.find(
        (f) => f.id === formatoSaida
      )?.label.toLowerCase()}.

${tipoAnalise === "resumo" ? "Foque nos pontos principais e conclusões." : ""}
${
  tipoAnalise === "pontos"
    ? "Identifique riscos, oportunidades e pontos críticos."
    : ""
}
${
  tipoAnalise === "recomendacoes"
    ? "Forneça recomendações práticas e estratégias."
    : ""
}
${
  tipoAnalise === "completa"
    ? "Forneça uma análise abrangente de todos os aspectos."
    : ""
}`;

      console.log("🔍 [DEBUG] Enviando prompt para análise:", prompt);

      // Chamar IA fixo (Gemini)
      const resposta = await askGemini(prompt);

      console.log("🔍 [DEBUG] Resposta da IA:", resposta);

      clearInterval(interval);
      setProgresso(100);
      setResultado(resposta);

      toast({
        title: "Análise concluída!",
        description: "O documento foi analisado com sucesso.",
      });
    } catch (error) {
      console.error("🔍 [DEBUG] Erro na análise:", error);
      const errorMessage =
        error instanceof Error
          ? error.message
          : "Não foi possível analisar o documento.";
      toast({
        title: "Erro na análise",
        description: errorMessage,
        variant: "destructive",
      });
    } finally {
      setGerando(false);
      setTimeout(() => setProgresso(0), 2000);
    }
  };

  const copiarResultado = async () => {
    setCopying(true);
    try {
      await navigator.clipboard.writeText(resultado);
      toast({
        title: "Copiado!",
        description: "Análise copiada para a área de transferência.",
      });
    } catch (error) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar para a área de transferência.",
        variant: "destructive",
      });
    } finally {
      setCopying(false);
    }
  };

  const limparResultado = () => {
    setResultado("");
    toast({
      title: "Limpo!",
      description: "Resultado removido.",
    });
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Análise de Documentos"
        subtitle="Analise documentos jurídicos com IA avançada"
        icon={<FileText className="w-7 h-7 text-white" />}
      />

      <div className="max-w-7xl mx-auto px-4 py-8">
        <div className="flex flex-col lg:flex-row gap-8">
          {/* Coluna Esquerda - Upload e Configurações */}
          <div className="w-full lg:w-1/2 space-y-8">
            {/* Upload de Documento */}
            <DocumentUpload
              onFileSelect={handleFileSelect}
              fileName={fileName}
              onRemove={handleRemoveFile}
            />

            {/* Configurações */}
            <div className="space-y-6">
              {/* REMOVIDO: Card de Configurações Padrão */}

              {/* Tipo de Análise */}
              <ConfigCard
                title="Tipo de Análise"
                description="Escolha o tipo de análise desejada"
                icon={Target}>
                <div className="grid grid-cols-2 gap-3">
                  {TIPOS_ANALISE.map((tipo) => (
                    <button
                      key={tipo.id}
                      onClick={() => setTipoAnalise(tipo.id)}
                      className={`p-4 rounded-xl border-2 transition-all duration-300 text-left group
                        ${
                          tipoAnalise === tipo.id
                            ? "border-blue-400 bg-gradient-aiudex text-white shadow-aiudex-lg scale-105"
                            : "border-blue-200/50 hover:border-blue-400 hover:bg-blue-50/30"
                        }`}>
                      <div className="text-2xl mb-2">{tipo.icon}</div>
                      <h4 className="font-bold mb-1">{tipo.label}</h4>
                      <p
                        className={`text-sm ${
                          tipoAnalise === tipo.id
                            ? "text-white/90"
                            : "text-blue-700 font-medium"
                        }`}>
                        {tipo.desc}
                      </p>
                    </button>
                  ))}
                </div>
              </ConfigCard>

              {/* Profundidade */}
              <ConfigCard
                title="Profundidade da Análise"
                description="Defina o nível de detalhamento"
                icon={Settings}>
                <div className="space-y-3">
                  {PROFUNDIDADES.map((prof) => (
                    <button
                      key={prof.id}
                      onClick={() => setProfundidade(prof.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left
                        ${
                          profundidade === prof.id
                            ? "border-blue-400 bg-gradient-aiudex text-white shadow-aiudex-lg"
                            : "border-blue-200/50 hover:border-blue-400 hover:bg-blue-50/30"
                        }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{prof.label}</h4>
                          <p
                            className={`text-sm ${
                              profundidade === prof.id
                                ? "text-white/90"
                                : "text-blue-700 font-medium"
                            }`}>
                            {prof.desc}
                          </p>
                        </div>
                        {profundidade === prof.id && (
                          <CheckCircle className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ConfigCard>

              {/* Formato de Saída */}
              <ConfigCard
                title="Formato de Saída"
                description="Escolha como apresentar os resultados"
                icon={FileType}>
                <div className="space-y-3">
                  {FORMATOS_SAIDA.map((formato) => (
                    <button
                      key={formato.id}
                      onClick={() => setFormatoSaida(formato.id)}
                      className={`w-full p-4 rounded-xl border-2 transition-all duration-300 text-left
                        ${
                          formatoSaida === formato.id
                            ? "border-blue-400 bg-gradient-aiudex-secondary text-white shadow-aiudex-lg"
                            : "border-blue-200/50 hover:border-blue-400 hover:bg-blue-50/30"
                        }`}>
                      <div className="flex items-center justify-between">
                        <div>
                          <h4 className="font-bold">{formato.label}</h4>
                          <p
                            className={`text-sm ${
                              formatoSaida === formato.id
                                ? "text-white/90"
                                : "text-blue-700 font-medium"
                            }`}>
                            {formato.desc}
                          </p>
                        </div>
                        {formatoSaida === formato.id && (
                          <CheckCircle className="w-5 h-5 text-white" />
                        )}
                      </div>
                    </button>
                  ))}
                </div>
              </ConfigCard>
            </div>

            {/* Botão de Análise */}
            <Card className="bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300">
              <CardContent className="p-6">
                {/* REMOVIDO: Seletor de modelo de IA */}
                <div className="space-y-3">
                  <Button
                    onClick={gerarAnalise}
                    disabled={!file || gerando}
                    className="w-full h-14 bg-gradient-aiudex hover:shadow-aiudex-lg text-white font-bold text-lg rounded-xl shadow-aiudex transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed">
                    {gerando ? (
                      <>
                        <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                        Analisando...
                      </>
                    ) : (
                      <>
                        <Sparkles className="w-5 h-5 mr-2" />
                        Analisar Documento
                      </>
                    )}
                  </Button>
                </div>

                {gerando && (
                  <div className="mt-4">
                    <Progress
                      value={progresso}
                      className="h-2 [&>div]:bg-gradient-aiudex [&>div]:shadow-aiudex"
                    />
                    <p className="text-sm text-blue-700 font-bold mt-2 text-center">
                      Processando... {progresso}%
                    </p>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita: Resultado */}
          <section className="w-full lg:w-1/2 flex flex-col">
            {/* Header do Resultado */}
            <div className="flex items-center justify-between mb-6">
              <div className="flex items-center gap-3">
                <div className="w-12 h-12 bg-gradient-aiudex rounded-2xl flex items-center justify-center shadow-aiudex">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <h2 className="text-2xl font-bold text-gradient-aiudex">
                    Análise do Documento
                  </h2>
                  <p className="text-blue-700 font-medium">
                    Resultado da análise com IA
                  </p>
                </div>
              </div>

              {resultado && (
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={copiarResultado}
                    disabled={copying}
                    className="rounded-full border-2 border-blue-300 text-blue-700 bg-white/90 backdrop-blur-sm hover:bg-blue-50 transition-all shadow-aiudex">
                    <Copy className="w-4 h-4 mr-2" />
                    {copying ? "Copiando..." : "Copiar"}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={limparResultado}
                    className="rounded-full border-2 border-red-300 text-red-700 bg-white/90 backdrop-blur-sm hover:bg-red-50 transition-all shadow-aiudex">
                    <Trash2 className="w-4 h-4 mr-2" />
                    Limpar
                  </Button>
                </div>
              )}
            </div>

            {/* Barra de Progresso */}
            {gerando && (
              <Card className="mb-6 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 p-4">
                <div className="space-y-3">
                  <div className="flex items-center justify-between">
                    <span className="text-sm font-bold text-blue-700">
                      Processando...
                    </span>
                    <span className="text-sm font-bold text-gradient-aiudex">
                      {progresso}%
                    </span>
                  </div>
                  <Progress
                    value={progresso}
                    className="h-3 rounded-full bg-blue-100 [&>div]:bg-gradient-aiudex [&>div]:transition-all [&>div]:duration-300 [&>div]:ease-out [&>div]:shadow-aiudex [&>div]:rounded-full"
                  />
                  <div className="space-y-1">
                    <div className="text-sm text-blue-700 font-medium animate-fade-in-up">
                      <span className="inline-block w-2 h-2 bg-gradient-aiudex rounded-full mr-2 animate-pulse shadow-aiudex"></span>
                      Analisando documento...
                    </div>
                    <div
                      className="text-sm text-blue-700 font-medium animate-fade-in-up"
                      style={{
                        animationDelay: "200ms",
                        animationFillMode: "both",
                      }}>
                      <span className="inline-block w-2 h-2 bg-gradient-aiudex rounded-full mr-2 animate-pulse shadow-aiudex"></span>
                      Processando com IA...
                    </div>
                    <div
                      className="text-sm text-blue-700 font-medium animate-fade-in-up"
                      style={{
                        animationDelay: "400ms",
                        animationFillMode: "both",
                      }}>
                      <span className="inline-block w-2 h-2 bg-gradient-aiudex rounded-full mr-2 animate-pulse shadow-aiudex"></span>
                      Gerando análise...
                    </div>
                  </div>
                </div>
              </Card>
            )}

            {/* Área do Resultado */}
            <Card className="flex-1 bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 overflow-hidden">
              <CardHeader className="bg-gradient-aiudex border-b border-blue-200/30 px-6 py-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 bg-white rounded-full animate-pulse shadow-aiudex"></div>
                    <span className="text-sm font-bold text-white">
                      Editor de Análise
                    </span>
                  </div>
                  {resultado && (
                    <Badge
                      variant="outline"
                      className="text-xs bg-white/20 text-white border-white/30">
                      {resultado.length} caracteres
                    </Badge>
                  )}
                </div>
              </CardHeader>

              <CardContent className="p-0">
                <div className="relative">
                  {gerando && (
                    <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-b-3xl">
                      <div className="text-center">
                        <Loader2 className="w-8 h-8 text-gradient-aiudex animate-spin mx-auto mb-2" />
                        <span className="text-blue-700 font-bold">
                          Analisando documento...
                        </span>
                      </div>
                    </div>
                  )}

                  {resultado ? (
                    <div className="min-h-[400px] p-6">
                      <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-inner">
                        <div
                          className="juridical-content"
                          style={{
                            fontFamily: '"Times New Roman", Times, serif',
                            fontSize: "12pt",
                            lineHeight: "1.5",
                            textAlign: "justify",
                            color: "#1f2937",
                            fontWeight: "normal",
                          }}
                          dangerouslySetInnerHTML={{
                            __html: `
                              <style>
                                .juridical-content * { font-weight: normal !important; }
                                .juridical-content h1, .juridical-content h2, .juridical-content h3 { font-weight: bold !important; }
                                .juridical-content strong { font-weight: bold !important; }
                              </style>
                                                            ${resultado
                                                              .replace(
                                                                /\n/g,
                                                                "<br/>"
                                                              )
                                                              .replace(
                                                                /\*\*(.*?)\*\*/g,
                                                                "<strong>$1</strong>"
                                                              )
                                                              .replace(
                                                                /\*(.*?)\*/g,
                                                                "<em>$1</em>"
                                                              )
                                                              .replace(
                                                                /^### (.*$)/gim,
                                                                "<h3 style='font-weight: bold; text-indent: 0; margin: 1em 0;'>$1</h3>"
                                                              )
                                                              .replace(
                                                                /^## (.*$)/gim,
                                                                "<h2 style='font-weight: bold; text-indent: 0; margin: 1em 0;'>$1</h2>"
                                                              )
                                                              .replace(
                                                                /^# (.*$)/gim,
                                                                "<h1 style='font-weight: bold; text-indent: 0; margin: 1em 0;'>$1</h1>"
                                                              )
                                                              .replace(
                                                                /^- (.*$)/gim,
                                                                "<li style='margin: 0.5em 0; text-align: justify;'>• $1</li>"
                                                              )
                                                              .replace(
                                                                /^\d+\. (.*$)/gim,
                                                                "<li style='margin: 0.5em 0; text-align: justify;'>$&</li>"
                                                              )
                                                              .replace(
                                                                /(<li.*<\/li>)/gim,
                                                                "<ul style='margin: 0.5em 0;'>$1</ul>"
                                                              )
                                                              .replace(
                                                                /`(.*?)`/g,
                                                                "<code style='background-color: #f3f4f6; padding: 0.125rem 0.25rem; border-radius: 0.25rem; font-family: monospace; font-size: 0.875rem;'>$1</code>"
                                                              )
                                                              .replace(
                                                                /^([^#\-\d].*)$/gm,
                                                                "<p style='margin: 0.5em 0; text-align: justify;'>$1</p>"
                                                              )}
                            `,
                          }}
                        />
                      </div>
                    </div>
                  ) : (
                    <div className="min-h-[400px] flex items-center justify-center text-gray-500">
                      <div className="text-center">
                        <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                        <p>Nenhuma análise disponível</p>
                      </div>
                    </div>
                  )}
                </div>
              </CardContent>
            </Card>
          </section>
        </div>

        {/* Sugestões de uso */}
        {!resultado && (
          <div className="mt-12">
            <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-aiudex border-2 border-blue-200/30">
              <CardContent className="p-6">
                <div className="flex items-center space-x-3 mb-4">
                  <div className="w-10 h-10 bg-gradient-aiudex rounded-2xl flex items-center justify-center shadow-aiudex">
                    <Sparkles className="w-5 h-5 text-white" />
                  </div>
                  <div>
                    <h3 className="text-lg font-bold text-gradient-aiudex">
                      Sugestões de Uso
                    </h3>
                    <p className="text-sm text-blue-700 font-medium">
                      Tipos de documentos ideais para análise
                    </p>
                  </div>
                </div>

                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-blue-200/30 shadow-aiudex">
                    <h4 className="font-bold text-gradient-aiudex mb-2">
                      📄 Contratos
                    </h4>
                    <p className="text-sm text-blue-700 font-medium">
                      Análise de cláusulas, riscos e oportunidades
                    </p>
                  </div>
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-blue-200/30 shadow-aiudex">
                    <h4 className="font-bold text-gradient-aiudex mb-2">
                      ⚖️ Petições
                    </h4>
                    <p className="text-sm text-blue-700 font-medium">
                      Revisão de fundamentação e argumentos
                    </p>
                  </div>
                  <div className="p-4 bg-white/80 backdrop-blur-sm rounded-xl border-2 border-blue-200/30 shadow-aiudex">
                    <h4 className="font-bold text-gradient-aiudex mb-2">
                      📋 Documentos
                    </h4>
                    <p className="text-sm text-blue-700 font-medium">
                      Análise de qualquer documento jurídico
                    </p>
                  </div>
                </div>
              </CardContent>
            </Card>
          </div>
        )}
      </div>
    </div>
  );
}
