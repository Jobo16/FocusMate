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
    className="grid aspect-square w-full max-w-[280px] place-items-center rounded-full bg-ink text-paper shadow-[0_24px_80px_rgba(23,23,23,0.28)] transition active:scale-[0.98] disabled:cursor-not-allowed disabled:bg-ink/35"
    aria-label="我刚刚错过了什么？"
  >
    <span className="grid place-items-center gap-4 px-8 text-center">
      {recovering ? <Loader2 className="h-10 w-10 animate-spin" /> : <RotateCcw className="h-11 w-11" />}
      <span className="text-2xl font-semibold leading-tight">我刚刚错过了什么？</span>
      <span className="text-sm text-paper/70">{recovering ? "正在接回课堂" : "生成最近内容的恢复卡片"}</span>
    </span>
  </button>
);
