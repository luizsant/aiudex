import { LucideIcon } from "lucide-react";
import { COMMON_CLASSES } from "@/lib/theme-constants";

interface StatusBadgeProps {
  icon?: LucideIcon;
  text: string;
  variant?: "success" | "warning" | "error" | "info" | "default";
  size?: "sm" | "md" | "lg";
  className?: string;
}

const StatusBadge: React.FC<StatusBadgeProps> = ({
  icon: Icon,
  text,
  variant = "default",
  size = "md",
  className = "",
}) => {
  const variantClasses = {
    success: "bg-green-100 text-green-700 border-green-200",
    warning: "bg-yellow-100 text-yellow-700 border-yellow-200",
    error: "bg-red-100 text-red-700 border-red-200",
    info: "bg-blue-100 text-blue-700 border-blue-200",
    default: "bg-gray-100 text-gray-700 border-gray-200",
  };

  const sizeClasses = {
    sm: "px-2 py-1 text-xs",
    md: "px-3 py-1 text-sm",
    lg: "px-4 py-2 text-base",
  };

  return (
    <span
      className={`inline-flex items-center border rounded-full font-medium ${variantClasses[variant]} ${sizeClasses[size]} ${className}`}>
      {Icon && <Icon className="w-3 h-3 mr-1" />}
      {text}
    </span>
  );
};

export default StatusBadge;
