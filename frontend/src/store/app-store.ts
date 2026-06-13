import { create } from "zustand";

interface AppState {
  activeModule: string;
  setActiveModule: (moduleName: string) => void;
}

export const useAppStore = create<AppState>((set) => ({
  activeModule: "dashboard",
  setActiveModule: (moduleName) => set({ activeModule: moduleName }),
}));
