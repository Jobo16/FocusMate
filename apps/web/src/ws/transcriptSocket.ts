import { ServerWsMessageSchema, type ClientWsMessage, type ServerWsMessage } from "@focusmate/shared";

export type TranscriptSocket = {
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

  ws.addEventListener("open", () => handlers.onOpen?.());
  ws.addEventListener("close", () => handlers.onClose?.());
  ws.addEventListener("error", () => handlers.onError?.());
  ws.addEventListener("message", (event) => {
    try {
      const parsed = ServerWsMessageSchema.safeParse(JSON.parse(event.data));
      if (parsed.success) handlers.onMessage(parsed.data);
    } catch {
      // Ignore non-JSON socket messages.
    }
  });

  return {
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
