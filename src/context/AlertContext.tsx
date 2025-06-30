"use client";

import {
  createContext,
  useContext,
  useState,
  useEffect,
  ReactNode,
} from "react";

interface IAlert {
  visible: boolean;
  status: "success" | "error" | "warning" | "info";
  msgPrinc: string;
  msgSec?: string;
  id: number;
}

interface AlertContextType {
  showAlert: IAlert;
  setShowAlert: (alert: Omit<IAlert, "id">) => void;
}

const initialAlertState: IAlert = {
  visible: false,
  status: "info",
  msgPrinc: "",
  msgSec: "",
  id: 0,
};

const AlertContext = createContext<AlertContextType | undefined>(undefined);

AlertContext.displayName = "Alert Context";

export const AlertProvider = ({ children }: { children: ReactNode }) => {
  const [showAlert, setShowAlertState] = useState<IAlert>(initialAlertState);

  useEffect(() => {
    if (showAlert.visible) {
      const timer = setTimeout(() => {
        setShowAlertState((prevState) => ({ ...prevState, visible: false }));
      }, 7500);

      return () => clearTimeout(timer);
    }
  }, [showAlert.id, showAlert.visible]);

  const setShowAlert = (alert: Omit<IAlert, "id">) => {
    setShowAlertState({
      ...alert,
      id: Date.now(),
    });
  };

  return (
    <AlertContext.Provider value={{ showAlert, setShowAlert }}>
      {children}
    </AlertContext.Provider>
  );
};

export const useAlert = () => {
  const context = useContext(AlertContext);
  if (context === undefined) {
    throw new Error("useAlert debe ser usado dentro de un AlertProvider");
  }
  return context;
};
