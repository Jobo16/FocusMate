import { RecoverResponseSchema, type RecoverResponse, type RecoveryWindowSeconds } from "@focusmate/shared";

export const requestRecoveryCard = async (
  sessionId: string,
  windowSeconds: RecoveryWindowSeconds
): Promise<RecoverResponse> => {
  const response = await fetch("/api/recover", {
    method: "POST",
    headers: {
      "content-type": "application/json"
    },
    body: JSON.stringify({
      sessionId,
      windowSeconds
    })
  });

  if (!response.ok) {
    throw new Error(`recover_failed_${response.status}`);
  }

  return RecoverResponseSchema.parse(await response.json());
};
