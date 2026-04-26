import { randomUUID } from "node:crypto";
import { TranscriptBuffer } from "./transcriptBuffer.js";

export type SessionRecord = {
  id: string;
  buffer: TranscriptBuffer;
  createdAt: number;
  updatedAt: number;
};

export class SessionStore {
  private sessions = new Map<string, SessionRecord>();

  create() {
    const now = Date.now();
    const session: SessionRecord = {
      id: randomUUID(),
      buffer: new TranscriptBuffer(),
      createdAt: now,
      updatedAt: now
    };
    this.sessions.set(session.id, session);
    return session;
  }

  get(sessionId: string) {
    return this.sessions.get(sessionId) ?? null;
  }

  touch(sessionId: string) {
    const session = this.sessions.get(sessionId);
    if (session) session.updatedAt = Date.now();
  }

  delete(sessionId: string) {
    this.sessions.delete(sessionId);
  }
}
