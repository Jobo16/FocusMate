import { memo, useEffect, useState } from "react";
import type { RecoveryMarker } from "../../stores/recoveryStore";

type RecordingTimelineProps = {
  startedAt: number;
  markers: RecoveryMarker[];
};

const BAR_COUNT = 60;
const BUFFER_MAX_SECONDS = 300;

const randomAmp = () => {
  const base = 0.15 + Math.random() * 0.25;
  return Math.random() > 0.82 ? base + 0.3 + Math.random() * 0.25 : base;
};

export const RecordingTimeline = memo(
  ({ startedAt, markers }: RecordingTimelineProps) => {
    const [amplitudes, setAmplitudes] = useState<number[]>(() =>
      Array.from({ length: 8 }, randomAmp),
    );

    useEffect(() => {
      const id = window.setInterval(() => {
        setAmplitudes((prev) => {
          const next = [...prev, randomAmp()];
          return next.slice(-BAR_COUNT);
        });
      }, 1000);
      return () => clearInterval(id);
    }, []);

    const now = Date.now();

    const formatTime = (s: number) => {
      const m = Math.floor(s / 60);
      const sec = s % 60;
      return `${m}:${String(sec).padStart(2, "0")}`;
    };

    // Map markers to bar indices
    const markerBarSet = new Set<number>();
    for (const marker of markers) {
      const ageSeconds = Math.floor((now - marker.timestamp) / 1000);
      const barIndex = amplitudes.length - 1 - ageSeconds;
      if (barIndex >= 0 && barIndex < amplitudes.length) {
        markerBarSet.add(barIndex);
      }
    }

    return (
      <div className="flex flex-col gap-2">
        {/* Waveform — scaleY for GPU-accelerated animation */}
        <div className="relative h-10 w-full overflow-hidden rounded-xl bg-black/[0.03] px-1">
          <div className="flex h-full items-end gap-[3px]">
            {amplitudes.map((amp, i) => {
              const isMarker = markerBarSet.has(i);
              const isLatest = i === amplitudes.length - 1;

              return (
                <div
                  key={i}
                  className="h-full flex-1 origin-bottom will-change-transform"
                  style={{
                    transform: `scaleY(${Math.max(amp, 0.08)})`,
                    backgroundColor: isMarker
                      ? "#d86444"
                      : isLatest
                        ? "#4d6659"
                        : "rgba(77, 102, 89, 0.25)",
                    borderRadius: "2px 2px 0 0",
                    boxShadow: isMarker
                      ? "0 0 6px rgba(216,100,68,0.3)"
                      : "none",
                    transition: "transform 300ms ease-out",
                  }}
                />
              );
            })}
          </div>

          {/* Cursor at right edge */}
          <div className="absolute inset-y-0 right-1 flex items-center">
            <div className="h-6 w-0.5 rounded-full bg-moss shadow-[0_0_6px_rgba(77,102,89,0.5)]" />
          </div>
        </div>

        {/* Labels */}
        <div className="flex items-center justify-between px-1 text-[10px] font-medium text-ink/25">
          <span>0:00</span>
          {markers.length > 0 && (
            <span className="flex items-center gap-1 text-coral/50">
              <span className="inline-block h-1.5 w-1.5 rounded-full bg-coral/50" />
              <span>恢复 {markers.length} 次</span>
            </span>
          )}
          <span>{formatTime(Math.floor((now - startedAt) / 1000))}</span>
        </div>
      </div>
    );
  },
);
