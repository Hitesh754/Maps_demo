import { z } from "zod";

export const InvalidParamSchema = z.object({
  name: z.string(),
  reason: z.string()
});

export type InvalidParam = z.infer<typeof InvalidParamSchema>;

/**
 * RFC 9457 Problem Details object
 */
export const ProblemDetailsSchema = z.object({
  type: z.string().url().or(z.literal("about:blank")),
  title: z.string(),
  status: z.number().int().min(100).max(599),
  detail: z.string().optional(),
  instance: z.string().optional(),
  code: z.string().optional(),
  invalid_params: z.array(InvalidParamSchema).optional()
});

export type ProblemDetails = z.infer<typeof ProblemDetailsSchema>;
