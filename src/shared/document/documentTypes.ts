import z from "zod";
import { DOCUMENT_OUTPUT_TYPE_TO_MIME_MAP } from "../constants/mime";

export const PandocOutputFormat = z.enum(["docx", "txt", "pdf", "pptx"]);
export type PandocOutputFormat = z.infer<typeof PandocOutputFormat>;

// A superset of PandocOutputFormat
// Additional formats are handled by DocumentGenerationService
export const TableOutputFormat = z.enum(
  DOCUMENT_OUTPUT_TYPE_TO_MIME_MAP["table"] as [string, ...string[]]
);

export const DocumentOutputFormat = z.enum([
  ...DOCUMENT_OUTPUT_TYPE_TO_MIME_MAP["document"],
  ...DOCUMENT_OUTPUT_TYPE_TO_MIME_MAP["table"],
  ...DOCUMENT_OUTPUT_TYPE_TO_MIME_MAP["presentation"]
] as [string, ...string[]]);

export type TableOutputFormat = z.infer<typeof TableOutputFormat>;
export type DocumentOutputFormat = z.infer<typeof DocumentOutputFormat>;
