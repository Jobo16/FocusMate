import type { RecoveryMode, TranscriptSegment } from "@focusmate/shared";
import type { ConnectionState } from "../../stores/connectionStore";
import { PulseIndicator } from "../../components/PulseIndicator";
import { ElapsedTimer } from "./ElapsedTimer";
import { RecordingTimeline } from "./RecordingTimeline";
import type { RecoveryMarker } from "../../stores/recoveryStore";

type ListeningStatusProps = {
  connectionState: ConnectionState;
  statusMessage: string;
  startedAt: number | null;
  secondsAvailable: number;
  transcript: TranscriptSegment[];
  mode: RecoveryMode;
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

export const ListeningStatus = ({
  connectionState,
  statusMessage,
  startedAt,
  secondsAvailable,
  transcript,
  mode,
  recoveryMarkers,
}: ListeningStatusProps) => {
  const config = STATUS_CONFIG[connectionState];
  const latestSegments = transcript.filter((s) => s.isFinal).slice(-3);
  const latestText = latestSegments
    .map((s) => s.text)
    .join("")
    .slice(-180);
  const isActive = connectionState === "listening";

  return (
    <div className="flex flex-col gap-4">
      {/* Status header — compact row */}
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
        <ElapsedTimer startedAt={startedAt} />
      </div>

      {/* Transcript card — the main visual area */}
      {isActive && (
        <div className="relative rounded-2xl bg-white/60 p-4 ring-1 ring-black/[0.04] shadow-sm">
          {latestText ? (
            <p className="text-[15px] leading-[1.7] text-ink/75 line-clamp-3">
              {latestText}
            </p>
          ) : (
            <div className="flex items-center gap-2 py-1">
              <span className="inline-block h-1.5 w-1.5 animate-pulse-slow rounded-full bg-moss/60" />
              <p className="text-sm italic text-ink/30">
                {mode === "meeting" ? "等待会议内容..." : "等待课堂内容..."}
              </p>
            </div>
          )}
          <div className="pointer-events-none absolute inset-x-0 bottom-0 h-6 rounded-b-2xl bg-gradient-to-t from-white/60 to-transparent" />
        </div>
      )}

      {/* Recording timeline */}
      {isActive && startedAt && (
        <RecordingTimeline
          startedAt={startedAt}
          markers={recoveryMarkers}
          bufferSeconds={secondsAvailable}
        />
      )}
    </div>
  );
};
