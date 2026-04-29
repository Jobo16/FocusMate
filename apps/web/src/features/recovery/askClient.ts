import { AskResponseSchema, type AskResponse, type RecoveryWindowSeconds } from "@focusmate/shared";

export const requestAsk = async (
  sessionId: string,
  question: string,
  windowSeconds?: RecoveryWindowSeconds
): Promise<AskResponse> => {
  const response = await fetch("/api/ask", {
    method: "POST",
    headers: { "content-type": "application/json" },
    body: JSON.stringify({ sessionId, question, windowSeconds }),
  });

  if (!response.ok) {
    throw new Error(`ask_failed_${response.status}`);
  }

  return AskResponseSchema.parse(await response.json());
};
