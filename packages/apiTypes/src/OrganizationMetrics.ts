// packages/apiTypes/src/OrganizationMetrics.ts
import { z } from "zod";

export const OrganizationMetrics = z.object({
  numPrompts: z.number(),
  totalMinutesSaved: z.number(),
  numWorkflowRuns: z.number()
});

export type OrganizationMetrics = z.infer<typeof OrganizationMetrics>;