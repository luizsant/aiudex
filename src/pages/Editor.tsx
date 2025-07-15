import React, { useState, useEffect } from "react";
import { useEditorState } from "@/editor-refatorado/hooks/useEditorState";
import { useEditorActions } from "@/editor-refatorado/hooks/useEditorActions";
import { ETAPAS, ICON_MAP } from "@/editor-refatorado/constants";
import { EtapaCliente } from "@/editor-refatorado/components/EtapaCliente";
import { EtapaArea } from "@/editor-refatorado/components/EtapaArea";
import { EtapaFatos } from "@/editor-refatorado/components/EtapaFatos";
import { EtapaProcesso } from "@/editor-refatorado/components/EtapaProcesso";
import { EtapaTeses } from "@/editor-refatorado/components/EtapaTeses";
import { EtapaFinal } from "@/editor-refatorado/components/EtapaFinal";
import { PageHeader } from "@/components/PageHeader";
import { Card } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { FileText, Menu, X, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

const Editor: React.FC = () => {
  const [isSidebarOpen, setIsSidebarOpen] = useState(false);
  const [isMobile, setIsMobile] = useState(false);

  // Detectar se é mobile e configurar estado inicial
  useEffect(() => {
    const checkMobile = () => {
      const mobile = window.innerWidth < 1024; // lg breakpoint
      setIsMobile(mobile);
      // No mobile, sidebar começa fechado; no desktop, aberto
      if (mobile) {
        setIsSidebarOpen(false);
      } else {
        setIsSidebarOpen(true);
      }
    };

    checkMobile();
    window.addEventListener("resize", checkMobile);
    return () => window.removeEventListener("resize", checkMobile);
  }, []);

  // Prevenir scroll quando sidebar mobile está aberto
  useEffect(() => {
    if (isMobile && isSidebarOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMobile, isSidebarOpen]);

  try {
    const editorState = useEditorState();
    const { state } = editorState;

    // Configurar useEditorActions corretamente
    const actions = useEditorActions({
      state: state,
      setState: editorState.updateState,
      setClientes: editorState.setClientes,
      setPoloClientes: editorState.setPoloClientes,
      setClientesDisponiveis: editorState.setClientesDisponiveis,
      setPartesRe: editorState.setPartesRe,
      setTopicos: editorState.setTopicos,
      setTeses: editorState.setTeses,
      setJuris: editorState.setJuris,
      setLogs: editorState.setLogs,
      setProgresso: editorState.setProgresso,
      setTextoFinal: editorState.setTextoFinal,
      setGerando: editorState.setGerando,
      setAnalisandoTeses: editorState.setAnalisandoTeses,
      setSugestoesTesesIA: editorState.setSugestoesTesesIA,
      setSugestoesJurisIA: editorState.setSugestoesJurisIA,
    });

    const etapaAtual = ETAPAS[state.etapa] || ETAPAS[0];

    // Mapeamento dos ícones por etapa
    const iconesEtapas = [
      "Users",
      "Gavel",
      "FileText",
      "BookOpen",
      "Shield",
      "Edit3",
    ];

    // Função para renderizar o componente da etapa atual
    const renderEtapaAtual = () => {
      const onNext = () =>
        actions.setEtapa(Math.min(ETAPAS.length - 1, state.etapa + 1));
      const onPrev = () => actions.setEtapa(Math.max(0, state.etapa - 1));
      const onEditEtapa = (etapa: number) => actions.setEtapa(etapa);

      switch (state.etapa) {
        case 0:
          return (
            <EtapaCliente state={state} actions={actions} onNext={onNext} />
          );
        case 1:
          return (
            <EtapaArea
              state={state}
              actions={actions}
              onNext={onNext}
              onPrev={onPrev}
            />
          );
        case 2:
          return (
            <EtapaFatos
              state={state}
              actions={actions}
              onNext={onNext}
              onPrev={onPrev}
            />
          );
        case 3:
          return (
            <EtapaProcesso
              state={state}
              actions={actions}
              onNext={onNext}
              onPrev={onPrev}
            />
          );
        case 4:
          return (
            <EtapaTeses
              state={state}
              actions={actions}
              onNext={onNext}
              onPrev={onPrev}
            />
          );
        case 5:
          return <EtapaFinal state={state} actions={actions} onPrev={onPrev} />;
        default:
          return (
            <div className="text-center p-8">
              <p className="text-gray-500">Etapa não encontrada</p>
            </div>
          );
      }
    };

    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Editor Jurídico AI"
          subtitle="Criação de peças jurídicas com inteligência artificial"
          icon={<FileText className="w-7 h-7 text-white" />}
          actions={
            <div className="flex items-center space-x-2">
              {/* Botão toggle sidebar para mobile */}
              <Button
                variant="outline"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="lg:hidden bg-white/20 text-white border-white/30 hover:bg-white/30">
                {isSidebarOpen ? (
                  <X className="w-4 h-4 mr-2" />
                ) : (
                  <Menu className="w-4 h-4 mr-2" />
                )}
                <span className="hidden sm:inline">
                  {isSidebarOpen ? "Fechar" : "Etapas"}
                </span>
              </Button>

              {/* Indicador de progresso para mobile */}
              <div className="lg:hidden bg-white/20 px-3 py-1 rounded-lg">
                <span className="text-white text-sm font-medium">
                  {state.etapa + 1}/{ETAPAS.length}
                </span>
              </div>
            </div>
          }
        />

        <div className="flex relative">
          {/* Overlay para mobile */}
          {isMobile && isSidebarOpen && (
            <div
              className="fixed inset-0 bg-black/50 backdrop-blur-sm z-40 lg:hidden"
              onClick={() => setIsSidebarOpen(false)}
            />
          )}

          {/* Sidebar com etapas */}
          <div
            className={cn(
              "bg-white shadow-lg border-r border-gray-200 transition-all duration-300 ease-in-out z-50",
              // Desktop: sempre visível, largura fixa
              "lg:relative lg:translate-x-0",
              isSidebarOpen ? "lg:w-80" : "lg:w-16",
              // Mobile: overlay fixo
              "lg:min-h-screen",
              isMobile && "fixed top-16 left-0 bottom-0 w-80",
              isMobile &&
                (isSidebarOpen ? "translate-x-0" : "-translate-x-full")
            )}>
            {/* Toggle button para desktop */}
            <div className="hidden lg:block">
              <Button
                variant="ghost"
                size="sm"
                onClick={() => setIsSidebarOpen(!isSidebarOpen)}
                className="absolute -right-3 top-6 z-10 w-6 h-6 p-0 bg-white border border-gray-200 shadow-md hover:bg-gray-50 rounded-full">
                {isSidebarOpen ? (
                  <ChevronLeft className="w-3 h-3" />
                ) : (
                  <ChevronRight className="w-3 h-3" />
                )}
              </Button>
            </div>

            <div className={cn("p-6", !isSidebarOpen && "lg:p-3")}>
              {(isSidebarOpen || isMobile) && (
                <>
                  <div className="flex items-center justify-between mb-4">
                    <h3 className="text-lg font-semibold text-gray-800">
                      Etapas do Processo
                    </h3>
                    {/* Botão fechar para mobile */}
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={() => setIsSidebarOpen(false)}
                      className="lg:hidden w-8 h-8 p-0">
                      <X className="w-4 h-4" />
                    </Button>
                  </div>

                  <div className="space-y-2">
                    {ETAPAS.map((etapa, index) => {
                      const IconComponent =
                        ICON_MAP[iconesEtapas[index] || "FileText"];
                      const isActive = state.etapa === index;
                      const isCompleted = index < state.etapa;
                      const isAccessible = index <= state.etapa;

                      return (
                        <Button
                          key={etapa.id}
                          variant={isActive ? "default" : "ghost"}
                          className={cn(
                            "w-full justify-start h-auto p-4 text-left",
                            isActive &&
                              "bg-blue-600 text-white hover:bg-blue-700",
                            !isActive &&
                              isCompleted &&
                              "bg-green-50 text-green-700 hover:bg-green-100",
                            !isActive &&
                              !isCompleted &&
                              !isAccessible &&
                              "opacity-50 cursor-not-allowed"
                          )}
                          onClick={() => {
                            if (isAccessible) {
                              actions.setEtapa(index);
                              // Fechar sidebar no mobile após seleção
                              if (isMobile) {
                                setIsSidebarOpen(false);
                              }
                            }
                          }}
                          disabled={!isAccessible}>
                          <div className="flex items-center space-x-3">
                            <div
                              className={cn(
                                "p-2 rounded-lg",
                                isActive && "bg-blue-500",
                                !isActive && isCompleted && "bg-green-200",
                                !isActive && !isCompleted && "bg-gray-100"
                              )}>
                              <IconComponent
                                className={cn(
                                  "w-5 h-5",
                                  isActive && "text-white",
                                  !isActive && isCompleted && "text-green-600",
                                  !isActive && !isCompleted && "text-gray-400"
                                )}
                              />
                            </div>
                            <div className="flex-1">
                              <div className="flex items-center justify-between">
                                <span className="font-medium">
                                  {etapa.name}
                                </span>
                                <span className="text-sm opacity-75">
                                  {index + 1}/{ETAPAS.length}
                                </span>
                              </div>
                              <div className="text-sm opacity-75 mt-1">
                                {isCompleted && "✓ Concluída"}
                                {isActive && "Em andamento"}
                                {!isCompleted &&
                                  !isActive &&
                                  !isAccessible &&
                                  "Bloqueada"}
                                {!isCompleted &&
                                  !isActive &&
                                  isAccessible &&
                                  "Disponível"}
                              </div>
                            </div>
                          </div>
                        </Button>
                      );
                    })}
                  </div>

                  {/* Progresso geral */}
                  <div className="mt-6 p-4 bg-gray-50 rounded-lg">
                    <div className="flex items-center justify-between mb-2">
                      <span className="text-sm font-medium text-gray-700">
                        Progresso
                      </span>
                      <span className="text-sm text-gray-500">
                        {Math.round((state.etapa / (ETAPAS.length - 1)) * 100)}%
                      </span>
                    </div>
                    <div className="w-full bg-gray-200 rounded-full h-2">
                      <div
                        className="bg-blue-600 h-2 rounded-full transition-all duration-300"
                        style={{
                          width: `${
                            (state.etapa / (ETAPAS.length - 1)) * 100
                          }%`,
                        }}
                      />
                    </div>
                  </div>
                </>
              )}

              {/* Versão compacta para desktop */}
              {!isSidebarOpen && !isMobile && (
                <div className="space-y-2">
                  {ETAPAS.map((etapa, index) => {
                    const IconComponent =
                      ICON_MAP[iconesEtapas[index] || "FileText"];
                    const isActive = state.etapa === index;
                    const isCompleted = index < state.etapa;
                    const isAccessible = index <= state.etapa;

                    return (
                      <Button
                        key={etapa.id}
                        variant={isActive ? "default" : "ghost"}
                        className={cn(
                          "w-full justify-center p-2 relative group",
                          isActive &&
                            "bg-blue-600 text-white hover:bg-blue-700",
                          !isActive &&
                            isCompleted &&
                            "bg-green-50 text-green-700 hover:bg-green-100",
                          !isActive &&
                            !isCompleted &&
                            !isAccessible &&
                            "opacity-50 cursor-not-allowed"
                        )}
                        onClick={() => isAccessible && actions.setEtapa(index)}
                        disabled={!isAccessible}>
                        <IconComponent className="w-5 h-5" />

                        {/* Tooltip */}
                        <div className="absolute left-full ml-2 px-2 py-1 bg-gray-900 text-white text-xs rounded opacity-0 group-hover:opacity-100 transition-opacity duration-200 pointer-events-none whitespace-nowrap z-50">
                          {etapa.name}
                          <div className="text-gray-300">
                            {index + 1}/{ETAPAS.length}
                          </div>
                        </div>
                      </Button>
                    );
                  })}
                </div>
              )}
            </div>
          </div>

          {/* Conteúdo principal */}
          <div
            className={cn("flex-1 transition-all duration-300", "p-4 sm:p-6")}>
            <div className="max-w-4xl mx-auto">
              {/* Componente da etapa atual */}
              {renderEtapaAtual()}
            </div>
          </div>
        </div>
      </div>
    );
  } catch (error) {
    return (
      <div className="min-h-screen bg-gray-50">
        <PageHeader
          title="Editor Jurídico AI - Erro"
          subtitle="Erro ao carregar o editor"
          icon={<FileText className="w-7 h-7 text-white" />}
        />

        <div className="max-w-4xl mx-auto p-6">
          <Card className="p-6">
            <h2 className="text-xl font-bold mb-4 text-red-600">
              Erro Detectado
            </h2>
            <div className="bg-red-50 p-4 rounded-lg">
              <p className="text-red-800">❌ Erro ao carregar o editor:</p>
              <pre className="text-sm text-red-600 mt-2 whitespace-pre-wrap">
                {error instanceof Error ? error.message : String(error)}
              </pre>
            </div>
          </Card>
        </div>
      </div>
    );
  }
};

export default Editor;
