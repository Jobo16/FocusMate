import { create } from "zustand";
import type { TranscriptSegment } from "@daymark/shared";

type TranscriptStore = {
  transcript: TranscriptSegment[];
  addTranscript: (segment: TranscriptSegment) => void;
  clearTranscript: () => void;
};

export const useTranscriptStore = create<TranscriptStore>((set) => ({
  transcript: [],
  addTranscript: (segment) => set((state) => ({ transcript: [...state.transcript, segment].slice(-80) })),
  clearTranscript: () => set({ transcript: [] }),
}));
