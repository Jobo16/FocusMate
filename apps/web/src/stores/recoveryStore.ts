import { create } from "zustand";
import { persist } from "zustand/middleware";
import type {
  RecoveryCard,
  RecoveryMode,
  RecoveryWindowSeconds,
  TranscriptSegment,
} from "@focusmate/shared";

export type HistoryEntry = {
  id: string;
  timestamp: number;
  card: RecoveryCard;
  mode: RecoveryMode;
};

export type RecoveryMarker = {
  id: string;
  timestamp: number;
  windowSeconds: RecoveryWindowSeconds;
  mode: RecoveryMode;
};

export type AskMessage = {
  role: "user" | "assistant";
  content: string;
  timestamp: number;
};

type RecoveryStore = {
  mode: RecoveryMode;
  windowSeconds: RecoveryWindowSeconds;
  transcript: TranscriptSegment[];
  card: RecoveryCard | null;
  recovering: boolean;
  transcriptOpen: boolean;
  recoveryMarkers: RecoveryMarker[];
  askMessages: AskMessage[];
  asking: boolean;
  setMode: (mode: RecoveryMode) => void;
  setWindowSeconds: (windowSeconds: RecoveryWindowSeconds) => void;
  addTranscript: (segment: TranscriptSegment) => void;
  setCard: (card: RecoveryCard | null) => void;
  setRecovering: (recovering: boolean) => void;
  setTranscriptOpen: (open: boolean) => void;
  addRecoveryMarker: (marker: RecoveryMarker) => void;
  clearRecoveryMarkers: () => void;
  addAskMessage: (message: AskMessage) => void;
  setAsking: (asking: boolean) => void;
  clearAskMessages: () => void;
  resetTranscript: () => void;
};

export const useRecoveryStore = create<RecoveryStore>((set) => ({
  mode: "classroom",
  windowSeconds: 60,
  transcript: [],
  card: null,
  recovering: false,
  transcriptOpen: false,
  recoveryMarkers: [],
  askMessages: [],
  asking: false,
  setMode: (mode) =>
    set({ mode, card: null, transcriptOpen: false, askMessages: [] }),
  setWindowSeconds: (windowSeconds) => set({ windowSeconds }),
  addTranscript: (segment) =>
    set((state) => ({
      transcript: [
        ...state.transcript.filter((item) => item.id !== "partial-current"),
        segment,
      ].slice(-80),
    })),
  setCard: (card) => set({ card, askMessages: [] }),
  setRecovering: (recovering) => set({ recovering }),
  setTranscriptOpen: (transcriptOpen) => set({ transcriptOpen }),
  addRecoveryMarker: (marker) =>
    set((state) => ({
      recoveryMarkers: [...state.recoveryMarkers, marker],
    })),
  clearRecoveryMarkers: () => set({ recoveryMarkers: [] }),
  addAskMessage: (message) =>
    set((state) => ({
      askMessages: [...state.askMessages, message],
    })),
  setAsking: (asking) => set({ asking }),
  clearAskMessages: () => set({ askMessages: [] }),
  resetTranscript: () =>
    set({
      transcript: [],
      card: null,
      recoveryMarkers: [],
      askMessages: [],
    }),
}));

// Persisted history store — separate to avoid persisting transcript
type HistoryStore = {
  history: HistoryEntry[];
  addHistoryEntry: (entry: HistoryEntry) => void;
  clearHistory: () => void;
};

export const useHistoryStore = create<HistoryStore>()(
  persist(
    (set) => ({
      history: [],
      addHistoryEntry: (entry) =>
        set((state) => ({
          history: [entry, ...state.history].slice(0, 50),
        })),
      clearHistory: () => set({ history: [] }),
    }),
    { name: "focusmate-history" },
  ),
);
