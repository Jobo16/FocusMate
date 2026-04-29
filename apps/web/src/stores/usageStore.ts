import { create } from "zustand";
import { persist } from "zustand/middleware";

const QUOTA_SECONDS = 100 * 60; // 100 minutes

type UsageStore = {
  totalListeningSeconds: number;
  quotaUnlocked: boolean;
  addListeningSeconds: (seconds: number) => void;
  isQuotaExceeded: () => boolean;
  redeemCode: (code: string) => boolean;
};

export const useUsageStore = create<UsageStore>()(
  persist(
    (set, get) => ({
      totalListeningSeconds: 0,
      quotaUnlocked: false,
      addListeningSeconds: (seconds) =>
        set((state) => ({
          totalListeningSeconds: state.totalListeningSeconds + seconds,
        })),
      isQuotaExceeded: () => {
        const state = get();
        if (state.quotaUnlocked) return false;
        return state.totalListeningSeconds >= QUOTA_SECONDS;
      },
      redeemCode: (code: string) => {
        if (code === "admin") {
          set({ quotaUnlocked: true });
          return true;
        }
        return false;
      },
    }),
    { name: "focusmate-usage" },
  ),
);
