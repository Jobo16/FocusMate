import { useRef } from "react";
import type { RecoveryWindowSeconds } from "@focusmate/shared";
import { Mic, Square } from "lucide-react";
import { startAudioClient, type AudioClient } from "./audio/audioClient";
import { requestRecoveryCard } from "./recovery/recoverClient";
import { ModeSelector } from "./recovery/ModeSelector";
import { RecoveryButton } from "./recovery/RecoveryButton";
import { RecoverySheet } from "./recovery/RecoverySheet";
import { useFocusMateStore } from "./recovery/useFocusMateStore";
import { WindowSelector } from "./recovery/WindowSelector";
import { connectTranscriptSocket, type TranscriptSocket } from "./ws/transcriptSocket";

export const App = () => {
  const socketRef = useRef<TranscriptSocket | null>(null);
  const audioRef = useRef<AudioClient | null>(null);

  const {
    sessionId,
    connectionState,
    statusMessage,
    mode,
    windowSeconds,
    card,
    recovering,
    setSessionId,
    setConnectionState,
    setStatusMessage,
    setBufferStats,
    setMode,
    setWindowSeconds,
    addTranscript,
    setCard,
    setRecovering,
    resetTranscript
  } = useFocusMateStore();

  const listening = connectionState === "listening";

  const startListening = async () => {
    setConnectionState("connecting");
    setStatusMessage("正在请求麦克风");
    resetTranscript();

    const socket = connectTranscriptSocket({
      onOpen: () => {
        setStatusMessage("已连接");
      },
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
      }
    });

    socketRef.current = socket;

    try {
      const audio = await startAudioClient((chunk) => socket.sendAudio(chunk));
      audioRef.current = audio;
      socket.send({ type: "config", sampleRate: audio.sampleRate });
      socket.send({ type: "start" });
      setConnectionState("listening");
      setStatusMessage(copy.listeningStatus);
    } catch {
      socket.send({ type: "start" });
      setConnectionState("listening");
      setStatusMessage(`麦克风不可用，已进入模拟${copy.shortLabel}`);
    }
  };

  const stopListening = async () => {
    socketRef.current?.send({ type: "stop" });
    socketRef.current?.close();
    socketRef.current = null;
    await audioRef.current?.stop();
    audioRef.current = null;
    setConnectionState("stopped");
    setStatusMessage("已停止");
  };

  const recover = async () => {
    if (!sessionId) return;
    setRecovering(true);
    try {
      const response = await requestRecoveryCard(sessionId, windowSeconds, mode);
      setCard(response.card);
    } finally {
      setRecovering(false);
    }
  };

  const copy = MODE_COPY[mode];
  const statusOk = listening;

  return (
    <main className="mx-auto flex h-dvh w-full max-w-xl flex-col overflow-hidden px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-[max(18px,env(safe-area-inset-top))]">
      <header className="mb-4 flex items-center justify-between gap-3">
        <div className="text-[11px] font-bold uppercase tracking-[0.28em] text-moss/75">FocusMate</div>
        <div
          className={`h-3.5 w-3.5 rounded-full shadow-sm ring-4 ${
            statusOk ? "bg-emerald-500 ring-emerald-500/15" : "bg-red-500 ring-red-500/15"
          }`}
          aria-label={statusOk ? "收听中" : statusMessage}
          title={statusOk ? "收听中" : statusMessage}
        />
      </header>

      <section className="mt-3 flex items-center gap-2">
        <div className="min-w-0 flex-1">
          <ModeSelector value={mode} disabled={listening} onChange={setMode} />
        </div>
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          className={`relative h-14 w-20 shrink-0 rounded-full p-1.5 shadow-sm ring-1 transition active:scale-[0.98] ${
            listening ? "bg-ink ring-ink/10" : "bg-white/85 ring-black/10"
          }`}
          aria-label={listening ? "关闭收听" : "开启收听"}
          title={listening ? "关闭收听" : "开启收听"}
        >
          <span
            className={`grid h-11 w-11 place-items-center rounded-full shadow-sm transition-transform ${
              listening ? "translate-x-6 bg-coral text-white" : "translate-x-0 bg-coral text-white"
            }`}
          >
            {listening ? <Square className="h-4 w-4" /> : <Mic className="h-5 w-5" />}
          </span>
        </button>
      </section>

      <section className="flex min-h-0 flex-1 flex-col items-center justify-center gap-6 py-6">
        <RecoveryButton disabled={!listening || !sessionId} recovering={recovering} onRecover={recover} />
        <div className="w-full">
          <WindowSelector value={windowSeconds} onChange={(value: RecoveryWindowSeconds) => setWindowSeconds(value)} />
        </div>
      </section>

      <RecoverySheet
        card={card}
        onClose={() => setCard(null)}
      />
    </main>
  );
};

const MODE_COPY = {
  classroom: {
    shortLabel: "课堂",
    listeningStatus: "正在听课"
  },
  meeting: {
    shortLabel: "会议",
    listeningStatus: "正在听会"
  }
} as const;
