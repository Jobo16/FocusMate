import type { RecoveryCard, TranscriptSegment } from "@focusmate/shared";

const ACTION_PATTERNS = [
  /请大家[^。！？]*/g,
  /大家[^。！？]*(讨论|完成|提交|回答|看一下|注意)[^。！？]*/g,
  /作业[^。！？]*/g,
  /deadline[^。！？]*/gi,
  /下周[^。！？]*(提交|完成|交)[^。！？]*/g,
  /问题是[^。！？]*/g
];

export const buildFallbackRecoveryCard = (
  segments: TranscriptSegment[],
  windowSeconds: number
): RecoveryCard => {
  const transcript = segments.map((segment) => segment.text).join("");
  const text = transcript || "最近还没有可用的课堂转录。";
  const action = extractAction(text);
  const sentences = splitSentences(text);

  return {
    title: "我刚刚错过了什么？",
    windowSeconds,
    summary: sentences.slice(-2).join("") || text.slice(-90),
    action,
    resumePoint: sentences.at(-1) ? `现在先接着听这句相关内容：${sentences.at(-1)}` : "先继续听老师当前讲解，等待下一句转录补齐。",
    keyPoints: sentences.slice(-3).map((sentence) => sentence.replace(/[。！？]$/u, "")).filter(Boolean),
    confidence: segments.length > 0 ? "medium" : "low",
    transcript: text
  };
};

const extractAction = (text: string) => {
  for (const pattern of ACTION_PATTERNS) {
    const match = text.match(pattern)?.[0];
    if (match) return match;
  }
  return "未检测到明确任务";
};

const splitSentences = (text: string) =>
  text
    .split(/(?<=[。！？!?])/u)
    .map((part) => part.trim())
    .filter(Boolean);
