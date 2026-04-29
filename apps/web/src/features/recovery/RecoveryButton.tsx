import { Loader2, RotateCcw } from "lucide-react";

type RecoveryButtonProps = {
  disabled: boolean;
  recovering: boolean;
  onRecover: () => void;
};

export const RecoveryButton = ({
  disabled,
  recovering,
  onRecover,
}: RecoveryButtonProps) => (
  <button
    type="button"
    disabled={disabled || recovering}
    onClick={onRecover}
    className="group relative flex h-20 w-20 items-center justify-center rounded-full bg-ink text-paper shadow-[0_12px_40px_rgba(23,23,23,0.28)] transition active:scale-[0.95] disabled:cursor-not-allowed disabled:bg-ink/25 disabled:shadow-none"
    aria-label="我刚刚错过了什么？"
  >
    {/* Inner ring */}
    <span className="absolute inset-1.5 rounded-full border border-white/[0.08]" />
    {/* Highlight */}
    <span className="absolute inset-0 rounded-full bg-[radial-gradient(circle_at_50%_28%,rgba(255,255,255,0.12),transparent_50%)]" />
    {/* Icon */}
    <span className="relative">
      {recovering ? (
        <Loader2 className="h-7 w-7 animate-spin" />
      ) : (
        <RotateCcw className="h-7 w-7 transition-transform group-hover:-rotate-12" />
      )}
    </span>
  </button>
);
