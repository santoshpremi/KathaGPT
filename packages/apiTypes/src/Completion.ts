import { z } from "zod";

export const CompletionRequest = z.object({
  messages: z.array(
    z.object({
      content: z.string(),
      role: z.enum(["user", "assistant", "system"]),
    }),
  ),
  systemPrompt: z.optional(
    z.object({
      language: z.string(),
    }),
  ),
  response: z.enum(["json_object", "text"]).default("text").optional(),
});

export type CompletionRequest = z.infer<typeof CompletionRequest>;

export const CompletionResponse = z.object({
  message: z.string(),
});

export type CompletionResponse = z.infer<typeof CompletionResponse>;
