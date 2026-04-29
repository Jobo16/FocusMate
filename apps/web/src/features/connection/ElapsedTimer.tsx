import { useEffect, useRef } from "react";

type ElapsedTimerProps = {
  startedAt: number | null;
};

const formatElapsed = (ms: number): string => {
  const totalSeconds = Math.floor(ms / 1000);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const seconds = totalSeconds % 60;

  if (hours > 0) {
    return `${hours}:${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
  }
  return `${String(minutes).padStart(2, "0")}:${String(seconds).padStart(2, "0")}`;
};

// Uses direct DOM updates via ref — zero re-renders
export const ElapsedTimer = ({ startedAt }: ElapsedTimerProps) => {
  const ref = useRef<HTMLSpanElement>(null);

  useEffect(() => {
    if (!startedAt || !ref.current) return;

    const update = () => {
      if (ref.current) {
        ref.current.textContent = formatElapsed(Date.now() - startedAt);
      }
    };

    update();
    const id = window.setInterval(update, 1000);
    return () => clearInterval(id);
  }, [startedAt]);

  if (!startedAt) return null;

  return (
    <span
      ref={ref}
      className="tabular-nums text-ink/50 text-sm font-medium"
      aria-label="录音计时"
    >
      {formatElapsed(0)}
    </span>
  );
};
