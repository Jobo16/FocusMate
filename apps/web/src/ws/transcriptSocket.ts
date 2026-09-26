import { ServerWsMessageSchema, type ClientWsMessage, type ServerWsMessage } from "@daymark/shared";

export type TranscriptSocket = {
  opened: Promise<void>;
  send: (message: ClientWsMessage) => void;
  sendAudio: (chunk: ArrayBuffer) => void;
  close: () => void;
};

export const connectTranscriptSocket = (handlers: {
  onMessage: (message: ServerWsMessage) => void;
  onOpen?: () => void;
  onClose?: () => void;
  onError?: () => void;
}): TranscriptSocket => {
  const protocol = window.location.protocol === "https:" ? "wss" : "ws";
  const ws = new WebSocket(`${protocol}://${window.location.host}/ws`);
  ws.binaryType = "arraybuffer";

  let resolveOpen: () => void = () => {};
  let rejectOpen: (error: Error) => void = () => {};
  const opened = new Promise<void>((resolve, reject) => {
    resolveOpen = resolve;
    rejectOpen = reject;
  });
  const timeout = window.setTimeout(() => {
    rejectOpen(new Error("连接超时"));
    ws.close();
  }, 10000);

  ws.addEventListener("open", () => {
    window.clearTimeout(timeout);
    resolveOpen();
    handlers.onOpen?.();
  });
  ws.addEventListener("close", () => {
    window.clearTimeout(timeout);
    rejectOpen(new Error("连接已关闭"));
    handlers.onClose?.();
  });
  ws.addEventListener("error", () => {
    window.clearTimeout(timeout);
    rejectOpen(new Error("连接失败"));
    handlers.onError?.();
  });
  ws.addEventListener("message", (event) => {
    try {
      const parsed = ServerWsMessageSchema.safeParse(JSON.parse(event.data));
      if (parsed.success) handlers.onMessage(parsed.data);
    } catch {
      // Ignore non-JSON socket messages.
    }
  });

  return {
    opened,
    send: (message) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(JSON.stringify(message));
      }
    },
    sendAudio: (chunk) => {
      if (ws.readyState === WebSocket.OPEN) {
        ws.send(chunk);
      }
    },
    close: () => ws.close()
  };
};
