import { rustFetch } from "../api/rust/client";

const SUPPORTED_PATTERN = /\.(txt|md|csv|pdf)$/i;

async function fileToBase64(file: File): Promise<string> {
  const buffer = await file.arrayBuffer();
  const bytes = new Uint8Array(buffer);
  let binary = "";
  for (let i = 0; i < bytes.length; i++) {
    binary += String.fromCharCode(bytes[i]);
  }
  return btoa(binary);
}

export function isSupportedTranslationFile(filename: string): boolean {
  return SUPPORTED_PATTERN.test(filename);
}

export async function readTranslationFile(file: File): Promise<string> {
  if (!isSupportedTranslationFile(file.name)) {
    throw new Error("unsupported");
  }

  if (/\.pdf$/i.test(file.name)) {
    const data = await fileToBase64(file);
    const result = await rustFetch<{ text: string }>("/files/extract-text", {
      method: "POST",
      body: JSON.stringify({ filename: file.name, data }),
    });
    return result.text;
  }

  return file.text();
}
