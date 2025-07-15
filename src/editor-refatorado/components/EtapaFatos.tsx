import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  FileText,
  Search,
  Plus,
  X,
  Lightbulb,
  BookOpen,
  Gavel,
} from "lucide-react";
import { EtapaFatosProps } from "../types";
import {
  TOPICOS_PRELIMINARES_COMUNS,
  TOPICOS_PRELIMINARES_DEFESA,
  TOPICOS_PRELIMINARES_ESPECIAIS,
  EXEMPLO_FATOS,
} from "../constants";

export const EtapaFatos: React.FC<EtapaFatosProps> = ({
  state,
  actions,
  onNext,
  onPrev,
}) => {
  const [buscaTopico, setBuscaTopico] = useState("");
  const [categoriaAtiva, setCategoriaAtiva] = useState<
    "comuns" | "defesa" | "especiais"
  >("comuns");

  const categorias = {
    comuns: { label: "Comuns", topicos: TOPICOS_PRELIMINARES_COMUNS },
    defesa: { label: "Defesas", topicos: TOPICOS_PRELIMINARES_DEFESA },
    especiais: { label: "Especiais", topicos: TOPICOS_PRELIMINARES_ESPECIAIS },
  };

  const topicosFiltrados = categorias[categoriaAtiva].topicos.filter((topico) =>
    topico.toLowerCase().includes(buscaTopico.toLowerCase())
  );

  const handleAnalisarFatos = () => {
    if (state.fatos.trim()) {
      actions.analisarFatosParaTeses();
    }
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-blue-200/30 hover:border-blue-400 transition-all duration-300 group mb-8">
      <CardHeader className="flex items-center gap-4 pb-4">
        <div className="w-14 h-14 bg-gradient-to-r from-blue-500 to-green-500 rounded-2xl flex items-center justify-center shadow-lg">
          <FileText className="w-7 h-7 text-white" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-blue-500 to-green-500 bg-clip-text text-transparent">
            Fatos e Tópicos Preliminares
          </CardTitle>
          <p className="text-blue-700 text-sm font-medium">
            Descreva os fatos do caso (obrigatório) e pedidos específicos. Os
            tópicos preliminares são opcionais.
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Fatos do Caso */}
        <div className="space-y-4">
          <div className="flex items-center justify-between">
            <h3 className="text-lg font-semibold text-gray-800">
              Fatos do Caso
            </h3>
            <div className="text-sm text-gray-500">
              {state.fatos.length}/2000 caracteres
            </div>
          </div>

          <textarea
            className="w-full min-h-[120px] max-h-60 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-vertical"
            maxLength={2000}
            value={state.fatos}
            onChange={(e) => actions.setFatos(e.target.value)}
            placeholder={EXEMPLO_FATOS}
            autoFocus
          />

          <div className="text-sm text-gray-500 text-right">
            {state.fatos.length}/2000 caracteres
          </div>
        </div>

        {/* Pedidos Específicos */}
        <div className="space-y-4">
          <h3 className="text-lg font-semibold text-gray-800">
            Pedidos Específicos
          </h3>

          <textarea
            className="w-full min-h-[80px] max-h-40 border border-gray-200 rounded-xl p-4 text-sm focus:outline-none focus:ring-2 focus:ring-blue-400 focus:border-blue-400 transition-all duration-300 bg-white/80 backdrop-blur-sm resize-vertical"
            maxLength={1000}
            value={state.pedidosEspecificos}
            onChange={(e) => actions.setPedidosEspecificos(e.target.value)}
            placeholder="Ex: Condenação ao pagamento de danos morais no valor de R$ 10.000,00, danos materiais no valor de R$ 5.000,00..."
          />

          <div className="text-sm text-gray-500 text-right">
            {state.pedidosEspecificos.length}/1000 caracteres
          </div>
        </div>

        {/* Tópicos Preliminares */}
        <div className="space-y-4">
          <div className="flex items-center gap-2">
            <h3 className="text-lg font-semibold text-gray-800">
              Tópicos Preliminares
            </h3>
            <Badge
              variant="outline"
              className="text-xs text-gray-500 border-gray-300">
              Opcional
            </Badge>
          </div>

          {/* Categorias */}
          <div className="flex gap-2 mb-4">
            {Object.entries(categorias).map(([key, categoria]) => (
              <Button
                key={key}
                variant={categoriaAtiva === key ? "default" : "outline"}
                size="sm"
                onClick={() => setCategoriaAtiva(key as any)}
                className={
                  categoriaAtiva === key
                    ? "bg-blue-600 text-white"
                    : "text-gray-600 hover:text-blue-600"
                }>
                {categoria.label}
              </Button>
            ))}
          </div>

          {/* Busca */}
          <div className="relative">
            <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-4 h-4" />
            <Input
              placeholder="Buscar tópicos..."
              value={buscaTopico}
              onChange={(e) => setBuscaTopico(e.target.value)}
              className="pl-10 bg-white/80"
            />
          </div>

          {/* Tópicos Selecionados */}
          {state.topicos.length > 0 && (
            <div className="space-y-2">
              <h4 className="font-medium text-gray-700">
                Tópicos Selecionados:
              </h4>
              <div className="flex flex-wrap gap-2">
                {state.topicos.map((topico, index) => (
                  <Badge
                    key={index}
                    variant="secondary"
                    className="bg-green-100 text-green-800 border-green-300 cursor-pointer hover:bg-green-200 transition-colors"
                    onClick={() => actions.toggleTopico(topico)}>
                    {topico}
                    <X className="w-3 h-3 ml-1" />
                  </Badge>
                ))}
              </div>
            </div>
          )}

          {/* Lista de Tópicos */}
          <div className="max-h-64 overflow-y-auto border border-gray-200 rounded-xl bg-white/50">
            {topicosFiltrados.length > 0 ? (
              <div className="p-2 space-y-1">
                {topicosFiltrados.map((topico, index) => (
                  <div
                    key={index}
                    className={`flex items-center justify-between p-3 rounded-lg cursor-pointer transition-colors
                      ${
                        state.topicos.includes(topico)
                          ? "bg-green-100 border border-green-300"
                          : "hover:bg-gray-50 border border-transparent"
                      }
                    `}
                    onClick={() => actions.toggleTopico(topico)}>
                    <span className="text-sm text-gray-700 flex-1">
                      {topico}
                    </span>
                    <div className="flex items-center">
                      {state.topicos.includes(topico) ? (
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
                Nenhum tópico encontrado para "{buscaTopico}"
              </div>
            )}
          </div>
        </div>

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
            disabled={!state.fatos.trim()}
            className="flex-1 h-12 bg-gradient-to-r from-blue-500 to-green-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed">
            Próximo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
