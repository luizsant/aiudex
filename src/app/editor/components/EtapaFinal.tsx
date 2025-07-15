"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Progress } from "@/components/ui/progress";
import { Separator } from "@/components/ui/separator";
import {
  FileText,
  Eye,
  Download,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
  Edit3,
  Save,
  RefreshCw,
  Users,
  Scale,
  MapPin,
  DollarSign,
  BookOpen,
  Gavel,
  Settings,
  Wand2,
  Bot,
  Zap,
  Clock,
  CheckSquare,
  Copy,
  ArrowLeft,
} from "lucide-react";
import { EtapaFinalProps } from "../types";
import { exportService } from "@/lib/export-service";
import { toast } from "@/components/ui/use-toast";
import { CreditsDisplay } from "@/components/CreditsDisplay";

export const EtapaFinal: React.FC<EtapaFinalProps> = ({
  state,
  actions,
  onPrev,
}) => {
  const [tituloPersonalizado, setTituloPersonalizado] = useState("");
  const [htmlPreview, setHtmlPreview] = useState("");

  // Gerar título automático baseado nos dados
  const gerarTituloAutomatico = () => {
    const peca = state.pecaSelecionada?.nome || "Peça Jurídica";
    const cliente =
      state.clientes[0]?.name || state.clientes[0]?.nome || "Cliente";
    return `${peca} - ${cliente}`;
  };

  useEffect(() => {
    if (!tituloPersonalizado) {
      setTituloPersonalizado(gerarTituloAutomatico());
    }
  }, [state.pecaSelecionada, state.clientes]);

  // Preview automático - atualizar HTML sempre que textoFinal mudar
  useEffect(() => {
    if (state.textoFinal && state.textoFinal.trim()) {
      const htmlFormatado = actions.gerarHtmlFormatado(state.textoFinal);
      setHtmlPreview(htmlFormatado);
    } else {
      setHtmlPreview("");
    }
  }, [state.textoFinal, actions.gerarHtmlFormatado]);

  // Função para limpar tags HTML para exportação
  const cleanHtmlTagsForExport = (content: string): string => {
    let cleaned = content;

    // Remover tags <center> mantendo apenas o conteúdo
    cleaned = cleaned.replace(/<center>(.*?)<\/center>/g, "$1");

    // Remover tags <strong> mantendo apenas o conteúdo
    cleaned = cleaned.replace(/<strong>(.*?)<\/strong>/g, "$1");

    // Remover tags <em> mantendo apenas o conteúdo
    cleaned = cleaned.replace(/<em>(.*?)<\/em>/g, "$1");

    // Converter &nbsp; para espaços normais
    cleaned = cleaned.replace(/&nbsp;/g, " ");

    return cleaned;
  };

  // Função para exportar para DOCX igual ao editor antigo
  const handleExportDocx = async () => {
    const doc = {
      id: Date.now().toString(),
      title: tituloPersonalizado || "Peça Jurídica",
      type: "petition",
      content: cleanHtmlTagsForExport(state.textoFinal)
        .replace(/\n{2,}/g, "\n")
        .replace(/[ \t]+\n/g, "\n")
        .replace(/\n[ \t]+/g, "\n")
        .replace(/(EXCELENT[ÍI]SSIMO\(A\)[^\n]+\n)([^\n]+)/i, "$1\n\n\n\n$2")
        .trim(),
      clientId: "",
      clientName: state.clientes.map((c) => c.name).join(", "),
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "finalized" as const,
      template: "",
      metadata: {
        causeValue: "",
        jurisdiction: "",
        theses: state.teses,
        jurisprudences: state.juris,
        blocks: [],
        aiGenerated: true,
      },
      tags: [],
      version: 1,
    };
    await exportService.exportToDOCX({ ...doc });
  };

  const resumoDados = {
    clientes: state.clientes.length,
    partesAdversas: state.partesRe.length,
    area: state.areaSelecionada,
    peca: state.pecaSelecionada?.nome,
    fatos: state.fatos.length,
    pedidos: state.pedidosEspecificos.length,
    topicos: state.topicos.length,
    teses: state.teses.length,
    jurisprudencias: state.juris.length,
    numeroProcesso: state.numeroProcesso,
    vara: state.varaJuizo,
    comarca: state.comarca,
    valorCausa: state.valorCausa,
  };

  const handleGerarPeca = async () => {
    // Salvar configurações no estado
    actions.setTituloDocumento(tituloPersonalizado);

    // Chamar função de geração
    await actions.gerarPecaIA();
  };

  const porcentagemCompleta = () => {
    let pontos = 0;
    let total = 7; // Removido vara/juízo que agora é opcional

    if (state.clientes.length > 0) pontos++;
    if (state.areaSelecionada) pontos++;
    if (state.pecaSelecionada) pontos++;
    if (state.fatos.trim()) pontos++;
    // Vara/Juízo é opcional, não conta pontos
    if (state.comarca.trim()) pontos++;
    if (state.teses.length > 0 || state.juris.length > 0) pontos++;
    if (tituloPersonalizado.trim()) pontos++;

    return Math.round((pontos / total) * 100);
  };

  return (
    <div className="w-full max-w-6xl mx-auto p-6">
      <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-blue-200/30">
        <CardHeader className="flex items-center gap-4 pb-4">
          <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
            <FileText className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
              Geração e Preview da Peça
            </CardTitle>
            <p className="text-blue-700 text-sm font-medium">
              Gere sua peça jurídica com IA e visualize o resultado
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Configurações de Geração */}
          <div className="space-y-4">
            <div>
              <Label
                htmlFor="titulo"
                className="text-sm font-medium text-gray-700">
                Título do Documento
              </Label>
              <Input
                id="titulo"
                value={tituloPersonalizado}
                onChange={(e) => setTituloPersonalizado(e.target.value)}
                placeholder="Digite o título da peça..."
                className="mt-1 bg-white/80"
              />
            </div>

            {/* Botão de Geração */}
            <button
              onClick={handleGerarPeca}
              disabled={state.gerando}
              className="mb-4 rounded-full bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold shadow-lg hover:shadow-xl transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed h-12 w-full flex items-center justify-center gap-2">
              {state.gerando ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Gerando...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Gerar Peça com IA
                </>
              )}
            </button>

            {/* Sistema de Progresso - EXATAMENTE igual ao editor antigo */}
            {state.gerando && (
              <div className="w-full max-w-6xl mx-auto mb-4">
                {/* Barra de progresso com animação suave */}
                <div className="relative mb-4">
                  <Progress
                    value={state.progresso}
                    className="h-3 rounded-full bg-blue-50 animate-pulse [&>div]:bg-gradient-to-r [&>div]:from-blue-500 [&>div]:to-green-500 [&>div]:transition-all [&>div]:duration-300 [&>div]:ease-out [&>div]:shadow-lg [&>div]:rounded-full"
                  />
                  {/* Indicador de progresso flutuante */}
                  <div
                    className="absolute -top-8 transition-all duration-500 ease-out opacity-90"
                    style={{
                      left: `${Math.min(Math.max(state.progresso, 5), 95)}%`,
                      transform: "translateX(-50%)",
                    }}>
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 text-white text-xs px-3 py-1 rounded-full shadow-lg font-medium">
                      {state.progresso}%
                    </div>
                    <div className="w-3 h-3 bg-gradient-to-r from-blue-500 to-green-500 transform rotate-45 mx-auto -mt-1 shadow-lg"></div>
                  </div>
                </div>
                {/* Logs com animação de digitação */}
                <div className="bg-gradient-to-br from-blue-50 to-emerald-50 rounded-xl p-4 border-2 border-blue-200/50 shadow-lg">
                  <div className="flex items-center mb-2">
                    <div className="w-2 h-2 bg-blue-500 rounded-full animate-pulse mr-2"></div>
                    <span className="text-sm font-medium text-blue-700">
                      Gerando peça jurídica...
                    </span>
                  </div>
                  <div className="space-y-1">
                    {state.logs.map((l, i) => (
                      <div
                        key={i}
                        className="text-sm text-gray-600"
                        style={{
                          animationDelay: `${i * 200}ms`,
                          animationFillMode: "both",
                        }}>
                        <span className="inline-block w-2 h-2 bg-green-400 rounded-full mr-2 animate-pulse"></span>
                        {l}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            )}

            {/* Preview da Peça - Só mostra quando há conteúdo */}
            {state.textoFinal && state.textoFinal.trim() && (
              <div className="mb-6 space-y-4">
                <div className="flex items-center justify-between">
                  <h3 className="text-lg font-semibold text-green-700">
                    ✨ Documento Gerado com Sucesso!
                  </h3>
                  <div className="flex space-x-2">
                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border border-blue-300 text-blue-700 bg-white hover:bg-blue-50 transition-all focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400"
                      onClick={() => {
                        navigator.clipboard.writeText(state.textoFinal);
                        toast({
                          title: "Texto copiado!",
                          description:
                            "O texto foi copiado para a área de transferência.",
                        });
                      }}>
                      <Copy className="w-4 h-4 mr-2" />
                      Copiar
                    </Button>

                    <Button
                      variant="outline"
                      size="sm"
                      className="rounded-full border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all focus:outline-none focus:ring-2 focus:ring-gray-400 focus:border-gray-400"
                      onClick={() => actions.setTextoFinal("")}>
                      Limpar
                    </Button>
                  </div>
                </div>
                <Tabs defaultValue="preview" className="w-full">
                  <TabsList className="grid w-full grid-cols-2">
                    <TabsTrigger value="preview">Visualizar</TabsTrigger>
                    <TabsTrigger value="edit">Editar</TabsTrigger>
                  </TabsList>
                  <TabsContent value="preview">
                    <div className="bg-white border border-gray-200 rounded-lg p-6 shadow-inner">
                      <div
                        className="prose prose-sm max-w-none text-gray-900 leading-relaxed"
                        style={{
                          fontFamily: '"Times New Roman", serif',
                          fontSize: "12pt",
                          lineHeight: "1.5",
                        }}
                        dangerouslySetInnerHTML={{ __html: htmlPreview }}
                      />
                    </div>
                  </TabsContent>
                  <TabsContent value="edit">
                    <Textarea
                      value={state.textoFinal}
                      onChange={(e) => actions.setTextoFinal(e.target.value)}
                      placeholder="Edite o documento gerado pela IA..."
                      className="min-h-[400px] bg-white/80"
                    />
                  </TabsContent>
                </Tabs>
              </div>
            )}

            {/* Botões de Ação */}
            <div className="flex gap-4 pt-4">
              <button
                onClick={onPrev}
                className="flex-1 h-12 rounded-xl border border-gray-300 text-gray-700 bg-white hover:bg-gray-50 transition-all duration-300 font-semibold flex items-center justify-center gap-2">
                <ArrowLeft className="w-4 h-4" />
                Voltar
              </button>
              <button
                onClick={handleExportDocx}
                disabled={!state.textoFinal || state.gerando}
                className="flex-1 h-12 bg-gradient-to-r from-emerald-600 to-blue-600 text-white font-bold rounded-xl shadow-lg hover:shadow-xl transition-all duration-300 focus:outline-none focus:ring-2 focus:ring-emerald-400 focus:border-emerald-400 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed flex items-center justify-center gap-2">
                <Download className="w-4 h-4" />
                Exportar para DOCX
              </button>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
