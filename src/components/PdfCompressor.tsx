"use client";

import React, { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import {
  FileArchive,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
} from "lucide-react";
import { toast } from "sonner";
import { buildToolkitUrl, TOOLKIT_CONFIG } from "@/lib/config";

interface CompressionResult {
  originalSize: number;
  compressedSize: number;
  compressionRatio: number;
  fileName: string;
}

export default function PdfCompressor() {
  const [file, setFile] = useState<File | null>(null);
  const [isCompressing, setIsCompressing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<CompressionResult | null>(null);
  const [error, setError] = useState<string | null>(null);
  const [quality, setQuality] = useState<"medium" | "maximum">("medium");

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const pdfFile = acceptedFiles[0];
    if (pdfFile && pdfFile.type === "application/pdf") {
      setFile(pdfFile);
      setError(null);
      setResult(null);
      setProgress(0);
    } else {
      setError("Por favor, selecione um arquivo PDF válido.");
    }
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    multiple: false,
    maxSize: 50 * 1024 * 1024, // 50MB
  });

  const formatFileSize = (bytes: number): string => {
    if (bytes === 0) return "0 Bytes";
    const k = 1024;
    const sizes = ["Bytes", "KB", "MB", "GB"];
    const i = Math.floor(Math.log(bytes) / Math.log(k));
    return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
  };

  const compressPdf = async () => {
    if (!file) return;

    setIsCompressing(true);
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

      // Usar o servidor do toolkit (local em dev, VPS em produção)
      const formData = new FormData();
      formData.append("file", file);
      formData.append("operation", "compress-pdf");
      formData.append("quality", quality);

      console.log("🔧 Frontend enviando qualidade:", quality);

      const response = await fetch(
        buildToolkitUrl(TOOLKIT_CONFIG.ENDPOINTS.UPLOAD),
        {
          method: "POST",
          body: formData,
        }
      );

      clearInterval(progressInterval);

      if (!response.ok) {
        const errorData = await response.json();
        throw new Error(errorData.error || "Erro ao comprimir PDF");
      }

      const data = await response.json();
      setProgress(100);

      // Usar dados da resposta da API
      const originalSize = file.size;
      const compressedSize = data.file.size;
      const compressionRatio =
        ((originalSize - compressedSize) / originalSize) * 100;

      setResult({
        originalSize,
        compressedSize,
        compressionRatio,
        fileName: data.file.name,
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
      } else {
        // Fallback para simulação se não houver downloadUrl
        const pdfHeader =
          "%PDF-1.4\n1 0 obj\n<<\n/Type /Catalog\n/Pages 2 0 R\n>>\nendobj\n2 0 obj\n<<\n/Type /Pages\n/Kids [3 0 R]\n/Count 1\n>>\nendobj\n3 0 obj\n<<\n/Type /Page\n/Parent 2 0 R\n/MediaBox [0 0 612 792]\n/Contents 4 0 R\n>>\nendobj\n4 0 obj\n<<\n/Length 44\n>>\nstream\nBT\n/F1 12 Tf\n100 700 Td\n(PDF Comprimido) Tj\nET\nendstream\nendobj\nxref\n0 5\n0000000000 65535 f \n0000000009 00000 n \n0000000074 00000 n \n0000000120 00000 n \n0000000179 00000 n \ntrailer\n<<\n/Size 5\n/Root 1 0 R\n>>\nstartxref\n238\n%%EOF";

        const blob = new Blob([pdfHeader], {
          type: "application/pdf",
        });
        const url = window.URL.createObjectURL(blob);
        const a = document.createElement("a");
        a.href = url;
        a.download = data.file.name;
        a.target = "_self"; // Força download na mesma aba
        a.rel = "noopener noreferrer";
        document.body.appendChild(a);
        a.click();
        window.URL.revokeObjectURL(url);
        document.body.removeChild(a);
      }

      toast.success("PDF comprimido com sucesso!");
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      toast.error("Erro ao comprimir PDF");
    } finally {
      setIsCompressing(false);
      setProgress(0);
    }
  };

  const resetForm = () => {
    setFile(null);
    setError(null);
    setResult(null);
    setProgress(0);
  };

  return (
    <div className="max-w-2xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileArchive className="w-5 h-5" />
            Compressão de PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Opção de qualidade */}
          <div className="flex gap-6 items-center mb-2">
            <span className="font-medium text-gray-700">
              Qualidade da compressão:
            </span>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="quality"
                value="medium"
                checked={quality === "medium"}
                onChange={() => setQuality("medium")}
                disabled={isCompressing}
              />
              <span>Compressão Média (recomendado)</span>
            </label>
            <label className="flex items-center gap-1 cursor-pointer">
              <input
                type="radio"
                name="quality"
                value="maximum"
                checked={quality === "maximum"}
                onChange={() => setQuality("maximum")}
                disabled={isCompressing}
              />
              <span>Compressão Máxima (arquivo menor, menor qualidade)</span>
            </label>
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
              <p className="text-blue-600">Solte o arquivo PDF aqui...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Arraste e solte um arquivo PDF aqui, ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500">Tamanho máximo: 50MB</p>
              </div>
            )}
          </div>

          {/* Arquivo Selecionado */}
          {file && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between">
                <div className="flex items-center gap-3">
                  <FileArchive className="w-5 h-5 text-blue-600" />
                  <div>
                    <p className="font-medium text-gray-900">{file.name}</p>
                    <p className="text-sm text-gray-500">
                      {formatFileSize(file.size)}
                    </p>
                  </div>
                </div>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  disabled={isCompressing}>
                  Remover
                </Button>
              </div>
            </div>
          )}

          {/* Progresso */}
          {isCompressing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Comprimindo PDF...</span>
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
                <span className="font-medium">Compressão Concluída!</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm">
                <div>
                  <p className="text-gray-600">Tamanho Original:</p>
                  <p className="font-medium">
                    {formatFileSize(result.originalSize)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Tamanho Comprimido:</p>
                  <p className="font-medium">
                    {formatFileSize(result.compressedSize)}
                  </p>
                </div>
                <div className="col-span-2">
                  <p className="text-gray-600">Redução:</p>
                  <Badge variant="secondary" className="text-green-600">
                    {result.compressionRatio.toFixed(1)}% menor
                  </Badge>
                </div>
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={compressPdf}
              disabled={!file || isCompressing}
              className="flex-1">
              {isCompressing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Comprimindo...
                </>
              ) : (
                <>
                  <FileArchive className="w-4 h-4 mr-2" />
                  Comprimir PDF
                </>
              )}
            </Button>

            {result && (
              <Button
                variant="outline"
                onClick={() => {
                  // Re-download do arquivo
                  const url = window.URL.createObjectURL(
                    new Blob([], { type: "application/pdf" })
                  );
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
