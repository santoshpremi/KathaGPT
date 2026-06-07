export const TRANSLATE_LANGUAGES = [
  { code: "auto", labelKey: "translator.detectLanguage" },
  { code: "en", labelKey: "translator.languages.en" },
  { code: "de", labelKey: "translator.languages.de" },
  { code: "es", labelKey: "translator.languages.es" },
  { code: "fr", labelKey: "translator.languages.fr" },
  { code: "it", labelKey: "translator.languages.it" },
  { code: "pt", labelKey: "translator.languages.pt" },
  { code: "nl", labelKey: "translator.languages.nl" },
  { code: "pl", labelKey: "translator.languages.pl" },
  { code: "ru", labelKey: "translator.languages.ru" },
  { code: "zh", labelKey: "translator.languages.zh" },
  { code: "ja", labelKey: "translator.languages.ja" },
  { code: "ko", labelKey: "translator.languages.ko" },
  { code: "ar", labelKey: "translator.languages.ar" },
  { code: "hi", labelKey: "translator.languages.hi" },
  { code: "ne", labelKey: "translator.languages.ne" },
] as const;

export const TARGET_LANGUAGES = TRANSLATE_LANGUAGES.filter((l) => l.code !== "auto");
