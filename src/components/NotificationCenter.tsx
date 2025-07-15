"use client";

import React, { useState, useEffect } from "react";
import {
  Bell,
  X,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  RefreshCw,
  CheckCircle,
} from "lucide-react";
import { Button } from "./ui/button";
import { Badge } from "./ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "./ui/card";
import { ScrollArea } from "./ui/scroll-area";
import { Separator } from "./ui/separator";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "./ui/tabs";
import { toast } from "./ui/use-toast";
import { cn } from "../lib/utils";
import { useAuth } from "@/contexts/AuthContext";

interface Notification {
  id: string;
  title: string;
  message: string;
  type: "INFO" | "SUCCESS" | "WARNING" | "ERROR";
  category: string;
  read: boolean;
  createdAt: string;
  readAt?: string;
  metadata?: Record<string, any>;
}

interface NotificationStats {
  total: number;
  unread: number;
  read: number;
  byType: Record<string, number>;
  byCategory: Record<string, number>;
}

interface NotificationCenterProps {
  align?: "left" | "right";
}

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  align = "right",
}) => {
  const [notifications, setNotifications] = useState<Notification[]>([]);
  const [stats, setStats] = useState<NotificationStats | null>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [loading, setLoading] = useState(false);
  const [activeTab, setActiveTab] = useState("all");
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const { user, isAuthenticated } = useAuth();

  // Carregar notificações
  const loadNotifications = async (reset = false) => {
    if (!isAuthenticated || !user) {
      console.log("Usuário não autenticado");
      return;
    }

    try {
      setLoading(true);
      const currentPage = reset ? 1 : page;
      const unreadOnly = activeTab === "unread";

      // Usar dados mockados para desenvolvimento
      const mockNotifications = [
        {
          id: "1",
          title: "Bem-vindo ao AIudex!",
          message:
            "Sua conta foi criada com sucesso. Comece a usar nossas ferramentas jurídicas.",
          type: "SUCCESS" as const,
          category: "welcome",
          read: false,
          createdAt: new Date().toISOString(),
        },
        {
          id: "2",
          title: "Créditos disponíveis",
          message:
            "Você tem 100 créditos disponíveis para usar nas ferramentas.",
          type: "INFO" as const,
          category: "credits",
          read: true,
          createdAt: new Date(Date.now() - 86400000).toISOString(),
        },
      ];

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 500));

      if (reset) {
        setNotifications(mockNotifications);
        setPage(1);
      } else {
        setNotifications((prev) => [...prev, ...mockNotifications]);
      }

      setHasMore(false);
      if (!reset) setPage((prev) => prev + 1);
    } catch (error) {
      console.error("Erro ao carregar notificações:", error);
      toast({
        title: "Erro",
        description: "Não foi possível carregar as notificações.",
        variant: "destructive",
      });
    } finally {
      setLoading(false);
    }
  };

  // Carregar estatísticas
  const loadStats = async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      // Usar dados mockados para desenvolvimento
      const mockStats = {
        total: 2,
        unread: 1,
        read: 1,
        byType: { INFO: 1, SUCCESS: 1 },
        byCategory: { welcome: 1, credits: 1 },
      };

      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 300));

      setStats(mockStats);
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  // Marcar como lida
  const markAsRead = async (notificationId: string) => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 200));

      setNotifications((prev) =>
        prev.map((n) =>
          n.id === notificationId
            ? { ...n, read: true, readAt: new Date().toISOString() }
            : n
        )
      );

      // Atualizar estatísticas
      if (stats) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                unread: prev.unread - 1,
                read: prev.read + 1,
              }
            : null
        );
      }

      toast({
        title: "Sucesso",
        description: "Notificação marcada como lida.",
      });
    } catch (error) {
      console.error("Erro ao marcar como lida:", error);
      toast({
        title: "Erro",
        description: "Não foi possível marcar a notificação como lida.",
        variant: "destructive",
      });
    }
  };

  // Marcar todas como lidas
  const markAllAsRead = async () => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 300));

      setNotifications((prev) =>
        prev.map((n) => ({
          ...n,
          read: true,
          readAt: new Date().toISOString(),
        }))
      );

      if (stats) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                unread: 0,
                read: prev.total,
              }
            : null
        );
      }

      toast({
        title: "Sucesso",
        description: `${stats?.unread || 0} notificações marcadas como lidas.`,
      });
    } catch (error) {
      console.error("Erro ao marcar todas como lidas:", error);
      toast({
        title: "Erro",
        description:
          "Não foi possível marcar todas as notificações como lidas.",
        variant: "destructive",
      });
    }
  };

  // Deletar notificação
  const deleteNotification = async (notificationId: string) => {
    if (!isAuthenticated || !user) {
      return;
    }

    try {
      // Simular delay de API
      await new Promise((resolve) => setTimeout(resolve, 200));

      setNotifications((prev) => prev.filter((n) => n.id !== notificationId));

      if (stats) {
        setStats((prev) =>
          prev
            ? {
                ...prev,
                total: prev.total - 1,
                unread: prev.unread - (prev.unread > 0 ? 1 : 0),
              }
            : null
        );
      }

      toast({
        title: "Sucesso",
        description: "Notificação deletada com sucesso.",
      });
    } catch (error) {
      console.error("Erro ao deletar notificação:", error);
      toast({
        title: "Erro",
        description: "Não foi possível deletar a notificação.",
        variant: "destructive",
      });
    }
  };

  // Obter cor do tipo de notificação
  const getTypeColor = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "text-green-600 bg-green-50";
      case "WARNING":
        return "text-yellow-600 bg-yellow-50";
      case "ERROR":
        return "text-red-600 bg-red-50";
      default:
        return "text-blue-600 bg-blue-50";
    }
  };

  // Obter ícone do tipo
  const getTypeIcon = (type: string) => {
    switch (type) {
      case "SUCCESS":
        return "✅";
      case "WARNING":
        return "⚠️";
      case "ERROR":
        return "❌";
      default:
        return "ℹ️";
    }
  };

  // Formatear data
  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();
    const diffMs = now.getTime() - date.getTime();
    const diffHours = Math.floor(diffMs / (1000 * 60 * 60));
    const diffDays = Math.floor(diffHours / 24);

    if (diffHours < 1) return "Agora";
    if (diffHours < 24) return `${diffHours}h atrás`;
    if (diffDays < 7) return `${diffDays}d atrás`;
    return date.toLocaleDateString("pt-BR");
  };

  // Efeitos
  useEffect(() => {
    loadStats();
  }, []);

  useEffect(() => {
    if (isOpen) {
      loadNotifications(true);
    }
  }, [isOpen, activeTab]);

  // Polling para atualizações
  useEffect(() => {
    const interval = setInterval(() => {
      if (isOpen) {
        loadStats();
      }
    }, 30000); // 30 segundos

    return () => clearInterval(interval);
  }, [isOpen]);

  return (
    <div className="relative">
      {/* Botão de notificação */}
      <Button
        variant="ghost"
        size="sm"
        className="relative w-10 h-10 p-0 rounded-lg hover:bg-white/20 transition-all duration-200 text-white hover:text-white"
        onClick={() => setIsOpen(!isOpen)}>
        <Bell className="h-5 w-5" />
        {stats && stats.unread > 0 && (
          <Badge
            variant="destructive"
            className="absolute -top-1 -right-1 h-5 w-5 rounded-full p-0 text-xs font-bold bg-red-500 border-2 border-white shadow-lg">
            {stats.unread > 99 ? "99+" : stats.unread}
          </Badge>
        )}
      </Button>

      {/* Painel de notificações */}
      {isOpen && (
        <div
          className={`absolute ${
            align === "left" ? "left-0" : "right-0"
          } top-full mt-2 w-96 z-50`}>
          <Card className="shadow-xl border-0 bg-white dark:bg-gray-900 rounded-xl overflow-hidden">
            <CardHeader className="pb-3 bg-gradient-to-r from-blue-50 to-green-50 dark:from-blue-900/20 dark:to-green-900/20">
              <div className="flex items-center justify-between">
                <CardTitle className="text-lg text-gray-900 dark:text-white">
                  Notificações
                </CardTitle>
                <div className="flex items-center gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => loadNotifications(true)}
                    disabled={loading}
                    className="hover:bg-white/50 dark:hover:bg-gray-800/50">
                    <RefreshCw
                      className={cn("h-4 w-4", loading && "animate-spin")}
                    />
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={() => setIsOpen(false)}
                    className="hover:bg-white/50 dark:hover:bg-gray-800/50">
                    <X className="h-4 w-4" />
                  </Button>
                </div>
              </div>

              {stats && (
                <div className="flex items-center gap-4 text-sm text-gray-600 dark:text-gray-400">
                  <span>Total: {stats.total}</span>
                  <span>Não lidas: {stats.unread}</span>
                  {stats.unread > 0 && (
                    <Button
                      variant="ghost"
                      size="sm"
                      onClick={markAllAsRead}
                      className="text-xs p-1 h-auto hover:bg-white/50 dark:hover:bg-gray-800/50">
                      <CheckCheck className="h-3 w-3 mr-1" />
                      Marcar todas
                    </Button>
                  )}
                </div>
              )}
            </CardHeader>

            <CardContent className="p-0">
              <Tabs value={activeTab} onValueChange={setActiveTab}>
                <TabsList className="w-full bg-gray-50 dark:bg-gray-800">
                  <TabsTrigger
                    value="all"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                    Todas
                  </TabsTrigger>
                  <TabsTrigger
                    value="unread"
                    className="data-[state=active]:bg-white dark:data-[state=active]:bg-gray-700">
                    Não lidas
                    {stats && stats.unread > 0 && (
                      <Badge
                        variant="secondary"
                        className="ml-1 bg-blue-500 text-white">
                        {stats.unread}
                      </Badge>
                    )}
                  </TabsTrigger>
                </TabsList>

                <TabsContent value="all" className="m-0">
                  <ScrollArea className="h-96">
                    {notifications.length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <Bell className="h-12 w-12 mx-auto mb-3 text-gray-300 dark:text-gray-600" />
                        <p className="text-sm">
                          Nenhuma notificação encontrada
                        </p>
                      </div>
                    ) : (
                      notifications.map((notification, index) => (
                        <div key={notification.id}>
                          <div
                            className={cn(
                              "p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors",
                              !notification.read &&
                                "bg-blue-50 dark:bg-blue-900/20"
                            )}>
                            <div className="flex items-start justify-between gap-3">
                              <div className="flex-1 min-w-0">
                                <div className="flex items-center gap-2 mb-1">
                                  <span className="text-sm">
                                    {getTypeIcon(notification.type)}
                                  </span>
                                  <h4 className="font-medium text-sm truncate text-gray-900 dark:text-white">
                                    {notification.title}
                                  </h4>
                                  {!notification.read && (
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                  )}
                                </div>
                                <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                  {notification.message}
                                </p>
                                <div className="flex items-center justify-between">
                                  <span className="text-xs text-gray-400 dark:text-gray-500">
                                    {formatDate(notification.createdAt)}
                                  </span>
                                  <div className="flex items-center gap-1">
                                    {!notification.read && (
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          markAsRead(notification.id)
                                        }
                                        className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/30">
                                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                                      </Button>
                                    )}
                                    <Button
                                      variant="ghost"
                                      size="sm"
                                      onClick={() =>
                                        deleteNotification(notification.id)
                                      }
                                      className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30">
                                      <Trash2 className="h-3 w-3" />
                                    </Button>
                                  </div>
                                </div>
                              </div>
                            </div>
                          </div>
                          {index < notifications.length - 1 && <Separator />}
                        </div>
                      ))
                    )}

                    {hasMore && (
                      <div className="p-4 text-center">
                        <Button
                          variant="ghost"
                          size="sm"
                          onClick={() => loadNotifications()}
                          disabled={loading}
                          className="hover:bg-gray-100 dark:hover:bg-gray-800">
                          {loading ? "Carregando..." : "Carregar mais"}
                        </Button>
                      </div>
                    )}
                  </ScrollArea>
                </TabsContent>

                <TabsContent value="unread" className="m-0">
                  <ScrollArea className="h-96">
                    {notifications.filter((n) => !n.read).length === 0 ? (
                      <div className="p-8 text-center text-gray-500 dark:text-gray-400">
                        <CheckCircle className="h-12 w-12 mx-auto mb-3 text-green-300 dark:text-green-600" />
                        <p className="text-sm">Nenhuma notificação não lida</p>
                      </div>
                    ) : (
                      notifications
                        .filter((n) => !n.read)
                        .map((notification, index) => (
                          <div key={notification.id}>
                            <div className="p-4 hover:bg-gray-50 dark:hover:bg-gray-800/50 transition-colors bg-blue-50 dark:bg-blue-900/20">
                              <div className="flex items-start justify-between gap-3">
                                <div className="flex-1 min-w-0">
                                  <div className="flex items-center gap-2 mb-1">
                                    <span className="text-sm">
                                      {getTypeIcon(notification.type)}
                                    </span>
                                    <h4 className="font-medium text-sm truncate text-gray-900 dark:text-white">
                                      {notification.title}
                                    </h4>
                                    <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
                                  </div>
                                  <p className="text-sm text-gray-600 dark:text-gray-400 mb-2">
                                    {notification.message}
                                  </p>
                                  <div className="flex items-center justify-between">
                                    <span className="text-xs text-gray-400 dark:text-gray-500">
                                      {formatDate(notification.createdAt)}
                                    </span>
                                    <div className="flex items-center gap-1">
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          markAsRead(notification.id)
                                        }
                                        className="h-6 w-6 p-0 hover:bg-green-100 dark:hover:bg-green-900/30">
                                        <Check className="h-3 w-3 text-green-600 dark:text-green-400" />
                                      </Button>
                                      <Button
                                        variant="ghost"
                                        size="sm"
                                        onClick={() =>
                                          deleteNotification(notification.id)
                                        }
                                        className="h-6 w-6 p-0 text-red-500 hover:text-red-700 hover:bg-red-100 dark:hover:bg-red-900/30">
                                        <Trash2 className="h-3 w-3" />
                                      </Button>
                                    </div>
                                  </div>
                                </div>
                              </div>
                            </div>
                            {index <
                              notifications.filter((n) => !n.read).length -
                                1 && <Separator />}
                          </div>
                        ))
                    )}
                  </ScrollArea>
                </TabsContent>
              </Tabs>
            </CardContent>
          </Card>
        </div>
      )}
    </div>
  );
};

// Hook para usar notificações
export const useNotifications = () => {
  const [stats, setStats] = useState<NotificationStats | null>(null);

  const loadStats = async () => {
    try {
      const response = await fetch("/api/notifications/stats", {
        headers: {
          Authorization: `Bearer ${localStorage.getItem("token")}`,
        },
      });

      if (response.ok) {
        const data = await response.json();
        setStats(data.data);
      }
    } catch (error) {
      console.error("Erro ao carregar estatísticas:", error);
    }
  };

  useEffect(() => {
    loadStats();

    // Polling
    const interval = setInterval(loadStats, 30000);
    return () => clearInterval(interval);
  }, []);

  return { stats, loadStats };
};

export default NotificationCenter;
