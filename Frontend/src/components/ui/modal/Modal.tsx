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
  return (
    <Dialog.Root open={isOpen} onOpenChange={(open) => !open && onClose()}>
      <Dialog.Portal>
        <Dialog.Overlay
          className={cn(
            "fixed inset-0 z-50 bg-black/50 backdrop-blur-sm",
            "data-[state=open]:animate-overlay-show",
            "data-[state=closed]:animate-overlay-hide"
          )}
        />

        <Dialog.Content
          className={cn(
            "fixed left-[50%] top-[50%] z-50 w-full max-w-lg translate-x-[-50%] translate-y-[-50%] border bg-gray-100 border-gray-300 dark:bg-gray-800 dark:border-gray-600 p-0 shadow-lg sm:rounded-lg duration-200 focus:outline-none flex flex-col max-h-[90vh]",
            "data-[state=open]:animate-content-show",
            "data-[state=closed]:animate-content-hide"
          )}
        >
          <div className="flex justify-between items-center p-6 border-b border-gray-300 dark:border-gray-600 flex-shrink-0">
            <Dialog.Title className="text-lg font-semibold dark:text-white">
              {title}
            </Dialog.Title>

            <Dialog.Close asChild>
              <button
                className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
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
