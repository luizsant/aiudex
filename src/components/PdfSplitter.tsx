import { useState, useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Progress } from "@/components/ui/progress";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Switch } from "@/components/ui/switch";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  Upload,
  Download,
  AlertCircle,
  CheckCircle,
  Scissors,
  File,
  Settings,
  Info,
  FileArchive,
} from "lucide-react";
import { toast } from "sonner";
import { buildToolkitUrl, TOOLKIT_CONFIG } from "@/lib/config";

interface SplitResult {
  originalSize: number;
  totalParts: number;
  fileName: string;
  parts: Array<{
    name: string;
    size: number;
    pages: string;
  }>;
}

interface SplitOption {
  id: string;
  name: string;
  description: string;
  icon: React.ReactNode;
  color: string;
  bgColor: string;
}

const splitOptions: SplitOption[] = [
  {
    id: "page-range",
    name: "Por Intervalo de Páginas",
    description: "Especifique quais páginas extrair (ex: 1-5, 7, 10-15)",
    icon: <FileText className="w-5 h-5" />,
    color: "text-blue-600",
    bgColor: "bg-blue-100",
  },
  {
    id: "every-n-pages",
    name: "A Cada N Páginas",
    description: "Divida o PDF a cada N páginas (ex: a cada 5 páginas)",
    icon: <Scissors className="w-5 h-5" />,
    color: "text-green-600",
    bgColor: "bg-green-100",
  },
  {
    id: "split-by-files",
    name: "Por Número de Arquivos",
    description:
      "Divida o PDF em N arquivos com páginas iguais (ex: 3 arquivos)",
    icon: <File className="w-5 h-5" />,
    color: "text-orange-600",
    bgColor: "bg-orange-100",
  },
  {
    id: "split-all",
    name: "Todas as Páginas",
    description: "Extraia cada página como um arquivo separado",
    icon: <File className="w-5 h-5" />,
    color: "text-purple-600",
    bgColor: "bg-purple-100",
  },
];

export default function PdfSplitter() {
  const [selectedSplitOption, setSelectedSplitOption] = useState<SplitOption>(
    splitOptions[0]
  );
  const [files, setFiles] = useState<File[]>([]);
  const [isProcessing, setIsProcessing] = useState(false);
  const [progress, setProgress] = useState(0);
  const [result, setResult] = useState<SplitResult | null>(null);
  const [error, setError] = useState<string | null>(null);

  // Configurações específicas para cada tipo de split
  const [pageRange, setPageRange] = useState<string>("");
  const [everyNPages, setEveryNPages] = useState<number>(5);
  const [numberOfFiles, setNumberOfFiles] = useState<number>(3);
  const [includePageNumbers, setIncludePageNumbers] = useState<boolean>(true);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const validFiles = acceptedFiles.filter((file) => {
      return (
        file.type === "application/pdf" ||
        file.name.toLowerCase().endsWith(".pdf")
      );
    });

    if (validFiles.length > 0) {
      setFiles(validFiles);
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

  const validatePageRange = (range: string): boolean => {
    if (!range.trim()) return false;

    const parts = range.split(",");
    for (const part of parts) {
      const trimmed = part.trim();
      if (trimmed.includes("-")) {
        const [start, end] = trimmed.split("-").map((s) => parseInt(s.trim()));
        if (isNaN(start) || isNaN(end) || start < 1 || end < start) {
          return false;
        }
      } else {
        const page = parseInt(trimmed);
        if (isNaN(page) || page < 1) {
          return false;
        }
      }
    }
    return true;
  };

  const splitPdf = async () => {
    if (files.length === 0) return;

    // Validações específicas
    if (
      selectedSplitOption.id === "page-range" &&
      !validatePageRange(pageRange)
    ) {
      setError(
        "Por favor, insira um intervalo de páginas válido (ex: 1-5, 7, 10-15)"
      );
      return;
    }

    if (
      selectedSplitOption.id === "every-n-pages" &&
      (everyNPages < 1 || everyNPages > 100)
    ) {
      setError("Por favor, insira um número válido de páginas (1-100)");
      return;
    }

    if (
      selectedSplitOption.id === "split-by-files" &&
      (numberOfFiles < 2 || numberOfFiles > 50)
    ) {
      setError("Por favor, insira um número válido de arquivos (2-50)");
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
      formData.append("file", files[0]);
      formData.append("operation", "split-pdf");
      formData.append("splitType", selectedSplitOption.id);
      formData.append("includePageNumbers", includePageNumbers.toString());

      // Adicionar parâmetros específicos baseados no tipo de split
      switch (selectedSplitOption.id) {
        case "page-range":
          formData.append("pageRange", pageRange);
          break;
        case "every-n-pages":
          formData.append("everyNPages", everyNPages.toString());
          break;
        case "split-by-files":
          formData.append("numberOfFiles", numberOfFiles.toString());
          break;
        case "split-all":
          // Não precisa de parâmetros adicionais
          break;
      }

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
        throw new Error(errorData.error || "Erro ao dividir PDF");
      }

      const data = await response.json();
      setProgress(100);

      // Usar dados da resposta da API
      const originalSize = files[0].size;

      setResult({
        originalSize,
        totalParts: data.parts.length,
        fileName: data.file.name,
        parts: data.parts,
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

      toast.success(`PDF dividido em ${data.parts.length} partes!`);
    } catch (err) {
      setError(err instanceof Error ? err.message : "Erro desconhecido");
      toast.error("Erro ao dividir PDF");
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
    setPageRange("");
    setEveryNPages(5);
    setNumberOfFiles(3);
  };

  const handleSplitOptionChange = (optionId: string) => {
    const option = splitOptions.find((opt) => opt.id === optionId);
    if (option) {
      setSelectedSplitOption(option);
      resetForm();
    }
  };

  return (
    <div className="max-w-4xl mx-auto space-y-6">
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <Scissors className="w-5 h-5" />
            Divisão de PDF
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Seleção do Tipo de Divisão */}
          <div className="space-y-4">
            <label className="text-sm font-medium text-gray-700">
              Tipo de Divisão
            </label>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-4 gap-4">
              {splitOptions.map((option) => (
                <div
                  key={option.id}
                  className={`p-4 rounded-lg border-2 cursor-pointer transition-all ${
                    selectedSplitOption.id === option.id
                      ? "border-blue-500 bg-blue-50"
                      : "border-gray-200 hover:border-gray-300"
                  }`}
                  onClick={() => handleSplitOptionChange(option.id)}>
                  <div className="flex items-center gap-3">
                    <div
                      className={`w-10 h-10 ${option.bgColor} rounded-lg flex items-center justify-center`}>
                      <div className={option.color}>{option.icon}</div>
                    </div>
                    <div>
                      <h3 className="font-medium text-gray-900 text-sm">
                        {option.name}
                      </h3>
                      <p className="text-xs text-gray-500 mt-1">
                        {option.description}
                      </p>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>

          {/* Configurações Específicas */}
          {selectedSplitOption.id === "page-range" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="pageRange">Intervalo de Páginas</Label>
                <Input
                  id="pageRange"
                  placeholder="Ex: 1-5, 7, 10-15"
                  value={pageRange}
                  onChange={(e) => setPageRange(e.target.value)}
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  Use vírgulas para separar páginas e hífens para intervalos
                </p>
              </div>
            </div>
          )}

          {selectedSplitOption.id === "every-n-pages" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="everyNPages">Dividir a cada N páginas</Label>
                <Input
                  id="everyNPages"
                  type="number"
                  min="1"
                  max="100"
                  value={everyNPages}
                  onChange={(e) =>
                    setEveryNPages(parseInt(e.target.value) || 1)
                  }
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O PDF será dividido a cada N páginas
                </p>
              </div>
            </div>
          )}

          {selectedSplitOption.id === "split-by-files" && (
            <div className="space-y-4">
              <div>
                <Label htmlFor="numberOfFiles">Número de Arquivos</Label>
                <Input
                  id="numberOfFiles"
                  type="number"
                  min="2"
                  max="50"
                  value={numberOfFiles}
                  onChange={(e) =>
                    setNumberOfFiles(parseInt(e.target.value) || 2)
                  }
                  className="mt-1"
                />
                <p className="text-xs text-gray-500 mt-1">
                  O PDF será dividido em N arquivos com páginas iguais
                </p>
              </div>
            </div>
          )}

          {/* Configurações Gerais */}
          <div className="space-y-4">
            <h4 className="font-medium text-gray-900 flex items-center gap-2">
              <Settings className="w-4 h-4" />
              Configurações
            </h4>

            <div className="grid grid-cols-1 sm:grid-cols-2 gap-4">
              <div className="space-y-2">
                <Label>Formato de Saída</Label>
                <div className="flex items-center gap-2 p-3 bg-blue-50 rounded-lg border">
                  <FileArchive className="w-4 h-4 text-blue-600" />
                  <span className="text-sm font-medium text-blue-900">
                    ZIP (Recomendado)
                  </span>
                </div>
                <p className="text-xs text-gray-500">
                  Os arquivos divididos serão compactados em um arquivo ZIP
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
              <p className="text-blue-600">Solte o arquivo PDF aqui...</p>
            ) : (
              <div>
                <p className="text-gray-600 mb-2">
                  Arraste e solte um arquivo PDF aqui, ou clique para selecionar
                </p>
                <p className="text-sm text-gray-500">Formato aceito: PDF</p>
                <p className="text-sm text-gray-500">Tamanho máximo: 50MB</p>
              </div>
            )}
          </div>

          {/* Arquivo Selecionado */}
          {files.length > 0 && (
            <div className="bg-gray-50 rounded-lg p-4">
              <div className="flex items-center justify-between mb-3">
                <h4 className="font-medium text-gray-900">
                  Arquivo Selecionado
                </h4>
                <Button
                  variant="outline"
                  size="sm"
                  onClick={resetForm}
                  disabled={isProcessing}>
                  Remover
                </Button>
              </div>
              <div className="flex items-center gap-3 p-2 bg-white rounded">
                <File className="w-4 h-4 text-gray-400" />
                <div className="flex-1 min-w-0">
                  <p className="text-sm font-medium text-gray-900 truncate">
                    {files[0].name}
                  </p>
                  <p className="text-xs text-gray-500">
                    {formatFileSize(files[0].size)}
                  </p>
                </div>
              </div>
            </div>
          )}

          {/* Progresso */}
          {isProcessing && (
            <div className="space-y-2">
              <div className="flex justify-between text-sm">
                <span>Processando PDF...</span>
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
                <span className="font-medium">PDF Dividido com Sucesso!</span>
              </div>
              <div className="grid grid-cols-2 gap-4 text-sm mb-4">
                <div>
                  <p className="text-gray-600">Tamanho Original:</p>
                  <p className="font-medium">
                    {formatFileSize(result.originalSize)}
                  </p>
                </div>
                <div>
                  <p className="text-gray-600">Total de Partes:</p>
                  <p className="font-medium">{result.totalParts}</p>
                </div>
              </div>

              <div className="space-y-2">
                <p className="text-sm font-medium text-gray-700">
                  Partes Criadas:
                </p>
                {result.parts.map((part, index) => (
                  <div
                    key={index}
                    className="flex items-center justify-between p-2 bg-white rounded text-sm">
                    <span className="font-medium">{part.name}</span>
                    <div className="flex items-center gap-4 text-gray-500">
                      <span>{part.pages}</span>
                      <span>{formatFileSize(part.size)}</span>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {/* Botões */}
          <div className="flex gap-3">
            <Button
              onClick={splitPdf}
              disabled={files.length === 0 || isProcessing}
              className="flex-1">
              {isProcessing ? (
                <>
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                  Processando...
                </>
              ) : (
                <>
                  <Scissors className="w-4 h-4 mr-2" />
                  Dividir PDF
                </>
              )}
            </Button>

            {result && (
              <Button
                variant="outline"
                onClick={() => {
                  // Re-download do arquivo
                  const blob = new Blob([`Arquivo ZIP: ${result.fileName}`], {
                    type: "application/zip",
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

          {/* Informações Adicionais */}
          <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
            <div className="flex items-start gap-2">
              <Info className="w-4 h-4 text-blue-600 mt-0.5" />
              <div className="text-sm text-blue-800">
                <p className="font-medium mb-1">Como usar:</p>
                <ul className="space-y-1 text-xs">
                  <li>
                    • <strong>Por Intervalo:</strong> Especifique páginas
                    específicas (ex: 1-5, 7, 10-15)
                  </li>
                  <li>
                    • <strong>A Cada N Páginas:</strong> Divida automaticamente
                    a cada N páginas
                  </li>
                  <li>
                    • <strong>Por Número de Arquivos:</strong> Divida o PDF em N
                    arquivos com páginas iguais
                  </li>
                  <li>
                    • <strong>Todas as Páginas:</strong> Extraia cada página
                    como arquivo separado
                  </li>
                </ul>
              </div>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
}
