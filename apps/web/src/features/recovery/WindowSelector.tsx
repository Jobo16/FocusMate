import {
  RECOVERY_WINDOWS,
  type RecoveryWindowSeconds,
} from "@focusmate/shared";

type WindowSelectorProps = {
  value: RecoveryWindowSeconds;
  onChange: (value: RecoveryWindowSeconds) => void;
};

const LABELS: Record<RecoveryWindowSeconds, string> = {
  30: "30s",
  60: "60s",
  180: "3min",
};

export const WindowSelector = ({ value, onChange }: WindowSelectorProps) => (
  <div className="inline-flex items-center gap-0.5 rounded-full bg-black/[0.04] p-0.5">
    {RECOVERY_WINDOWS.map((windowSeconds) => (
      <button
        key={windowSeconds}
        type="button"
        onClick={() => onChange(windowSeconds)}
        className={`rounded-full px-3.5 py-1.5 text-[12px] font-semibold transition active:scale-[0.97] ${
          value === windowSeconds
            ? "bg-ink text-paper shadow-sm"
            : "text-ink/35 hover:text-ink/50"
        }`}
      >
        {LABELS[windowSeconds]}
      </button>
    ))}
  </div>
);
