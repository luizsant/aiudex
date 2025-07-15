import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { X } from "lucide-react";
import { COMMON_CLASSES } from "@/lib/theme-constants";

interface BaseModalProps {
  isOpen: boolean;
  onClose: () => void;
  title?: string;
  children: React.ReactNode;
  size?: "sm" | "md" | "lg" | "xl";
  showCloseButton?: boolean;
  className?: string;
}

const BaseModal: React.FC<BaseModalProps> = ({
  isOpen,
  onClose,
  title,
  children,
  size = "md",
  showCloseButton = true,
  className = "",
}) => {
  const sizeClasses = {
    sm: "w-[95vw] sm:w-full max-w-md",
    md: "w-[95vw] sm:w-full max-w-lg",
    lg: "w-[95vw] sm:w-full max-w-2xl",
    xl: "w-[95vw] sm:w-full max-w-4xl",
  };

  return (
    <Dialog open={isOpen} onOpenChange={onClose}>
      <DialogContent 
        className={`
          ${sizeClasses[size]} 
          max-h-[90vh] 
          overflow-y-auto 
          m-4 sm:m-6 
          p-4 sm:p-6 
          bg-white/95 
          backdrop-blur-sm 
          shadow-xl 
          border-0 
          rounded-xl 
          ${className}
        `}
      >
        {(title || showCloseButton) && (
          <DialogHeader className="flex flex-row items-center justify-between space-y-0 pb-4 border-b border-gray-200">
            {title && (
              <DialogTitle className="text-lg sm:text-xl font-semibold text-gray-900 pr-4">
                {title}
              </DialogTitle>
            )}
            {showCloseButton && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onClose}
                className="h-8 w-8 p-0 hover:bg-gray-100 rounded-lg transition-colors flex-shrink-0">
                <X className="h-4 w-4" />
              </Button>
            )}
          </DialogHeader>
        )}
        <div className="pt-4">
          {children}
        </div>
      </DialogContent>
    </Dialog>
  );
};

export default BaseModal;
