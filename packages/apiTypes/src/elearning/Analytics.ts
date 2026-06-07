import { z } from "zod";

export const CourseStatistics = z.object({
  attempts: z.number(),
  abandons: z.number(),
  helps: z.number(),
});

export type CourseStatistics = z.infer<typeof CourseStatistics>;

export const CourseFunnelStatistics = z.array(
  z.object({
    name: z.string(),
    value: z.number(),
  }),
);

export type CourseFunnelStatistics = z.infer<typeof CourseFunnelStatistics>;

export const ExerciseStatistics = z.object({
  startCount: z.number(),
  skipCount: z.number(),
  solvedCount: z.number(),
  abandonCount: z.number(),
  helpRequests: z.number(),
  solutionAttempts: z.number(),
  averageTimeToSolve: z.number(),
});

export type ExerciseStatistics = z.infer<typeof ExerciseStatistics>;
