import type { FastifyInstance } from "fastify";
import { ClientWsMessageSchema, type ServerWsMessage } from "@focusmate/shared";
import type { RawData } from "ws";
import { DashScopeRelay, TARGET_SAMPLE_RATE } from "../asr/dashscope.js";
import { startMockTranscript } from "../asr/mockTranscript.js";
import { LinearResampler } from "../asr/resampler.js";
import type { SessionStore } from "../buffer/sessionStore.js";

export const registerTranscriptSocket = async (app: FastifyInstance, sessions: SessionStore) => {
  app.get("/ws", { websocket: true }, (socket) => {
    const session = sessions.create();
    let inputSampleRate = 48000;
    let resampler: LinearResampler | null = null;
    let dashscope: DashScopeRelay | null = null;
    let stopMock: (() => void) | null = null;

    const sendJson = (payload: ServerWsMessage) => {
      if (socket.readyState === socket.OPEN) {
        socket.send(JSON.stringify(payload));
      }
    };

    const emitBufferStats = () => {
      sendJson({
        type: "buffer",
        ...session.buffer.getStats()
      });
    };

    const emitStatus = (message: string) => {
      sendJson({ type: "status", message });
    };

    const emitTranscript = (text: string, isFinal: boolean) => {
      const segment = {
        id: `${isFinal ? "final" : "partial"}-${Date.now()}`,
        text,
        isFinal,
        startAt: Date.now(),
        endAt: Date.now(),
        source: process.env.DASHSCOPE_API_KEY ? "dashscope" : "mock"
      } as const;

      sendJson({ type: "transcript", segment });
      emitBufferStats();
    };

    sendJson({ type: "session", sessionId: session.id });
    emitStatus("connected");

    socket.on("message", (raw: RawData, isBinary: boolean) => {
      if (!isBinary) {
        let parsed;
        try {
          parsed = ClientWsMessageSchema.safeParse(JSON.parse(raw.toString()));
        } catch {
          parsed = { success: false } as const;
        }

        if (!parsed.success) {
          sendJson({ type: "error", message: "invalid_ws_message" });
          return;
        }

        if (parsed.data.type === "config") {
          inputSampleRate = parsed.data.sampleRate;
          resampler = new LinearResampler(inputSampleRate, TARGET_SAMPLE_RATE);
          emitStatus(`input_rate_${inputSampleRate}`);
          return;
        }

        if (parsed.data.type === "start") {
          stopMock?.();
          dashscope?.stop();
          dashscope = null;
          stopMock = null;

          const apiKey = process.env.DASHSCOPE_API_KEY;
          if (apiKey) {
            dashscope = new DashScopeRelay({
              apiKey,
              buffer: session.buffer,
              emitTranscript,
              emitStatus
            });
            dashscope.start();
            emitStatus("dashscope_mode");
          } else {
            stopMock = startMockTranscript(session.buffer, emitTranscript, emitStatus);
          }
          return;
        }

        if (parsed.data.type === "stop") {
          dashscope?.stop();
          dashscope = null;
          stopMock?.();
          stopMock = null;
          emitStatus("stopped");
        }

        return;
      }

      const input = toBuffer(raw);
      if (!input) return;
      const int16 = new Int16Array(input.buffer, input.byteOffset, Math.floor(input.byteLength / 2));
      const activeResampler = resampler ?? new LinearResampler(inputSampleRate, TARGET_SAMPLE_RATE);
      resampler = activeResampler;
      const resampled = activeResampler.process(int16);
      if (resampled.length === 0) return;
      dashscope?.sendAudio(Buffer.from(resampled.buffer));
    });

    socket.on("close", () => {
      dashscope?.stop();
      stopMock?.();
      sessions.delete(session.id);
    });
  });
};

const toBuffer = (raw: RawData) => {
  if (Buffer.isBuffer(raw)) return raw;
  if (raw instanceof ArrayBuffer) return Buffer.from(raw);
  if (Array.isArray(raw)) return Buffer.concat(raw);
  return null;
};
