# Data Flow

FocusMate v2 has four main runtime chains.

## 1. Realtime Audio Chain

```text
User taps "开始听课"
  -> App.tsx
  -> audioClient.ts
  -> browser getUserMedia
  -> pcm-worklet.js
  -> Int16 PCM chunks
  -> WebSocket /ws
```

The browser captures microphone audio, chunks it in an `AudioWorklet`, converts Float32 samples into Int16 PCM, and sends those chunks to the server over WebSocket.

Key files:

- `apps/web/src/App.tsx`
- `apps/web/src/audio/audioClient.ts`
- `apps/web/public/pcm-worklet.js`
- `apps/web/src/ws/transcriptSocket.ts`

## 2. Speech-to-Text Chain

```text
WebSocket binary audio
  -> transcriptSocket.ts
  -> resampler.ts
  -> 16 kHz PCM
  -> dashscope.ts
  -> DashScope realtime ASR
  -> transcript segment
```

If `DASHSCOPE_API_KEY` exists, the server streams resampled audio to DashScope realtime ASR.

If no key exists:

```text
start message
  -> mockTranscript.ts
  -> mock classroom text
```

Key files:

- `apps/server/src/ws/transcriptSocket.ts`
- `apps/server/src/asr/resampler.ts`
- `apps/server/src/asr/dashscope.ts`
- `apps/server/src/asr/mockTranscript.ts`

## 3. Transcript Buffer Chain

```text
ASR transcript segment
  -> TranscriptBuffer.addPartial/addFinal
  -> recent rolling buffer
  -> getRecent(30 | 60 | 180)
```

Each WebSocket connection creates one session. Each session owns one `TranscriptBuffer`.

Current rules:

- final transcript segments are stored
- partial transcript is kept as current partial
- max buffer horizon is 5 minutes
- no transcript persistence yet

Key files:

- `apps/server/src/buffer/sessionStore.ts`
- `apps/server/src/buffer/transcriptBuffer.ts`

## 4. Recovery Card Chain

```text
User taps "我刚刚错过了什么？"
  -> recoverClient.ts
  -> POST /api/recover
  -> recover.ts
  -> TranscriptBuffer.getRecent(windowSeconds)
  -> modelClient.ts
  -> recovery-card-classroom.md or recovery-card-meeting.md prompt
  -> RecoveryCard JSON
  -> RecoverySheet.tsx
```

If LLM env vars exist, `modelClient.ts` calls an OpenAI-compatible chat completions endpoint.

If no LLM key exists or the LLM call fails, the server returns a local fallback card. This keeps the app usable during development.

Key files:

- `apps/web/src/recovery/recoverClient.ts`
- `apps/server/src/routes/recover.ts`
- `apps/server/src/recovery/modelClient.ts`
- `apps/server/src/recovery/fallback.ts`
- `packages/prompts/recovery-card-classroom.md`
- `packages/prompts/recovery-card-meeting.md`
- `apps/web/src/recovery/RecoverySheet.tsx`

## Shared Contract Chain

```text
packages/shared/src/index.ts
  -> Zod schemas
  -> server request/response validation
  -> web client parsing
```

Do not duplicate request or response shapes in app code. Add or change fields in `packages/shared` first, then update server and web call sites.

Core shared types:

- `TranscriptSegment`
- `RecoveryMode`
- `RecoveryCard`
- `RecoverRequest`
- `RecoverResponse`
- `ClientWsMessage`
- `ServerWsMessage`

## End-to-End Summary

```text
Microphone audio
  -> browser PCM chunks
  -> WebSocket
  -> server resampling
  -> DashScope or mock transcript
  -> rolling transcript buffer
  -> user manual recovery trigger
  -> selected mode: classroom or meeting
  -> recent transcript window
  -> LLM or fallback recovery card
  -> mobile bottom sheet
```
