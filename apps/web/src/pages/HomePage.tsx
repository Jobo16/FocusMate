import { BookOpen, BriefcaseBusiness, Mic, Square } from "lucide-react";
import {
  type RecoveryMode,
  type RecoveryWindowSeconds,
} from "@focusmate/shared";
import { SegmentedControl } from "../components/SegmentedControl";
import { ListeningStatus } from "../features/connection/ListeningStatus";
import { useConnection } from "../features/connection/useConnection";
import { RecoveryButton } from "../features/recovery/RecoveryButton";
import { RecoverySheet } from "../features/recovery/RecoverySheet";
import { WindowSelector } from "../features/recovery/WindowSelector";
import { useRecovery } from "../features/recovery/useRecovery";

const MODE_OPTIONS = [
  {
    value: "classroom" as RecoveryMode,
    label: "课堂",
    icon: <BookOpen className="h-3.5 w-3.5" />,
  },
  {
    value: "meeting" as RecoveryMode,
    label: "会议",
    icon: <BriefcaseBusiness className="h-3.5 w-3.5" />,
  },
];

export const HomePage = () => {
  const {
    connectionState,
    statusMessage,
    secondsAvailable,
    startedAt,
    listening,
    startListening,
    stopListening,
    sessionId,
  } = useConnection();

  const {
    mode,
    windowSeconds,
    transcript,
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
  } = useRecovery();

  return (
    <>
      {/* Mode selector — always visible at top, compact */}
      <div className="flex items-center justify-center py-2">
        <SegmentedControl
          value={mode}
          options={MODE_OPTIONS}
          disabled={listening}
          onChange={setMode}
        />
      </div>

      {/* Main content area */}
      <div className="flex min-h-0 flex-1 flex-col items-center">
        {/* Listening state */}
        {listening && (
          <div className="flex w-full flex-1 flex-col gap-5 pt-2">
            <ListeningStatus
              connectionState={connectionState}
              statusMessage={statusMessage}
              startedAt={startedAt}
              secondsAvailable={secondsAvailable}
              transcript={transcript}
              mode={mode}
              recoveryMarkers={recoveryMarkers}
            />

            {/* Spacer */}
            <div className="flex-1" />

            {/* Recovery button + window */}
            <div className="flex flex-col items-center gap-5 pb-4">
              <RecoveryButton
                disabled={!sessionId}
                recovering={recovering}
                onRecover={recover}
              />
              <WindowSelector
                value={windowSeconds}
                onChange={(v: RecoveryWindowSeconds) => setWindowSeconds(v)}
              />
            </div>
          </div>
        )}

        {/* Idle state */}
        {!listening && connectionState === "idle" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-8">
            {/* Hero visual */}
            <div className="relative">
              <div className="grid h-28 w-28 place-items-center rounded-full bg-gradient-to-b from-ink to-ink/80 shadow-[0_20px_60px_rgba(23,23,23,0.25)]">
                <Mic className="h-12 w-12 text-paper/80" />
              </div>
              <div className="absolute -inset-3 rounded-full border border-ink/5" />
            </div>

            <div className="text-center">
              <h1 className="text-xl font-bold text-ink">开始听讲</h1>
              <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-ink/45">
                错过内容时，一键找回课堂重点
              </p>
            </div>

            {/* Start button */}
            <button
              type="button"
              onClick={() => startListening(mode)}
              className="flex items-center gap-2.5 rounded-full bg-moss px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-moss/25 transition active:scale-[0.97]"
            >
              <Mic className="h-4 w-4" />
              <span>{mode === "meeting" ? "开始听会" : "开始听课"}</span>
            </button>
          </div>
        )}

        {/* Stopped state */}
        {!listening && connectionState !== "idle" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            <div className="grid h-16 w-16 place-items-center rounded-full bg-ink/5">
              <Square className="h-6 w-6 text-ink/30" />
            </div>
            <div className="text-center">
              <p className="text-sm font-medium text-ink/60">{statusMessage}</p>
              <button
                type="button"
                onClick={() => startListening(mode)}
                className="mt-4 flex items-center gap-2 rounded-full bg-ink/5 px-5 py-2.5 text-sm font-medium text-ink/60 transition hover:bg-ink/10 active:scale-[0.97]"
              >
                <Mic className="h-4 w-4" />
                重新开始
              </button>
            </div>
          </div>
        )}
      </div>

      {/* Recovery sheet */}
      <RecoverySheet
        card={card}
        asking={asking}
        askMessages={askMessages}
        onAsk={ask}
        onClose={dismissCard}
      />
    </>
  );
};
