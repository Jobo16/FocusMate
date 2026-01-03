# FocusMate Demo (DashScope-ready)

## Quick start

```bash
npm install
npm run dev
```

Open `http://localhost:5173` on mobile (same LAN) or desktop.

## DashScope setup

```bash
export DASHSCOPE_API_KEY="your_api_key"
```

If no API key is set, the server falls back to a mock transcript stream.

## What this demo does

- Provides a mobile-first UI for transcription display.
- Uses WebSocket to stream PCM audio from the browser to the server.
- Resamples to 16k PCM on the server before forwarding to DashScope.

## Where the real-time relay lives

Server file: `src/server.ts`

Replace or extend the DashScope message handling if you want richer metadata.
