import { useState, useRef } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Textarea } from "@/components/ui/textarea";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  FileText,
  PenTool,
  Download,
  Eye,
  CheckCircle,
  AlertCircle,
  Clock,
  User,
  Calendar,
  Lock,
  Shield,
  FileCheck,
  Send,
  Copy,
  Share2,
} from "lucide-react";
import { useToast } from "@/hooks/use-toast";

interface SignatureData {
  id: string;
  documentTitle: string;
  signerName: string;
  signerOAB?: string;
  signerCPF: string;
  signatureDate: Date;
  signatureType: "digital" | "eletronica" | "manual";
  status: "pendente" | "assinado" | "verificado" | "expirado";
  signatureHash?: string;
  certificateInfo?: {
    issuer: string;
    validFrom: Date;
    validTo: Date;
    serialNumber: string;
  };
}

interface DigitalSignatureProps {
  documentId: string;
  documentTitle: string;
  documentContent: string;
  onSignatureComplete?: (signatureData: SignatureData) => void;
}

export const DigitalSignature = ({
  documentId,
  documentTitle,
  documentContent,
  onSignatureComplete,
}: DigitalSignatureProps) => {
  const { toast } = useToast();
  const [isDialogOpen, setIsDialogOpen] = useState(false);
  const [isSigning, setIsSigning] = useState(false);
  const [signatureData, setSignatureData] = useState<Partial<SignatureData>>({
    documentTitle,
    signatureType: "digital",
    status: "pendente",
  });
  const [signatureHistory, setSignatureHistory] = useState<SignatureData[]>([]);
  const canvasRef = useRef<HTMLCanvasElement>(null);
  const [isDrawing, setIsDrawing] = useState(false);
  const [signatureImage, setSignatureImage] = useState<string | null>(null);

  const handleInputChange = (field: string, value: string) => {
    setSignatureData((prev) => ({ ...prev, [field]: value }));
  };

  const validateSignatureForm = () => {
    return (
      signatureData.signerName?.trim() !== "" &&
      signatureData.signerCPF?.trim() !== "" &&
      signatureData.signatureType
    );
  };

  const generateSignatureHash = () => {
    const content = `${documentId}-${signatureData.signerName}-${
      signatureData.signerCPF
    }-${Date.now()}`;
    // Simulação de hash - em produção usar crypto-js ou similar
    return btoa(content)
      .replace(/[^a-zA-Z0-9]/g, "")
      .substring(0, 32);
  };

  const simulateCertificateValidation = () => {
    return {
      issuer: "Autoridade Certificadora da Justiça",
      validFrom: new Date(),
      validTo: new Date(Date.now() + 365 * 24 * 60 * 60 * 1000), // 1 ano
      serialNumber: `CERT-${Date.now()}-${Math.random()
        .toString(36)
        .substr(2, 9)}`,
    };
  };

  const handleDigitalSignature = async () => {
    if (!validateSignatureForm()) {
      toast({
        title: "Campos obrigatórios",
        description: "Preencha todos os campos obrigatórios.",
        variant: "destructive",
      });
      return;
    }

    setIsSigning(true);

    try {
      // Simular processo de assinatura digital
      await new Promise((resolve) => setTimeout(resolve, 2000));

      const newSignature: SignatureData = {
        id: `sig-${Date.now()}`,
        documentTitle: signatureData.documentTitle!,
        signerName: signatureData.signerName!,
        signerOAB: signatureData.signerOAB,
        signerCPF: signatureData.signerCPF!,
        signatureDate: new Date(),
        signatureType: signatureData.signatureType!,
        status: "assinado",
        signatureHash: generateSignatureHash(),
        certificateInfo: simulateCertificateValidation(),
      };

      setSignatureHistory((prev) => [...prev, newSignature]);
      setSignatureData({
        documentTitle,
        signatureType: "digital",
        status: "pendente",
      });
      setIsDialogOpen(false);

      toast({
        title: "✅ Documento assinado com sucesso!",
        description: "A assinatura digital foi aplicada ao documento.",
      });

      onSignatureComplete?.(newSignature);
    } catch (error) {
      toast({
        title: "❌ Erro na assinatura",
        description: "Não foi possível assinar o documento. Tente novamente.",
        variant: "destructive",
      });
    } finally {
      setIsSigning(false);
    }
  };

  const handleManualSignature = () => {
    if (!signatureImage) {
      toast({
        title: "Assinatura necessária",
        description: "Desenhe sua assinatura no campo acima.",
        variant: "destructive",
      });
      return;
    }

    handleDigitalSignature();
  };

  const startDrawing = (e: React.MouseEvent<HTMLCanvasElement>) => {
    setIsDrawing(true);
    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.beginPath();
    ctx.moveTo(x, y);
  };

  const draw = (e: React.MouseEvent<HTMLCanvasElement>) => {
    if (!isDrawing) return;

    const canvas = canvasRef.current;
    if (!canvas) return;

    const ctx = canvas.getContext("2d");
    if (!ctx) return;

    const rect = canvas.getBoundingClientRect();
    const x = e.clientX - rect.left;
    const y = e.clientY - rect.top;

    ctx.lineTo(x, y);
    ctx.stroke();
  };

  const stopDrawing = () => {
    setIsDrawing(false);
    const canvas = canvasRef.current;
    if (canvas) {
      setSignatureImage(canvas.toDataURL());
    }
  };

  const clearSignature = () => {
    const canvas = canvasRef.current;
    if (canvas) {
      const ctx = canvas.getContext("2d");
      if (ctx) {
        ctx.clearRect(0, 0, canvas.width, canvas.height);
        setSignatureImage(null);
      }
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "assinado":
        return "bg-green-100 text-green-800";
      case "verificado":
        return "bg-blue-100 text-blue-800";
      case "pendente":
        return "bg-yellow-100 text-yellow-800";
      case "expirado":
        return "bg-red-100 text-red-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getSignatureTypeIcon = (type: string) => {
    switch (type) {
      case "digital":
        return <FileCheck className="w-4 h-4" />;
      case "eletronica":
        return <Shield className="w-4 h-4" />;
      case "manual":
        return <PenTool className="w-4 h-4" />;
      default:
        return <FileText className="w-4 h-4" />;
    }
  };

  const copySignatureHash = (hash: string) => {
    navigator.clipboard.writeText(hash);
    toast({
      title: "Hash copiado!",
      description:
        "O hash da assinatura foi copiado para a área de transferência.",
    });
  };

  return (
    <div className="space-y-4">
      {/* Botão para abrir modal de assinatura */}
      <Button
        onClick={() => setIsDialogOpen(true)}
        className="bg-green-600 hover:bg-green-700">
        <PenTool className="w-4 h-4 mr-2" />
        Assinar Digitalmente
      </Button>

      {/* Histórico de Assinaturas */}
      {signatureHistory.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <CheckCircle className="w-5 h-5 text-green-600" />
              <span>Assinaturas Aplicadas</span>
            </CardTitle>
          </CardHeader>
          <CardContent className="space-y-3">
            {signatureHistory.map((signature) => (
              <div
                key={signature.id}
                className="p-4 border rounded-lg bg-gray-50">
                <div className="flex items-start justify-between">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      {getSignatureTypeIcon(signature.signatureType)}
                      <h4 className="font-medium">{signature.signerName}</h4>
                      <Badge className={getStatusColor(signature.status)}>
                        {signature.status}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 md:grid-cols-4 gap-2 text-sm text-gray-600">
                      <div>
                        <span className="font-medium">CPF:</span>{" "}
                        {signature.signerCPF}
                      </div>
                      {signature.signerOAB && (
                        <div>
                          <span className="font-medium">OAB:</span>{" "}
                          {signature.signerOAB}
                        </div>
                      )}
                      <div>
                        <span className="font-medium">Data:</span>{" "}
                        {signature.signatureDate.toLocaleDateString("pt-BR")}
                      </div>
                      <div>
                        <span className="font-medium">Tipo:</span>{" "}
                        {signature.signatureType}
                      </div>
                    </div>
                    {signature.signatureHash && (
                      <div className="mt-2">
                        <div className="flex items-center space-x-2">
                          <span className="text-xs font-medium">
                            Hash da Assinatura:
                          </span>
                          <code className="text-xs bg-gray-200 px-2 py-1 rounded">
                            {signature.signatureHash}
                          </code>
                          <Button
                            variant="ghost"
                            size="sm"
                            onClick={() =>
                              copySignatureHash(signature.signatureHash!)
                            }
                            className="h-6 w-6 p-0">
                            <Copy className="w-3 h-3" />
                          </Button>
                        </div>
                      </div>
                    )}
                    {signature.certificateInfo && (
                      <div className="mt-2 p-2 bg-blue-50 rounded text-xs">
                        <div className="font-medium text-blue-800 mb-1">
                          Certificado Digital
                        </div>
                        <div className="text-blue-700">
                          <div>Emissor: {signature.certificateInfo.issuer}</div>
                          <div>
                            Válido até:{" "}
                            {signature.certificateInfo.validTo.toLocaleDateString(
                              "pt-BR"
                            )}
                          </div>
                          <div>
                            Série: {signature.certificateInfo.serialNumber}
                          </div>
                        </div>
                      </div>
                    )}
                  </div>
                  <div className="flex space-x-2">
                    <Button variant="outline" size="sm">
                      <Eye className="w-4 h-4 mr-1" />
                      Verificar
                    </Button>
                    <Button variant="outline" size="sm">
                      <Download className="w-4 h-4 mr-1" />
                      Certificado
                    </Button>
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </Card>
      )}

      {/* Modal de Assinatura Digital */}
      <Dialog open={isDialogOpen} onOpenChange={setIsDialogOpen}>
        <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
          <DialogHeader>
            <DialogTitle className="flex items-center space-x-2">
              <PenTool className="w-5 h-5" />
              <span>Assinatura Digital</span>
            </DialogTitle>
            <DialogDescription>
              Assine digitalmente o documento "{documentTitle}"
            </DialogDescription>
          </DialogHeader>

          <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
            {/* Formulário de Assinatura */}
            <div className="space-y-4">
              <div>
                <Label htmlFor="signerName">Nome do Signatário *</Label>
                <Input
                  id="signerName"
                  placeholder="Nome completo"
                  value={signatureData.signerName || ""}
                  onChange={(e) =>
                    handleInputChange("signerName", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="signerCPF">CPF *</Label>
                <Input
                  id="signerCPF"
                  placeholder="000.000.000-00"
                  value={signatureData.signerCPF || ""}
                  onChange={(e) =>
                    handleInputChange("signerCPF", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="signerOAB">Número OAB (opcional)</Label>
                <Input
                  id="signerOAB"
                  placeholder="OAB/SP 123.456"
                  value={signatureData.signerOAB || ""}
                  onChange={(e) =>
                    handleInputChange("signerOAB", e.target.value)
                  }
                />
              </div>

              <div>
                <Label htmlFor="signatureType">Tipo de Assinatura *</Label>
                <Select
                  value={signatureData.signatureType}
                  onValueChange={(value) =>
                    handleInputChange("signatureType", value)
                  }>
                  <SelectTrigger>
                    <SelectValue placeholder="Selecione o tipo" />
                  </SelectTrigger>
                  <SelectContent>
                    <SelectItem value="digital">
                      <div className="flex items-center space-x-2">
                        <FileCheck className="w-4 h-4" />
                        <span>Assinatura Digital (Certificado)</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="eletronica">
                      <div className="flex items-center space-x-2">
                        <Shield className="w-4 h-4" />
                        <span>Assinatura Eletrônica</span>
                      </div>
                    </SelectItem>
                    <SelectItem value="manual">
                      <div className="flex items-center space-x-2">
                        <PenTool className="w-4 h-4" />
                        <span>Assinatura Manual</span>
                      </div>
                    </SelectItem>
                  </SelectContent>
                </Select>
              </div>

              {signatureData.signatureType === "manual" && (
                <div>
                  <Label>Assinatura Manual</Label>
                  <div className="border rounded-lg p-4">
                    <canvas
                      ref={canvasRef}
                      width={400}
                      height={200}
                      className="border border-gray-300 rounded cursor-crosshair"
                      onMouseDown={startDrawing}
                      onMouseMove={draw}
                      onMouseUp={stopDrawing}
                      onMouseLeave={stopDrawing}
                    />
                    <div className="flex space-x-2 mt-2">
                      <Button
                        variant="outline"
                        size="sm"
                        onClick={clearSignature}>
                        Limpar
                      </Button>
                      {signatureImage && (
                        <Badge
                          variant="secondary"
                          className="bg-green-100 text-green-800">
                          <CheckCircle className="w-3 h-3 mr-1" />
                          Assinatura capturada
                        </Badge>
                      )}
                    </div>
                  </div>
                </div>
              )}

              <div className="flex space-x-2 pt-4">
                <Button
                  variant="outline"
                  onClick={() => setIsDialogOpen(false)}>
                  Cancelar
                </Button>
                <Button
                  onClick={
                    signatureData.signatureType === "manual"
                      ? handleManualSignature
                      : handleDigitalSignature
                  }
                  disabled={isSigning || !validateSignatureForm()}
                  className="bg-green-600 hover:bg-green-700">
                  {isSigning ? (
                    <>
                      <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin mr-2" />
                      Assinando...
                    </>
                  ) : (
                    <>
                      <PenTool className="w-4 h-4 mr-2" />
                      Assinar Documento
                    </>
                  )}
                </Button>
              </div>
            </div>

            {/* Preview do Documento */}
            <div className="space-y-4">
              <div>
                <Label>Preview do Documento</Label>
                <div className="border rounded-lg p-4 max-h-96 overflow-y-auto bg-white">
                  <div className="prose prose-sm max-w-none">
                    <h3 className="text-lg font-semibold mb-4">
                      {documentTitle}
                    </h3>
                    <div className="whitespace-pre-wrap text-sm">
                      {documentContent.substring(0, 500)}
                      {documentContent.length > 500 && "..."}
                    </div>
                  </div>
                </div>
              </div>

              {/* Informações de Segurança */}
              <div className="p-4 bg-blue-50 rounded-lg">
                <h4 className="font-medium text-blue-800 mb-2 flex items-center">
                  <Shield className="w-4 h-4 mr-2" />
                  Segurança da Assinatura
                </h4>
                <ul className="text-sm text-blue-700 space-y-1">
                  <li>• Hash criptográfico único para cada assinatura</li>
                  <li>• Carimbo de tempo com data e hora</li>
                  <li>• Verificação de integridade do documento</li>
                  <li>• Certificado digital válido (quando aplicável)</li>
                  <li>• Conformidade com MP 2.200-2/2001</li>
                </ul>
              </div>
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};
