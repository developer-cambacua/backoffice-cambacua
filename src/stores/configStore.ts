import { create } from "zustand";

type ConfigStore = {
  config: Record<string, any>;
  setConfig: (config: Record<string, any>) => void;
};

export const useConfigStore = create<ConfigStore>((set) => ({
  config: {},
  setConfig: (config) => set({ config }),
}));
