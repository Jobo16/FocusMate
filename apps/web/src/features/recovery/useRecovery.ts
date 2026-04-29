import { useCallback } from "react";
import { randomUUID } from "../../utils/uuid";
import { requestRecoveryCard } from "./recoverClient";
import { requestAsk } from "./askClient";
import { useRecoveryStore, useHistoryStore } from "../../stores/recoveryStore";
import { useConnectionStore } from "../../stores/connectionStore";

export const useRecovery = () => {
  const {
    mode,
    windowSeconds,
    card,
    recovering,
    transcriptOpen,
    recoveryMarkers,
    askMessages,
    asking,
    setMode,
    setWindowSeconds,
    setCard,
    setRecovering,
    setTranscriptOpen,
    addRecoveryMarker,
    addAskMessage,
    setAsking,
    clearAskMessages,
  } = useRecoveryStore();

  const { addHistoryEntry } = useHistoryStore();
  const sessionId = useConnectionStore((s) => s.sessionId);

  const recover = useCallback(async () => {
    if (!sessionId) return;
    setRecovering(true);
    try {
      const response = await requestRecoveryCard(
        sessionId,
        windowSeconds,
        mode,
      );
      setCard(response.card);

      // Record marker
      addRecoveryMarker({
        id: randomUUID(),
        timestamp: Date.now(),
        windowSeconds,
        mode,
      });

      // Save to history
      addHistoryEntry({
        id: randomUUID(),
        timestamp: Date.now(),
        card: response.card,
        mode,
      });
    } finally {
      setRecovering(false);
    }
  }, [
    sessionId,
    windowSeconds,
    mode,
    setRecovering,
    setCard,
    addRecoveryMarker,
    addHistoryEntry,
  ]);

  const ask = useCallback(
    async (question: string) => {
      if (!sessionId || !question.trim()) return;
      addAskMessage({
        role: "user",
        content: question.trim(),
        timestamp: Date.now(),
      });
      setAsking(true);
      try {
        const response = await requestAsk(
          sessionId,
          question.trim(),
          windowSeconds,
        );
        addAskMessage({
          role: "assistant",
          content: response.answer,
          timestamp: Date.now(),
        });
      } catch {
        addAskMessage({
          role: "assistant",
          content: "提问失败，请稍后再试。",
          timestamp: Date.now(),
        });
      } finally {
        setAsking(false);
      }
    },
    [sessionId, windowSeconds, addAskMessage, setAsking],
  );

  const dismissCard = useCallback(() => {
    setCard(null);
    clearAskMessages();
  }, [setCard, clearAskMessages]);

  return {
    mode,
    windowSeconds,
    card,
    recovering,
    recoveryMarkers,
    askMessages,
    asking,
    setMode,
    setWindowSeconds,
    recover,
    ask,
    dismissCard,
  };
};
