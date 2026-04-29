import { useEffect, useRef, useState } from "react";

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

export const ElapsedTimer = ({ startedAt }: ElapsedTimerProps) => {
  const [elapsed, setElapsed] = useState(0);
  const intervalRef = useRef<number | null>(null);

  useEffect(() => {
    if (!startedAt) {
      setElapsed(0);
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
      return;
    }

    const update = () => setElapsed(Date.now() - startedAt);
    update();
    intervalRef.current = window.setInterval(update, 1000);

    return () => {
      if (intervalRef.current) {
        clearInterval(intervalRef.current);
        intervalRef.current = null;
      }
    };
  }, [startedAt]);

  if (!startedAt) return null;

  return (
    <span className="tabular-nums text-ink/50 text-sm font-medium" aria-label={`已录音 ${formatElapsed(elapsed)}`}>
      {formatElapsed(elapsed)}
    </span>
  );
};
