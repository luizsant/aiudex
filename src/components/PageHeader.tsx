import { ReactNode } from "react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Crown, Zap, Star } from "lucide-react";
import { SimpleTrophy } from "./SimpleTrophy";
import {
  Tooltip,
  TooltipTrigger,
  TooltipContent,
} from "@/components/ui/tooltip";
import { AchievementsService } from "@/lib/achievements-service";
import NotificationCenter from "./NotificationCenter";

interface PageHeaderProps {
  title: ReactNode;
  subtitle: string;
  icon: ReactNode;
  actions?: ReactNode;
  subscription?: {
    planId: string;
  };
  className?: string;
}

export const PageHeader = ({
  title,
  subtitle,
  icon,
  actions,
  subscription,
  className = "",
}: PageHeaderProps) => {
  return (
    <div
      className={`bg-gradient-to-r from-blue-600 to-green-600 p-4 md:p-6 ${className}`}>
      <div className="flex flex-col md:flex-row md:items-center md:justify-between text-white max-w-7xl mx-auto space-y-4 md:space-y-0">
        <div className="flex items-center space-x-4">
          {/* Notification Center como primeiro ícone à esquerda */}
          <div className="self-start md:self-auto">
            <NotificationCenter align="left" />
          </div>
          {/* Ícone da página */}
          <div className="w-10 h-10 md:w-12 md:h-12 bg-white/20 rounded-lg flex items-center justify-center">
            {icon}
          </div>
          <div>
            <h1 className="text-xl md:text-2xl font-bold">{title}</h1>
            <p className="text-sm md:text-base text-blue-100">{subtitle}</p>
          </div>
        </div>

        <div className="flex flex-col md:flex-row items-stretch md:items-center space-y-2 md:space-y-0 md:space-x-4">
          {subscription && (
            <Badge
              variant="secondary"
              className="bg-white/20 text-white self-start md:self-auto">
              {subscription.planId === "pro" ? (
                <Crown className="w-4 h-4 mr-1" />
              ) : subscription.planId === "basic" ? (
                <Zap className="w-4 h-4 mr-1" />
              ) : (
                <Star className="w-4 h-4 mr-1" />
              )}
              {subscription.planId.toUpperCase()}
            </Badge>
          )}
          {actions && <div className="flex space-x-2">{actions}</div>}
        </div>
      </div>
    </div>
  );
};
