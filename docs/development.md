# Development Guide

This guide is for humans and AI agents editing FocusMate v2.

## Product Rules

Keep the MVP narrow.

Allowed:

- improve manual recovery-card flow
- improve mode-specific classroom/meeting recovery
- improve mobile classroom UI
- improve ASR reliability
- improve transcript buffering
- improve recovery-card prompt and schema
- improve inline Q&A experience
- improve usage quota UX

Avoid for now:

- full transcript dashboard
- full class summary
- full meeting minutes
- account system
- saved course history
- automatic interruption prompts
- chat interface with conversation history
- server-side database persistence
- meeting integrations

The current question is still:

> When the user taps "我刚刚错过了什么？", can FocusMate return a useful recovery card within 3-8 seconds?

## Project Structure

```text
apps/web/src/
  app/            App.tsx (router), Layout.tsx (shell + bottom nav)
  pages/          HomePage, HistoryPage, SettingsPage
  features/
    connection/   useConnection hook, ListeningStatus, RecordingTimeline, ElapsedTimer
    recovery/     useRecovery hook, RecoveryButton, RecoverySheet, AskInput, API clients
  stores/         connectionStore, recoveryStore, settingsStore, routerStore, usageStore
  components/     Sheet, SegmentedControl, PulseIndicator
  audio/          audioClient (getUserMedia + AudioWorklet)
  ws/             transcriptSocket (WebSocket client)
  styles/         global.css
  utils/          uuid.ts

apps/server/src/
  index.ts        Fastify bootstrap
  routes/         recover.ts, ask.ts
  recovery/       modelClient.ts, qaClient.ts, fallback.ts, prompt.ts
  buffer/         sessionStore.ts, transcriptBuffer.ts
  asr/            dashscope.ts, mockTranscript.ts, resampler.ts
  ws/             transcriptSocket.ts
  config/         env.ts

packages/shared/src/
  index.ts        All Zod schemas and TypeScript types

packages/prompts/
  recovery-card-classroom.md
  recovery-card-meeting.md
  transcript-qa.md
```

## Change Order

When changing request/response shapes:

1. Update `packages/shared/src/index.ts`.
2. Update server parsing/response code.
3. Update web client and UI.
4. Run `pnpm typecheck`.

When changing recovery quality:

1. Start with `packages/prompts/recovery-card-classroom.md` or `packages/prompts/recovery-card-meeting.md`.
2. Update `apps/server/src/recovery/modelClient.ts` only if the model contract changes.
3. Update `apps/server/src/recovery/fallback.ts` if local dev behavior should match.

When changing Q&A quality:

1. Start with `packages/prompts/transcript-qa.md`.
2. Update `apps/server/src/recovery/qaClient.ts` only if the model contract changes.

When changing transcript handling:

1. Update `apps/server/src/buffer/transcriptBuffer.ts`.
2. Keep max buffer and recovery windows explicit.

When changing UI:

1. Components live in `apps/web/src/components/` (reusable) or `apps/web/src/features/` (domain-specific).
2. Pages live in `apps/web/src/pages/`.
3. Stores live in `apps/web/src/stores/`. Use `zustand/persist` for data that should survive page reload.
4. Run `pnpm typecheck` after changes.

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
- Keep modes explicit. Current modes are `classroom` and `meeting`.
- Keep route handlers thin.
- Use Zustand selectors to minimize re-renders.
- Use `React.memo` on components that receive stable props.
- Do not put API keys or secrets in source files.

## Manual Smoke Test

Without API keys:

1. Run `pnpm dev`.
2. Open `http://localhost:5173`.
3. Click `开始听课`.
4. Wait for mock transcript.
5. Click the recovery button (dark circle).
6. Confirm a bottom-sheet recovery card appears.
7. Try asking a question in the Q&A input.

With real ASR:

1. Set `DASHSCOPE_API_KEY`.
2. Restart `pnpm dev`.
3. Open the app on a secure origin if testing on mobile.
4. Speak near the microphone.
5. Confirm transcript appears in the card area.
6. Trigger a recovery card.

With real LLM:

1. Set `LLM_API_KEY`, `LLM_BASE_URL`, and `LLM_MODEL`.
2. Restart `pnpm dev`.
3. Trigger a card.
4. Confirm `usedFallback` is false in the network response.
5. Try the Q&A feature.

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
