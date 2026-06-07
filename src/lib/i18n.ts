import i18next from "i18next";
import LanguageDetector from "i18next-browser-languagedetector";
import { initReactI18next } from "react-i18next";

import en from "../../locales/en.json";

export { useTranslation, Trans } from "react-i18next";

const resources = {
  en: { translation: en },
  // Non-English locales fall back to English until fully translated
  de: { translation: en },
  es: { translation: en },
  fr: { translation: en },
  it: { translation: en },
};

export type Locales = keyof typeof resources;

export function normalizeLanguage(locale: string | undefined): Locales {
  const short = (locale ?? "en").split("-")[0] as Locales;
  return short in resources ? short : "en";
}

export async function loadI18n() {
  await i18next
    .use(initReactI18next)
    .use(LanguageDetector)
    .init({
      fallbackLng: "en" satisfies Locales,
      supportedLngs: Object.keys(resources),
      load: "languageOnly",
      nonExplicitSupportedLngs: true,
      resources: resources,
      pluralSeparator: "_",
      interpolation: {
        escapeValue: false,
      },
    })
    .catch((err) => {
      console.error("Could not load i18n", err);
      throw err;
    });

  i18next.on("languageChanged", (lng) => {
    document.documentElement.lang = lng;
  });
}
