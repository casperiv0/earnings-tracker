import type * as React from "react";
import * as Dialog from "@radix-ui/react-dialog";

interface Props {
  children: React.ReactNode;
  isOpen?: boolean;
  onOpenChange?(value: boolean): void;
}

export function Modal({ children, isOpen, onOpenChange }: Props) {
  return (
    <Dialog.Dialog open={isOpen} onOpenChange={onOpenChange}>
      <Dialog.Portal>
        <Dialog.Overlay className="z-40 fixed inset-0 bg-secondary/60" />
        <Dialog.Content className="z-50 rounded-sm bg-primary shadow-md p-5 fixed top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[90vw] max-w-[600px] max-h-[85vh]">
          {children}

          <Dialog.Close>x</Dialog.Close>
        </Dialog.Content>
      </Dialog.Portal>
    </Dialog.Dialog>
  );
}

Modal.Title = ({ children }: { children: React.ReactNode }) => (
  <Dialog.Title className="text-2xl font-serif mb-3 font-semibold">{children}</Dialog.Title>
);
Modal.Description = ({ children }: { children: React.ReactNode }) => (
  <Dialog.Description className="text-sm mt-3">{children}</Dialog.Description>
);
