import React, { useState, useEffect } from "react";
import { loadStripe } from "@stripe/stripe-js";
import {
  Elements,
  CardElement,
  useStripe,
  useElements,
} from "@stripe/react-stripe-js";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { Separator } from "@/components/ui/separator";
import { Badge } from "@/components/ui/badge";
import { Alert, AlertDescription } from "@/components/ui/alert";
import {
  Shield,
  Clock,
  CheckCircle,
  Star,
  Lock,
  MessageCircle,
  Timer,
  CreditCard,
  Zap,
  Users,
  Award,
  ArrowRight,
  Mail,
  Phone,
  Calendar,
  Sparkles,
  Brain,
  FileText,
  Search,
  Headphones,
  Database,
  AlertTriangle,
} from "lucide-react";

const stripePromise = loadStripe(
  process.env.NEXT_PUBLIC_STRIPE_PUBLISHABLE_KEY!
);

// Componente de verificação de pagamento já realizado
const PaymentAlreadyCompleted = () => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-amber-50 to-orange-50 py-8 px-4">
      <div className="max-w-2xl mx-auto">
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-amber-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <AlertTriangle className="w-12 h-12 text-amber-600" />
          </div>
          <h1 className="text-3xl font-bold text-gray-900 mb-4">
            Pagamento Já Realizado
          </h1>
          <p className="text-lg text-gray-600 mb-6">
            Detectamos que você já completou um pagamento recentemente. Para sua
            segurança, não é possível realizar múltiplos pagamentos.
          </p>
        </div>

        <Card className="border-2 border-amber-200 bg-gradient-to-br from-amber-50 to-orange-50">
          <CardContent className="p-8">
            <div className="space-y-4">
              <div className="flex items-center gap-3">
                <CheckCircle className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-gray-900">
                  Sua assinatura está ativa
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Clock className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-gray-900">
                  Acesso imediato às funcionalidades
                </span>
              </div>
              <div className="flex items-center gap-3">
                <Shield className="w-5 h-5 text-purple-600" />
                <span className="text-sm font-medium text-gray-900">
                  Proteção contra cobranças duplicadas
                </span>
              </div>
            </div>

            <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => (window.location.href = "/login")}
                className="bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-12 px-8 text-base font-medium">
                Acessar Dashboard
                <ArrowRight className="w-4 h-4 ml-2" />
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/tools")}
                className="h-12 px-8 text-base font-medium border-amber-200 hover:bg-amber-50">
                Explorar Ferramentas
              </Button>
            </div>
          </CardContent>
        </Card>

        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Precisa de ajuda? Entre em contato:{" "}
            <a
              href="mailto:suporte@aiudex.com"
              className="text-blue-600 hover:underline font-medium">
              suporte@aiudex.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const SuccessScreen = ({
  paymentMethod,
  formData,
}: {
  paymentMethod: any;
  formData: any;
}) => {
  return (
    <div className="min-h-screen bg-gradient-to-br from-green-50 via-emerald-50 to-teal-50 py-8 px-4">
      <div className="max-w-4xl mx-auto">
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-3 mb-4">
            <div className="w-16 h-16 bg-gradient-to-br from-green-600 via-emerald-600 to-teal-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Sparkles className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-green-600 to-teal-600 bg-clip-text text-transparent">
                Aiudex
              </h1>
              <p className="text-sm text-gray-600">
                Inteligência Artificial para Advocacia
              </p>
            </div>
          </div>
        </div>

        {/* Card de Sucesso */}
        <Card className="border-2 border-green-200 bg-gradient-to-br from-green-50 to-emerald-50 mb-8 shadow-xl">
          <CardContent className="p-8 text-center">
            <div className="w-24 h-24 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center mx-auto mb-6 shadow-lg">
              <CheckCircle className="w-16 h-16 text-green-600" />
            </div>

            <h2 className="text-4xl font-bold text-gray-900 mb-3">
              🎉 Parabéns! Cadastro realizado com sucesso!
            </h2>

            <p className="text-xl text-gray-600 mb-8 max-w-2xl mx-auto">
              Sua assinatura do{" "}
              <strong className="text-green-700">Plano Profissional</strong> foi
              ativada e você já pode começar a usar todas as funcionalidades da
              IA jurídica.
            </p>

            <div className="bg-white border border-green-200 rounded-xl p-8 mb-8 shadow-lg">
              <div className="grid md:grid-cols-2 gap-8">
                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                    <Users className="w-5 h-5 text-blue-600" />
                    Dados do Cliente
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <Users className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{formData.name}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <Mail className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{formData.email}</span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <Phone className="w-4 h-4 text-blue-500" />
                      <span className="font-medium">{formData.phone}</span>
                    </div>
                  </div>
                </div>

                <div className="space-y-4">
                  <h3 className="font-bold text-gray-900 mb-4 text-lg flex items-center gap-2">
                    <CreditCard className="w-5 h-5 text-green-600" />
                    Detalhes do Pagamento
                  </h3>
                  <div className="space-y-3">
                    <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <CreditCard className="w-4 h-4 text-green-500" />
                      <span className="font-medium">
                        Cartão •••• {paymentMethod.card.last4}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <Calendar className="w-4 h-4 text-green-500" />
                      <span className="font-medium">
                        Próxima cobrança:{" "}
                        {new Date(
                          Date.now() + 30 * 24 * 60 * 60 * 1000
                        ).toLocaleDateString("pt-BR")}
                      </span>
                    </div>
                    <div className="flex items-center gap-3 text-sm text-gray-700 bg-gray-50 p-3 rounded-lg">
                      <Award className="w-4 h-4 text-green-500" />
                      <span className="font-medium">
                        Plano Profissional - R$ 69,90/mês
                      </span>
                    </div>
                  </div>
                </div>
              </div>
            </div>

            <div className="grid md:grid-cols-3 gap-6 mb-8">
              <div className="bg-white border border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Zap className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">
                  Ativação Imediata
                </h4>
                <p className="text-sm text-gray-600">
                  Seu plano já está ativo e pronto para uso
                </p>
              </div>

              <div className="bg-white border border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Shield className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">
                  Pagamento Seguro
                </h4>
                <p className="text-sm text-gray-600">
                  Transação processada com segurança pelo Stripe
                </p>
              </div>

              <div className="bg-white border border-green-200 rounded-xl p-6 shadow-lg hover:shadow-xl transition-shadow">
                <Headphones className="w-10 h-10 text-green-600 mx-auto mb-3" />
                <h4 className="font-bold text-gray-900 mb-2">Suporte 24/7</h4>
                <p className="text-sm text-gray-600">
                  Equipe pronta para ajudar quando precisar
                </p>
              </div>
            </div>

            <div className="flex flex-col sm:flex-row gap-4 justify-center">
              <Button
                onClick={() => (window.location.href = "/login")}
                className="bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-14 px-10 text-lg font-bold shadow-lg hover:shadow-xl transition-all">
                Acessar Dashboard
                <ArrowRight className="w-5 h-5 ml-2" />
              </Button>

              <Button
                variant="outline"
                onClick={() => (window.location.href = "/tools")}
                className="h-14 px-10 text-lg font-bold border-green-200 hover:bg-green-50 shadow-lg hover:shadow-xl transition-all">
                Explorar Ferramentas
              </Button>
            </div>
          </CardContent>
        </Card>

        {/* Próximos Passos */}
        <Card className="border-green-200 shadow-lg">
          <CardHeader>
            <CardTitle className="flex items-center gap-2 text-green-800 text-xl">
              <Clock className="w-6 h-6" />
              Próximos Passos
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-6">
              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                  <span className="text-sm font-bold text-white">1</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Confirme seu e-mail
                  </h4>
                  <p className="text-gray-600">
                    Enviamos um e-mail de confirmação para {formData.email}
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                  <span className="text-sm font-bold text-white">2</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Configure seu perfil
                  </h4>
                  <p className="text-gray-600">
                    Personalize suas preferências no dashboard
                  </p>
                </div>
              </div>

              <div className="flex items-start gap-4">
                <div className="w-8 h-8 bg-gradient-to-br from-green-500 to-emerald-500 rounded-full flex items-center justify-center flex-shrink-0 mt-0.5 shadow-lg">
                  <span className="text-sm font-bold text-white">3</span>
                </div>
                <div>
                  <h4 className="font-bold text-gray-900 mb-1">
                    Comece a usar a IA
                  </h4>
                  <p className="text-gray-600">
                    Experimente nossas ferramentas de análise de documentos e
                    geração de petições
                  </p>
                </div>
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Contato */}
        <div className="text-center mt-8">
          <p className="text-sm text-gray-600">
            Precisa de ajuda? Entre em contato:{" "}
            <a
              href="mailto:suporte@aiudex.com"
              className="text-green-600 hover:underline font-medium">
              suporte@aiudex.com
            </a>
          </p>
        </div>
      </div>
    </div>
  );
};

const CheckoutForm = () => {
  const stripe = useStripe();
  const elements = useElements();
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [step, setStep] = useState(1);
  const [timeLeft, setTimeLeft] = useState(3600); // 1 hora em segundos
  const [success, setSuccess] = useState(false);
  const [paymentMethod, setPaymentMethod] = useState<any>(null);
  const [formData, setFormData] = useState({
    name: "",
    email: "",
    phone: "",
    cpf: "",
    cep: "",
  });
  const [formErrors, setFormErrors] = useState<{
    cpf?: string;
    cep?: string;
    email?: string;
  }>({});

  // Funções de máscara e validação
  const formatCPF = (value: string) =>
    value
      .replace(/\D/g, "")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d)/, "$1.$2")
      .replace(/(\d{3})(\d{1,2})$/, "$1-$2");
  const formatCEP = (value: string) =>
    value.replace(/\D/g, "").replace(/(\d{5})(\d{1,3})$/, "$1-$2");
  const validateCPF = (cpf: string) => {
    cpf = cpf.replace(/\D/g, "");
    if (cpf.length !== 11 || /^([0-9])\1+$/.test(cpf)) return false;
    let sum = 0,
      rest;
    for (let i = 1; i <= 9; i++)
      sum += parseInt(cpf.substring(i - 1, i)) * (11 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(9, 10))) return false;
    sum = 0;
    for (let i = 1; i <= 10; i++)
      sum += parseInt(cpf.substring(i - 1, i)) * (12 - i);
    rest = (sum * 10) % 11;
    if (rest === 10 || rest === 11) rest = 0;
    if (rest !== parseInt(cpf.substring(10, 11))) return false;
    return true;
  };
  const validateCEP = (cep: string) => /^\d{5}-\d{3}$/.test(cep);

  // Função para verificar se email/CPF já existe
  const checkExistingUser = async (email: string, cpf: string) => {
    try {
      const response = await fetch("/api/users/check-existing", {
        method: "POST",
        headers: { "Content-Type": "application/json" },
        body: JSON.stringify({ email, cpf }),
      });
      const data = await response.json();
      return data;
    } catch (error) {
      console.error("Erro ao verificar usuário existente:", error);
      return { exists: false, error: true };
    }
  };

  // Verificar se já houve pagamento recente
  useEffect(() => {
    const paymentCompleted = localStorage.getItem("aiudex_payment_completed");
    const paymentTime = localStorage.getItem("aiudex_payment_time");

    if (paymentCompleted && paymentTime) {
      const timeDiff = Date.now() - parseInt(paymentTime);
      // Se o pagamento foi feito há menos de 24 horas, bloquear acesso
      if (timeDiff < 24 * 60 * 60 * 1000) {
        setSuccess(true);
        setPaymentMethod({ card: { last4: "****" } });
        setFormData({
          name: localStorage.getItem("aiudex_user_name") || "",
          email: localStorage.getItem("aiudex_user_email") || "",
          phone: localStorage.getItem("aiudex_user_phone") || "",
          cpf: localStorage.getItem("aiudex_user_cpf") || "",
          cep: localStorage.getItem("aiudex_user_cep") || "",
        });
      } else {
        // Limpar dados antigos após 24 horas
        localStorage.removeItem("aiudex_payment_completed");
        localStorage.removeItem("aiudex_payment_time");
        localStorage.removeItem("aiudex_user_name");
        localStorage.removeItem("aiudex_user_email");
        localStorage.removeItem("aiudex_user_phone");
      }
    }
  }, []);

  // Timer de urgência
  useEffect(() => {
    const timer = setInterval(() => {
      setTimeLeft((prev) => (prev > 0 ? prev - 1 : 0));
    }, 1000);
    return () => clearInterval(timer);
  }, []);

  const formatTime = (seconds: number) => {
    const hours = Math.floor(seconds / 3600);
    const minutes = Math.floor((seconds % 3600) / 60);
    const secs = seconds % 60;
    return `${hours.toString().padStart(2, "0")}:${minutes
      .toString()
      .padStart(2, "0")}:${secs.toString().padStart(2, "0")}`;
  };

  const handleSubmit = async (event: React.FormEvent) => {
    event.preventDefault();

    if (!stripe || !elements) return;

    setLoading(true);
    setError(null);

    const cardElement = elements.getElement(CardElement);
    if (!cardElement) return;

    if (!validateCPF(formData.cpf)) {
      setFormErrors({ cpf: "CPF inválido" });
      setLoading(false);
      return;
    }
    if (!validateCEP(formData.cep)) {
      setFormErrors({ cep: "CEP inválido" });
      setLoading(false);
      return;
    }
    setFormErrors({});

    // Verificar se usuário já existe
    const userCheck = await checkExistingUser(formData.email, formData.cpf);
    if (userCheck.exists) {
      if (userCheck.emailExists) {
        setFormErrors({
          ...formErrors,
          email: "Este email já está cadastrado",
        });
      }
      if (userCheck.cpfExists) {
        setFormErrors({ ...formErrors, cpf: "Este CPF já está cadastrado" });
      }
      setLoading(false);
      return;
    }

    try {
      const { error, paymentMethod } = await stripe.createPaymentMethod({
        type: "card",
        card: cardElement,
        billing_details: {
          name: formData.name,
          email: formData.email,
          phone: formData.phone,
        },
      });

      if (error) {
        const errorMessage =
          error instanceof Error ? error.message : "Erro no pagamento";
        setError(errorMessage);
        setLoading(false);
        return;
      }

      console.log("Payment method created:", paymentMethod);

      // Simular processamento adicional (pode ser substituído por chamada real à API)
      await new Promise((resolve) => setTimeout(resolve, 1500));

      // Salvar dados do pagamento no localStorage para segurança
      localStorage.setItem("aiudex_payment_completed", "true");
      localStorage.setItem("aiudex_payment_time", Date.now().toString());
      localStorage.setItem("aiudex_user_name", formData.name);
      localStorage.setItem("aiudex_user_email", formData.email);
      localStorage.setItem("aiudex_user_phone", formData.phone);
      localStorage.setItem("aiudex_user_cpf", formData.cpf);
      localStorage.setItem("aiudex_user_cep", formData.cep);

      setPaymentMethod(paymentMethod);
      setSuccess(true);
    } catch (err) {
      setError("Erro inesperado. Tente novamente.");
      console.error("Payment error:", err);
    } finally {
      setLoading(false);
    }
  };

  const nextStep = () => {
    if (step < 3) setStep(step + 1);
  };

  const prevStep = () => {
    if (step > 1) setStep(step - 1);
  };

  // Mostrar tela de sucesso ou verificação de pagamento
  if (success) {
    const paymentCompleted = localStorage.getItem("aiudex_payment_completed");
    const paymentTime = localStorage.getItem("aiudex_payment_time");

    if (paymentCompleted && paymentTime) {
      const timeDiff = Date.now() - parseInt(paymentTime);
      if (timeDiff < 24 * 60 * 60 * 1000 && !paymentMethod?.card?.last4) {
        return <PaymentAlreadyCompleted />;
      }
    }

    return <SuccessScreen paymentMethod={paymentMethod} formData={formData} />;
  }

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 via-blue-50 to-purple-50 py-8 px-4">
      <div className="max-w-6xl mx-auto">
        {/* Header com Logo */}
        <div className="text-center mb-8">
          <div className="flex items-center justify-center gap-4 mb-6">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-600 via-purple-600 to-indigo-600 rounded-2xl flex items-center justify-center shadow-lg">
              <Brain className="w-8 h-8 text-white" />
            </div>
            <div>
              <h1 className="text-4xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                Aiudex
              </h1>
              <p className="text-sm text-gray-600">
                Inteligência Artificial para Advocacia
              </p>
            </div>
          </div>

          {/* Timer de Urgência */}
          <div className="inline-flex items-center gap-3 bg-gradient-to-r from-red-50 to-orange-50 border-2 border-red-200 rounded-xl px-6 py-3 mb-6 shadow-lg">
            <Timer className="w-5 h-5 text-red-600" />
            <span className="text-base font-bold text-red-700">
              Oferta especial expira em: {formatTime(timeLeft)}
            </span>
          </div>
        </div>

        <div className="grid lg:grid-cols-2 gap-8">
          {/* Coluna Esquerda - Resumo do Pedido */}
          <div className="space-y-6">
            {/* Resumo do Plano */}
            <Card className="border-2 border-blue-200 bg-gradient-to-br from-blue-50 via-purple-50 to-indigo-50 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-2xl">
                  <Award className="w-6 h-6 text-blue-600" />
                  Resumo do Pedido
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-6">
                <div className="flex justify-between items-start">
                  <div>
                    <h3 className="font-bold text-xl text-gray-900">
                      Plano Profissional
                    </h3>
                    <p className="text-sm text-gray-600">
                      Mensal • Renovação automática
                    </p>
                  </div>
                  <div className="text-right">
                    <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                      R$ 69,90
                    </div>
                    <div className="text-sm text-gray-500">por mês</div>
                  </div>
                </div>

                <Separator className="bg-gradient-to-r from-blue-200 to-purple-200" />

                <div className="space-y-4">
                  <h4 className="font-bold text-gray-900 text-lg">
                    Benefícios incluídos:
                  </h4>
                  <div className="space-y-3">
                    {[
                      {
                        icon: Brain,
                        text: "IA Jurídica avançada para análise de documentos",
                      },
                      {
                        icon: FileText,
                        text: "Geração automática de petições e contratos",
                      },
                      {
                        icon: Search,
                        text: "Pesquisa jurisprudencial inteligente",
                      },
                      { icon: Headphones, text: "Suporte prioritário 24/7" },
                      {
                        icon: Database,
                        text: "Armazenamento ilimitado de documentos",
                      },
                    ].map((benefit, index) => (
                      <div
                        key={index}
                        className="flex items-center gap-3 bg-white/50 p-3 rounded-lg">
                        <benefit.icon className="w-5 h-5 text-green-500 flex-shrink-0" />
                        <span className="text-sm text-gray-700 font-medium">
                          {benefit.text}
                        </span>
                      </div>
                    ))}
                  </div>
                </div>

                <div className="bg-gradient-to-r from-blue-100 to-purple-100 rounded-xl p-4 border border-blue-200">
                  <p className="text-sm text-blue-800 font-medium">
                    <strong>Próxima cobrança:</strong> R$ 69,90 em{" "}
                    {new Date(
                      Date.now() + 30 * 24 * 60 * 60 * 1000
                    ).toLocaleDateString("pt-BR")}
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Prova Social */}
            <Card className="bg-gradient-to-r from-green-50 via-emerald-50 to-teal-50 border-2 border-green-200 shadow-xl">
              <CardContent className="p-8">
                <div className="flex items-start gap-6">
                  <div className="w-16 h-16 bg-gradient-to-br from-green-100 to-emerald-100 rounded-full flex items-center justify-center flex-shrink-0 shadow-lg">
                    <Users className="w-8 h-8 text-green-600" />
                  </div>
                  <div>
                    <div className="flex items-center gap-1 mb-3">
                      {[...Array(5)].map((_, i) => (
                        <Star
                          key={i}
                          className="w-5 h-5 fill-yellow-400 text-yellow-400"
                        />
                      ))}
                    </div>
                    <p className="text-base text-gray-700 mb-3 italic">
                      "O Aiudex revolucionou minha prática jurídica. Consigo
                      produzir petições em 10 minutos que antes levavam horas!"
                    </p>
                    <p className="text-sm text-gray-500 font-medium">
                      <strong>Dr. Carlos Silva</strong> - Advogado Tributarista
                    </p>
                  </div>
                </div>
                <div className="mt-6 pt-6 border-t border-green-200">
                  <p className="text-base font-bold text-green-700 text-center">
                    🎯 Mais de 1.200 advogados já usam nossa plataforma!
                  </p>
                </div>
              </CardContent>
            </Card>

            {/* Garantias e Políticas */}
            <Card className="shadow-xl">
              <CardContent className="p-8">
                <div className="space-y-6">
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-green-100 rounded-full flex items-center justify-center">
                      <Shield className="w-6 h-6 text-green-600" />
                    </div>
                    <span className="text-base font-bold text-gray-900">
                      Cancele quando quiser
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-blue-100 rounded-full flex items-center justify-center">
                      <Lock className="w-6 h-6 text-blue-600" />
                    </div>
                    <span className="text-base font-bold text-gray-900">
                      Pagamento 100% seguro com Stripe
                    </span>
                  </div>
                  <div className="flex items-center gap-4">
                    <div className="w-12 h-12 bg-purple-100 rounded-full flex items-center justify-center">
                      <Clock className="w-6 h-6 text-purple-600" />
                    </div>
                    <span className="text-base font-bold text-gray-900">
                      Ativação imediata após pagamento
                    </span>
                  </div>
                </div>

                <div className="mt-8 pt-6 border-t border-gray-200">
                  <p className="text-xs text-gray-500 text-center">
                    Ao continuar, você concorda com nossos{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:underline font-medium">
                      Termos de Uso
                    </a>{" "}
                    e{" "}
                    <a
                      href="#"
                      className="text-blue-600 hover:underline font-medium">
                      Política de Privacidade
                    </a>
                  </p>
                </div>
              </CardContent>
            </Card>
          </div>

          {/* Coluna Direita - Formulário de Pagamento */}
          <div className="space-y-6">
            {/* Indicador de Etapas */}
            <div className="flex items-center justify-center gap-6 mb-8">
              {[1, 2, 3].map((stepNumber) => (
                <div key={stepNumber} className="flex items-center">
                  <div
                    className={`w-10 h-10 rounded-full flex items-center justify-center text-sm font-bold shadow-lg ${
                      step >= stepNumber
                        ? "bg-gradient-to-r from-blue-600 to-purple-600 text-white"
                        : "bg-gray-200 text-gray-600"
                    }`}>
                    {stepNumber}
                  </div>
                  {stepNumber < 3 && (
                    <div
                      className={`w-16 h-1 ${
                        step > stepNumber
                          ? "bg-gradient-to-r from-blue-600 to-purple-600"
                          : "bg-gray-200"
                      }`}
                    />
                  )}
                </div>
              ))}
            </div>

            <Card className="border-2 border-blue-200 shadow-xl">
              <CardHeader>
                <CardTitle className="flex items-center gap-3 text-xl">
                  <CreditCard className="w-6 h-6 text-blue-600" />
                  {step === 1 && "Confirme seu Plano"}
                  {step === 2 && "Dados Pessoais"}
                  {step === 3 && "Pagamento Seguro"}
                </CardTitle>
              </CardHeader>
              <CardContent>
                <form onSubmit={handleSubmit} className="space-y-6">
                  {step === 1 && (
                    <div className="space-y-6">
                      <div className="bg-gradient-to-r from-blue-50 to-purple-50 border-2 border-blue-200 rounded-xl p-6">
                        <h3 className="font-bold text-blue-900 mb-3 text-lg">
                          Plano Profissional
                        </h3>
                        <p className="text-sm text-blue-700 mb-4">
                          Acesso completo a todas as funcionalidades da IA
                          jurídica
                        </p>
                        <div className="text-3xl font-bold bg-gradient-to-r from-blue-600 to-purple-600 bg-clip-text text-transparent">
                          R$ 69,90/mês
                        </div>
                      </div>

                      <Button
                        type="button"
                        onClick={nextStep}
                        className="w-full bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all">
                        Continuar com este Plano
                        <ArrowRight className="w-5 h-5 ml-2" />
                      </Button>
                    </div>
                  )}

                  {step === 2 && (
                    <div className="space-y-6">
                      <div className="grid gap-6">
                        <div>
                          <Label
                            htmlFor="name"
                            className="text-base font-medium">
                            Nome Completo
                          </Label>
                          <Input
                            id="name"
                            type="text"
                            value={formData.name}
                            onChange={(e) =>
                              setFormData({ ...formData, name: e.target.value })
                            }
                            placeholder="Seu nome completo"
                            required
                            className="h-14 text-base border-2 focus:border-blue-500"
                          />
                        </div>

                        <div>
                          <Label
                            htmlFor="email"
                            className="text-base font-medium">
                            E-mail
                          </Label>
                          <Input
                            id="email"
                            type="email"
                            value={formData.email}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                email: e.target.value,
                              })
                            }
                            placeholder="seu@email.com"
                            required
                            className="h-14 text-base border-2 focus:border-blue-500"
                          />
                          {formErrors.email && (
                            <span className="text-red-600 text-sm font-medium">
                              {formErrors.email}
                            </span>
                          )}
                        </div>

                        <div>
                          <Label
                            htmlFor="phone"
                            className="text-base font-medium">
                            Telefone
                          </Label>
                          <Input
                            id="phone"
                            type="tel"
                            value={formData.phone}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                phone: e.target.value,
                              })
                            }
                            placeholder="(11) 99999-9999"
                            required
                            className="h-14 text-base border-2 focus:border-blue-500"
                          />
                        </div>
                        <div>
                          <Label
                            htmlFor="cpf"
                            className="text-base font-medium">
                            CPF
                          </Label>
                          <Input
                            id="cpf"
                            type="text"
                            value={formData.cpf}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                cpf: formatCPF(e.target.value),
                              })
                            }
                            placeholder="000.000.000-00"
                            required
                            maxLength={14}
                            className="h-14 text-base border-2 focus:border-blue-500"
                          />
                          {formErrors.cpf && (
                            <span className="text-red-600 text-sm font-medium">
                              {formErrors.cpf}
                            </span>
                          )}
                        </div>
                        <div>
                          <Label
                            htmlFor="cep"
                            className="text-base font-medium">
                            CEP
                          </Label>
                          <Input
                            id="cep"
                            type="text"
                            value={formData.cep}
                            onChange={(e) =>
                              setFormData({
                                ...formData,
                                cep: formatCEP(e.target.value),
                              })
                            }
                            placeholder="00000-000"
                            required
                            maxLength={9}
                            className="h-14 text-base border-2 focus:border-blue-500"
                          />
                          {formErrors.cep && (
                            <span className="text-red-600 text-sm font-medium">
                              {formErrors.cep}
                            </span>
                          )}
                        </div>
                      </div>

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="flex-1 h-14 text-base font-medium border-2">
                          Voltar
                        </Button>
                        <Button
                          type="button"
                          onClick={nextStep}
                          className="flex-1 bg-gradient-to-r from-blue-600 to-purple-600 hover:from-blue-700 hover:to-purple-700 h-14 text-base font-bold shadow-lg">
                          Continuar
                          <ArrowRight className="w-5 h-5 ml-2" />
                        </Button>
                      </div>
                    </div>
                  )}

                  {step === 3 && (
                    <div className="space-y-6">
                      <div>
                        <Label className="text-base font-medium text-gray-700 mb-4 block">
                          Dados do Cartão de Crédito
                        </Label>
                        <div className="border-2 border-gray-300 rounded-xl p-6 bg-white focus-within:border-blue-500 transition-colors">
                          <CardElement
                            options={{
                              style: {
                                base: {
                                  fontSize: "16px",
                                  color: "#424770",
                                  "::placeholder": {
                                    color: "#aab7c4",
                                  },
                                },
                              },
                            }}
                          />
                        </div>
                      </div>

                      {error && (
                        <Alert className="border-red-200 bg-red-50">
                          <AlertDescription className="text-red-700 font-medium">
                            {error}
                          </AlertDescription>
                        </Alert>
                      )}

                      <div className="flex gap-4">
                        <Button
                          type="button"
                          onClick={prevStep}
                          variant="outline"
                          className="flex-1 h-14 text-base font-medium border-2">
                          Voltar
                        </Button>
                        <Button
                          type="submit"
                          disabled={!stripe || loading}
                          className="flex-1 bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-700 hover:to-emerald-700 h-14 text-lg font-bold shadow-lg hover:shadow-xl transition-all">
                          {loading
                            ? "Processando..."
                            : "Começar agora com IA jurídica"}
                        </Button>
                      </div>

                      <div className="text-center">
                        <div className="flex items-center justify-center gap-3 text-sm text-gray-600 bg-gray-50 p-4 rounded-lg">
                          <Lock className="w-5 h-5 text-green-600" />
                          <span className="font-medium">
                            Checkout criptografado e seguro
                          </span>
                        </div>
                      </div>
                    </div>
                  )}
                </form>
              </CardContent>
            </Card>

            {/* Suporte */}
            <Card className="bg-gradient-to-r from-gray-50 to-slate-50 border-2 border-gray-200 shadow-lg">
              <CardContent className="p-6">
                <div className="flex items-center justify-center gap-3 text-base text-gray-600">
                  <MessageCircle className="w-5 h-5 text-blue-600" />
                  <span>Dúvidas? Fale conosco em</span>
                  <a
                    href="mailto:suporte@aiudex.com"
                    className="text-blue-600 hover:underline font-bold">
                    suporte@aiudex.com
                  </a>
                </div>
              </CardContent>
            </Card>
          </div>
        </div>
      </div>
    </div>
  );
};

const SubscriptionCheckout = () => {
  return (
    <Elements stripe={stripePromise}>
      <CheckoutForm />
    </Elements>
  );
};

export default SubscriptionCheckout;
