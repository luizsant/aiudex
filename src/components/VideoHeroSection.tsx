"use client";

import { Button } from "@/components/ui/button";
import {
  ArrowRight,
  Sparkles,
  Play,
  Pause,
  Bot,
  Zap,
  Cpu,
  Brain,
  CircuitBoard,
  FileText,
  Users,
  BarChart3,
  Shield,
} from "lucide-react";
import { useState, useRef } from "react";
import Link from "next/link";
import DemoModal from "./DemoModal";
import FreeBanner from "./FreeBanner";

const VideoHeroSection = () => {
  const [isPlaying, setIsPlaying] = useState(true);
  const [isDemoModalOpen, setIsDemoModalOpen] = useState(false);
  const videoRef = useRef<HTMLVideoElement>(null);

  const togglePlay = () => {
    if (videoRef.current) {
      if (isPlaying) {
        videoRef.current.pause();
      } else {
        videoRef.current.play();
      }
      setIsPlaying(!isPlaying);
    }
  };

  const features = [
    {
      icon: Brain,
      title: "IA Jurídica Especializada",
      description:
        "Geração automática de peças processuais com inteligência artificial treinada em direito brasileiro",
    },
    {
      icon: FileText,
      title: "Editor Avançado",
      description:
        "Editor markdown com preview em tempo real e formatação automática ABNT",
    },
    {
      icon: Users,
      title: "Gestão de Clientes",
      description:
        "CRM completo com cadastro, histórico e acompanhamento de processos",
    },
    {
      icon: BarChart3,
      title: "Analytics Jurídico",
      description:
        "Relatórios e métricas para acompanhar produtividade e performance",
    },
  ];

  return (
    <section className="relative min-h-screen flex items-center justify-center overflow-hidden bg-gradient-to-br from-slate-900 via-blue-900 to-slate-900">
      {/* Animated Background */}
      <div className="absolute inset-0">
        <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20"></div>
        <div className="absolute top-0 left-0 w-full h-full">
          <div className="absolute top-20 left-10 w-72 h-72 bg-blue-500/10 rounded-full blur-3xl animate-pulse"></div>
          <div className="absolute top-40 right-20 w-96 h-96 bg-green-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
          <div className="absolute bottom-20 left-1/3 w-80 h-80 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-2000"></div>
        </div>

        {/* Grid Pattern */}
        <div className="absolute inset-0 bg-[linear-gradient(rgba(59,130,246,0.1)_1px,transparent_1px),linear-gradient(90deg,rgba(59,130,246,0.1)_1px,transparent_1px)] bg-[size:50px_50px]"></div>
      </div>

      <div className="container mx-auto px-4 relative z-10">
        <div className="grid lg:grid-cols-2 gap-12 items-center">
          {/* Content */}
          <div className="text-center lg:text-left">
            {/* Badge */}
            <div className="inline-flex items-center bg-gradient-to-r from-blue-500/20 to-green-500/20 backdrop-blur-sm border border-blue-500/30 text-blue-300 px-6 py-3 rounded-full text-sm font-semibold mb-6 shadow-2xl">
              <Bot className="w-4 h-4 mr-2 animate-pulse" />
              IA Jurídica de Nova Geração
            </div>

            {/* Main Title */}
            <h1 className="text-4xl md:text-6xl lg:text-7xl font-bold mb-6 leading-tight">
              <span className="bg-gradient-to-r from-white via-blue-100 to-green-100 bg-clip-text text-transparent">
                O Futuro da
              </span>
              <br />
              <span className="bg-gradient-to-r from-blue-400 to-green-400 bg-clip-text text-transparent">
                Advocacia Digital
              </span>
            </h1>

            {/* Subtitle */}
            <p className="text-xl md:text-2xl text-slate-300 mb-8 max-w-2xl mx-auto lg:mx-0 leading-relaxed">
              Automatize sua prática jurídica com IA especializada.
              <span className="text-blue-400 font-semibold">
                {" "}
                Gere peças em minutos
              </span>
              ,
              <span className="text-green-400 font-semibold">
                {" "}
                gerencie clientes
              </span>{" "}
              e
              <span className="text-purple-400 font-semibold">
                {" "}
                analise documentos
              </span>{" "}
              com precisão.
            </p>

            {/* CTA Buttons */}
            <div className="flex flex-col sm:flex-row gap-4 mb-12 justify-center lg:justify-start">
              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-bold px-8 py-4 rounded-xl shadow-2xl hover:shadow-blue-500/25 transition-all duration-300 transform hover:scale-105 text-lg">
                  <Cpu className="w-5 h-5 mr-2" />
                  Começar Gratuitamente
                  <ArrowRight className="w-5 h-5 ml-2" />
                </Button>
              </Link>

              <Button
                onClick={() => setIsDemoModalOpen(true)}
                variant="outline"
                className="border-blue-500/30 text-blue-300 hover:bg-blue-500/10 backdrop-blur-sm font-semibold px-8 py-4 rounded-xl shadow-lg hover:shadow-blue-500/25 transition-all duration-300 text-lg">
                <Play className="w-5 h-5 mr-2" />
                Ver Demonstração
              </Button>
            </div>

            {/* Stats */}
            <div className="grid grid-cols-2 md:grid-cols-4 gap-6 max-w-2xl mx-auto lg:mx-0">
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-blue-400 mb-1">
                  95%
                </div>
                <div className="text-sm text-slate-400">Precisão IA</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-green-400 mb-1">
                  10x
                </div>
                <div className="text-sm text-slate-400">Mais Rápido</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-purple-400 mb-1">
                  24/7
                </div>
                <div className="text-sm text-slate-400">Disponível</div>
              </div>
              <div className="text-center">
                <div className="text-2xl md:text-3xl font-bold text-amber-400 mb-1">
                  100%
                </div>
                <div className="text-sm text-slate-400">Seguro</div>
              </div>
            </div>
          </div>

          {/* Video/Animation */}
          <div className="relative">
            <div className="relative bg-gradient-to-br from-slate-800/50 to-slate-900/50 backdrop-blur-xl border border-slate-700/50 rounded-2xl p-2 shadow-2xl">
              <div className="relative bg-slate-900 rounded-xl overflow-hidden">
                {/* Video Placeholder */}
                <div className="aspect-video bg-gradient-to-br from-blue-900/50 to-green-900/50 flex items-center justify-center relative">
                  <div className="absolute inset-0 bg-gradient-to-r from-blue-600/20 to-green-600/20 animate-pulse"></div>

                  {/* Floating Elements */}
                  <div className="absolute top-4 left-4 w-8 h-8 bg-blue-500/30 rounded-lg animate-bounce"></div>
                  <div className="absolute top-8 right-6 w-6 h-6 bg-green-500/30 rounded-full animate-bounce delay-300"></div>
                  <div className="absolute bottom-6 left-8 w-4 h-4 bg-purple-500/30 rounded-lg animate-bounce delay-500"></div>

                  {/* Play Button */}
                  <button
                    onClick={togglePlay}
                    className="relative z-10 w-20 h-20 bg-gradient-to-r from-blue-600 to-green-600 rounded-full flex items-center justify-center shadow-2xl hover:shadow-blue-500/50 transition-all duration-300 transform hover:scale-110">
                    {isPlaying ? (
                      <Pause className="w-8 h-8 text-white" />
                    ) : (
                      <Play className="w-8 h-8 text-white ml-1" />
                    )}
                  </button>
                </div>

                {/* Video Controls */}
                <div className="p-4 bg-slate-800/50">
                  <div className="flex items-center justify-between text-sm text-slate-400">
                    <span>AIudex - Editor Jurídico</span>
                    <span>00:45 / 02:30</span>
                  </div>
                  <div className="w-full bg-slate-700 rounded-full h-1 mt-2">
                    <div className="bg-gradient-to-r from-blue-500 to-green-500 h-1 rounded-full w-1/3"></div>
                  </div>
                </div>
              </div>
            </div>

            {/* Floating Cards */}
            <div className="absolute -top-4 -right-4 bg-gradient-to-r from-blue-600 to-green-600 p-4 rounded-xl shadow-2xl animate-float">
              <div className="flex items-center space-x-3">
                <Shield className="w-6 h-6 text-white" />
                <div>
                  <div className="text-white font-bold text-sm">Segurança</div>
                  <div className="text-blue-100 text-xs">
                    Criptografia AES-256
                  </div>
                </div>
              </div>
            </div>

            <div className="absolute -bottom-4 -left-4 bg-gradient-to-r from-purple-600 to-pink-600 p-4 rounded-xl shadow-2xl animate-float-delayed">
              <div className="flex items-center space-x-3">
                <Brain className="w-6 h-6 text-white" />
                <div>
                  <div className="text-white font-bold text-sm">
                    IA Avançada
                  </div>
                  <div className="text-purple-100 text-xs">GPT-4 + Claude</div>
                </div>
              </div>
            </div>
          </div>
        </div>

        {/* Features Grid */}
        <div className="mt-20 grid md:grid-cols-2 lg:grid-cols-4 gap-6">
          {features.map((feature, index) => (
            <div
              key={index}
              className="bg-slate-800/30 backdrop-blur-sm border border-slate-700/50 rounded-xl p-6 hover:bg-slate-800/50 transition-all duration-300 group">
              <div className="w-12 h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center mb-4 group-hover:scale-110 transition-transform">
                <feature.icon className="w-6 h-6 text-white" />
              </div>
              <h3 className="text-lg font-semibold text-white mb-2">
                {feature.title}
              </h3>
              <p className="text-slate-400 text-sm leading-relaxed">
                {feature.description}
              </p>
            </div>
          ))}
        </div>
      </div>

      {/* Free Banner */}
      <FreeBanner />

      {/* Demo Modal */}
      <DemoModal
        isOpen={isDemoModalOpen}
        onClose={() => setIsDemoModalOpen(false)}
      />
    </section>
  );
};

export default VideoHeroSection;
