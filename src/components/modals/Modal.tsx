import { Dialog, Transition } from "@headlessui/react";
import { Fragment, ReactNode } from "react";

// Tipos para las props de los subcomponentes
interface ModalHeaderProps {
  title: string;
  subtitle?: string;
}

interface ModalMainProps {
  children: ReactNode;
}

interface ModalFooterProps {
  className?: string;
  children: ReactNode;
}

// Subcomponentes del Modal
const ModalHeader: React.FC<ModalHeaderProps> = ({ title, subtitle }) => {
  return (
    <div className="rounded-t-2xl">
      <Dialog.Title as="h3" className="text-2xl font-semibold leading-6">
        {title}
      </Dialog.Title>
      {subtitle && <p className="max-w-[45ch] mt-1 lg:text-lg">{subtitle}</p>}
    </div>
  );
};

const ModalMain: React.FC<ModalMainProps> = ({ children }) => {
  return <div className="mt-4 mb-4 sm:mb-6">{children}</div>;
};

const ModalFooter: React.FC<ModalFooterProps> = ({
  className = "flex justify-end",
  children,
}) => {
  return <div className={`${className}`}>{children}</div>;
};

// Tipos para las props del componente principal Modal
interface ModalProps {
  isOpen: boolean;
  onClose: () => void;
  size?:
    | "max-w-sm"
    | "max-w-md"
    | "max-w-lg"
    | "max-w-xl"
    | "max-w-2xl"
    | "max-w-3xl";
  children: ReactNode;
}

// Componente principal Modal
const Modal: React.FC<ModalProps> & {
  Header: React.FC<ModalHeaderProps>;
  Main: React.FC<ModalMainProps>;
  Footer: React.FC<ModalFooterProps>;
} = ({ isOpen, onClose, size = "max-w-3xl", children }) => {
  return (
    <Transition appear show={isOpen} as={Fragment}>
      <Dialog as="div" className="fixed z-[1100]" onClose={onClose} onClick={(e) => e.stopPropagation()}>
        <Transition.Child
          as={Fragment}
          enter="ease-out duration-300"
          enterFrom="opacity-0"
          enterTo="opacity-100"
          leave="ease-in duration-200"
          leaveFrom="opacity-100"
          leaveTo="opacity-0">
          <div className="fixed inset-0 bg-black/50 backdrop-blur-md" />
        </Transition.Child>

        <div className="fixed inset-0 w-screen">
          <div className="flex min-h-full items-center justify-center p-4 text-center">
            <Transition.Child
              as={Fragment}
              enter="ease-out duration-300"
              enterFrom="opacity-0 scale-95"
              enterTo="opacity-100 scale-100"
              leave="ease-in duration-200"
              leaveFrom="opacity-100 scale-100"
              leaveTo="opacity-0 scale-95">
              <Dialog.Panel
                className={`w-full ${size} transform rounded-2xl bg-white text-left align-middle shadow-xl transition-all py-6 px-6 sm:px-8`}>
                {children}
              </Dialog.Panel>
            </Transition.Child>
          </div>
        </div>
      </Dialog>
    </Transition>
  );
};

Modal.Header = ModalHeader;
Modal.Main = ModalMain;
Modal.Footer = ModalFooter;

export default Modal;
