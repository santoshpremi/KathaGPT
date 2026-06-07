import { z } from "zod";

export const EnabledServices = z.object({
  textModels: z.array(z.string()),
  documentIntelligence: z.boolean(),
  academy: z.boolean(),
  creditSystem: z.boolean(),
  entraId: z.boolean(),
  techSupport: z.boolean(),
  meetingSummarizer: z.boolean(),
  translateText: z.boolean(),
});

export type EnabledServices = z.infer<typeof EnabledServices>;
