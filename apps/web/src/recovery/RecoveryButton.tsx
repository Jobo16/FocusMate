import { Loader2, RotateCcw } from "lucide-react";

type RecoveryButtonProps = {
  disabled: boolean;
  recovering: boolean;
  onRecover: () => void;
};

export const RecoveryButton = ({ disabled, recovering, onRecover }: RecoveryButtonProps) => (
  <button
    type="button"
    disabled={disabled || recovering}
    onClick={onRecover}
    className="group relative grid aspect-square w-full max-w-[310px] place-items-center overflow-hidden rounded-full bg-ink text-paper shadow-[0_28px_90px_rgba(23,23,23,0.34)] transition active:scale-[0.985] disabled:cursor-not-allowed disabled:bg-ink/35 disabled:shadow-none"
    aria-label="我刚刚错过了什么？"
  >
    <span className="absolute inset-4 rounded-full border border-white/10" />
    <span className="absolute inset-0 bg-[radial-gradient(circle_at_50%_24%,rgba(255,255,255,0.18),transparent_36%)]" />
    <span className="relative grid place-items-center gap-6 px-8 text-center">
      <span className="grid h-16 w-16 place-items-center rounded-full bg-white/10 ring-1 ring-white/15">
        {recovering ? <Loader2 className="h-8 w-8 animate-spin" /> : <RotateCcw className="h-9 w-9" />}
      </span>
      <span className="text-3xl font-semibold leading-tight tracking-tight">我刚刚错过了什么？</span>
    </span>
  </button>
);
