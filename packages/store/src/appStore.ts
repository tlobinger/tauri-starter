import { create } from "zustand";
import { subscribeWithSelector } from "zustand/middleware";

export interface AppStoreState {
  lastError: string | null;
  setError: (message: string | null) => void;
  clearError: () => void;
}

/**
 * Small global app store.
 *
 * Why have this at all?
 * - In real apps you typically want a single place for global errors/toasts,
 *   feature flags, user preferences, etc.
 * - Keeping it minimal avoids premature complexity in the starter.
 */
export const useAppStore = create<AppStoreState>()(
  subscribeWithSelector((set) => ({
    lastError: null,
    setError: (message) => set({ lastError: message }),
    clearError: () => set({ lastError: null }),
  }))
);


