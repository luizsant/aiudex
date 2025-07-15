"use client";

import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Scale,
  Mail,
  Lock,
  ArrowRight,
  AlertCircle,
  AlertTriangle,
  WifiOff,
} from "lucide-react";
import { useState } from "react";
import Link from "next/link";
import { useRouter } from "next/navigation";
import { useAuth } from "@/contexts/AuthContext";

const Login = () => {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [isLoading, setIsLoading] = useState(false);
  const {
    login,
    user,
    error: authError,
    errorType: authErrorType,
    isLoading: authLoading,
  } = useAuth();
  const router = useRouter();

  // Usar o erro e tipo de erro do contexto de autenticação
  const error = authError;
  const errorType = authErrorType;

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    e.stopPropagation();

    setIsLoading(true);

    // Validações básicas
    if (!email.trim() || !password.trim()) {
      setIsLoading(false);
      return;
    }

    if (!email.includes("@") || !email.includes(".")) {
      setIsLoading(false);
      return;
    }

    // Teste para forçar erro (remover depois)
    if (email === "teste@teste.com") {
      setIsLoading(false);
      return;
    }

    if (email === "erro@erro.com") {
      setIsLoading(false);
      return;
    }

    try {
      await login(email, password);

      // Aguardar um pouco para garantir que o estado de erro seja atualizado
      await new Promise((resolve) => setTimeout(resolve, 100));

      // Verificar se há erro ou se o usuário não foi definido
      if (error || !user) {
        console.log(
          "❌ [LOGIN] Erro detectado ou usuário não definido, não redirecionando"
        );
        return;
      }

      // Se chegou aqui, o login foi bem-sucedido (não houve erro)
      const currentUser = JSON.parse(
        localStorage.getItem("legalai_user") || "{}"
      );

      if (currentUser.role === "ADMIN") {
        router.push("/admin");
      } else {
        router.push("/dashboard");
      }
    } catch (error) {
      // Erro já foi tratado pelo AuthContext
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-blue-50 to-green-50 px-4 sm:px-6 lg:px-8 py-8">
      <Card className="w-full max-w-md backdrop-blur-sm bg-white/95 shadow-xl border-0">
        <CardHeader className="text-center space-y-4 pb-6">
          <div className="flex items-center justify-center space-x-3 mb-2">
            <div className="w-10 h-10 sm:w-12 sm:h-12 bg-gradient-to-r from-blue-600 to-green-600 rounded-xl flex items-center justify-center shadow-lg">
              <Scale className="w-6 h-6 sm:w-7 sm:h-7 text-white" />
            </div>
            <span className="text-2xl sm:text-3xl font-bold bg-gradient-to-r from-blue-700 to-green-600 bg-clip-text text-transparent">
              AIudex
            </span>
          </div>
          <CardTitle className="text-2xl sm:text-3xl font-bold text-gray-900">
            Fazer Login
          </CardTitle>
          <p className="text-sm sm:text-base text-gray-600">
            Acesse sua conta para continuar
          </p>
        </CardHeader>
        <CardContent className="space-y-6">
          {/* Mensagem de Erro */}
          {error && (
            <div className="p-4 rounded-lg border-2 border-red-200 bg-red-50">
              <div className="flex items-start gap-3">
                {errorType === "user_not_found" && (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                {errorType === "invalid_credentials" && (
                  <AlertTriangle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                {errorType === "network" && (
                  <WifiOff className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                {errorType === "validation" && (
                  <AlertCircle className="h-5 w-5 text-red-600 mt-0.5 flex-shrink-0" />
                )}
                <div className="flex-1">
                  <div className="font-bold text-red-800 mb-1">
                    {errorType === "user_not_found" && "Usuário não encontrado"}
                    {errorType === "invalid_credentials" &&
                      "Credenciais inválidas"}
                    {errorType === "network" && "Erro de conexão"}
                    {errorType === "validation" && "Dados inválidos"}
                  </div>
                  <div className="text-sm text-red-700 mb-2">{error}</div>
                  {errorType === "user_not_found" && (
                    <Link
                      href="/register"
                      className="text-red-600 hover:text-red-800 underline font-medium text-sm">
                      Criar nova conta
                    </Link>
                  )}
                </div>
              </div>
            </div>
          )}

          <form onSubmit={handleSubmit} className="space-y-5">
            <div className="space-y-2">
              <Label
                htmlFor="email"
                className="text-sm font-medium text-gray-700">
                Email
              </Label>
              <div className="relative">
                <Mail className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="email"
                  type="email"
                  value={email}
                  onChange={(e) => {
                    setEmail(e.target.value);
                  }}
                  className={`pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg ${
                    errorType === "user_not_found" ||
                    errorType === "invalid_credentials"
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="seu@email.com"
                  required
                />
              </div>
            </div>
            <div className="space-y-2">
              <Label
                htmlFor="password"
                className="text-sm font-medium text-gray-700">
                Senha
              </Label>
              <div className="relative">
                <Lock className="absolute left-3 top-1/2 transform -translate-y-1/2 h-5 w-5 text-gray-400" />
                <Input
                  id="password"
                  type="password"
                  value={password}
                  onChange={(e) => {
                    setPassword(e.target.value);
                  }}
                  className={`pl-10 h-12 text-base border-gray-300 focus:border-blue-500 focus:ring-blue-500 rounded-lg ${
                    errorType === "invalid_credentials"
                      ? "border-red-300 focus:border-red-500 focus:ring-red-500"
                      : ""
                  }`}
                  placeholder="Sua senha"
                  required
                />
              </div>
            </div>
            <Button
              type="submit"
              className="w-full h-12 bg-gradient-to-r from-blue-600 to-green-600 hover:from-blue-700 hover:to-green-700 text-white font-semibold rounded-lg shadow-lg hover:shadow-xl transition-all duration-200 transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed disabled:transform-none"
              disabled={isLoading}>
              {isLoading ? (
                <div className="flex items-center space-x-2">
                  <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>Entrando...</span>
                </div>
              ) : (
                <div className="flex items-center space-x-2">
                  <span>Entrar</span>
                  <ArrowRight className="w-4 h-4" />
                </div>
              )}
            </Button>
          </form>

          <div className="space-y-4">
            <div className="text-center">
              <Link
                href="/forgot-password"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                Esqueceu sua senha?
              </Link>
            </div>
            <div className="relative">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-300"></div>
              </div>
              <div className="relative flex justify-center text-sm">
                <span className="px-2 bg-white text-gray-500">ou</span>
              </div>
            </div>
            <div className="text-center">
              <span className="text-sm text-gray-600">Não tem uma conta? </span>
              <Link
                href="/register"
                className="text-sm text-blue-600 hover:text-blue-800 hover:underline font-medium transition-colors">
                Registre-se gratuitamente
              </Link>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export default Login;
