import { BookOpen, BriefcaseBusiness } from "lucide-react";
import { RECOVERY_MODES, type RecoveryMode } from "@focusmate/shared";

type ModeSelectorProps = {
  value: RecoveryMode;
  disabled?: boolean;
  onChange: (value: RecoveryMode) => void;
};

const LABELS: Record<RecoveryMode, { title: string; subtitle: string; icon: typeof BookOpen }> = {
  classroom: {
    title: "课堂",
    subtitle: "提问 / 任务",
    icon: BookOpen
  },
  meeting: {
    title: "会议",
    subtitle: "决策 / 回应",
    icon: BriefcaseBusiness
  }
};

export const ModeSelector = ({ value, disabled = false, onChange }: ModeSelectorProps) => (
  <div className="grid grid-cols-2 gap-1 rounded-full bg-white/80 p-1.5 shadow-sm ring-1 ring-black/10">
    {RECOVERY_MODES.map((mode) => {
      const active = value === mode;
      const Icon = LABELS[mode].icon;
      return (
        <button
          key={mode}
          type="button"
          disabled={disabled}
          onClick={() => onChange(mode)}
          className={`flex items-center justify-center gap-2 rounded-full px-3 py-2.5 transition disabled:cursor-not-allowed ${
            active ? "bg-ink text-paper shadow-sm" : "text-ink/60"
          }`}
        >
          <Icon className="h-4 w-4" />
          <span className="text-sm font-semibold">{LABELS[mode].title}</span>
          <span className={`hidden text-xs sm:inline ${active ? "text-paper/60" : "text-ink/40"}`}>{LABELS[mode].subtitle}</span>
        </button>
      );
    })}
  </div>
);
