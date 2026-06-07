import { z } from "zod";
import { ApiDate } from "./Date";

export const ApiDocumentHeader = z.object({
  id: z.string(),
  fileName: z.string(),
  uploadedById: z.string(),
  fileType: z.string(),
  originalSize: z.number(),
  contentLength: z.number(),
  createdAt: ApiDate,
  tokens: z.number(),
});

export type ApiDocumentHeader = z.infer<typeof ApiDocumentHeader>;
