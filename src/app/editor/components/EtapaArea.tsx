"use client";

import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import { Gavel, CheckCircle, Search, Plus, X } from "lucide-react";
import { EtapaAreaProps } from "../types";
import { AREAS_DIREITO, ICONES_AREAS, PECAS_POR_AREA } from "../constants";
import * as LucideIcons from "lucide-react";

export const EtapaArea: React.FC<EtapaAreaProps> = ({
  state,
  actions,
  onNext,
  onPrev,
}) => {
  const [buscaPeca, setBuscaPeca] = useState("");

  const handleSelecionarArea = (area: string) => {
    actions.setAreaSelecionada(area);
    // Limpar peça selecionada quando mudar área
    actions.setPecaSelecionada(null as any);
    // Limpar busca
    setBuscaPeca("");
  };

  const handleSelecionarPeca = (peca: any) => {
    actions.setPecaSelecionada(peca);
  };

  const pecasDisponiveis = state.areaSelecionada
    ? PECAS_POR_AREA[state.areaSelecionada as keyof typeof PECAS_POR_AREA] || []
    : [];

  const pecasFiltradas = pecasDisponiveis.filter(
    (peca) =>
      peca.nome.toLowerCase().includes(buscaPeca.toLowerCase()) ||
      peca.desc.toLowerCase().includes(buscaPeca.toLowerCase())
  );

  return (
    <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-blue-200/30 hover:border-blue-400 transition-all duration-300 group mb-8">
      <CardHeader className="flex items-center gap-4 pb-4">
        <div className="w-14 h-14 bg-gradient-to-r from-green-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Gavel className="w-7 h-7 text-white" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-green-500 to-blue-500 bg-clip-text text-transparent">
            Área e Tipo de Peça
          </CardTitle>
          <p className="text-blue-700 text-sm font-medium">
            Escolha a área do direito e o tipo de peça jurídica
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Seleção de Área do Direito */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Área do Direito
          </h3>

          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-3">
            {AREAS_DIREITO.map((area) => (
              <Button
                key={area}
                variant={state.areaSelecionada === area ? "default" : "outline"}
                onClick={() => handleSelecionarArea(area)}
                className={`flex items-center gap-2 px-4 py-2 rounded-xl text-sm font-semibold transition-all duration-300 shadow-sm border
                  ${
                    state.areaSelecionada === area
                      ? "bg-gradient-to-r from-green-500 to-blue-500 text-white border-transparent shadow-md"
                      : "bg-white text-gray-700 border-gray-200 hover:text-blue-600 hover:bg-blue-50 hover:border-blue-300"
                  }
                `}>
                <span className="text-lg">
                  {(() => {
                    const iconName =
                      ICONES_AREAS[area as keyof typeof ICONES_AREAS];
                    const Icon = iconName
                      ? (LucideIcons as any)[iconName]
                      : null;
                    return Icon ? <Icon className="w-5 h-5 mr-1" /> : null;
                  })()}
                </span>
                <span>{area}</span>
                {state.areaSelecionada === area && (
                  <CheckCircle className="w-4 h-4 ml-auto" />
                )}
              </Button>
            ))}
          </div>

          {state.areaSelecionada && (
            <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
              <div className="flex items-center gap-2">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="font-medium text-green-800">
                  Área selecionada: {state.areaSelecionada}
                </span>
              </div>
            </div>
          )}
        </div>

        {/* Seleção de Tipo de Peça - Similar ao visualizador de tópicos */}
        {state.areaSelecionada && (
          <div className="space-y-4">
            <h3 className="text-lg font-semibold text-gray-800">
              Tipo de Peça Jurídica
            </h3>

            {/* Busca */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
              <Input
                placeholder="Buscar tipos de peças..."
                value={buscaPeca}
                onChange={(e) => setBuscaPeca(e.target.value)}
                className="pl-10 bg-white/80"
              />
            </div>

            {/* Peça Selecionada */}
            {state.pecaSelecionada && (
              <div className="space-y-2">
                <h4 className="font-medium text-gray-700">Peça Selecionada:</h4>
                <div className="flex items-center gap-2">
                  <Badge
                    variant="secondary"
                    className="bg-green-100 text-green-800 border-green-300 cursor-pointer hover:bg-green-200 transition-colors"
                    onClick={() => actions.setPecaSelecionada(null as any)}>
                    {state.pecaSelecionada.nome}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                </div>
              </div>
            )}

            {/* Lista de Peças */}
            <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl bg-white/50">
              {pecasFiltradas.length > 0 ? (
                <div className="p-2 space-y-1">
                  {pecasFiltradas.map((peca, index) => (
                    <div
                      key={index}
                      className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                        ${
                          state.pecaSelecionada?.nome === peca.nome
                            ? "bg-green-100 border border-green-300"
                            : "hover:bg-gray-50 border border-transparent"
                        }
                      `}
                      onClick={() => handleSelecionarPeca(peca)}>
                      <div className="flex-1">
                        <span className="text-sm font-medium text-gray-700 block">
                          {peca.nome}
                        </span>
                        <span className="text-xs text-gray-500 block mt-1">
                          {peca.desc}
                        </span>
                      </div>
                      <div className="flex items-center">
                        {state.pecaSelecionada?.nome === peca.nome ? (
                          <X className="w-4 h-4 text-green-600" />
                        ) : (
                          <Plus className="w-4 h-4 text-gray-400" />
                        )}
                      </div>
                    </div>
                  ))}
                </div>
              ) : (
                <div className="p-4 text-center text-gray-500">
                  Nenhuma peça encontrada para "{buscaPeca}"
                </div>
              )}
            </div>

            {state.pecaSelecionada && (
              <div className="mt-4 p-3 bg-green-50 border border-green-200 rounded-xl">
                <div className="flex items-center gap-2">
                  <CheckCircle className="w-5 h-5 text-green-600" />
                  <span className="font-medium text-green-800">
                    Peça selecionada: {state.pecaSelecionada.nome}
                  </span>
                </div>
              </div>
            )}
          </div>
        )}

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
            disabled={!state.areaSelecionada || !state.pecaSelecionada}
            className="flex-1 h-12 bg-gradient-to-r from-green-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed">
            Próximo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
