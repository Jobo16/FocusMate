import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { TranscriptSegment } from "@focusmate/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedPrompt: string | null = null;

const loadQaPrompt = async (): Promise<string> => {
  if (cachedPrompt) return cachedPrompt;
  const promptPath = path.resolve(__dirname, "../../../../packages/prompts/transcript-qa.md");
  cachedPrompt = await readFile(promptPath, "utf8");
  return cachedPrompt;
};

export type QaResult = {
  answer: string;
  model: string;
};

export const answerFromTranscript = async (
  segments: TranscriptSegment[],
  question: string
): Promise<QaResult> => {
  const transcript = segments.map((s) => s.text).join("");
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  if (!apiKey) {
    return {
      answer: "需要配置 LLM 服务才能使用提问功能。请在 .env 中设置 LLM_API_KEY。",
      model: "unavailable",
    };
  }

  if (!transcript.trim()) {
    return {
      answer: "目前还没有足够的逐字稿内容。请等待更多内容被记录后再试。",
      model: "unavailable",
    };
  }

  const systemPrompt = await loadQaPrompt();
  const filledPrompt = systemPrompt
    .replace("{transcript}", transcript)
    .replace("{question}", question);

  try {
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json",
      },
      body: JSON.stringify({
        model,
        temperature: 0.3,
        messages: [
          { role: "system", content: filledPrompt },
          { role: "user", content: question },
        ],
      }),
    });

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.status}`);
    }

    const data: any = await response.json();
    const answer = data?.choices?.[0]?.message?.content ?? "无法生成回答，请重试。";
    return { answer, model };
  } catch {
    return {
      answer: "提问服务暂时不可用，请稍后再试。",
      model: `${model}:error`,
    };
  }
};
