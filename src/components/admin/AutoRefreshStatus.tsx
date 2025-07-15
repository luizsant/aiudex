import React from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { RefreshCw, Play, Pause, Clock, CheckCircle } from "lucide-react";
import { cn } from "@/lib/utils";

interface AutoRefreshStatusProps {
  isRefreshing: boolean;
  lastRefresh: Date | null;
  isEnabled: boolean;
  onToggle: () => void;
  onManualRefresh: () => void;
  className?: string;
}

export const AutoRefreshStatus: React.FC<AutoRefreshStatusProps> = ({
  isRefreshing,
  lastRefresh,
  isEnabled,
  onToggle,
  onManualRefresh,
  className,
}) => {
  const formatLastRefresh = (date: Date | null) => {
    if (!date) return "Nunca";

    const now = new Date();
    const diffInSeconds = Math.floor((now.getTime() - date.getTime()) / 1000);

    if (diffInSeconds < 60) {
      return `${diffInSeconds}s atrás`;
    } else if (diffInSeconds < 3600) {
      const minutes = Math.floor(diffInSeconds / 60);
      return `${minutes}m atrás`;
    } else {
      return date.toLocaleTimeString("pt-BR", {
        hour: "2-digit",
        minute: "2-digit",
      });
    }
  };

  return (
    <div className={cn("flex items-center gap-3", className)}>
      {/* Status Badge */}
      <Badge
        variant={isEnabled ? "default" : "secondary"}
        className={cn(
          "flex items-center gap-1 px-2 py-1",
          isEnabled
            ? "bg-green-100 text-green-800"
            : "bg-gray-100 text-gray-600"
        )}>
        {isRefreshing ? (
          <>
            <RefreshCw className="h-3 w-3 animate-spin" />
            Atualizando...
          </>
        ) : isEnabled ? (
          <>
            <CheckCircle className="h-3 w-3" />
            Auto-refresh ativo
          </>
        ) : (
          <>
            <Pause className="h-3 w-3" />
            Auto-refresh pausado
          </>
        )}
      </Badge>

      {/* Última atualização */}
      <div className="flex items-center gap-1 text-xs text-gray-500">
        <Clock className="h-3 w-3" />
        <span>Última: {formatLastRefresh(lastRefresh)}</span>
      </div>

      {/* Controles */}
      <div className="flex items-center gap-1">
        <Button
          variant="outline"
          size="sm"
          onClick={onToggle}
          className="h-7 px-2 text-xs">
          {isEnabled ? (
            <>
              <Pause className="h-3 w-3 mr-1" />
              Pausar
            </>
          ) : (
            <>
              <Play className="h-3 w-3 mr-1" />
              Iniciar
            </>
          )}
        </Button>

        <Button
          variant="outline"
          size="sm"
          onClick={onManualRefresh}
          disabled={isRefreshing}
          className="h-7 px-2 text-xs">
          <RefreshCw
            className={cn("h-3 w-3", isRefreshing && "animate-spin")}
          />
        </Button>
      </div>
    </div>
  );
};
