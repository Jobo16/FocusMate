import { useRef } from "react";
import type { RecoveryWindowSeconds } from "@focusmate/shared";
import { Mic, Square } from "lucide-react";
import { startAudioClient, type AudioClient } from "./audio/audioClient";
import { StatusPill } from "./components/StatusPill";
import { requestRecoveryCard } from "./recovery/recoverClient";
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
    secondsAvailable,
    windowSeconds,
    card,
    recovering,
    transcriptOpen,
    setSessionId,
    setConnectionState,
    setStatusMessage,
    setBufferStats,
    setWindowSeconds,
    addTranscript,
    setCard,
    setRecovering,
    setTranscriptOpen,
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
      setStatusMessage("正在听课");
    } catch {
      socket.send({ type: "start" });
      setConnectionState("listening");
      setStatusMessage("麦克风不可用，已进入模拟课堂");
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
    setTranscriptOpen(false);
    try {
      const response = await requestRecoveryCard(sessionId, windowSeconds);
      setCard(response.card);
    } finally {
      setRecovering(false);
    }
  };

  return (
    <main className="mx-auto flex min-h-screen w-full max-w-xl flex-col px-5 pb-8 pt-[max(20px,env(safe-area-inset-top))]">
      <header className="mb-6">
        <div className="mb-3 text-xs font-semibold uppercase tracking-[0.24em] text-moss/80">FocusMate</div>
        <h1 className="text-4xl font-semibold leading-tight tracking-tight text-ink">课堂断线恢复</h1>
        <p className="mt-3 text-base leading-relaxed text-ink/60">手机放在桌上听课。断线时点一下，拿到最近内容的恢复卡片。</p>
      </header>

      <StatusPill state={connectionState} message={statusMessage} secondsAvailable={secondsAvailable} />

      <section className="flex flex-1 flex-col items-center justify-center gap-7 py-8">
        <RecoveryButton disabled={!listening || !sessionId} recovering={recovering} onRecover={recover} />
        <div className="w-full">
          <WindowSelector value={windowSeconds} onChange={(value: RecoveryWindowSeconds) => setWindowSeconds(value)} />
          <p className="mt-3 text-center text-xs leading-relaxed text-ink/50">默认回溯 60 秒。先接回课堂，原文只作核对。</p>
        </div>
      </section>

      <section className="grid gap-3">
        <button
          type="button"
          onClick={listening ? stopListening : startListening}
          className={`flex h-14 w-full items-center justify-center gap-2 rounded-2xl text-base font-semibold transition active:scale-[0.99] ${
            listening ? "bg-white text-ink ring-1 ring-black/10" : "bg-coral text-white shadow-lg shadow-coral/20"
          }`}
        >
          {listening ? <Square className="h-5 w-5" /> : <Mic className="h-5 w-5" />}
          {listening ? "停止听课" : "开始听课"}
        </button>
        <p className="text-center text-xs leading-relaxed text-ink/45">MVP 阶段只做手动触发，不自动弹出提示。</p>
      </section>

      <RecoverySheet
        card={card}
        transcriptOpen={transcriptOpen}
        onTranscriptOpenChange={setTranscriptOpen}
        onClose={() => setCard(null)}
      />
    </main>
  );
};
