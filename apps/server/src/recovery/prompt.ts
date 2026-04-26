import { readFile } from "node:fs/promises";
import path from "node:path";
import { fileURLToPath } from "node:url";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

let cachedPrompt: string | null = null;

export const loadRecoveryPrompt = async () => {
  if (cachedPrompt) return cachedPrompt;
  const promptPath = path.resolve(__dirname, "../../../../packages/prompts/recovery-card.md");
  cachedPrompt = await readFile(promptPath, "utf8");
  return cachedPrompt;
};
