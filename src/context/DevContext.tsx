"use client";
import { createContext, useContext, useState, ReactNode } from "react";

interface DevContextType {
  dev: boolean;
  setDev: (Dev: boolean) => void;
}

const DevContext = createContext<DevContextType | undefined>(undefined);

DevContext.displayName = "Dev Mode";

export const DevProvider = ({ children }: { children: ReactNode }) => {
  const [dev, setDev] = useState<boolean>(false);

  return (
    <DevContext.Provider value={{ dev, setDev }}>
      {children}
    </DevContext.Provider>
  );
};

export const useDev = () => {
  const context = useContext(DevContext);
  if (context === undefined) {
    throw new Error("useDev debe ser usado dentro de un DevProvider");
  }
  return context;
};
