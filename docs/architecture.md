# FocusMate v2 Architecture

## Product Boundary

The first version is a manual live context recovery tool:

- User taps `我刚刚错过了什么？`
- Server reads the recent transcript buffer
- Server returns a Chinese recovery card in a few seconds
- Transcript remains an expandable evidence layer
- User can ask follow-up questions based on the transcript

It currently supports two modes:

- `classroom`: classroom explanation, question, and task recovery
- `meeting`: discussion, decision, task, and response recovery

It is not a generic note-taking tool, chat assistant, full class summary product, or meeting-minutes bot.

## System Shape

```text
apps/web
  Browser microphone
  AudioWorklet PCM chunks
  Mobile recovery-card UI
  Inline Q&A
  History + Settings

apps/server
  WebSocket audio endpoint
  DashScope ASR relay or mock ASR
  Rolling transcript buffer
  Recovery-card API
  Q&A API

packages/shared
  Zod schemas and TypeScript types

packages/prompts
  Mode-specific recovery-card prompts
  Transcript Q&A prompt
```

## Runtime Flow

```text
Mobile browser
  getUserMedia + AudioWorklet
        |
        | PCM chunks over WebSocket
        v
Fastify server
        |
        | 16k PCM
        v
DashScope realtime ASR
        |
        | transcript events
        v
Rolling Transcript Buffer
        |
        +-- POST /api/recover --> Recovery Card Generator
        |
        +-- POST /api/ask ------> Q&A Generator
```

## Module Boundaries

- `packages/shared`: Zod schemas and shared TypeScript types.
- `packages/prompts`: mode-specific prompt text for card generation and Q&A.
- `apps/server/src/buffer`: rolling transcript buffer.
- `apps/server/src/asr`: DashScope relay and mock transcript source.
- `apps/server/src/recovery`: model adapter, fallback recovery, and Q&A client.
- `apps/server/src/routes`: HTTP route handlers.
- `apps/web/src/audio`: browser microphone capture.
- `apps/web/src/ws`: transcript WebSocket client.
- `apps/web/src/features/connection`: connection management, status display, waveform timeline.
- `apps/web/src/features/recovery`: recovery card, Q&A, API clients.
- `apps/web/src/stores`: Zustand state management.
- `apps/web/src/pages`: page-level components (Home, History, Settings).
- `apps/web/src/app`: app shell, layout, routing.
- `apps/web/src/components`: reusable UI primitives.

## Server Modules

| Module | Responsibility |
| --- | --- |
| `src/index.ts` | Fastify bootstrap, CORS, WebSocket, route registration |
| `src/ws/transcriptSocket.ts` | WebSocket session lifecycle, audio input, transcript events |
| `src/asr/dashscope.ts` | DashScope realtime ASR relay |
| `src/asr/mockTranscript.ts` | Development transcript fallback |
| `src/asr/resampler.ts` | Linear PCM resampling to 16 kHz |
| `src/buffer/sessionStore.ts` | In-memory WebSocket session registry |
| `src/buffer/transcriptBuffer.ts` | Recent transcript window, max 5 minutes |
| `src/routes/recover.ts` | `POST /api/recover` |
| `src/routes/ask.ts` | `POST /api/ask` |
| `src/recovery/modelClient.ts` | OpenAI-compatible LLM call and fallback handling |
| `src/recovery/qaClient.ts` | Transcript-based Q&A via LLM |
| `src/recovery/fallback.ts` | Local heuristic recovery card |

## Web Modules

| Module | Responsibility |
| --- | --- |
| `src/app/App.tsx` | Page router |
| `src/app/Layout.tsx` | Global layout with bottom navigation |
| `src/pages/HomePage.tsx` | Main listening + recovery page |
| `src/pages/HistoryPage.tsx` | Recovery card history list |
| `src/pages/SettingsPage.tsx` | Default mode/window, redeem code, feedback |
| `src/features/connection/useConnection.ts` | WebSocket + audio management hook |
| `src/features/connection/ListeningStatus.tsx` | Status indicator, transcript card |
| `src/features/connection/RecordingTimeline.tsx` | Waveform visualization |
| `src/features/connection/ElapsedTimer.tsx` | Recording duration timer |
| `src/features/recovery/useRecovery.ts` | Recovery + Q&A management hook |
| `src/features/recovery/recoverClient.ts` | Recovery API client |
| `src/features/recovery/askClient.ts` | Q&A API client |
| `src/features/recovery/RecoveryButton.tsx` | Main manual trigger |
| `src/features/recovery/RecoverySheet.tsx` | Bottom-sheet recovery card + Q&A |
| `src/features/recovery/WindowSelector.tsx` | Recovery window picker |
| `src/features/recovery/AskInput.tsx` | Q&A input and message list |
| `src/stores/connectionStore.ts` | WebSocket connection state |
| `src/stores/recoveryStore.ts` | Transcript, card, markers, Q&A messages |
| `src/stores/settingsStore.ts` | Persisted user preferences |
| `src/stores/routerStore.ts` | Page navigation state |
| `src/stores/usageStore.ts` | Usage quota and redeem code |
| `src/components/Sheet.tsx` | Reusable bottom sheet |
| `src/components/SegmentedControl.tsx` | Mode toggle |
| `src/components/PulseIndicator.tsx` | Status dot |
| `src/audio/audioClient.ts` | Browser microphone and AudioWorklet setup |
| `src/ws/transcriptSocket.ts` | Browser WebSocket client |

## State Model

Server state is intentionally simple:

- Session state lives in memory on the server.
- A session is created for each WebSocket connection.
- Transcript buffer is not persisted server-side.
- No account system exists.

Client state is persisted in localStorage via Zustand:

- `focusmate-history`: recovery card history (max 50 entries)
- `focusmate-settings`: default mode and window preferences
- `focusmate-usage`: cumulative listening seconds and quota unlock flag

Mode is selected on the client and sent with each recovery/ask request.

## Latency Principle

The product principle is:

> Fast first, accurate later.

The first useful card should arrive in 3-8 seconds. Longer transcript windows, richer analysis, saved history, and automatic detection should not block that first useful card.

## Mode-Aware Recovery

The audio, ASR, WebSocket, and buffer chains are shared across modes.

Mode-specific behavior lives in:

- `packages/shared/src/index.ts`: `RecoveryModeSchema`
- `packages/prompts/recovery-card-classroom.md`
- `packages/prompts/recovery-card-meeting.md`
- `apps/server/src/recovery/prompt.ts`
- `apps/web/src/features/recovery/RecoverySheet.tsx`

Do not add a generic "all scenarios" mode yet. Add a concrete mode only when its recovery card has a distinct job and testable success criteria.
