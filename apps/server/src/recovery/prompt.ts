import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";
import type { RecoveryMode } from "@focusmate/shared";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const cachedPrompts = new Map<RecoveryMode, string>();

export const loadRecoveryPrompt = async (mode: RecoveryMode) => {
  const cached = cachedPrompts.get(mode);
  if (cached) return cached;

  const promptPath = path.resolve(__dirname, `../../../../packages/prompts/recovery-card-${mode}.md`);
  const prompt = await readFile(promptPath, "utf8");
  cachedPrompts.set(mode, prompt);
  return prompt;
};
