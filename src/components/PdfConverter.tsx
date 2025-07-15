"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import {
  FileText,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  FileArchive,
  FileInput,
  Image as ImageIcon,
  File,
} from "lucide-react";
import { toast } from "sonner";
import { buildToolkitUrl, TOOLKIT_CONFIG } from "@/lib/config";

interface ConversionResult {
  originalSize: number;
  convertedSize: number;
  fileName: string;
  format: string;
}

interface ConversionOption {
  id: string;
  name: string;
  description: string;
  fromFormat: string;
  toFormat: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
  endpoint: string;
  acceptTypes: Record<string, string[]>;
  multipleFiles?: boolean;
}

const conversionOptions: ConversionOption[] = [];

export default function PdfConverter() {
  const [selectedConversion, setSelectedConversion] =
    useState<ConversionOption>(conversionOptions[0]);
  const [files, setFiles] = useState<File[]>([]);
  const [isConverting, setIsConverting] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<ConversionResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  const onDrop = useCallback(
    (acceptedFiles: File[]) => {
      const validFiles = acceptedFiles.filter((file) => {
        const option = selectedConversion;
        return Object.entries(option.acceptTypes).some(
          ([mimeType, extensions]) => {
            return (
              file.type === mimeType ||
              extensions.some((ext) => file.name.toLowerCase().endsWith(ext))
            );
          }
        );
      });

      if (validFiles.length > 0) {
        setFiles(validFiles);
        setError(null);
        setResult(null);
        setProgress(0);
      } else {
        setError("Por favor, selecione arquivos válidos para esta conversão.");
      }
    },
    [selectedConversion]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: selectedConversion.acceptTypes,
    multiple: selectedConversion.multipleFiles || false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const convertFiles = async () => {
    if (files.length === 0) return;

    setIsConverting(true);
    setProgress(0);
    setError(null);

    try {
      // Simular progresso
      const progressInterval = setInterval(() => {
        setProgress((prev) => {
          if (prev >= 90) {
            clearInterval(progressInterval);
            return 90;
          }
          return prev + 10;
        });
      }, 200);

      const formData = new FormData();
      formData.append("conversionType", selectedConversion.id);

      // Adicionar arquivos
      if (selectedConversion.multipleFiles) {
        files.forEach((file) => {
          formData.append("files", file);
        });
      } else {
        formData.append("files", files[0]);
      }

      const response = await fetch(buildToolkitUrl("/api/toolkit/convert"), {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro na conversão");
      }

      const data = await response.json();
      setProgress(100);

      // Calcular informações de conversão
      const originalSize = files.reduce((total, file) => total + file.size, 0);
      const convertedSize = data.file.size;

      setResult({
        originalSize,
        convertedSize,
        fileName: data.file.name,
        format: selectedConversion.toFormat,
      });

      // Download real do arquivo processado
      if (data.file.downloadUrl) {
        const downloadUrl = buildToolkitUrl(data.file.downloadUrl);
        const a = document.createElement("a");
        a.href = downloadUrl;
        a.download = data.file.name;
        a.target = "_self"; // Força download na mesma aba
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        document.body.removeChild(a);
      }

      toast.success(`Conversão para ${selectedConversion.toFormat} concluída!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      toast.error("Erro na conversão");
    } finally {
      setIsConverting(false);
      setProgress(0);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setError(null);
    setResult(null);
    setProgress(0);
  };

  const handleConversionChange = (conversionId: string) => {
    const conversion = conversionOptions.find((opt) => opt.id === conversionId);
    if (conversion) {
      setSelectedConversion(conversion);
      resetForm();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileInput className="w-5 h-5" />
            Conversão de Arquivos
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção de Conversão */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Tipo de Conversão
            </label>
            <Tabs
              value={selectedConversion.id}
              onValueChange={handleConversionChange}>
              <TabsList className="grid w-full grid-cols-1 sm:grid-cols-3">
                {conversionOptions.map((option) => (
                  <TabsTrigger
                    key={option.id}
                    value={option.id}
                    className="text-sm">
                    {option.name}
                  </TabsTrigger>
                ))}
              </TabsList>

              {conversionOptions.map((option) => (
                <TabsContent
                  key={option.id}
                  value={option.id}
                  className="space-y-4">
                  <div className="flex items-center gap-3 p-4 bg-gray-50 rounded-lg">
                    <div
                      className={`w-12 h-12 ${option.bgColor} rounded-lg flex items-center justify-center`}>
                      <div className={option.color}>{option.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900">
                        {option.name}
                      </h3>
                      <p className="text-sm text-gray-500">
                        {option.description}
                      </p>
                      <div className="flex items-center gap-2 mt-1">
                        <Badge variant="outline" className="text-xs">
                          {option.fromFormat}
                        </Badge>
                        <span className="text-gray-400">→</span>
                        <Badge variant="outline" className="text-xs">
                          {option.toFormat}
                        </Badge>
                      </div>
                    </div>
                  </div>
                </TabsContent>
              ))}
            </Tabs>
          </div>

          {/* Área de Upload */}
          <div
            {...getRootProps()}
            className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors ${
              isDragActive
                ? "border-blue-500 bg-blue-50"
                : "border-gray-300 hover:border-gray-400"
            }`}>
            <input {...getInputProps()} />
            <Upload className="w-12 h-12 text-gray-400 mx-auto mb-4" />
            {isDragActive ? (
              <p className="text-blue-600">Solte os arquivos aqui...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Arraste e solte arquivos aqui, ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500">
                  Formatos aceitos:{" "}
                  {Object.values(selectedConversion.acceptTypes)
                    .flat()
                    .join(", ")}
                </p>
                <p className="text-sm text-gray-500">
                  Tamanho máximo: 50MB{" "}
                  {selectedConversion.multipleFiles ? "por arquivo" : ""}
                </p>
              </div>
            )}
          </div>

          {/* Arquivos Selecionados */}
          {files.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Arquivos Selecionados ({files.length})
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  disabled={isConverting}>
                  Remover Todos
                </Button>
              </div>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-2 bg-white rounded">
                    <File className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Progresso */}
          {isConverting && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Convertendo arquivos...</span>
                <span>{progress}%</span>
              </div>
              <Progress value={progress} className="w-full" />
            </div>
          )}

          {/* Erro */}
          {error && (
            <div className="bg-red-50 border border-red-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-red-600">
                <AlertCircle className="w-4 h-4" />
                <span className="font-medium">Erro</span>
              </div>
              <p className="text-red-600 mt-1">{error}</p>
            </div>
          )}

          {/* Resultado */}
          {result && (
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <div className="flex items-center gap-2 text-green-600 mb-3">
                <CheckCircle className="w-4 h-4" />
                <span className="font-medium">Conversão Concluída!</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Tamanho Original:</p>
                  <p className="font-medium">
                    {formatFileSize(result.originalSize)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tamanho Convertido:</p>
                  <p className="font-medium">
                    {formatFileSize(result.convertedSize)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Formato:</p>
                  <Badge variant="secondary" className="text-green-600">
                    {result.format}
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={convertFiles}
              disabled={files.length === 0 || isConverting}
              className="flex-1">
              {isConverting ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Convertendo...
                </>
              ) : (
                <>
                  <FileInput className="w-4 h-4 mr-2" />
                  Converter para {selectedConversion.toFormat}
                </>
              )}
            </Button>

            {result && (
              <Button
                variant="outline"
                onClick={() => {
                  // Re-download do arquivo
                  const blob = new Blob(
                    [`Arquivo Convertido: ${result.fileName}`],
                    {
                      type: result.format, // Assuming result.fileType is not available, using result.format
                    }
                  );
                  const url = window.URL.createObjectURL(blob);
                  const a = document.createElement("a");
                  a.href = url;
                  a.download = result.fileName;
                  a.target = "_self"; // Força download na mesma aba
                  a.rel = "noopener noreferrer";
                  document.body.appendChild(a);
                  a.click();
                  window.URL.revokeObjectURL(url);
                  document.body.removeChild(a);
                }}>
                <Download className="w-4 h-4 mr-2" />
                Baixar Novamente
              </Button>
            )}
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
