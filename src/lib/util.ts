import { useTranslation } from "./i18n";

export function maxStringLength<T extends string | undefined>(
  input: T,
  length: number,
): T {
  if (!input) return input;
  if (input.length > length) {
    return (input.substring(0, length) + "...") as T;
  }
  return input;
}

export function useRelativeTime(time: Date) {
  const { t } = useTranslation();
  // if its today, return the relative time (e.g. vor 2 Stunden, gerade eben)
  // if its yesterday, return gestern
  // if its less than a week ago, return the weekday (e.g. Montag, Dienstag)
  // if its more than a week ago, return the weeks ago (e.g. vor 2 Wochen, vor 3 Wochen)

  const now = new Date();
  const diff = now.getTime() - time.getTime();

  const seconds = Math.floor(diff / 1000);
  const minutes = Math.floor(seconds / 60);
  const hours = Math.floor(minutes / 60);
  const days = Math.floor(hours / 24);

  if (days === 0) {
    if (hours === 0) {
      if (minutes === 0) {
        return t("justNow");
      }
      return t("minutesAgo", { minutes });
    }
    return t("hoursAgo", { hours });
  }

  if (days === 1) {
    return t("yesterday");
  }

  if (days < 7) {
    return t("daysAgo", { days });
  }

  const weeks = Math.floor(days / 7);

  return t("weeksAgo", { count: weeks });
}

export function readableFileSize(bytes: number) {
  if (bytes === 0) return "0 B";
  const i = Math.floor(Math.log(bytes) / Math.log(1024));
  return (
    (bytes / Math.pow(1024, i)).toFixed(0) +
    " " +
    ["B", "kB", "MB", "GB", "TB"][i]
  );
}

/**
 * DeepL API supports only en-us, en-gb, pt-br, pt-pt for en and pt as target languages
 */
export function sourceToTargetLanguage(lang: string) {
  switch (lang) {
    case "en":
    case "detect":
      return "en-GB";
    case "pt":
      return "pt-PT";
    default:
      return lang;
  }
}

/**
 * DeepL API supports only en and pt for en-US, en-GB, pt-BR, pt-PT as source languages
 */
export function targetToSourceLanguage(lang: string) {
  switch (lang) {
    case "en-US":
    case "en-GB":
      return "en";
    case "pt-BR":
    case "pt-PT":
      return "pt";
    default:
      return lang;
  }
}

export function downloadBlob(blob: Blob, fileName: string) {
  const url = window.URL.createObjectURL(blob);
  const link = document.createElement("a");
  link.href = url;
  link.download = fileName;

  document.body.appendChild(link);
  link.click();

  document.body.removeChild(link);
  window.URL.revokeObjectURL(url);
}

export function fileToBase64(file: File): Promise<string> {
  return new Promise((resolve, reject) => {
    const reader = new FileReader();
    reader.onerror = () => reject(new Error("File conversion failed"));
    reader.onload = () => resolve(reader.result as string);
    reader.readAsDataURL(file);
  });
}

export function base64ToBlob(content: number[], type: string) {
  const byteArray = new Uint8Array(content);
  return new Blob([byteArray], { type });
}

export function splitByExtension(name: string) {
  const dotIndex = name.lastIndexOf(".");
  const fileName = name.substring(0, dotIndex);
  const extension = name.substring(dotIndex + 1);
  return [fileName, extension];
}

export function getMonthName(
  monthNumber: number,
  locale: string = "default",
): string {
  const date = new Date();
  date.setMonth(monthNumber);
  return new Intl.DateTimeFormat(locale, { month: "long" }).format(date);
}

export function getUrlDomain(url: string) {
  try {
    const domain = new URL(url).hostname;
    return domain;
  } catch (error) {
    return url;
  }
}

export function isValidURL(url: string) {
  try {
    new URL(url);
    return true;
  } catch (_) {
    return false;
  }
}

export default function getCurrentTimezone() {
  return Intl.DateTimeFormat().resolvedOptions().timeZone;
}
