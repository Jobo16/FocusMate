# Data Flow

FocusMate v2 has five main runtime chains.

## 1. Realtime Audio Chain

```text
User taps "开始听课"
  -> HomePage.tsx
  -> useConnection.ts
  -> audioClient.ts
  -> browser getUserMedia
  -> pcm-worklet.js
  -> Int16 PCM chunks
  -> WebSocket /ws
```

The browser captures microphone audio, chunks it in an `AudioWorklet`, converts Float32 samples into Int16 PCM, and sends those chunks to the server over WebSocket.

Key files:

- `apps/web/src/pages/HomePage.tsx`
- `apps/web/src/features/connection/useConnection.ts`
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
- no transcript persistence on server

Key files:

- `apps/server/src/buffer/sessionStore.ts`
- `apps/server/src/buffer/transcriptBuffer.ts`

## 4. Recovery Card Chain

```text
User taps recovery button
  -> useRecovery.ts
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

The returned card is also saved to localStorage history and a recovery marker is recorded on the waveform timeline.

Key files:

- `apps/web/src/features/recovery/useRecovery.ts`
- `apps/web/src/features/recovery/recoverClient.ts`
- `apps/server/src/routes/recover.ts`
- `apps/server/src/recovery/modelClient.ts`
- `apps/server/src/recovery/fallback.ts`
- `packages/prompts/recovery-card-classroom.md`
- `packages/prompts/recovery-card-meeting.md`
- `apps/web/src/features/recovery/RecoverySheet.tsx`

## 5. Q&A Chain

```text
User types question in AskInput
  -> useRecovery.ts
  -> askClient.ts
  -> POST /api/ask
  -> ask.ts
  -> TranscriptBuffer.getRecent(full buffer)
  -> qaClient.ts
  -> transcript-qa.md prompt
  -> answer text
  -> AskInput message list
```

Single-turn Q&A: the user asks a question, the system answers based on the full transcript buffer. No conversation history is sent to the LLM.

If no LLM key exists, the server returns a message indicating Q&A is unavailable.

Key files:

- `apps/web/src/features/recovery/AskInput.tsx`
- `apps/web/src/features/recovery/askClient.ts`
- `apps/server/src/routes/ask.ts`
- `apps/server/src/recovery/qaClient.ts`
- `packages/prompts/transcript-qa.md`

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
- `AskRequest`
- `AskResponse`
- `ClientWsMessage`
- `ServerWsMessage`

## Client-Side Persistence

Three stores persist to localStorage via Zustand middleware:

```text
focusmate-history    Recovery card history (max 50 entries)
focusmate-settings   Default mode and window preferences
focusmate-usage      Cumulative listening seconds + quota unlock flag
```

No server-side persistence exists. Clearing browser data resets all history, settings, and usage quota.

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
  -> bottom sheet with Q&A
  -> saved to localStorage history
```
