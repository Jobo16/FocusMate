import { RecoveryCardSchema, type RecoveryCard, type TranscriptSegment } from "@focusmate/shared";
import { z } from "zod";
import { buildFallbackRecoveryCard } from "./fallback.js";
import { loadRecoveryPrompt } from "./prompt.js";

const ModelPayloadSchema = z.object({
  summary: z.string(),
  action: z.string(),
  resumePoint: z.string(),
  keyPoints: z.array(z.string()).default([]),
  confidence: z.enum(["high", "medium", "low"]).default("medium")
});

export type GenerateRecoveryResult = {
  card: RecoveryCard;
  model: string;
  usedFallback: boolean;
};

export const generateRecoveryCard = async (
  segments: TranscriptSegment[],
  windowSeconds: number
): Promise<GenerateRecoveryResult> => {
  const transcript = segments.map((segment) => segment.text).join("");
  const apiKey = process.env.LLM_API_KEY || process.env.OPENAI_API_KEY;
  const baseUrl = (process.env.LLM_BASE_URL || process.env.OPENAI_BASE_URL || "https://api.openai.com/v1").replace(/\/$/, "");
  const model = process.env.LLM_MODEL || "gpt-4o-mini";

  if (!apiKey || !transcript.trim()) {
    return {
      card: buildFallbackRecoveryCard(segments, windowSeconds),
      model: apiKey ? "fallback-empty-transcript" : "fallback-no-llm-key",
      usedFallback: true
    };
  }

  try {
    const systemPrompt = await loadRecoveryPrompt();
    const response = await fetch(`${baseUrl}/chat/completions`, {
      method: "POST",
      headers: {
        Authorization: `Bearer ${apiKey}`,
        "content-type": "application/json"
      },
      body: JSON.stringify({
        model,
        temperature: 0.2,
        response_format: { type: "json_object" },
        messages: [
          { role: "system", content: systemPrompt },
          {
            role: "user",
            content: JSON.stringify({
              windowSeconds,
              transcript
            })
          }
        ]
      })
    });

    if (!response.ok) {
      throw new Error(`LLM request failed: ${response.status}`);
    }

    const data: any = await response.json();
    const content = data?.choices?.[0]?.message?.content;
    const parsed = ModelPayloadSchema.parse(JSON.parse(content));
    const card = RecoveryCardSchema.parse({
      title: "我刚刚错过了什么？",
      windowSeconds,
      ...parsed,
      transcript
    });

    return {
      card,
      model,
      usedFallback: false
    };
  } catch {
    return {
      card: buildFallbackRecoveryCard(segments, windowSeconds),
      model: `${model}:fallback`,
      usedFallback: true
    };
  }
};
