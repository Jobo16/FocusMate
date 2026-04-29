import { create } from "zustand";
import { persist } from "zustand/middleware";
import type { RecoveryMode, RecoveryWindowSeconds } from "@focusmate/shared";

type SettingsStore = {
  defaultMode: RecoveryMode;
  defaultWindow: RecoveryWindowSeconds;
  setDefaultMode: (mode: RecoveryMode) => void;
  setDefaultWindow: (window: RecoveryWindowSeconds) => void;
};

export const useSettingsStore = create<SettingsStore>()(
  persist(
    (set) => ({
      defaultMode: "classroom",
      defaultWindow: 60,
      setDefaultMode: (defaultMode) => set({ defaultMode }),
      setDefaultWindow: (defaultWindow) => set({ defaultWindow }),
    }),
    { name: "focusmate-settings" }
  )
);
