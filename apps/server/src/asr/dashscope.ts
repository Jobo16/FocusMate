import { randomUUID } from "node:crypto";
import { WebSocket } from "ws";
import type { TranscriptBuffer } from "../buffer/transcriptBuffer.js";

const DASH_SCOPE_URL = "wss://dashscope.aliyuncs.com/api-ws/v1/inference";
const DASH_SCOPE_MODEL = "paraformer-realtime-v2";
export const TARGET_SAMPLE_RATE = 16000;

type DashScopeRelayOptions = {
  apiKey: string;
  buffer: TranscriptBuffer;
  emitTranscript: (text: string, isFinal: boolean) => void;
  emitStatus: (message: string) => void;
};

const createRunTask = (taskId: string) => ({
  header: {
    action: "run-task",
    task_id: taskId,
    streaming: "duplex"
  },
  payload: {
    task_group: "audio",
    task: "asr",
    function: "recognition",
    model: DASH_SCOPE_MODEL,
    parameters: {
      format: "pcm",
      sample_rate: TARGET_SAMPLE_RATE
    },
    input: {}
  }
});

const createFinishTask = (taskId: string) => ({
  header: {
    action: "finish-task",
    task_id: taskId,
    streaming: "duplex"
  },
  payload: {
    input: {}
  }
});

export class DashScopeRelay {
  private ws: WebSocket | null = null;
  private ready = false;
  private readonly taskId = randomUUID();
  private readonly pendingAudio: Buffer[] = [];

  constructor(private readonly options: DashScopeRelayOptions) {}

  start() {
    this.ws = new WebSocket(DASH_SCOPE_URL, {
      headers: {
        Authorization: `Bearer ${this.options.apiKey}`,
        "user-agent": "focusmate-v2"
      }
    });

    this.ws.on("open", () => {
      this.ws?.send(JSON.stringify(createRunTask(this.taskId)));
      this.options.emitStatus("dashscope_connecting");
    });

    this.ws.on("message", (raw) => {
      this.handleMessage(raw.toString());
    });

    this.ws.on("close", () => {
      this.options.emitStatus("dashscope_closed");
    });

    this.ws.on("error", () => {
      this.options.emitStatus("dashscope_error");
    });
  }

  sendAudio(audio: Buffer) {
    if (!this.ws || this.ws.readyState !== this.ws.OPEN) return;
    if (!this.ready) {
      this.pendingAudio.push(audio);
      return;
    }
    this.ws.send(audio);
  }

  stop() {
    const ws = this.ws;
    if (ws && ws.readyState === ws.OPEN) {
      ws.send(JSON.stringify(createFinishTask(this.taskId)));
    }
    ws?.close();
  }

  private handleMessage(raw: string) {
    let msg: any;
    try {
      msg = JSON.parse(raw);
    } catch {
      return;
    }

    const event = msg?.header?.event;
    if (event === "task-started") {
      this.ready = true;
      this.options.emitStatus("dashscope_started");
      for (const chunk of this.pendingAudio.splice(0)) {
        this.ws?.send(chunk);
      }
      return;
    }

    if (event === "result-generated") {
      const sentence = msg?.payload?.output?.sentence;
      if (sentence?.heartbeat) return;

      const text = String(sentence?.text ?? "").trim();
      if (!text) return;

      const isFinal = sentence?.sentence_end === true || sentence?.end_time != null;
      if (isFinal) {
        this.options.buffer.addFinal(text, "dashscope");
      } else {
        this.options.buffer.addPartial(text, "dashscope");
      }
      this.options.emitTranscript(text, isFinal);
      return;
    }

    if (event === "task-finished") {
      this.options.emitStatus("dashscope_finished");
      return;
    }

    if (event === "task-failed") {
      this.options.emitStatus("dashscope_failed");
    }
  }
}
