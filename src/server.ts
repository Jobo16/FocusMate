import express from "express";
import { createServer } from "http";
import { WebSocketServer, WebSocket } from "ws";
import path from "path";
import { fileURLToPath } from "url";
import { randomUUID } from "crypto";

const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

const app = express();
const server = createServer(app);
const wss = new WebSocketServer({ server, path: "/ws" });

app.use(express.static(path.join(__dirname, "..", "public")));

const DASH_SCOPE_URL = "wss://dashscope.aliyuncs.com/api-ws/v1/inference";
const DASH_SCOPE_MODEL = "paraformer-realtime-v2";
const TARGET_SAMPLE_RATE = 16000;

const MOCK_WORDS = [
  "大家好，",
  "现在开始",
  "FocusMate",
  "demo",
  "转录展示。",
  "这是一个",
  "移动端",
  "Web",
  "界面",
  "示例。",
];

type ClientState = {
  inputSampleRate: number;
  dashscopeWs: WebSocket | null;
  dashscopeReady: boolean;
  dashscopeTaskId: string | null;
  pendingAudio: Buffer[];
  mockTimer: NodeJS.Timeout | null;
  mockIndex: number;
  resampler: LinearResampler | null;
};

class LinearResampler {
  private ratio: number;
  private pos = 0;
  private lastSample = 0;
  private hasLast = false;

  constructor(private inputRate: number, private outputRate: number) {
    this.ratio = inputRate / outputRate;
  }

  process(input: Int16Array): Int16Array {
    if (input.length === 0) return new Int16Array(0);
    const totalSamples = this.hasLast ? input.length + 1 : input.length;

    const readSample = (idx: number) => {
      if (this.hasLast) {
        if (idx === 0) return this.lastSample;
        return input[idx - 1] ?? this.lastSample;
      }
      return input[idx] ?? 0;
    };

    const output: number[] = [];
    let pos = this.pos;
    while (pos + 1 < totalSamples) {
      const i = Math.floor(pos);
      const frac = pos - i;
      const s0 = readSample(i);
      const s1 = readSample(i + 1);
      const sample = s0 + (s1 - s0) * frac;
      output.push(sample);
      pos += this.ratio;
    }

    this.lastSample = input[input.length - 1] ?? 0;
    this.hasLast = true;
    this.pos = pos - (totalSamples - 1);

    const out = new Int16Array(output.length);
    for (let i = 0; i < output.length; i += 1) {
      const v = Math.max(-32768, Math.min(32767, Math.round(output[i])));
      out[i] = v;
    }
    return out;
  }
}

const sendJson = (socket: WebSocket, payload: unknown) => {
  if (socket.readyState === socket.OPEN) {
    socket.send(JSON.stringify(payload));
  }
};

const startMock = (state: ClientState, socket: WebSocket) => {
  if (state.mockTimer) return;
  sendJson(socket, { type: "status", message: "mock_started" });
  state.mockTimer = setInterval(() => {
    const text = MOCK_WORDS[state.mockIndex % MOCK_WORDS.length];
    state.mockIndex += 1;
    sendJson(socket, { type: "transcript", text, isFinal: state.mockIndex % 3 === 0 });
  }, 700);
};

const stopMock = (state: ClientState, socket: WebSocket) => {
  if (state.mockTimer) {
    clearInterval(state.mockTimer);
    state.mockTimer = null;
  }
  sendJson(socket, { type: "status", message: "mock_stopped" });
};

const createDashScopeRunTask = (taskId: string) => ({
  header: {
    action: "run-task",
    task_id: taskId,
    streaming: "duplex",
  },
  payload: {
    task_group: "audio",
    task: "asr",
    function: "recognition",
    model: DASH_SCOPE_MODEL,
    parameters: {
      format: "pcm",
      sample_rate: TARGET_SAMPLE_RATE,
    },
    input: {},
  },
});

const createDashScopeFinishTask = (taskId: string) => ({
  header: {
    action: "finish-task",
    task_id: taskId,
    streaming: "duplex",
  },
  payload: {
    input: {},
  },
});

const setupDashScope = (state: ClientState, socket: WebSocket) => {
  const apiKey = process.env.DASHSCOPE_API_KEY;
  if (!apiKey) return false;

  const dashscopeWs = new WebSocket(DASH_SCOPE_URL, {
    headers: {
      Authorization: `Bearer ${apiKey}`,
      "user-agent": "focusmate-demo",
    },
  });

  state.dashscopeWs = dashscopeWs;
  state.dashscopeReady = false;
  state.dashscopeTaskId = randomUUID();
  state.pendingAudio = [];

  dashscopeWs.on("open", () => {
    const runTask = createDashScopeRunTask(state.dashscopeTaskId as string);
    dashscopeWs.send(JSON.stringify(runTask));
    sendJson(socket, { type: "status", message: "dashscope_connecting" });
  });

  dashscopeWs.on("message", (raw) => {
    let msg: any;
    try {
      msg = JSON.parse(raw.toString());
    } catch {
      return;
    }

    const event = msg?.header?.event;
    if (event === "task-started") {
      state.dashscopeReady = true;
      sendJson(socket, { type: "status", message: "dashscope_started" });
      for (const chunk of state.pendingAudio) {
        dashscopeWs.send(chunk);
      }
      state.pendingAudio = [];
      return;
    }

    if (event === "result-generated") {
      const sentence = msg?.payload?.output?.sentence;
      if (sentence?.heartbeat) return;
      const text = sentence?.text;
      if (text) {
        const isFinal = sentence?.sentence_end === true || (sentence?.end_time !== null && sentence?.end_time !== undefined);
        sendJson(socket, { type: "transcript", text, isFinal });
      }
      return;
    }

    if (event === "task-finished") {
      sendJson(socket, { type: "status", message: "dashscope_finished" });
      return;
    }

    if (event === "task-failed") {
      sendJson(socket, { type: "status", message: "dashscope_failed" });
    }
  });

  dashscopeWs.on("close", () => {
    sendJson(socket, { type: "status", message: "dashscope_closed" });
  });

  dashscopeWs.on("error", () => {
    sendJson(socket, { type: "status", message: "dashscope_error" });
  });

  return true;
};

const sendAudioToDashScope = (state: ClientState, audio: Buffer) => {
  const ws = state.dashscopeWs;
  if (!ws || ws.readyState !== ws.OPEN) return;
  if (!state.dashscopeReady) {
    state.pendingAudio.push(audio);
    return;
  }
  ws.send(audio);
};

wss.on("connection", (socket) => {
  const state: ClientState = {
    inputSampleRate: 48000,
    dashscopeWs: null,
    dashscopeReady: false,
    dashscopeTaskId: null,
    pendingAudio: [],
    mockTimer: null,
    mockIndex: 0,
    resampler: null,
  };

  sendJson(socket, { type: "status", message: "connected" });

  socket.on("message", (raw, isBinary) => {
    if (!isBinary) {
      let msg: { type?: string; sampleRate?: number } | null = null;
      try {
        msg = JSON.parse(raw.toString());
      } catch {
        msg = null;
      }

      if (!msg || !msg.type) return;

      if (msg.type === "config") {
        const rate = Number(msg.sampleRate);
        if (Number.isFinite(rate) && rate > 0) {
          state.inputSampleRate = rate;
          state.resampler = new LinearResampler(rate, TARGET_SAMPLE_RATE);
          sendJson(socket, { type: "status", message: `input_rate_${rate}` });
        }
        return;
      }

      if (msg.type === "start") {
        const usingDashScope = setupDashScope(state, socket);
        if (!usingDashScope) {
          startMock(state, socket);
          sendJson(socket, { type: "status", message: "mock_mode" });
        } else {
          sendJson(socket, { type: "status", message: "dashscope_mode" });
        }
        return;
      }

      if (msg.type === "stop") {
        if (state.dashscopeWs && state.dashscopeTaskId) {
          const finishTask = createDashScopeFinishTask(state.dashscopeTaskId);
          state.dashscopeWs.send(JSON.stringify(finishTask));
        }
        stopMock(state, socket);
        return;
      }

      return;
    }

    if (raw instanceof Buffer) {
      const int16 = new Int16Array(raw.buffer, raw.byteOffset, raw.byteLength / 2);
      const resampler = state.resampler ?? new LinearResampler(state.inputSampleRate, TARGET_SAMPLE_RATE);
      state.resampler = resampler;
      const resampled = resampler.process(int16);
      if (resampled.length === 0) return;
      const audioBuffer = Buffer.from(resampled.buffer);
      if (state.dashscopeWs) {
        sendAudioToDashScope(state, audioBuffer);
      }
    }
  });

  socket.on("close", () => {
    stopMock(state, socket);
    state.dashscopeWs?.close();
  });
});

const port = process.env.PORT ? Number(process.env.PORT) : 5173;
server.listen(port, () => {
  // eslint-disable-next-line no-console
  console.log(`Demo server running on http://localhost:${port}`);
});
