type MimeMap = Record<string, string[]>;

export const MIME_TYPE_TO_EXTENSIONS_MAP: MimeMap = {
  "application/pdf": [".pdf"],
  "application/msword": [".docx"],
  "application/msexcel": [".xlsx"],
  "application/mspowerpoint": [".pptx"],
  "text/plain": [".txt"],
  "text/csv": [".csv"],
  "text/vtt": [".vtt"],
  "image/jpeg": [".jpeg", ".jpg"],
  "image/png": [".png"],
  "image/bmp": [".bmp"],
  "image/tiff": [".tiff"],
  "image/heif": [".heif"],
};

export const CODE_MIME_TYPE_TO_EXTENSIONS_MAP: MimeMap = {
  "text/x-python": [".py"],
  "text/javascript": [".js"],
  "text/typescript": [".ts"],
  "text/x-java": [".java"],
  "text/x-c": [".c"],
  "text/x-c++": [".cpp"],
  "text/x-h": [".h"],
  "text/x-h++": [".hpp"],
  "text/plain": [".txt"],
  "text/html": [".html", ".htm"],
  "text/css": [".css"],
  "text/x-sql": [".sql"],
  "text/x-shellscript": [".sh", ".bash"],
  "text/x-csharp": [".cs"],
  "text/x-php": [".php"],
};

export const DOCUMENT_MIME_TYPE_TO_EXTENSIONS_MAP: MimeMap = {
  "application/msword": [".docx", ".doc"],
  "application/mspowerpoint": [".pptx", ".ppt"],
  "application/msexcel": [".xlsx", ".xls"],
  "application/pdf": [".pdf"],
  "text/html": [".htm", ".html"],
  "text/plain": [".txt"],
  "application/x-subrip": [".srt"],
};
export const DOCUMENT_EXTENSION_TO_MIME_MAP = {
  docx: "application/vnd.openxmlformats-officedocument.wordprocessingml.document",
  doc: "application/msword",
  pptx: "application/vnd.openxmlformats-officedocument.presentationml.presentation",
  ppt: "application/vnd.ms-powerpoint",
  xlsx: "application/vnd.openxmlformats-officedocument.spreadsheetml.sheet",
  xls: "application/vnd.ms-excel",
  csv: "text/csv",
  pdf: "application/pdf",
  html: "text/html",
  htm: "text/html",
  srt: "application/x-subrip",
};

export const AUDIO_MIME_TYPE_TO_EXTENSIONS_MAP: MimeMap = {
  "audio/aac": [".aac"],
  "audio/ac3": [".ac3"],
  "audio/eac3": [".eac3"],
  "audio/flac": [".flac"],
  "audio/mp4": [".m4a"],
  "audio/mpeg": [".mp2", ".mp3"],
  "application/ogg": [".ogg"],
  "audio/opus": [".opus"],
  "audio/wav": [".wav"],
};

export const VIDEO_MIME_TYPE_TO_EXTENSIONS_MAP: MimeMap = {
  "video/mp4": [".mp4"],
  "video/quicktime": [".mov"],
  "video/x-msvideo": [".avi"],
  "video/webm": [".webm"],
};

export function getMimeListFromMap(map: MimeMap) {
  return Array.from(
    new Set([...Object.keys(map), ...Object.values(map).flat()]),
  );
}

export function getExtensionsFromMimeMap(map: MimeMap) {
  return Object.values(map).flat();
}

export function getExtensionFromMimeType(
  mimeType: string,
  map: MimeMap = VIDEO_MIME_TYPE_TO_EXTENSIONS_MAP,
): string | null {
  const extensions = map[mimeType as keyof typeof map];
  return extensions?.[0] ?? null;
}

export function isMimeTypeIn(
  mimeType: string | undefined | null,
  map: MimeMap,
): boolean {
  return Object.keys(map).includes(mimeType ?? "");
}

export function isVideoMimeType(mimeType: string | undefined | null): boolean {
  return isMimeTypeIn(mimeType, VIDEO_MIME_TYPE_TO_EXTENSIONS_MAP);
}

export function isAudioMimeType(mimeType: string | undefined | null): boolean {
  return isMimeTypeIn(mimeType, AUDIO_MIME_TYPE_TO_EXTENSIONS_MAP);
}

function getMimeListFromMaps(maps: MimeMap[]) {
  return maps.map(getMimeListFromMap).join(", ");
}

export function mergeMimeMaps(maps: MimeMap[]) {
  return maps.reduce((acc, map) => ({ ...acc, ...map }), {});
}

export const allowedMimeTypesForAdiDocuments = getMimeListFromMaps([
  MIME_TYPE_TO_EXTENSIONS_MAP,
  CODE_MIME_TYPE_TO_EXTENSIONS_MAP,
]);

export const allowedMimeTypesForSupportManuals = getMimeListFromMaps([
  DOCUMENT_MIME_TYPE_TO_EXTENSIONS_MAP,
  CODE_MIME_TYPE_TO_EXTENSIONS_MAP,
]);

// Adding a new output format here will automatically add it to the Workflow DocumentOutput UI
export const DOCUMENT_OUTPUT_TYPE_TO_MIME_MAP = {
  document: ["docx", "pdf", "txt"] as string[],
  table: ["xlsx", "csv"] as string[],
  presentation: ["pptx"] as string[],
} as const;

export type DocumentOutputDataType = "document" | "table" | "presentation";

export const getDocumentOutputTypeFromMime = (mimeType: string) =>
  Object.keys(DOCUMENT_OUTPUT_TYPE_TO_MIME_MAP).find((type) =>
    DOCUMENT_OUTPUT_TYPE_TO_MIME_MAP[type as DocumentOutputDataType].includes(mimeType),
  ) as DocumentOutputDataType;
