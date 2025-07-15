import React, { useState } from "react";
import {
  Card,
  CardContent,
  CardDescription,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { ScrollArea } from "@/components/ui/scroll-area";
import { Separator } from "@/components/ui/separator";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Bell,
  BellRing,
  X,
  Check,
  CheckCheck,
  Trash2,
  Filter,
  Users,
  DollarSign,
  AlertTriangle,
  Shield,
  Activity,
  Info,
  ExternalLink,
  Settings,
} from "lucide-react";
import { useAdminNotifications } from "@/lib/admin-notifications";
import { cn } from "@/lib/utils";

interface AdminNotification {
  id: string;
  title: string;
  message: string;
  type: "info" | "success" | "warning" | "error";
  category: string;
  priority: "low" | "medium" | "high" | "critical";
  read: boolean;
  timestamp: Date;
  actionLabel?: string;
  actionUrl?: string;
  metadata?: Record<string, any>;
}

interface NotificationCenterProps {
  className?: string;
}

const getNotificationIcon = (category: string) => {
  switch (category) {
    case "user":
      return <Users className="h-4 w-4" />;
    case "financial":
      return <DollarSign className="h-4 w-4" />;
    case "system":
      return <Activity className="h-4 w-4" />;
    case "security":
      return <Shield className="h-4 w-4" />;
    case "performance":
      return <AlertTriangle className="h-4 w-4" />;
    default:
      return <Info className="h-4 w-4" />;
  }
};

const getNotificationColor = (type: string, priority: string) => {
  if (priority === "critical") return "text-red-600 bg-red-50";
  if (priority === "high") return "text-orange-600 bg-orange-50";

  switch (type) {
    case "success":
      return "text-green-600 bg-green-50";
    case "warning":
      return "text-yellow-600 bg-yellow-50";
    case "error":
      return "text-red-600 bg-red-50";
    default:
      return "text-blue-600 bg-blue-50";
  }
};

const getPriorityBadge = (priority: string) => {
  switch (priority) {
    case "critical":
      return (
        <Badge variant="destructive" className="text-xs">
          Crítico
        </Badge>
      );
    case "high":
      return (
        <Badge
          variant="secondary"
          className="text-xs bg-orange-100 text-orange-800">
          Alto
        </Badge>
      );
    case "medium":
      return (
        <Badge variant="secondary" className="text-xs">
          Médio
        </Badge>
      );
    case "low":
      return (
        <Badge variant="outline" className="text-xs">
          Baixo
        </Badge>
      );
    default:
      return null;
  }
};

const formatRelativeTime = (date: Date) => {
  const now = new Date();
  const diff = now.getTime() - date.getTime();

  const minutes = Math.floor(diff / (1000 * 60));
  const hours = Math.floor(diff / (1000 * 60 * 60));
  const days = Math.floor(diff / (1000 * 60 * 60 * 24));

  if (minutes < 1) return "agora";
  if (minutes < 60) return `${minutes}m atrás`;
  if (hours < 24) return `${hours}h atrás`;
  return `${days}d atrás`;
};

interface NotificationItemProps {
  notification: AdminNotification;
  markAsRead: (id: string) => void;
  removeNotification: (id: string) => void;
}

const NotificationItem: React.FC<NotificationItemProps> = ({
  notification,
  markAsRead,
  removeNotification,
}) => (
  <div
    className={cn(
      "p-3 border rounded-lg transition-all relative",
      !notification.read && "bg-blue-50 border-blue-200",
      notification.read && "bg-white border-gray-200"
    )}>
    <div className="flex items-start gap-3">
      <div
        className={cn(
          "p-2 rounded-full",
          getNotificationColor(notification.type, notification.priority)
        )}>
        {getNotificationIcon(notification.category)}
      </div>

      <div className="flex-1 min-w-0">
        <div className="flex items-center gap-2 mb-1">
          <h4 className="text-sm font-medium text-gray-900 truncate">
            {notification.title}
          </h4>
          {getPriorityBadge(notification.priority)}
          {!notification.read && (
            <div className="w-2 h-2 bg-blue-500 rounded-full flex-shrink-0" />
          )}
        </div>

        <p className="text-sm text-gray-600 mb-2">{notification.message}</p>

        <div className="flex items-center justify-between">
          <span className="text-xs text-gray-500">
            {formatRelativeTime(notification.timestamp)}
          </span>

          <div className="flex items-center gap-1">
            {notification.actionLabel && (
              <Button
                variant="ghost"
                size="sm"
                className="text-xs h-6 px-2 hover:bg-blue-100"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🟢 [BOTÃO] Ver Dashboard:", notification.id);
                  if (!notification.read) {
                    markAsRead(notification.id);
                  }
                  if (notification.actionUrl) {
                    const sectionHash = notification.actionUrl.replace("#", "");
                    const sections = [
                      "gestao",
                      "comercial",
                      "marketing",
                      "relatorios",
                      "operacoes",
                      "seguranca",
                      "ia",
                    ];
                    if (sections.includes(sectionHash)) {
                      window.dispatchEvent(
                        new CustomEvent("admin-navigate", {
                          detail: { section: sectionHash },
                        })
                      );
                    }
                  }
                }}>
                {notification.actionLabel}
                <ExternalLink className="h-3 w-3 ml-1" />
              </Button>
            )}

            {!notification.read && (
              <Button
                variant="ghost"
                size="sm"
                className="h-6 w-6 p-0 hover:bg-green-100"
                title="Marcar como lida"
                onClick={(e) => {
                  e.preventDefault();
                  e.stopPropagation();
                  console.log("🔵 [BOTÃO] Marcar como lida:", notification.id);
                  markAsRead(notification.id);
                }}>
                <Check className="h-3 w-3" />
              </Button>
            )}

            <Button
              variant="ghost"
              size="sm"
              className="h-6 w-6 p-0 hover:bg-red-100"
              title="Remover notificação"
              onClick={(e) => {
                e.preventDefault();
                e.stopPropagation();
                console.log("🔴 [BOTÃO] Remover notificação:", notification.id);
                removeNotification(notification.id);
              }}>
              <X className="h-3 w-3" />
            </Button>
          </div>
        </div>
      </div>
    </div>
  </div>
);

export const NotificationCenter: React.FC<NotificationCenterProps> = ({
  className,
}) => {
  const {
    notifications,
    stats,
    markAsRead,
    markAllAsRead,
    removeNotification,
    clearAll,
    simulateNotifications,
  } = useAdminNotifications();

  const [filter, setFilter] = useState<string>("all");
  const [isOpen, setIsOpen] = useState(false);

  const filteredNotifications = notifications.filter((notification) => {
    if (filter === "all") return true;
    if (filter === "unread") return !notification.read;
    return notification.category === filter;
  });

  const handleNotificationClick = (notification: AdminNotification) => {
    console.log("🎯 handleNotificationClick chamado para:", notification.id);
    console.log("🎯 Notificação:", notification);

    if (!notification.read) {
      console.log("📖 Marcando como lida...");
      markAsRead(notification.id);
    }

    if (notification.actionUrl) {
      console.log("🔗 Action URL encontrada:", notification.actionUrl);

      // Fechar o popover primeiro
      setIsOpen(false);
      console.log("📱 Popover fechado");

      // Navegar para a seção
      const sectionHash = notification.actionUrl.replace("#", "");
      console.log("📍 Section hash:", sectionHash);

      const sections = [
        "gestao",
        "comercial",
        "marketing",
        "relatorios",
        "operacoes",
        "seguranca",
        "ia",
      ];

      if (sections.includes(sectionHash)) {
        console.log("✅ Seção válida, disparando evento...");
        // Disparar evento customizado para mudança de seção
        window.dispatchEvent(
          new CustomEvent("admin-navigate", {
            detail: { section: sectionHash },
          })
        );
        console.log(
          "🚀 Evento admin-navigate disparado para seção:",
          sectionHash
        );
      } else {
        console.log("❌ Seção inválida:", sectionHash);
      }
    } else {
      console.log("ℹ️ Nenhuma action URL encontrada");
    }
  };

  const handleMarkAsRead = (e: React.MouseEvent, notificationId: string) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔵 [BOTÃO] Marcar como lida:", notificationId);
    markAsRead(notificationId);
  };

  const handleRemoveNotification = (
    e: React.MouseEvent,
    notificationId: string
  ) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🔴 [BOTÃO] Remover notificação:", notificationId);
    removeNotification(notificationId);
  };

  const handleViewDashboard = (
    e: React.MouseEvent,
    notification: AdminNotification
  ) => {
    e.preventDefault();
    e.stopPropagation();
    console.log("🟢 [BOTÃO] Ver Dashboard:", notification.id);
    handleNotificationClick(notification);
  };

  return (
    <div className={cn("", className)}>
      <Popover open={isOpen} onOpenChange={setIsOpen}>
        <PopoverTrigger asChild>
          <Button
            variant="ghost"
            size="sm"
            className="relative p-2"
            title="Notificações">
            {stats.unread > 0 ? (
              <BellRing className="h-5 w-5" />
            ) : (
              <Bell className="h-5 w-5" />
            )}
            {stats.unread > 0 && (
              <Badge
                variant="destructive"
                className="absolute -top-1 -right-1 h-5 w-5 flex items-center justify-center p-0 text-xs">
                {stats.unread > 99 ? "99+" : stats.unread}
              </Badge>
            )}
          </Button>
        </PopoverTrigger>

        <PopoverContent className="w-96 p-0 z-50" align="end">
          <Card className="border-0 shadow-lg">
            <CardHeader className="pb-3">
              <div className="flex items-center justify-between">
                <div>
                  <CardTitle className="text-lg">Notificações</CardTitle>
                  <CardDescription>
                    {stats.unread > 0
                      ? `${stats.unread} não lida${
                          stats.unread !== 1 ? "s" : ""
                        } de ${stats.total}`
                      : `${stats.total} notificação${
                          stats.total !== 1 ? "ões" : ""
                        }`}
                  </CardDescription>
                </div>

                <div className="flex items-center gap-1">
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={() => {
                      console.log("🧪 Teste de clique no NotificationCenter");
                      alert("Clique funcionando! Verifique o console.");
                    }}
                    className="text-xs">
                    Teste
                  </Button>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Filter className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Filtrar por</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setFilter("all")}>
                        Todas
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter("unread")}>
                        Não lidas
                      </DropdownMenuItem>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem onClick={() => setFilter("user")}>
                        Usuários
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter("financial")}>
                        Financeiro
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter("system")}>
                        Sistema
                      </DropdownMenuItem>
                      <DropdownMenuItem onClick={() => setFilter("security")}>
                        Segurança
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => setFilter("performance")}>
                        Performance
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>

                  <DropdownMenu>
                    <DropdownMenuTrigger asChild>
                      <Button variant="ghost" size="sm">
                        <Settings className="h-4 w-4" />
                      </Button>
                    </DropdownMenuTrigger>
                    <DropdownMenuContent align="end">
                      <DropdownMenuLabel>Ações</DropdownMenuLabel>
                      <DropdownMenuSeparator />
                      <DropdownMenuItem
                        onClick={() => {
                          console.log("🔵 Marcar todas como lidas");
                          markAllAsRead();
                        }}>
                        <CheckCheck className="h-4 w-4 mr-2" />
                        Marcar todas como lidas
                      </DropdownMenuItem>
                      <DropdownMenuItem
                        onClick={() => {
                          console.log("🔴 Limpar todas");
                          clearAll();
                        }}
                        className="text-red-600">
                        <Trash2 className="h-4 w-4 mr-2" />
                        Limpar todas
                      </DropdownMenuItem>
                    </DropdownMenuContent>
                  </DropdownMenu>
                </div>
              </div>
            </CardHeader>

            <CardContent className="p-0">
              {filteredNotifications.length === 0 ? (
                <div className="p-6 text-center text-gray-500">
                  <Bell className="h-12 w-12 mx-auto mb-4 text-gray-300" />
                  <p className="text-sm">Nenhuma notificação encontrada</p>
                  {filter !== "all" && (
                    <Button
                      variant="link"
                      size="sm"
                      onClick={() => setFilter("all")}
                      className="text-xs mt-2">
                      Ver todas as notificações
                    </Button>
                  )}
                </div>
              ) : (
                <div className="max-h-96 overflow-y-auto">
                  <div className="space-y-2 p-4">
                    {filteredNotifications.map((notification) => (
                      <NotificationItem
                        key={notification.id}
                        notification={notification}
                        markAsRead={markAsRead}
                        removeNotification={removeNotification}
                      />
                    ))}
                  </div>
                </div>
              )}
            </CardContent>
          </Card>
        </PopoverContent>
      </Popover>
    </div>
  );
};

export const NotificationStats: React.FC<{ className?: string }> = ({
  className,
}) => {
  const { stats } = useAdminNotifications();

  if (stats.total === 0) return null;

  return (
    <div className={cn("grid grid-cols-2 md:grid-cols-4 gap-4", className)}>
      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Bell className="h-4 w-4 text-blue-600" />
            <div>
              <p className="text-sm font-medium">Total</p>
              <p className="text-2xl font-bold text-blue-600">{stats.total}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <BellRing className="h-4 w-4 text-orange-600" />
            <div>
              <p className="text-sm font-medium">Não lidas</p>
              <p className="text-2xl font-bold text-orange-600">
                {stats.unread}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <AlertTriangle className="h-4 w-4 text-red-600" />
            <div>
              <p className="text-sm font-medium">Críticas</p>
              <p className="text-2xl font-bold text-red-600">
                {stats.byPriority.critical || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>

      <Card>
        <CardContent className="p-4">
          <div className="flex items-center space-x-2">
            <Activity className="h-4 w-4 text-green-600" />
            <div>
              <p className="text-sm font-medium">Sistema</p>
              <p className="text-2xl font-bold text-green-600">
                {stats.byCategory.system || 0}
              </p>
            </div>
          </div>
        </CardContent>
      </Card>
    </div>
  );
};

export { NotificationItem };
