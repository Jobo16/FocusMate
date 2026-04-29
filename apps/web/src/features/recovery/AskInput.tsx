import { Loader2, MessageCircle, Send } from "lucide-react";
import { useState, type FormEvent } from "react";
import type { AskMessage } from "../../stores/recoveryStore";

type AskInputProps = {
  asking: boolean;
  messages: AskMessage[];
  onAsk: (question: string) => void;
};

export const AskInput = ({ asking, messages, onAsk }: AskInputProps) => {
  const [value, setValue] = useState("");

  const handleSubmit = (event: FormEvent) => {
    event.preventDefault();
    const trimmed = value.trim();
    if (!trimmed || asking) return;
    onAsk(trimmed);
    setValue("");
  };

  return (
    <div className="flex flex-col gap-3">
      {/* Header */}
      <div className="flex items-center gap-1.5 text-[13px] font-semibold text-ink/50">
        <MessageCircle className="h-4 w-4" />
        <span>追问内容</span>
      </div>

      {/* Messages */}
      {messages.length > 0 && (
        <div className="flex flex-col gap-2.5">
          {messages.map((msg, i) => (
            <div
              key={i}
              className={`rounded-2xl px-4 py-3 text-[13px] leading-relaxed ${
                msg.role === "user"
                  ? "bg-ink text-paper/90 ml-10 self-end rounded-br-md"
                  : "bg-white/70 text-ink/80 ring-1 ring-black/[0.04] mr-2 rounded-bl-md"
              }`}
            >
              <p className="whitespace-pre-wrap">{msg.content}</p>
            </div>
          ))}
        </div>
      )}

      {/* Input */}
      <form onSubmit={handleSubmit} className="flex items-center gap-2">
        <input
          type="text"
          value={value}
          onChange={(e) => setValue(e.target.value)}
          placeholder="基于当前内容提问..."
          disabled={asking}
          className="flex-1 rounded-full bg-black/[0.03] px-4 py-3 text-[13px] text-ink ring-1 ring-black/[0.06] placeholder:text-ink/25 focus:outline-none focus:ring-2 focus:ring-moss/30 disabled:opacity-40"
        />
        <button
          type="submit"
          disabled={asking || !value.trim()}
          className="grid h-10 w-10 shrink-0 place-items-center rounded-full bg-moss text-white shadow-sm transition active:scale-90 disabled:opacity-30"
          aria-label="发送"
        >
          {asking ? (
            <Loader2 className="h-4 w-4 animate-spin" />
          ) : (
            <Send className="h-4 w-4" />
          )}
        </button>
      </form>
    </div>
  );
};
