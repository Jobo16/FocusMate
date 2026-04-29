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

### LLM Recovery Cards and Q&A

Set these for model-generated recovery cards and Q&A:

```bash
LLM_API_KEY=your_key
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

Any OpenAI-compatible chat completions endpoint should work if it supports JSON object responses.

If omitted:

- Recovery cards use the local fallback in `apps/server/src/recovery/fallback.ts`.
- Q&A returns a message indicating it requires LLM configuration.

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

## Smoke Test Without Keys

1. Run `pnpm dev`.
2. Open `http://localhost:5173`.
3. Select a mode (课堂 or 会议).
4. Click `开始听课`.
5. Wait for mock transcript buffer to fill.
6. Click the recovery button (dark circle at the bottom).
7. Confirm a recovery card appears in the bottom sheet.
8. Try typing a question in the Q&A input.

## Client-Side Data

All user data is stored in the browser's localStorage:

- **History** (`focusmate-history`): past recovery cards, max 50 entries.
- **Settings** (`focusmate-settings`): default mode and window preferences.
- **Usage** (`focusmate-usage`): cumulative listening time and quota unlock flag.

Clearing browser data resets all of these. There is no server-side persistence.
