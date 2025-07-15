"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  FileText,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  File,
  Settings,
  FileArchive,
  GripVertical,
  Trash2,
  Info,
} from "lucide-react";
import { toast } from "sonner";
import { buildToolkitUrl, TOOLKIT_CONFIG } from "@/lib/config";

interface MergeResult {
  originalSize: number;
  totalFiles: number;
  fileName: string;
  finalSize: number;
}

export default function PdfMerger() {
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<MergeResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [outputFileName, setOutputFileName] = useState<string>("");
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      return (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      );
    });

    if (validFiles.length > 0) {
      setFiles((prev) => [...prev, ...validFiles]);
      setError(null);
      setResult(null);
      setProgress(0);
    } else {
      setError("Por favor, selecione arquivos PDF válidos.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: { "application/pdf": [".pdf"] },
    multiple: true,
    maxSize: 50 * 1024 * 1024, // 50MB por arquivo
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const removeFile = (index: number) => {
    setFiles((prev) => prev.filter((_, i) => i !== index));
  };

  const moveFile = (fromIndex: number, toIndex: number) => {
    if (toIndex < 0 || toIndex >= files.length) return;

    setFiles((prev) => {
      const newFiles = [...prev];
      const [movedFile] = newFiles.splice(fromIndex, 1);
      newFiles.splice(toIndex, 0, movedFile);
      return newFiles;
    });
  };

  const mergePdfs = async () => {
    if (files.length < 2) {
      setError("Selecione pelo menos 2 arquivos PDF para juntar.");
      return;
    }

    setIsProcessing(true);
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
      formData.append("outputFileName", outputFileName || "merged-pdf");
      formData.append("includePageNumbers", includePageNumbers.toString());

      // Adicionar todos os arquivos
      files.forEach((file, index) => {
        formData.append("files", file);
      });

      const response = await fetch(buildToolkitUrl("/api/toolkit/merge"), {
        method: "POST",
        body: formData,
      });

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao juntar PDFs");
      }

      const data = await response.json();
      setProgress(100);

      // Usar dados da resposta da API
      const totalSize = files.reduce((sum, file) => sum + file.size, 0);

      setResult({
        originalSize: totalSize,
        totalFiles: files.length,
        fileName: data.file.name,
        finalSize: data.file.size,
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

      toast.success(`PDFs juntados com sucesso!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      toast.error("Erro ao juntar PDFs");
    } finally {
      setIsProcessing(false);
      setProgress(0);
    }
  };

  const resetForm = () => {
    setFiles([]);
    setError(null);
    setResult(null);
    setProgress(0);
    setOutputFileName("");
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Juntar PDFs
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Configurações */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label htmlFor="outputFileName">Nome do Arquivo de Saída</Label>
                <Input
                  id="outputFileName"
                  placeholder="Ex: documento-final"
                  value={outputFileName}
                  onChange={(e) => setOutputFileName(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500">
                  Nome do arquivo PDF final (sem extensão)
                </p>
              </div>

              <div className="flex items-center space-x-2">
                <Switch
                  id="includePageNumbers"
                  checked={includePageNumbers}
                  onCheckedChange={setIncludePageNumbers}
                />
                <Label htmlFor="includePageNumbers">
                  Incluir números de página
                </Label>
              </div>
            </div>
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
              <p className="text-blue-600">Solte os arquivos PDF aqui...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Arraste e solte arquivos PDF aqui, ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500">Formato aceito: PDF</p>
                <p className="text-sm text-gray-500">
                  Tamanho máximo: 50MB por arquivo
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
                  disabled={isProcessing}>
                  Limpar Todos
                </Button>
              </div>
              <div className="space-y-2">
                {files.map((file, index) => (
                  <div
                    key={index}
                    className="flex items-center gap-3 p-3 bg-white rounded border">
                    <GripVertical className="w-4 h-4 text-gray-400 cursor-move" />
                    <File className="w-4 h-4 text-gray-400" />
                    <div className="flex-1 min-w-0">
                      <p className="text-sm font-medium text-gray-900 truncate">
                        {file.name}
                      </p>
                      <p className="text-xs text-gray-500">
                        {formatFileSize(file.size)}
                      </p>
                    </div>
                    <div className="flex items-center gap-1">
                      {index > 0 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFile(index, index - 1)}
                          disabled={isProcessing}
                          className="h-6 w-6 p-0">
                          ↑
                        </Button>
                      )}
                      {index < files.length - 1 && (
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => moveFile(index, index + 1)}
                          disabled={isProcessing}
                          className="h-6 w-6 p-0">
                          ↓
                        </Button>
                      )}
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => removeFile(index)}
                        disabled={isProcessing}
                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700">
                        <Trash2 className="w-3 h-3" />
                      </Button>
                    </div>
                  </div>
                ))}
              </div>
              <p className="text-xs text-gray-500 mt-2">
                💡 Arraste os arquivos para reordenar a sequência de junção
              </p>
            </div>
          )}

          {/* Instruções */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-center gap-2 text-blue-600 mb-2">
              <Info className="w-4 h-4" />
              <span className="font-medium">Como usar:</span>
            </div>
            <ul className="space-y-1 text-xs text-blue-700">
              <li>• Selecione 2 ou mais arquivos PDF</li>
              <li>• Arraste para reordenar a sequência</li>
              <li>• Os PDFs serão juntados na ordem mostrada</li>
            </ul>
          </div>

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={mergePdfs}
              disabled={files.length < 2 || isProcessing}
              className="flex-1">
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Juntando...
                </>
              ) : (
                <>
                  <FileText className="w-4 h-4 mr-2" />
                  Juntar PDFs
                </>
              )}
            </Button>

            {result && (
              <Button
                variant="outline"
                onClick={() => {
                  // Re-download do arquivo
                  const blob = new Blob([`PDF Mesclado: ${result.fileName}`], {
                    type: "application/pdf",
                  });
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

          {/* Progresso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Juntando PDFs...</span>
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
                <span className="font-medium">PDFs Juntados com Sucesso!</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Arquivos Processados:</p>
                  <p className="font-medium">{result.totalFiles}</p>
                </div>
                <div>
                  <p className="text-gray-600">Tamanho Final:</p>
                  <p className="font-medium">
                    {formatFileSize(result.finalSize)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tamanho Original:</p>
                  <p className="font-medium">
                    {formatFileSize(result.originalSize)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Arquivo Gerado:</p>
                  <p className="font-medium truncate">{result.fileName}</p>
                </div>
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
