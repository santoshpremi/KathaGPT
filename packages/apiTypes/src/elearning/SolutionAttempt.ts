import * as z from "zod";
import { ApiUser } from "../User";
import { ApiDate } from "../Date";

export const SolutionAttemptEvaluationSchema = z.object({
  challengeEvaluationId: z.string(),
  passed: z.boolean().default(false),
});

export type ApiSolutionAttemptEvaluation = z.infer<
  typeof SolutionAttemptEvaluationSchema
>;

export const ApiSolutionAttemptSchema = z.object({
  id: z.string(),
  createdAt: ApiDate,
  courseId: z.number(),
  exerciseId: z.number(),
  userId: z.string(),
  chat: z.object({
    id: z.string(),
    name: z.string().nullable(),
    createdAt: ApiDate,
    updatedAt: ApiDate,
    archived: z.boolean(),
    modelOverride: z.string().nullable(),
    assistantRoleDescription: z.string().nullable(),
    organizationId: z.string(),
    departmentId: z.string().nullable(),
    customSystemPromptSuffix: z.string().nullable(),
  }),
  lastMessageId: z.string(),
  skipped: z.boolean(),
  user: ApiUser.omit({ isSuperUser: true }).nullable(),
  SolutionAttemptEvaluation: z.array(SolutionAttemptEvaluationSchema),
  solved: z.boolean(),
});

export const CreateApiSolutionAttemptSchema = ApiSolutionAttemptSchema.omit({
  id: true,
  createdAt: true,
  user: true,
  userId: true,
  chat: true,
  lastMessageId: true,
}).extend({
  chatId: z.string(),
});

export type CreateApiSolutionAttempt = z.infer<
  typeof CreateApiSolutionAttemptSchema
>;

export type SolutionAttempt = z.infer<typeof ApiSolutionAttemptSchema>;

export const ApiExtendedSolutionAttemptSchema = ApiSolutionAttemptSchema.extend(
  {
    attemptCount: z.number(),
    exercise: z.any().nullable(),
    SolutionAttemptEvaluation: z.array(
      SolutionAttemptEvaluationSchema.extend({
        challenge: z.any().nullable(),
      }),
    ),
  },
);

export type ApiExtendedSolutionAttempt = z.infer<
  typeof ApiExtendedSolutionAttemptSchema
>;
