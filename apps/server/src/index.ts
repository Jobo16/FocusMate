import "dotenv/config";
import cors from "@fastify/cors";
import websocket from "@fastify/websocket";
import Fastify from "fastify";
import { SessionStore } from "./buffer/sessionStore.js";
import { registerRecoverRoutes } from "./routes/recover.js";
import { registerTranscriptSocket } from "./ws/transcriptSocket.js";

const app = Fastify({
  logger: true
});

const sessions = new SessionStore();

await app.register(cors, {
  origin: true
});
await app.register(websocket);

app.get("/health", async () => ({
  ok: true,
  service: "focusmate-server",
  now: Date.now()
}));

registerRecoverRoutes(app, sessions);
await registerTranscriptSocket(app, sessions);

const port = Number(process.env.PORT || 8787);
const host = process.env.HOST || "0.0.0.0";

await app.listen({ port, host });
