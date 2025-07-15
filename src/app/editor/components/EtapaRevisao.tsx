"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  CheckCircle,
  Edit3,
  Users,
  Scale,
  FileText,
  MapPin,
  BookOpen,
  Gavel,
  AlertCircle,
} from "lucide-react";
import { EtapaRevisaoProps } from "../types";

export const EtapaRevisao: React.FC<EtapaRevisaoProps> = ({
  state,
  actions,
  onNext,
  onPrev,
  onEditEtapa,
}) => {
  const dadosCompletos = {
    clientes: state.clientes.length > 0,
    area: !!state.areaSelecionada,
    peca: !!state.pecaSelecionada,
    fatos: state.fatos.trim().length > 0,
    processo: state.comarca.trim() && state.valorCausa.trim(),
    tesesOuJuris: state.teses.length > 0 || state.juris.length > 0,
  };

  const totalItens = Object.keys(dadosCompletos).length;
  const itensCompletos = Object.values(dadosCompletos).filter(Boolean).length;
  const porcentagemCompleta = Math.round((itensCompletos / totalItens) * 100);

  const podeAvancar = porcentagemCompleta >= 80; // Pelo menos 80% completo

  return (
    <div className="space-y-6">
      {/* Cabeçalho */}
      <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-amber-200/30 hover:border-amber-400 transition-all duration-300">
        <CardHeader className="flex items-center gap-4 pb-4">
          <div className="w-14 h-14 bg-gradient-to-r from-amber-500 to-orange-500 rounded-2xl flex items-center justify-center shadow-lg">
            <CheckCircle className="w-7 h-7 text-white" />
          </div>
          <div className="flex-1">
            <CardTitle className="text-xl font-bold bg-gradient-to-r from-amber-500 to-orange-500 bg-clip-text text-transparent">
              Revisão dos Dados
            </CardTitle>
            <p className="text-amber-700 text-sm font-medium">
              Confira todas as informações antes de gerar a peça
            </p>
          </div>
          <div className="text-right">
            <div className="text-2xl font-bold text-amber-600">
              {porcentagemCompleta}%
            </div>
            <div className="text-sm text-amber-600">Completo</div>
          </div>
        </CardHeader>
      </Card>

      {/* Resumo dos Dados */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
        {/* Clientes */}
        <Card
          className={`${
            dadosCompletos.clientes
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          } rounded-xl`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Users
                  className={`w-5 h-5 ${
                    dadosCompletos.clientes ? "text-green-600" : "text-red-600"
                  }`}
                />
                <h4 className="font-semibold text-gray-800">Clientes</h4>
                {dadosCompletos.clientes ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditEtapa(0)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50">
                <Edit3 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
            {state.clientes.length > 0 ? (
              <div className="space-y-2">
                {state.clientes.map((cliente, index) => (
                  <div key={index} className="flex items-center gap-2">
                    <Badge variant="outline" className="text-xs">
                      {state.poloClientes[cliente.id] === "reu"
                        ? "Réu"
                        : "Autor"}
                    </Badge>
                    <span className="text-sm text-gray-700">
                      {cliente.name}
                    </span>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-red-600">Nenhum cliente selecionado</p>
            )}
          </CardContent>
        </Card>

        {/* Área e Peça */}
        <Card
          className={`${
            dadosCompletos.area && dadosCompletos.peca
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          } rounded-xl`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Scale
                  className={`w-5 h-5 ${
                    dadosCompletos.area && dadosCompletos.peca
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                />
                <h4 className="font-semibold text-gray-800">Área e Peça</h4>
                {dadosCompletos.area && dadosCompletos.peca ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditEtapa(1)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50">
                <Edit3 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Área:</span>
                <span className="text-sm font-medium text-gray-800">
                  {state.areaSelecionada || "Não selecionada"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Peça:</span>
                <span className="text-sm font-medium text-gray-800">
                  {state.pecaSelecionada?.nome || "Não selecionada"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Fatos */}
        <Card
          className={`${
            dadosCompletos.fatos
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          } rounded-xl`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <Edit3
                  className={`w-5 h-5 ${
                    dadosCompletos.fatos ? "text-green-600" : "text-red-600"
                  }`}
                />
                <h4 className="font-semibold text-gray-800">Fatos</h4>
                {dadosCompletos.fatos ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditEtapa(2)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50">
                <Edit3 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Caracteres:</span>
                <span className="text-sm font-medium text-gray-800">
                  {state.fatos.length}/2000
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Tópicos:</span>
                <span className="text-sm font-medium text-gray-800">
                  {state.topicos.length} selecionados
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Dados do Processo */}
        <Card
          className={`${
            dadosCompletos.processo
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          } rounded-xl`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <FileText
                  className={`w-5 h-5 ${
                    dadosCompletos.processo ? "text-green-600" : "text-red-600"
                  }`}
                />
                <h4 className="font-semibold text-gray-800">
                  Dados do Processo
                </h4>
                {dadosCompletos.processo ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditEtapa(3)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50">
                <Edit3 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
            <div className="space-y-2">
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Vara:</span>
                <span className="text-sm font-medium text-gray-800">
                  {state.varaJuizo || "Não informada"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Comarca:</span>
                <span className="text-sm font-medium text-gray-800">
                  {state.comarca || "Não informada"}
                </span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-sm text-gray-600">Valor:</span>
                <span className="text-sm font-medium text-gray-800">
                  {state.valorCausa || "Não informado"}
                </span>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Teses e Jurisprudências */}
        <Card
          className={`${
            dadosCompletos.tesesOuJuris
              ? "bg-green-50 border-green-200"
              : "bg-red-50 border-red-200"
          } rounded-xl md:col-span-2`}>
          <CardContent className="p-4">
            <div className="flex items-center justify-between mb-3">
              <div className="flex items-center gap-3">
                <BookOpen
                  className={`w-5 h-5 ${
                    dadosCompletos.tesesOuJuris
                      ? "text-green-600"
                      : "text-red-600"
                  }`}
                />
                <h4 className="font-semibold text-gray-800">
                  Teses e Jurisprudências
                </h4>
                {dadosCompletos.tesesOuJuris ? (
                  <CheckCircle className="w-4 h-4 text-green-600" />
                ) : (
                  <AlertCircle className="w-4 h-4 text-red-600" />
                )}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => onEditEtapa(4)}
                className="text-blue-600 border-blue-300 hover:bg-blue-50">
                <Edit3 className="w-4 h-4 mr-1" />
                Editar
              </Button>
            </div>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div>
                <span className="text-sm text-gray-600 block mb-2">
                  Teses Selecionadas:
                </span>
                {state.teses.length > 0 ? (
                  <div className="space-y-1">
                    {state.teses.slice(0, 3).map((tese, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs mr-1 mb-1">
                        {tese.length > 50
                          ? `${tese.substring(0, 50)}...`
                          : tese}
                      </Badge>
                    ))}
                    {state.teses.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{state.teses.length - 3} mais
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhuma tese selecionada
                  </p>
                )}
              </div>
              <div>
                <span className="text-sm text-gray-600 block mb-2">
                  Jurisprudências Selecionadas:
                </span>
                {state.juris.length > 0 ? (
                  <div className="space-y-1">
                    {state.juris.slice(0, 3).map((juris, index) => (
                      <Badge
                        key={index}
                        variant="outline"
                        className="text-xs mr-1 mb-1">
                        {juris.length > 50
                          ? `${juris.substring(0, 50)}...`
                          : juris}
                      </Badge>
                    ))}
                    {state.juris.length > 3 && (
                      <Badge variant="outline" className="text-xs">
                        +{state.juris.length - 3} mais
                      </Badge>
                    )}
                  </div>
                ) : (
                  <p className="text-sm text-gray-500">
                    Nenhuma jurisprudência selecionada
                  </p>
                )}
              </div>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Alerta se dados incompletos */}
      {!podeAvancar && (
        <Card className="bg-amber-50 border-amber-200 rounded-xl">
          <CardContent className="p-4">
            <div className="flex items-center gap-3">
              <AlertCircle className="w-5 h-5 text-amber-600" />
              <div>
                <h4 className="font-semibold text-amber-800">
                  Dados Incompletos
                </h4>
                <p className="text-sm text-amber-700">
                  Complete pelo menos 80% dos dados para gerar a peça jurídica.
                  Clique nos botões de edição para voltar às etapas anteriores.
                </p>
              </div>
            </div>
          </CardContent>
        </Card>
      )}

      {/* Botões de Ação */}
      <div className="flex gap-4">
        <Button
          variant="outline"
          onClick={onPrev}
          className="flex-1 h-12 rounded-xl border-gray-300 text-gray-700 hover:bg-gray-50 transition-all duration-300">
          Voltar
        </Button>
        <Button
          onClick={onNext}
          disabled={!podeAvancar}
          className={`flex-1 h-12 rounded-xl font-bold shadow-lg transition-all transform ${
            podeAvancar
              ? "bg-gradient-to-r from-amber-500 to-orange-500 text-white hover:shadow-xl hover:scale-105"
              : "bg-gray-300 text-gray-500 cursor-not-allowed"
          }`}>
          {podeAvancar ? "Gerar Peça Jurídica" : "Complete os Dados"}
        </Button>
      </div>
    </div>
  );
};
