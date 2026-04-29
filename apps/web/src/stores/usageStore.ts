import { create } from "zustand";
import { persist } from "zustand/middleware";

const QUOTA_SECONDS = 100 * 60; // 100 minutes

type UsageStore = {
  totalListeningSeconds: number;
  addListeningSeconds: (seconds: number) => void;
  isQuotaExceeded: () => boolean;
};

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      totalListeningSeconds: 0,
      addListeningSeconds: (seconds) =>
        set((state) => ({
          totalListeningSeconds: state.totalListeningSeconds + seconds,
        })),
      isQuotaExceeded: () => get().totalListeningSeconds >= QUOTA_SECONDS,
    }),
    { name: "focusmate-usage" }
  )
);
