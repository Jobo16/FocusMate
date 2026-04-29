import type { FastifyInstance } from "fastify";
import { AskRequestSchema, AskResponseSchema } from "@focusmate/shared";
import type { SessionStore } from "../buffer/sessionStore.js";
import { answerFromTranscript } from "../recovery/qaClient.js";

export const registerAskRoutes = (app: FastifyInstance, sessions: SessionStore) => {
  app.post("/api/ask", async (request, reply) => {
    const parsed = AskRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_ask_request", details: parsed.error.flatten() });
    }

    const session = sessions.get(parsed.data.sessionId);
    if (!session) {
      return reply.code(404).send({ error: "session_not_found" });
    }

    sessions.touch(session.id);

    const windowSeconds = parsed.data.windowSeconds ?? 300;
    const segments = session.buffer.getRecent(windowSeconds);
    const result = await answerFromTranscript(segments, parsed.data.question);

    const response = AskResponseSchema.parse({
      answer: result.answer,
      question: parsed.data.question,
      generatedAt: Date.now(),
      model: result.model,
    });

    return response;
  });
};
