# API and Protocols

This document describes the current HTTP and WebSocket contracts.

The source of truth for data shapes is `packages/shared/src/index.ts`.

## HTTP

### `GET /health`

Health check.

Response:

```json
{
  "ok": true,
  "service": "focusmate-server",
  "now": 1777216476841
}
```

### `POST /api/recover`

Generate a recovery card from the recent transcript buffer.

Request:

```json
{
  "sessionId": "websocket-session-id",
  "mode": "classroom",
  "windowSeconds": 60
}
```

Allowed `mode` values:

- `classroom`
- `meeting`

Allowed `windowSeconds` values:

- `30`
- `60`
- `180`

Response:

```json
{
  "card": {
    "title": "我刚刚错过了什么？",
    "mode": "classroom",
    "windowSeconds": 60,
    "summary": "刚刚老师在讲...",
    "action": "老师刚刚要求...",
    "resumePoint": "你现在应该接着听...",
    "keyPoints": ["..."],
    "confidence": "medium",
    "transcript": "..."
  },
  "generatedAt": 1777216476841,
  "model": "gpt-4o-mini",
  "usedFallback": false
}
```

Error cases:

- `400 invalid_recover_request`
- `404 session_not_found`

## WebSocket

Endpoint:

```text
GET /ws
```

### Client to Server Messages

Config sample rate:

```json
{
  "type": "config",
  "sampleRate": 48000
}
```

Start listening:

```json
{
  "type": "start"
}
```

Stop listening:

```json
{
  "type": "stop"
}
```

Binary messages are Int16 PCM audio chunks from the browser.

### Server to Client Messages

Session creation:

```json
{
  "type": "session",
  "sessionId": "..."
}
```

Status:

```json
{
  "type": "status",
  "message": "connected"
}
```

Transcript:

```json
{
  "type": "transcript",
  "segment": {
    "id": "...",
    "text": "老师刚刚在讲...",
    "isFinal": true,
    "startAt": 1777216470000,
    "endAt": 1777216471000,
    "source": "dashscope"
  }
}
```

Buffer stats:

```json
{
  "type": "buffer",
  "secondsAvailable": 60,
  "segmentCount": 8
}
```

Error:

```json
{
  "type": "error",
  "message": "invalid_ws_message"
}
```

## Environment Variables

| Name | Required | Purpose |
| --- | --- | --- |
| `PORT` | No | Server port, default `8787` |
| `HOST` | No | Server host, default `0.0.0.0` |
| `DASHSCOPE_API_KEY` | No | Enables real DashScope ASR |
| `LLM_API_KEY` | No | Enables model-generated cards |
| `OPENAI_API_KEY` | No | Alternative key name for model generation |
| `LLM_BASE_URL` | No | OpenAI-compatible base URL |
| `OPENAI_BASE_URL` | No | Alternative base URL name |
| `LLM_MODEL` | No | Chat model name |

Fallback behavior:

- no `DASHSCOPE_API_KEY`: mock transcript mode
- no LLM key: local recovery fallback
- failed LLM request: local recovery fallback
