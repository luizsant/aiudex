"use client";

import { useState, useEffect } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  FileText,
  Search,
  Edit3,
  Trash2,
  Copy,
  Download,
  Eye,
  Calendar,
  User,
  Tag,
  Filter,
  SortAsc,
  SortDesc,
  MoreHorizontal,
  Plus,
  Archive,
  Star,
  Bot,
} from "lucide-react";
import { documentService, LegalDocument } from "@/lib/document-service";

interface DocumentManagerProps {
  isOpen: boolean;
  onClose: () => void;
  onEditDocument: (document: LegalDocument) => void;
}

export const DocumentManager = ({
  isOpen,
  onClose,
  onEditDocument,
}: DocumentManagerProps) => {
  const [documents, setDocuments] = useState<LegalDocument[]>([]);
  const [searchTerm, setSearchTerm] = useState("");
  const [statusFilter, setStatusFilter] = useState<string>("");
  const [typeFilter, setTypeFilter] = useState<string>("");
  const [sortBy, setSortBy] = useState<"date" | "name" | "client">("date");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [selectedDocument, setSelectedDocument] =
    useState<LegalDocument | null>(null);
  const [showPreview, setShowPreview] = useState(false);

  useEffect(() => {
    if (isOpen) {
      loadDocuments();
    }
  }, [isOpen]);

  const loadDocuments = () => {
    const docs = documentService.getDocuments({
      search: searchTerm,
      status: statusFilter,
      type: typeFilter,
    });
    setDocuments(docs);
  };

  useEffect(() => {
    loadDocuments();
  }, [searchTerm, statusFilter, typeFilter]);

  const handleDeleteDocument = (documentId: string) => {
    if (confirm("Tem certeza que deseja excluir este documento?")) {
      documentService.deleteDocument(documentId);
      loadDocuments();
    }
  };

  const handleDuplicateDocument = (documentId: string) => {
    const duplicated = documentService.duplicateDocument(documentId);
    if (duplicated) {
      loadDocuments();
      alert("Documento duplicado com sucesso!");
    }
  };

  const handleExportDocument = (
    documentId: string,
    format: "pdf" | "docx" | "txt"
  ) => {
    try {
      const content = documentService.exportDocument(documentId, format);

      if (format === "txt") {
        const blob = new Blob([content], { type: "text/plain" });
        const url = URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = `documento-${documentId}.txt`;
        a.click();
      } else {
        alert(`${format.toUpperCase()} gerado com sucesso!`);
      }
    } catch (error) {
      alert("Erro ao exportar documento");
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "finalized":
        return "bg-green-100 text-green-800";
      case "archived":
        return "bg-gray-100 text-gray-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getStatusLabel = (status: string) => {
    switch (status) {
      case "finalized":
        return "Finalizado";
      case "archived":
        return "Arquivado";
      default:
        return status;
    }
  };

  const formatDate = (date: Date) => {
    return new Date(date).toLocaleDateString("pt-BR", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const sortedDocuments = [...documents].sort((a, b) => {
    let comparison = 0;

    switch (sortBy) {
      case "date":
        comparison = a.updatedAt.getTime() - b.updatedAt.getTime();
        break;
      case "name":
        comparison = a.title.localeCompare(b.title);
        break;
      case "client":
        comparison = a.clientName.localeCompare(b.clientName);
        break;
    }

    return sortOrder === "asc" ? comparison : -comparison;
  });

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-6xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold">
            Gerenciador de Documentos
          </DialogTitle>
          <DialogDescription>
            Gerencie todos os seus documentos jurídicos em um só lugar
          </DialogDescription>
        </DialogHeader>

        {/* Filtros e Busca */}
        <div className="space-y-4">
          <div className="flex items-center space-x-4">
            <div className="flex-1 relative">
              <Search className="absolute left-3 top-3 h-4 w-4 text-gray-400" />
              <Input
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Buscar documentos..."
                className="pl-10"
              />
            </div>
            <Button variant="outline" size="sm">
              <Filter className="w-4 h-4 mr-2" />
              Filtros
            </Button>
            <Button
              variant="outline"
              size="sm"
              onClick={() => {
                setSortOrder(sortOrder === "asc" ? "desc" : "asc");
              }}>
              {sortOrder === "asc" ? (
                <SortAsc className="w-4 h-4" />
              ) : (
                <SortDesc className="w-4 h-4" />
              )}
            </Button>
          </div>

          {/* Filtros Avançados */}
          <div className="grid grid-cols-3 gap-4">
            <div>
              <label className="text-sm font-medium">Status</label>
              <select
                value={statusFilter}
                onChange={(e) => setStatusFilter(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md text-sm">
                <option value="">Todos</option>

                <option value="finalized">Finalizado</option>
                <option value="archived">Arquivado</option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Tipo</label>
              <select
                value={typeFilter}
                onChange={(e) => setTypeFilter(e.target.value)}
                className="w-full mt-1 p-2 border rounded-md text-sm">
                <option value="">Todos</option>
                <option value="inicial-indenizacao">
                  Petição Inicial - Indenização
                </option>
                <option value="contestacao-civel">Contestação Cível</option>
                <option value="reclamatoria-trabalhista">
                  Reclamatória Trabalhista
                </option>
              </select>
            </div>
            <div>
              <label className="text-sm font-medium">Ordenar por</label>
              <select
                value={sortBy}
                onChange={(e) =>
                  setSortBy(e.target.value as "date" | "name" | "client")
                }
                className="w-full mt-1 p-2 border rounded-md text-sm">
                <option value="date">Data</option>
                <option value="name">Nome</option>
                <option value="client">Cliente</option>
              </select>
            </div>
          </div>
        </div>

        {/* Lista de Documentos */}
        <div className="space-y-4">
          {sortedDocuments.length === 0 ? (
            <Card className="text-center py-12">
              <CardContent>
                <FileText className="w-12 h-12 text-gray-400 mx-auto mb-4" />
                <h3 className="text-lg font-medium text-gray-900 mb-2">
                  Nenhum documento encontrado
                </h3>
                <p className="text-gray-500">
                  Crie seu primeiro documento com IA
                </p>
              </CardContent>
            </Card>
          ) : (
            sortedDocuments.map((document) => (
              <Card
                key={document.id}
                className="hover:shadow-md transition-shadow">
                <CardContent className="p-4">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-4 flex-1">
                      <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                        <FileText className="w-5 h-5 text-blue-600" />
                      </div>
                      <div className="flex-1 min-w-0">
                        <h4 className="font-medium text-gray-900 truncate">
                          {document.title}
                        </h4>
                        <div className="flex items-center space-x-4 text-sm text-gray-500 mt-1">
                          <span className="flex items-center">
                            <User className="w-3 h-3 mr-1" />
                            {document.clientName}
                          </span>
                          <span className="flex items-center">
                            <Calendar className="w-3 h-3 mr-1" />
                            {formatDate(document.updatedAt)}
                          </span>
                          <span className="flex items-center">
                            <Tag className="w-3 h-3 mr-1" />
                            {document.type}
                          </span>
                        </div>
                      </div>
                    </div>

                    <div className="flex items-center space-x-2">
                      <Badge className={getStatusColor(document.status)}>
                        {getStatusLabel(document.status)}
                      </Badge>

                      <div className="flex items-center space-x-1">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => {
                            setSelectedDocument(document);
                            setShowPreview(true);
                          }}>
                          <Eye className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => onEditDocument(document)}>
                          <Edit3 className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            navigator.clipboard.writeText(document.content)
                          }>
                          <Copy className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() =>
                            handleExportDocument(document.id, "txt")
                          }>
                          <Download className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDuplicateDocument(document.id)}>
                          <Plus className="w-4 h-4" />
                        </Button>
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => handleDeleteDocument(document.id)}
                          className="text-red-600 hover:text-red-700">
                          <Trash2 className="w-4 h-4" />
                        </Button>
                      </div>
                    </div>
                  </div>

                  {document.metadata.aiGenerated && (
                    <div className="mt-3 flex items-center space-x-2">
                      <Badge
                        variant="secondary"
                        className="bg-purple-100 text-purple-700">
                        <Bot className="w-3 h-3 mr-1" />
                        IA Gerado
                      </Badge>
                      {document.metadata.confidence && (
                        <span className="text-xs text-gray-500">
                          Confiança:{" "}
                          {Math.round(document.metadata.confidence * 100)}%
                        </span>
                      )}
                    </div>
                  )}
                </CardContent>
              </Card>
            ))
          )}
        </div>

        {/* Estatísticas */}
        <div className="mt-6 p-4 bg-gray-50 rounded-lg">
          <h4 className="font-medium mb-2">Estatísticas</h4>
          <div className="grid grid-cols-4 gap-4 text-sm">
            <div>
              <span className="text-gray-500">Total:</span>
              <span className="font-medium ml-1">{documents.length}</span>
            </div>

            <div>
              <span className="text-gray-500">Finalizados:</span>
              <span className="font-medium ml-1">
                {documents.filter((d) => d.status === "finalized").length}
              </span>
            </div>
            <div>
              <span className="text-gray-500">IA Gerados:</span>
              <span className="font-medium ml-1">
                {documents.filter((d) => d.metadata.aiGenerated).length}
              </span>
            </div>
          </div>
        </div>
      </DialogContent>

      {/* Modal de Preview */}
      <Dialog open={showPreview} onOpenChange={setShowPreview}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle>{selectedDocument?.title}</DialogTitle>
            <DialogDescription>Visualização do documento</DialogDescription>
          </DialogHeader>
          <div className="bg-white border rounded-lg p-6 max-h-96 overflow-y-auto">
            <pre className="whitespace-pre-wrap text-sm font-mono">
              {selectedDocument?.content}
            </pre>
          </div>
        </DialogContent>
      </Dialog>
    </Dialog>
  );
};
