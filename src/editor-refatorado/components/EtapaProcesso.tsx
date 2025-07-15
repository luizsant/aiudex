import React from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Badge } from "@/components/ui/badge";
import {
  Shield,
  FileText,
  MapPin,
  DollarSign,
  Scale,
  Building,
} from "lucide-react";
import { EtapaProcessoProps } from "../types";

export const EtapaProcesso: React.FC<EtapaProcessoProps> = ({
  state,
  actions,
  onNext,
  onPrev,
}) => {
  const formatarNumeroProcesso = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, "");

    // Aplica a máscara NNNNNNN-DD.AAAA.J.TR.OOOO
    if (numeros.length <= 7) {
      return numeros;
    } else if (numeros.length <= 9) {
      return `${numeros.slice(0, 7)}-${numeros.slice(7)}`;
    } else if (numeros.length <= 13) {
      return `${numeros.slice(0, 7)}-${numeros.slice(7, 9)}.${numeros.slice(
        9
      )}`;
    } else if (numeros.length <= 14) {
      return `${numeros.slice(0, 7)}-${numeros.slice(7, 9)}.${numeros.slice(
        9,
        13
      )}.${numeros.slice(13)}`;
    } else if (numeros.length <= 16) {
      return `${numeros.slice(0, 7)}-${numeros.slice(7, 9)}.${numeros.slice(
        9,
        13
      )}.${numeros.slice(13, 14)}.${numeros.slice(14)}`;
    } else if (numeros.length <= 20) {
      return `${numeros.slice(0, 7)}-${numeros.slice(7, 9)}.${numeros.slice(
        9,
        13
      )}.${numeros.slice(13, 14)}.${numeros.slice(14, 16)}.${numeros.slice(
        16
      )}`;
    }

    return `${numeros.slice(0, 7)}-${numeros.slice(7, 9)}.${numeros.slice(
      9,
      13
    )}.${numeros.slice(13, 14)}.${numeros.slice(14, 16)}.${numeros.slice(
      16,
      20
    )}`;
  };

  const formatarValorCausa = (valor: string) => {
    // Remove tudo que não é número
    const numeros = valor.replace(/\D/g, "");

    if (!numeros) return "";

    // Converte para número e formata como moeda
    const numero = parseInt(numeros) / 100;
    return numero.toLocaleString("pt-BR", {
      style: "currency",
      currency: "BRL",
    });
  };

  const handleNumeroProcessoChange = (
    e: React.ChangeEvent<HTMLInputElement>
  ) => {
    const valorFormatado = formatarNumeroProcesso(e.target.value);
    actions.setNumeroProcesso(valorFormatado);
  };

  const handleValorCausaChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const valorFormatado = formatarValorCausa(e.target.value);
    actions.setValorCausa(valorFormatado);
  };

  const isFormValid = () => {
    return state.comarca.trim() && state.valorCausa.trim();
  };

  return (
    <Card className="bg-white/90 backdrop-blur-md rounded-3xl shadow-lg border border-blue-200/30 hover:border-blue-400 transition-all duration-300 group mb-8">
      <CardHeader className="flex items-center gap-4 pb-4">
        <div className="w-14 h-14 bg-gradient-to-r from-purple-500 to-blue-500 rounded-2xl flex items-center justify-center shadow-lg">
          <Shield className="w-7 h-7 text-white" />
        </div>
        <div>
          <CardTitle className="text-xl font-bold bg-gradient-to-r from-purple-500 to-blue-500 bg-clip-text text-transparent">
            Dados do Processo
          </CardTitle>
          <p className="text-blue-700 text-sm font-medium">
            Informe os dados processuais e jurisdicionais
          </p>
        </div>
      </CardHeader>

      <CardContent className="space-y-6">
        {/* Número do Processo */}
        <div className="space-y-2">
          <Label
            htmlFor="numeroProcesso"
            className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <FileText className="w-4 h-4 text-purple-600" />
            Número do Processo
          </Label>
          <Input
            id="numeroProcesso"
            placeholder="0000000-00.0000.0.00.0000"
            value={state.numeroProcesso}
            onChange={handleNumeroProcessoChange}
            maxLength={25}
            className="bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-300"
          />
          <p className="text-xs text-gray-500">
            Formato: NNNNNNN-DD.AAAA.J.TR.OOOO (opcional)
          </p>
        </div>

        {/* Vara/Juízo */}
        <div className="space-y-2">
          <Label
            htmlFor="varaJuizo"
            className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <Scale className="w-4 h-4 text-purple-600" />
            Vara/Juízo
          </Label>
          <Input
            id="varaJuizo"
            placeholder="Ex: 1ª Vara Cível da Comarca de São Paulo"
            value={state.varaJuizo}
            onChange={(e) => actions.setVaraJuizo(e.target.value)}
            className="bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-300"
          />
        </div>

        {/* Comarca */}
        <div className="space-y-2">
          <Label
            htmlFor="comarca"
            className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <MapPin className="w-4 h-4 text-purple-600" />
            Comarca <span className="text-red-500">*</span>
          </Label>
          <Input
            id="comarca"
            placeholder="Ex: São Paulo/SP"
            value={state.comarca}
            onChange={(e) => actions.setComarca(e.target.value)}
            className="bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-300"
          />
        </div>

        {/* Valor da Causa */}
        <div className="space-y-2">
          <Label
            htmlFor="valorCausa"
            className="text-sm font-semibold text-gray-700 flex items-center gap-2">
            <DollarSign className="w-4 h-4 text-purple-600" />
            Valor da Causa <span className="text-red-500">*</span>
          </Label>
          <Input
            id="valorCausa"
            placeholder="R$ 0,00"
            value={state.valorCausa}
            onChange={handleValorCausaChange}
            className="bg-white/80 border-gray-200 focus:border-purple-400 focus:ring-purple-400 transition-all duration-300"
          />
          <p className="text-xs text-gray-500">
            Digite apenas números. Ex: 1000000 = R$ 10.000,00
          </p>
        </div>

        {/* Resumo dos Dados */}
        {(state.numeroProcesso ||
          state.varaJuizo ||
          state.comarca ||
          state.valorCausa) && (
          <Card className="bg-purple-50 border-purple-200 rounded-xl">
            <CardContent className="p-4">
              <h4 className="font-semibold text-purple-800 mb-3 flex items-center gap-2">
                <Building className="w-4 h-4" />
                Resumo dos Dados Processuais
              </h4>
              <div className="space-y-2 text-sm">
                {state.numeroProcesso && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-purple-700 border-purple-300">
                      Processo
                    </Badge>
                    <span className="text-gray-700">
                      {state.numeroProcesso}
                    </span>
                  </div>
                )}
                {state.varaJuizo && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-purple-700 border-purple-300">
                      Vara/Juízo
                    </Badge>
                    <span className="text-gray-700">{state.varaJuizo}</span>
                  </div>
                )}
                {state.comarca && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-purple-700 border-purple-300">
                      Comarca
                    </Badge>
                    <span className="text-gray-700">{state.comarca}</span>
                  </div>
                )}
                {state.valorCausa && (
                  <div className="flex items-center gap-2">
                    <Badge
                      variant="outline"
                      className="text-purple-700 border-purple-300">
                      Valor
                    </Badge>
                    <span className="text-gray-700 font-semibold">
                      {state.valorCausa}
                    </span>
                  </div>
                )}
              </div>
            </CardContent>
          </Card>
        )}

        {/* Informações Adicionais */}
        <Card className="bg-blue-50 border-blue-200 rounded-xl">
          <CardContent className="p-4">
            <h4 className="font-semibold text-blue-800 mb-2">
              ℹ️ Informações Importantes
            </h4>
            <ul className="text-sm text-blue-700 space-y-1">
              <li>
                • O número do processo é opcional, mas recomendado se já existir
              </li>
              <li>
                • A vara/juízo é opcional, mas recomendada para identificar a
                competência específica
              </li>
              <li>• A comarca e valor da causa são obrigatórios</li>
              <li>
                • O valor da causa é necessário para cálculo de custas
                processuais
              </li>
              <li>• Todos os dados podem ser editados posteriormente</li>
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
            className="flex-1 h-12 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-bold rounded-xl shadow-lg hover:shadow-xl hover:scale-105 transition-all transform disabled:opacity-50 disabled:cursor-not-allowed">
            Próximo
          </Button>
        </div>
      </CardContent>
    </Card>
  );
};
