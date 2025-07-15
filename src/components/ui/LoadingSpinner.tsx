import { Loader2 } from "lucide-react";
import { COMMON_CLASSES } from "@/lib/theme-constants";

interface LoadingSpinnerProps {
  size?: "sm" | "md" | "lg";
  color?: "blue" | "green" | "white" | "gray";
  text?: string;
  className?: string;
}

const LoadingSpinner: React.FC<LoadingSpinnerProps> = ({
  size = "md",
  color = "blue",
  text,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  const colorClasses = {
    blue: "text-blue-600",
    green: "text-green-600",
    white: "text-white",
    gray: "text-gray-600",
  };

  return (
    <div className={`flex items-center justify-center ${className}`}>
      <div className="flex flex-col items-center space-y-2">
        <Loader2
          className={`${sizeClasses[size]} ${colorClasses[color]} animate-spin`}
        />
        {text && (
          <p className={`text-sm ${colorClasses[color]} text-center`}>{text}</p>
        )}
      </div>
    </div>
  );
};

export default LoadingSpinner;
