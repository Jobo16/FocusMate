import { Radio, WifiOff } from "lucide-react";

type StatusPillProps = {
  state: string;
  message: string;
  secondsAvailable: number;
};

export const StatusPill = ({ state, message, secondsAvailable }: StatusPillProps) => {
  const listening = state === "listening";

  return (
    <div className="flex items-center justify-between gap-3 rounded-full border border-black/10 bg-white/70 px-4 py-3 text-sm shadow-sm backdrop-blur">
      <div className="flex min-w-0 items-center gap-2">
        {listening ? <Radio className="h-4 w-4 text-moss" /> : <WifiOff className="h-4 w-4 text-ink/50" />}
        <span className="truncate font-medium text-ink">{listening ? "正在听课" : "未开始监听"}</span>
      </div>
      <div className="flex shrink-0 items-center gap-2 text-xs text-ink/55">
        <span>{message}</span>
        <span>·</span>
        <span>{secondsAvailable}s 缓冲</span>
      </div>
    </div>
  );
};
