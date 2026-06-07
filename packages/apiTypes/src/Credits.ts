import { z } from "zod";

export const ApiCreditTransaction = z.object({
  type: z.string(),
  id: z.string(),
  creditAmount: z.number(),
  date: z.string(),
  organizationId: z.string(),
  userId: z.string().nullable(),
  inputTokens: z.number().nullable(),
  outputTokens: z.number().nullable(),
  inputCost: z.number().nullable(),
  outputCost: z.number().nullable(),
  generationModel: z.string().nullable(),
  comment: z.string().nullable(),
});

export const ApiCreditUsage = z.object({
  balance: z.number(),
});

export const ApiCreditTransactionTable = z.object({
  rows: ApiCreditTransaction.array(),
  pageCount: z.number(),
});

export type ApiCreditUsage = z.infer<typeof ApiCreditUsage>;
export type ApiCreditTransaction = z.infer<typeof ApiCreditTransaction>;
export type ApiCreditTransactionTable = z.infer<
  typeof ApiCreditTransactionTable
>;
