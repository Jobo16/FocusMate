import { useCallback, useEffect, useRef } from "react";
import { startAudioClient, type AudioClient } from "../../audio/audioClient";
import { useConnectionStore } from "../../stores/connectionStore";
import { useTranscriptStore } from "../../stores/transcriptStore";
import { connectTranscriptSocket, type TranscriptSocket } from "../../ws/transcriptSocket";

const statusLabel = (message: string) => {
  if (message === "mock_mode") return "预置文本演示中，非真实转写";
  if (message === "dashscope_mode") return "实时转写中";
  if (message === "connected") return "服务已连接";
  if (message.startsWith("input_rate_")) return "正在准备转写";
  if (message === "stopped" || message === "mock_stopped") return "已停止";
  return message;
};

export const useConnection = () => {
  const socketRef = useRef<TranscriptSocket | null>(null);
  const audioRef = useRef<AudioClient | null>(null);
  const startingRef = useRef(false);

  const {
    connectionState,
    statusMessage,
    segmentCount,
    startedAt,
    setConnectionState,
    setStatusMessage,
    setSegmentCount,
    setStartedAt,
  } = useConnectionStore();
  const addTranscript = useTranscriptStore((state) => state.addTranscript);
  const clearTranscript = useTranscriptStore((state) => state.clearTranscript);

  useEffect(() => () => {
    startingRef.current = false;
    const socket = socketRef.current;
    socketRef.current = null;
    socket?.close();
    const audio = audioRef.current;
    audioRef.current = null;
    void audio?.stop();
    if (socket || audio) {
      useConnectionStore.getState().setConnectionState("stopped");
      useConnectionStore.getState().setStartedAt(null);
    }
  }, []);

  const startListening = useCallback(async () => {
    if (startingRef.current || socketRef.current) return;
    startingRef.current = true;
    setConnectionState("connecting");
    setStatusMessage("正在连接服务");
    setSegmentCount(0);
    clearTranscript();

    let socket: TranscriptSocket | null = null;
    try {
      socket = connectTranscriptSocket({
        onOpen: () => setStatusMessage("正在请求麦克风"),
        onClose: () => {
          if (socketRef.current !== socket) return;
          socketRef.current = null;
          const audio = audioRef.current;
          audioRef.current = null;
          void audio?.stop();
          setStartedAt(null);
          setConnectionState("error");
          setStatusMessage("连接已断开，请重新开始");
        },
        onMessage: (message) => {
          if (message.type === "status") setStatusMessage(statusLabel(message.message));
          if (message.type === "buffer") setSegmentCount(message.segmentCount);
          if (message.type === "transcript") addTranscript(message.segment);
          if (message.type === "error") setStatusMessage(statusLabel(message.message));
        },
      });
      socketRef.current = socket;
      await socket.opened;
      const audio = await startAudioClient(
        (chunk) => socket?.sendAudio(chunk),
        () => {
          if (socketRef.current !== socket) return;
          socketRef.current = null;
          socket?.close();
          const activeAudio = audioRef.current;
          audioRef.current = null;
          void activeAudio?.stop();
          setStartedAt(null);
          setConnectionState("error");
          setStatusMessage("麦克风已断开，请重新开始");
        },
      );
      if (socketRef.current !== socket) {
        await audio.stop();
        return;
      }
      audioRef.current = audio;
      socket.send({ type: "config", sampleRate: audio.sampleRate });
      socket.send({ type: "start" });
      setConnectionState("listening");
      setStartedAt(Date.now());
      setStatusMessage("正在准备转写");
    } catch (error) {
      if (socketRef.current === socket) {
        socketRef.current = null;
        socket?.close();
        const audio = audioRef.current;
        audioRef.current = null;
        void audio?.stop();
        setStartedAt(null);
        setConnectionState("error");
        setStatusMessage(error instanceof Error && error.name === "NotAllowedError"
          ? "麦克风未获授权，请检查浏览器权限"
          : "无法开始录音，请检查麦克风和服务连接");
      }
    } finally {
      startingRef.current = false;
    }
  }, [setConnectionState, setStatusMessage, clearTranscript, setSegmentCount, addTranscript, setStartedAt]);

  const stopListening = useCallback(async () => {
    startingRef.current = false;
    const socket = socketRef.current;
    socketRef.current = null;
    socket?.send({ type: "stop" });
    socket?.close();
    const audio = audioRef.current;
    audioRef.current = null;
    try {
      await audio?.stop();
    } finally {
      setConnectionState("stopped");
      setStatusMessage("已停止；本次音频未保存");
      setStartedAt(null);
    }
  }, [setConnectionState, setStatusMessage, setStartedAt]);

  return { connectionState, statusMessage, segmentCount, startedAt, startListening, stopListening };
};
