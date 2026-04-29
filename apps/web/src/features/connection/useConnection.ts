import { useCallback, useRef } from "react";
import type { RecoveryMode } from "@focusmate/shared";
import { startAudioClient, type AudioClient } from "../../audio/audioClient";
import { useConnectionStore } from "../../stores/connectionStore";
import { useRecoveryStore } from "../../stores/recoveryStore";
import {
  connectTranscriptSocket,
  type TranscriptSocket,
} from "../../ws/transcriptSocket";

export const useConnection = () => {
  const socketRef = useRef<TranscriptSocket | null>(null);
  const audioRef = useRef<AudioClient | null>(null);

  const {
    sessionId,
    connectionState,
    statusMessage,
    secondsAvailable,
    segmentCount,
    startedAt,
    setSessionId,
    setConnectionState,
    setStatusMessage,
    setBufferStats,
    setStartedAt,
  } = useConnectionStore();

  const { addTranscript, resetTranscript, clearRecoveryMarkers } =
    useRecoveryStore();

  const listening = connectionState === "listening";

  const startListening = useCallback(
    async (mode: RecoveryMode) => {
      setConnectionState("connecting");
      setStatusMessage("正在请求麦克风");
      resetTranscript();
      clearRecoveryMarkers();

      const socket = connectTranscriptSocket({
        onOpen: () => setStatusMessage("已连接"),
        onClose: () => {
          setConnectionState("stopped");
          setStatusMessage("连接已关闭");
        },
        onError: () => {
          setConnectionState("error");
          setStatusMessage("连接异常");
        },
        onMessage: (message) => {
          if (message.type === "session") setSessionId(message.sessionId);
          if (message.type === "status") setStatusMessage(message.message);
          if (message.type === "buffer") setBufferStats(message);
          if (message.type === "transcript") addTranscript(message.segment);
          if (message.type === "error") setStatusMessage(message.message);
        },
      });

      socketRef.current = socket;

      try {
        const audio = await startAudioClient((chunk) =>
          socket.sendAudio(chunk),
        );
        audioRef.current = audio;
        socket.send({ type: "config", sampleRate: audio.sampleRate });
        socket.send({ type: "start" });
        setConnectionState("listening");
        setStartedAt(Date.now());
        setStatusMessage(mode === "meeting" ? "正在听会" : "正在听课");
      } catch {
        socket.send({ type: "start" });
        setConnectionState("listening");
        setStartedAt(Date.now());
        setStatusMessage(
          `麦克风不可用，已进入模拟${mode === "meeting" ? "会议" : "课堂"}`,
        );
      }
    },
    [
      setConnectionState,
      setStatusMessage,
      resetTranscript,
      clearRecoveryMarkers,
      setSessionId,
      setBufferStats,
      addTranscript,
      setStartedAt,
    ],
  );

  const stopListening = useCallback(async () => {
    socketRef.current?.send({ type: "stop" });
    socketRef.current?.close();
    socketRef.current = null;
    await audioRef.current?.stop();
    audioRef.current = null;
    setConnectionState("stopped");
    setStatusMessage("已停止");
    setStartedAt(null);
  }, [setConnectionState, setStatusMessage, setStartedAt]);

  return {
    sessionId,
    connectionState,
    statusMessage,
    secondsAvailable,
    segmentCount,
    startedAt,
    listening,
    startListening,
    stopListening,
  };
};
