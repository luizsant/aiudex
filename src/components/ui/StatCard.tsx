import { Card, CardContent } from "@/components/ui/card";
import { LucideIcon } from "lucide-react";
import { COMMON_CLASSES, GRADIENTS } from "@/lib/theme-constants";

interface StatCardProps {
  icon: LucideIcon;
  number: string;
  label: string;
  description?: string;
  color?: "blue" | "green" | "purple" | "orange" | "red";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StatCard: React.FC<StatCardProps> = ({
  icon: Icon,
  number,
  label,
  description,
  color = "blue",
  size = "md",
  className = "",
}) => {
  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    purple: "text-purple-600",
    orange: "text-orange-600",
    red: "text-red-600",
  };

  const sizeClasses = {
    sm: {
      container: "w-12 h-12",
      icon: "w-6 h-6",
      number: "text-2xl",
      label: "text-sm",
      description: "text-xs",
    },
    md: {
      container: "w-16 h-16",
      icon: "w-8 h-8",
      number: "text-3xl",
      label: "text-lg",
      description: "text-sm",
    },
    lg: {
      container: "w-20 h-20",
      icon: "w-10 h-10",
      number: "text-4xl",
      label: "text-xl",
      description: "text-base",
    },
  };

  const currentSize = sizeClasses[size];

  return (
    <Card className={`${COMMON_CLASSES.CARD_BASE} text-center ${className}`}>
      <CardContent className="p-8">
        <div
          className={`${currentSize.container} ${GRADIENTS.ICON_PRIMARY} rounded-2xl flex items-center justify-center mx-auto mb-6`}>
          <Icon className={`${currentSize.icon} ${colorClasses[color]}`} />
        </div>
        <div
          className={`${currentSize.number} font-bold ${colorClasses[color]} mb-2`}>
          {number}
        </div>
        <h3 className={`${currentSize.label} font-bold text-gray-900 mb-2`}>
          {label}
        </h3>
        {description && (
          <p className={`${currentSize.description} text-gray-600`}>
            {description}
          </p>
        )}
      </CardContent>
    </Card>
  );
};

export default StatCard;
