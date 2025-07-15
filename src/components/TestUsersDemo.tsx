"use client";

import React, { useState, useEffect } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Copy, User, Shield } from "lucide-react";
import { testCredentials, testUsers } from "@/lib/test-data";
import { useAuth } from "@/contexts/AuthContext";
import { useToast } from "@/hooks/use-toast";
import { useNavigate } from "react-router-dom";
import {
  Users,
  Key,
  CheckCircle,
  AlertCircle,
  RefreshCw,
  Bug,
} from "lucide-react";

const TestUsersDemo = () => {
  const { login, user, isAuthenticated, logout } = useAuth();
  const { toast } = useToast();
  const navigate = useNavigate();
  const [isLoading, setIsLoading] = useState<string | null>(null);

  const handleLogin = async (email: string, password: string) => {
    setIsLoading(email);
    try {
      await login(email, password);
      toast({
        title: "Login realizado com sucesso!",
        description: `Bem-vindo, ${email}`,
      });
      navigate("/dashboard");
    } catch (error) {
      console.error("Erro no login:", error);
    } finally {
      setIsLoading(null);
    }
  };

  const handleLogout = () => {
    logout();
    toast({
      title: "Logout realizado",
      description: "Você foi desconectado do sistema.",
    });
  };

  const copyToClipboard = (text: string, label: string) => {
    navigator.clipboard.writeText(text);
    toast({
      title: "Copiado!",
      description: `${label} copiado para a área de transferência.`,
    });
  };

  // Função de debug para localStorage
  const debugLocalStorage = () => {
    console.log("🔍 === DEBUG LOCALSTORAGE ===");
    const keys = Object.keys(localStorage);
    console.log("Chaves no localStorage:", keys);

    keys.forEach((key) => {
      if (key.includes("legalai")) {
        const value = localStorage.getItem(key);
        console.log(`${key}:`, value);
        try {
          const parsed = JSON.parse(value || "");
          console.log(`${key} (parsed):`, parsed);
        } catch (e) {
          console.log(`${key} (não é JSON):`, value);
        }
      }
    });

    // Testar validação manual
    const savedUser = localStorage.getItem("legalai_user");
    if (savedUser) {
      try {
        const parsed = JSON.parse(savedUser);
        console.log("Usuário salvo:", parsed);
        console.log("Tem id:", !!parsed.id);
        console.log("Tem email:", !!parsed.email);
        console.log("Tem createdAt:", !!parsed.createdAt);
      } catch (e) {
        console.log("Erro ao parsear usuário:", e);
      }
    }
    console.log("=== FIM DEBUG LOCALSTORAGE ===");
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case "admin":
        return "bg-red-100 text-red-800";
      case "advogado":
        return "bg-blue-100 text-blue-800";
      case "estagiario":
        return "bg-green-100 text-green-800";
      default:
        return "bg-gray-100 text-gray-800";
    }
  };

  const getRoleIcon = (role: string) => {
    switch (role) {
      case "admin":
        return <Shield className="w-4 h-4" />;
      case "advogado":
        return <User className="w-4 h-4" />;
      case "estagiario":
        return <User className="w-4 h-4" />;
      default:
        return <User className="w-4 h-4" />;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-slate-50 to-blue-50 p-6">
      <div className="max-w-6xl mx-auto space-y-6">
        {/* Header */}
        <div className="text-center space-y-4">
          <div className="flex items-center justify-center space-x-3">
            <Users className="w-8 h-8 text-blue-600" />
            <h1 className="text-3xl font-bold text-gray-900">
              Usuários de Teste
            </h1>
          </div>
          <p className="text-gray-600 max-w-2xl mx-auto">
            Use estas credenciais para testar o sistema AIudex. Todos os
            usuários têm acesso completo às funcionalidades de demonstração.
          </p>
        </div>

        {/* Status atual */}
        <Card className="bg-gradient-to-r from-blue-50 to-purple-50 border-blue-200">
          <CardContent className="p-6">
            <div className="flex items-center justify-between">
              <div className="flex items-center space-x-3">
                {isAuthenticated ? (
                  <CheckCircle className="w-6 h-6 text-green-600" />
                ) : (
                  <AlertCircle className="w-6 h-6 text-orange-600" />
                )}
                <div>
                  <h3 className="font-semibold text-gray-900">
                    Status de Autenticação
                  </h3>
                  <p className="text-sm text-gray-600">
                    {isAuthenticated
                      ? `Logado como: ${user?.email}`
                      : "Não autenticado"}
                  </p>
                </div>
              </div>
              <div className="flex space-x-2">
                <Button
                  variant="outline"
                  size="sm"
                  onClick={debugLocalStorage}
                  className="flex items-center space-x-2">
                  <Bug className="w-4 h-4" />
                  <span>Debug Storage</span>
                </Button>
                {isAuthenticated ? (
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={handleLogout}
                    className="flex items-center space-x-2">
                    <RefreshCw className="w-4 h-4" />
                    <span>Logout</span>
                  </Button>
                ) : (
                  <Button
                    size="sm"
                    onClick={() => navigate("/login")}
                    className="flex items-center space-x-2">
                    <User className="w-4 h-4" />
                    <span>Ir para Login</span>
                  </Button>
                )}
              </div>
            </div>
          </CardContent>
        </Card>

        {/* Usuários de teste */}
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
          {testUsers.map((testUser) => (
            <Card
              key={testUser.id}
              className="hover:shadow-lg transition-shadow border-2 hover:border-blue-300">
              <CardHeader className="pb-3">
                <div className="flex items-center justify-between">
                  <div className="flex items-center space-x-3">
                    <div className="w-10 h-10 bg-blue-100 rounded-lg flex items-center justify-center">
                      <User className="w-5 h-5 text-blue-600" />
                    </div>
                    <div>
                      <CardTitle className="text-lg">{testUser.name}</CardTitle>
                      <p className="text-sm text-gray-500">{testUser.email}</p>
                    </div>
                  </div>
                  <Badge
                    variant={
                      testUser.role === "admin"
                        ? "default"
                        : testUser.role === "advogado"
                        ? "secondary"
                        : "outline"
                    }>
                    {testUser.role}
                  </Badge>
                </div>
              </CardHeader>
              <CardContent className="space-y-4">
                <div className="space-y-2">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">OAB:</span>
                    <span className="font-mono">{testUser.oabNumber}</span>
                  </div>
                  {testUser.firm && (
                    <div className="flex items-center justify-between text-sm">
                      <span className="text-gray-600">Escritório:</span>
                      <span className="text-right">{testUser.firm}</span>
                    </div>
                  )}
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-gray-600">Senha:</span>
                    <span className="font-mono">{testUser.password}</span>
                  </div>
                </div>

                <div className="flex space-x-2">
                  <Button
                    onClick={() =>
                      handleLogin(testUser.email, testUser.password)
                    }
                    disabled={isLoading === testUser.email}
                    className="flex-1"
                    size="sm">
                    {isLoading === testUser.email ? (
                      "Entrando..."
                    ) : (
                      <>
                        <User className="w-4 h-4 mr-2" />
                        Entrar
                      </>
                    )}
                  </Button>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() =>
                      copyToClipboard(
                        `${testUser.email}\n${testUser.password}`,
                        "Credenciais"
                      )
                    }>
                    <Copy className="w-4 h-4" />
                  </Button>
                </div>
              </CardContent>
            </Card>
          ))}
        </div>

        {/* Credenciais rápidas */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center space-x-2">
              <Key className="w-5 h-5" />
              <span>Credenciais Rápidas</span>
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
              {Object.entries(testCredentials).map(([key, creds]) => (
                <div
                  key={key}
                  className="p-3 border rounded-lg hover:bg-gray-50 cursor-pointer"
                  onClick={() => handleLogin(creds.email, creds.password)}>
                  <div className="font-medium text-sm capitalize">
                    {key.replace(/([A-Z])/g, " $1").trim()}
                  </div>
                  <div className="text-xs text-gray-500 mt-1">
                    {creds.email}
                  </div>
                </div>
              ))}
            </div>
          </CardContent>
        </Card>

        {/* Instruções */}
        <Card className="bg-gradient-to-r from-green-50 to-blue-50 border-green-200">
          <CardContent className="p-6">
            <h3 className="font-semibold text-gray-900 mb-3">
              Como usar os usuários de teste:
            </h3>
            <div className="space-y-2 text-sm text-gray-600">
              <p>• Clique em "Entrar" para fazer login automático</p>
              <p>• Use "Copiar" para copiar as credenciais</p>
              <p>• Todos os usuários têm acesso completo ao sistema</p>
              <p>• Os dados são resetados ao recarregar a página</p>
              <p>• Use "Debug Storage" para verificar o localStorage</p>
            </div>
          </CardContent>
        </Card>
      </div>
    </div>
  );
};

export default TestUsersDemo;
