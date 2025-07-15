import { cn } from "@/lib/utils";
import { Loader2 } from "lucide-react";

interface LoadingProps {
  message?: string;
  size?: "sm" | "md" | "lg";
  className?: string;
}

export const Loading = ({
  message = "Carregando...",
  size = "md",
  className = "",
}: LoadingProps) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-8 h-8",
    lg: "w-12 h-12",
  };

  return (
    <div
      className={`flex flex-col items-center justify-center p-8 ${className}`}>
      <Loader2
        className={`${sizeClasses[size]} animate-spin text-blue-600 mb-4`}
      />
      <p className="text-gray-600 text-sm">{message}</p>
    </div>
  );
};

export const FullScreenLoading = ({
  message = "Inicializando sistema...",
}: {
  message?: string;
}) => {
  return (
    <div className="min-h-screen flex items-center justify-center bg-gray-50">
      <div className="text-center">
        <div className="w-16 h-16 border-4 border-blue-200 border-t-blue-600 rounded-full animate-spin mx-auto mb-4"></div>
        <h2 className="text-xl font-semibold text-gray-900 mb-2">AIudex</h2>
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export const PageLoading = ({
  message = "Carregando página...",
}: {
  message?: string;
}) => {
  return (
    <div className="min-h-[400px] flex items-center justify-center">
      <div className="text-center">
        <Loader2 className="w-8 h-8 animate-spin text-blue-600 mx-auto mb-4" />
        <p className="text-gray-600">{message}</p>
      </div>
    </div>
  );
};

export const LoadingSpinner = ({
  size = "md",
  className,
}: Omit<LoadingProps, "text" | "fullScreen">) => {
  const sizeClasses = {
    sm: "w-4 h-4",
    md: "w-6 h-6",
    lg: "w-8 h-8",
  };

  return (
    <Loader2
      className={cn("animate-spin text-primary", sizeClasses[size], className)}
    />
  );
};

export const LoadingSkeleton = ({ className }: { className?: string }) => {
  return <div className={cn("animate-pulse rounded-md bg-muted", className)} />;
};
