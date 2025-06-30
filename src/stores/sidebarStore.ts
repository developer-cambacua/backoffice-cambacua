import { create } from "zustand";

interface SidebarState {
  isSidebarOpen: boolean;
  toggleSidebar: (forceState?: boolean) => void;
}

const useSidebarStore = create<SidebarState>((set) => ({
  isSidebarOpen: false,
  toggleSidebar: (forceState) =>
    set((state) => {
      const isOpen =
        forceState !== undefined ? forceState : !state.isSidebarOpen;
      //  if (typeof document !== "undefined") {
      //   document.body.classList.toggle("overflow-hidden", isOpen);
      // }
      return { isSidebarOpen: isOpen };
    }),
}));

export default useSidebarStore;
