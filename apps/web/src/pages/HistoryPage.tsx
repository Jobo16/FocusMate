import {
  BookOpen,
  BriefcaseBusiness,
  ChevronDown,
  Clock,
  Sparkles,
  Trash2,
} from "lucide-react";
import { useState } from "react";
import { useHistoryStore, type HistoryEntry } from "../stores/recoveryStore";

export const HistoryPage = () => {
  const { history, clearHistory } = useHistoryStore();
  const [expandedId, setExpandedId] = useState<string | null>(null);

  if (history.length === 0) {
    return (
      <div className="flex flex-1 flex-col items-center justify-center gap-4 px-8 text-center">
        <div className="grid h-16 w-16 place-items-center rounded-full bg-ink/[0.04]">
          <Clock className="h-7 w-7 text-ink/20" />
        </div>
        <div>
          <p className="text-base font-semibold text-ink/60">暂无历史记录</p>
          <p className="mt-1.5 text-sm text-ink/35">
            使用恢复功能后，卡片会自动保存在这里
          </p>
        </div>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-3 overflow-y-auto pb-4">
      {/* Header */}
      <div className="flex items-center justify-between py-1">
        <span className="text-xs text-ink/30">共 {history.length} 条</span>
        <button
          type="button"
          onClick={clearHistory}
          className="flex items-center gap-1 rounded-full px-2 py-1 text-[11px] text-ink/30 transition hover:text-coral"
        >
          <Trash2 className="h-3 w-3" />
          清空
        </button>
      </div>

      {/* List */}
      {history.map((entry) => {
        const expanded = expandedId === entry.id;
        const ModeIcon =
          entry.mode === "meeting" ? BriefcaseBusiness : BookOpen;
        const time = new Date(entry.timestamp).toLocaleTimeString("zh-CN", {
          hour: "2-digit",
          minute: "2-digit",
        });
        const date = new Date(entry.timestamp).toLocaleDateString("zh-CN", {
          month: "short",
          day: "numeric",
        });

        return (
          <div
            key={entry.id}
            className="rounded-2xl bg-white/60 p-4 ring-1 ring-black/[0.04] shadow-sm transition"
          >
            {/* Entry header */}
            <button
              type="button"
              onClick={() => setExpandedId(expanded ? null : entry.id)}
              className="flex w-full items-center gap-3 text-left"
            >
              <div className="grid h-8 w-8 shrink-0 place-items-center rounded-full bg-ink/[0.04]">
                <ModeIcon className="h-4 w-4 text-ink/40" />
              </div>
              <div className="min-w-0 flex-1">
                <p className="truncate text-[13px] font-medium text-ink/80">
                  {entry.card.summary.slice(0, 50)}
                </p>
                <div className="mt-0.5 flex items-center gap-1.5 text-[11px] text-ink/30">
                  <span>
                    {date} {time}
                  </span>
                  <span>·</span>
                  <span>{entry.card.windowSeconds}s</span>
                </div>
              </div>
              <ChevronDown
                className={`h-4 w-4 shrink-0 text-ink/20 transition-transform ${expanded ? "rotate-180" : ""}`}
              />
            </button>

            {/* Expanded content */}
            {expanded && (
              <div className="mt-4 space-y-3 border-t border-black/[0.04] pt-4">
                {entry.card.keyPoints.length > 0 && (
                  <div className="flex flex-wrap gap-1.5">
                    {entry.card.keyPoints.map((point, i) => (
                      <span
                        key={i}
                        className="rounded-full bg-moss/[0.08] px-2.5 py-0.5 text-[11px] font-medium text-moss"
                      >
                        {point}
                      </span>
                    ))}
                  </div>
                )}
                <ContentSection label="刚刚讲到" content={entry.card.summary} />
                <ContentSection
                  label="现在要做什么"
                  content={entry.card.action}
                />
                <ContentSection
                  label="该接着听"
                  content={entry.card.resumePoint}
                />
              </div>
            )}
          </div>
        );
      })}
    </div>
  );
};

const ContentSection = ({
  label,
  content,
}: {
  label: string;
  content: string;
}) => (
  <div>
    <p className="mb-1 text-[11px] font-semibold text-ink/35">{label}</p>
    <p className="text-[13px] leading-relaxed text-ink/70">{content}</p>
  </div>
);
