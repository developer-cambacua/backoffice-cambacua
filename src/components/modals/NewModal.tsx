"use client";

import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
  DialogClose,
} from "@/components/ui/dialog";

import { ReactNode } from "react";
import { cn } from "@/lib/utils";

type ModalProps = {
  children: ReactNode;
  trigger?: ReactNode;
  className?: string;
  isOpen: boolean;
  setIsOpen: (value: boolean) => void;
  size?:
    | "max-w-sm"
    | "max-w-md"
    | "max-w-lg"
    | "max-w-xl"
    | "max-w-2xl"
    | "max-w-3xl";
};

const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Main: React.FC<ModalMainProps>;
  Footer: React.FC<ModalFooterProps>;
  CloseButton: typeof DialogClose;
} = ({
  children,
  trigger,
  className,
  isOpen,
  setIsOpen,
  size = "max-w-3xl",
}) => {
  return (
    <Dialog open={isOpen} onOpenChange={setIsOpen}>
      {trigger && <DialogTrigger asChild>{trigger}</DialogTrigger>}
      <DialogContent
        className={cn(size, className)}
        onPointerDownOutside={(e) => e.preventDefault()}
        onInteractOutside={(e) => e.preventDefault()}>
        {children}
      </DialogContent>
    </Dialog>
  );
};

// ---- Subcomponentes ---- //

interface ModalHeaderProps {
  title: string;
  subtitle?: string;
}

const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle }) => {
  return (
    <DialogHeader>
      <DialogTitle>{title}</DialogTitle>
      {subtitle && <DialogDescription>{subtitle}</DialogDescription>}
    </DialogHeader>
  );
};

interface ModalMainProps {
  children: ReactNode;
  className?: string;
}

const ModalMain: React.FC<ModalMainProps> = ({ children, className }) => {
  return <div className={cn(className)}>{children}</div>;
};

interface ModalFooterProps {
  children: ReactNode;
  className?: string;
}

const ModalFooter: React.FC<ModalFooterProps> = ({ children, className }) => {
  return <DialogFooter className={cn(className)}>{children}</DialogFooter>;
};

// ---- Asociar los subcomponentes ---- //
Modal.Header = ModalHeader;
Modal.Main = ModalMain;
Modal.Footer = ModalFooter;
Modal.CloseButton = DialogClose; // Se puede usar como <Modal.CloseButton asChild>...</>

export default Modal;
