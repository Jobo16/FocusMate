import type { FastifyInstance } from "fastify";
import { RecoverRequestSchema, RecoverResponseSchema } from "@focusmate/shared";
import type { SessionStore } from "../buffer/sessionStore.js";
import { generateRecoveryCard } from "../recovery/modelClient.js";

export const registerRecoverRoutes = (app: FastifyInstance, sessions: SessionStore) => {
  app.post("/api/recover", async (request, reply) => {
    const parsed = RecoverRequestSchema.safeParse(request.body);
    if (!parsed.success) {
      return reply.code(400).send({ error: "invalid_recover_request", details: parsed.error.flatten() });
    }

    const session = sessions.get(parsed.data.sessionId);
    if (!session) {
      return reply.code(404).send({ error: "session_not_found" });
    }

    sessions.touch(session.id);
    const segments = session.buffer.getRecent(parsed.data.windowSeconds);
    const result = await generateRecoveryCard(segments, parsed.data.windowSeconds);
    const response = RecoverResponseSchema.parse({
      ...result,
      generatedAt: Date.now()
    });

    return response;
  });
};
