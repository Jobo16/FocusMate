import type { ReactNode } from "react";

type Option<T extends string> = {
  value: T;
  label: string;
  subtitle?: string;
  icon?: ReactNode;
};

type SegmentedControlProps<T extends string> = {
  value: T;
  options: Option<T>[];
  onChange: (value: T) => void;
  disabled?: boolean;
};

export const SegmentedControl = <T extends string>({
  value,
  options,
  onChange,
  disabled = false,
}: SegmentedControlProps<T>) => (
  <div className="inline-flex items-center gap-0.5 rounded-full bg-black/[0.04] p-0.5">
    {options.map((option) => {
      const active = value === option.value;
      return (
        <button
          key={option.value}
          type="button"
          disabled={disabled}
          onClick={() => onChange(option.value)}
          className={`flex items-center gap-1.5 rounded-full px-4 py-2 text-[13px] font-semibold transition disabled:cursor-not-allowed active:scale-[0.97] ${
            active
              ? "bg-ink text-paper shadow-sm"
              : "text-ink/40 hover:text-ink/60"
          }`}
        >
          {option.icon}
          <span>{option.label}</span>
        </button>
      );
    })}
  </div>
);
