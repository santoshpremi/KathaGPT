import z from "zod";

export const WorkshopAnalyticsEventEnum = z.enum([
  "COURSE_STARTED",
  "COURSE_ABANDONED",
  "EXERCISE_STARTED",
  "SOLUTION_ATTEMPT_SUBMITTED",
  "EXERCISE_SOLVED",
  "EXERCISE_SKIPPED",
  "HELP_REQUESTED",
  "HELP_REQUEST_RESOLVED",
]);

export const WorkshopAnalyticsEvent = z.object({
  id: z.string(),
  timestamp: z.date(),
  workshopEventId: z.string().nullable(),
  eventType: WorkshopAnalyticsEventEnum,
  courseId: z.number().nullable(),
  exerciseId: z.number().nullable(),
  userId: z.string(),
});

export type WorkshopAnalyticsEvent = z.infer<typeof WorkshopAnalyticsEvent>;

export const CreateApiWorkshopAnalyticsEvent = WorkshopAnalyticsEvent.omit({
  id: true,
  timestamp: true,
  userId: true,
});

export type CreateApiWorkshopAnalyticsEvent = z.infer<
  typeof CreateApiWorkshopAnalyticsEvent
>;
