import { z } from "zod";
import { ApiDate } from "../Date";

export const ApiWorkshop = z.object({
  id: z.string(),
  name: z.string(),
  status: z.enum(["PENDING", "ACTIVE", "COMPLETED"]),
  courses: z.array(z.string()),
  currentTask: z.string().nullable(),
  currentTaskTimer: ApiDate.nullable(),
  participantCount: z.number().nullable(),
  loginCode: z.string().nullable(),
  organizationId: z.string(),
});

export type ApiWorkshop = z.infer<typeof ApiWorkshop>;

export const ApiWorkshopParticipantStats = z.object({
  userId: z.string(),
  name: z.string().nullable(),
  lastName: z.string().nullable(),
  mail: z.string(),
  courseId: z.string().nullable(),
  courseTitle: z.string().nullable(),
  exerciseId: z.string().nullable(),
  exerciseTitle: z.string().nullable(),
  solved: z.boolean().nullable(),
  lastEvaluation: z.array(
    z.object({
      passed: z.boolean(),
      taskTitle: z.string(),
    }),
  ),
  attemptCount: z.number(),
  courseProgress: z.number(),
});

export type ApiWorkshopParticipantStats = z.infer<
  typeof ApiWorkshopParticipantStats
>;

export const ApiCreateWorkshop = ApiWorkshop.omit({
  id: true,
  currentTask: true,
  currentTaskTimer: true,
  participantCount: true,
});

export type ApiCreateWorkshop = z.infer<typeof ApiCreateWorkshop>;

export const WorkshopUserProfile = z.object({
  knowledgeLevel: z.string().optional(),
  department: z.string().optional(),
});

export type WorkshopUserProfile = z.infer<typeof WorkshopUserProfile>;
