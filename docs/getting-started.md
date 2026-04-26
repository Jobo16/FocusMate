# Getting Started

This guide covers local setup for FocusMate v2.

## Requirements

- Node.js 20 or newer
- pnpm 10
- A browser that supports `getUserMedia` and `AudioWorklet`

Current local versions used during setup:

```bash
node -v
pnpm -v
```

## Install

```bash
cd /Users/jobo/projects/FocusMate/foucesmate-v2
pnpm install
cp .env.example .env
```

## Run

```bash
pnpm dev
```

Open:

- Web app: `http://localhost:5173`
- API health: `http://localhost:8787/health`

The dev command first builds `@focusmate/shared`, then starts:

- `@focusmate/server` on port `8787`
- `@focusmate/web` on port `5173`

## API Keys

### DashScope ASR

Set this for real speech-to-text:

```bash
DASHSCOPE_API_KEY=your_dashscope_key
```

If omitted, the server uses mock classroom transcript lines from `apps/server/src/asr/mockTranscript.ts`.

### LLM Recovery Cards

Set these for model-generated recovery cards:

```bash
LLM_API_KEY=your_key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

Any OpenAI-compatible chat completions endpoint should work if it supports JSON object responses.

If omitted, the server uses the local fallback in `apps/server/src/recovery/fallback.ts`.

## Mobile Testing

For a first UI pass, open the LAN URL printed by Vite:

```text
http://<your-lan-ip>:5173
```

For real microphone testing on a phone, prefer HTTPS. Many mobile browsers restrict microphone APIs on non-secure origins. Localhost works on the development machine, but a phone on LAN usually needs a secure context.

Recommended next step for real classroom testing:

- add local HTTPS with `mkcert`
- run the Vite dev server over HTTPS
- open the HTTPS LAN URL on the phone

## Verification Commands

```bash
pnpm typecheck
pnpm build
pnpm test
curl -fsS http://localhost:8787/health
```

Smoke test behavior without keys:

1. Start `pnpm dev`.
2. Open `http://localhost:5173`.
3. Click `开始听课`.
4. Wait for mock transcript buffer to fill.
5. Click `我刚刚错过了什么？`.
6. Confirm a recovery card appears.
