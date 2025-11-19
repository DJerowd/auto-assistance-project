import React from "react";
import * as Dialog from "@radix-ui/react-dialog";
import { cn } from "../../../lib/utils";
import { CloseIcon } from "../../icons/CloseIcon";

interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  title: string;
  children: React.ReactNode;
}

const Modal = ({ isOpen, onClose, title, children }: ModalProps) => {
  if (!isOpen) return null;

  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay className="fixed inset-0 z-50 bg-black/50 data-[state=open]:animate-overlay-show" />

        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%]",
            "rounded-lg border bg-white shadow-lg dark:bg-gray-800 dark:border-gray-700",
            "data-[state=open]:animate-content-show focus:outline-none",
            "max-h-[90vh] flex flex-col"
          )}
        >
          <div className="flex justify-between items-center p-4 border-b dark:border-gray-700 flex-shrink-0">
            <Dialog.Title className="text-lg font-bold dark:text-white">
              {title}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                className="p-1 rounded-full hover:bg-gray-100 dark:hover:bg-gray-700 focus:outline-none focus:ring-2 focus:ring-indigo-500"
                aria-label="Fechar"
              >
                <CloseIcon
                  size={20}
                  className="text-gray-600 dark:text-gray-300"
                />
              </button>
            </Dialog.Close>
          </div>

          <div className="p-6 overflow-y-auto">{children}</div>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Root>
  );
};

export default Modal;
