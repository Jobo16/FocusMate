import type { RecoveryCard } from "@focusmate/shared";
import { ChevronDown, ChevronUp, Sparkles, X } from "lucide-react";
import { useRef, useState, type PointerEvent } from "react";

type RecoverySheetProps = {
  card: RecoveryCard | null;
  transcriptOpen: boolean;
  onTranscriptOpenChange: (open: boolean) => void;
  onClose: () => void;
};

export const RecoverySheet = ({ card, transcriptOpen, onTranscriptOpenChange, onClose }: RecoverySheetProps) => {
  const [dragOffset, setDragOffset] = useState(0);
  const [dragging, setDragging] = useState(false);
  const dragStartY = useRef(0);
  const dragOffsetRef = useRef(0);
  const pointerId = useRef<number | null>(null);

  if (!card) return null;
  const copy = CARD_COPY[card.mode];

  const startDrag = (event: PointerEvent<HTMLButtonElement>) => {
    pointerId.current = event.pointerId;
    dragStartY.current = event.clientY;
    setDragging(true);
    event.currentTarget.setPointerCapture(event.pointerId);
  };

  const moveDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return;
    const nextOffset = Math.max(0, event.clientY - dragStartY.current);
    dragOffsetRef.current = nextOffset;
    setDragOffset(nextOffset);
  };

  const endDrag = (event: PointerEvent<HTMLButtonElement>) => {
    if (pointerId.current !== event.pointerId) return;
    const shouldClose = dragOffsetRef.current > 88;
    pointerId.current = null;
    dragOffsetRef.current = 0;
    setDragging(false);
    setDragOffset(0);
    if (shouldClose) onClose();
  };

  return (
    <div
      className={`fixed inset-x-0 bottom-0 z-20 mx-auto flex max-h-[calc(100dvh-16px)] max-w-xl flex-col rounded-t-[30px] bg-paper px-5 pb-[max(24px,env(safe-area-inset-bottom))] pt-3 shadow-sheet ring-1 ring-black/10 ${
        dragging ? "" : "transition-transform duration-200 ease-out"
      }`}
      style={{ transform: `translateY(${dragOffset}px)` }}
    >
      <button
        type="button"
        onPointerDown={startDrag}
        onPointerMove={moveDrag}
        onPointerUp={endDrag}
        onPointerCancel={endDrag}
        className="mx-auto mb-4 flex h-6 w-20 touch-none items-center justify-center rounded-full"
        aria-label="向下拖动收起恢复卡片"
      >
        <span className="h-1.5 w-12 rounded-full bg-black/20" />
      </button>
      <div className="mb-4 flex items-start justify-between gap-4">
        <div>
          <div className="mb-1 flex items-center gap-2 text-sm font-medium text-moss">
            <Sparkles className="h-4 w-4" />
            最近 {card.windowSeconds} 秒
          </div>
          <h2 className="text-3xl font-semibold tracking-tight text-ink">{card.title}</h2>
        </div>
        <button
          type="button"
          onClick={onClose}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-black/5 text-ink/70 transition active:scale-95"
          aria-label="关闭恢复卡片"
        >
          <X className="h-5 w-5" />
        </button>
      </div>

      <div className="grid min-h-0 gap-3 overflow-y-auto pb-1">
        <CardSection label={copy.summaryLabel} content={card.summary} />
        <CardSection label={copy.actionLabel} content={card.action} tone="action" />
        <CardSection label={copy.resumeLabel} content={card.resumePoint} />

        {card.keyPoints.length > 0 ? (
          <section className="rounded-[22px] bg-white/75 p-4 ring-1 ring-black/5">
            <h3 className="mb-2 text-sm font-semibold text-ink/55">{copy.keyPointsLabel}</h3>
            <ul className="grid gap-2 text-sm leading-relaxed text-ink">
              {card.keyPoints.slice(0, 3).map((point) => (
                <li key={point} className="flex gap-2">
                  <span className="mt-2 h-1.5 w-1.5 shrink-0 rounded-full bg-coral" />
                  <span>{point}</span>
                </li>
              ))}
            </ul>
          </section>
        ) : null}

        <section className="rounded-[22px] bg-white/75 p-4 ring-1 ring-black/5">
          <button
            type="button"
            onClick={() => onTranscriptOpenChange(!transcriptOpen)}
            className="flex w-full items-center justify-between text-left text-sm font-semibold text-ink/65"
          >
            {copy.transcriptLabel}
            {transcriptOpen ? <ChevronDown className="h-4 w-4" /> : <ChevronUp className="h-4 w-4" />}
          </button>
          {transcriptOpen ? <p className="mt-3 max-h-32 overflow-y-auto text-sm leading-relaxed text-ink/75">{card.transcript}</p> : null}
        </section>
      </div>
    </div>
  );
};

const CardSection = ({ label, content, tone = "default" }: { label: string; content: string; tone?: "default" | "action" }) => (
  <section className={`rounded-[22px] p-4 ring-1 ring-black/5 ${tone === "action" ? "bg-amber/25" : "bg-white/75"}`}>
    <h3 className="mb-2 text-sm font-semibold text-ink/55">{label}</h3>
    <p className="text-base leading-relaxed text-ink">{content}</p>
  </section>
);

const CARD_COPY = {
  classroom: {
    summaryLabel: "刚刚讲到",
    actionLabel: "现在要做什么",
    resumeLabel: "你现在该接着听",
    keyPointsLabel: "重点信息",
    transcriptLabel: "原文逐字稿"
  },
  meeting: {
    summaryLabel: "刚刚讨论了",
    actionLabel: "决策 / 任务",
    resumeLabel: "我现在需要回应吗",
    keyPointsLabel: "决策和重点",
    transcriptLabel: "原文证据"
  }
} as const;
