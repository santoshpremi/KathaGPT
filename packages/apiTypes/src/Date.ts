// packages/apiTypes/src/Date.ts
import { z } from "zod";

export const ApiDate = z.union([z.string(), z.date()]).transform((val) => {
  if (typeof val !== "string") return val.toISOString();
  return val;
});

export type ApiDate = z.infer<typeof ApiDate>;