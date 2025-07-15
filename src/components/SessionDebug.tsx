"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SessionDebug = () => {
  const { user, isAuthenticated, isInitialized, isLoading } = useAuth();

  const checkLocalStorage = () => {
    const token = localStorage.getItem("legalai_token");
    const storedUser = localStorage.getItem("legalai_user");

    console.log("🔍 Debug LocalStorage:");
    console.log("Token:", token ? "✅ Presente" : "❌ Ausente");
    console.log("User:", storedUser ? "✅ Presente" : "❌ Ausente");

    if (storedUser) {
      try {
        const parsed = JSON.parse(storedUser);
        console.log("User parsed:", parsed);
      } catch (e) {
        console.error("Erro ao parsear user:", e);
      }
    }
  };

  const testAuthEndpoint = async () => {
    const token = localStorage.getItem("legalai_token");
    if (!token) {
      console.log("❌ Nenhum token encontrado");
      return;
    }

    try {
      console.log("🔍 Testando endpoint /api/auth/me...");
      const response = await fetch("/api/auth/me", {
        headers: {
          Authorization: `Bearer ${token}`,
        },
      });

      console.log("Response status:", response.status);
      console.log("Response ok:", response.ok);

      if (response.ok) {
        const data = await response.json();
        console.log("✅ Resposta da API:", data);
      } else {
        const error = await response.text();
        console.log("❌ Erro da API:", error);
      }
    } catch (error) {
      console.error("❌ Erro na requisição:", error);
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🐛 Debug de Sessão</CardTitle>
      </CardHeader>
      <CardContent className="space-y-4">
        <div className="space-y-2">
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Status:</span>
            <Badge variant={isAuthenticated ? "default" : "destructive"}>
              {isAuthenticated ? "Logado" : "Deslogado"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Inicializado:</span>
            <Badge variant={isInitialized ? "default" : "secondary"}>
              {isInitialized ? "Sim" : "Não"}
            </Badge>
          </div>

          <div className="flex items-center gap-2">
            <span className="text-sm font-medium">Carregando:</span>
            <Badge variant={isLoading ? "default" : "secondary"}>
              {isLoading ? "Sim" : "Não"}
            </Badge>
          </div>
        </div>

        {user && (
          <div className="p-3 bg-muted rounded-lg">
            <h4 className="font-medium mb-2">Usuário Atual:</h4>
            <p className="text-sm text-muted-foreground">
              <strong>Nome:</strong> {user.name}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>Email:</strong> {user.email}
            </p>
            <p className="text-sm text-muted-foreground">
              <strong>ID:</strong> {user.id}
            </p>
          </div>
        )}

        <div className="space-y-2">
          <Button onClick={checkLocalStorage} variant="outline" size="sm">
            🔍 Verificar LocalStorage
          </Button>

          <Button onClick={testAuthEndpoint} variant="outline" size="sm">
            🌐 Testar API /me
          </Button>

          <Button
            onClick={() => window.location.reload()}
            variant="outline"
            size="sm">
            🔄 Refresh (F5)
          </Button>
        </div>

        <div className="text-xs text-muted-foreground">
          <p>💡 Abra o console para ver logs detalhados</p>
        </div>
      </CardContent>
    </Card>
  );
};
