import { RECOVERY_WINDOWS, type RecoveryWindowSeconds } from "@focusmate/shared";

type WindowSelectorProps = {
  value: RecoveryWindowSeconds;
  onChange: (value: RecoveryWindowSeconds) => void;
};

const LABELS: Record<RecoveryWindowSeconds, string> = {
  30: "30 秒",
  60: "60 秒",
  180: "3 分钟"
};

export const WindowSelector = ({ value, onChange }: WindowSelectorProps) => (
  <div className="grid grid-cols-3 rounded-2xl bg-white/70 p-1 shadow-sm ring-1 ring-black/10">
    {RECOVERY_WINDOWS.map((windowSeconds) => (
      <button
        key={windowSeconds}
        type="button"
        onClick={() => onChange(windowSeconds)}
        className={`rounded-xl px-3 py-3 text-sm font-medium transition ${
          value === windowSeconds ? "bg-ink text-paper shadow-sm" : "text-ink/60"
        }`}
      >
        {LABELS[windowSeconds]}
      </button>
    ))}
  </div>
);
