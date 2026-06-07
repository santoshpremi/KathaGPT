//  packages/apiTypes/src/Metrics.ts
import { z } from "zod";

export const ApiMetrics = z.object({
  userCount: z.number(),
  activeUserCount: z.number(),
  ACTIVE_TIMESPAN_DAYS: z.number(),
  averagePromptsPerDay: z.number(),
  AVERAGE_TIMESPAN_DAYS: z.number(),
  topWorkflowsWithCount: z.array(
    z.object({
      name: z.string(),
      count: z.number(),
      departmentName: z.string(),
    }),
  ),
  averageWorkflowUsagesPerDay: z.number(),
  totalMinutesSaved: z.number(),
  totalMinutesSavedByUser: z.record(z.number()),
  usersWithMostPrompts: z.array(
    z.object({
      id: z.string(),
      firstName: z.string().nullable(),
      lastName: z.string().nullable(),
      primaryEmail: z.string().nullable(),
      messageCount: z.number(),
    }),
  ),
  lifetimePrompts: z.number(),
  adoptionChartMetrics: z.array(
    z.object({
      date: z.string(),
      "Active user count": z.number(),
      "Minutes saved": z.number(),
    }),
  ),
});

export type ApiMetrics = z.infer<typeof ApiMetrics>;
