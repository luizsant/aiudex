"use client";

import React, { useState, useEffect } from "react";
import { useAuth } from "@/contexts/AuthContext";
import { Button } from "@/components/ui/button";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Badge } from "@/components/ui/badge";

export const SessionTest = () => {
  const { user, isAuthenticated, isInitialized, isLoading, logout } = useAuth();

  const handleRefresh = () => {
    window.location.reload();
  };

  const handleClearStorage = () => {
    localStorage.removeItem("legalai_user");
    localStorage.removeItem("legalai_current_user");
    window.location.reload();
  };

  const handleDebug = () => {
    if ((window as any).debugAuth) {
      (window as any).debugAuth();
    }
  };

  return (
    <Card className="w-full max-w-md mx-auto">
      <CardHeader>
        <CardTitle>🧪 Teste de Sessão</CardTitle>
        <CardDescription>
          Teste a persistência da autenticação após refresh
        </CardDescription>
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
              <strong>OAB:</strong> {user.oabNumber}
            </p>
            {user.lastLogin && (
              <p className="text-sm text-muted-foreground">
                <strong>Último Login:</strong>{" "}
                {new Date(user.lastLogin).toLocaleString()}
              </p>
            )}
          </div>
        )}

        <div className="flex flex-col gap-2">
          <Button onClick={handleRefresh} variant="outline">
            🔄 Testar Refresh (F5)
          </Button>

          <Button onClick={handleClearStorage} variant="destructive">
            🗑️ Limpar Storage
          </Button>

          <Button onClick={handleDebug} variant="secondary">
            🐛 Debug Auth
          </Button>

          {isAuthenticated && (
            <Button onClick={logout} variant="outline">
              🚪 Logout
            </Button>
          )}
        </div>

        <div className="text-xs text-muted-foreground">
          <p>💡 Dica: Pressione F5 para testar se a sessão persiste</p>
          <p>🔍 Abra o console para ver logs detalhados</p>
        </div>
      </CardContent>
    </Card>
  );
};
