"use client";

import React, { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Textarea } from "@/components/ui/textarea";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import {
  Save,
  Download,
  Eye,
  FileText,
  Image as ImageIcon,
  X,
} from "lucide-react";
import { toast } from "sonner";
import JuridicalDocumentPreview from "@/components/JuridicalDocumentPreview";

interface DocumentEditorProps {
  document?: any;
  onSave: (doc: any) => void;
  onClose: () => void;
}

const DocumentEditor = ({ document, onSave, onClose }: DocumentEditorProps) => {
  const [title, setTitle] = useState(document?.title || "");
  const [content, setContent] = useState(document?.content || "");
  const [client, setClient] = useState(document?.client || "");
  const [type, setType] = useState(document?.type || "petition");
  const [logoUrl, setLogoUrl] = useState<string>("");

  useEffect(() => {
    // Recuperar logo salvo
    const savedLogo = localStorage.getItem("firm_logo");
    if (savedLogo) {
      setLogoUrl(savedLogo);
    }
  }, []);

  const handleSave = () => {
    if (!title.trim() || !content.trim()) {
      toast.error("Título e conteúdo são obrigatórios!");
      return;
    }

    const savedDoc = {
      id: document?.id || Date.now().toString(),
      title,
      content,
      client,
      type,
      createdAt: document?.createdAt || new Date(),
      updatedAt: new Date(),
      status: "finalized" as const,
      size: `${Math.round(content.length / 1024)} KB`,
    };

    onSave(savedDoc);
    toast.success("Documento salvo com sucesso!");
  };

  const exportToPDF = async () => {
    try {
      const { jsPDF } = await import("jspdf");
      const doc = new jsPDF();

      // Adicionar logo se disponível
      if (logoUrl) {
        try {
          doc.addImage(logoUrl, "JPEG", 20, 20, 30, 20);
        } catch (error) {
          console.log("Erro ao adicionar logo:", error);
        }
      }

      // Cabeçalho
      doc.setFontSize(16);
      doc.text(title, 20, logoUrl ? 50 : 30);

      if (client) {
        doc.setFontSize(12);
        doc.text(`Cliente: ${client}`, 20, logoUrl ? 60 : 40);
      }

      // Conteúdo
      doc.setFontSize(10);
      const splitText = doc.splitTextToSize(content, 170);
      doc.text(splitText, 20, logoUrl ? 75 : 55);

      doc.save(`${title}.pdf`);
      toast.success("PDF exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar PDF");
      console.error(error);
    }
  };

  const exportToWord = async () => {
    try {
      const { Document, Packer, Paragraph, TextRun, Header, Media } =
        await import("docx");

      const children = [
        new Paragraph({
          children: [
            new TextRun({
              text: title,
              bold: true,
              size: 28,
            }),
          ],
        }),
      ];

      if (client) {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: `Cliente: ${client}`,
                italics: true,
                size: 20,
              }),
            ],
          })
        );
      }

      children.push(new Paragraph({ text: "" }));

      // Dividir conteúdo em parágrafos
      const paragraphs = content.split("\n").filter((p: string) => p.trim());
      paragraphs.forEach((paragraph: string) => {
        children.push(
          new Paragraph({
            children: [
              new TextRun({
                text: paragraph,
                size: 20,
              }),
            ],
          })
        );
      });

      const doc = new Document({
        sections: [
          {
            properties: {},
            children: children,
          },
        ],
      });

      const blob = await Packer.toBlob(doc);
      const url = URL.createObjectURL(blob);
      const a = document.createElement("a");
      a.href = url;
      a.download = `${title}.docx`;
      a.click();
      URL.revokeObjectURL(url);

      toast.success("DOCX exportado com sucesso!");
    } catch (error) {
      toast.error("Erro ao exportar DOCX");
      console.error(error);
    }
  };

  return (
    <div className="space-y-6">
      <Card>
        <CardHeader>
          <div className="flex items-center justify-between">
            <CardTitle className="flex items-center space-x-2">
              <FileText className="w-5 h-5" />
              <span>Editor de Documento</span>
            </CardTitle>
            <Button variant="ghost" size="sm" onClick={onClose}>
              <X className="w-4 h-4" />
            </Button>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <Label htmlFor="title">Título do Documento</Label>
              <Input
                id="title"
                value={title}
                onChange={(e) => setTitle(e.target.value)}
                placeholder="Ex: Petição Inicial - Ação de Cobrança"
              />
            </div>
            <div>
              <Label htmlFor="client">Cliente</Label>
              <Input
                id="client"
                value={client}
                onChange={(e) => setClient(e.target.value)}
                placeholder="Nome do cliente"
              />
            </div>
          </div>

          <div>
            <Label htmlFor="type">Tipo</Label>
            <select
              id="type"
              value={type}
              onChange={(e) => setType(e.target.value)}
              className="w-full p-2 border rounded-md">
              <option value="petition">Petição</option>
              <option value="contract">Contrato</option>
              <option value="procuracao">Procuração</option>
              <option value="recurso">Recurso</option>
              <option value="parecer">Parecer</option>
              <option value="outros">Outros</option>
            </select>
          </div>

          <Separator />

          <div>
            <Label htmlFor="content">Conteúdo do Documento</Label>
            <Textarea
              id="content"
              value={content}
              onChange={(e) => setContent(e.target.value)}
              placeholder="Digite o conteúdo do documento..."
              className="min-h-[400px] font-mono text-sm"
            />
          </div>

          {logoUrl && (
            <div className="p-4 bg-gray-50 rounded-lg">
              <div className="flex items-center space-x-2 mb-2">
                <ImageIcon className="w-4 h-4" />
                <span className="text-sm font-medium">
                  Logo será incluído na exportação
                </span>
              </div>
              <img src={logoUrl} alt="Logo" className="h-12 object-contain" />
            </div>
          )}

          <div className="flex space-x-2 pt-4">
            <Button
              onClick={handleSave}
              className="flex items-center space-x-2">
              <Save className="w-4 h-4" />
              <span>Salvar</span>
            </Button>
            <Button
              variant="outline"
              onClick={exportToPDF}
              className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar PDF</span>
            </Button>
            <Button
              variant="outline"
              onClick={exportToWord}
              className="flex items-center space-x-2">
              <Download className="w-4 h-4" />
              <span>Exportar DOCX</span>
            </Button>
          </div>
        </CardContent>
      </Card>

      {/* Preview */}
      {content && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Eye className="w-5 h-5" />
              <span>Preview do Documento</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <JuridicalDocumentPreview
              content={content}
              title={title}
              clientName={client}
              logoUrl={logoUrl}
              showHeader={true}
              showQualityIndicators={true}
              className="min-h-[600px]"
            />
          </CardContent>
        </Card>
      )}
    </div>
  );
};

export default DocumentEditor;
