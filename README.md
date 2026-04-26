# FocusMate v2

FocusMate v2 is a mobile-first classroom recovery prototype.

The product answers one urgent classroom question:

> 我刚刚错过了什么？

It is not a generic transcript page, note-taking app, chatbot, or full class summary tool. The first version is a manual recovery card: the student taps once, FocusMate reads the recent transcript buffer, then returns a short Chinese card that helps the student rejoin the class.

## Current MVP

- Mobile-first web app, optimized for phone use in class.
- Manual trigger: `我刚刚错过了什么？`
- Recovery windows: 30 seconds, 60 seconds, 3 minutes.
- Recovery card sections:
  - `刚刚讲到`
  - `现在要做什么`
  - `你现在该接着听`
  - expandable original transcript
- Realtime audio capture through browser microphone.
- DashScope realtime ASR support, with mock transcript fallback.
- OpenAI-compatible LLM recovery-card generation, with local fallback.

## Tech Stack

| Layer | Choice |
| --- | --- |
| Workspace | pnpm workspaces |
| Web | Vite + React + TypeScript |
| UI | Tailwind CSS + mobile-first custom components |
| State | Zustand |
| Server | Node.js + Fastify + WebSocket |
| ASR | DashScope realtime recognition |
| LLM | OpenAI-compatible chat completions endpoint |
| Contracts | Zod schemas in `packages/shared` |
| Prompt | Markdown prompt in `packages/prompts` |

## Repository Layout

```text
apps/
  web/        Mobile web app
  server/     Fastify API, WebSocket, ASR relay, recovery generation
packages/
  shared/     Zod schemas and shared TypeScript types
  prompts/    Recovery-card prompt
docs/
  architecture.md
  getting-started.md
  data-flow.md
  api.md
  development.md
  office-hours/
```

## Quick Start

```bash
pnpm install
cp .env.example .env
pnpm dev
```

Open:

- Web app: [http://localhost:5173](http://localhost:5173)
- API health: [http://localhost:8787/health](http://localhost:8787/health)

Without API keys, the app still runs:

- transcript source falls back to mock classroom text
- recovery-card generation falls back to local rules

## Environment

Configure `.env` at the repository root:

```bash
PORT=8787
HOST=0.0.0.0

DASHSCOPE_API_KEY=

LLM_API_KEY=
LLM_BASE_URL=https://api.openai.com/v1
LLM_MODEL=gpt-4o-mini
```

Do not commit `.env`. Use `.env.example` for documented placeholders.

## Scripts

```bash
pnpm dev        # build shared package, then start server and web app
pnpm typecheck  # TypeScript checks
pnpm build      # production build
pnpm test       # Vitest, currently no test files yet
```

## Documentation

- [Getting Started](docs/getting-started.md)
- [Architecture](docs/architecture.md)
- [Data Flow](docs/data-flow.md)
- [API and Protocols](docs/api.md)
- [Development Guide](docs/development.md)
- [Office Hours Product Decision](docs/office-hours/office-hours-20260426-225918-classroom-recovery-card.md)

## Important Product Boundary

Keep the MVP narrow:

1. Manual trigger first.
2. Recovery card first.
3. Transcript as evidence, not the main surface.
4. No automatic prompts until manual recovery proves useful.
5. First useful card should appear in 3-8 seconds.

If a change pushes the app toward "full transcript dashboard" or "AI note-taking platform," it is probably outside the current MVP.
