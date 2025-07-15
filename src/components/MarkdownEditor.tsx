"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  Bold,
  Italic,
  List,
  ListOrdered,
  Quote,
  Heading1,
  Heading2,
  Heading3,
  Eye,
  Edit3,
} from "lucide-react";
import JuridicalDocumentPreview from "./JuridicalDocumentPreview";

interface MarkdownEditorProps {
  value: string;
  onChange: (value: string) => void;
  title?: string;
  clientName?: string;
  logoUrl?: string;
  placeholder?: string;
  className?: string;
  showPreview?: boolean;
  showToolbar?: boolean;
}

export const MarkdownEditor: React.FC<MarkdownEditorProps> = ({
  value,
  onChange,
  title,
  clientName,
  logoUrl,
  placeholder = "Digite o conteúdo do documento...",
  className = "",
  showPreview = true,
  showToolbar = true,
}) => {
  const [activeTab, setActiveTab] = useState<"edit" | "preview">("edit");

  // Funções para formatação
  const insertText = (before: string, after: string = "") => {
    const textarea = document.querySelector("textarea") as HTMLTextAreaElement;
    if (!textarea) return;

    const start = textarea.selectionStart;
    const end = textarea.selectionEnd;
    const selectedText = value.substring(start, end);
    const newText =
      value.substring(0, start) +
      before +
      selectedText +
      after +
      value.substring(end);

    onChange(newText);

    // Restaurar seleção
    setTimeout(() => {
      textarea.focus();
      textarea.setSelectionRange(start + before.length, end + before.length);
    }, 0);
  };

  const formatButton = (
    icon: React.ReactNode,
    before: string,
    after: string = "",
    label: string
  ) => (
    <Button
      variant="ghost"
      size="sm"
      onClick={() => insertText(before, after)}
      title={label}
      className="h-8 w-8 p-0">
      {icon}
    </Button>
  );

  return (
    <div className={`space-y-4 ${className}`}>
      {showToolbar && (
        <Card>
          <CardHeader className="pb-3">
            <CardTitle className="text-sm font-medium">
              Ferramentas de Formatação
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="flex flex-wrap gap-1">
              {formatButton(
                <Bold className="w-4 h-4" />,
                "**",
                "**",
                "Negrito"
              )}
              {formatButton(
                <Italic className="w-4 h-4" />,
                "*",
                "*",
                "Itálico"
              )}
              {formatButton(
                <Heading1 className="w-4 h-4" />,
                "# ",
                "",
                "Título 1"
              )}
              {formatButton(
                <Heading2 className="w-4 h-4" />,
                "## ",
                "",
                "Título 2"
              )}
              {formatButton(
                <Heading3 className="w-4 h-4" />,
                "### ",
                "",
                "Título 3"
              )}
              {formatButton(<List className="w-4 h-4" />, "- ", "", "Lista")}
              {formatButton(
                <ListOrdered className="w-4 h-4" />,
                "1. ",
                "",
                "Lista Numerada"
              )}
              {formatButton(
                <Quote className="w-4 h-4" />,
                "> ",
                "",
                "Jurisprudência"
              )}
            </div>
          </CardContent>
        </Card>
      )}

      {showPreview ? (
        <Tabs
          value={activeTab}
          onValueChange={(value) => setActiveTab(value as "edit" | "preview")}>
          <TabsList className="grid w-full grid-cols-2">
            <TabsTrigger value="edit" className="flex items-center space-x-2">
              <Edit3 className="w-4 h-4" />
              <span>Editar</span>
            </TabsTrigger>
            <TabsTrigger
              value="preview"
              className="flex items-center space-x-2">
              <Eye className="w-4 h-4" />
              <span>Visualizar</span>
            </TabsTrigger>
          </TabsList>

          <TabsContent value="edit" className="space-y-4">
            <Textarea
              value={value}
              onChange={(e) => onChange(e.target.value)}
              placeholder={placeholder}
              className="min-h-[400px] font-mono text-sm"
            />

            <div className="flex items-center justify-between text-xs text-gray-500">
              <span>Dica: Use as ferramentas acima para formatar o texto</span>
              <span>{value.length} caracteres</span>
            </div>
          </TabsContent>

          <TabsContent value="preview">
            <JuridicalDocumentPreview
              content={value}
              title={title}
              clientName={clientName}
              logoUrl={logoUrl}
              showHeader={true}
              showQualityIndicators={true}
            />
          </TabsContent>
        </Tabs>
      ) : (
        <div className="space-y-4">
          <Textarea
            value={value}
            onChange={(e) => onChange(e.target.value)}
            placeholder={placeholder}
            className="min-h-[400px] font-mono text-sm"
          />

          <div className="flex items-center justify-between text-xs text-gray-500">
            <span>Dica: Use as ferramentas acima para formatar o texto</span>
            <span>{value.length} caracteres</span>
          </div>
        </div>
      )}
    </div>
  );
};

export default MarkdownEditor;
