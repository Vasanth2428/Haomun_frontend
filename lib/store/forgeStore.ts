import { create } from 'zustand'

interface ForgeState {
  forgeData: any;
  setForgeData: (data: any) => void;
  clearForgeData: () => void;
}

export const useForgeStore = create<ForgeState>((set) => ({
  forgeData: null,
  setForgeData: (data) => set({ forgeData: data }),
  clearForgeData: () => set({ forgeData: null }),
}))
