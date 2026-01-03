# Progress Log

Date: 2026-01-03

## Summary
- Built a minimal Node/TS demo server and mobile-first UI for transcription display.
- Added WebSocket pipeline that streams PCM audio from browser to server.
- Implemented server-side 16k resampling and DashScope WebSocket relay (mock fallback).
- Added docs for running the demo and where to plug in DashScope.

## Implemented
- Project scaffold: `package.json`, `tsconfig.json`
- Server: `src/server.ts`
  - Static file hosting
  - `/ws` WebSocket
  - Mock transcript stream fallback
  - DashScope WS relay (env: `DASHSCOPE_API_KEY`)
  - Linear PCM resampler to 16k
- UI: `public/index.html`, `public/styles.css`
  - Mobile-first transcription panel
  - Start/stop controls and live transcript display
- Audio capture: `public/app.js`, `public/pcm-worklet.js`
  - AudioWorklet PCM capture (Int16)
  - Stream over WebSocket
  - Mic permission handling
- Docs: `doc/demo-setup.md`

## How to run
```bash
npm install
npm run dev
```
Open `http://localhost:5173`.

Optional DashScope key:
```bash
export DASHSCOPE_API_KEY="your_api_key"
```

## Notes
- Current resampling uses linear interpolation (good enough for demo).
- If `DASHSCOPE_API_KEY` is missing, the server uses mock transcript stream.

## Next options
- Improve resampling quality (anti-aliasing filter).
- Add reconnect and error UI states.
- Add timestamps and final/partial segment UI.
