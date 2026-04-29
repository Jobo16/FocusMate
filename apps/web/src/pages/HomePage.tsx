import { BookOpen, BriefcaseBusiness, Mail, Square } from "lucide-react";
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
import { useUsageStore } from "../stores/usageStore";

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

const MODE_LABELS: Record<
  RecoveryMode,
  { label: string; icon: typeof BookOpen }
> = {
  classroom: { label: "课堂", icon: BookOpen },
  meeting: { label: "会议", icon: BriefcaseBusiness },
};

export const HomePage = () => {
  const {
    connectionState,
    statusMessage,
    startedAt,
    listening,
    startListening,
    stopListening,
    sessionId,
  } = useConnection();

  const {
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
  } = useRecovery();

  const quotaExceeded = useUsageStore((s) => s.isQuotaExceeded());
  const modeInfo = MODE_LABELS[mode];
  const ModeIcon = modeInfo.icon;

  return (
    <>
      {/* Top bar: mode selector OR active mode + stop */}
      <div className="flex items-center justify-center py-2">
        {listening ? (
          <div className="flex items-center gap-3">
            <div className="flex items-center gap-1.5 rounded-full bg-ink px-4 py-2 text-xs font-semibold text-paper shadow-sm">
              <ModeIcon className="h-3.5 w-3.5" />
              <span>{modeInfo.label}</span>
            </div>
            <button
              type="button"
              onClick={stopListening}
              className="flex items-center gap-1.5 rounded-full bg-coral/10 px-4 py-2 text-xs font-semibold text-coral transition active:scale-[0.97]"
            >
              <Square className="h-3 w-3" />
              <span>停止</span>
            </button>
          </div>
        ) : (
          <SegmentedControl
            value={mode}
            options={MODE_OPTIONS}
            disabled={false}
            onChange={setMode}
          />
        )}
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
              recoveryMarkers={recoveryMarkers}
            />
            <div className="flex-1" />
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
          <div className="flex flex-1 flex-col items-center justify-center gap-6">
            {quotaExceeded ? (
              /* Quota exceeded — block message */
              <div className="text-center">
                <h1 className="text-xl font-bold text-ink">试用额度已用完</h1>
                <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-ink/45">
                  如需继续使用，请联系作者获取更多时间
                </p>
                <a
                  href="mailto:jo-bo@qq.com"
                  className="mt-4 inline-flex items-center gap-1.5 rounded-full bg-moss/10 px-5 py-2.5 text-sm font-medium text-moss transition active:scale-[0.97]"
                >
                  <Mail className="h-4 w-4" />
                  jo-bo@qq.com
                </a>
              </div>
            ) : (
              /* Normal idle state */
              <>
                <div className="text-center">
                  <h1 className="text-xl font-bold text-ink">开始听讲</h1>
                  <p className="mt-2 max-w-[260px] text-sm leading-relaxed text-ink/45">
                    错过内容时，一键找回课堂重点
                  </p>
                </div>
                <button
                  type="button"
                  onClick={() => startListening(mode)}
                  className="rounded-full bg-moss px-8 py-3.5 text-sm font-semibold text-white shadow-lg shadow-moss/25 transition active:scale-[0.97]"
                >
                  {mode === "meeting" ? "开始听会" : "开始听课"}
                </button>
              </>
            )}
          </div>
        )}

        {/* Stopped state */}
        {!listening && connectionState !== "idle" && (
          <div className="flex flex-1 flex-col items-center justify-center gap-4">
            <p className="text-sm font-medium text-ink/60">{statusMessage}</p>
            {!quotaExceeded && (
              <button
                type="button"
                onClick={() => startListening(mode)}
                className="rounded-full bg-moss/10 px-5 py-2.5 text-sm font-medium text-moss transition active:scale-[0.97]"
              >
                重新开始
              </button>
            )}
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
