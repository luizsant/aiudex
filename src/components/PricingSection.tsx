"use client";

import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";
import {
  Check,
  Star,
  Crown,
  Zap,
  Bot,
  Brain,
  CircuitBoard,
  FileText,
  Users,
  BarChart3,
  Shield,
  Wrench,
} from "lucide-react";
import Link from "next/link";

const PricingSection = () => {
  const plans = [
    {
      name: "Starter",
      price: "49,90",
      planId: "prod_SdfWhqsYLoiWHl", // ID do Stripe
      description: "Ideal para advogados iniciantes",
      icon: Zap,
      features: [
        "IA para geração de peças (50/mês)",
        "Editor markdown básico",
        "Gestão de clientes (até 50)",
        "Ferramentas PDF básicas",
        "Suporte por email",
        "Armazenamento 5GB",
      ],
      popular: false,
      gradient: "from-blue-500 to-blue-600",
    },
    {
      name: "Professional",
      price: "79,90",
      planId: "prod_SdfZhkoJCpPydT", // ID do Stripe
      description: "Para advogados e pequenos escritórios",
      icon: Star,
      features: [
        "IA ilimitada para peças",
        "Editor markdown avançado",
        "Gestão de clientes ilimitada",
        "Chat jurídico IA",
        "Analytics e relatórios",
        "Ferramentas PDF completas",
        "Armazenamento 50GB",
        "Suporte prioritário",
      ],
      popular: true,
      gradient: "from-amber-500 to-orange-500",
    },
    {
      name: "Ultra",
      price: "149,90",
      planId: "prod_SdfaT6pqlYZA3x", // ID do Stripe
      description: "Para grandes escritórios",
      icon: Crown,
      features: [
        "Tudo do Professional +",
        "Multiusuário (até 10 usuários)",
        "Gestão de equipe e permissões",
        "Analytics avançados e BI",
        "API para integrações",
        "White label disponível",
        "Armazenamento 200GB",
        "Gerente de conta dedicado",
      ],
      popular: false,
      gradient: "from-purple-500 to-purple-600",
    },
  ];

  const handleContactSales = () => {
    const message =
      "Olá! Gostaria de saber mais sobre os planos Enterprise e funcionalidades personalizadas do AIudex.";
    const whatsappUrl = `https://wa.me/5511999999999?text=${encodeURIComponent(
      message
    )}`;
    window.open(whatsappUrl, "_blank");
  };

  return (
    <section
      id="pricing"
      className="py-16 sm:py-20 lg:py-24 bg-gradient-to-br from-slate-900 to-blue-900 relative overflow-hidden">
      {/* Background Elements */}
      <div className="absolute inset-0">
        <div className="absolute top-0 left-0 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl"></div>
        <div className="absolute bottom-0 right-0 w-96 h-96 bg-green-500/10 rounded-full blur-3xl"></div>
        <div className="absolute top-1/2 left-1/2 transform -translate-x-1/2 -translate-y-1/2 w-[600px] h-[600px] bg-gradient-to-r from-blue-500/5 to-green-500/5 rounded-full blur-3xl"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        {/* Section Header */}
        <div className="text-center mb-12 md:mb-16">
          <div className="inline-flex items-center bg-amber-400 text-amber-900 px-4 py-2 rounded-full text-sm font-semibold mb-4">
            <Crown className="w-4 h-4 mr-2" />
            Planos e Preços
          </div>
          <h2 className="text-3xl sm:text-4xl md:text-5xl font-bold mb-4 md:mb-6 text-white leading-tight">
            Escolha o plano ideal para seu escritório
          </h2>
          <p className="text-lg sm:text-xl text-slate-300 max-w-3xl mx-auto">
            <span className="text-amber-400 font-semibold">
              Teste grátis por 7 dias
            </span>{" "}
            em qualquer plano. Sem compromisso, cancele quando quiser.
          </p>
        </div>

        {/* Pricing Cards */}
        <div className="grid sm:grid-cols-2 lg:grid-cols-3 gap-6 lg:gap-8 max-w-7xl mx-auto">
          {plans.map((plan, index) => (
            <Card
              key={index}
              className={`bg-white/95 backdrop-blur-sm hover:shadow-2xl transition-all duration-300 ${
                plan.popular
                  ? "ring-4 ring-amber-400 scale-105 lg:scale-110"
                  : ""
              } relative border-0 h-full flex flex-col`}>
              {plan.popular && (
                <div className="absolute -top-4 left-1/2 transform -translate-x-1/2">
                  <span className="bg-gradient-to-r from-amber-500 to-orange-500 text-white px-6 py-2 rounded-full text-sm font-semibold shadow-lg">
                    Mais Popular
                  </span>
                </div>
              )}

              <CardContent className="p-6 lg:p-8 flex-1 flex flex-col">
                {/* Plan Header */}
                <div className="text-center mb-6 lg:mb-8">
                  <div
                    className={`w-16 h-16 bg-gradient-to-r ${plan.gradient} rounded-2xl flex items-center justify-center mb-4 mx-auto shadow-lg`}>
                    <plan.icon className="w-8 h-8 text-white" />
                  </div>
                  <h3 className="text-2xl font-bold mb-2 text-slate-800">
                    {plan.name}
                  </h3>
                  <p className="text-slate-600 mb-4 text-sm lg:text-base">
                    {plan.description}
                  </p>
                  <div className="flex items-baseline justify-center">
                    <span className="text-sm text-slate-500">R$</span>
                    <span className="text-3xl lg:text-4xl font-bold text-slate-800">
                      {plan.price}
                    </span>
                    <span className="text-slate-500 ml-1">/mês</span>
                  </div>
                </div>

                {/* Features */}
                <div className="space-y-3 lg:space-y-4 mb-6 lg:mb-8 flex-1">
                  {plan.features.map((feature, featureIndex) => (
                    <div
                      key={featureIndex}
                      className="flex items-start space-x-3">
                      <div className="w-5 h-5 bg-green-100 rounded-full flex items-center justify-center mt-0.5 flex-shrink-0">
                        <Check className="w-3 h-3 text-green-600" />
                      </div>
                      <span className="text-slate-600 text-sm lg:text-base">
                        {feature}
                      </span>
                    </div>
                  ))}
                </div>

                {/* CTA Button */}
                <Link href={`/checkout?plan=${plan.planId}`} className="w-full">
                  <Button
                    className={`w-full ${
                      plan.popular
                        ? "bg-gradient-to-r from-amber-500 to-orange-500 hover:from-amber-600 hover:to-orange-600"
                        : "bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700"
                    } text-white text-base lg:text-lg py-3 lg:py-4 h-auto font-semibold shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105`}>
                    {plan.popular
                      ? "Começar Agora - 7 Dias Grátis"
                      : "Teste Grátis 7 dias"}
                  </Button>
                </Link>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Features Comparison */}
        <div className="mt-16 bg-white/10 backdrop-blur-sm rounded-3xl p-8 border border-white/20">
          <h3 className="text-2xl font-bold text-white text-center mb-8">
            Comparativo de Funcionalidades
          </h3>
          <div className="grid md:grid-cols-2 lg:grid-cols-4 gap-6">
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Brain className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">IA Jurídica</h4>
              <p className="text-slate-300 text-sm">
                Geração automática de peças com inteligência artificial
                especializada
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <FileText className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Editor Avançado</h4>
              <p className="text-slate-300 text-sm">
                Editor markdown com preview e formatação automática ABNT
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Users className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">
                Gestão de Clientes
              </h4>
              <p className="text-slate-300 text-sm">
                CRM completo para cadastro e acompanhamento de processos
              </p>
            </div>
            <div className="text-center">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-500 to-green-500 rounded-xl flex items-center justify-center mx-auto mb-4">
                <Wrench className="w-6 h-6 text-white" />
              </div>
              <h4 className="text-white font-semibold mb-2">Ferramentas PDF</h4>
              <p className="text-slate-300 text-sm">
                Kit completo para manipulação e conversão de documentos
              </p>
            </div>
          </div>
        </div>

        {/* Bottom CTA */}
        <div className="text-center mt-12 lg:mt-16">
          <p className="text-slate-300 mb-6 text-base lg:text-lg">
            Precisa de mais usuários ou funcionalidades personalizadas?
          </p>
          <Button
            onClick={handleContactSales}
            variant="outline"
            className="bg-white/10 backdrop-blur-sm border-white/20 text-white hover:bg-white/20 px-6 lg:px-8 py-3 lg:py-4 text-base lg:text-lg font-semibold">
            Fale com nosso time de vendas
          </Button>
        </div>
      </div>
    </section>
  );
};

export default PricingSection;
