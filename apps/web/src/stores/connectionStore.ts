import { create } from "zustand";

export type ConnectionState = "idle" | "connecting" | "listening" | "stopped" | "error";

type ConnectionStore = {
  sessionId: string | null;
  connectionState: ConnectionState;
  statusMessage: string;
  secondsAvailable: number;
  segmentCount: number;
  startedAt: number | null;
  setSessionId: (sessionId: string) => void;
  setConnectionState: (state: ConnectionState) => void;
  setStatusMessage: (message: string) => void;
  setBufferStats: (stats: { secondsAvailable: number; segmentCount: number }) => void;
  setStartedAt: (startedAt: number | null) => void;
  reset: () => void;
};

export const useConnectionStore = create<ConnectionStore>((set) => ({
  sessionId: null,
  connectionState: "idle",
  statusMessage: "未连接",
  secondsAvailable: 0,
  segmentCount: 0,
  startedAt: null,
  setSessionId: (sessionId) => set({ sessionId }),
  setConnectionState: (connectionState) => set({ connectionState }),
  setStatusMessage: (statusMessage) => set({ statusMessage }),
  setBufferStats: ({ secondsAvailable, segmentCount }) => set({ secondsAvailable, segmentCount }),
  setStartedAt: (startedAt) => set({ startedAt }),
  reset: () =>
    set({
      sessionId: null,
      connectionState: "idle",
      statusMessage: "未连接",
      secondsAvailable: 0,
      segmentCount: 0,
      startedAt: null,
    }),
}));
