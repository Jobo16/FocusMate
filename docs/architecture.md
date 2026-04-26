# FocusMate v2 Architecture

## Product Boundary

The first version is a manual classroom recovery tool:

- User taps `我刚刚错过了什么？`
- Server reads the recent transcript buffer
- Server returns a Chinese recovery card in a few seconds
- Transcript remains an expandable evidence layer

It is not a generic note-taking tool, chat assistant, or full class summary product.

## System Shape

```text
apps/web
  Browser microphone
  AudioWorklet PCM chunks
  Mobile recovery-card UI

apps/server
  WebSocket audio endpoint
  DashScope ASR relay or mock ASR
  Rolling transcript buffer
  Recovery-card API

packages/shared
  Zod schemas and TypeScript types

packages/prompts
  LLM prompt text
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
        | POST /api/recover
        v
Recovery Card Generator
```

## Module Boundaries

- `packages/shared`: Zod schemas and shared TypeScript types.
- `packages/prompts`: prompt text for card generation.
- `apps/server/src/buffer`: rolling transcript buffer.
- `apps/server/src/asr`: DashScope relay and mock transcript source.
- `apps/server/src/recovery`: model adapter and fallback recovery.
- `apps/web/src/audio`: browser microphone capture.
- `apps/web/src/ws`: transcript WebSocket client.
- `apps/web/src/recovery`: mobile recovery card UI.

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
| `src/recovery/modelClient.ts` | OpenAI-compatible LLM call and fallback handling |
| `src/recovery/fallback.ts` | Local heuristic recovery card |

## Web Modules

| Module | Responsibility |
| --- | --- |
| `src/App.tsx` | Main mobile UI flow |
| `src/audio/audioClient.ts` | Browser microphone and AudioWorklet setup |
| `src/ws/transcriptSocket.ts` | Browser WebSocket client |
| `src/recovery/recoverClient.ts` | Recovery API client |
| `src/recovery/useFocusMateStore.ts` | UI/session state |
| `src/recovery/RecoveryButton.tsx` | Main manual trigger |
| `src/recovery/RecoverySheet.tsx` | Bottom-sheet recovery card |

## State Model

The MVP keeps state intentionally simple:

- Session state lives in memory on the server.
- A session is created for each WebSocket connection.
- Transcript buffer is not persisted.
- Recovery cards are not persisted.
- No account system exists.

This is correct for the validation phase. Add persistence only after real classroom use proves the recovery card is worth saving.

## Latency Principle

The product principle is:

> Fast first, accurate later.

The first useful card should arrive in 3-8 seconds. Longer transcript windows, richer analysis, saved history, and automatic detection should not block that first useful card.
