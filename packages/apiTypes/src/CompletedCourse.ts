import z from "zod";

export const ApiCompletedCourse = z.object({
  id: z.string(),
  completedDate: z.date(),
  userId: z.string(),
  courseId: z.number(),
  awardedXp: z.number(),
});

export type ApiCompletedCourse = z.infer<typeof ApiCompletedCourse>;

export const ApiCreateCompletedCourse = ApiCompletedCourse.omit({
  id: true,
  completedDate: true,
  userId: true,
  awardedXp: true,
});

export type ApiCreateCompletedCourse = z.infer<typeof ApiCreateCompletedCourse>;

export const ApiXP = z.object({
  xp: z.number(),
});
