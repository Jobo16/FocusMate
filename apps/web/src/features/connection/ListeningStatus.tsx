import { memo } from "react";
import type { ConnectionState } from "../../stores/connectionStore";
import {
  useRecoveryStore,
  type RecoveryMarker,
} from "../../stores/recoveryStore";
import { PulseIndicator } from "../../components/PulseIndicator";
import { RecordingTimeline } from "./RecordingTimeline";

type ListeningStatusProps = {
  connectionState: ConnectionState;
  statusMessage: string;
  startedAt: number | null;
  recoveryMarkers: RecoveryMarker[];
};

const STATUS_CONFIG: Record<
  ConnectionState,
  { indicator: "active" | "warning" | "error" | "idle" }
> = {
  idle: { indicator: "idle" },
  connecting: { indicator: "warning" },
  listening: { indicator: "active" },
  stopped: { indicator: "idle" },
  error: { indicator: "error" },
};

// Subscribe to transcript directly — avoids parent re-renders on every ASR segment
const selectLatestText = (state: {
  transcript: { isFinal: boolean; text: string }[];
}) => {
  const final = state.transcript.filter((s) => s.isFinal).slice(-3);
  return final
    .map((s) => s.text)
    .join("")
    .slice(-180);
};

export const ListeningStatus = memo(
  ({
    connectionState,
    statusMessage,
    startedAt,
    recoveryMarkers,
  }: ListeningStatusProps) => {
    const config = STATUS_CONFIG[connectionState];
    const latestText = useRecoveryStore(selectLatestText);
    const isActive = connectionState === "listening";

    return (
      <div className="flex flex-col gap-4">
        {/* Status header */}
        <div className="flex items-center justify-between gap-3">
          <div className="flex items-center gap-2">
            <PulseIndicator
              status={config.indicator}
              size="sm"
              label={statusMessage}
            />
            <span
              className={`text-xs font-semibold tracking-wide ${isActive ? "text-moss" : "text-ink/40"}`}
            >
              {statusMessage}
            </span>
          </div>
        </div>

        {/* Transcript card — only shown when there's content */}
        {isActive && latestText && (
          <div className="relative rounded-2xl bg-white/60 p-4 ring-1 ring-black/[0.04] shadow-sm">
            <p className="text-[15px] leading-[1.7] text-ink/75 line-clamp-3">
              {latestText}
            </p>
            <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 rounded-b-2xl bg-gradient-to-t from-white/60 to-transparent" />
          </div>
        )}

        {/* Waveform timeline */}
        {isActive && startedAt && (
          <RecordingTimeline startedAt={startedAt} markers={recoveryMarkers} />
        )}
      </div>
    );
  },
);
