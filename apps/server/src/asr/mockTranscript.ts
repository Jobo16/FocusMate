import type { TranscriptBuffer } from "../buffer/transcriptBuffer.js";

const MOCK_LINES = [
  "我们刚刚在看这段文章的主旨句。",
  "老师说这里的重点不是单词本身，而是作者的态度。",
  "接下来请大家看第三段，找出 supporting details。",
  "这个问题等会儿会让大家分组讨论。",
  "注意 deadline 是下周三课前提交。"
];

export const startMockTranscript = (
  buffer: TranscriptBuffer,
  emitTranscript: (text: string, isFinal: boolean) => void,
  emitStatus: (message: string) => void
) => {
  let index = 0;
  emitStatus("mock_mode");

  const timer = setInterval(() => {
    const text = MOCK_LINES[index % MOCK_LINES.length] ?? "";
    index += 1;
    buffer.addFinal(text, "mock");
    emitTranscript(text, true);
  }, 1800);

  return () => {
    clearInterval(timer);
    emitStatus("mock_stopped");
  };
};
