import { create } from 'zustand';

const useDebuggerStore = create((set) => ({
  isOpen: false,
  isFullScreen: false,
  activeTrace: null,
  traces: [],
  
  toggleDrawer: () => set((state) => ({ isOpen: !state.isOpen, isFullScreen: false })),
  toggleFullScreen: () => set((state) => ({ isFullScreen: !state.isFullScreen, isOpen: true })),
  closeDebugger: () => set({ isOpen: false, isFullScreen: false }),
  setActiveTrace: (trace) => set({ activeTrace: trace }),
}));

export default useDebuggerStore;