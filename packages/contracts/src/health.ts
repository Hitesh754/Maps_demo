import { z } from "zod";

export const HealthResponseSchema = z.object({
  status: z.literal("ok"),
  timestamp: z.string()
});

export type HealthResponse = z.infer<typeof HealthResponseSchema>;

export const ReadyChecksSchema = z.object({
  postgres: z.boolean(),
  nats: z.boolean(),
  s3: z.boolean()
});

export type ReadyChecks = z.infer<typeof ReadyChecksSchema>;

export const ReadyResponseSchema = z.object({
  status: z.enum(["ok", "degraded"]),
  timestamp: z.string(),
  checks: ReadyChecksSchema
});

export type ReadyResponse = z.infer<typeof ReadyResponseSchema>;
