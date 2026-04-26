# FocusMate v2

FocusMate v2 is a mobile-first classroom recovery prototype.

The MVP answers one user question:

> 我刚刚错过了什么？

It keeps the interface centered on a manual recovery card, not a live transcript.

## Stack

- pnpm workspace
- Vite + React + TypeScript for the mobile web app
- Fastify + WebSocket for the server
- Shared Zod schemas for client/server contracts
- DashScope realtime ASR, with mock fallback
- OpenAI-compatible recovery-card adapter, with local fallback

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open:

- Web app: `http://localhost:5173`
- API health: `http://localhost:8787/health`

For real transcription:

```bash
export DASHSCOPE_API_KEY="your_key"
```

For model-generated recovery cards:

```bash
export LLM_API_KEY="your_key"
export LLM_BASE_URL="https://api.openai.com/v1"
export LLM_MODEL="gpt-4o-mini"
```

Without these keys, the app still runs with mock transcript and fallback recovery cards.
