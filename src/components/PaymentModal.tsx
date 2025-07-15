"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
} from "@/components/ui/dialog";
import {
  CreditCard,
  CheckCircle,
  Star,
  Zap,
  Shield,
  Users,
  Crown,
  ArrowRight,
  Loader2,
} from "lucide-react";
import { paymentService, PaymentPlan } from "@/lib/payment-service";

interface PaymentModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (subscription: any) => void;
}

export const PaymentModal = ({
  isOpen,
  onClose,
  onSuccess,
}: PaymentModalProps) => {
  const [selectedPlan, setSelectedPlan] = useState<string>("pro");
  const [paymentMethod, setPaymentMethod] = useState<string>("credit_card");
  const [isProcessing, setIsProcessing] = useState(false);
  const [cardData, setCardData] = useState({
    number: "",
    expiry: "",
    cvv: "",
    name: "",
  });

  const plans = paymentService.getPlans();
  const paymentMethods = paymentService.getPaymentMethods();

  const handlePayment = async () => {
    setIsProcessing(true);

    try {
      const result = await paymentService.processPayment(
        selectedPlan,
        paymentMethod,
        paymentMethod === "credit_card" ? cardData : undefined
      );

      if (result.success && result.subscription) {
        onSuccess(result.subscription);
        onClose();
      } else {
        alert(result.error || "Erro ao processar pagamento");
      }
    } catch (error) {
      alert("Erro ao processar pagamento");
    } finally {
      setIsProcessing(false);
    }
  };

  const selectedPlanData = plans.find((p) => p.id === selectedPlan);

  const getPlanIcon = (priority: string) => {
    switch (priority) {
      case "free":
        return <Star className="w-5 h-5" />;
      case "basic":
        return <Zap className="w-5 h-5" />;
      case "pro":
        return <Crown className="w-5 h-5" />;
      case "enterprise":
        return <Users className="w-5 h-5" />;
      default:
        return <Star className="w-5 h-5" />;
    }
  };

  const getPlanColor = (priority: string) => {
    switch (priority) {
      case "free":
        return "bg-gray-100 text-gray-700";
      case "basic":
        return "bg-blue-100 text-blue-700";
      case "pro":
        return "bg-purple-100 text-purple-700";
      case "enterprise":
        return "bg-green-100 text-green-700";
      default:
        return "bg-gray-100 text-gray-700";
    }
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] overflow-y-auto bg-white border border-gray-200 rounded-lg shadow-lg">
        <DialogHeader>
          <DialogTitle className="text-2xl font-bold text-center">
            Escolha seu Plano AIudex
          </DialogTitle>
          <DialogDescription className="text-center">
            Desbloqueie todo o potencial da IA jurídica para seu escritório
          </DialogDescription>
        </DialogHeader>

        <div className="grid md:grid-cols-2 gap-6">
          {/* Seleção de Planos */}
          <div className="space-y-4">
            <h3 className="font-semibold text-lg">Planos Disponíveis</h3>
            {plans.map((plan) => (
              <Card
                key={plan.id}
                className={`cursor-pointer transition-all ${
                  selectedPlan === plan.id
                    ? "ring-2 ring-blue-500 bg-blue-50"
                    : "hover:shadow-md"
                }`}
                onClick={() => setSelectedPlan(plan.id)}>
                <CardHeader className="pb-3">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <div
                        className={`p-2 rounded-lg ${getPlanColor(
                          plan.priority
                        )}`}>
                        {getPlanIcon(plan.priority)}
                      </div>
                      <div>
                        <CardTitle className="text-lg">{plan.name}</CardTitle>
                        <div className="flex items-center space-x-2">
                          <span className="text-2xl font-bold">
                            R$ {plan.price.toFixed(2).replace(".", ",")}
                          </span>
                          <span className="text-sm text-gray-500">/mês</span>
                        </div>
                      </div>
                    </div>
                    {selectedPlan === plan.id && (
                      <CheckCircle className="w-6 h-6 text-blue-500" />
                    )}
                  </div>
                </CardHeader>
                <CardContent>
                  <ul className="space-y-2">
                    {plan.features.map((feature, index) => (
                      <li
                        key={index}
                        className="flex items-center space-x-2 text-sm">
                        <CheckCircle className="w-4 h-4 text-green-500 flex-shrink-0" />
                        <span>{feature}</span>
                      </li>
                    ))}
                  </ul>
                </CardContent>
              </Card>
            ))}
          </div>

          {/* Formulário de Pagamento */}
          <div className="space-y-6">
            <div>
              <h3 className="font-semibold text-lg mb-4">
                Método de Pagamento
              </h3>
              <div className="grid grid-cols-3 gap-3">
                {paymentMethods.map((method) => (
                  <Button
                    key={method.id}
                    variant={
                      paymentMethod === method.id ? "default" : "outline"
                    }
                    className="flex flex-col items-center space-y-2 h-auto p-4"
                    onClick={() => setPaymentMethod(method.id)}>
                    <span className="text-2xl">{method.icon}</span>
                    <span className="text-xs">{method.name}</span>
                  </Button>
                ))}
              </div>
            </div>

            {paymentMethod === "credit_card" && (
              <div className="space-y-4">
                <div>
                  <Label htmlFor="cardName">Nome no Cartão</Label>
                  <Input
                    id="cardName"
                    value={cardData.name}
                    onChange={(e) =>
                      setCardData((prev) => ({ ...prev, name: e.target.value }))
                    }
                    placeholder="Nome como está no cartão"
                  />
                </div>
                <div>
                  <Label htmlFor="cardNumber">Número do Cartão</Label>
                  <Input
                    id="cardNumber"
                    value={cardData.number}
                    onChange={(e) =>
                      setCardData((prev) => ({
                        ...prev,
                        number: e.target.value,
                      }))
                    }
                    placeholder="0000 0000 0000 0000"
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <div>
                    <Label htmlFor="cardExpiry">Validade</Label>
                    <Input
                      id="cardExpiry"
                      value={cardData.expiry}
                      onChange={(e) =>
                        setCardData((prev) => ({
                          ...prev,
                          expiry: e.target.value,
                        }))
                      }
                      placeholder="MM/AA"
                    />
                  </div>
                  <div>
                    <Label htmlFor="cardCvv">CVV</Label>
                    <Input
                      id="cardCvv"
                      value={cardData.cvv}
                      onChange={(e) =>
                        setCardData((prev) => ({
                          ...prev,
                          cvv: e.target.value,
                        }))
                      }
                      placeholder="123"
                    />
                  </div>
                </div>
              </div>
            )}

            {paymentMethod === "pix" && (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">📱</div>
                <p className="text-sm text-gray-600">
                  O código PIX será gerado após a confirmação do plano
                </p>
              </div>
            )}

            {paymentMethod === "bank_transfer" && (
              <div className="text-center p-6 bg-gray-50 rounded-lg">
                <div className="text-4xl mb-4">🏦</div>
                <p className="text-sm text-gray-600">
                  Os dados bancários serão fornecidos após a confirmação do
                  plano
                </p>
              </div>
            )}

            {/* Resumo do Pedido */}
            {selectedPlanData && (
              <Card className="bg-gray-50">
                <CardHeader>
                  <CardTitle className="text-lg">Resumo do Pedido</CardTitle>
                </CardHeader>
                <CardContent className="space-y-3">
                  <div className="flex justify-between">
                    <span>Plano {selectedPlanData.name}</span>
                    <span className="font-semibold">
                      R$ {selectedPlanData.price.toFixed(2).replace(".", ",")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span>Taxa de processamento</span>
                    <span>R$ 0,00</span>
                  </div>
                  <div className="border-t pt-3">
                    <div className="flex justify-between font-bold text-lg">
                      <span>Total</span>
                      <span>
                        R$ {selectedPlanData.price.toFixed(2).replace(".", ",")}
                      </span>
                    </div>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Termos e Condições */}
            <div className="space-y-4">
              <div className="flex items-start space-x-2">
                <Checkbox id="terms" />
                <Label htmlFor="terms" className="text-sm">
                  Concordo com os{" "}
                  <a href="#" className="text-blue-600 underline">
                    Termos de Serviço
                  </a>{" "}
                  e{" "}
                  <a href="#" className="text-blue-600 underline">
                    Política de Privacidade
                  </a>
                </Label>
              </div>
              <div className="flex items-start space-x-2">
                <Checkbox id="autoRenew" defaultChecked />
                <Label htmlFor="autoRenew" className="text-sm">
                  Renovação automática mensal. Pode ser cancelada a qualquer
                  momento.
                </Label>
              </div>
            </div>

            {/* Botão de Pagamento */}
            <Button
              onClick={handlePayment}
              disabled={isProcessing}
              className="w-full h-12 text-lg">
              {isProcessing ? (
                <>
                  <Loader2 className="w-5 h-5 mr-2 animate-spin" />
                  Processando...
                </>
              ) : (
                <>
                  Finalizar Assinatura
                  <ArrowRight className="w-5 h-5 ml-2" />
                </>
              )}
            </Button>

            <p className="text-xs text-center text-gray-500">
              Pagamento seguro processado por nossos parceiros certificados
            </p>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
};
