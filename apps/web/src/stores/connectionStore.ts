import { create } from "zustand";

export type ConnectionState = "idle" | "connecting" | "listening" | "stopped" | "error";

type ConnectionStore = {
  connectionState: ConnectionState;
  statusMessage: string;
  segmentCount: number;
  startedAt: number | null;
  setConnectionState: (state: ConnectionState) => void;
  setStatusMessage: (message: string) => void;
  setSegmentCount: (count: number) => void;
  setStartedAt: (startedAt: number | null) => void;
};

export const useConnectionStore = create<ConnectionStore>((set) => ({
  connectionState: "idle",
  statusMessage: "未连接",
  segmentCount: 0,
  startedAt: null,
  setConnectionState: (connectionState) => set({ connectionState }),
  setStatusMessage: (statusMessage) => set({ statusMessage }),
  setSegmentCount: (segmentCount) => set({ segmentCount }),
  setStartedAt: (startedAt) => set({ startedAt }),
}));
