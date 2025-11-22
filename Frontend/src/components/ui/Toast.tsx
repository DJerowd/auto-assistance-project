import { useEffect } from "react";
import { useToastStore, type Toast as ToastType } from "../../store/toastStore";
import { CheckCircleIcon } from "../icons/CheckCircleIcon";
import { XCircleIcon } from "../icons/XCircleIcon";
import { InfoIcon } from '../icons/InfoIcon';
import { WarningIcon } from '../icons/WarningIcon';
import { CloseIcon } from "../icons/CloseIcon";

const icons = {
  success: <CheckCircleIcon className="w-6 h-6 text-green-500" />,
  error: <XCircleIcon className="w-6 h-6 text-red-500" />,
  info: <InfoIcon className="w-6 h-6 text-blue-500" />,
  warning: <WarningIcon className="w-6 h-6 text-yellow-500" />
};

const styles = {
  success:
    "border-green-500 bg-green-50 dark:bg-green-900 text-green-800 dark:text-green-200",
  error:
    "border-red-500 bg-red-50 dark:bg-red-900 text-red-800 dark:text-red-200",
  info: "border-blue-500 bg-blue-50 dark:bg-blue-900 text-blue-800 dark:text-blue-200",
  warning:
    "border-yellow-500 bg-yellow-50 dark:bg-yellow-900 text-yellow-800 dark:text-yellow-200",
};

interface ToastProps {
  toast: ToastType;
}

export const Toast = ({ toast }: ToastProps) => {
  const removeToast = useToastStore((state) => state.removeToast);

  useEffect(() => {
    const timer = setTimeout(() => {
      removeToast(toast.id);
    }, toast.duration || 4000);

    return () => clearTimeout(timer);
  }, [toast.id, toast.duration, removeToast]);

  return (
    <div
      className={`flex items-center w-full max-w-xs p-4 mb-2 text-gray-500 bg-gray-200 rounded-lg shadow-lg dark:text-gray-400 dark:bg-gray-800 border-l-4 transform transition-all duration-300 ease-in-out hover:scale-105 animate-slide-in ${
        styles[toast.type]
      }`}
      role="alert"
    >
      <div className="inline-flex items-center justify-center flex-shrink-0 w-8 h-8">
        {icons[toast.type]}
      </div>
      <div className="ml-3 text-sm font-normal break-words flex-1">
        {toast.message}
      </div>
      <button
        type="button"
        className="ml-auto -mx-1.5 -my-1.5 bg-transparent text-gray-400 hover:text-gray-900 rounded-lg focus:ring-2 focus:ring-gray-300 p-1.5 hover:bg-gray-100 inline-flex h-8 w-8 dark:text-gray-500 dark:hover:text-white dark:hover:bg-gray-700 transition-colors"
        onClick={() => removeToast(toast.id)}
        aria-label="Fechar"
      >
        <CloseIcon size={16} />
      </button>
    </div>
  );
};
