import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import { Textarea } from "@/components/ui/textarea";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  BookOpen,
  Search,
  Plus,
  X,
  Brain,
  Gavel,
  FileText,
  Sparkles,
  CheckCircle,
  AlertCircle,
  Loader2,
} from "lucide-react";
import { EtapaTesesProps } from "../types";

export const EtapaTeses: React.FC<EtapaTesesProps> = ({
  state,
  actions,
  onNext,
  onPrev,
}) => {
  const [buscaTeses, setBuscaTeses] = useState("");
  const [buscaJuris, setBuscaJuris] = useState("");
  const [novaTeseCustom, setNovaTeseCustom] = useState("");
  const [novaJurisCustom, setNovaJurisCustom] = useState("");
  const [mostrarFormTese, setMostrarFormTese] = useState(false);
  const [mostrarFormJuris, setMostrarFormJuris] = useState(false);

  // Análise automática de IA quando a etapa é carregada e há fatos
  useEffect(() => {
    // Só analisa se:
    // 1. Há fatos preenchidos
    // 2. Não está analisando no momento
    // 3. Não tem sugestões ainda (para evitar análise dupla)
    if (
      state.fatos?.trim() &&
      !state.analisandoTeses &&
      state.sugestoesTesesIA?.length === 0
    ) {
      actions.analisarFatosParaTeses();
    }
  }, [
    state.etapa,
    state.fatos,
    state.analisandoTeses,
    state.sugestoesTesesIA?.length,
    actions,
  ]);

  // Função para análise manual
  const handleAnalisarFatos = async () => {
    if (state.fatos?.trim()) {
      await actions.analisarFatosParaTeses();
    }
  };

  // Teses sugeridas baseadas na área selecionada
  const tesesSugeridas = {
    "Direito Civil": [
      "Responsabilidade civil objetiva",
      "Danos morais",
      "Teoria da perda de uma chance",
      "Responsabilidade por fato de terceiro",
      "Dano estético",
      "Responsabilidade civil do Estado",
      "Nexo causal",
      "Danos materiais",
    ],
    "Direito Trabalhista": [
      "Vínculo empregatício",
      "Horas extras",
      "Equiparação salarial",
      "Assédio moral",
      "Acidente de trabalho",
      "Terceirização ilícita",
      "Jornada de trabalho",
      "Rescisão indireta",
    ],
    "Direito Previdenciário": [
      "Aposentadoria por tempo de contribuição",
      "Auxílio-doença",
      "Pensão por morte",
      "Revisão de benefício",
      "Tempo especial",
      "Desaposentação",
      "Benefício assistencial",
      "Conversão de tempo",
    ],
    "Direito do Consumidor": [
      "Vício do produto",
      "Publicidade enganosa",
      "Cobrança indevida",
      "Inversão do ônus da prova",
      "Danos morais",
      "Descumprimento de oferta",
      "Cláusulas abusivas",
      "Direito de arrependimento",
    ],
    "Direito Penal": [
      "Legítima defesa",
      "Estado de necessidade",
      "Excludente de ilicitude",
      "Dosimetria da pena",
      "Prescrição",
      "Princípio da insignificância",
      "Erro de tipo",
      "Concurso de crimes",
    ],
    "Direito Tributário": [
      "Imunidade tributária",
      "Isenção fiscal",
      "Prescrição tributária",
      "Repetição de indébito",
      "Não incidência tributária",
      "Capacidade contributiva",
      "Modulação de efeitos",
      "Compensação tributária",
    ],
    "Direito Administrativo": [
      "Ato administrativo viciado",
      "Licitação",
      "Responsabilidade civil do Estado",
      "Supremacia do interesse público",
      "Poder discricionário",
      "Processo administrativo",
      "Serviços públicos",
      "Desapropriação",
    ],
    "Direito Empresarial": [
      "Desconsideração da personalidade jurídica",
      "Responsabilidade dos sócios",
      "Contratos empresariais",
      "Recuperação judicial",
      "Falência",
      "Propriedade intelectual",
      "Concorrência desleal",
      "Sociedades empresárias",
    ],
    "Direito Ambiental": [
      "Responsabilidade ambiental objetiva",
      "Poluidor-pagador",
      "Licenciamento ambiental",
      "Dano ambiental",
      "Áreas de preservação",
      "Compensação ambiental",
      "Crimes ambientais",
      "Estudos de impacto",
    ],
    "Direito de Família": [
      "Guarda compartilhada",
      "Pensão alimentícia",
      "União estável",
      "Dissolução conjugal",
      "Adoção",
      "Violência doméstica",
      "Alienação parental",
      "Regime de bens",
    ],
    "Direito Imobiliário": [
      "Usucapião urbana",
      "Compromisso de compra e venda",
      "Incorporação imobiliária",
      "Locação",
      "Condomínio edilício",
      "Registro de imóveis",
      "Direitos reais",
      "Posse e propriedade",
    ],
  };

  // Jurisprudências modelo baseadas na área
  const jurisprudenciasModelo = {
    "Direito Civil": [
      "STJ - Danos morais por negativação indevida",
      "STF - Responsabilidade civil objetiva",
      "TJSP - Teoria da perda de uma chance",
      "STJ - Dano estético cumulado com moral",
    ],
    "Direito Trabalhista": [
      "TST - Vínculo empregatício configurado",
      "TST - Horas extras habitualmente prestadas",
      "TST - Equiparação salarial",
      "TST - Assédio moral no ambiente de trabalho",
    ],
    "Direito Previdenciário": [
      "STJ - Aposentadoria especial",
      "TNU - Auxílio-doença e incapacidade",
      "STF - Revisão de benefício previdenciário",
      "STJ - Pensão por morte",
    ],
    "Direito do Consumidor": [
      "STJ - Inversão do ônus da prova",
      "STJ - Repetição do indébito",
      "TJSP - Vício do produto",
      "STJ - Publicidade enganosa",
    ],
    "Direito Penal": [
      "STF - Legítima defesa",
      "STJ - Princípio da insignificância",
      "STF - Dosimetria da pena",
      "STJ - Prescrição da pretensão punitiva",
    ],
    "Direito Tributário": [
      "STF - Imunidade tributária",
      "STJ - Repetição de indébito tributário",
      "STF - Prescrição e decadência",
      "STJ - Não incidência tributária",
    ],
    "Direito Administrativo": [
      "STF - Responsabilidade civil do Estado",
      "STJ - Ato administrativo viciado",
      "STF - Licitação e contratos",
      "STJ - Processo administrativo",
    ],
    "Direito Empresarial": [
      "STJ - Desconsideração da personalidade jurídica",
      "STJ - Recuperação judicial",
      "STF - Responsabilidade dos sócios",
      "STJ - Falência e liquidação",
    ],
    "Direito Ambiental": [
      "STF - Responsabilidade ambiental objetiva",
      "STJ - Princípio do poluidor-pagador",
      "STF - Licenciamento ambiental",
      "STJ - Dano ambiental",
    ],
    "Direito de Família": [
      "STJ - Guarda compartilhada",
      "STF - União estável",
      "STJ - Pensão alimentícia",
      "TJSP - Alienação parental",
    ],
    "Direito Imobiliário": [
      "STJ - Usucapião urbana",
      "STF - Compromisso de compra e venda",
      "STJ - Incorporação imobiliária",
      "TJSP - Locação e despejo",
    ],
  };

  const tesesDisponiveis = state.areaSelecionada
    ? tesesSugeridas[state.areaSelecionada as keyof typeof tesesSugeridas] || []
    : [];

  const jurisprudenciasDisponiveis = state.areaSelecionada
    ? jurisprudenciasModelo[
        state.areaSelecionada as keyof typeof jurisprudenciasModelo
      ] || []
    : [];

  const tesesFiltradas = tesesDisponiveis.filter((tese) =>
    tese.toLowerCase().includes(buscaTeses.toLowerCase())
  );

  const jurisprudenciasFiltradas = jurisprudenciasDisponiveis.filter((juris) =>
    juris.toLowerCase().includes(buscaJuris.toLowerCase())
  );

  const adicionarTeseCustom = () => {
    if (novaTeseCustom.trim()) {
      actions.toggleTese(novaTeseCustom.trim());
      setNovaTeseCustom("");
      setMostrarFormTese(false);
    }
  };

  const adicionarJurisCustom = () => {
    if (novaJurisCustom.trim()) {
      actions.toggleJurisprudencia(novaJurisCustom.trim());
      setNovaJurisCustom("");
      setMostrarFormJuris(false);
    }
  };

  const isFormValid = () => {
    return state.teses.length > 0 || state.juris.length > 0;
  };

  return (
    <div className="relative">
      {/* Loading Overlay */}
      {state.analisandoTeses && (
        <div className="absolute inset-0 bg-white/90 backdrop-blur-sm z-50 flex items-center justify-center rounded-3xl">
          <div className="text-center space-y-6">
            <div className="w-16 h-16 bg-gradient-to-r from-blue-600 to-purple-600 rounded-full flex items-center justify-center mx-auto shadow-lg">
              <Loader2 className="w-8 h-8 text-white animate-spin" />
            </div>
            <div className="space-y-3">
              <h3 className="text-lg font-semibold text-gray-800">
                Analisando seus fatos...
              </h3>
              <p className="text-sm text-gray-600 max-w-md">
                Nossa IA está analisando os fatos do seu caso para gerar
                sugestões personalizadas de teses e jurisprudências.
              </p>

              {/* Barra de Progresso */}
              <div className="w-64 mx-auto space-y-2">
                <div className="flex justify-between text-xs text-gray-500">
                  <span>Progresso</span>
                  <span>{Math.round(state.progresso)}%</span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-2">
                  <div
                    className="bg-gradient-to-r from-blue-600 to-purple-600 h-2 rounded-full transition-all duration-300 ease-out"
                    style={{ width: `${state.progresso}%` }}></div>
                </div>
              </div>

              {/* Logs de Progresso */}
              {state.logs.length > 0 && (
                <div className="w-80 mx-auto">
                  <div className="bg-gray-50 rounded-lg p-3 max-h-24 overflow-y-auto">
                    <div className="text-xs text-gray-600 space-y-1">
                      {state.logs.slice(-3).map((log, index) => (
                        <div key={index} className="flex items-start gap-2">
                          <div className="w-1.5 h-1.5 bg-blue-500 rounded-full mt-1.5 flex-shrink-0"></div>
                          <span className="leading-relaxed">{log}</span>
                        </div>
                      ))}
                    </div>
                  </div>
                </div>
              )}
            </div>

            <div className="flex items-center justify-center gap-2 text-xs text-gray-500">
              <div className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.1s" }}></div>
              <div
                className="w-2 h-2 bg-blue-600 rounded-full animate-bounce"
                style={{ animationDelay: "0.2s" }}></div>
            </div>
          </div>
        </div>
      )}

      <Card
        className={`bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-blue-200/30 hover:border-blue-400 transition-all duration-300 group mb-8 ${
          state.analisandoTeses ? "pointer-events-none" : ""
        }`}>
        <CardHeader className="flex items-center gap-4 pb-4">
          <div className="w-14 h-14 bg-gradient-to-r from-indigo-500 to-purple-500 rounded-2xl flex items-center justify-center shadow-lg">
            <BookOpen className="w-7 h-7 text-white" />
          </div>
          <div>
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-indigo-500 to-purple-500 bg-clip-text text-transparent">
              Teses e Jurisprudências
            </CardTitle>
            <p className="text-blue-700 text-sm font-medium">
              Selecione as teses jurídicas e jurisprudências relevantes para{" "}
              {state.areaSelecionada}
            </p>
          </div>
        </CardHeader>

        <CardContent className="space-y-6">
          {/* Botão de Análise de IA */}
          {state.fatos?.trim() && (
            <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200 rounded-xl">
              <CardContent className="p-4">
                <div className="flex items-center justify-between">
                  <div className="flex items-center gap-3">
                    <Brain className="w-5 h-5 text-blue-600" />
                    <div>
                      <h4 className="font-semibold text-blue-800">
                        Análise Inteligente
                      </h4>
                      <p className="text-sm text-blue-600">
                        Gere sugestões de teses e jurisprudências baseadas nos
                        seus fatos
                      </p>
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <Button
                      onClick={handleAnalisarFatos}
                      disabled={state.analisandoTeses}
                      className="bg-blue-600 hover:bg-blue-700 text-white">
                      {state.analisandoTeses ? (
                        <>
                          <Loader2 className="w-4 h-4 mr-2 animate-spin" />
                          Analisando...
                        </>
                      ) : (
                        <>
                          <Brain className="w-4 h-4 mr-2" />
                          Analisar com IA
                        </>
                      )}
                    </Button>
                  </div>
                </div>
              </CardContent>
            </Card>
          )}

          <Tabs defaultValue="teses" className="w-full">
            <TabsList className="grid w-full grid-cols-2">
              <TabsTrigger value="teses" className="flex items-center gap-2">
                <Gavel className="w-4 h-4" />
                Teses Jurídicas
              </TabsTrigger>
              <TabsTrigger
                value="jurisprudencias"
                className="flex items-center gap-2">
                <FileText className="w-4 h-4" />
                Jurisprudências
              </TabsTrigger>
            </TabsList>

            {/* Tab de Teses */}
            <TabsContent value="teses" className="space-y-4">
              {/* Busca de Teses */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Search className="w-4 h-4 text-indigo-600" />
                  Buscar Teses
                </Label>
                <Input
                  placeholder="Digite para buscar teses..."
                  value={buscaTeses}
                  onChange={(e) => setBuscaTeses(e.target.value)}
                  className="bg-white/80 border-gray-200 focus:border-indigo-400 focus:ring-indigo-400"
                />
              </div>

              {/* SEÇÃO: Sugestões de Teses da IA */}
              {state.analisandoTeses && state.sugestoesTesesIA.length === 0 && (
                <Card className="bg-blue-50 border-blue-200 rounded-xl mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-blue-600 animate-spin" />
                      <div>
                        <h4 className="font-semibold text-blue-800">
                          🎯 Gerando Sugestões de Teses...
                        </h4>
                        <p className="text-sm text-blue-700">
                          Analisando seus fatos para sugerir teses relevantes
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {state.sugestoesTesesIA.length > 0 && (
                <Card className="bg-blue-50 border-blue-200 rounded-xl mb-6">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-blue-800 mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Sugestões de Teses da IA
                    </h4>
                    <p className="text-sm text-blue-700 mb-3">
                      Baseadas na análise dos seus fatos
                    </p>
                    <div className="space-y-3">
                      {state.sugestoesTesesIA.map((sugestao, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                            state.teses.includes(sugestao)
                              ? "bg-green-50 border-green-300 shadow-sm"
                              : "bg-white border-gray-200 hover:border-blue-300 hover:bg-blue-50/50"
                          }`}
                          onClick={() => actions.toggleTese(sugestao)}>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 leading-relaxed">
                                {sugestao}
                              </p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <Badge
                                variant={
                                  state.teses.includes(sugestao)
                                    ? "default"
                                    : "secondary"
                                }
                                className={`transition-all duration-200 ${
                                  state.teses.includes(sugestao)
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-100 text-gray-600 hover:bg-blue-100 hover:text-blue-700"
                                }`}>
                                {state.teses.includes(sugestao) ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Selecionada
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3 mr-1" />
                                    Selecionar
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Teses Sugeridas */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-indigo-600" />
                  Teses Sugeridas para {state.areaSelecionada}
                </h4>
                <div className="grid gap-2 max-h-64 overflow-y-auto">
                  {tesesFiltradas.map((tese, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        state.teses.includes(tese)
                          ? "bg-indigo-50 border-indigo-300 shadow-sm"
                          : "bg-white border-gray-200 hover:border-indigo-300"
                      }`}
                      onClick={() => actions.toggleTese(tese)}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">
                          {tese}
                        </span>
                        {state.teses.includes(tese) && (
                          <CheckCircle className="w-4 h-4 text-indigo-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adicionar Tese Customizada */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setMostrarFormTese(!mostrarFormTese)}
                  className="w-full flex items-center gap-2 border-dashed border-indigo-300 text-indigo-600 hover:bg-indigo-50">
                  <Plus className="w-4 h-4" />
                  Adicionar Tese Personalizada
                </Button>

                {mostrarFormTese && (
                  <div className="space-y-2 p-4 bg-indigo-50 rounded-lg">
                    <Textarea
                      placeholder="Descreva sua tese jurídica personalizada..."
                      value={novaTeseCustom}
                      onChange={(e) => setNovaTeseCustom(e.target.value)}
                      className="bg-white border-indigo-200 focus:border-indigo-400"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={adicionarTeseCustom}
                        disabled={!novaTeseCustom.trim()}
                        className="flex-1 bg-indigo-600 hover:bg-indigo-700">
                        Adicionar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMostrarFormTese(false);
                          setNovaTeseCustom("");
                        }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {/* Teses Selecionadas em Cards */}
              {state.teses.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-indigo-700 mb-2">
                    Teses Selecionadas ({state.teses.length}):
                  </p>
                  <div className="flex flex-col gap-3">
                    {state.teses.map((tese, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-indigo-50 border border-indigo-300 rounded-xl shadow-sm w-full">
                        <CheckCircle className="w-5 h-5 text-indigo-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-indigo-900 flex-1 whitespace-pre-line break-words">
                          {tese}
                        </span>
                        <button
                          onClick={() => actions.toggleTese(tese)}
                          className="text-red-500 hover:text-red-700 p-1 ml-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>

            {/* Tab de Jurisprudências */}
            <TabsContent value="jurisprudencias" className="space-y-4">
              {/* Busca de Jurisprudências */}
              <div className="space-y-2">
                <Label className="text-sm font-semibold text-gray-700 flex items-center gap-2">
                  <Search className="w-4 h-4 text-purple-600" />
                  Buscar Jurisprudências
                </Label>
                <Input
                  placeholder="Digite para buscar jurisprudências..."
                  value={buscaJuris}
                  onChange={(e) => setBuscaJuris(e.target.value)}
                  className="bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400"
                />
              </div>

              {/* SEÇÃO: Sugestões de Jurisprudências da IA */}
              {state.analisandoTeses && state.sugestoesJurisIA.length === 0 && (
                <Card className="bg-green-50 border-green-200 rounded-xl mb-6">
                  <CardContent className="p-4">
                    <div className="flex items-center gap-3">
                      <Loader2 className="w-5 h-5 text-green-600 animate-spin" />
                      <div>
                        <h4 className="font-semibold text-green-800">
                          ⚖️ Gerando Sugestões de Jurisprudências...
                        </h4>
                        <p className="text-sm text-green-700">
                          Analisando seus fatos para sugerir jurisprudências
                          relevantes
                        </p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              )}

              {state.sugestoesJurisIA.length > 0 && (
                <Card className="bg-green-50 border-green-200 rounded-xl mb-6">
                  <CardContent className="p-4">
                    <h4 className="font-semibold text-green-800 mb-3 flex items-center gap-2">
                      <Brain className="w-4 h-4" />
                      Sugestões de Jurisprudências da IA
                    </h4>
                    <p className="text-sm text-green-700 mb-3">
                      Baseadas na análise dos seus fatos
                    </p>
                    <div className="space-y-3">
                      {state.sugestoesJurisIA.map((sugestao, index) => (
                        <div
                          key={index}
                          className={`p-4 rounded-lg border transition-all duration-200 cursor-pointer ${
                            state.juris.includes(sugestao)
                              ? "bg-green-50 border-green-300 shadow-sm"
                              : "bg-white border-gray-200 hover:border-green-300 hover:bg-green-50/50"
                          }`}
                          onClick={() =>
                            actions.toggleJurisprudencia(sugestao)
                          }>
                          <div className="flex items-start justify-between">
                            <div className="flex-1">
                              <p className="text-sm text-gray-800 leading-relaxed">
                                {sugestao}
                              </p>
                            </div>
                            <div className="ml-3 flex-shrink-0">
                              <Badge
                                variant={
                                  state.juris.includes(sugestao)
                                    ? "default"
                                    : "secondary"
                                }
                                className={`transition-all duration-200 ${
                                  state.juris.includes(sugestao)
                                    ? "bg-green-600 text-white hover:bg-green-700"
                                    : "bg-gray-100 text-gray-600 hover:bg-green-100 hover:text-green-700"
                                }`}>
                                {state.juris.includes(sugestao) ? (
                                  <>
                                    <CheckCircle className="w-3 h-3 mr-1" />
                                    Selecionada
                                  </>
                                ) : (
                                  <>
                                    <Plus className="w-3 h-3 mr-1" />
                                    Selecionar
                                  </>
                                )}
                              </Badge>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                  </CardContent>
                </Card>
              )}

              {/* Jurisprudências Sugeridas */}
              <div className="space-y-3">
                <h4 className="font-semibold text-gray-800 flex items-center gap-2">
                  <Sparkles className="w-4 h-4 text-purple-600" />
                  Jurisprudências Modelo para {state.areaSelecionada}
                </h4>
                <div className="grid gap-2 max-h-64 overflow-y-auto">
                  {jurisprudenciasFiltradas.map((juris, index) => (
                    <div
                      key={index}
                      className={`p-3 rounded-lg border cursor-pointer transition-all duration-200 ${
                        state.juris.includes(juris)
                          ? "bg-purple-50 border-purple-300 shadow-sm"
                          : "bg-white border-gray-200 hover:border-purple-300"
                      }`}
                      onClick={() => actions.toggleJurisprudencia(juris)}>
                      <div className="flex items-center justify-between">
                        <span className="text-sm font-medium text-gray-800">
                          {juris}
                        </span>
                        {state.juris.includes(juris) && (
                          <CheckCircle className="w-4 h-4 text-purple-600" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              </div>

              {/* Adicionar Jurisprudência Customizada */}
              <div className="space-y-2">
                <Button
                  variant="outline"
                  onClick={() => setMostrarFormJuris(!mostrarFormJuris)}
                  className="w-full flex items-center gap-2 border-dashed border-purple-300 text-purple-600 hover:bg-purple-50">
                  <Plus className="w-4 h-4" />
                  Adicionar Jurisprudência Personalizada
                </Button>

                {mostrarFormJuris && (
                  <div className="space-y-2 p-4 bg-purple-50 rounded-lg">
                    <Textarea
                      placeholder="Descreva sua jurisprudência personalizada (tribunal, ementa, etc.)..."
                      value={novaJurisCustom}
                      onChange={(e) => setNovaJurisCustom(e.target.value)}
                      className="bg-white border-purple-200 focus:border-purple-400"
                      rows={3}
                    />
                    <div className="flex gap-2">
                      <Button
                        onClick={adicionarJurisCustom}
                        disabled={!novaJurisCustom.trim()}
                        className="flex-1 bg-purple-600 hover:bg-purple-700">
                        Adicionar
                      </Button>
                      <Button
                        variant="outline"
                        onClick={() => {
                          setMostrarFormJuris(false);
                          setNovaJurisCustom("");
                        }}>
                        Cancelar
                      </Button>
                    </div>
                  </div>
                )}
              </div>
              {/* Jurisprudências Selecionadas em Cards */}
              {state.juris.length > 0 && (
                <div>
                  <p className="text-sm font-medium text-purple-700 mb-2">
                    Jurisprudências Selecionadas ({state.juris.length}):
                  </p>
                  <div className="flex flex-col gap-3">
                    {state.juris.map((juris, index) => (
                      <div
                        key={index}
                        className="flex items-start gap-3 p-4 bg-purple-50 border border-purple-300 rounded-xl shadow-sm w-full">
                        <CheckCircle className="w-5 h-5 text-purple-600 mt-1 flex-shrink-0" />
                        <span className="text-sm text-purple-900 flex-1 whitespace-pre-line break-words">
                          {juris}
                        </span>
                        <button
                          onClick={() => actions.toggleJurisprudencia(juris)}
                          className="text-red-500 hover:text-red-700 p-1 ml-2">
                          <X className="w-4 h-4" />
                        </button>
                      </div>
                    ))}
                  </div>
                </div>
              )}
            </TabsContent>
          </Tabs>

          {/* Informações Adicionais */}
          <Card className="bg-amber-50 border-amber-200 rounded-xl">
            <CardContent className="p-4">
              <h4 className="font-semibold text-amber-800 mb-2 flex items-center gap-2">
                <AlertCircle className="w-4 h-4" />
                Dicas Importantes
              </h4>
              <ul className="text-sm text-amber-700 space-y-1">
                <li>
                  • Selecione pelo menos uma tese ou jurisprudência para
                  prosseguir
                </li>
                <li>• As teses são os fundamentos jurídicos da sua peça</li>
                <li>• As jurisprudências fortalecem seus argumentos</li>
                <li>
                  • Você pode adicionar teses e jurisprudências personalizadas
                </li>
                <li>• Use a busca para encontrar rapidamente o que precisa</li>
              </ul>
            </CardContent>
          </Card>

          {/* Botões de Navegação */}
          <div className="flex gap-4 mt-8">
            <Button
              variant="outline"
              onClick={onPrev}
              className="flex-1 h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300">
              Voltar
            </Button>

            <Button
              onClick={onNext}
              disabled={!isFormValid()}
              className="flex-1 h-12 bg-gradient-to-r from-indigo-500 to-purple-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed">
              Próximo
            </Button>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};
