import { create } from "zustand";

export type Page = "home" | "history" | "settings";

type RouterStore = {
  page: Page;
  navigate: (page: Page) => void;
};

export const useRouterStore = create<RouterStore>((set) => ({
  page: "home",
  navigate: (page) => set({ page }),
}));
