# Development Guide

This guide is for humans and AI agents editing FocusMate v2.

## Product Rules

Keep the MVP narrow.

Allowed:

- improve manual recovery-card flow
- improve mobile classroom UI
- improve ASR reliability
- improve transcript buffering
- improve recovery-card prompt and schema
- add tests around buffer, schema, recovery generation, and UI flow

Avoid for now:

- full transcript dashboard
- full class summary
- account system
- saved course history
- automatic interruption prompts
- chat interface
- database persistence
- meeting integrations

The current question is still:

> When the user taps "我刚刚错过了什么？", can FocusMate return a useful recovery card within 3-8 seconds?

## Change Order

When changing request/response shapes:

1. Update `packages/shared/src/index.ts`.
2. Update server parsing/response code.
3. Update web client and UI.
4. Run `pnpm typecheck`.

When changing recovery quality:

1. Start with `packages/prompts/recovery-card.md`.
2. Update `apps/server/src/recovery/modelClient.ts` only if the model contract changes.
3. Update `apps/server/src/recovery/fallback.ts` if local dev behavior should match.

When changing transcript handling:

1. Update `apps/server/src/buffer/transcriptBuffer.ts`.
2. Add or update tests before touching UI.
3. Keep max buffer and recovery windows explicit.

## Commands

```bash
pnpm install
pnpm dev
pnpm typecheck
pnpm build
pnpm test
```

## Code Style

- TypeScript end-to-end.
- Keep shared contracts in `packages/shared`.
- Keep prompt text in `packages/prompts`.
- Keep route handlers thin.
- Keep the browser UI focused on listening state, recovery trigger, and recovery sheet.
- Do not put API keys or secrets in source files.

## Testing Priorities

Current test suite is not yet populated. The first useful tests should cover:

1. `TranscriptBuffer.getRecent()` window behavior.
2. fallback recovery-card extraction of questions/tasks/deadlines.
3. `RecoverRequestSchema` and `RecoverResponseSchema`.
4. Web UI rendering for disabled/enabled recovery button.
5. API route behavior for missing session and empty transcript.

## Manual Smoke Test

Without API keys:

1. Run `pnpm dev`.
2. Open `http://localhost:5173`.
3. Click `开始听课`.
4. Wait for mock transcript.
5. Click `我刚刚错过了什么？`.
6. Confirm a bottom-sheet recovery card appears.
7. Expand `原文逐字稿`.

With real ASR:

1. Set `DASHSCOPE_API_KEY`.
2. Restart `pnpm dev`.
3. Open the app on a secure origin if testing on mobile.
4. Speak near the microphone.
5. Confirm transcript buffer seconds increase.
6. Trigger a recovery card.

With real LLM:

1. Set `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL`.
2. Restart `pnpm dev`.
3. Trigger a card.
4. Confirm `usedFallback` is false in the network response.

## Git Hygiene

Committed files should include:

- source code
- docs
- lockfile
- `.env.example`

Do not commit:

- `.env`
- `node_modules`
- `dist`
- logs
- local caches

The `.gitignore` is configured for these boundaries.
