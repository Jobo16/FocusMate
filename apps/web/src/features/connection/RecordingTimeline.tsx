import { useEffect, useState } from "react";
import type { RecoveryMarker } from "../../stores/recoveryStore";

type RecordingTimelineProps = {
  startedAt: number;
  markers: RecoveryMarker[];
  bufferSeconds: number;
};

const BUFFER_MAX_SECONDS = 300; // 5 minutes max buffer

export const RecordingTimeline = ({
  startedAt,
  markers,
  bufferSeconds,
}: RecordingTimelineProps) => {
  const [, setTick] = useState(0);

  useEffect(() => {
    const id = window.setInterval(() => setTick((t) => t + 1), 1000);
    return () => clearInterval(id);
  }, []);

  const elapsed = Date.now() - startedAt;
  const elapsedSeconds = Math.floor(elapsed / 1000);
  const bufferPercent = Math.min(
    (bufferSeconds / BUFFER_MAX_SECONDS) * 100,
    100,
  );

  const formatTime = (s: number) => {
    const m = Math.floor(s / 60);
    const sec = s % 60;
    return `${m}:${String(sec).padStart(2, "0")}`;
  };

  return (
    <div className="flex flex-col gap-1.5">
      {/* Timeline bar */}
      <div className="relative h-8 w-full">
        {/* Background track */}
        <div className="absolute inset-x-0 top-3 h-2 rounded-full bg-black/[0.05]" />

        {/* Buffer progress — lighter green */}
        <div
          className="absolute top-3 left-0 h-2 rounded-full bg-moss/25 transition-all duration-1000 ease-linear"
          style={{ width: `${Math.min(bufferPercent, 100)}%` }}
        />

        {/* Elapsed progress — solid green */}
        <div
          className="absolute top-3 left-0 h-2 rounded-full bg-gradient-to-r from-moss/60 to-moss transition-all duration-1000 ease-linear"
          style={{
            width: `${Math.min((elapsedSeconds / BUFFER_MAX_SECONDS) * 100, 100)}%`,
          }}
        />

        {/* Recovery markers */}
        {markers.map((marker) => {
          const markerElapsed = (marker.timestamp - startedAt) / 1000;
          const markerPercent = Math.min(
            (markerElapsed / BUFFER_MAX_SECONDS) * 100,
            100,
          );
          return (
            <div
              key={marker.id}
              className="absolute top-0 flex flex-col items-center"
              style={{
                left: `${markerPercent}%`,
                transform: "translateX(-50%)",
              }}
              title={`恢复于 ${formatTime(Math.floor(markerElapsed))}`}
            >
              {/* Marker diamond */}
              <div className="h-4 w-4 rotate-45 rounded-[3px] bg-coral shadow-sm ring-2 ring-paper" />
            </div>
          );
        })}
      </div>

      {/* Labels */}
      <div className="flex items-center justify-between px-0.5 text-[10px] font-medium text-ink/30">
        <span>{formatTime(elapsedSeconds)}</span>
        {markers.length > 0 && (
          <span className="flex items-center gap-1 text-coral/60">
            <span className="inline-block h-2 w-2 rotate-45 rounded-[1px] bg-coral/50" />
            <span>已恢复 {markers.length} 次</span>
          </span>
        )}
        <span>缓冲 {formatTime(bufferSeconds)}</span>
      </div>
    </div>
  );
};
