import { z } from "zod";

export const TranscriptSegmentSchema = z.object({
  id: z.string(),
  text: z.string(),
  isFinal: z.boolean(),
  startAt: z.number(),
  endAt: z.number(),
  source: z.enum(["dashscope", "mock", "manual"]).default("dashscope")
});

export const RecoveryModeSchema = z.enum(["classroom", "meeting"]);

export const RecoveryCardSchema = z.object({
  title: z.string().default("我刚刚错过了什么？"),
  mode: RecoveryModeSchema.default("classroom"),
  windowSeconds: z.number(),
  summary: z.string(),
  action: z.string(),
  resumePoint: z.string(),
  keyPoints: z.array(z.string()).default([]),
  confidence: z.enum(["high", "medium", "low"]).default("medium"),
  transcript: z.string()
});

export const RecoverRequestSchema = z.object({
  sessionId: z.string().min(1),
  mode: RecoveryModeSchema.default("classroom"),
  windowSeconds: z.union([z.literal(30), z.literal(60), z.literal(180)]).default(60)
});

export const RecoverResponseSchema = z.object({
  card: RecoveryCardSchema,
  generatedAt: z.number(),
  model: z.string(),
  usedFallback: z.boolean()
});

export const ClientWsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("config"),
    sampleRate: z.number().positive()
  }),
  z.object({
    type: z.literal("start")
  }),
  z.object({
    type: z.literal("stop")
  })
]);

export const ServerWsMessageSchema = z.discriminatedUnion("type", [
  z.object({
    type: z.literal("session"),
    sessionId: z.string()
  }),
  z.object({
    type: z.literal("status"),
    message: z.string()
  }),
  z.object({
    type: z.literal("transcript"),
    segment: TranscriptSegmentSchema
  }),
  z.object({
    type: z.literal("buffer"),
    secondsAvailable: z.number(),
    segmentCount: z.number()
  }),
  z.object({
    type: z.literal("error"),
    message: z.string()
  })
]);

export type TranscriptSegment = z.infer<typeof TranscriptSegmentSchema>;
export type RecoveryMode = z.infer<typeof RecoveryModeSchema>;
export type RecoveryCard = z.infer<typeof RecoveryCardSchema>;
export type RecoverRequest = z.infer<typeof RecoverRequestSchema>;
export type RecoverResponse = z.infer<typeof RecoverResponseSchema>;
export type ClientWsMessage = z.infer<typeof ClientWsMessageSchema>;
export type ServerWsMessage = z.infer<typeof ServerWsMessageSchema>;

export const RECOVERY_WINDOWS = [30, 60, 180] as const;
export type RecoveryWindowSeconds = (typeof RECOVERY_WINDOWS)[number];

export const RECOVERY_MODES = ["classroom", "meeting"] as const satisfies readonly RecoveryMode[];
