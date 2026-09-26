import { create } from "zustand";

export type Page = "record" | "chat" | "settings";

type RouterStore = {
  page: Page;
  navigate: (page: Page) => void;
};

export const useRouterStore = create<RouterStore>((set) => ({
  page: "record",
  navigate: (page) => set({ page }),
}));
