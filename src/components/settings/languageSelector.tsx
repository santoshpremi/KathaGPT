import { Select, Option } from "@mui/joy";
import { useTranslation } from "../../lib/i18n";
import type { ComponentProps } from "react";

const locales = {
  de: {
    name: "Deutsch",
    flag: "🇩🇪",
  },
  en: {
    name: "English",
    flag: "🇬🇧",
  },
  es: {
    name: "Español",
    flag: "🇪🇸",
  },
  fr: {
    name: "Français",
    flag: "🇫🇷",
  },
  it: {
    name: "Italiano",
    flag: "🇮🇹",
  },
};

export function LanguageSelector(
  props: ComponentProps<typeof Select> & { filter?: string[] | undefined },
) {
  const { i18n } = useTranslation();

  let localeEntries = Object.entries(locales);
  if (props.filter != undefined) {
    localeEntries = localeEntries.filter(([locale]) =>
      props.filter!.includes(locale),
    );
  }

  return (
    <Select
      id="languageSelector"
      value={i18n.language?.split("-")[0] ?? "en"}
      slotProps={{ listbox: { sx: { width: "100%" } } }}
      {...props}
    >
      {localeEntries.map(([locale, { name, flag }]) => (
        <Option
          key={locale}
          value={locale}
          onClick={() => {
            i18n.changeLanguage(locale).catch(console.error);
          }}
        >
          {flag} {name}
        </Option>
      ))}
    </Select>
  );
}
