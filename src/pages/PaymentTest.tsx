import React, { useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Card, CardHeader, CardContent } from "@/components/ui/card";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { toast } from "@/components/ui/use-toast";
import {
  QrCode,
  CreditCard,
  FileText,
  CheckCircle,
  AlertCircle,
  Zap,
} from "lucide-react";

const PaymentTest: React.FC = () => {
  const [email, setEmail] = useState("");
  const [amount, setAmount] = useState("100");
  const [paymentMethod, setPaymentMethod] = useState("pix");
  const [stripePriceId, setStripePriceId] = useState("prod_SdfaT6pqlYZA3x");
  const [loading, setLoading] = useState(false);
  const [status, setStatus] = useState<string | null>(null);
  const [paymentResult, setPaymentResult] = useState<any>(null);

  const handlePayment = async (e: React.FormEvent) => {
    e.preventDefault();
    setLoading(true);
    setStatus(null);
    setPaymentResult(null);

    try {
      const requestBody: any = {
        email,
        amount: Number(amount),
        paymentMethod,
      };

      // Adicionar stripePriceId se for pagamento Stripe
      if (paymentMethod === "stripe") {
        requestBody.stripePriceId = stripePriceId;
      }

      const res = await fetch("/api/payments/test", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify(requestBody),
      });

      const data = await res.json();

      if (res.ok) {
        setStatus("Pagamento criado com sucesso!");
        setPaymentResult(data);

        toast({
          title: "Pagamento criado",
          description: `Pagamento de R$ ${amount} criado com sucesso via ${paymentMethod.toUpperCase()}`,
        });
      } else {
        setStatus("Erro: " + (data.message || "Falha ao criar pagamento"));
        toast({
          title: "Erro",
          description: data.message || "Falha ao criar pagamento",
          variant: "destructive",
        });
      }
    } catch (err) {
      setStatus("Erro inesperado");
      toast({
        title: "Erro",
        description: "Erro inesperado ao tentar pagar",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case "pix":
        return <QrCode className="h-4 w-4" />;
      case "credit_card":
        return <CreditCard className="h-4 w-4" />;
      case "boleto":
        return <FileText className="h-4 w-4" />;
      case "stripe":
        return <Zap className="h-4 w-4" />;
      default:
        return <QrCode className="h-4 w-4" />;
    }
  };

  const getMethodName = (method: string) => {
    switch (method) {
      case "pix":
        return "PIX";
      case "credit_card":
        return "Cartão de Crédito";
      case "boleto":
        return "Boleto";
      case "stripe":
        return "Stripe";
      default:
        return "PIX";
    }
  };

  return (
    <div className="flex justify-center items-center min-h-screen bg-gradient-to-br from-green-50 to-blue-50 dark:from-gray-900 dark:to-gray-800 p-4">
      <Card className="w-full max-w-md shadow-xl">
        <CardHeader>
          <h2 className="text-2xl font-bold text-center">
            Teste de Pagamento - Asaas & Stripe
          </h2>
          <p className="text-sm text-center text-gray-600 dark:text-gray-400">
            Teste seu gateway de pagamento Asaas ou Stripe
          </p>
        </CardHeader>
        <CardContent>
          <form onSubmit={handlePayment} className="space-y-4">
            <div>
              <label className="block text-sm font-medium mb-1">Email</label>
              <Input
                type="email"
                required
                value={email}
                onChange={(e) => setEmail(e.target.value)}
                placeholder="seu@email.com"
              />
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Valor (R$)
              </label>
              <Input
                type="number"
                min="1"
                step="0.01"
                required
                value={amount}
                onChange={(e) => setAmount(e.target.value)}
                placeholder="100.00"
                disabled={paymentMethod === "stripe"}
              />
              {paymentMethod === "stripe" && (
                <p className="text-xs text-gray-500 mt-1">
                  O valor será obtido automaticamente do produto Stripe
                </p>
              )}
            </div>

            <div>
              <label className="block text-sm font-medium mb-1">
                Método de Pagamento
              </label>
              <Select value={paymentMethod} onValueChange={setPaymentMethod}>
                <SelectTrigger>
                  <SelectValue />
                </SelectTrigger>
                <SelectContent>
                  <SelectItem value="pix">
                    <div className="flex items-center gap-2">
                      <QrCode className="h-4 w-4" />
                      PIX
                    </div>
                  </SelectItem>
                  <SelectItem value="boleto">
                    <div className="flex items-center gap-2">
                      <FileText className="h-4 w-4" />
                      Boleto
                    </div>
                  </SelectItem>
                  <SelectItem value="stripe">
                    <div className="flex items-center gap-2">
                      <Zap className="h-4 w-4" />
                      Stripe
                    </div>
                  </SelectItem>
                  <SelectItem value="credit_card">
                    <div className="flex items-center gap-2">
                      <CreditCard className="h-4 w-4" />
                      Cartão de Crédito
                    </div>
                  </SelectItem>
                </SelectContent>
              </Select>
            </div>

            {paymentMethod === "stripe" && (
              <div>
                <label className="block text-sm font-medium mb-1">
                  Stripe Price ID
                </label>
                <Input
                  type="text"
                  required
                  value={stripePriceId}
                  onChange={(e) => setStripePriceId(e.target.value)}
                  placeholder="price_1234567890abcdef"
                />
                <p className="text-xs text-gray-500 mt-1">
                  ID do produto/preço no Stripe (ex: price_xxx ou prod_xxx)
                </p>
              </div>
            )}

            <Button type="submit" className="w-full" disabled={loading}>
              {loading
                ? "Criando pagamento..."
                : `Criar Pagamento ${getMethodName(paymentMethod)}`}
            </Button>
          </form>

          {status && (
            <div className="mt-6 p-4 rounded-lg border">
              <div className="flex items-center gap-2 mb-2">
                {status.includes("sucesso") ? (
                  <CheckCircle className="h-5 w-5 text-green-600" />
                ) : (
                  <AlertCircle className="h-5 w-5 text-red-600" />
                )}
                <span className="font-medium">Status</span>
              </div>
              <p className="text-sm">{status}</p>
            </div>
          )}

          {paymentResult && (
            <div className="mt-4 p-4 rounded-lg border bg-gray-50 dark:bg-gray-800">
              <h4 className="font-medium mb-2">Detalhes do Pagamento</h4>
              <div className="space-y-2 text-sm">
                <div>
                  <span className="font-medium">ID:</span>{" "}
                  {paymentResult.payment?.id}
                </div>
                <div>
                  <span className="font-medium">Valor:</span> R${" "}
                  {paymentResult.amount || paymentResult.payment?.amount}
                </div>
                <div>
                  <span className="font-medium">Status:</span>{" "}
                  {paymentResult.status}
                </div>

                {paymentResult.productName && (
                  <div>
                    <span className="font-medium">Produto:</span>{" "}
                    {paymentResult.productName}
                  </div>
                )}

                {paymentResult.clientSecret && (
                  <div>
                    <span className="font-medium">Client Secret:</span>{" "}
                    <span className="text-xs break-all">
                      {paymentResult.clientSecret.substring(0, 20)}...
                    </span>
                  </div>
                )}

                {paymentResult.pixQrCode && (
                  <div className="mt-3">
                    <p className="font-medium mb-2">QR Code PIX:</p>
                    <div className="bg-white p-2 rounded border">
                      <img
                        src={paymentResult.pixQrCode}
                        alt="QR Code PIX"
                        className="w-full max-w-48 mx-auto"
                      />
                    </div>
                    <p className="text-xs text-gray-600 mt-2 break-all">
                      {paymentResult.pixQrCodeText}
                    </p>
                  </div>
                )}

                {paymentResult.boletoUrl && (
                  <div className="mt-3">
                    <p className="font-medium mb-2">Boleto:</p>
                    <a
                      href={paymentResult.boletoUrl}
                      target="_blank"
                      rel="noopener noreferrer"
                      className="text-blue-600 hover:underline text-sm">
                      Abrir boleto
                    </a>
                    {paymentResult.boletoCode && (
                      <p className="text-xs text-gray-600 mt-1">
                        Código: {paymentResult.boletoCode}
                      </p>
                    )}
                  </div>
                )}
              </div>
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
};

export default PaymentTest;
