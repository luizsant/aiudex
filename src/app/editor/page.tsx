"use client";

import React from "react";
import Layout from "@/components/Layout";
import { PageHeader } from "@/components/PageHeader";
import { useEditorState } from "./hooks/useEditorState";
import { useEditorActions } from "./hooks/useEditorActions";
import { EtapaCliente } from "./components/EtapaCliente";
import { EtapaArea } from "./components/EtapaArea";
import { EtapaFatos } from "./components/EtapaFatos";
import { EtapaProcesso } from "./components/EtapaProcesso";
import { EtapaTeses } from "./components/EtapaTeses";
import { EtapaRevisao } from "./components/EtapaRevisao";
import { EtapaFinal } from "./components/EtapaFinal";
import { FileText } from "lucide-react";

export default function EditorPage() {
  const {
    state,
    setEtapa,
    nextEtapa,
    prevEtapa,
    setClientes,
    setPoloClientes,
    setClientesDisponiveis,
    setPartesRe,
    setTopicos,
    setTeses,
    setJuris,
    setLogs,
    setProgresso,
    setTextoFinal,
    setGerando,
    setAnalisandoTeses,
    setSugestoesTesesIA,
    setSugestoesJurisIA,
    setFatos,
    setPedidosEspecificos,
    setAreaSelecionada,
    setPecaSelecionada,
    setNumeroProcesso,
    setVaraJuizo,
    setComarca,
    setValorCausa,
    setTituloDocumento,
  } = useEditorState();

  const actions = useEditorActions({
    state,
    setState: (updates) => {
      // Implementar setState baseado nos setters disponíveis
      Object.entries(updates).forEach(([key, value]) => {
        switch (key) {
          case "fatos":
            setFatos(value as string);
            break;
          case "pedidosEspecificos":
            setPedidosEspecificos(value as string);
            break;
          case "areaSelecionada":
            setAreaSelecionada(value as string);
            break;
          case "pecaSelecionada":
            setPecaSelecionada(value as any);
            break;
          case "numeroProcesso":
            setNumeroProcesso(value as string);
            break;
          case "varaJuizo":
            setVaraJuizo(value as string);
            break;
          case "comarca":
            setComarca(value as string);
            break;
          case "valorCausa":
            setValorCausa(value as string);
            break;
          case "tituloDocumento":
            setTituloDocumento(value as string);
            break;
          case "etapa":
            setEtapa(value as number);
            break;
        }
      });
    },
    setClientes,
    setPoloClientes,
    setClientesDisponiveis,
    setPartesRe,
    setTopicos,
    setTeses,
    setJuris,
    setLogs,
    setProgresso,
    setTextoFinal,
    setGerando,
    setAnalisandoTeses,
    setSugestoesTesesIA,
    setSugestoesJurisIA,
  });

  // Função para verificar se uma etapa está completa
  const isEtapaCompleta = (etapaId: number): boolean => {
    switch (etapaId) {
      case 0: // Cliente
        return state.clientes.length > 0;
      case 1: // Área/Peça
        return !!(state.areaSelecionada && state.pecaSelecionada);
      case 2: // Fatos
        return state.fatos.trim().length > 0;
      case 3: // Processo
        return (
          state.numeroProcesso.trim().length > 0 ||
          state.varaJuizo.trim().length > 0 ||
          state.comarca.trim().length > 0
        );
      case 4: // Teses
        return state.teses.length > 0 || state.juris.length > 0;
      case 5: // Revisão
        return true; // Sempre acessível
      case 6: // Geração
        return true; // Sempre acessível
      default:
        return false;
    }
  };

  // Função para verificar se uma etapa está acessível
  const isEtapaAcessivel = (etapaId: number): boolean => {
    // A primeira etapa sempre é acessível
    if (etapaId === 0) return true;

    // Para outras etapas, verificar se a anterior está completa
    return isEtapaCompleta(etapaId - 1);
  };

  const handleNext = () => {
    // Só permite avançar se a etapa atual estiver completa
    if (isEtapaCompleta(state.etapa)) {
      nextEtapa();
    }
  };

  const handlePrev = () => {
    prevEtapa();
  };

  const handleEditEtapa = (etapa: number) => {
    // Só permite editar se a etapa for acessível
    if (isEtapaAcessivel(etapa)) {
      setEtapa(etapa);
    }
  };

  const etapas = [
    { id: 0, nome: "Cliente", descricao: "Selecione os clientes" },
    { id: 1, nome: "Área/Peça", descricao: "Escolha a área e tipo" },
    { id: 2, nome: "Fatos", descricao: "Descreva os fatos" },
    { id: 3, nome: "Processo", descricao: "Dados processuais" },
    { id: 4, nome: "Teses", descricao: "Teses e jurisprudências" },
    { id: 5, nome: "Revisão", descricao: "Confirme os dados" },
    { id: 6, nome: "Geração", descricao: "Gere a peça" },
  ];

  const renderEtapaAtual = () => {
    switch (state.etapa) {
      case 0:
        return (
          <EtapaCliente state={state} actions={actions} onNext={handleNext} />
        );
      case 1:
        return (
          <EtapaArea
            state={state}
            actions={actions}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 2:
        return (
          <EtapaFatos
            state={state}
            actions={actions}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 3:
        return (
          <EtapaProcesso
            state={state}
            actions={actions}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 4:
        return (
          <EtapaTeses
            state={state}
            actions={actions}
            onNext={handleNext}
            onPrev={handlePrev}
          />
        );
      case 5:
        return (
          <EtapaRevisao
            state={state}
            actions={actions}
            onNext={handleNext}
            onPrev={handlePrev}
            onEditEtapa={handleEditEtapa}
          />
        );
      case 6:
        return (
          <EtapaFinal state={state} actions={actions} onPrev={handlePrev} />
        );
      default:
        return (
          <div className="text-center py-12">
            <h3 className="text-xl font-semibold text-gray-700 mb-4">
              Etapa em desenvolvimento
            </h3>
            <p className="text-gray-500">Esta etapa será migrada em breve.</p>
          </div>
        );
    }
  };

  return (
    <Layout>
      <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50">
        <PageHeader
          title="Editor Jurídico AI"
          subtitle="Criação de peças jurídicas com inteligência artificial"
          icon={<FileText className="w-7 h-7 text-white" />}
        />

        <div className="flex relative">
          {/* Sidebar com etapas */}
          <div className="bg-white shadow-lg border-r border-gray-200 w-80 min-h-screen p-6">
            <h2 className="text-lg font-semibold text-gray-800 mb-6">
              Etapas do Processo
            </h2>

            <div className="space-y-3">
              {etapas.map((etapa) => {
                const isActive = state.etapa === etapa.id;
                const isCompleted = state.etapa > etapa.id;
                const isAccessible = isEtapaAcessivel(etapa.id);
                const isCurrentComplete = isEtapaCompleta(etapa.id);

                return (
                  <div
                    key={etapa.id}
                    className={`p-4 rounded-lg cursor-pointer transition-all duration-300 ${
                      isActive
                        ? "bg-blue-100 border border-blue-300 text-blue-800"
                        : isCompleted
                        ? "bg-green-50 border border-green-200 text-green-700"
                        : isAccessible
                        ? "bg-gray-50 border border-gray-200 text-gray-600 hover:bg-gray-100"
                        : "bg-gray-50 border border-gray-200 text-gray-400 cursor-not-allowed opacity-50"
                    }`}
                    onClick={() => {
                      if (isAccessible) {
                        setEtapa(etapa.id);
                      }
                    }}>
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div
                          className={`w-8 h-8 rounded-full flex items-center justify-center text-sm font-medium ${
                            isActive
                              ? "bg-blue-500 text-white"
                              : isCompleted
                              ? "bg-green-500 text-white"
                              : isAccessible
                              ? "bg-gray-300 text-gray-600"
                              : "bg-gray-200 text-gray-400"
                          }`}>
                          {etapa.id + 1}
                        </div>
                        <div>
                          <div className="font-medium">{etapa.nome}</div>
                          <div className="text-xs opacity-75">
                            {etapa.descricao}
                          </div>
                        </div>
                      </div>
                      {isActive && (
                        <div className="text-xs bg-blue-100 text-blue-800 px-2 py-1 rounded">
                          Ativa
                        </div>
                      )}
                      {isCompleted && (
                        <div className="text-xs bg-green-100 text-green-800 px-2 py-1 rounded">
                          ✓ Concluída
                        </div>
                      )}
                      {!isActive && !isCompleted && isAccessible && (
                        <div className="text-xs bg-gray-100 text-gray-600 px-2 py-1 rounded">
                          Disponível
                        </div>
                      )}
                      {!isActive && !isCompleted && !isAccessible && (
                        <div className="text-xs bg-gray-100 text-gray-400 px-2 py-1 rounded">
                          Bloqueada
                        </div>
                      )}
                    </div>
                  </div>
                );
              })}
            </div>

            {/* Progresso */}
            <div className="mt-8">
              <div className="flex justify-between text-sm text-gray-600 mb-2">
                <span>Progresso</span>
                <span>
                  {Math.round(((state.etapa + 1) / etapas.length) * 100)}%
                </span>
              </div>
              <div className="w-full bg-gray-200 rounded-full h-2">
                <div
                  className="bg-gradient-to-r from-blue-500 to-green-500 h-2 rounded-full transition-all duration-300"
                  style={{
                    width: `${((state.etapa + 1) / etapas.length) * 100}%`,
                  }}
                />
              </div>
            </div>
          </div>

          {/* Conteúdo Principal */}
          <div className="flex-1 p-6">
            <div className="max-w-4xl mx-auto">{renderEtapaAtual()}</div>
          </div>
        </div>
      </div>
    </Layout>
  );
}
