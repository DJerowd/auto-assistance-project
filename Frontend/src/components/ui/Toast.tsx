import { useEffect, useState } from "react";
import { useToastStore, type Toast as ToastType } from "../../store/toastStore";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";
import { XCircleIcon } from "../icons/XCircleIcon";
import { InfoIcon } from "../icons/InfoIcon";
import { WarningIcon } from "../icons/WarningIcon";
import { CloseIcon } from "../icons/CloseIcon";
import { cn } from "../../lib/utils";

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-success" />,
  error: <XCircleIcon className="w-6 h-6 text-destructive" />,
  warning: <WarningIcon className="w-6 h-6 text-warning" />,
  info: <InfoIcon className="w-6 h-6 text-info" />
};

const styles = {
  success: "border-l-success",
  error: "border-l-destructive",
  warning: "border-l-warning",
  info: "border-l-info"
};

interface ToastProps {
  toast: ToastType;
}

export const Toast = ({ toast }: ToastProps) => {
  const removeToast = useToastStore((state) => state.removeToast);
  const [isClosing, setIsClosing] = useState(false);

  const handleClose = () => {
    setIsClosing(true);
    setTimeout(() => {
      removeToast(toast.id);
    }, 300);
  };

  useEffect(() => {
    const timer = setTimeout(() => {
      handleClose();
    }, toast.duration || 4000);
    return () => clearTimeout(timer);
  }, [toast.id, toast.duration]);

  return (
    <div
      className={cn(
        "flex items-center w-full max-w-xs p-4 mb-2 bg-background text-foreground rounded-lg shadow-lg border border-input border-l-4 transform transition-all duration-300 ease-in-out hover:scale-105",
        styles[toast.type],
        isClosing ? "animate-slide-out" : "animate-slide-in"
      )}
      role="alert"
      onAnimationEnd={() => {
        if (isClosing) {
          removeToast(toast.id);
        }
      }}
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {icons[toast.type]}
      </div>
      <div className="ml-3 text-sm font-normal break-words flex-1">
        {toast.message}
      </div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-foreground/50 hover:text-foreground rounded-lg focus:ring-2 focus:ring-ring p-1.5 hover:bg-accent inline-flex items-center justify-center h-8 w-8 transition-colors"
        onClick={handleClose}
        aria-label="Fechar"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
};
