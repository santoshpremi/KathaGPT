import { z } from "zod";
import { ApiDate } from "../Date";
import { ApiSolutionAttemptSchema } from "./SolutionAttempt";

const ApiChallengeEvaluationSchema = z.object({
  id: z.number(),
  title: z.string(),
  prompt: z.string(),
  evaluation_context: z.object({
    message_type: z.string(),
    context_window: z.number(),
  }),
  updatedAt: z.string(),
  createdAt: z.string(),
});

const ApiExerciseSchema = z.object({
  id: z.number(),
  title: z.string(),
  description: z.string().nullable(),
  exerciseDescription: z.array(z.record(z.unknown())),
  enablePromptingAssistant: z.enum(["no", "yes"]).nullable(),
  updatedAt: ApiDate,
  createdAt: ApiDate,
  challengeEvaluations: z.array(ApiChallengeEvaluationSchema),
  enableFileUpload: z.enum(["no", "yes"]).nullable(),
});

export type ApiExercise = z.infer<typeof ApiExerciseSchema>;

export const ApiExerciseWithSolutionAttemptsSchema = ApiExerciseSchema.extend({
  solutionAttempts: z.array(
    ApiSolutionAttemptSchema.extend({
      SolutionAttemptEvaluation: z.array(
        z.object({
          challengeEvaluationId: z.string(),
          passed: z.boolean(),
          title: z.string(),
          prompt: z.string(),
        }),
      ),
    }),
  ),
});

export type ApiExerciseWithSolutionAttempts = z.infer<
  typeof ApiExerciseWithSolutionAttemptsSchema
>;
