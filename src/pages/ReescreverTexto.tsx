import { useState, useRef, useEffect, useCallback } from "react";
import { PageHeader } from "@/components/PageHeader";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { toast } from "@/components/ui/use-toast";
import { askGemini } from "@/lib/ai-service";
import {
  FileSearch,
  Copy,
  Download,
  Trash2,
  CheckCircle,
  Sparkles,
  Palette,
  Mic,
  Eye,
  FileText,
  Settings,
  Target,
  Zap,
  RefreshCw,
  Lightbulb,
  MessageSquare,
  Type,
  User,
  Volume2,
  Shield,
  Smile,
} from "lucide-react";

const CRIATIVIDADE = [
  {
    label: "Original",
    value: "original",
    icon: <FileText className="w-4 h-4" />,
    desc: "Mantém o estilo original",
  },
  {
    label: "Muito Criativo",
    value: "muito_criativo",
    icon: <Sparkles className="w-4 h-4" />,
    desc: "Máxima criatividade e inovação",
  },
  {
    label: "Pouco Criativo",
    value: "pouco_criativo",
    icon: <Lightbulb className="w-4 h-4" />,
    desc: "Pequenas melhorias criativas",
  },
  {
    label: "Literal",
    value: "literal",
    icon: <Type className="w-4 h-4" />,
    desc: "Tradução literal e fiel",
  },
  {
    label: "Mais Criativo",
    value: "criativo",
    icon: <Palette className="w-4 h-4" />,
    desc: "Criatividade moderada",
  },
  {
    label: "Mais Formal",
    value: "formal",
    icon: <User className="w-4 h-4" />,
    desc: "Linguagem mais formal",
  },
  {
    label: "Extremamente Criativo",
    value: "extremamente_criativo",
    icon: <Sparkles className="w-4 h-4 text-purple-500" />,
    desc: "Transforma o texto com muita originalidade",
  },
  {
    label: "Conservador",
    value: "conservador",
    icon: <Shield className="w-4 h-4 text-blue-500" />,
    desc: "Mantém o texto o mais próximo possível do original",
  },
  {
    label: "Descontraído",
    value: "descontraido",
    icon: <Smile className="w-4 h-4 text-yellow-500" />,
    desc: "Traz leveza e informalidade ao texto",
  },
];

const TOM = [
  {
    label: "Jurídico",
    value: "juridico",
    icon: <FileText className="w-4 h-4" />,
    desc: "Linguagem técnica jurídica",
  },
  {
    label: "Técnico",
    value: "tecnico",
    icon: <Settings className="w-4 h-4" />,
    desc: "Tom técnico e preciso",
  },
  {
    label: "Didático",
    value: "didatico",
    icon: <Target className="w-4 h-4" />,
    desc: "Explicativo e educativo",
  },
  {
    label: "Objetivo",
    value: "objetivo",
    icon: <Eye className="w-4 h-4" />,
    desc: "Direto e objetivo",
  },
  {
    label: "Amigável",
    value: "amigavel",
    icon: <MessageSquare className="w-4 h-4" />,
    desc: "Tom amigável e acessível",
  },
  {
    label: "Persuasivo",
    value: "persuasivo",
    icon: <Mic className="w-4 h-4" />,
    desc: "Convincente e persuasivo",
  },
  {
    label: "Formal",
    value: "formal",
    icon: <User className="w-4 h-4" />,
    desc: "Linguagem formal e respeitosa",
  },
  {
    label: "Informal",
    value: "informal",
    icon: <MessageSquare className="w-4 h-4" />,
    desc: "Tom casual e descontraído",
  },
  {
    label: "Assertivo",
    value: "assertivo",
    icon: <Zap className="w-4 h-4" />,
    desc: "Direto e assertivo",
  },
];

const PONTO_VISTA = [
  {
    label: "Primeira Pessoa",
    value: "primeira",
    icon: <User className="w-4 h-4" />,
    desc: "Eu, nós",
  },
  {
    label: "Segunda Pessoa",
    value: "segunda",
    icon: <MessageSquare className="w-4 h-4" />,
    desc: "Você, vocês",
  },
  {
    label: "Terceira Pessoa",
    value: "terceira",
    icon: <Eye className="w-4 h-4" />,
    desc: "Ele, ela, eles",
  },
];

const EXEMPLO = `O presente contrato tem por objeto a prestação de serviços advocatícios, visando a defesa dos interesses do contratante em processos judiciais e administrativos, conforme as condições estabelecidas nas cláusulas seguintes.`;

export default function ReescreverTexto() {
  const [textoOriginal, setTextoOriginal] = useState("");
  const [criatividade, setCriatividade] = useState("original");
  const [tom, setTom] = useState("juridico");
  const [pontoVista, setPontoVista] = useState("primeira");
  const [requisitando, setRequisitando] = useState(false);
  const [progresso, setProgresso] = useState(0);
  const [logs, setLogs] = useState<string[]>([]);
  const [textoReescrito, setTextoReescrito] = useState("");
  const [editorValue, setEditorValue] = useState("");
  const [isTyping, setIsTyping] = useState(false);
  const [copying, setCopying] = useState(false);
  const [dragActive, setDragActive] = useState(false);

  // Efeito digitação dinâmica
  function typeTextDynamically(text: string) {
    console.log("🔍 [DEBUG] typeTextDynamically iniciado com texto:", text);
    setIsTyping(true);
    setEditorValue("");
    let i = 0;
    const cleanText = text.replace(/\n/g, "<br/>");
    console.log("🔍 [DEBUG] cleanText preparado:", cleanText);
    function typeStep() {
      setEditorValue(cleanText.slice(0, i));
      if (i < cleanText.length) {
        i += Math.max(1, Math.floor(cleanText.length / 120));
        setTimeout(typeStep, 8);
      } else {
        setEditorValue(cleanText);
        setIsTyping(false);
        console.log(
          "🔍 [DEBUG] typeTextDynamically concluído, editorValue definido"
        );
      }
    }
    typeStep();
  }

  // Quando receber texto reescrito, digitar dinamicamente
  useEffect(() => {
    console.log(
      "🔍 [DEBUG] useEffect detectou mudança em textoReescrito:",
      textoReescrito
    );
    if (textoReescrito) {
      console.log(
        "🔍 [DEBUG] Chamando typeTextDynamically com:",
        textoReescrito
      );
      typeTextDynamically(textoReescrito);
    }
  }, [textoReescrito]);

  // Prompt interno para IA
  function montarPrompt() {
    const prompt = `Você é um assistente jurídico especializado em reescrita de textos. Sua tarefa é reescrever o texto fornecido conforme os parâmetros especificados, mantendo o sentido original mas melhorando a clareza e adequação ao contexto jurídico.

INSTRUÇÕES:
- Mantenha o sentido original do texto
- Não adicione análises ou pareceres
- Apenas reescreva o texto conforme os parâmetros
- Corrija eventuais erros gramaticais
- Melhore a clareza e fluidez
- Adapte para o contexto jurídico

TEXTO ORIGINAL:
${textoOriginal}

PARÂMETROS DE REESCRITA:
- Tom de voz: ${TOM.find((t) => t.value === tom)?.label || tom}
- Nível de criatividade: ${
      CRIATIVIDADE.find((c) => c.value === criatividade)?.label || criatividade
    }
- Ponto de vista: ${
      PONTO_VISTA.find((p) => p.value === pontoVista)?.label || pontoVista
    }

RESPONDA APENAS COM O TEXTO REESCRITO, sem explicações ou comentários adicionais.`;

    console.log("🔍 [DEBUG] Prompt montado:", prompt);
    return prompt;
  }

  // Função para requisitar reescrita à IA
  async function reescreverTexto() {
    const startTime = Date.now();
    setRequisitando(true);
    setProgresso(5);
    setLogs(["Iniciando reescrita..."]);

    // Função para atualizar progresso de forma suave
    const updateProgress = (target: number, duration: number = 1000) => {
      const start = progresso;
      const startTime = Date.now();

      const animate = () => {
        const elapsed = Date.now() - startTime;
        const progress = Math.min(elapsed / duration, 1);
        const current = start + (target - start) * progress;

        setProgresso(Math.round(current));

        if (progress < 1) {
          requestAnimationFrame(animate);
        }
      };

      requestAnimationFrame(animate);
    };

    try {
      // Fase 1: Preparação (5% -> 20%)
      updateProgress(20, 800);
      setLogs((l) => [...l, "Preparando parâmetros..."]);
      await new Promise((resolve) => setTimeout(resolve, 800));

      // Fase 2: Análise (20% -> 50%)
      updateProgress(50, 1200);
      setLogs((l) => [...l, "Analisando texto original..."]);
      await new Promise((resolve) => setTimeout(resolve, 1200));

      // Fase 3: Envio para IA (50% -> 80%)
      updateProgress(80, 1000);
      setLogs((l) => [...l, "Enviando para IA..."]);

      const prompt = montarPrompt();
      console.log("🔍 [DEBUG] Prompt enviado para IA:", prompt);
      const resposta = await askGemini(prompt);
      console.log("🔍 [DEBUG] Resposta da IA:", resposta);

      // Fase 4: Processamento da resposta (80% -> 100%)
      updateProgress(100, 800);
      setLogs((l) => [...l, "Processando texto reescrito..."]);
      await new Promise((resolve) => setTimeout(resolve, 800));

      setLogs((l) => [...l, "Reescrita concluída com sucesso! ✨"]);
      console.log("🔍 [DEBUG] Definindo texto reescrito:", resposta);
      setTextoReescrito(resposta);

      // Efeito de confete visual
      toast({
        title: "🎉 Texto reescrito com sucesso!",
        description:
          "Seu texto foi reescrito conforme os parâmetros escolhidos.",
      });
    } catch (err) {
      console.error("🔍 [DEBUG] Erro na função reescreverTexto:", err);
      setProgresso(100);
      setLogs((l) => [...l, `❌ Erro ao reescrever texto: ${err.message}`]);
      toast({
        title: "Erro",
        description: `Não foi possível reescrever o texto: ${err.message}`,
      });
    } finally {
      setRequisitando(false);
      setTimeout(() => setProgresso(0), 2000);
    }
  }

  // Função para copiar para área de transferência
  async function copyToClipboard() {
    setCopying(true);
    try {
      const el = document.createElement("div");
      el.innerHTML = editorValue;
      document.body.appendChild(el);
      const range = document.createRange();
      range.selectNodeContents(el);
      const sel = window.getSelection();
      sel.removeAllRanges();
      sel.addRange(range);
      document.execCommand("copy");
      document.body.removeChild(el);
      toast({
        title: "Copiado!",
        description: "Conteúdo copiado para a área de transferência.",
      });
    } catch (e) {
      toast({
        title: "Erro ao copiar",
        description: "Não foi possível copiar o conteúdo.",
      });
    } finally {
      setCopying(false);
    }
  }

  // Atalho Ctrl+Enter para reescrever
  useEffect(() => {
    function handleKeyDown(e: KeyboardEvent) {
      if ((e.ctrlKey || e.metaKey) && e.key === "Enter") {
        if (!requisitando && textoOriginal.trim()) {
          reescreverTexto();
        }
      }
    }
    window.addEventListener("keydown", handleKeyDown);
    return () => window.removeEventListener("keydown", handleKeyDown);
  }, [requisitando, textoOriginal]);

  return (
    <div className="min-h-screen flex flex-col bg-gradient-to-br from-slate-50 to-blue-50">
      <PageHeader
        title="Reescrever Texto"
        subtitle="Reescreva textos jurídicos de forma clara, formal e adequada ao mundo da advocacia."
        icon={<FileSearch className="w-7 h-7 text-white" />}
      />

      <div className="flex flex-1 w-full max-w-7xl mx-auto py-8 gap-8 flex-col lg:flex-row">
        {/* Coluna Esquerda: Upload e Configurações */}
        <section className="w-full lg:w-1/2 flex flex-col gap-8">
          {/* Card de Upload de Texto */}
          <Card className="bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 group">
            <CardHeader className="pb-4">
              <CardTitle className="flex items-center gap-3 text-xl font-bold text-gradient-aiudex">
                <div className="w-12 h-12 bg-gradient-aiudex rounded-2xl flex items-center justify-center shadow-aiudex group-hover:shadow-aiudex-lg transition-all duration-300">
                  <FileText className="w-6 h-6 text-white" />
                </div>
                <div>
                  <div>Texto Original</div>
                  <div className="text-sm font-normal text-blue-700">
                    Cole ou digite o texto a ser reescrito
                  </div>
                </div>
              </CardTitle>
            </CardHeader>
            <CardContent className="space-y-4">
              <div className="flex gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={() => setTextoOriginal("")}
                  className="rounded-full border-2 border-red-300 text-red-700 bg-white/90 backdrop-blur-sm hover:bg-red-50 transition-all shadow-aiudex">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>

              <div className="relative">
                <textarea
                  className="w-full min-h-[350px] max-h-[500px] border-2 border-blue-200/50 rounded-xl p-4 text-sm focus:outline-none focus:ring-4 focus:ring-blue-400/30 focus:border-blue-500 transition-all resize-none bg-white/95 backdrop-blur-sm shadow-aiudex"
                  maxLength={3000}
                  value={textoOriginal}
                  onChange={(e) => setTextoOriginal(e.target.value)}
                  disabled={requisitando}
                  placeholder="Cole aqui o texto que deseja reescrever..."
                  required
                />
                <div className="absolute bottom-3 right-3">
                  <Badge
                    variant={
                      textoOriginal.length > 2900
                        ? "destructive"
                        : textoOriginal.length > 2500
                        ? "secondary"
                        : "outline"
                    }
                    className="text-xs">
                    {textoOriginal.length} / 3000
                  </Badge>
                </div>
              </div>
            </CardContent>
          </Card>

          {/* Cards de Configuração */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Card de Criatividade */}
            <Card className="bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 group hover:shadow-aiudex-xl hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-aiudex-secondary rounded-2xl flex items-center justify-center shadow-aiudex">
                  <Sparkles className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gradient-aiudex-secondary text-base">
                    Criatividade
                  </h4>
                  <p className="text-xs text-blue-700 font-medium">
                    Nível de inovação
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {CRIATIVIDADE.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setCriatividade(option.value)}
                    disabled={requisitando}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                      criatividade === option.value
                        ? "bg-gradient-aiudex-secondary text-white shadow-aiudex-lg transform scale-105"
                        : "bg-white/60 hover:bg-white/80 text-blue-700 hover:shadow-aiudex"
                    }`}>
                    <div
                      className={`p-1.5 rounded-lg ${
                        criatividade === option.value
                          ? "bg-white/30"
                          : "bg-blue-100"
                      }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {option.label}
                      </div>
                      <div
                        className={`text-xs ${
                          criatividade === option.value
                            ? "text-white/90"
                            : "text-blue-600"
                        }`}>
                        {option.desc}
                      </div>
                    </div>
                    {criatividade === option.value && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Card de Tom de Voz */}
            <Card className="bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 group hover:shadow-aiudex-xl hover:scale-105">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-aiudex rounded-2xl flex items-center justify-center shadow-aiudex">
                  <Volume2 className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gradient-aiudex text-base">
                    Tom de Voz
                  </h4>
                  <p className="text-xs text-blue-700 font-medium">
                    Estilo de linguagem
                  </p>
                </div>
              </div>

              <div className="space-y-2">
                {TOM.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setTom(option.value)}
                    disabled={requisitando}
                    className={`w-full flex items-center gap-3 p-3 rounded-xl text-left transition-all duration-200 ${
                      tom === option.value
                        ? "bg-gradient-aiudex text-white shadow-aiudex-lg transform scale-105"
                        : "bg-white/60 hover:bg-white/80 text-blue-700 hover:shadow-aiudex"
                    }`}>
                    <div
                      className={`p-1.5 rounded-lg ${
                        tom === option.value ? "bg-white/30" : "bg-blue-100"
                      }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-semibold text-sm">
                        {option.label}
                      </div>
                      <div
                        className={`text-xs ${
                          tom === option.value
                            ? "text-white/90"
                            : "text-blue-600"
                        }`}>
                        {option.desc}
                      </div>
                    </div>
                    {tom === option.value && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </Card>

            {/* Card de Ponto de Vista */}
            <Card className="bg-white border border-gray-200 rounded-lg shadow-lg transition-all duration-300 group hover:shadow-aiudex-xl hover:scale-105 md:col-span-2">
              <div className="flex items-center gap-3 mb-4">
                <div className="w-10 h-10 bg-gradient-aiudex rounded-2xl flex items-center justify-center shadow-aiudex">
                  <User className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h4 className="font-bold text-gradient-aiudex text-base">
                    Ponto de Vista
                  </h4>
                  <p className="text-xs text-blue-700 font-medium">
                    Perspectiva narrativa
                  </p>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
                {PONTO_VISTA.map((option) => (
                  <button
                    key={option.value}
                    onClick={() => setPontoVista(option.value)}
                    disabled={requisitando}
                    className={`flex items-center gap-3 p-4 rounded-xl text-left transition-all duration-200 ${
                      pontoVista === option.value
                        ? "bg-gradient-to-r from-orange-500 to-yellow-500 text-white shadow-lg transform scale-105"
                        : "bg-white/60 hover:bg-white/80 text-gray-700 hover:shadow-md"
                    }`}>
                    <div
                      className={`p-2 rounded-lg ${
                        pontoVista === option.value
                          ? "bg-white/20"
                          : "bg-orange-100"
                      }`}>
                      {option.icon}
                    </div>
                    <div className="flex-1">
                      <div className="font-medium text-sm">{option.label}</div>
                      <div
                        className={`text-xs ${
                          pontoVista === option.value
                            ? "text-white/80"
                            : "text-gray-500"
                        }`}>
                        {option.desc}
                      </div>
                    </div>
                    {pontoVista === option.value && (
                      <CheckCircle className="w-5 h-5 text-white" />
                    )}
                  </button>
                ))}
              </div>
            </Card>
          </div>

          {/* Botão de Reescrever */}
          <Button
            size="lg"
            className="w-full h-16 bg-gradient-aiudex hover:shadow-aiudex-lg text-white font-bold text-lg rounded-xl shadow-aiudex transition-all duration-300 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            disabled={requisitando || !textoOriginal.trim()}
            onClick={reescreverTexto}
            aria-label="Reescrever texto (Ctrl+Enter)"
            title="Clique ou pressione Ctrl+Enter para reescrever">
            {requisitando ? (
              <>
                <RefreshCw className="w-5 h-5 mr-2 animate-spin" />
                Reescrevendo...
              </>
            ) : (
              <>
                <Zap className="w-5 h-5 mr-2" />
                Reescrever Texto
              </>
            )}
          </Button>
        </section>

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
                  Texto Reescrito
                </h2>
                <p className="text-blue-700 font-medium">
                  Resultado da reescrita com IA
                </p>
              </div>
            </div>

            {textoReescrito && (
              <div className="flex gap-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={copyToClipboard}
                  disabled={copying}
                  className="rounded-full border-2 border-blue-300 text-blue-700 bg-white/90 backdrop-blur-sm hover:bg-blue-50 transition-all shadow-aiudex">
                  <Copy className="w-4 h-4 mr-2" />
                  {copying ? "Copiando..." : "Copiar"}
                </Button>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => setTextoReescrito("")}
                  className="rounded-full border-2 border-red-300 text-red-700 bg-white/90 backdrop-blur-sm hover:bg-red-50 transition-all shadow-aiudex">
                  <Trash2 className="w-4 h-4 mr-2" />
                  Limpar
                </Button>
              </div>
            )}
          </div>

          {/* Barra de Progresso */}
          {requisitando && (
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
                  {logs.map((log, i) => (
                    <div
                      key={i}
                      className="text-sm text-blue-700 font-medium animate-fade-in-up"
                      style={{
                        animationDelay: `${i * 200}ms`,
                        animationFillMode: "both",
                      }}>
                      <span className="inline-block w-2 h-2 bg-gradient-aiudex rounded-full mr-2 animate-pulse shadow-aiudex"></span>
                      {log}
                    </div>
                  ))}
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
                    Editor de Texto Reescrito
                  </span>
                </div>
                {textoReescrito && (
                  <Badge
                    variant="outline"
                    className="text-xs bg-white/20 text-white border-white/30">
                    {textoReescrito.length} caracteres
                  </Badge>
                )}
              </div>
            </CardHeader>

            <CardContent className="p-0">
              <div className="relative">
                {requisitando && (
                  <div className="absolute inset-0 z-10 flex items-center justify-center bg-white/90 backdrop-blur-md rounded-b-3xl">
                    <div className="text-center">
                      <RefreshCw className="w-8 h-8 text-gradient-aiudex animate-spin mx-auto mb-2" />
                      <span className="text-blue-700 font-bold">
                        Reescrevendo texto...
                      </span>
                    </div>
                  </div>
                )}

                {textoReescrito ? (
                  <div className="min-h-[400px] p-6">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-inner">
                      <div
                        className="prose prose-sm max-w-none text-gray-900 leading-relaxed"
                        style={{
                          fontFamily: '"Times New Roman", serif',
                          fontSize: "12pt",
                          lineHeight: "1.5",
                        }}
                        dangerouslySetInnerHTML={{
                          __html:
                            editorValue ||
                            textoReescrito.replace(/\n/g, "<br/>"),
                        }}
                      />
                    </div>
                  </div>
                ) : (
                  <div className="min-h-[400px] flex items-center justify-center text-gray-500">
                    <div className="text-center">
                      <FileText className="w-12 h-12 mx-auto mb-4 text-gray-300" />
                      <p>Nenhum texto reescrito disponível</p>
                    </div>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        </section>
      </div>
    </div>
  );
}
