import type { RecoveryCard, RecoveryMode, TranscriptSegment } from "@focusmate/shared";

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
  windowSeconds: number,
  mode: RecoveryMode = "classroom"
): RecoveryCard => {
  const transcript = segments.map((segment) => segment.text).join("");
  const text = transcript || (mode === "meeting" ? "最近还没有可用的会议转录。" : "最近还没有可用的课堂转录。");
  const action = extractAction(text);
  const sentences = splitSentences(text);
  const latestSentence = sentences.at(-1);

  return {
    title: "我刚刚错过了什么？",
    mode,
    windowSeconds,
    summary: sentences.slice(-2).join("") || text.slice(-90),
    action,
    resumePoint: latestSentence ? buildResumePoint(mode, latestSentence) : buildEmptyResumePoint(mode),
    keyPoints: sentences.slice(-3).map((sentence) => sentence.replace(/[。！？]$/u, "")).filter(Boolean),
    confidence: segments.length > 0 ? "medium" : "low",
    transcript: text
  };
};

const buildResumePoint = (mode: RecoveryMode, latestSentence: string) => {
  if (mode === "meeting") {
    return `先接回这段讨论：${latestSentence}`;
  }
  return `现在先接着听这句相关内容：${latestSentence}`;
};

const buildEmptyResumePoint = (mode: RecoveryMode) => {
  if (mode === "meeting") return "先继续听当前讨论，等待下一句转录补齐。";
  return "先继续听老师当前讲解，等待下一句转录补齐。";
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
