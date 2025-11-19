import React from "react";
import { createPortal } from "react-dom";
import { cn } from "../../lib/utils";
import { CloseIcon } from "../icons/CloseIcon";

interface DrawerProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Drawer = ({ isOpen, onClose, title, children }: DrawerProps) => {
  return createPortal(
    <>
      {/* Overlay */}
      <div
        className={cn(
          "fixed inset-0 z-40 bg-black/50 transition-opacity duration-300",
          isOpen ? "opacity-100" : "opacity-0 pointer-events-none"
        )}
        onClick={onClose}
      />

      {/* Painel Lateral */}
      <div
        className={cn(
          "fixed top-0 right-0 z-50 h-full w-80 bg-white dark:bg-gray-800 shadow-xl transform transition-transform duration-300 ease-in-out flex flex-col",
          isOpen ? "translate-x-0" : "translate-x-full"
        )}
      >
        {/* Cabeçalho */}
        <div className="flex items-center justify-between p-4 border-b dark:border-gray-700">
          <h2 className="text-lg font-semibold dark:text-white">{title}</h2>
          <button
            onClick={onClose}
            className="p-2 rounded-full text-gray-500 hover:bg-gray-100 dark:hover:bg-gray-700 transition-colors"
          >
            <CloseIcon size={20} />
          </button>
        </div>

        {/* Conteúdo */}
        <div className="flex-grow p-6 overflow-y-auto">{children}</div>
      </div>
    </>,
    document.body
  );
};

export default Drawer;
