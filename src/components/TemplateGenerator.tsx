"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Progress } from "@/components/ui/progress";
import { Wand2, FileText, Building, User, Calendar } from "lucide-react";
import { toast } from "sonner";

interface Template {
  id: string;
  name: string;
  type: string;
  description: string;
  fields: TemplateField[];
  content: string;
}

interface TemplateField {
  id: string;
  label: string;
  type: "text" | "number" | "date" | "select";
  required: boolean;
  options?: string[];
  placeholder?: string;
}

interface TemplateGeneratorProps {
  templates: Template[];
  onGenerateDocument: (document: any) => void;
}

const defaultTemplates: Template[] = [
  {
    id: "1",
    name: "Procuração Ad Judicia",
    type: "procuracao",
    description: "Template para procuração judicial com poderes específicos",
    fields: [
      {
        id: "outorgante",
        label: "Nome do Outorgante",
        type: "text",
        required: true,
        placeholder: "Nome completo",
      },
      {
        id: "cpf_outorgante",
        label: "CPF do Outorgante",
        type: "text",
        required: true,
        placeholder: "000.000.000-00",
      },
      {
        id: "rg_outorgante",
        label: "RG do Outorgante",
        type: "text",
        required: true,
        placeholder: "00.000.000-0",
      },
      {
        id: "endereco_outorgante",
        label: "Endereço do Outorgante",
        type: "text",
        required: true,
        placeholder: "Endereço completo",
      },
      {
        id: "advogado",
        label: "Nome do Advogado",
        type: "text",
        required: true,
        placeholder: "Dr(a). Nome",
      },
      {
        id: "oab_advogado",
        label: "OAB do Advogado",
        type: "text",
        required: true,
        placeholder: "OAB/UF 000000",
      },
    ],
    content: `PROCURAÇÃO AD JUDICIA

Eu, {{outorgante}}, brasileiro(a), portador(a) do RG nº {{rg_outorgante}} e CPF nº {{cpf_outorgante}}, residente e domiciliado(a) na {{endereco_outorgante}}, nomeio e constituo meu bastante procurador o(a) {{advogado}}, inscrito(a) na {{oab_advogado}}, para o foro em geral, com poderes para propor ações, contestar, transigir, desistir, renunciar ao direito sobre que se funda a ação, receber citações, confessar, firmar compromissos, requerer, alegar e assinar o que for necessário, podendo ainda substabelecer esta procuração, com ou sem reservas de iguais poderes, dando tudo por bom firme e valioso.

Local e data: ________________

_________________________________
{{outorgante}}`,
  },
  {
    id: "2",
    name: "Contrato de Honorários",
    type: "contract",
    description: "Contrato padrão para prestação de serviços advocatícios",
    fields: [
      {
        id: "cliente",
        label: "Nome do Cliente",
        type: "text",
        required: true,
        placeholder: "Nome ou razão social",
      },
      {
        id: "cpf_cnpj",
        label: "CPF/CNPJ",
        type: "text",
        required: true,
        placeholder: "000.000.000-00",
      },
      {
        id: "endereco_cliente",
        label: "Endereço do Cliente",
        type: "text",
        required: true,
        placeholder: "Endereço completo",
      },
      {
        id: "servico",
        label: "Serviço a ser prestado",
        type: "text",
        required: true,
        placeholder: "Descrição dos serviços",
      },
      {
        id: "valor",
        label: "Valor dos Honorários",
        type: "text",
        required: true,
        placeholder: "R$ 0,00",
      },
      {
        id: "forma_pagamento",
        label: "Forma de Pagamento",
        type: "select",
        required: true,
        options: ["À vista", "Parcelado em 2x", "Parcelado em 3x", "Mensal"],
      },
    ],
    content: `CONTRATO DE PRESTAÇÃO DE SERVIÇOS ADVOCATÍCIOS

CONTRATANTE: {{cliente}}, portador do CPF/CNPJ {{cpf_cnpj}}, residente/estabelecido na {{endereco_cliente}}.

CONTRATADO: [NOME DO ADVOGADO], inscrito na OAB/[UF] sob nº [NÚMERO].

CLÁUSULA 1ª - DO OBJETO
O presente contrato tem por objeto a prestação de serviços advocatícios para {{servico}}.

CLÁUSULA 2ª - DOS HONORÁRIOS
Pelos serviços prestados, o CONTRATANTE pagará ao CONTRATADO o valor de {{valor}}, na forma {{forma_pagamento}}.

CLÁUSULA 3ª - DAS OBRIGAÇÕES
O CONTRATADO obriga-se a prestar os serviços com zelo e dedicação, mantendo o CONTRATANTE informado sobre o andamento dos trabalhos.

CLÁUSULA 4ª - DA VIGÊNCIA
Este contrato vigorará até a conclusão dos serviços contratados.

Local e data: ________________

CONTRATANTE: _____________________     CONTRATADO: _____________________
            {{cliente}}                        [NOME DO ADVOGADO]`,
  },
  {
    id: "3",
    name: "Petição Inicial Básica",
    type: "petition",
    description: "Template básico para petição inicial",
    fields: [
      {
        id: "requerente",
        label: "Nome do Requerente",
        type: "text",
        required: true,
      },
      {
        id: "cpf_requerente",
        label: "CPF do Requerente",
        type: "text",
        required: true,
      },
      {
        id: "endereco_requerente",
        label: "Endereço do Requerente",
        type: "text",
        required: true,
      },
      {
        id: "requerido",
        label: "Nome do Requerido",
        type: "text",
        required: true,
      },
      {
        id: "endereco_requerido",
        label: "Endereço do Requerido",
        type: "text",
        required: true,
      },
      {
        id: "causa_pedir",
        label: "Causa de Pedir",
        type: "text",
        required: true,
      },
      { id: "pedido", label: "Pedido", type: "text", required: true },
      {
        id: "valor_causa",
        label: "Valor da Causa",
        type: "text",
        required: true,
      },
    ],
    content: `EXCELENTÍSSIMO SENHOR DOUTOR JUIZ DE DIREITO

{{requerente}}, brasileiro(a), portador(a) do CPF nº {{cpf_requerente}}, residente e domiciliado(a) na {{endereco_requerente}}, vem, por seu advogado que esta subscreve, propor

AÇÃO [TIPO DA AÇÃO]

em face de {{requerido}}, [qualificação], com endereço na {{endereco_requerido}}, pelos fatos e fundamentos jurídicos a seguir expostos:

I - DOS FATOS

{{causa_pedir}}

II - DO DIREITO

[Fundamentação jurídica]

III - DOS PEDIDOS

Diante do exposto, requer:

{{pedido}}

Dá-se à causa o valor de {{valor_causa}}.

Termos em que,
Pede deferimento.

Local, [data].

[Assinatura do Advogado]
[Nome do Advogado]
OAB/[UF] [número]`,
  },
];

const TemplateGenerator = ({
  templates = defaultTemplates,
  onGenerateDocument,
}: TemplateGeneratorProps) => {
  const [selectedTemplate, setSelectedTemplate] = useState<Template | null>(
    null
  );
  const [templateData, setTemplateData] = useState<Record<string, string>>({});
  const [progress, setProgress] = useState(0);

  const handleTemplateSelect = (template: Template) => {
    setSelectedTemplate(template);
    setTemplateData({});
    setProgress(0);
  };

  const handleFieldChange = (fieldId: string, value: string) => {
    setTemplateData((prev) => {
      const newData = { ...prev, [fieldId]: value };

      // Calcular progresso
      const requiredFields =
        selectedTemplate?.fields.filter((f) => f.required) || [];
      const filledFields = requiredFields.filter((f) => newData[f.id]?.trim());
      const newProgress = (filledFields.length / requiredFields.length) * 100;
      setProgress(newProgress);

      return newData;
    });
  };

  const generateDocument = () => {
    if (!selectedTemplate) return;

    // Verificar campos obrigatórios
    const requiredFields = selectedTemplate.fields.filter((f) => f.required);
    const missingFields = requiredFields.filter(
      (f) => !templateData[f.id]?.trim()
    );

    if (missingFields.length > 0) {
      toast.error(
        `Preencha os campos obrigatórios: ${missingFields
          .map((f) => f.label)
          .join(", ")}`
      );
      return;
    }

    // Substituir variáveis no conteúdo
    let content = selectedTemplate.content;
    selectedTemplate.fields.forEach((field) => {
      const value = templateData[field.id] || "";
      content = content.replace(new RegExp(`{{${field.id}}}`, "g"), value);
    });

    const newDoc = {
      id: Date.now().toString(),
      title: `${selectedTemplate.name} - ${
        templateData[selectedTemplate.fields[0]?.id] || "Documento"
      }`,
      type: selectedTemplate.type,
      client: templateData[selectedTemplate.fields[0]?.id] || undefined,
      createdAt: new Date(),
      updatedAt: new Date(),
      status: "finalized" as const,
      content: content,
      size: `${Math.round(content.length / 1024)} KB`,
    };

    onGenerateDocument(newDoc);
    setSelectedTemplate(null);
    setTemplateData({});
    setProgress(0);
    toast.success("Documento gerado com sucesso!");
  };

  const getTypeColor = (type: string) => {
    switch (type) {
      case "petition":
        return "bg-blue-100 text-blue-800";
      case "contract":
        return "bg-green-100 text-green-800";
      case "procuracao":
        return "bg-purple-100 text-purple-800";
      case "recurso":
        return "bg-red-100 text-red-800";
      case "parecer":
        return "bg-yellow-100 text-yellow-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  if (selectedTemplate) {
    return (
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center justify-between">
            <span>Gerar: {selectedTemplate.name}</span>
            <Button variant="ghost" onClick={() => setSelectedTemplate(null)}>
              Voltar
            </Button>
          </CardTitle>
          <div className="space-y-2">
            <div className="flex justify-between text-sm">
              <span>Progresso do preenchimento</span>
              <span>{Math.round(progress)}%</span>
            </div>
            <Progress value={progress} className="h-2" />
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {selectedTemplate.fields.map((field) => (
            <div key={field.id}>
              <Label htmlFor={field.id}>
                {field.label}{" "}
                {field.required && <span className="text-red-500">*</span>}
              </Label>
              {field.type === "select" ? (
                <Select
                  onValueChange={(value) => handleFieldChange(field.id, value)}>
                  <SelectTrigger>
                    <SelectValue
                      placeholder={
                        field.placeholder ||
                        `Selecione ${field.label.toLowerCase()}`
                      }
                    />
                  </SelectTrigger>
                  <SelectContent>
                    {field.options?.map((option) => (
                      <SelectItem key={option} value={option}>
                        {option}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>
              ) : (
                <Input
                  id={field.id}
                  type={field.type}
                  placeholder={field.placeholder || field.label}
                  value={templateData[field.id] || ""}
                  onChange={(e) => handleFieldChange(field.id, e.target.value)}
                />
              )}
            </div>
          ))}

          <div className="flex justify-end space-x-2 pt-4">
            <Button variant="outline" onClick={() => setSelectedTemplate(null)}>
              Cancelar
            </Button>
            <Button
              onClick={generateDocument}
              disabled={progress < 100}
              className="flex items-center space-x-2">
              <Wand2 className="w-4 h-4" />
              <span>Gerar Documento</span>
            </Button>
          </div>
        </CardContent>
      </Card>
    );
  }

  return (
    <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
      {templates.map((template) => (
        <Card
          key={template.id}
          className="hover:shadow-md transition-shadow cursor-pointer">
          <CardHeader>
            <div className="flex items-start justify-between">
              <div className="space-y-2">
                <CardTitle className="text-lg">{template.name}</CardTitle>
                <Badge className={getTypeColor(template.type)}>
                  {template.type.charAt(0).toUpperCase() +
                    template.type.slice(1)}
                </Badge>
              </div>
              <div className="text-right">
                {template.type === "petition" && (
                  <FileText className="w-8 h-8 text-blue-500" />
                )}
                {template.type === "contract" && (
                  <Building className="w-8 h-8 text-green-500" />
                )}
                {template.type === "procuracao" && (
                  <User className="w-8 h-8 text-purple-500" />
                )}
              </div>
            </div>
          </CardHeader>
          <CardContent>
            <p className="text-sm text-gray-600 mb-4">{template.description}</p>
            <div className="space-y-2 mb-4">
              <p className="text-xs font-medium text-gray-500">
                {template.fields.length} campos •{" "}
                {template.fields.filter((f) => f.required).length} obrigatórios
              </p>
              <Progress value={0} className="h-2" />
            </div>
            <Button
              className="w-full"
              onClick={() => handleTemplateSelect(template)}>
              <Wand2 className="w-4 h-4 mr-2" />
              Usar Template
            </Button>
          </CardContent>
        </Card>
      ))}
    </div>
  );
};

export default TemplateGenerator;
