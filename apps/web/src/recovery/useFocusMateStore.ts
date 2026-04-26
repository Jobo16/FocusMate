import type { RecoveryCard, RecoveryWindowSeconds, TranscriptSegment } from "@focusmate/shared";
import { create } from "zustand";

type ConnectionState = "idle" | "connecting" | "listening" | "stopped" | "error";

type FocusMateState = {
  sessionId: string | null;
  connectionState: ConnectionState;
  statusMessage: string;
  secondsAvailable: number;
  segmentCount: number;
  windowSeconds: RecoveryWindowSeconds;
  transcript: TranscriptSegment[];
  card: RecoveryCard | null;
  recovering: boolean;
  transcriptOpen: boolean;
  setSessionId: (sessionId: string) => void;
  setConnectionState: (state: ConnectionState) => void;
  setStatusMessage: (message: string) => void;
  setBufferStats: (stats: { secondsAvailable: number; segmentCount: number }) => void;
  setWindowSeconds: (windowSeconds: RecoveryWindowSeconds) => void;
  addTranscript: (segment: TranscriptSegment) => void;
  setCard: (card: RecoveryCard | null) => void;
  setRecovering: (recovering: boolean) => void;
  setTranscriptOpen: (open: boolean) => void;
  resetTranscript: () => void;
};

export const useFocusMateStore = create<FocusMateState>((set) => ({
  sessionId: null,
  connectionState: "idle",
  statusMessage: "未连接",
  secondsAvailable: 0,
  segmentCount: 0,
  windowSeconds: 60,
  transcript: [],
  card: null,
  recovering: false,
  transcriptOpen: false,
  setSessionId: (sessionId) => set({ sessionId }),
  setConnectionState: (connectionState) => set({ connectionState }),
  setStatusMessage: (statusMessage) => set({ statusMessage }),
  setBufferStats: ({ secondsAvailable, segmentCount }) => set({ secondsAvailable, segmentCount }),
  setWindowSeconds: (windowSeconds) => set({ windowSeconds }),
  addTranscript: (segment) =>
    set((state) => ({
      transcript: [...state.transcript.filter((item) => item.id !== "partial-current"), segment].slice(-80)
    })),
  setCard: (card) => set({ card }),
  setRecovering: (recovering) => set({ recovering }),
  setTranscriptOpen: (transcriptOpen) => set({ transcriptOpen }),
  resetTranscript: () => set({ transcript: [], card: null, secondsAvailable: 0, segmentCount: 0 })
}));
