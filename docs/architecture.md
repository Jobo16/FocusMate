# FocusMate v2 Architecture

## Product Boundary

The first version is a manual classroom recovery tool:

- User taps `我刚刚错过了什么？`
- Server reads the recent transcript buffer
- Server returns a Chinese recovery card in a few seconds
- Transcript remains an expandable evidence layer

It is not a generic note-taking tool, chat assistant, or full class summary product.

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
