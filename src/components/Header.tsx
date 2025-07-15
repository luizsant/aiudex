"use client";

import { Button } from "@/components/ui/button";
import {
  Bot,
  Menu,
  X,
  Sun,
  Moon,
  Zap,
  Cpu,
  Brain,
  CircuitBoard,
} from "lucide-react";
import { useState, useEffect } from "react";
import Link from "next/link";
import { useThemeToggle } from "@/hooks/useThemeToggle";
import { useScrollToSection } from "@/hooks/useScrollToSection";
import { HeaderCredits } from "@/components/HeaderCredits";
import NotificationCenter from "./NotificationCenter";
import { useAuth } from "@/contexts/AuthContext";

const Header = () => {
  const [isMenuOpen, setIsMenuOpen] = useState(false);
  const { mounted, resolvedTheme, toggleTheme } = useThemeToggle();
  const scrollToSection = useScrollToSection(80);
  const { isAuthenticated } = useAuth();

  const handleScrollToSection = (sectionId: string) => {
    scrollToSection(sectionId);
    setIsMenuOpen(false);
  };

  // Previne scroll quando menu mobile está aberto
  useEffect(() => {
    if (isMenuOpen) {
      document.body.style.overflow = "hidden";
    } else {
      document.body.style.overflow = "unset";
    }
    return () => {
      document.body.style.overflow = "unset";
    };
  }, [isMenuOpen]);

  return (
    <>
      <header className="fixed top-0 left-0 right-0 z-[100] bg-white/90 dark:bg-slate-900/90 backdrop-blur-xl border-b border-slate-200/50 dark:border-slate-700/50 shadow-lg">
        <div className="container mx-auto px-4">
          <div className="flex items-center justify-between h-16 lg:h-20">
            {/* Logo */}
            <div className="flex items-center space-x-3 sm:space-x-4">
              <Link href="/" className="flex items-center space-x-3 group">
                <div className="relative">
                  <div className="w-8 h-8 sm:w-10 sm:h-10 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center relative overflow-hidden group-hover:scale-110 transition-transform duration-300">
                    <div className="absolute inset-0 bg-gradient-to-r from-blue-400 to-green-400 opacity-20 animate-pulse"></div>
                    <Bot className="w-5 h-5 sm:w-6 sm:h-6 text-white relative z-10" />
                    <div className="absolute -top-1 -right-1 w-2 h-2 sm:w-3 sm:h-3 bg-green-400 rounded-full animate-ping"></div>
                  </div>
                </div>
                <div className="flex flex-col">
                  <span className="text-lg sm:text-xl lg:text-2xl font-bold bg-gradient-to-r from-blue-600 to-green-600 bg-clip-text text-transparent">
                    AIudex
                  </span>
                  <span className="text-xs text-slate-500 dark:text-slate-400 -mt-1 hidden sm:block">
                    AI Jurídica Avançada
                  </span>
                </div>
              </Link>
            </div>

            {/* Desktop Navigation */}
            <nav className="hidden md:flex items-center space-x-6 lg:space-x-8">
              <button
                onClick={() => handleScrollToSection("features")}
                className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 flex items-center space-x-2 group relative px-3 py-2 rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Brain className="w-4 h-4 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10 font-medium">IA Jurídica</span>
              </button>
              <button
                onClick={() => handleScrollToSection("tools")}
                className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 flex items-center space-x-2 group relative px-3 py-2 rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <CircuitBoard className="w-4 h-4 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10 font-medium">Ferramentas</span>
              </button>
              <button
                onClick={() => handleScrollToSection("pricing")}
                className="text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-all duration-300 flex items-center space-x-2 group relative px-3 py-2 rounded-lg">
                <div className="absolute inset-0 bg-gradient-to-r from-blue-500/10 to-green-500/10 rounded-lg opacity-0 group-hover:opacity-100 transition-opacity"></div>
                <Zap className="w-4 h-4 group-hover:scale-110 transition-transform relative z-10" />
                <span className="relative z-10 font-medium">Planos</span>
              </button>
            </nav>

            {/* Credits Display - Only show when authenticated */}
            {isAuthenticated && (
              <div className="hidden md:flex items-center space-x-3">
                <HeaderCredits />
              </div>
            )}

            {/* Desktop CTA Buttons */}
            <div className="hidden md:flex items-center space-x-3 lg:space-x-4">
              <Button
                onClick={toggleTheme}
                variant="ghost"
                size="sm"
                className="w-10 h-10 p-0 rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200">
                {mounted && resolvedTheme === "dark" ? (
                  <Sun className="w-5 h-5" />
                ) : mounted && resolvedTheme === "light" ? (
                  <Moon className="w-5 h-5" />
                ) : (
                  <div className="w-5 h-5" />
                )}
              </Button>

              <Link href="/login">
                <Button
                  variant="ghost"
                  className="font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 px-4 py-2 rounded-lg">
                  Entrar
                </Button>
              </Link>

              <Link href="/register">
                <Button className="bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold px-4 lg:px-6 py-2 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                  <Cpu className="w-4 h-4 mr-2" />
                  <span className="hidden lg:inline">Começar Grátis</span>
                  <span className="lg:hidden">Grátis</span>
                </Button>
              </Link>
            </div>

            {/* Mobile Menu Button */}
            <button
              onClick={() => setIsMenuOpen(!isMenuOpen)}
              className="md:hidden w-10 h-10 flex items-center justify-center rounded-xl hover:bg-slate-100 dark:hover:bg-slate-800 transition-colors relative z-[101]"
              aria-label={isMenuOpen ? "Fechar menu" : "Abrir menu"}
              aria-expanded={isMenuOpen}>
              <div className="relative w-6 h-6 flex items-center justify-center">
                <span
                  className={`absolute w-5 h-0.5 bg-slate-600 dark:bg-slate-300 transition-all duration-300 ${
                    isMenuOpen ? "rotate-45" : "-translate-y-1.5"
                  }`}></span>
                <span
                  className={`absolute w-5 h-0.5 bg-slate-600 dark:bg-slate-300 transition-all duration-300 ${
                    isMenuOpen ? "opacity-0" : ""
                  }`}></span>
                <span
                  className={`absolute w-5 h-0.5 bg-slate-600 dark:bg-slate-300 transition-all duration-300 ${
                    isMenuOpen ? "-rotate-45" : "translate-y-1.5"
                  }`}></span>
              </div>
            </button>
          </div>
        </div>
      </header>

      {/* Mobile Menu Overlay */}
      <div
        className={`md:hidden fixed inset-0 bg-black/50 backdrop-blur-sm z-[90] transition-opacity duration-300 ${
          isMenuOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        }`}
        onClick={() => setIsMenuOpen(false)}
        aria-hidden="true"
      />

      {/* Mobile Menu */}
      <div
        className={`md:hidden fixed left-0 right-0 top-16 bg-white dark:bg-slate-900 z-[95] shadow-xl transition-transform duration-300 ease-in-out transform ${
          isMenuOpen ? "translate-y-0" : "-translate-y-full"
        }`}
        aria-hidden={!isMenuOpen}>
        <div className="container mx-auto px-4 py-6">
          <nav className="space-y-2">
            <button
              onClick={() => handleScrollToSection("features")}
              className="w-full text-left text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-4 flex items-center space-x-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 px-4 group">
              <div className="w-10 h-10 bg-blue-100 dark:bg-blue-900/30 rounded-lg flex items-center justify-center group-hover:bg-blue-200 dark:group-hover:bg-blue-800/50 transition-colors">
                <Brain className="w-5 h-5 text-blue-600 dark:text-blue-400" />
              </div>
              <div>
                <span className="font-medium text-base">IA Jurídica</span>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Inteligência artificial especializada
                </p>
              </div>
            </button>

            <button
              onClick={() => handleScrollToSection("tools")}
              className="w-full text-left text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-4 flex items-center space-x-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 px-4 group">
              <div className="w-10 h-10 bg-green-100 dark:bg-green-900/30 rounded-lg flex items-center justify-center group-hover:bg-green-200 dark:group-hover:bg-green-800/50 transition-colors">
                <CircuitBoard className="w-5 h-5 text-green-600 dark:text-green-400" />
              </div>
              <div>
                <span className="font-medium text-base">Ferramentas</span>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Utilitários e recursos avançados
                </p>
              </div>
            </button>

            <button
              onClick={() => handleScrollToSection("pricing")}
              className="w-full text-left text-slate-600 dark:text-gray-300 hover:text-blue-600 dark:hover:text-blue-400 transition-colors py-4 flex items-center space-x-3 rounded-xl hover:bg-slate-50 dark:hover:bg-slate-800 px-4 group">
              <div className="w-10 h-10 bg-purple-100 dark:bg-purple-900/30 rounded-lg flex items-center justify-center group-hover:bg-purple-200 dark:group-hover:bg-purple-800/50 transition-colors">
                <Zap className="w-5 h-5 text-purple-600 dark:text-purple-400" />
              </div>
              <div>
                <span className="font-medium text-base">Planos</span>
                <p className="text-sm text-slate-500 dark:text-slate-400">
                  Escolha o plano ideal para você
                </p>
              </div>
            </button>
          </nav>

          {/* Mobile CTA Buttons */}
          <div className="mt-6 space-y-3">
            <Link href="/login" className="block">
              <Button
                variant="ghost"
                className="w-full justify-start font-medium hover:bg-slate-100 dark:hover:bg-slate-800 transition-all duration-200 py-3 rounded-lg">
                Entrar
              </Button>
            </Link>

            <Link href="/register" className="block">
              <Button className="w-full bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold py-3 rounded-xl shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105">
                <Cpu className="w-4 h-4 mr-2" />
                Começar Grátis
              </Button>
            </Link>
          </div>
        </div>
      </div>
    </>
  );
};

export default Header;
