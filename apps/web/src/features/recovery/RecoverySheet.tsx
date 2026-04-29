import type { RecoveryCard } from "@focusmate/shared";
import { Check, Copy, Sparkles, X } from "lucide-react";
import { useState } from "react";
import { Sheet } from "../../components/Sheet";
import type { AskMessage } from "../../stores/recoveryStore";
import { AskInput } from "./AskInput";

type RecoverySheetProps = {
  card: RecoveryCard | null;
  asking: boolean;
  askMessages: AskMessage[];
  onAsk: (question: string) => void;
  onClose: () => void;
};

export const RecoverySheet = ({
  card,
  asking,
  askMessages,
  onAsk,
  onClose,
}: RecoverySheetProps) => {
  const [transcriptCopied, setTranscriptCopied] = useState(false);

  if (!card) return null;
  const copy = CARD_COPY[card.mode];

  const copyTranscript = async () => {
    await writeClipboardText(card.transcript);
    setTranscriptCopied(true);
    window.setTimeout(() => setTranscriptCopied(false), 1400);
  };

  return (
    <Sheet open={!!card} onClose={onClose}>
      {/* Header */}
      <div className="mb-5 flex items-start justify-between gap-4">
        <div className="min-w-0 flex-1">
          <div className="flex items-center gap-2 text-[13px] font-semibold text-moss">
            <Sparkles className="h-4 w-4 shrink-0" />
            最近 {card.windowSeconds} 秒
          </div>
          {card.keyPoints.length > 0 && (
            <div className="mt-2.5 flex flex-wrap gap-1.5">
              {card.keyPoints.map((point, i) => (
                <span
                  key={i}
                  className="rounded-full bg-moss/[0.08] px-2.5 py-1 text-xs font-medium text-moss"
                >
                  {point}
                </span>
              ))}
            </div>
          )}
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-black/[0.04] text-ink/40 transition active:scale-90"
          aria-label="关闭"
        >
          <X className="h-4 w-4" />
        </button>
      </div>

      {/* Card content */}
      <div className="mb-5 rounded-2xl bg-white/70 p-5 shadow-sm ring-1 ring-black/[0.04]">
        <ContentBlock label={copy.summaryLabel} content={card.summary} />
        <ContentBlock label={copy.actionLabel} content={card.action} />
        <ContentBlock label={copy.resumeLabel} content={card.resumePoint} />
        <ContentBlock
          label={copy.transcriptLabel}
          content={card.transcript}
          muted
          action={
            <button
              type="button"
              onClick={copyTranscript}
              className="flex items-center gap-1 rounded-full bg-black/[0.04] px-2 py-1 text-[11px] text-ink/45 transition active:scale-95"
              aria-label="复制原文"
            >
              {transcriptCopied ? (
                <>
                  <Check className="h-3 w-3 text-moss" />
                  <span className="text-moss">已复制</span>
                </>
              ) : (
                <>
                  <Copy className="h-3 w-3" />
                  <span>复制</span>
                </>
              )}
            </button>
          }
        />
      </div>

      {/* Ask section — integrated into the card */}
      <AskInput asking={asking} messages={askMessages} onAsk={onAsk} />
    </Sheet>
  );
};

const ContentBlock = ({
  label,
  content,
  muted = false,
  action,
}: {
  label: string;
  content: string;
  muted?: boolean;
  action?: React.ReactNode;
}) => (
  <section className="mb-4 last:mb-0">
    <div className="mb-1.5 flex items-center justify-between gap-3">
      <strong className="block text-[13px] font-semibold text-ink/70">
        {label}
      </strong>
      {action}
    </div>
    <p
      className={`whitespace-pre-wrap leading-relaxed ${muted ? "text-[13px] text-ink/50" : "text-[15px] text-ink/85"}`}
    >
      {content}
    </p>
  </section>
);

const writeClipboardText = async (text: string) => {
  if (navigator.clipboard?.writeText) {
    await navigator.clipboard.writeText(text);
    return;
  }
  const textarea = document.createElement("textarea");
  textarea.value = text;
  textarea.setAttribute("readonly", "");
  textarea.style.position = "fixed";
  textarea.style.opacity = "0";
  document.body.appendChild(textarea);
  textarea.select();
  document.execCommand("copy");
  document.body.removeChild(textarea);
};

const CARD_COPY = {
  classroom: {
    summaryLabel: "刚刚讲到",
    actionLabel: "现在要做什么",
    resumeLabel: "你现在该接着听",
    transcriptLabel: "原文逐字稿",
  },
  meeting: {
    summaryLabel: "刚刚讨论了",
    actionLabel: "决策 / 任务",
    resumeLabel: "我现在需要回应吗",
    transcriptLabel: "原文证据",
  },
} as const;
